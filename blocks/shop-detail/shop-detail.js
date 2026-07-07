const DATA_URL = '/data/herbs.json';
const REVIEWS_URL = '/data/reviews.json';
const MAIN_IMAGE_WIDTH = 600;
const THUMB_IMAGE_WIDTH = 180;

const DEFAULT_POLICIES = [
  ['Free Delivery', 'On orders above Rs.999'],
  ['No Returns', 'All sales are final'],
  ['100% Organic', 'Certified and tested'],
  ['Ships in 2-3 Days', 'Pan India delivery'],
];

function getCell(row, index) {
  return row?.children[index] || null;
}

function getText(cell) {
  return cell?.textContent.trim() || '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
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
    backText: 'Back to Shop',
    backLink: '/shop',
    detailBase: '/shop-detail',
    herbDetailBase: '/herb-detail',
    reviewsData: REVIEWS_URL,
    addButtonText: 'Add to Cart',
    buyNowText: 'Buy Now',
    addedText: 'Added to cart successfully.',
    buyNowMissingText: 'Product is unavailable right now.',
    checkoutPath: '/checkout',
    loginPath: '/login',
    selectWeightText: 'Select Weight',
    quantityText: 'Quantity',
    stockInText: 'In Stock - Ready to ship',
    stockOutText: 'Out of Stock',
    educationText: 'Read herb safety and dosage profile',
    benefitsTitle: 'Key Benefits',
    usageTitle: 'How to Use',
    reviewsTitle: 'Customer Reviews',
    writeReviewTitle: 'Write a Review',
    writeReviewText: 'Share your experience with this herb. Your review appears immediately.',
    reviewNamePlaceholder: 'Your name',
    reviewTextPlaceholder: 'Share your experience with this herb...',
    submitReviewText: 'Submit Review',
    reviewRequiredText: 'Please enter your name and review.',
    reviewRatingRequiredText: 'Please select a star rating.',
    reviewLoginText: 'Please sign in to write a review.',
    reviewSuccessText: 'Review submitted successfully.',
    safetyTitle: 'Safety Information',
    warningsTitle: 'Precautions',
    interactionsTitle: 'Drug Interactions',
    relatedTitle: 'Related Products',
    missingTitle: 'Product not found',
    missingText: 'Choose a product from the shop page.',
    policies: [],
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    if (key === 'back-link-text' || key === 'back-text') {
      config.backText = value || config.backText;
      return;
    }

    if (key === 'back-link') {
      config.backLink = getHref(getCell(row, 1)) || config.backLink;
      return;
    }

    if (key === 'detail-base' || key === 'detail-link-base') {
      config.detailBase = getHref(getCell(row, 1)) || config.detailBase;
      return;
    }

    if (key === 'herb-detail-base' || key === 'education-link-base') {
      config.herbDetailBase = getHref(getCell(row, 1)) || config.herbDetailBase;
      return;
    }

    if (key === 'reviews-data') {
      config.reviewsData = getHref(getCell(row, 1)) || config.reviewsData;
      return;
    }

    if (key === 'add-button-text') {
      config.addButtonText = value || config.addButtonText;
      return;
    }

    if (key === 'buy-now-text') {
      config.buyNowText = value || config.buyNowText;
      return;
    }

    if (key === 'added-text') {
      config.addedText = value || config.addedText;
      return;
    }

    if (key === 'buy-now-missing-text') {
      config.buyNowMissingText = value || config.buyNowMissingText;
      return;
    }

    if (key === 'checkout-path') {
      config.checkoutPath = getHref(getCell(row, 1)) || config.checkoutPath;
      return;
    }

    if (key === 'login-path') {
      config.loginPath = getHref(getCell(row, 1)) || config.loginPath;
      return;
    }

    if (key === 'select-weight-text') {
      config.selectWeightText = value || config.selectWeightText;
      return;
    }

    if (key === 'quantity-text') {
      config.quantityText = value || config.quantityText;
      return;
    }

    if (key === 'stock-in-text') {
      config.stockInText = value || config.stockInText;
      return;
    }

    if (key === 'stock-out-text') {
      config.stockOutText = value || config.stockOutText;
      return;
    }

    if (key === 'education-text') {
      config.educationText = value || config.educationText;
      return;
    }

    if (key === 'benefits-title') {
      config.benefitsTitle = value || config.benefitsTitle;
      return;
    }

    if (key === 'usage-title') {
      config.usageTitle = value || config.usageTitle;
      return;
    }

    if (key === 'reviews-title') {
      config.reviewsTitle = value || config.reviewsTitle;
      return;
    }

    if (key === 'write-review-title') {
      config.writeReviewTitle = value || config.writeReviewTitle;
      return;
    }

    if (key === 'write-review-text') {
      config.writeReviewText = value || config.writeReviewText;
      return;
    }

    if (key === 'review-name-placeholder') {
      config.reviewNamePlaceholder = value || config.reviewNamePlaceholder;
      return;
    }

    if (key === 'review-text-placeholder') {
      config.reviewTextPlaceholder = value || config.reviewTextPlaceholder;
      return;
    }

    if (key === 'submit-review-text') {
      config.submitReviewText = value || config.submitReviewText;
      return;
    }

    if (key === 'safety-title') {
      config.safetyTitle = value || config.safetyTitle;
      return;
    }

    if (key === 'warnings-title') {
      config.warningsTitle = value || config.warningsTitle;
      return;
    }

    if (key === 'interactions-title') {
      config.interactionsTitle = value || config.interactionsTitle;
      return;
    }

    if (key === 'related-title') {
      config.relatedTitle = value || config.relatedTitle;
      return;
    }

    if (key === 'missing-title') {
      config.missingTitle = value || config.missingTitle;
      return;
    }

    if (key === 'missing-text') {
      config.missingText = value || config.missingText;
      return;
    }

    if (key === 'policy') {
      const title = value;
      const text = getText(getCell(row, 2));
      if (title || text) config.policies.push([title, text]);
    }
  });

  if (!config.policies.length) config.policies = DEFAULT_POLICIES;
  return config;
}

