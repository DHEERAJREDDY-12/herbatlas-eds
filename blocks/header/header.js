import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 1001px)');
let herbsPromise;

function getCartItems() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    return [];
  }
}

function updateCartBadge() {
  const total = getCartItems().reduce((sum, item) => (
    sum + (Number(item.qty) || Number(item.quantity) || 0)
  ), 0);

  document.querySelectorAll('#cartBadge, .cart-badge').forEach((badge) => {
    badge.textContent = total;
  });
}

function logout() {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('cart');
  updateCartBadge();
  window.location.href = '/';
}

function updateFooterAuthLinks() {
  const loggedIn = localStorage.getItem('loggedIn') === 'true';

  document.querySelectorAll('.footer-auth-guest').forEach((link) => {
    link.hidden = loggedIn;
  });

  document.querySelectorAll('.footer-auth-user, .footer-logout-btn').forEach((link) => {
    link.hidden = !loggedIn;
  });
}

function updateNavUser(nav) {
  const userLink = nav.querySelector('#navUser');
  if (!userLink) return;

  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  const name = localStorage.getItem('userName') || '';

  if (loggedIn) {
    userLink.href = '/profile';
    userLink.className = 'nav-user nav-user-active';
    userLink.innerHTML = `
      <span class="nav-user-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M12 12a4.25 4.25 0 1 0-4.25-4.25A4.25 4.25 0 0 0 12 12Zm0 2c-3.27 0-5.93 1.78-6.81 4.55a1 1 0 0 0 .96 1.3h11.7a1 1 0 0 0 .96-1.3C17.93 15.78 15.27 14 12 14Z"></path>
        </svg>
      </span>
      <span class="nav-user-label">${name || 'Account'}</span>
    `;
    return;
  }

  userLink.href = '/login';
  userLink.className = 'nav-user';
  userLink.textContent = 'Sign In';
}

function updateAuthState(nav) {
  updateNavUser(nav);
  updateFooterAuthLinks();
}

function pathBase(pathname) {
  const clean = pathname.replace(/\/$/, '') || '/';
  return clean.replace(/\.html$/, '');
}

function defaultHref(label) {
  const key = label.toLowerCase();
  const known = {
    herbatlas: '/',
    home: '/',
    browse: '/browse',
    ailments: '/ailments',
    shop: '/shop',
    'about us': '/about',
  };

  return known[key] || `/${key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function isUrlText(text) {
  return /^\/($|[a-z0-9-/?#=&%.]+$)/i.test(text.trim());
}

function linkFromCell(cell, fallbackText = '') {
  const anchor = cell?.querySelector('a');
  if (anchor) {
    return {
      text: anchor.textContent.trim(),
      href: anchor.getAttribute('href') || defaultHref(anchor.textContent.trim()),
    };
  }

  const text = (cell?.textContent || fallbackText).trim();
  return text ? { text, href: defaultHref(text) } : null;
}

function getSimpleNavItems(nav) {
  const tableRows = [...nav.querySelectorAll('table tr')];
  const tableItems = tableRows
    .map((row) => {
      const cells = [...row.children];
      const text = cells[0]?.textContent.trim() || '';
      if (!text || text.toLowerCase() === 'text') return null;

      const item = linkFromCell(cells[0]);
      if (!item) return null;

      const hrefCell = cells[1];
      const href = hrefCell?.querySelector('a')?.getAttribute('href') || hrefCell?.textContent.trim();
      return { ...item, href: href || item.href };
    })
    .filter(Boolean);

  if (tableItems.length > 1) return tableItems;

  const rawItems = [...nav.querySelectorAll('p, li')]
    .map((element) => element.textContent.trim())
    .filter(Boolean)
    .filter((text) => text.toLowerCase() !== 'text' && text.toLowerCase() !== 'link');

  const items = [];
  for (let i = 0; i < rawItems.length; i += 1) {
    const text = rawItems[i];
    const next = rawItems[i + 1] || '';

    if (!isUrlText(text) && isUrlText(next)) {
      items.push({ text, href: next });
      i += 1;
    } else if (!isUrlText(text)) {
      items.push({ text, href: defaultHref(text) });
    }
  }

  return items;
}

function normalizeSimpleNav(nav) {
  if (nav.children.length > 1) return;

  const items = getSimpleNavItems(nav);
  if (items.length < 2) return;

  const [brandItem, ...navItems] = items;
  const navBrand = document.createElement('div');
  navBrand.className = 'nav-brand';
  navBrand.innerHTML = `<a href="${brandItem.href}" class="nav-logo">${brandItem.text}</a>`;

  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  const wrapper = document.createElement('div');
  wrapper.className = 'default-content-wrapper';
  const list = document.createElement('ul');

  navItems.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${item.href}">${item.text}</a>`;
    list.append(li);
  });

  wrapper.append(list);
  navSections.append(wrapper);
  nav.textContent = '';
  nav.append(navBrand, navSections);
}

