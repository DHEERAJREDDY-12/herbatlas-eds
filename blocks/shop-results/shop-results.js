const DATA_URL = '/data/herbs.json';
const DEFAULT_PAGE_SIZE = 8;
const DEFAULT_FEATURED_IDS = [1, 2, 3, 7];
const DEFAULT_FEATURED_BADGES = {
  1: 'Bestseller',
  2: 'Top Rated',
  3: 'Most Popular',
  7: 'Staff Pick',
};
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
  return ids.length ? ids : DEFAULT_FEATURED_IDS;
}

function readConfig(rows) {
  const config = {
    badges: {},
    buttonText: 'View Product',
    ctaLink: '',
    ctaText: '',
    label: 'Filter',
    detailBase: '/shop-detail',
    eyebrow: '',
    featuredIds: DEFAULT_FEATURED_IDS,
    mode: 'listing',
    pageSize: DEFAULT_PAGE_SIZE,
    title: '',
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

    if (key === 'eyebrow') {
      config.eyebrow = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'title') {
      config.title = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'cta-text' || key === 'link-text') {
      config.ctaText = value;
      return;
    }

    if (key === 'cta-link' || key === 'link') {
      config.ctaLink = getHref(getCell(row, 1));
      return;
    }

    if (key === 'mode') {
      config.mode = value.toLowerCase() || config.mode;
      return;
    }

    if (key === 'product-ids' || key === 'ids') {
      config.featuredIds = parseIds(value);
      return;
    }

    if (key === 'badges') {
      const badges = parseList(value);
      config.featuredIds.forEach((id, index) => {
        if (badges[index]) config.badges[id] = badges[index];
      });
      return;
    }

    if (key === 'button-text') {
      config.buttonText = value || config.buttonText;
      return;
    }

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

function selectFeaturedProducts(products, config) {
  return config.featuredIds
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);
}

function buildFeaturedHeader(config) {
  if (!config.eyebrow && !config.title && !config.ctaText) return null;

  const header = document.createElement('div');
  header.className = 'shop-results-featured-header';

  const textWrap = document.createElement('div');

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'shop-results-featured-label';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    textWrap.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h2');
    title.className = 'shop-results-featured-title';
    title.innerHTML = normalizeInlineHtml(config.title);
    textWrap.append(title);
  }

  header.append(textWrap);

  if (config.ctaText && config.ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'shop-results-featured-view-all';
    cta.href = config.ctaLink;
    cta.textContent = config.ctaText;
    header.append(cta);
  }

  return header;
}