async function loadProducts() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Unable to load ${DATA_URL}`);
  const products = await response.json();
  return Array.isArray(products) ? products : [];
}

async function loadReviews(id, dataUrl) {
  try {
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`Unable to load ${dataUrl}`);
    const reviewData = await response.json();
    const group = Array.isArray(reviewData)
      ? reviewData.find((item) => item.herb_id === id)
      : null;
    return group ? group.reviews : [];
  } catch {
    return [];
  }
}

function getCurrentId() {
  const id = parseInt(new URLSearchParams(window.location.search).get('id'), 10);
  return Number.isFinite(id) ? id : null;
}

function getRequestedWeight() {
  return new URLSearchParams(window.location.search).get('weight') || '';
}

function prefixPath(path) {
  if (!path || /^(https?:|data:|\/)/.test(path)) return path;
  return `/${path}`;
}

function getOptimizedImageUrl(src, width) {
  if (!src) return '';
  if (src.startsWith('data:')) return src;

  const url = src.startsWith('http')
    ? new URL(src)
    : new URL(prefixPath(src), window.location.href);
  return `${url.origin}${url.pathname}?width=${width}&format=webp&optimize=medium`;
}

function getSlug(product) {
  return product.image.split('/').pop().replace(/\.(jpg|png|webp)$/i, '');
}

function getGalleryImages(product) {
  const slug = getSlug(product);
  return [
    `/images/shop/${slug}-product.webp`,
    `/images/shop/${slug}-pack.webp`,
    prefixPath(product.image),
    `/images/shop/${slug}-use.webp`,
  ];
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
  if (!product || !product.weights?.length) return product ? product.price : 0;

  const baseWeight = product.weights[0];
  const baseAmount = getWeightValue(baseWeight);
  const selectedAmount = getWeightValue(weight);
  if (!baseAmount || !selectedAmount) return product.price;

  const weightRatio = selectedAmount / baseAmount;
  const linearPrice = product.price * weightRatio;
  const discountedPrice = linearPrice * (1 - getBulkDiscount(weightRatio));
  return Math.max(product.price, Math.round(discountedPrice));
}

function getProductHref(product, detailBase, weight) {
  const separator = detailBase.includes('?') ? '&' : '?';
  return `${detailBase}${separator}id=${encodeURIComponent(product.id)}&weight=${encodeURIComponent(weight)}`;
}

function getHerbDetailHref(product, herbDetailBase) {
  const separator = herbDetailBase.includes('?') ? '&' : '?';
  return `${herbDetailBase}${separator}id=${encodeURIComponent(product.id)}`;
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
  badge.textContent = getCartItems().reduce((sum, item) => sum + (item.qty || 0), 0);
}

function addToCart(product, weight, quantity) {
  const cart = getCartItems();
  const price = getPriceForWeight(product, weight);
  const existing = cart.find((item) => item.id === product.id && item.weight === weight);

  if (existing) {
    existing.qty += quantity;
    existing.price = price;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      image: product.image,
      price,
      weight,
      qty: quantity,
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function showToast(message, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
  }
}

function queueToast(message, type = 'info') {
  if (typeof window.queueToast === 'function') {
    window.queueToast(message, type);
  } else {
    showToast(message, type);
  }
}

function buildDirectCheckoutItem(product, weight, quantity) {
  return {
    id: product.id,
    name: product.name,
    image: product.image,
    price: getPriceForWeight(product, weight),
    weight,
    qty: quantity,
  };
}

function getDirectCheckoutHref(config) {
  const separator = config.checkoutPath.includes('?') ? '&' : '?';
  return `${config.checkoutPath}${separator}mode=direct`;
}

function buyNow(product, state, config) {
  if (!product?.stock || !state.selectedWeight) {
    showToast(config.buyNowMissingText, 'error');
    return;
  }

  const directItem = buildDirectCheckoutItem(product, state.selectedWeight, state.quantity);
  sessionStorage.setItem('directCheckoutItem', JSON.stringify(directItem));

  const checkoutHref = getDirectCheckoutHref(config);
  if (localStorage.getItem('loggedIn') !== 'true') {
    queueToast('Please sign in to continue to checkout.', 'warning');
    window.location.href = `${config.loginPath}?return=${encodeURIComponent(checkoutHref)}`;
    return;
  }

  window.location.href = checkoutHref;
}

function getFallbackReviews(product) {
  return [
    {
      name: 'Verified Customer',
      rating: 5,
      review: `${product.name} arrived fresh, well packed and easy to use. The quality felt premium compared with regular store products.`,
      date: 'Jan 2024',
      verified: true,
    },
    {
      name: 'HerbAtlas Buyer',
      rating: 4,
      review: `Good product for ${product.best_for.toLowerCase()}. Clear instructions and quick delivery made the purchase smooth.`,
      date: 'Feb 2024',
      verified: true,
    },
    {
      name: 'Repeat Buyer',
      rating: 5,
      review: `I liked the aroma, packaging and overall quality. I would buy ${product.name} again.`,
      date: 'Mar 2024',
      verified: true,
    },
  ];
}

function getReviewTimestamp(review) {
  if (review.createdAt) {
    const timestamp = Date.parse(review.createdAt);
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  if (review.date) {
    const timestamp = Date.parse(`1 ${review.date}`);
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  return 0;
}

function getLocalReviews(product) {
  try {
    const reviews = JSON.parse(localStorage.getItem(`reviews-${product.id}`) || '[]');
    return Array.isArray(reviews) ? reviews : [];
  } catch {
    return [];
  }
}

function saveLocalReviews(product, reviews) {
  localStorage.setItem(`reviews-${product.id}`, JSON.stringify(reviews));
}

function getAllReviews(product, seededReviews) {
  const seeded = seededReviews.length ? seededReviews : getFallbackReviews(product);
  return [
    ...seeded.map((review) => ({ ...review, isLocal: false })),
    ...getLocalReviews(product).map((review) => ({ ...review, isLocal: true })),
  ].sort((a, b) => getReviewTimestamp(b) - getReviewTimestamp(a));
}

function getAverageRating(reviews, product) {
  if (!reviews.length) return product.rating ? product.rating.toFixed(1) : '0.0';
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

function getStars(rating) {
  const value = Math.round(rating);
  return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`;
}

