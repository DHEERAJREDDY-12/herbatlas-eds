import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const SECTION_TITLES = ['Explore', 'Shop', 'Account', 'Social'];
const SPECIAL_SECTIONS = ['Brand', 'Bottom'];

function logout() {
  if (window.herbAtlasLogout) {
    window.herbAtlasLogout();
    return;
  }

  localStorage.removeItem('loggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('cart');
  window.location.href = '/';
}

function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function fallbackHref(text) {
  const routes = {
    Home: '/',
    Browse: '/browse',
    Ailments: '/ailments',
    'About Us': '/about',
    'All Products': '/shop',
    Cart: '/cart',
    'My Account': '/profile',
    Login: '/login',
    'Sign Up': '/login?tab=register',
    'Contact Us': '/contact',
    Instagram: 'https://www.instagram.com/_herbatlas?igsh=OXhicWx4bmowZzlx',
    Facebook: 'https://www.facebook.com/share/1BPQ3Z8bna/',
    Twitter: 'https://x.com/_dheeraj__reddy',
  };

  return routes[text] || '#';
}

function emptyFooterModel() {
  return {
    brand: 'HerbAtlas',
    description: '',
    disclaimer: '',
    sections: SECTION_TITLES.map((title) => ({ title, links: [] })),
    bottom: ['2026 HerbAtlas', 'Always consult a healthcare professional.'],
  };
}

function getCellLink(cell, text) {
  const anchor = cell?.querySelector('a');
  return anchor?.getAttribute('href') || cleanText(cell?.textContent || '') || fallbackHref(text);
}

function isKnownSection(text) {
  return [...SECTION_TITLES, ...SPECIAL_SECTIONS]
    .some((section) => section.toLowerCase() === text.toLowerCase());
}

function isLinkText(text) {
  return /^(https?:\/\/|\/)/.test(text);
}

function applyFooterRow(parsed, sectionName, text, link = '') {
  const sectionKey = sectionName.toLowerCase();
  const column = parsed.sections.find((section) => section.title.toLowerCase() === sectionKey);
  if (column) {
    column.links.push({ text, href: link || fallbackHref(text) });
  }
}

function parseFooterTable(footer) {
  const table = footer.querySelector('table');
  if (!table) return null;

  const parsed = emptyFooterModel();
  const sectionMap = new Map(parsed.sections.map((section) => [
    section.title.toLowerCase(),
    section,
  ]));
  const brandRows = [];
  const bottomRows = [];

  [...table.querySelectorAll('tr')].forEach((row) => {
    const cells = [...row.children];
    const section = cleanText(cells[0]?.textContent || '');
    const text = cleanText(cells[1]?.textContent || '');
    const link = getCellLink(cells[2], text);

    if (!section || !text || section.toLowerCase() === 'section') return;

    if (section.toLowerCase() === 'brand') {
      brandRows.push(text);
      return;
    }

    if (section.toLowerCase() === 'bottom') {
      bottomRows.push(text);
      return;
    }

    const column = sectionMap.get(section.toLowerCase());
    if (column) {
      column.links.push({ text, href: link });
    }
  });

  const [brand, description, disclaimer] = brandRows;
  if (brand) parsed.brand = brand;
  if (description) parsed.description = description;
  if (disclaimer) parsed.disclaimer = disclaimer;
  if (bottomRows.length) {
    parsed.bottom = [
      bottomRows[0] || parsed.bottom[0],
      bottomRows[1] || parsed.bottom[1],
    ];
  }

  return parsed;
}

function parseFlattenedFooterTable(footer) {
  const cells = [...footer.querySelectorAll('p, li, h1, h2, h3, h4')]
    .map((element) => cleanText(element.textContent))
    .filter(Boolean)
    .filter((text) => !['section', 'text', 'link'].includes(text.toLowerCase()));

  if (!cells.some(isKnownSection)) return null;

  const parsed = emptyFooterModel();
  const brandRows = [];
  const bottomRows = [];
  let index = 0;

  while (index < cells.length) {
    const section = cells[index];
    const text = cells[index + 1];
    const possibleLink = cells[index + 2];

    if (!isKnownSection(section) || !text) {
      index += 1;
    } else if (section.toLowerCase() === 'brand' || section.toLowerCase() === 'bottom') {
      if (section.toLowerCase() === 'brand') {
        brandRows.push(text);
      } else {
        bottomRows.push(text);
      }
      index += 2;
    } else {
      const link = isLinkText(possibleLink || '') ? possibleLink : fallbackHref(text);
      applyFooterRow(parsed, section, text, link);
      index += isLinkText(possibleLink || '') ? 3 : 2;
    }
  }

  const [brand, description, disclaimer] = brandRows;
  if (brand) parsed.brand = brand;
  if (description) parsed.description = description;
  if (disclaimer) parsed.disclaimer = disclaimer;
  if (bottomRows.length) {
    parsed.bottom = [
      bottomRows[0] || parsed.bottom[0],
      bottomRows[1] || parsed.bottom[1],
    ];
  }

  return parsed;
}

function createLink(item, sectionTitle) {
  const link = document.createElement('a');
  link.href = item.href;
  link.textContent = item.text;

  if (sectionTitle === 'Social') {
    link.classList.add('footer-social-link');
    link.innerHTML = `<span class="footer-social-icon" aria-hidden="true"></span><span>${item.text}</span>`;
  }

  if (/^https?:\/\//.test(item.href)) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  return link;
}

function renderFooter(footer, parsed) {
  const grid = document.createElement('div');
  grid.className = 'footer-grid';

  const brand = document.createElement('div');
  brand.className = 'footer-brand';
  brand.innerHTML = `
    <div class="footer-logo">${parsed.brand.replace('Atlas', '<em>Atlas</em>')}</div>
    <p class="footer-desc">${parsed.description}</p>
    <p class="footer-disclaimer">${parsed.disclaimer}</p>
  `;
  grid.append(brand);

  parsed.sections.forEach((section) => {
    const column = document.createElement('div');
    column.className = 'footer-col';
    column.innerHTML = `<h3>${section.title}</h3>`;
    section.links.forEach((item) => column.append(createLink(item, section.title)));
    grid.append(column);
  });

  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';
  bottom.innerHTML = `
    <p>${parsed.bottom[0]}</p>
    <p>${parsed.bottom[1]}</p>
  `;

  footer.replaceChildren(grid, bottom);
}

function normalizeFooter(footer) {
  const tableParsed = parseFooterTable(footer) || parseFlattenedFooterTable(footer);
  if (tableParsed) renderFooter(footer, tableParsed);
}

function classifyFooterAuth(footer) {
  footer.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const text = link.textContent.trim().toLowerCase();

    if (href.includes('/login') || href.includes('tab=register') || text === 'login' || text === 'sign up') {
      link.classList.add('footer-auth-guest');
    }

    if (href.includes('/profile') || text === 'my account') {
      link.classList.add('footer-auth-user');
    }
  });

  if (!footer.querySelector('.footer-logout-btn')) {
    const accountLink = footer.querySelector('.footer-auth-user');
    if (accountLink) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'footer-logout-btn';
      button.textContent = 'Sign Out';
      accountLink.insertAdjacentElement('afterend', button);
    }
  }
}

function updateFooterAuthLinks(footer) {
  const loggedIn = localStorage.getItem('loggedIn') === 'true';

  footer.querySelectorAll('.footer-auth-guest').forEach((link) => {
    link.hidden = loggedIn;
  });

  footer.querySelectorAll('.footer-auth-user, .footer-logout-btn').forEach((link) => {
    link.hidden = !loggedIn;
  });
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  normalizeFooter(footer);
  classifyFooterAuth(footer);
  updateFooterAuthLinks(footer);
  footer.querySelectorAll('.footer-logout-btn').forEach((button) => {
    button.addEventListener('click', logout);
  });

  window.addEventListener('storage', () => updateFooterAuthLinks(footer));
  block.append(footer);
}
