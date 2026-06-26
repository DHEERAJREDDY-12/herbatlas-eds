const DATA_URL = '/data/herbs.json';
const DEFAULT_PAGE_SIZE = 8;
const DEFAULT_USE_OPTIONS = [
  { label: 'All Uses', value: '' },
  { label: 'Stress', value: 'Stress & Anxiety' },
  { label: 'Sleep', value: 'Sleep Issues' },
  { label: 'Immunity', value: 'Low Immunity' },
  { label: 'Digestion', value: 'Digestion' },
  { label: 'Joint Pain', value: 'Joint Pain' },
  { label: 'Energy', value: 'Low Energy' },
];
const DEFAULT_SORT_OPTIONS = [
  { label: 'Sort By', value: '' },
  { label: 'Price Low to High', value: 'price-low' },
  { label: 'Price High to Low', value: 'price-high' },
  { label: 'Name A to Z', value: 'name' },
];

function getCell(row, index) {
  return row?.children[index] || null;
}

function getText(cell) {
  return cell?.textContent.trim() || '';
}

function getHref(cell) {
  const link = cell?.querySelector('a[href]');
  return link?.getAttribute('href') || getText(cell);
}

function normalizeKey(cell) {
  return getText(cell).toLowerCase().replace(/\s+/g, '-');
}

function readConfig(rows) {
  const config = {
    label: 'Filter',
    detailBase: '/shop-detail',
    pageSize: DEFAULT_PAGE_SIZE,
    allLabel: 'All',
    stockLabel: 'In Stock',
    safeLabel: 'Safe Only',
    productDetailsLabel: 'Product details',
    addButtonText: '+ Cart',
    addedText: 'Added',
    organicLabel: 'Organic',
    shippingLabel: 'Ships 2-4 days',
    emptyTitle: 'No products found',
    emptyText: 'Try adjusting your filters',
    clearText: 'Clear Filters',
    useOptions: [],
    sortOptions: [],
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    if (key === 'label') {
      config.label = value || config.label;
      return;
    }

    if (key === 'detail-base' || key === 'detail-link-base') {
      config.detailBase = getHref(getCell(row, 1)) || config.detailBase;
      return;
    }

    if (key === 'page-size' || key === 'per-page') {
      const pageSize = parseInt(value, 10);
      if (Number.isFinite(pageSize) && pageSize > 0) config.pageSize = pageSize;
      return;
    }

    if (key === 'all-label') {
      config.allLabel = value || config.allLabel;
      return;
    }

    if (key === 'stock-label') {
      config.stockLabel = value || config.stockLabel;
      return;
    }

    if (key === 'safe-label') {
      config.safeLabel = value || config.safeLabel;
      return;
    }

    if (key === 'product-details-label') {
      config.productDetailsLabel = value || config.productDetailsLabel;
      return;
    }

    if (key === 'add-button-text') {
      config.addButtonText = value || config.addButtonText;
      return;
    }

    if (key === 'added-text') {
      config.addedText = value || config.addedText;
      return;
    }

    if (key === 'organic-label') {
      config.organicLabel = value || config.organicLabel;
      return;
    }

    if (key === 'shipping-label') {
      config.shippingLabel = value || config.shippingLabel;
      return;
    }

    if (key === 'empty-title') {
      config.emptyTitle = value || config.emptyTitle;
      return;
    }

    if (key === 'empty-text') {
      config.emptyText = value || config.emptyText;
      return;
    }

    if (key === 'clear-text') {
      config.clearText = value || config.clearText;
      return;
    }

    if (key === 'use-option') {
      config.useOptions.push({
        label: value,
        value: getText(getCell(row, 2)),
      });
      return;
    }

    if (key === 'sort-option') {
      config.sortOptions.push({
        label: value,
        value: getText(getCell(row, 2)),
      });
    }
  });

  if (!config.useOptions.length) config.useOptions = DEFAULT_USE_OPTIONS;
  if (!config.sortOptions.length) config.sortOptions = DEFAULT_SORT_OPTIONS;
  return config;
}