function buildFeaturedCard(product, config) {
  const weight = getCardWeight(product);
  const price = getPriceForWeight(product, weight);
  const href = getProductHref(product, config, weight);
  const badgeText = config.badges[product.id] || DEFAULT_FEATURED_BADGES[product.id] || 'Organic';

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

function renderFeatured(block, config, products) {
  const header = buildFeaturedHeader(config);
  const grid = document.createElement('div');
  grid.className = 'product-cards-grid';

  selectFeaturedProducts(products, config).forEach((product) => {
    grid.append(buildFeaturedCard(product, config));
  });

  if (header) block.append(header);
  block.append(grid);
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

function showToast(message, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
  }
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
  showToast(`${product.name} ${weight} added to your cart.`, 'success');
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

function buildDrawer(config) {
  const drawerBar = document.createElement('div');
  drawerBar.className = 'shop-results-drawer-bar';

  const trigger = document.createElement('button');
  trigger.className = 'shop-results-drawer-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-controls', 'shopResultsFilterDrawer');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.textContent = config.label;
  drawerBar.append(trigger);

  const drawerCount = document.createElement('span');
  drawerCount.className = 'shop-results-drawer-count';
  drawerCount.setAttribute('aria-live', 'polite');
  drawerCount.setAttribute('aria-atomic', 'true');
  drawerBar.append(drawerCount);

  const overlay = document.createElement('div');
  overlay.className = 'shop-results-filter-overlay';
  overlay.hidden = true;

  const drawer = document.createElement('aside');
  drawer.id = 'shopResultsFilterDrawer';
  drawer.className = 'shop-results-filter-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-label', 'Filter shop products');

  const drawerHead = document.createElement('div');
  drawerHead.className = 'shop-results-filter-drawer-head';

  const drawerTitle = document.createElement('h2');
  drawerTitle.textContent = config.label;
  drawerHead.append(drawerTitle);

  const close = document.createElement('button');
  close.className = 'shop-results-filter-drawer-close';
  close.type = 'button';
  close.textContent = 'Close';
  drawerHead.append(close);

  const drawerBody = document.createElement('div');
  drawerBody.className = 'shop-results-filter-drawer-body';

  const useLabel = document.createElement('label');
  useLabel.className = 'shop-results-filter-drawer-label';
  useLabel.textContent = 'Use';
  drawerBody.append(useLabel);

  const drawerUseSelect = buildSelect('shop-results-select', 'Filter products by wellness use', config.useOptions);
  drawerBody.append(drawerUseSelect);

  const sortLabel = document.createElement('label');
  sortLabel.className = 'shop-results-filter-drawer-label';
  sortLabel.textContent = 'Sort';
  drawerBody.append(sortLabel);

  const drawerSortSelect = buildSelect('shop-results-select', 'Sort products', config.sortOptions);
  drawerBody.append(drawerSortSelect);

  const statusLabel = document.createElement('span');
  statusLabel.className = 'shop-results-filter-drawer-label';
  statusLabel.textContent = 'Status';
  drawerBody.append(statusLabel);

  const drawerChipGroup = document.createElement('div');
  drawerChipGroup.className = 'shop-results-filter-drawer-chips';
  drawerChipGroup.setAttribute('role', 'group');
  drawerChipGroup.setAttribute('aria-label', 'Filter by product status');
  drawerBody.append(drawerChipGroup);

  const actions = document.createElement('div');
  actions.className = 'shop-results-filter-drawer-actions';

  const apply = document.createElement('button');
  apply.className = 'shop-results-filter-drawer-apply';
  apply.type = 'button';
  apply.textContent = 'Apply Filters';
  actions.append(apply);

  const drawerClear = document.createElement('button');
  drawerClear.className = 'shop-results-filter-drawer-clear';
  drawerClear.type = 'button';
  drawerClear.textContent = config.clearText;
  actions.append(drawerClear);

  drawer.append(drawerHead, drawerBody, actions);

  return {
    drawerBar,
    drawerCount,
    trigger,
    overlay,
    drawer,
    close,
    drawerUseSelect,
    drawerSortSelect,
    drawerChipGroup,
    apply,
    drawerClear,
  };
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

  const drawer = buildDrawer(config);

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
    ...drawer,
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

function buildCard(product, state, isFirstVisible) {
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
  image.width = 400;
  image.height = 300;
  // First visible product on current page should be eager-loaded for LCP optimization
  image.loading = isFirstVisible ? 'eager' : 'lazy';
  if (isFirstVisible) {
    image.fetchPriority = 'high';
  }
  image.decoding = 'async';
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

  const title = document.createElement('h2');
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
  details.setAttribute('aria-label', `View ${product.name} product`);
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

function isVisible(element) {
  return element && window.getComputedStyle(element).display !== 'none';
}

function getStickyTop() {
  const mobileSearch = document.querySelector('.mobile-search-bar');
  if (isVisible(mobileSearch)) {
    return Math.round(mobileSearch.getBoundingClientRect().bottom);
  }

  const nav = document.querySelector('header .nav-wrapper');
  return nav ? Math.round(nav.getBoundingClientRect().bottom) : 0;
}

function scrollToBlock(block) {
  const top = block.getBoundingClientRect().top + window.scrollY - getStickyTop();
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function bindStickyFilter(block, bars) {
  const spacer = document.createElement('div');
  let ticking = false;

  spacer.className = 'shop-results-sticky-spacer';
  bars[0].insertAdjacentElement('afterend', spacer);

  function resetFilter(bar) {
    spacer.classList.remove('active');
    spacer.style.height = '0px';
    bar.classList.remove('is-fixed', 'is-bottom');
    bar.style.top = '';
    bar.style.left = '';
    bar.style.right = '';
    bar.style.bottom = '';
    bar.style.width = '';
  }

  function updateStickyFilter() {
    ticking = false;
    bars.forEach(resetFilter);

    const filterBar = bars.find(isVisible);
    if (!isVisible(filterBar)) return;
    if (spacer.previousElementSibling !== filterBar) {
      filterBar.insertAdjacentElement('afterend', spacer);
    }

    const stickyTop = getStickyTop();
    const blockRect = block.getBoundingClientRect();
    const filterRect = filterBar.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const filterDocTop = scrollTop + filterRect.top;
    const blockDocTop = scrollTop + blockRect.top;
    const filterHeight = filterBar.offsetHeight;
    const maxFixedScroll = blockDocTop + block.offsetHeight - filterHeight - stickyTop;

    if (scrollTop + stickyTop <= filterDocTop) return;

    spacer.classList.add('active');
    spacer.style.height = `${filterHeight}px`;

    if (scrollTop < maxFixedScroll) {
      filterBar.classList.add('is-fixed');
      filterBar.style.top = `${stickyTop}px`;
      filterBar.style.left = `${Math.round(blockRect.left)}px`;
      filterBar.style.width = `${Math.round(blockRect.width)}px`;
      return;
    }

    filterBar.classList.add('is-bottom');
    filterBar.style.bottom = '0px';
    filterBar.style.width = '100%';
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateStickyFilter);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate);
  requestUpdate();
}

function renderFilters(state, shell, onUpdate) {
  const appendChips = (chipGroup, onClick) => {
    chipGroup.textContent = '';
    chipGroup.append(
      buildChip(state.config.allLabel, '', '', state),
      buildChip(state.config.stockLabel, 'true', '', state),
      buildChip(state.config.safeLabel, '', 'safe', state),
    );

    chipGroup.querySelectorAll('.shop-results-chip').forEach((chip) => {
      chip.addEventListener('click', () => onClick(chip));
    });
  };

  appendChips(shell.chipGroup, (chip) => {
    state.activeStock = chip.dataset.stock;
    state.activeSafety = chip.dataset.safety;
    state.currentPage = 1;
    state.filtered = filterAndSort(state.products, state);
    onUpdate(false);
  });

  appendChips(shell.drawerChipGroup, (chip) => {
    shell.drawerChipGroup.querySelectorAll('.shop-results-chip').forEach((item) => {
      item.classList.toggle('active', item === chip);
      item.setAttribute('aria-pressed', item === chip ? 'true' : 'false');
    });
  });
}

function syncDrawerFromState(state, shell) {
  shell.drawerUseSelect.value = state.ailment;
  shell.drawerSortSelect.value = state.sort;
  shell.drawerChipGroup.querySelectorAll('.shop-results-chip').forEach((chip) => {
    const isActive = chip.dataset.stock === state.activeStock
      && chip.dataset.safety === state.activeSafety;
    chip.classList.toggle('active', isActive);
    chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function applyDrawerFilters(state, shell) {
  const activeChip = shell.drawerChipGroup.querySelector('.shop-results-chip.active');
  shell.useSelect.value = shell.drawerUseSelect.value;
  shell.sortSelect.value = shell.drawerSortSelect.value;
  state.ailment = shell.drawerUseSelect.value;
  state.sort = shell.drawerSortSelect.value;
  state.activeStock = activeChip?.dataset.stock || '';
  state.activeSafety = activeChip?.dataset.safety || '';
  state.currentPage = 1;
  state.filtered = filterAndSort(state.products, state);
}

function setDrawerPosition(shell) {
  const top = getStickyTop();
  shell.overlay.style.top = `${top}px`;
  shell.drawer.style.top = `${top}px`;
  shell.drawer.style.height = `calc(100vh - ${top}px)`;
}

function bindFilterDrawer(state, shell, onApply) {
  let lastFocused = null;
  let open = false;

  function closeDrawer() {
    if (!open) return;
    open = false;
    shell.overlay.hidden = true;
    shell.overlay.classList.remove('open');
    shell.drawer.classList.remove('open');
    shell.drawer.setAttribute('aria-hidden', 'true');
    shell.trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('filter-drawer-open');
    lastFocused?.focus();
  }

  function openDrawer() {
    if (!isVisible(shell.drawerBar)) return;
    lastFocused = document.activeElement;
    open = true;
    syncDrawerFromState(state, shell);
    setDrawerPosition(shell);
    shell.overlay.hidden = false;
    shell.overlay.classList.add('open');
    shell.drawer.classList.add('open');
    shell.drawer.setAttribute('aria-hidden', 'false');
    shell.trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('filter-drawer-open');
    shell.drawer.querySelector('.shop-results-select, .shop-results-chip, button')?.focus();
  }

  shell.trigger.addEventListener('click', openDrawer);
  shell.close.addEventListener('click', closeDrawer);
  shell.overlay.addEventListener('click', closeDrawer);
  shell.apply.addEventListener('click', () => {
    applyDrawerFilters(state, shell);
    onApply();
    closeDrawer();
  });
  shell.drawerClear.addEventListener('click', () => {
    shell.useSelect.value = '';
    shell.sortSelect.value = '';
    shell.drawerUseSelect.value = '';
    shell.drawerSortSelect.value = '';
    state.ailment = '';
    state.sort = '';
    state.activeStock = '';
    state.activeSafety = '';
    state.currentPage = 1;
    state.filtered = [...state.products];
    onApply();
    closeDrawer();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer();
  });
  window.addEventListener('resize', () => {
    if (open && !isVisible(shell.drawerBar)) closeDrawer();
    if (open) setDrawerPosition(shell);
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
  syncDrawerFromState(state, shell);

  const start = (state.currentPage - 1) * state.config.pageSize;
  const end = start + state.config.pageSize;
  const pageProducts = state.filtered.slice(start, end);

  shell.count.textContent = `${state.filtered.length} products`;
  shell.drawerCount.textContent = `${state.filtered.length} products`;
  shell.grid.textContent = '';

  if (!state.filtered.length) {
    shell.empty.classList.remove('hidden');
  } else {
    shell.empty.classList.add('hidden');
    pageProducts.forEach((product, index) => {
      const card = buildCard(product, state, index === 0);
      shell.grid.append(card);
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
  if (config.mode === 'featured') block.classList.add('featured');

  if (config.mode === 'featured') {
    try {
      const products = await loadProducts();
      renderFeatured(block, config, products);
    } catch (error) {
      // Keep the page usable if the JSON request fails.
      // eslint-disable-next-line no-console
      console.warn(error);
      renderError(block);
    }
    return;
  }

  const shell = buildShell(config);
  block.append(
    shell.filterBar,
    shell.drawerBar,
    shell.overlay,
    shell.drawer,
    shell.body,
    shell.pagination,
  );
  bindStickyFilter(block, [shell.filterBar, shell.drawerBar]);

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
      shell.drawerUseSelect.value = '';
      shell.drawerSortSelect.value = '';
      state.ailment = '';
      state.sort = '';
      state.activeStock = '';
      state.activeSafety = '';
      state.currentPage = 1;
      state.filtered = [...state.products];
      render(state, shell, block);
    });

    bindFilterDrawer(state, shell, () => render(state, shell, block));
    render(state, shell, block);
    updateCartBadge();
  } catch (error) {
    // Keep the page usable if the JSON request fails.
    // eslint-disable-next-line no-console
    console.warn(error);
    renderError(block);
  }
}