function getReviewDate() {
  return new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function normalizeMatchValues(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  }
  if (typeof value === 'string') return value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  return [];
}

function getRelatedProducts(product, products) {
  const currentTerms = new Set([
    ...normalizeMatchValues(product.ailments),
    ...normalizeMatchValues(product.best_for),
  ]);

  return products
    .filter((item) => item.id !== product.id)
    .map((item) => {
      const itemTerms = [
        ...normalizeMatchValues(item.ailments),
        ...normalizeMatchValues(item.best_for),
      ];
      const sharedCount = itemTerms.filter((term) => currentTerms.has(term)).length;
      return { item, sharedCount };
    })
    .filter(({ sharedCount }) => sharedCount > 0)
    .sort((a, b) => b.sharedCount - a.sharedCount || a.item.name.localeCompare(b.item.name))
    .slice(0, 4)
    .map(({ item }) => item);
}

function buildImage(src, alt, fallback, width = THUMB_IMAGE_WIDTH, priority = false) {
  const image = document.createElement('img');
  image.src = getOptimizedImageUrl(src, width);
  image.alt = alt;
  image.decoding = 'async';
  if (priority) {
    image.fetchPriority = 'high';
  } else {
    image.loading = 'lazy';
  }
  image.addEventListener('error', () => {
    image.src = getOptimizedImageUrl(fallback, width);
  }, { once: true });
  return image;
}