async function loadProducts() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Unable to load ${DATA_URL}`);
  const products = await response.json();
  return Array.isArray(products) ? products : [];
}

function getSafetyLabel(safety) {
  return safety === 'safe' ? 'Generally Safe' : 'Use with Caution';
}

function getWeightValue(weight) {
  return parseInt((weight || '').replace(/[^0-9]/g, ''), 10) || 0;
}

function getSortedWeights(product) {
  return [...(product.weights || [])].sort((a, b) => getWeightValue(a) - getWeightValue(b));
}

function getCardWeight(product) {
  const sortedWeights = getSortedWeights(product);
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

function getPriceForWeight(product, weight) {
  if (!product || !product.weights || !product.weights.length) return product ? product.price : 0;

  const sortedWeights = getSortedWeights(product);
  const baseAmount = getWeightValue(sortedWeights[0]);
  const selectedAmount = getWeightValue(weight);
  if (!baseAmount || !selectedAmount) return product.price;

  const weightRatio = selectedAmount / baseAmount;
  const linearPrice = product.price * weightRatio;
  const discountedPrice = linearPrice * (1 - getBulkDiscount(weightRatio));

  return Math.max(product.price, Math.round(discountedPrice));
}

function getProductImage(product) {
  const slug = product.image.split('/').pop().replace(/\.(jpg|png|webp)$/i, '');
  return `/images/shop/${slug}-product.webp`;
}

function getProductHref(product, config, weight) {
  const separator = config.detailBase.includes('?') ? '&' : '?';
  return `${config.detailBase}${separator}id=${encodeURIComponent(product.id)}&weight=${encodeURIComponent(weight)}`;
}

function getCartItems() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const total = getCartItems().reduce((sum, item) => sum + (item.qty || 0), 0);
  badge.textContent = total;
}

function addToCart(product, weight) {
  const cart = getCartItems();
  const price = getPriceForWeight(product, weight);
  const existing = cart.find((item) => item.id === product.id && item.weight === weight);

  if (existing) {
    existing.qty += 1;
    existing.price = price;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      image: product.image,
      price,
      weight,
      qty: 1,
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function buildOption(option) {
  const item = document.createElement('option');
  item.value = option.value;
  item.textContent = option.label;
  return item;
}

function buildSelect(className, label, options) {
  const select = document.createElement('select');
  select.className = className;
  select.setAttribute('aria-label', label);
  options.forEach((option) => select.append(buildOption(option)));
  return select;
}

function buildChip(label, stock, safety, state) {
  const chip = document.createElement('button');
  const isActive = state.activeStock === stock && state.activeSafety === safety;
  chip.className = isActive ? 'shop-results-chip active' : 'shop-results-chip';
  chip.type = 'button';
  chip.dataset.stock = stock;
  chip.dataset.safety = safety;
  chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  chip.textContent = label;
  return chip;
}

function buildShell(config) {
  const filterBar = document.createElement('div');
  filterBar.className = 'shop-results-filter';
  filterBar.setAttribute('role', 'search');
  filterBar.setAttribute('aria-label', 'Filter shop products');

  const label = document.createElement('span');
  label.className = 'shop-results-filter-label';
  label.textContent = config.label;
  filterBar.append(label);

  const useSelect = buildSelect('shop-results-select', 'Filter products by wellness use', config.useOptions);
  filterBar.append(useSelect);

  const sortSelect = buildSelect('shop-results-select', 'Sort products', config.sortOptions);
  filterBar.append(sortSelect);

  const chipGroup = document.createElement('div');
  chipGroup.className = 'shop-results-chip-group';
  chipGroup.setAttribute('role', 'group');
  chipGroup.setAttribute('aria-label', 'Filter by product status');
  filterBar.append(chipGroup);

  const count = document.createElement('span');
  count.className = 'shop-results-count';
  count.setAttribute('aria-live', 'polite');
  count.setAttribute('aria-atomic', 'true');
  filterBar.append(count);

  const body = document.createElement('div');
  body.className = 'shop-results-body';

  const grid = document.createElement('div');
  grid.className = 'shop-results-grid';
  body.append(grid);

  const empty = document.createElement('div');
  empty.className = 'shop-results-empty hidden';

  const emptyTitle = document.createElement('h3');
  emptyTitle.textContent = config.emptyTitle;
  empty.append(emptyTitle);

  const emptyText = document.createElement('p');
  emptyText.textContent = config.emptyText;
  empty.append(emptyText);

  const clear = document.createElement('button');
  clear.className = 'shop-results-clear';
  clear.type = 'button';
  clear.textContent = config.clearText;
  empty.append(clear);
  body.append(empty);

  const pagination = document.createElement('nav');
  pagination.className = 'shop-results-pagination';
  pagination.setAttribute('aria-label', 'Shop product pagination');

  return {
    filterBar,
    useSelect,
    sortSelect,
    chipGroup,
    count,
    body,
    grid,
    empty,
    clear,
    pagination,
  };
}

function filterAndSort(products, state) {
  const filtered = products.filter((product) => {
    if (state.ailment && !product.ailments.includes(state.ailment)) return false;
    if (state.activeStock === 'true' && !product.stock) return false;
    if (state.activeSafety === 'safe' && product.safety !== 'safe') return false;
    return true;
  });

  if (state.sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  return filtered;
}

function buildCard(product, state) {
  const weight = getCardWeight(product);
  const price = getPriceForWeight(product, weight);
  const href = getProductHref(product, state.config, weight);

  const card = document.createElement('article');
  card.className = 'shop-results-card';

  const imageLink = document.createElement('a');
  imageLink.className = 'shop-results-card-img';
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

  const organic = document.createElement('span');
  organic.className = 'shop-results-organic-badge';
  organic.textContent = state.config.organicLabel;
  imageLink.append(organic);

  const stock = document.createElement('span');
  stock.className = product.stock
    ? 'shop-results-stock-badge in'
    : 'shop-results-stock-badge out';
  stock.textContent = product.stock ? 'In Stock' : 'Out of Stock';
  imageLink.append(stock);

  const safety = document.createElement('span');
  safety.className = 'shop-results-safety-badge';
  safety.textContent = getSafetyLabel(product.safety);
  imageLink.append(safety);

  const body = document.createElement('div');
  body.className = 'shop-results-card-body';

  const title = document.createElement('h3');
  title.textContent = product.name;
  body.append(title);

  const scientificName = document.createElement('span');
  scientificName.className = 'shop-results-card-sci';
  scientificName.textContent = product.scientific_name;
  body.append(scientificName);

  const use = document.createElement('p');
  use.textContent = product.best_for;
  body.append(use);

  const meta = document.createElement('div');
  meta.className = 'shop-results-card-meta';
  [product.region, weight, state.config.shippingLabel].forEach((item) => {
    const tag = document.createElement('span');
    tag.textContent = item;
    meta.append(tag);
  });
  body.append(meta);

  const details = document.createElement('a');
  details.className = 'shop-results-view-link';
  details.href = href;
  details.textContent = state.config.productDetailsLabel;
  body.append(details);

  const footer = document.createElement('div');
  footer.className = 'shop-results-card-footer';

  const priceWrap = document.createElement('div');
  priceWrap.className = 'shop-results-price';
  priceWrap.innerHTML = `Rs.${price}`;

  const priceWeight = document.createElement('span');
  priceWeight.textContent = `/ ${weight}`;
  priceWrap.append(priceWeight);

  const add = document.createElement('button');
  add.className = 'shop-results-add-btn';
  add.type = 'button';
  add.textContent = product.stock ? state.config.addButtonText : 'Out of Stock';
  add.disabled = !product.stock;
  add.addEventListener('click', () => {
    addToCart(product, weight);
    add.textContent = state.config.addedText;
    add.classList.add('added');
    setTimeout(() => {
      add.textContent = state.config.addButtonText;
      add.classList.remove('added');
    }, 1500);
  });

  footer.append(priceWrap, add);
  card.append(imageLink, body, footer);
  return card;
}

function scrollToBlock(block) {
  const top = block.getBoundingClientRect().top + window.scrollY - 110;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function renderFilters(state, shell, onUpdate) {
  shell.chipGroup.textContent = '';
  shell.chipGroup.append(
    buildChip(state.config.allLabel, '', '', state),
    buildChip(state.config.stockLabel, 'true', '', state),
    buildChip(state.config.safeLabel, '', 'safe', state),
  );

  shell.chipGroup.querySelectorAll('.shop-results-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.activeStock = chip.dataset.stock;
      state.activeSafety = chip.dataset.safety;
      state.currentPage = 1;
      state.filtered = filterAndSort(state.products, state);
      onUpdate(false);
    });
  });
}

function renderPagination(state, shell, onUpdate) {
  const totalPages = Math.ceil(state.filtered.length / state.config.pageSize);
  shell.pagination.textContent = '';
  if (totalPages <= 1) return;

  const addButton = (label, page, className, disabled = false, current = false) => {
    const button = document.createElement('button');
    button.className = className;
    button.type = 'button';
    button.textContent = label;
    if (disabled) {
      button.classList.add('disabled');
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
    }
    if (current) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => {
      if (disabled) return;
      state.currentPage = page;
      onUpdate(true);
    });
    shell.pagination.append(button);
  };

  addButton('←', state.currentPage - 1, 'shop-results-page arrow', state.currentPage === 1);

  for (let page = 1; page <= totalPages; page += 1) {
    addButton(
      String(page),
      page,
      page === state.currentPage ? 'shop-results-page active' : 'shop-results-page',
      false,
      page === state.currentPage,
    );
  }

  addButton('→', state.currentPage + 1, 'shop-results-page arrow', state.currentPage === totalPages);
}

function render(state, shell, block) {
  const onUpdate = (shouldScroll) => {
    render(state, shell, block);
    if (shouldScroll) scrollToBlock(block);
  };

  renderFilters(state, shell, onUpdate);

  const start = (state.currentPage - 1) * state.config.pageSize;
  const end = start + state.config.pageSize;
  const pageProducts = state.filtered.slice(start, end);

  shell.count.textContent = `${state.filtered.length} products`;
  shell.grid.textContent = '';

  if (!state.filtered.length) {
    shell.empty.classList.remove('hidden');
  } else {
    shell.empty.classList.add('hidden');
    pageProducts.forEach((product) => {
      shell.grid.append(buildCard(product, state));
    });
  }

  renderPagination(state, shell, onUpdate);
}

function renderError(block) {
  const error = document.createElement('p');
  error.className = 'shop-results-error';
  error.textContent = 'Products are unavailable right now.';
  block.append(error);
}

export default async function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const shell = buildShell(config);
  block.append(shell.filterBar, shell.body, shell.pagination);

  try {
    const products = await loadProducts();
    const state = {
      config,
      products,
      filtered: [...products],
      currentPage: 1,
      ailment: '',
      sort: '',
      activeStock: '',
      activeSafety: '',
    };

    shell.useSelect.addEventListener('change', () => {
      state.ailment = shell.useSelect.value;
      state.currentPage = 1;
      state.filtered = filterAndSort(state.products, state);
      render(state, shell, block);
    });

    shell.sortSelect.addEventListener('change', () => {
      state.sort = shell.sortSelect.value;
      state.currentPage = 1;
      state.filtered = filterAndSort(state.products, state);
      render(state, shell, block);
    });

    shell.clear.addEventListener('click', () => {
      shell.useSelect.value = '';
      shell.sortSelect.value = '';
      state.ailment = '';
      state.sort = '';
      state.activeStock = '';
      state.activeSafety = '';
      state.currentPage = 1;
      state.filtered = [...state.products];
      render(state, shell, block);
    });

    render(state, shell, block);
    updateCartBadge();
  } catch (error) {
    // Keep the page usable if the JSON request fails.
    // eslint-disable-next-line no-console
    console.warn(error);
    renderError(block);
  }
}
