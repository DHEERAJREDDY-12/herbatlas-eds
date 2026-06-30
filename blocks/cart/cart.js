const DEFAULT_COUPONS = {
  HERB10: { type: 'percentage', value: 10, label: '10% off' },
};

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
    emptyTitle: 'Your cart is empty',
    emptyText: 'Looks like you have not added any herbs yet.',
    emptyCtaText: 'Browse Shop',
    emptyCtaLink: '/shop',
    detailBase: '/shop-detail',
    checkoutLink: '/checkout',
    loginLink: '/login',
    couponTitle: 'Have a coupon?',
    couponAvailableLabel: 'Available offer',
    couponCode: 'HERB10',
    couponValue: '10% off',
    couponPlaceholder: 'e.g. HERB10',
    couponApplyText: 'Apply',
    couponAppliedLabel: 'applied',
    summaryTitle: 'Order Summary',
    subtotalLabel: 'Subtotal',
    discountLabel: 'Discount',
    shippingLabel: 'Shipping',
    taxLabel: 'GST (5%)',
    totalLabel: 'Total',
    checkoutText: 'Proceed to Checkout',
    secureNote: 'Secure checkout - SSL encrypted',
    freeShippingText: 'Great news! You qualify for free shipping on this order.',
    certifiedText: 'Certified Organic',
    removeText: 'Remove',
    couponAlreadyText: 'Coupon already applied.',
    couponEmptyText: 'Please enter a coupon code.',
    couponInvalidText: 'Invalid coupon code.',
    couponSuccessText: 'Coupon applied successfully.',
    couponRemovedText: 'Coupon removed successfully.',
    checkoutLoginText: 'Please sign in to proceed to checkout.',
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    if (key === 'empty-title') {
      config.emptyTitle = value || config.emptyTitle;
      return;
    }

    if (key === 'empty-text') {
      config.emptyText = value || config.emptyText;
      return;
    }

    if (key === 'empty-cta-text') {
      config.emptyCtaText = value || config.emptyCtaText;
      return;
    }

    if (key === 'empty-cta-link') {
      config.emptyCtaLink = getHref(getCell(row, 1)) || config.emptyCtaLink;
      return;
    }

    if (key === 'detail-base' || key === 'detail-link-base') {
      config.detailBase = getHref(getCell(row, 1)) || config.detailBase;
      return;
    }

    if (key === 'checkout-link') {
      config.checkoutLink = getHref(getCell(row, 1)) || config.checkoutLink;
      return;
    }

    if (key === 'login-link') {
      config.loginLink = getHref(getCell(row, 1)) || config.loginLink;
      return;
    }

    [
      'coupon-title',
      'coupon-available-label',
      'coupon-code',
      'coupon-value',
      'coupon-placeholder',
      'coupon-apply-text',
      'coupon-applied-label',
      'summary-title',
      'subtotal-label',
      'discount-label',
      'shipping-label',
      'tax-label',
      'total-label',
      'checkout-text',
      'secure-note',
      'free-shipping-text',
      'certified-text',
      'remove-text',
      'coupon-already-text',
      'coupon-empty-text',
      'coupon-invalid-text',
      'coupon-success-text',
      'coupon-removed-text',
      'checkout-login-text',
    ].forEach((fieldKey) => {
      if (key !== fieldKey) return;
      const prop = fieldKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      config[prop] = value || config[prop];
    });
  });

  return config;
}

function getCoupons() {
  return window.COUPONS || DEFAULT_COUPONS;
}

function getCartItems() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function getActiveCoupon() {
  const activeCoupon = localStorage.getItem('appliedCoupon') || '';
  if (activeCoupon && !getCoupons()[activeCoupon]) {
    localStorage.removeItem('appliedCoupon');
    return '';
  }
  return activeCoupon;
}

function calcDiscount(subtotal, couponCode) {
  if (!couponCode) return 0;
  const coupon = getCoupons()[couponCode];
  if (!coupon) return 0;
  if (coupon.type === 'percentage') return Math.round((subtotal * coupon.value) / 100);
  if (coupon.type === 'fixed') return Math.min(coupon.value, subtotal);
  return 0;
}

function calcTotals(cart, couponCode) {
  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0);
  const discount = calcDiscount(subtotal, couponCode);
  const discounted = subtotal - discount;
  const shipping = discounted >= 999 ? 0 : 99;
  const tax = Math.round(discounted * 0.05);
  const total = discounted + shipping + tax;
  return {
    itemCount,
    subtotal,
    discount,
    shipping,
    tax,
    total,
  };
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const total = getCartItems().reduce((sum, item) => sum + (item.qty || 0), 0);
  badge.textContent = total;
}

