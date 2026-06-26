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
    description: '',
    imageCell: null,
    imageAlt: '',
    ctaText: '',
    ctaLink: '',
    badges: [],
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
      config.description = getHtml(getCell(row, 1));
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

  if (config.description) {
    const description = document.createElement('p');
    description.className = 'hero-description';
    description.innerHTML = normalizeInlineHtml(config.description);
    content.append(description);
  }

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
  const config = readConfig([...block.children]);
  block.textContent = '';

  const inner = document.createElement('div');
  inner.className = 'hero-inner';
  inner.append(buildContent(config));

  const media = buildMedia(config);
  if (media) {
    block.classList.add('image-right');
    inner.append(media);
  }

  block.append(inner);
}