function buildGallery(product, state) {
  const gallery = document.createElement('div');
  gallery.className = 'shop-detail-gallery';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'shop-detail-main-image';

  const fallback = prefixPath(product.image);
  const mainImage = buildImage(
    state.galleryImages[state.imageIndex],
    product.name,
    fallback,
    MAIN_IMAGE_WIDTH,
    true,
  );
  mainImage.id = 'shopDetailMainImage';
  imageWrap.append(mainImage);

  const prev = document.createElement('button');
  prev.className = 'shop-detail-gallery-arrow prev';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous image');
  prev.textContent = '‹';

  const next = document.createElement('button');
  next.className = 'shop-detail-gallery-arrow next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Next image');
  next.textContent = '›';

  const updateImage = (index) => {
    state.imageIndex = (index + state.galleryImages.length) % state.galleryImages.length;
    mainImage.src = getOptimizedImageUrl(state.galleryImages[state.imageIndex], MAIN_IMAGE_WIDTH);
    gallery.querySelectorAll('.shop-detail-thumbnail').forEach((button, idx) => {
      button.classList.toggle('active', idx === state.imageIndex);
    });
  };

  prev.addEventListener('click', () => updateImage(state.imageIndex - 1));
  next.addEventListener('click', () => updateImage(state.imageIndex + 1));
  imageWrap.append(prev, next);

  const thumbs = document.createElement('div');
  thumbs.className = 'shop-detail-thumbnails';

  state.galleryImages.forEach((src, index) => {
    const thumb = document.createElement('button');
    thumb.className = index === state.imageIndex
      ? 'shop-detail-thumbnail active'
      : 'shop-detail-thumbnail';
    thumb.type = 'button';
    thumb.setAttribute('aria-label', `View image ${index + 1}`);
    thumb.append(buildImage(src, `${product.name} thumbnail ${index + 1}`, fallback, THUMB_IMAGE_WIDTH));
    thumb.addEventListener('click', () => updateImage(index));
    thumbs.append(thumb);
  });

  gallery.append(imageWrap, thumbs);
  return gallery;
}

function updatePrice(state) {
  const price = getPriceForWeight(state.product, state.selectedWeight);
  state.priceEl.textContent = `Rs.${price}`;
  state.noteEl.textContent = `Price for ${state.selectedWeight} - Inclusive of all taxes`;
}