function getProductImage(item) {
  if (!item.image) return '';
  if (item.image.includes('images/herbs/')) {
    const name = item.image.split('/').pop().replace(/\.(jpg|png|webp)$/i, '');
    return `/images/shop/${name}-pack.webp`;
  }
  if (/^(https?:|data:|\/)/.test(item.image)) return item.image;
  return `/${item.image}`;
}

function getDetailHref(item, detailBase) {
  const separator = detailBase.includes('?') ? '&' : '?';
  return `${detailBase}${separator}id=${encodeURIComponent(item.id)}&weight=${encodeURIComponent(item.weight)}`;
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

function buildEmpty(config) {
  const empty = document.createElement('div');
  empty.className = 'cart-empty hidden';

  const title = document.createElement('h3');
  title.textContent = config.emptyTitle;

  const text = document.createElement('p');
  text.textContent = config.emptyText;

  const link = document.createElement('a');
  link.className = 'cart-empty-link';
  link.href = config.emptyCtaLink;
  link.textContent = config.emptyCtaText;

  empty.append(title, text, link);
  return empty;
}

function buildCouponPanel(config) {
  const panel = document.createElement('div');
  panel.className = 'cart-coupon-panel';

  const title = document.createElement('p');
  title.className = 'cart-coupon-panel-title';
  title.textContent = config.couponTitle;

  const available = document.createElement('div');
  available.className = 'cart-coupon-available';

  const availableLabel = document.createElement('span');
  availableLabel.className = 'cart-coupon-available-label';
  availableLabel.textContent = config.couponAvailableLabel;

  const availableCard = document.createElement('button');
  availableCard.className = 'cart-coupon-available-card';
  availableCard.type = 'button';
  availableCard.dataset.couponCode = config.couponCode;
  availableCard.innerHTML = `
    <span class="cart-coupon-available-code">${config.couponCode}</span>
    <span class="cart-coupon-available-value">${config.couponValue}</span>
  `;

  available.append(availableLabel, availableCard);

  const form = document.createElement('form');
  form.className = 'cart-coupon-form';
  form.autocomplete = 'off';

  const label = document.createElement('label');
  label.className = 'cart-sr-only';
  label.htmlFor = 'cartCouponInput';
  label.textContent = 'Coupon code';

  const input = document.createElement('input');
  input.id = 'cartCouponInput';
  input.className = 'cart-coupon-input';
  input.type = 'text';
  input.maxLength = 20;
  input.placeholder = config.couponPlaceholder;
  input.spellcheck = false;

  const apply = document.createElement('button');
  apply.className = 'cart-coupon-apply-btn';
  apply.type = 'submit';
  apply.textContent = config.couponApplyText;

  form.append(label, input, apply);

  const msg = document.createElement('div');
  msg.className = 'cart-coupon-msg';
  msg.setAttribute('role', 'status');
  msg.setAttribute('aria-live', 'polite');

  const applied = document.createElement('div');
  applied.className = 'cart-coupon-applied hidden';

  const tag = document.createElement('span');
  tag.className = 'cart-coupon-applied-tag';

  const appliedCode = document.createElement('span');
  appliedCode.className = 'cart-coupon-applied-code';

  const remove = document.createElement('button');
  remove.className = 'cart-coupon-remove-btn';
  remove.type = 'button';
  remove.setAttribute('aria-label', 'Remove coupon');
  remove.textContent = '×';

  const appliedLabel = document.createElement('span');
  appliedLabel.className = 'cart-coupon-applied-label';
  appliedLabel.textContent = config.couponAppliedLabel;

  tag.append(appliedCode, remove);
  applied.append(tag, appliedLabel);
  panel.append(title, available, form, msg, applied);

  return {
    panel,
    availableCard,
    form,
    input,
    apply,
    msg,
    applied,
    appliedCode,
    remove,
  };
}

function buildSummary(config) {
  const summary = document.createElement('aside');
  summary.className = 'cart-summary-card';

  const title = document.createElement('h2');
  title.textContent = config.summaryTitle;

  const rows = {};
  [
    ['subtotal', config.subtotalLabel],
    ['discount', config.discountLabel],
    ['shipping', config.shippingLabel],
    ['tax', config.taxLabel],
  ].forEach(([key, labelText]) => {
    const row = document.createElement('div');
    row.className = key === 'discount' ? 'cart-sum-row discount empty' : 'cart-sum-row';
    const label = document.createElement('span');
    label.textContent = labelText;
    const value = document.createElement('span');
    value.textContent = 'Rs.0';
    row.append(label, value);
    rows[key] = { row, label, value };
  });

  const total = document.createElement('div');
  total.className = 'cart-sum-total';
  const totalLabel = document.createElement('span');
  totalLabel.textContent = config.totalLabel;
  const totalValue = document.createElement('span');
  totalValue.textContent = 'Rs.0';
  total.append(totalLabel, totalValue);

  const checkout = document.createElement('button');
  checkout.className = 'cart-checkout-btn';
  checkout.type = 'button';
  checkout.disabled = true;
  checkout.textContent = config.checkoutText;

  const secure = document.createElement('div');
  secure.className = 'cart-secure-note';
  secure.textContent = config.secureNote;

  summary.append(
    title,
    rows.subtotal.row,
    rows.discount.row,
    rows.shipping.row,
    rows.tax.row,
    total,
    checkout,
    secure,
  );

  return {
    summary,
    rows,
    totalValue,
    checkout,
  };
}

function buildShell(config) {
  const body = document.createElement('div');
  body.className = 'cart-body-shell';

  const items = document.createElement('div');
  items.className = 'cart-items-list';

  const right = document.createElement('div');
  right.className = 'cart-right-col';
  const rightInner = document.createElement('div');
  rightInner.className = 'cart-right-inner';

  const coupon = buildCouponPanel(config);
  const summary = buildSummary(config);
  rightInner.append(coupon.panel, summary.summary);
  right.append(rightInner);
  body.append(items, right);

  const empty = buildEmpty(config);

  return {
    body,
    items,
    empty,
    coupon,
    summary,
  };
}

function buildCartItem(item, index, config, onChange) {
  const card = document.createElement('article');
  card.className = 'cart-item-card';

  card.addEventListener('click', () => {
    window.location.href = getDetailHref(item, config.detailBase);
  });

  const imageWrap = document.createElement('div');
  imageWrap.className = 'cart-item-img';

  const image = document.createElement('img');
  image.src = getProductImage(item);
  image.alt = item.name;
  image.width = 128;
  image.height = 128;
  if (index === 0) image.fetchPriority = 'high';
  else image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.style.display = 'none';
  }, { once: true });
  imageWrap.append(image);

  const info = document.createElement('div');
  info.className = 'cart-item-info';

  const title = document.createElement('h2');
  title.textContent = item.name;

  const meta = document.createElement('p');
  meta.textContent = `${item.weight} - ${config.certifiedText}`;

  const controls = document.createElement('div');
  controls.className = 'cart-controls';
  controls.addEventListener('click', (event) => event.stopPropagation());

  const minus = document.createElement('button');
  minus.className = 'cart-qty-btn';
  minus.type = 'button';
  minus.setAttribute('aria-label', 'Decrease quantity');
  minus.textContent = '-';
  minus.addEventListener('click', () => onChange(item, -1));

  const qty = document.createElement('span');
  qty.className = 'cart-qty-num';
  qty.textContent = item.qty;

  const plus = document.createElement('button');
  plus.className = 'cart-qty-btn';
  plus.type = 'button';
  plus.setAttribute('aria-label', 'Increase quantity');
  plus.textContent = '+';
  plus.addEventListener('click', () => onChange(item, 1));

  const remove = document.createElement('button');
  remove.className = 'cart-remove-btn';
  remove.type = 'button';
  remove.textContent = config.removeText;
  remove.addEventListener('click', () => onChange(item, 0, true));

  controls.append(minus, qty, plus, remove);
  info.append(title, meta, controls);

  const price = document.createElement('div');
  price.className = 'cart-item-price';
  price.textContent = `Rs.${(item.price || 0) * (item.qty || 0)}`;

  card.append(imageWrap, info, price);
  return card;
}

