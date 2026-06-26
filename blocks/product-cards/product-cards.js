const DATA_URL = '/data/herbs.json';
const DEFAULT_IDS = [1, 2, 3, 7];
const DEFAULT_BADGES = {
  1: 'Bestseller',
  2: 'Top Rated',
  3: 'Most Popular',
  7: 'Staff Pick',
};

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

function parseList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseIds(value) {
  const ids = parseList(value)
    .map((item) => parseInt(item, 10))
    .filter((id) => Number.isFinite(id));
  return ids.length ? ids : DEFAULT_IDS;
}

function readConfig(rows) {
  const config = {
    eyebrow: '',
    title: '',
    ctaText: '',
    ctaLink: '',
    mode: 'featured',
    ids: DEFAULT_IDS,
    badges: {},
    detailBase: '/shop-detail',
    buttonText: 'View Product',
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

    if (key === 'product-ids' || key === 'ids') {
      config.ids = parseIds(getText(getCell(row, 1)));
      return;
    }

    if (key === 'badges') {
      const badges = parseList(getText(getCell(row, 1)));
      config.ids.forEach((id, index) => {
        if (badges[index]) config.badges[id] = badges[index];
      });
      return;
    }

    if (key === 'detail-base' || key === 'detail-link-base') {
      config.detailBase = getHref(getCell(row, 1)) || config.detailBase;
      return;
    }

    if (key === 'button-text') {
      config.buttonText = getText(getCell(row, 1)) || config.buttonText;
    }
  });

  return config;
}

async function loadProducts() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Unable to load ${DATA_URL}`);
  }

  const herbs = await response.json();
  return Array.isArray(herbs) ? herbs : [];
}

function getWeightValue(weight) {
  return parseInt((weight || '').replace(/[^0-9]/g, ''), 10) || 0;
}

function getSortedWeights(herb) {
  return [...(herb.weights || [])].sort((a, b) => getWeightValue(a) - getWeightValue(b));
}

function getCardWeight(herb) {
  const sortedWeights = getSortedWeights(herb);
  return sortedWeights[1] || sortedWeights[0] || '';
}

function getBulkDiscount(weightRatio) {
  if (weightRatio >= 10) return 0.22;
  if (weightRatio >= 5) return 0.16;
  if (weightRatio >= 4) return 0.14;
  if (weightRatio >= 3) return 0.1;
  if (weightRatio >= 2.5) return 0.08;
  if (weightRatio >= 2) return 0.06;
  return 0;
}

function getPriceForWeight(herb, weight) {
  if (!herb || !herb.weights || !herb.weights.length) return herb ? herb.price : 0;

  const sortedWeights = getSortedWeights(herb);
  const baseAmount = getWeightValue(sortedWeights[0]);
  const selectedAmount = getWeightValue(weight);
  if (!baseAmount || !selectedAmount) return herb.price;

  const weightRatio = selectedAmount / baseAmount;
  const linearPrice = herb.price * weightRatio;
  const discountedPrice = linearPrice * (1 - getBulkDiscount(weightRatio));

  return Math.max(herb.price, Math.round(discountedPrice));
}

function getProductImage(herb) {
  const slug = herb.image.split('/').pop().replace(/\.(jpg|png|webp)$/i, '');
  return `/images/shop/${slug}-product.webp`;
}

function getProductHref(herb, config, weight) {
  const separator = config.detailBase.includes('?') ? '&' : '?';
  return `${config.detailBase}${separator}id=${encodeURIComponent(herb.id)}&weight=${encodeURIComponent(weight)}`;
}

function selectProducts(products, config) {
  if (config.mode === 'featured') {
    return config.ids
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean);
  }

  // Future modes can branch here while reusing the same card renderer.
  return config.ids
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);
}

function buildHeader(config) {
  if (!config.eyebrow && !config.title && !config.ctaText) return null;

  const header = document.createElement('div');
  header.className = 'product-cards-header';

  const textWrap = document.createElement('div');

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'product-cards-label';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    textWrap.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h2');
    title.className = 'product-cards-title';
    title.innerHTML = normalizeInlineHtml(config.title);
    textWrap.append(title);
  }

  header.append(textWrap);

  if (config.ctaText && config.ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'product-cards-view-all';
    cta.href = config.ctaLink;
    cta.textContent = config.ctaText;
    header.append(cta);
  }

  return header;
}

function buildCard(product, config) {
  const weight = getCardWeight(product);
  const price = getPriceForWeight(product, weight);
  const href = getProductHref(product, config, weight);
  const badgeText = config.badges[product.id] || DEFAULT_BADGES[product.id] || 'Organic';

  const card = document.createElement('article');
  card.className = 'product-card';

  const imageLink = document.createElement('a');
  imageLink.className = 'product-card-img';
  imageLink.href = href;
  imageLink.setAttribute('aria-label', `View ${product.name}`);

  const image = document.createElement('img');
  image.src = getProductImage(product);
  image.alt = product.name;
  image.loading = 'lazy';
  image.addEventListener('error', () => {
    image.src = product.image;
  }, { once: true });
  imageLink.append(image);

  const badge = document.createElement('span');
  badge.className = badgeText.toLowerCase() === 'bestseller'
    ? 'product-card-badge bestseller'
    : 'product-card-badge';
  badge.textContent = badgeText;
  imageLink.append(badge);

  const body = document.createElement('div');
  body.className = 'product-card-body';

  const title = document.createElement('h3');
  title.textContent = product.name;
  body.append(title);

  const scientificName = document.createElement('span');
  scientificName.className = 'product-card-sci';
  scientificName.textContent = product.scientific_name;
  body.append(scientificName);

  const use = document.createElement('p');
  use.className = 'product-card-use';
  use.textContent = product.best_for;
  body.append(use);

  const footer = document.createElement('div');
  footer.className = 'product-card-footer';

  const priceWrap = document.createElement('div');
  priceWrap.className = 'product-card-price';

  const amount = document.createElement('span');
  amount.className = 'product-card-price-amount';
  amount.innerHTML = `&#8377;${price}`;
  priceWrap.append(amount);

  const priceWeight = document.createElement('span');
  priceWeight.className = 'product-card-price-weight';
  priceWeight.textContent = weight;
  priceWrap.append(priceWeight);

  const button = document.createElement('a');
  button.className = 'product-card-button';
  button.href = href;
  button.textContent = config.buttonText;
  button.setAttribute('aria-label', `View ${product.name} product`);

  footer.append(priceWrap, button);
  card.append(imageLink, body, footer);
  return card;
}

function buildGrid(products, config) {
  const grid = document.createElement('div');
  grid.className = 'product-cards-grid';

  selectProducts(products, config).forEach((product) => {
    grid.append(buildCard(product, config));
  });

  return grid;
}

function renderError(block) {
  const error = document.createElement('p');
  error.className = 'product-cards-error';
  error.textContent = 'Products are unavailable right now.';
  block.append(error);
}

export default async function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const header = buildHeader(config);
  if (header) block.append(header);

  try {
    const products = await loadProducts();
    block.append(buildGrid(products, config));
  } catch (error) {
    // Keep the page usable if the JSON request fails.
    // eslint-disable-next-line no-console
    console.warn(error);
    renderError(block);
  }
}