function buildHero(product, state, config, reviews) {
  const hero = document.createElement('section');
  hero.className = 'shop-detail-hero';

  const content = document.createElement('div');
  content.className = 'shop-detail-content';

  const back = document.createElement('a');
  back.className = 'shop-detail-back';
  back.href = config.backLink;
  back.textContent = config.backText;
  content.append(back);

  const title = document.createElement('h1');
  title.textContent = product.name;
  content.append(title);

  const sci = document.createElement('span');
  sci.className = 'shop-detail-sci';
  sci.textContent = product.scientific_name;
  content.append(sci);

  const description = document.createElement('p');
  description.className = 'shop-detail-description';
  description.textContent = product.description;
  content.append(description);

  const rating = document.createElement('div');
  rating.className = 'shop-detail-rating-row';
  const avg = getAverageRating(reviews, product);
  rating.innerHTML = `
    <span class="shop-detail-stars">${getStars(parseFloat(avg))}</span>
    <span class="shop-detail-rating-num">${avg}</span>
    <span class="shop-detail-review-count">(${reviews.length} reviews)</span>
  `;
  content.append(rating);

  state.priceEl = document.createElement('div');
  state.priceEl.className = 'shop-detail-price';
  content.append(state.priceEl);

  state.noteEl = document.createElement('span');
  state.noteEl.className = 'shop-detail-price-note';
  content.append(state.noteEl);

  const label = document.createElement('span');
  label.className = 'shop-detail-weight-label';
  label.textContent = config.selectWeightText;
  content.append(label);

  const weightOptions = document.createElement('div');
  weightOptions.className = 'shop-detail-weight-options';
  product.weights.forEach((weight) => {
    const button = document.createElement('button');
    button.className = weight === state.selectedWeight
      ? 'shop-detail-weight-option active'
      : 'shop-detail-weight-option';
    button.type = 'button';
    button.textContent = weight;
    button.addEventListener('click', () => {
      state.selectedWeight = weight;
      weightOptions.querySelectorAll('.shop-detail-weight-option').forEach((item) => {
        item.classList.toggle('active', item === button);
      });
      updatePrice(state);
    });
    weightOptions.append(button);
  });
  content.append(weightOptions);

  const qty = document.createElement('div');
  qty.className = 'shop-detail-qty-row';

  const qtyLabel = document.createElement('span');
  qtyLabel.className = 'shop-detail-qty-label';
  qtyLabel.textContent = config.quantityText;

  const qtyMinus = document.createElement('button');
  qtyMinus.className = 'shop-detail-qty-btn';
  qtyMinus.type = 'button';
  qtyMinus.textContent = '-';

  const qtyNum = document.createElement('span');
  qtyNum.className = 'shop-detail-qty-num';
  qtyNum.textContent = state.quantity;

  const qtyPlus = document.createElement('button');
  qtyPlus.className = 'shop-detail-qty-btn';
  qtyPlus.type = 'button';
  qtyPlus.textContent = '+';

  const changeQty = (change) => {
    state.quantity = Math.max(1, state.quantity + change);
    qtyNum.textContent = state.quantity;
  };
  qtyMinus.addEventListener('click', () => changeQty(-1));
  qtyPlus.addEventListener('click', () => changeQty(1));
  qty.append(qtyLabel, qtyMinus, qtyNum, qtyPlus);
  content.append(qty);

  const success = document.createElement('div');
  success.className = 'shop-detail-success';
  success.textContent = config.addedText;
  content.append(success);

  const buttonRow = document.createElement('div');
  buttonRow.className = 'shop-detail-button-row';

  const addButton = document.createElement('button');
  addButton.className = 'shop-detail-add-btn';
  addButton.type = 'button';
  addButton.textContent = product.stock ? config.addButtonText : config.stockOutText;
  addButton.disabled = !product.stock;
  addButton.addEventListener('click', () => {
    addToCart(product, state.selectedWeight, state.quantity);
    success.classList.add('visible');
    showToast(`${product.name} ${state.selectedWeight} added to your cart.`, 'success');
    setTimeout(() => success.classList.remove('visible'), 2200);
  });
  buttonRow.append(addButton);

  const buyButton = document.createElement('button');
  buyButton.className = 'shop-detail-buy-btn';
  buyButton.type = 'button';
  buyButton.textContent = product.stock ? config.buyNowText : config.stockOutText;
  buyButton.disabled = !product.stock;
  buyButton.addEventListener('click', () => buyNow(product, state, config));
  buttonRow.append(buyButton);
  content.append(buttonRow);

  const stock = document.createElement('p');
  stock.className = product.stock ? 'shop-detail-stock in' : 'shop-detail-stock out';
  stock.textContent = product.stock ? config.stockInText : config.stockOutText;
  content.append(stock);

  const education = document.createElement('a');
  education.className = 'shop-detail-education-link';
  education.href = getHerbDetailHref(product, config.herbDetailBase);
  education.textContent = config.educationText;
  content.append(education);

  hero.append(buildGallery(product, state), content);
  updatePrice(state);
  return hero;
}