function setActiveNavLink(nav) {
  const current = pathBase(window.location.pathname);
  nav.querySelectorAll('.nav-sections a').forEach((link) => {
    const url = new URL(link.href, window.location.href);
    const target = pathBase(url.pathname);
    link.classList.toggle('active', target === current || (current === '/' && target === '/index'));
  });
}

function ensureBrand(nav) {
  const navBrand = nav.querySelector('.nav-brand');
  if (!navBrand) return;

  const brandLink = navBrand.querySelector('a') || document.createElement('a');
  brandLink.href = '/';
  brandLink.className = 'nav-logo';
  brandLink.innerHTML = 'Herb<em>Atlas</em>';
  navBrand.textContent = '';
  navBrand.append(brandLink);
}

function createTools(nav) {
  let tools = nav.querySelector('.nav-tools');
  if (!tools) {
    tools = document.createElement('div');
    tools.className = 'nav-tools';
    nav.append(tools);
  }

  tools.classList.add('nav-right');
  tools.innerHTML = `
    <input type="text" class="nav-search" placeholder="Search herbs..." aria-label="Search herbs">
    <a href="/cart" class="nav-cart">Cart <span class="cart-badge" id="cartBadge">0</span></a>
    <a href="/login" class="nav-user" id="navUser">Sign In</a>
  `;

  return tools;
}

function closeMenu(nav) {
  const button = nav.querySelector('.nav-hamburger button');
  const navSections = nav.querySelector('.nav-sections');
  const backdrop = document.querySelector('.nav-backdrop');
  nav.setAttribute('aria-expanded', 'false');
  button?.setAttribute('aria-label', 'Open menu');
  navSections?.classList.remove('open');
  backdrop?.classList.remove('visible');
  document.body.classList.remove('nav-open');
}

function updateMobileDrawerAuth(nav) {
  const navSections = nav.querySelector('.nav-sections .default-content-wrapper > ul');
  if (!navSections) return;

  navSections.querySelectorAll('.drawer-divider, .drawer-greeting, .drawer-auth-item').forEach((item) => {
    item.remove();
  });

  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  const name = localStorage.getItem('userName') || '';
  const divider = document.createElement('li');
  divider.className = 'drawer-divider';
  divider.setAttribute('aria-hidden', 'true');
  navSections.append(divider);

  if (loggedIn) {
    const greeting = document.createElement('li');
    greeting.className = 'drawer-greeting';
    greeting.textContent = name ? `Hi, ${name}` : 'My Account';
    navSections.append(greeting);

    [
      ['My Account', '/profile'],
      ['My Orders', '/orders'],
      ['My Addresses', '/addresses'],
      ['Personal Herb Profile', '/account'],
      ['Contact Us', '/contact'],
      ['Cart', '/cart'],
    ].forEach(([text, href]) => {
      const item = document.createElement('li');
      item.className = 'drawer-auth-item';
      item.innerHTML = `<a href="${href}">${text}</a>`;
      navSections.append(item);
    });

    const signOut = document.createElement('li');
    signOut.className = 'drawer-auth-item';
    const button = document.createElement('button');
    button.className = 'drawer-signout-btn';
    button.type = 'button';
    button.textContent = 'Sign Out';
    button.addEventListener('click', logout);
    signOut.append(button);
    navSections.append(signOut);
    return;
  }

  const signIn = document.createElement('li');
  signIn.className = 'drawer-auth-item';
  signIn.innerHTML = '<a href="/login" class="drawer-signin-link">Sign In</a>';
  navSections.append(signIn);
}

function toggleMenu(nav) {
  const isOpen = nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  const nextOpen = !isOpen;

  nav.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
  button?.setAttribute('aria-label', nextOpen ? 'Close menu' : 'Open menu');
  document.querySelector('.nav-backdrop')?.classList.toggle('visible', nextOpen);
  document.body.classList.toggle('nav-open', nextOpen);

  if (nextOpen) {
    updateMobileDrawerAuth(nav);
  }
}

