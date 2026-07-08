import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
} from './aem.js';

const TOAST_QUEUE_KEY = 'toastQueue';
const TOAST_DURATION = 3600;
const TOAST_TYPES = new Set(['success', 'error', 'warning', 'info']);
const FONT_STYLESHEET = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600;700&display=swap';
let toastRoot;
let fontsPromise;

function addPreconnect(href, crossOrigin = false) {
  if (document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  if (crossOrigin) link.crossOrigin = '';
  document.head.append(link);
}

function prepareFontConnections() {
  addPreconnect('https://fonts.googleapis.com');
  addPreconnect('https://fonts.gstatic.com', true);
}

function ensureMetaDescription() {
  if (document.head.querySelector('meta[name="description"]')) return;

  const meta = document.createElement('meta');
  meta.name = 'description';
  meta.content = 'HerbAtlas documents medicinal herbs, practical uses, safety notes, and premium herbal products for educational wellness research.';
  document.head.append(meta);
}

function getToastRoot() {
  if (toastRoot && document.body.contains(toastRoot)) return toastRoot;

  toastRoot = document.createElement('div');
  toastRoot.className = 'toast-root';
  toastRoot.setAttribute('aria-live', 'polite');
  toastRoot.setAttribute('aria-relevant', 'additions');
  document.body.append(toastRoot);
  return toastRoot;
}

function normalizeToastType(type) {
  return TOAST_TYPES.has(type) ? type : 'info';
}

function getToastEyebrow(type) {
  switch (type) {
    case 'success': return 'Success';
    case 'error': return 'Error';
    case 'warning': return 'Warning';
    default: return 'Info';
  }
}

function removeToast(toast) {
  if (!toast || toast.dataset.state === 'leaving') return;

  toast.dataset.state = 'leaving';
  toast.classList.remove('is-visible');
  toast.classList.add('is-leaving');

  window.setTimeout(() => {
    toast.remove();
    if (toastRoot && !toastRoot.children.length) {
      toastRoot.remove();
      toastRoot = null;
    }
  }, 260);
}

function scheduleToastRemoval(toast) {
  let timerId = window.setTimeout(() => removeToast(toast), TOAST_DURATION);

  const restartTimer = () => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => removeToast(toast), TOAST_DURATION);
  };

  toast.addEventListener('mouseenter', () => window.clearTimeout(timerId));
  toast.addEventListener('mouseleave', restartTimer);
  toast.addEventListener('focusin', () => window.clearTimeout(timerId));
  toast.addEventListener('focusout', (event) => {
    if (!toast.contains(event.relatedTarget)) restartTimer();
  });
}

function showToast(message, type = 'info') {
  if (!message) return;

  const resolvedType = normalizeToastType(type);
  const root = getToastRoot();
  const toast = document.createElement('section');
  toast.className = `toast toast-${resolvedType}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.dataset.state = 'entering';

  const content = document.createElement('div');
  content.className = 'toast-content';

  const eyebrow = document.createElement('span');
  eyebrow.className = 'toast-eyebrow';
  eyebrow.textContent = getToastEyebrow(resolvedType);

  const messageEl = document.createElement('p');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;

  const dismissBtn = document.createElement('button');
  dismissBtn.type = 'button';
  dismissBtn.className = 'toast-dismiss';
  dismissBtn.textContent = 'Dismiss';
  dismissBtn.setAttribute('aria-label', `Dismiss ${resolvedType} notification`);
  dismissBtn.addEventListener('click', () => removeToast(toast));

  toast.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') removeToast(toast);
  });

  content.append(eyebrow, messageEl);
  toast.append(content, dismissBtn);
  root.prepend(toast);

  window.requestAnimationFrame(() => {
    toast.dataset.state = 'visible';
    toast.classList.add('is-visible');
  });

  scheduleToastRemoval(toast);
}

function queueToast(message, type = 'info') {
  if (!message) return;

  const queue = JSON.parse(sessionStorage.getItem(TOAST_QUEUE_KEY) || '[]');
  queue.push({ message, type: normalizeToastType(type) });
  sessionStorage.setItem(TOAST_QUEUE_KEY, JSON.stringify(queue));
}

function flushQueuedToasts() {
  const queue = JSON.parse(sessionStorage.getItem(TOAST_QUEUE_KEY) || '[]');
  if (!queue.length) return;

  sessionStorage.removeItem(TOAST_QUEUE_KEY);
  queue.forEach((item) => showToast(item.message, item.type));
}

window.showToast = showToast;
window.queueToast = queueToast;

/**
 * Load web fonts and set a session storage flag.
 */
async function loadFonts() {
  prepareFontConnections();
  if (!fontsPromise) fontsPromise = loadCSS(FONT_STYLESHEET);
  await fontsPromise;
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  ensureMetaDescription();
  prepareFontConnections();
  decorateTemplateAndTheme();
  loadHeader(doc.querySelector('header'));

  try {
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  document.body.classList.add('appear');
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  flushQueuedToasts();
  loadDelayed();
}

loadPage();