function buildPolicy(config) {
  const policy = document.createElement('section');
  policy.className = 'shop-detail-policy';

  config.policies.forEach(([titleText, bodyText]) => {
    const item = document.createElement('div');
    item.className = 'shop-detail-policy-item';

    const title = document.createElement('h2');
    title.textContent = titleText;

    const body = document.createElement('p');
    body.textContent = bodyText;

    item.append(title, body);
    policy.append(item);
  });

  return policy;
}

function buildInfo(product, config) {
  const info = document.createElement('section');
  info.className = 'shop-detail-info';

  const grid = document.createElement('div');
  grid.className = 'shop-detail-info-grid';

  const benefits = document.createElement('div');
  benefits.className = 'shop-detail-info-section';
  const benefitsTitle = document.createElement('h2');
  benefitsTitle.textContent = config.benefitsTitle;
  const list = document.createElement('ul');
  list.className = 'shop-detail-benefits-list';
  (product.uses || []).forEach((use) => {
    const item = document.createElement('li');
    item.textContent = use;
    list.append(item);
  });
  benefits.append(benefitsTitle, list);

  const usage = document.createElement('div');
  usage.className = 'shop-detail-info-section';
  const usageTitle = document.createElement('h2');
  usageTitle.textContent = config.usageTitle;
  const cards = document.createElement('div');
  cards.className = 'shop-detail-usage-cards';
  Object.entries(product.dosage || {}).forEach(([method, instruction]) => {
    const card = document.createElement('article');
    card.className = 'shop-detail-usage-card';
    const title = document.createElement('h3');
    title.textContent = method.replace(/[_-]+/g, ' ');
    const text = document.createElement('p');
    text.textContent = instruction;
    card.append(title, text);
    cards.append(card);
  });
  usage.append(usageTitle, cards);

  const safety = document.createElement('div');
  safety.className = 'shop-detail-info-section shop-detail-safety-section';
  const safetyTitle = document.createElement('h2');
  safetyTitle.textContent = config.safetyTitle;

  const safetyGrid = document.createElement('div');
  safetyGrid.className = 'shop-detail-safety-grid';

  const safetyBadge = document.createElement('div');
  safetyBadge.className = `shop-detail-safety-card safety-${product.safety}`;
  const safetyBadgeTitle = document.createElement('h3');
  safetyBadgeTitle.textContent = 'Product Safety';
  const safetyBadgeText = document.createElement('p');
  safetyBadgeText.textContent = getSafetyLabel(product.safety);
  safetyBadge.append(safetyBadgeTitle, safetyBadgeText);
  safetyGrid.append(safetyBadge);

  [
    [config.warningsTitle, product.warnings || []],
    [config.interactionsTitle, product.drug_interactions || []],
  ].forEach(([titleText, items]) => {
    if (!items.length) return;
    const card = document.createElement('div');
    card.className = 'shop-detail-safety-card';
    const title = document.createElement('h3');
    title.textContent = titleText;
    const safetyList = document.createElement('ul');
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      safetyList.append(li);
    });
    card.append(title, safetyList);
    safetyGrid.append(card);
  });

  safety.append(safetyTitle, safetyGrid);

  grid.append(benefits, usage, safety);
  info.append(grid);
  return info;
}

function buildReviewCard(review) {
  const card = document.createElement('article');
  card.className = review.isLocal
    ? 'shop-detail-review-card new-review'
    : 'shop-detail-review-card';
  card.innerHTML = `
    <div class="shop-detail-review-top">
      <span class="shop-detail-reviewer-name">${escapeHtml(review.name)}</span>
      <span class="shop-detail-review-date">${escapeHtml(review.date || 'Just now')}</span>
    </div>
    <div class="shop-detail-review-stars">${getStars(review.rating)}</div>
    <p class="shop-detail-review-text">${escapeHtml(review.review)}</p>
    <span class="${review.isLocal ? 'shop-detail-new-badge' : 'shop-detail-verified-badge'}">
      ${review.isLocal ? 'New Review' : 'Verified Buyer'}
    </span>
  `;
  return card;
}