function bindMobileMenu(nav) {
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  backdrop.addEventListener('click', () => closeMenu(nav));
  document.body.append(backdrop);

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `
    <button type="button" aria-controls="nav" aria-label="Open menu">
      <span class="nav-hamburger-icon"></span>
    </button>
  `;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  nav.querySelector('.nav-sections')?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu(nav);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu(nav);
  });

  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches) closeMenu(nav);
  });
}

async function loadHerbs() {
  if (!herbsPromise) {
    herbsPromise = fetch('/data/herbs.json')
      .then((response) => (response.ok ? response.json() : []))
      .catch(() => []);
  }
  return herbsPromise;
}

function positionSuggestions(input, suggestions) {
  const rect = input.getBoundingClientRect();
  const mobile = window.innerWidth <= 1000;
  const side = 16;

  suggestions.style.top = `${rect.bottom + 6}px`;
  suggestions.style.left = mobile ? `${side}px` : `${rect.left}px`;
  suggestions.style.width = mobile ? `${window.innerWidth - (side * 2)}px` : `${Math.max(rect.width, 220)}px`;
}

function hideSuggestions(suggestions) {
  suggestions.classList.remove('visible');
  suggestions.textContent = '';
}

async function renderSuggestions(input, suggestions) {
  const query = input.value.trim().toLowerCase();
  if (!query) {
    hideSuggestions(suggestions);
    return;
  }

  const herbs = await loadHerbs();
  const matches = herbs
    .filter((herb) => (
      herb.name?.toLowerCase().includes(query)
      || herb.scientific?.toLowerCase().includes(query)
    ))
    .slice(0, 6);

  if (!matches.length) {
    hideSuggestions(suggestions);
    return;
  }

  positionSuggestions(input, suggestions);
  suggestions.innerHTML = matches.map((herb) => `
    <button type="button" class="herb-sug-item" data-herb-id="${herb.id}">
      <img src="${herb.image}" alt="${herb.name}" loading="lazy">
      <span class="sug-name">${herb.name}</span>
    </button>
  `).join('');
  suggestions.classList.add('visible');
}

function bindSearch(nav) {
  const mobileSearchBar = document.createElement('div');
  mobileSearchBar.className = 'mobile-search-bar';
  mobileSearchBar.innerHTML = '<input type="text" id="mobileSearchInput" placeholder="Search herbs..." aria-label="Search herbs">';
  nav.closest('.nav-wrapper').append(mobileSearchBar);

  const suggestions = document.createElement('div');
  suggestions.className = 'herb-suggestions';
  document.body.append(suggestions);

  const inputs = [
    nav.querySelector('.nav-search'),
    mobileSearchBar.querySelector('input'),
  ].filter(Boolean);

  function submitSearch(input) {
    const value = input.value.trim();
    if (!value) return;
    hideSuggestions(suggestions);
    window.location.href = `/browse?search=${encodeURIComponent(value)}`;
  }

  inputs.forEach((input) => {
    input.addEventListener('input', () => renderSuggestions(input, suggestions));
    input.addEventListener('focus', () => renderSuggestions(input, suggestions));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitSearch(input);
      }
      if (event.key === 'Escape') hideSuggestions(suggestions);
    });
  });

  suggestions.addEventListener('click', (event) => {
    const item = event.target.closest('.herb-sug-item');
    if (!item) return;
    hideSuggestions(suggestions);
    window.location.href = `/herb-detail?id=${encodeURIComponent(item.dataset.herbId)}`;
  });

  document.addEventListener('click', (event) => {
    const clickedSearch = inputs.some((input) => input.contains(event.target));
    if (!clickedSearch && !suggestions.contains(event.target)) hideSuggestions(suggestions);
  });

  window.addEventListener('resize', () => hideSuggestions(suggestions));
}

function decorateNavSections(nav) {
  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;

  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((section) => {
    if (section.querySelector('ul')) section.classList.add('nav-drop');
  });
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  normalizeSimpleNav(nav);

  ['brand', 'sections', 'tools'].forEach((className, index) => {
    const section = nav.children[index];
    if (section) section.classList.add(`nav-${className}`);
  });

  ensureBrand(nav);
  createTools(nav);
  decorateNavSections(nav);
  bindMobileMenu(nav);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  bindSearch(nav);
  setActiveNavLink(nav);
  updateCartBadge();
  updateAuthState(nav);

  window.updateCartBadge = updateCartBadge;
  window.herbAtlasLogout = logout;
  window.addEventListener('storage', () => {
    updateCartBadge();
    updateAuthState(nav);
  });
}