function renderCouponUI(shell, activeCoupon) {
  const {
    input,
    apply,
    applied,
    appliedCode,
  } = shell.coupon;

  if (activeCoupon) {
    input.value = activeCoupon;
    input.disabled = true;
    apply.disabled = true;
    appliedCode.textContent = activeCoupon;
    applied.classList.remove('hidden');
  } else {
    input.value = '';
    input.disabled = false;
    apply.disabled = false;
    appliedCode.textContent = '';
    applied.classList.add('hidden');
  }
}

function setCouponMsg(shell, text, type = '') {
  shell.coupon.msg.textContent = text;
  shell.coupon.msg.className = `cart-coupon-msg${type ? ` ${type}` : ''}`;
}

function renderSummary(shell, cart, activeCoupon, config) {
  const totals = calcTotals(cart, activeCoupon);
  const { rows, totalValue, checkout } = shell.summary;

  rows.subtotal.label.textContent = `${config.subtotalLabel} (${totals.itemCount} item${totals.itemCount !== 1 ? 's' : ''})`;
  rows.subtotal.value.textContent = `Rs.${totals.subtotal}`;

  if (activeCoupon) {
    rows.discount.row.classList.remove('empty');
    rows.discount.label.textContent = `${config.discountLabel} (${activeCoupon})`;
    rows.discount.value.textContent = `-Rs.${totals.discount}`;
  } else {
    rows.discount.row.classList.add('empty');
    rows.discount.label.textContent = config.discountLabel;
    rows.discount.value.textContent = 'Rs.0';
  }

  rows.shipping.row.classList.toggle('free', totals.shipping === 0);
  rows.shipping.value.textContent = totals.shipping === 0 ? 'Free' : `Rs.${totals.shipping}`;
  rows.tax.value.textContent = `Rs.${totals.tax}`;
  totalValue.textContent = `Rs.${totals.total}`;
  checkout.disabled = !cart.length;

  return totals;
}