function buildStarSelector(getSelectedRating, setSelectedRating) {
  const starSelect = document.createElement('div');
  starSelect.className = 'shop-detail-star-select';

  const updateStars = () => {
    starSelect.querySelectorAll('button').forEach((button, index) => {
      button.classList.toggle('active', index < getSelectedRating());
    });
  };

  [1, 2, 3, 4, 5].forEach((value) => {
    const button = document.createElement('button');
    button.className = 'shop-detail-star-btn';
    button.type = 'button';
    button.setAttribute('aria-label', `${value} star`);
    button.innerHTML = '&#9733;';
    button.addEventListener('click', () => {
      setSelectedRating(value);
      updateStars();
    });
    starSelect.append(button);
  });

  updateStars();
  return starSelect;
}

function buildReviews(product, seededReviews, config) {
  const section = document.createElement('section');
  section.className = 'shop-detail-reviews';

  let reviews = getAllReviews(product, seededReviews);
  let selectedRating = 0;

  const header = document.createElement('div');
  header.className = 'shop-detail-reviews-header';

  const grid = document.createElement('div');
  grid.className = 'shop-detail-reviews-grid';

  const renderSummary = () => {
    const avg = getAverageRating(reviews, product);
    header.innerHTML = `
      <div class="shop-detail-reviews-title">
        <h2>${escapeHtml(config.reviewsTitle)}</h2>
        <p>${reviews.length} reviews for ${escapeHtml(product.name)}</p>
      </div>
      <div class="shop-detail-overall-rating">
        <div class="shop-detail-overall-num">${avg}</div>
        <div>
          <span class="shop-detail-overall-stars">${getStars(parseFloat(avg))}</span>
          <span class="shop-detail-overall-count">${reviews.length} reviews</span>
        </div>
      </div>
    `;
  };

  const renderGrid = () => {
    grid.textContent = '';
    reviews.forEach((review) => grid.append(buildReviewCard(review)));
  };

  const form = document.createElement('form');
  form.className = 'shop-detail-write-review';
  form.noValidate = true;

  const loggedIn = localStorage.getItem('loggedIn') === 'true';
  const savedName = localStorage.getItem('userName') || '';

  const title = document.createElement('h3');
  title.textContent = config.writeReviewTitle;

  const intro = document.createElement('p');
  intro.textContent = config.writeReviewText.replace('{product}', product.name);

  const starSelect = buildStarSelector(
    () => selectedRating,
    (value) => { selectedRating = value; },
  );

  const nameInput = document.createElement('input');
  nameInput.className = 'shop-detail-review-input';
  nameInput.id = 'reviewName';
  nameInput.name = 'reviewName';
  nameInput.placeholder = config.reviewNamePlaceholder;
  nameInput.type = 'text';
  nameInput.value = savedName;
  if (loggedIn && savedName) {
    nameInput.readOnly = true;
    nameInput.classList.add('readonly');
  }

  const textInput = document.createElement('textarea');
  textInput.className = 'shop-detail-review-textarea';
  textInput.id = 'reviewText';
  textInput.name = 'reviewText';
  textInput.placeholder = config.reviewTextPlaceholder;

  const error = document.createElement('p');
  error.className = 'shop-detail-review-error';
  error.hidden = true;

  const submit = document.createElement('button');
  submit.className = 'shop-detail-submit-review-btn';
  submit.type = 'submit';
  submit.textContent = config.submitReviewText;

  const showError = (message) => {
    error.textContent = message;
    error.hidden = false;
    showToast(message, 'error');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (localStorage.getItem('loggedIn') !== 'true') {
      queueToast(config.reviewLoginText, 'warning');
      window.location.href = `${config.loginPath}?return=${encodeURIComponent(window.location.href)}`;
      return;
    }

    const name = nameInput.value.trim();
    const review = textInput.value.trim();

    if (!name || !review) {
      showError(config.reviewRequiredText);
      return;
    }

    if (!selectedRating) {
      showError(config.reviewRatingRequiredText);
      return;
    }

    const localReviews = getLocalReviews(product);
    localReviews.push({
      name,
      rating: selectedRating,
      review,
      date: getReviewDate(),
      createdAt: new Date().toISOString(),
      verified: false,
    });
    saveLocalReviews(product, localReviews);

    reviews = getAllReviews(product, seededReviews);
    selectedRating = 0;
    textInput.value = '';
    error.hidden = true;
    starSelect.querySelectorAll('button').forEach((button) => button.classList.remove('active'));
    renderSummary();
    renderGrid();
    showToast(config.reviewSuccessText, 'success');
  });

  form.append(title, intro, starSelect, nameInput, textInput, error, submit);

  renderSummary();
  renderGrid();
  section.append(header, grid, form);
  return section;
}

