const DEFAULT_LIMIT = 4;
const DATA_URL = '/data/herbs.json';

function getCell(row, index) {
  return row?.children[index] || null;
}

function getText(cell) {
  return cell?.textContent.trim() || '';
}

function getHtml(cell) {
  return cell?.innerHTML.trim() || '';
}

function getHref(cell) {
  const link = cell?.querySelector('a[href]');
  return link?.getAttribute('href') || getText(cell);
}

function normalizeKey(cell) {
  return getText(cell).toLowerCase().replace(/\s+/g, '-');
}

function normalizeInlineHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  if (tmp.children.length === 1 && tmp.firstElementChild.tagName === 'P') {
    return tmp.firstElementChild.innerHTML.trim();
  }

  return html;
}

function readConfig(rows) {
  const config = {
    eyebrow: '',
    title: '',
    ctaText: '',
    ctaLink: '',
    mode: 'recent',
    limit: DEFAULT_LIMIT,
    detailBase: '/herb-detail',
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

    if (key === 'cta-text' || key === 'link-text') {
      config.ctaText = getText(getCell(row, 1));
      return;
    }

    if (key === 'cta-link' || key === 'link') {
      config.ctaLink = getHref(getCell(row, 1));
      return;
    }

    if (key === 'mode') {
      config.mode = getText(getCell(row, 1)).toLowerCase() || config.mode;
      return;
    }

    if (key === 'limit' || key === 'count') {
      const limit = parseInt(getText(getCell(row, 1)), 10);
      if (Number.isFinite(limit) && limit > 0) config.limit = limit;
      return;
    }

    if (key === 'detail-base' || key === 'detail-link-base') {
      config.detailBase = getHref(getCell(row, 1)) || config.detailBase;
    }
  });

  return config;
}

async function loadHerbs() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Unable to load ${DATA_URL}`);
  }

  const herbs = await response.json();
  return Array.isArray(herbs) ? herbs : [];
}

function getSafetyLabel(safety) {
  return safety === 'safe' ? 'Generally Safe' : 'Use with Caution';
}

function getDetailHref(herb, detailBase) {
  const separator = detailBase.includes('?') ? '&' : '?';
  return `${detailBase}${separator}id=${encodeURIComponent(herb.id)}`;
}

function truncateText(text, maxLength = 90) {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trim()}...`;
}

function buildHeader(config) {
  if (!config.eyebrow && !config.title && !config.ctaText) return null;

  const header = document.createElement('div');
  header.className = 'herb-cards-header';

  const textWrap = document.createElement('div');

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'herb-cards-label';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    textWrap.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h2');
    title.className = 'herb-cards-title';
    title.innerHTML = normalizeInlineHtml(config.title);
    textWrap.append(title);
  }

  header.append(textWrap);

  if (config.ctaText && config.ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'herb-cards-view-all';
    cta.href = config.ctaLink;
    cta.textContent = config.ctaText;
    header.append(cta);
  }

  return header;
}

function buildTag(text, className) {
  const tag = document.createElement('span');
  tag.className = `herb-cards-tag ${className}`;
  tag.textContent = text;
  return tag;
}

function selectHerbs(herbs, config) {
  if (config.mode === 'recent') {
    return herbs.slice(-config.limit);
  }

  // Future modes can branch here without changing the card rendering layer.
  return herbs.slice(-config.limit);
}

function buildCard(herb, detailBase) {
  const href = getDetailHref(herb, detailBase);
  const card = document.createElement('a');
  card.className = 'herb-card';
  card.href = href;
  card.setAttribute('aria-label', `View ${herb.name}`);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'herb-card-img';

  const image = document.createElement('img');
  image.src = herb.image;
  image.alt = herb.name;
  image.loading = 'lazy';
  image.width = 300;
  image.height = 190;
  imageWrap.append(image);

  const badge = document.createElement('span');
  badge.className = 'herb-card-badge';
  badge.textContent = getSafetyLabel(herb.safety);
  imageWrap.append(badge);

  const body = document.createElement('div');
  body.className = 'herb-card-body';

  const title = document.createElement('h3');
  title.textContent = herb.name;
  body.append(title);

  const scientificName = document.createElement('p');
  scientificName.className = 'herb-card-sci';
  scientificName.textContent = herb.scientific_name;
  body.append(scientificName);

  const description = document.createElement('p');
  description.textContent = truncateText(herb.description);
  body.append(description);

  const tags = document.createElement('div');
  tags.className = 'herb-cards-tags';
  tags.append(
    buildTag(herb.best_for, 'tag-green'),
    buildTag(herb.region, 'tag-brown'),
    buildTag(getSafetyLabel(herb.safety), `tag-${herb.safety}`),
  );
  body.append(tags);

  card.append(imageWrap, body);
  return card;
}

function buildGrid(herbs, config) {
  const grid = document.createElement('div');
  grid.className = 'herb-cards-grid';

  selectHerbs(herbs, config).forEach((herb) => {
    grid.append(buildCard(herb, config.detailBase));
  });

  return grid;
}

function renderError(block) {
  const error = document.createElement('p');
  error.className = 'herb-cards-error';
  error.textContent = 'Herbs are unavailable right now.';
  block.append(error);
}

export default async function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const header = buildHeader(config);
  if (header) block.append(header);

  try {
    const herbs = await loadHerbs();
    block.append(buildGrid(herbs, config));
  } catch (error) {
    // Keep the page usable if the JSON request fails.
    // eslint-disable-next-line no-console
    console.warn(error);
    renderError(block);
  }
}
