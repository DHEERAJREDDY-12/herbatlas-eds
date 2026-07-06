function getCell(row, index) {
  return row?.children[index] || null;
}

function getText(cell) {
  return cell?.textContent.trim() || '';
}

function getHtml(cell) {
  return cell?.innerHTML.trim() || '';
}

function normalizeKey(cell) {
  return getText(cell).toLowerCase().replace(/\s+/g, '-');
}

function getHref(cell) {
  const link = cell?.querySelector('a[href]');
  return link?.getAttribute('href') || getText(cell);
}

function normalizeInlineHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  if (tmp.children.length === 1 && tmp.firstElementChild.tagName === 'P') {
    return tmp.firstElementChild.innerHTML.trim();
  }
  return html;
}

function readJsonStorage(storage, key, fallback) {
  try {
    return JSON.parse(storage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function getAccountAddress(userEmail) {
  const store = readJsonStorage(localStorage, 'addresses', {});
  const addresses = Array.isArray(store[userEmail]) ? store[userEmail] : [];
  return addresses.find((address) => address.isDefault) || addresses[0] || null;
}

function getAddressLine(address) {
  if (!address) return '';
  return [
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean).join(', ');
}

function getPagePath() {
  return window.location.pathname.replace(/\/$/, '').replace(/\.html$/, '');
}

function isProfileHero(config) {
  const path = getPagePath();
  const titleText = normalizeInlineHtml(config.title).replace(/<[^>]+>/g, '').trim().toLowerCase();
  return path === '/profile' || titleText.startsWith('hello,');
}

function applyAccountSummary(config) {
  if (!isProfileHero(config) || localStorage.getItem('loggedIn') !== 'true') return config;

  const userName = localStorage.getItem('userName') || 'there';
  const userEmail = localStorage.getItem('userEmail') || '';
  const address = getAccountAddress(userEmail);

  return {
    ...config,
    title: `Hello, <em>${userName}</em>`,
    descriptions: userEmail ? [userEmail] : config.descriptions,
    accountAddress: address,
  };
}

function createImage(cell, alt) {
  const picture = cell?.querySelector('picture');
  if (picture) {
    const clonedPicture = picture.cloneNode(true);
    const img = clonedPicture.querySelector('img');
    if (img && alt) img.alt = alt;
    return clonedPicture;
  }

  const img = cell?.querySelector('img');
  if (img) {
    const clonedImg = img.cloneNode(true);
    if (alt) clonedImg.alt = alt;
    return clonedImg;
  }

  const src = getHref(cell);
  if (!src) return null;

  const fallbackImg = document.createElement('img');
  fallbackImg.src = src;
  fallbackImg.alt = alt || '';
  fallbackImg.loading = 'lazy';
  return fallbackImg;
}

function readConfig(rows) {
  const config = {
    eyebrow: '',
    title: '',
    descriptions: [],
    imageCell: null,
    imageAlt: '',
    ctaText: '',
    ctaLink: '',
    badges: [],
    accountAddress: null,
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));

    if (key === 'eyebrow' || key === 'label') {
      config.eyebrow = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'title') {
      config.title = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'description' || key === 'subtitle') {
      const description = getHtml(getCell(row, 1));
      if (description) config.descriptions.push(description);
      return;
    }

    if (key === 'image') {
      config.imageCell = getCell(row, 1);
      return;
    }

    if (key === 'image-alt' || key === 'alt') {
      config.imageAlt = getText(getCell(row, 1));
      return;
    }

    if (key === 'cta-text' || key === 'button-text') {
      config.ctaText = getText(getCell(row, 1));
      return;
    }

    if (key === 'cta-link' || key === 'button-link') {
      config.ctaLink = getHref(getCell(row, 1));
      return;
    }

    if (key === 'badge') {
      const badge = getHtml(getCell(row, 1));
      if (badge) config.badges.push(badge);
    }
  });

  return config;
}

function buildContent(config) {
  const content = document.createElement('div');
  content.className = 'hero-content';

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'hero-eyebrow';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    content.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h1');
    title.innerHTML = normalizeInlineHtml(config.title);
    content.append(title);
  }

  config.descriptions.forEach((item) => {
    const description = document.createElement('p');
    description.className = 'hero-description';
    description.innerHTML = normalizeInlineHtml(item);
    content.append(description);
  });

  if (config.badges.length) {
    const badges = document.createElement('div');
    badges.className = 'hero-badges';
    config.badges.forEach((item) => {
      const badge = document.createElement('span');
      badge.className = 'hero-badge';
      badge.innerHTML = normalizeInlineHtml(item);
      badges.append(badge);
    });
    content.append(badges);
  }

  if (config.ctaText && config.ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'hero-cta';
    cta.href = config.ctaLink;
    cta.textContent = config.ctaText;
    content.append(cta);
  }

  if (config.accountAddress) {
    const address = document.createElement('div');
    address.className = 'hero-account-address';

    const icon = document.createElement('span');
    icon.className = 'hero-account-address-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '\uD83D\uDCCD';

    const text = document.createElement('div');
    text.className = 'hero-account-address-text';

    const name = document.createElement('strong');
    name.textContent = [config.accountAddress.fullName, config.accountAddress.phone]
      .filter(Boolean)
      .join(' \u00B7 ');

    const detail = document.createElement('span');
    detail.textContent = getAddressLine(config.accountAddress);

    text.append(name, detail);
    address.append(icon, text);
    content.append(address);
  }

  return content;
}

function buildMedia(config) {
  const image = createImage(config.imageCell, config.imageAlt);
  if (!image) return null;

  const media = document.createElement('div');
  media.className = 'hero-media';
  media.append(image);
  return media;
}

export default function decorate(block) {
  const config = applyAccountSummary(readConfig([...block.children]));
  block.textContent = '';

  if (['/browse', '/ailments'].includes(getPagePath())) {
    block.classList.add('collection-hero');
  }

  const inner = document.createElement('div');
  inner.className = 'hero-inner';
  inner.append(buildContent(config));

  const media = buildMedia(config);
  if (media) {
    if (!block.classList.contains('image-left')) block.classList.add('image-right');
    inner.append(media);
  }

  block.append(inner);
}
