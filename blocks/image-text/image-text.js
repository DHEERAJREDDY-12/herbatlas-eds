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
    descriptions: [],
    imageCell: null,
    imageAlt: '',
    ctaText: '',
    ctaLink: '',
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

    if (key === 'description' || key === 'text' || key === 'paragraph') {
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
    }
  });

  return config;
}

function buildMedia(config) {
  const image = createImage(config.imageCell, config.imageAlt);
  if (!image) return null;

  const media = document.createElement('div');
  media.className = 'image-text-media';
  media.append(image);
  return media;
}

function buildContent(config) {
  const content = document.createElement('div');
  content.className = 'image-text-content';

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'image-text-eyebrow';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    content.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h2');
    title.className = 'image-text-title';
    title.innerHTML = normalizeInlineHtml(config.title);
    content.append(title);
  }

  config.descriptions.forEach((item) => {
    const description = document.createElement('p');
    description.className = 'image-text-description';
    description.innerHTML = normalizeInlineHtml(item);
    content.append(description);
  });

  if (config.ctaText && config.ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'image-text-cta';
    cta.href = config.ctaLink;
    cta.textContent = config.ctaText;
    content.append(cta);
  }

  return content;
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const media = buildMedia(config);
  const content = buildContent(config);

  if (media) block.append(media);
  if (content.children.length) block.append(content);
}