function render(shell, config) {
  const cart = getCartItems();
  const activeCoupon = getActiveCoupon();

  if (!cart.length) {
    shell.body.classList.add('hidden');
    shell.empty.classList.remove('hidden');
    renderCouponUI(shell, '');
    renderSummary(shell, [], '');
    updateCartBadge();
    return;
  }

  shell.body.classList.remove('hidden');
  shell.empty.classList.add('hidden');

  const handleItemChange = (target, change, shouldRemove = false) => {
    const nextCart = getCartItems();
    const found = nextCart.find(
      (entry) => entry.id === target.id && entry.weight === target.weight,
    );
    if (!found) return;

    if (shouldRemove) {
      saveCart(nextCart.filter(
        (entry) => !(entry.id === target.id && entry.weight === target.weight),
      ));
    } else {
      found.qty = Math.max(1, (found.qty || 1) + change);
      saveCart(nextCart);
    }
    render(shell, config);
  };

  shell.items.textContent = '';
  [...cart].reverse().forEach((item, index) => {
    shell.items.append(buildCartItem(item, index, config, handleItemChange));
  });

  const summaryTotals = renderSummary(shell, cart, activeCoupon, config);
  if (summaryTotals.shipping === 0) {
    const notice = document.createElement('div');
    notice.className = 'cart-free-shipping-notice';
    notice.innerHTML = `<strong>Great news!</strong> ${config.freeShippingText.replace(/^Great news!\s*/i, '')}`;
    shell.items.append(notice);
  }
  renderCouponUI(shell, activeCoupon);
  updateCartBadge();
}

function applyCoupon(shell, config) {
  const code = shell.coupon.input.value.trim().toUpperCase();
  const activeCoupon = getActiveCoupon();

  if (activeCoupon && activeCoupon === code) {
    setCouponMsg(shell, config.couponAlreadyText, 'error');
    showToast(config.couponAlreadyText, 'warning');
    return;
  }

  if (!code) {
    setCouponMsg(shell, config.couponEmptyText, 'error');
    showToast(config.couponEmptyText, 'warning');
    return;
  }

  if (!getCoupons()[code]) {
    setCouponMsg(shell, config.couponInvalidText, 'error');
    showToast(config.couponInvalidText, 'error');
    return;
  }

  localStorage.setItem('appliedCoupon', code);
  const coupon = getCoupons()[code];
  setCouponMsg(shell, `${code} applied successfully. ${coupon.label} added.`, 'success');
  showToast(config.couponSuccessText, 'success');
  render(shell, config);
}

function removeCoupon(shell, config) {
  localStorage.removeItem('appliedCoupon');
  setCouponMsg(shell, '', '');
  showToast(config.couponRemovedText, 'info');
  render(shell, config);
}

function handleCheckout(config) {
  if (localStorage.getItem('loggedIn') !== 'true') {
    queueToast(config.checkoutLoginText, 'warning');
    window.location.href = `${config.loginLink}?return=${encodeURIComponent(config.checkoutLink)}`;
    return;
  }
  window.location.href = config.checkoutLink;
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const shell = buildShell(config);
  block.append(shell.body, shell.empty);

  shell.coupon.form.addEventListener('submit', (event) => {
    event.preventDefault();
    applyCoupon(shell, config);
  });

  shell.coupon.availableCard.addEventListener('click', () => {
    if (shell.coupon.input.disabled) return;
    shell.coupon.input.value = shell.coupon.availableCard.dataset.couponCode || '';
    applyCoupon(shell, config);
  });

  shell.coupon.remove.addEventListener('click', () => removeCoupon(shell, config));

  shell.coupon.input.addEventListener('input', () => {
    if (shell.coupon.msg.classList.contains('error')) setCouponMsg(shell, '', '');
  });

  shell.summary.checkout.addEventListener('click', () => handleCheckout(config));

  window.updateCartBadge = updateCartBadge;
  render(shell, config);
}