function buildRelatedCard(product, config) {
  const weight = getCardWeight(product);
  const price = getPriceForWeight(product, weight);
  const href = getProductHref(product, config.detailBase, weight);

  const card = document.createElement('a');
  card.className = 'shop-detail-related-card';
  card.href = href;

  const imageWrap = document.createElement('span');
  imageWrap.className = 'shop-detail-related-img';
  imageWrap.append(buildImage(
    `/images/shop/${getSlug(product)}-product.webp`,
    product.name,
    prefixPath(product.image),
    THUMB_IMAGE_WIDTH,
  ));

  const badge = document.createElement('span');
  badge.className = 'shop-detail-related-badge';
  badge.textContent = `Rs.${price}`;
  imageWrap.append(badge);

  const body = document.createElement('span');
  body.className = 'shop-detail-related-body';
  body.innerHTML = `
    <strong>${product.name}</strong>
    <span class="shop-detail-related-sci">${product.scientific_name}</span>
    <span>${product.best_for}</span>
    <span class="shop-detail-related-tags">
      <span>${weight}</span>
      <span>${getSafetyLabel(product.safety)}</span>
    </span>
  `;

  card.append(imageWrap, body);
  return card;
}

function buildRelated(product, products, config) {
  const section = document.createElement('section');
  section.className = 'shop-detail-related';

  const title = document.createElement('h2');
  title.innerHTML = config.relatedTitle.includes('<')
    ? config.relatedTitle
    : config.relatedTitle.replace('Products', '<em>Products</em>');

  const grid = document.createElement('div');
  grid.className = 'shop-detail-related-grid';
  getRelatedProducts(product, products).forEach((related) => {
    grid.append(buildRelatedCard(related, config));
  });

  section.append(title, grid);
  return section;
}

function buildMissing(config) {
  const missing = document.createElement('div');
  missing.className = 'shop-detail-missing';

  const title = document.createElement('h1');
  title.textContent = config.missingTitle;

  const text = document.createElement('p');
  text.textContent = config.missingText;

  const link = document.createElement('a');
  link.href = config.backLink;
  link.textContent = config.backText;

  missing.append(title, text, link);
  return missing;
}

export default async function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  try {
    const products = await loadProducts();
    const id = getCurrentId();
    const product = products.find((item) => item.id === id);

    if (!product) {
      block.append(buildMissing(config));
      return;
    }

    const requestedWeight = getRequestedWeight();
    const selectedWeight = product.weights.includes(requestedWeight)
      ? requestedWeight
      : product.weights[0];
    const seededReviews = await loadReviews(product.id, config.reviewsData);
    const reviews = getAllReviews(product, seededReviews);
    const state = {
      product,
      selectedWeight,
      quantity: 1,
      galleryImages: getGalleryImages(product),
      imageIndex: 0,
      priceEl: null,
      noteEl: null,
    };

    document.title = `${product.name} - HerbAtlas Shop`;

    block.append(
      buildHero(product, state, config, reviews),
      buildPolicy(config),
      buildInfo(product, config),
      buildReviews(product, seededReviews, config),
      buildRelated(product, products, config),
    );
    updateCartBadge();
  } catch (error) {
    // Keep authoring and preview usable if product data is temporarily unavailable.
    block.append(buildMissing({
      ...config,
      missingTitle: 'Unable to load product details',
      missingText: error.message,
    }));
  }
}
