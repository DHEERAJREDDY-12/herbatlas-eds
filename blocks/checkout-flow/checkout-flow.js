/* eslint-disable no-use-before-define */

const DEFAULT_COUPONS = {
  HERB10: { type: 'percentage', value: 10, label: '10% off' },
};

function getCell(row, index) {
  return row?.children[index] || null;
}

function getText(cell) {
  return cell?.textContent.trim() || '';
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
    checkoutPath: '/checkout',
    cartPath: '/cart',
    shopPath: '/shop',
    loginPath: '/login',
    addressesPath: '/addresses',
    orderSuccessPath: '/order-success',
    requireLogin: true,
    addressStepText: '1. Address',
    paymentStepText: '2. Payment',
    addressTitle: 'Delivery Address',
    paymentTitle: 'Payment Method',
    addAddressText: '+ Add New Address',
    noAddressTitle: 'No delivery address saved',
    noAddressText: 'You need at least one delivery address to place your order.',
    noAddressCtaText: '+ Add Delivery Address',
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
    placeOrderText: 'Place Order',
    secureNote: 'Secure checkout - SSL encrypted',
    emptyTitle: 'Nothing to checkout',
    emptyText: 'Your cart is empty. Add a product before checking out.',
    emptyCtaText: 'Return to Cart',
    authText: 'Please sign in to proceed to checkout.',
    invalidCouponText: 'Invalid coupon code.',
    emptyCouponText: 'Please enter a coupon code.',
    couponAlreadyText: 'Coupon already applied.',
    couponSuccessText: 'Coupon applied successfully.',
    couponRemovedText: 'Coupon removed successfully.',
    addressRequiredText: 'Please select a delivery address.',
    paymentRequiredText: 'Please select a payment method.',
    orderSuccessText: 'Order placed successfully',
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    [
      'checkout-path',
      'cart-path',
      'shop-path',
      'login-path',
      'addresses-path',
      'order-success-path',
    ].forEach((fieldKey) => {
      if (key !== fieldKey) return;
      const prop = fieldKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      config[prop] = getHref(getCell(row, 1)) || config[prop];
    });

    if (key === 'require-login') {
      config.requireLogin = value.toLowerCase() !== 'false';
      return;
    }

    [
      'address-step-text',
      'payment-step-text',
      'address-title',
      'payment-title',
      'add-address-text',
      'no-address-title',
      'no-address-text',
      'no-address-cta-text',
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
      'place-order-text',
      'secure-note',
      'empty-title',
      'empty-text',
      'empty-cta-text',
      'auth-text',
      'invalid-coupon-text',
      'empty-coupon-text',
      'coupon-already-text',
      'coupon-success-text',
      'coupon-removed-text',
      'address-required-text',
      'payment-required-text',
      'order-success-text',
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

function readJsonStorage(storage, key, fallback) {
  try {
    const value = JSON.parse(storage.getItem(key) || 'null');
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getUserEmail() {
  return localStorage.getItem('userEmail') || '';
}

function getCheckoutMode() {
  return new URLSearchParams(window.location.search).get('mode') || '';
}

function isDirectMode() {
  return getCheckoutMode() === 'direct';
}

function getReturnPath(config) {
  return isDirectMode() ? `${config.checkoutPath}?mode=direct` : config.checkoutPath;
}

function redirectToLogin(config) {
  const returnUrl = encodeURIComponent(getReturnPath(config));
  window.location.href = `${config.loginPath}?return=${returnUrl}`;
}

function resolveItems() {
  if (isDirectMode()) {
    const directItem = readJsonStorage(sessionStorage, 'directCheckoutItem', null);
    if (!directItem) return [];
    return [directItem];
  }

  const cart = readJsonStorage(localStorage, 'cart', []);
  return Array.isArray(cart) ? cart : [];
}

function getAddresses() {
  const store = readJsonStorage(localStorage, 'addresses', {});
  const addresses = store[getUserEmail()] || [];
  return Array.isArray(addresses) ? addresses : [];
}

function getActiveCoupon() {
  if (isDirectMode()) return '';

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

function calcTotals(items, couponCode) {
  const itemCount = items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0);
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

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const cart = readJsonStorage(localStorage, 'cart', []);
  badge.textContent = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (item.qty || 0), 0)
    : 0;
}

function buildEmptyState(config) {
  const empty = document.createElement('div');
  empty.className = 'checkout-empty';

  const title = document.createElement('h2');
  title.textContent = config.emptyTitle;

  const text = document.createElement('p');
  text.textContent = config.emptyText;

  const link = document.createElement('a');
  link.href = isDirectMode() ? config.shopPath : config.cartPath;
  link.textContent = config.emptyCtaText;

  empty.append(title, text, link);
  return empty;
}

function buildSteps(config) {
  const steps = document.createElement('div');
  steps.className = 'checkout-steps';
  steps.setAttribute('role', 'navigation');
  steps.setAttribute('aria-label', 'Checkout steps');

  const address = document.createElement('span');
  address.className = 'checkout-step active';
  address.dataset.step = 'address';
  address.textContent = config.addressStepText;

  const payment = document.createElement('span');
  payment.className = 'checkout-step';
  payment.dataset.step = 'payment';
  payment.textContent = config.paymentStepText;

  steps.append(address, payment);
  return steps;
}

function buildSectionTitle(titleText, num) {
  const head = document.createElement('div');
  head.className = 'checkout-section-head';

  const title = document.createElement('h2');
  const number = document.createElement('span');
  number.className = 'checkout-section-num';
  number.setAttribute('aria-hidden', 'true');
  number.textContent = num;
  title.append(number, document.createTextNode(titleText));

  head.append(title);
  return head;
}

function buildAddressSection(state, config) {
  const section = document.createElement('section');
  section.className = 'checkout-section checkout-address-section';

  const list = document.createElement('div');
  list.className = 'checkout-address-list-wrap';

  const add = document.createElement('button');
  add.className = 'checkout-add-addr-btn';
  add.type = 'button';
  add.textContent = config.addAddressText;

  section.append(buildSectionTitle(config.addressTitle, '1'), list, add);

  const goToAddressPage = () => {
    const returnUrl = encodeURIComponent(getReturnPath(config));
    window.location.href = `${config.addressesPath}?return=${returnUrl}`;
  };
  add.addEventListener('click', goToAddressPage);

  const render = () => {
    const addresses = getAddresses();
    list.textContent = '';

    if (!addresses.length) {
      add.hidden = true;
      const empty = document.createElement('div');
      empty.className = 'checkout-addr-empty';
      empty.innerHTML = `
        <div class="checkout-addr-empty-icon" aria-hidden="true"></div>
        <h3 class="checkout-addr-empty-title">${config.noAddressTitle}</h3>
        <p class="checkout-addr-empty-sub">${config.noAddressText}</p>
      `;
      const cta = document.createElement('button');
      cta.className = 'checkout-addr-empty-cta';
      cta.type = 'button';
      cta.textContent = config.noAddressCtaText;
      cta.addEventListener('click', goToAddressPage);
      empty.append(cta);
      list.append(empty);
      state.selectedAddressId = '';
      updatePlaceOrderButton(state);
      return;
    }

    add.hidden = false;
    if (!state.selectedAddressId) {
      const selected = addresses.find((address) => address.isDefault) || addresses[0];
      state.selectedAddressId = selected.id;
    }

    const group = document.createElement('div');
    group.className = 'checkout-addr-list';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Select delivery address');

    addresses.forEach((address) => {
      const card = document.createElement('label');
      card.className = address.id === state.selectedAddressId
        ? 'checkout-addr-card selected'
        : 'checkout-addr-card';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'checkoutAddress';
      radio.value = address.id;
      radio.checked = address.id === state.selectedAddressId;

      const body = document.createElement('span');
      body.className = 'checkout-addr-card-body';
      body.innerHTML = `
        <span class="checkout-addr-name">${escapeHtml(address.fullName)}</span>
        <span class="checkout-addr-phone">${escapeHtml(address.phone)}</span>
        <span class="checkout-addr-text">
          ${escapeHtml(address.addressLine1)}${address.addressLine2 ? `, ${escapeHtml(address.addressLine2)}` : ''}<br>
          ${address.area ? `${escapeHtml(address.area)}, ` : ''}${escapeHtml(address.city)}, ${escapeHtml(address.state)} - ${escapeHtml(address.pincode)}
        </span>
      `;

      radio.addEventListener('change', () => {
        state.selectedAddressId = radio.value;
        group.querySelectorAll('.checkout-addr-card').forEach((item) => {
          const input = item.querySelector('input');
          item.classList.toggle('selected', input?.value === state.selectedAddressId);
        });
        markStepDone(state, 'address');
        updatePlaceOrderButton(state);
      });

      card.append(radio, body);
      group.append(card);
    });

    list.append(group);
    updatePlaceOrderButton(state);
  };

  state.renderAddresses = render;
  render();
  return section;
}

function buildPaymentSection(state, config) {
  const section = document.createElement('section');
  section.className = 'checkout-section checkout-payment-section';

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'checkout-payment-fieldset';

  const legend = document.createElement('legend');
  legend.className = 'checkout-sr-only';
  legend.textContent = 'Choose payment method';
  fieldset.append(legend);

  const methods = [
    ['upi', 'UPI Payment', 'mobile'],
    ['netbanking', 'Net Banking', 'bank'],
    ['card', 'Debit / Credit Card', 'card'],
    ['cod', 'Cash on Delivery', 'cash'],
  ];

  methods.forEach(([value, label, icon]) => {
    fieldset.append(buildPaymentMethod(value, label, icon, state));
  });

  section.append(buildSectionTitle(config.paymentTitle, '2'), fieldset);
  return section;
}

function buildPaymentMethod(value, label, icon, state) {
  const group = document.createElement('div');
  group.className = 'payment-method-group';

  const trigger = document.createElement('label');
  trigger.className = 'payment-method-trigger';

  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'paymentMethod';
  radio.value = value;

  const iconEl = document.createElement('span');
  iconEl.className = `payment-method-icon icon-${icon}`;
  iconEl.setAttribute('aria-hidden', 'true');

  const labelEl = document.createElement('span');
  labelEl.className = 'payment-method-label';
  labelEl.textContent = label;

  trigger.append(radio, iconEl, labelEl);
  const panel = buildPaymentPanel(value);

  radio.addEventListener('change', () => {
    state.block.querySelectorAll('.payment-method-trigger').forEach((item) => {
      item.classList.remove('selected');
    });
    state.block.querySelectorAll('.payment-sub-panel').forEach((item) => {
      item.classList.remove('visible');
    });
    trigger.classList.add('selected');
    panel.classList.add('visible');
    markStepDone(state, 'payment');
  });

  group.append(trigger, panel);
  return group;
}

function buildPaymentPanel(value) {
  const panel = document.createElement('div');
  panel.className = 'payment-sub-panel';

  if (value === 'upi') {
    panel.append(buildRadioOptions('upiOption', ['PhonePe', 'Google Pay', 'Paytm', 'Other UPI']));

    const wrap = document.createElement('div');
    wrap.className = 'upi-id-wrap';
    wrap.id = 'upiIdWrap';
    wrap.innerHTML = `
      <label for="upiIdInput">Enter UPI ID</label>
      <input type="text" id="upiIdInput" placeholder="yourname@upi" autocomplete="off">
      <span class="field-error" id="errUpiId" role="alert"></span>
    `;
    panel.append(wrap);
  }

  if (value === 'netbanking') {
    panel.append(buildRadioOptions('bankOption', ['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'Kotak']));
  }

  if (value === 'card') {
    panel.innerHTML = `
      <div class="card-fields">
        <div class="card-field">
          <label for="cardNumber">Card Number</label>
          <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" inputmode="numeric" autocomplete="cc-number">
          <span class="field-error" id="errCardNum" role="alert"></span>
        </div>
        <div class="card-field">
          <label for="cardHolder">Card Holder Name</label>
          <input type="text" id="cardHolder" placeholder="PRIYA SHARMA" autocomplete="cc-name">
          <span class="field-error" id="errCardHolder" role="alert"></span>
        </div>
        <div class="card-field-row">
          <div class="card-field">
            <label for="cardExpiry">Expiry (MM/YY)</label>
            <input type="text" id="cardExpiry" placeholder="08/27" maxlength="5" inputmode="numeric" autocomplete="cc-exp">
            <span class="field-error" id="errCardExpiry" role="alert"></span>
          </div>
          <div class="card-field">
            <label for="cardCvv">CVV</label>
            <input type="password" id="cardCvv" placeholder="..." maxlength="4" inputmode="numeric" autocomplete="cc-csc">
            <span class="field-error" id="errCardCvv" role="alert"></span>
          </div>
        </div>
      </div>
    `;
  }

  if (value === 'cod') {
    const note = document.createElement('p');
    note.className = 'cod-note';
    note.textContent = 'Pay in cash when your order is delivered. Please keep exact change ready. COD is available for orders up to Rs.5000.';
    panel.append(note);
  }

  return panel;
}

function buildRadioOptions(name, values) {
  const wrap = document.createElement('div');
  wrap.className = 'payment-sub-options';

  values.forEach((value) => {
    const label = document.createElement('label');
    label.className = 'payment-sub-opt';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = value;

    input.addEventListener('change', () => {
      document.querySelectorAll(`input[name="${name}"]`).forEach((option) => {
        option.closest('.payment-sub-opt')?.classList.toggle('selected', option === input);
      });

      if (name === 'upiOption') {
        const upiWrap = document.getElementById('upiIdWrap');
        if (upiWrap) upiWrap.classList.toggle('visible', value === 'Other UPI');
      }
    });

    label.append(input, document.createTextNode(value));
    wrap.append(label);
  });

  return wrap;
}

function buildCouponPanel(state, config) {
  const panel = document.createElement('div');
  panel.className = 'checkout-coupon-panel';
  if (isDirectMode()) panel.classList.add('hidden');

  panel.innerHTML = `
    <p class="coupon-panel-title">${config.couponTitle}</p>
    <div class="coupon-available">
      <span class="coupon-available-label">${config.couponAvailableLabel}</span>
      <button class="coupon-available-card" type="button" data-coupon-code="${config.couponCode}">
        <span class="coupon-available-code">${config.couponCode}</span>
        <span class="coupon-available-value">${config.couponValue}</span>
      </button>
    </div>
    <form class="coupon-form" autocomplete="off">
      <label for="coCouponInput" class="checkout-sr-only">Coupon code</label>
      <input type="text" id="coCouponInput" class="coupon-input" placeholder="${config.couponPlaceholder}" maxlength="20" spellcheck="false">
      <button type="submit" class="coupon-apply-btn">${config.couponApplyText}</button>
    </form>
    <div class="coupon-msg" role="status" aria-live="polite"></div>
    <div class="coupon-applied hidden">
      <span class="coupon-applied-tag">
        <span class="coupon-applied-code"></span>
        <button class="coupon-remove-btn" aria-label="Remove coupon" type="button">x</button>
      </span>
      <span class="coupon-applied-label">${config.couponAppliedLabel}</span>
    </div>
  `;

  state.coupon = {
    panel,
    form: panel.querySelector('.coupon-form'),
    input: panel.querySelector('.coupon-input'),
    apply: panel.querySelector('.coupon-apply-btn'),
    available: panel.querySelector('.coupon-available-card'),
    msg: panel.querySelector('.coupon-msg'),
    applied: panel.querySelector('.coupon-applied'),
    appliedCode: panel.querySelector('.coupon-applied-code'),
    remove: panel.querySelector('.coupon-remove-btn'),
  };

  state.coupon.form.addEventListener('submit', (event) => {
    event.preventDefault();
    applyCoupon(state, config);
  });

  state.coupon.available.addEventListener('click', () => {
    if (state.coupon.input.disabled) return;
    state.coupon.input.value = state.coupon.available.dataset.couponCode || '';
    applyCoupon(state, config);
  });

  state.coupon.remove.addEventListener('click', () => removeCoupon(state, config));
  state.coupon.input.addEventListener('input', () => {
    if (state.coupon.msg.classList.contains('error')) setCouponMsg(state, '', '');
  });

  return panel;
}

function buildSummary(state, config) {
  const summary = document.createElement('aside');
  summary.className = 'checkout-order-summary';

  const title = document.createElement('h2');
  title.textContent = config.summaryTitle;

  const items = document.createElement('div');
  items.className = 'co-item-list';

  const totals = document.createElement('div');
  totals.className = 'co-totals';
  const rows = {};
  [
    ['subtotal', config.subtotalLabel],
    ['discount', config.discountLabel],
    ['shipping', config.shippingLabel],
    ['tax', config.taxLabel],
  ].forEach(([key, label]) => {
    const row = document.createElement('div');
    row.className = key === 'discount' ? 'sum-row sum-row-discount hidden' : 'sum-row';
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    const value = document.createElement('span');
    value.textContent = 'Rs.0';
    row.append(labelEl, value);
    totals.append(row);
    rows[key] = { row, label: labelEl, value };
  });

  const total = document.createElement('div');
  total.className = 'sum-total';
  total.innerHTML = `<span>${config.totalLabel}</span><span>Rs.0</span>`;
  totals.append(total);

  const place = document.createElement('button');
  place.className = 'place-order-btn';
  place.type = 'button';
  place.disabled = true;
  place.setAttribute('aria-disabled', 'true');
  place.textContent = config.placeOrderText;

  const error = document.createElement('div');
  error.className = 'place-order-err';
  error.setAttribute('role', 'alert');

  const secure = document.createElement('p');
  secure.className = 'checkout-secure-note';
  secure.textContent = config.secureNote;

  summary.append(title, items, document.createElement('hr'), totals, place, error, secure);

  state.summary = {
    items,
    rows,
    totalValue: total.querySelector('span:last-child'),
    place,
    error,
  };

  place.addEventListener('click', () => placeOrder(state, config));
  return summary;
}

function renderItems(state) {
  state.summary.items.textContent = '';

  state.items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'co-item-row';

    const copy = document.createElement('div');
    copy.className = 'co-item-copy';
    const name = document.createElement('div');
    name.className = 'co-item-name';
    name.textContent = item.name;
    const weight = document.createElement('div');
    weight.className = 'co-item-weight';
    weight.textContent = item.weight;
    copy.append(name, weight);

    const qty = document.createElement('span');
    qty.className = 'co-item-qty';
    qty.textContent = `x${item.qty || 0}`;

    const price = document.createElement('span');
    price.className = 'co-item-price';
    price.textContent = `Rs.${(item.price || 0) * (item.qty || 0)}`;

    row.append(copy, qty, price);
    state.summary.items.append(row);
  });
}

function renderTotals(state, config) {
  const totals = calcTotals(state.items, state.activeCoupon);
  const { rows, totalValue } = state.summary;

  rows.subtotal.value.textContent = `Rs.${totals.subtotal}`;
  rows.shipping.row.classList.toggle('free', totals.shipping === 0);
  rows.shipping.value.textContent = totals.shipping === 0 ? 'Free' : `Rs.${totals.shipping}`;
  rows.tax.value.textContent = `Rs.${totals.tax}`;
  totalValue.textContent = `Rs.${totals.total}`;

  if (state.activeCoupon) {
    rows.discount.row.classList.remove('hidden');
    rows.discount.label.textContent = `${config.discountLabel} (${state.activeCoupon})`;
    rows.discount.value.textContent = `-Rs.${totals.discount}`;
  } else {
    rows.discount.row.classList.add('hidden');
    rows.discount.label.textContent = config.discountLabel;
    rows.discount.value.textContent = '-Rs.0';
  }
}

function setCouponMsg(state, text, type = '') {
  state.coupon.msg.textContent = text;
  state.coupon.msg.className = `coupon-msg${type ? ` ${type}` : ''}`;
}

function syncCouponUI(state) {
  if (!state.coupon) return;

  if (state.activeCoupon) {
    state.coupon.input.value = state.activeCoupon;
    state.coupon.input.disabled = true;
    state.coupon.apply.disabled = true;
    state.coupon.appliedCode.textContent = state.activeCoupon;
    state.coupon.applied.classList.remove('hidden');
  } else {
    state.coupon.input.value = '';
    state.coupon.input.disabled = false;
    state.coupon.apply.disabled = false;
    state.coupon.appliedCode.textContent = '';
    state.coupon.applied.classList.add('hidden');
  }
}

function applyCoupon(state, config) {
  const code = state.coupon.input.value.trim().toUpperCase();

  if (state.activeCoupon && state.activeCoupon === code) {
    setCouponMsg(state, config.couponAlreadyText, 'error');
    showToast(config.couponAlreadyText, 'warning');
    return;
  }

  if (!code) {
    setCouponMsg(state, config.emptyCouponText, 'error');
    showToast(config.emptyCouponText, 'warning');
    return;
  }

  if (!getCoupons()[code]) {
    setCouponMsg(state, config.invalidCouponText, 'error');
    showToast(config.invalidCouponText, 'error');
    return;
  }

  state.activeCoupon = code;
  localStorage.setItem('appliedCoupon', code);
  setCouponMsg(state, `${code} applied. ${getCoupons()[code].label} added.`, 'success');
  showToast(config.couponSuccessText, 'success');
  syncCouponUI(state);
  renderTotals(state, config);
}

function removeCoupon(state, config) {
  state.activeCoupon = '';
  localStorage.removeItem('appliedCoupon');
  setCouponMsg(state, '', '');
  showToast(config.couponRemovedText, 'info');
  syncCouponUI(state);
  renderTotals(state, config);
}

function clearFieldError(block, id) {
  const error = block.querySelector(`#${id}`);
  if (error) error.textContent = '';
  const input = error?.previousElementSibling;
  if (input?.tagName === 'INPUT') input.classList.remove('error');
}

function showFieldError(block, id, message) {
  const error = block.querySelector(`#${id}`);
  if (error) error.textContent = message;
  const input = error?.previousElementSibling;
  if (input?.tagName === 'INPUT') input.classList.add('error');
}

function isExpiryFuture(expiry) {
  const [mm, yy] = expiry.split('/').map(Number);
  if (!mm || !yy) return false;
  const now = new Date();
  const exp = new Date(2000 + yy, mm - 1);
  return exp > now;
}

function validatePayment(state, config) {
  const method = state.block.querySelector('input[name="paymentMethod"]:checked');
  if (!method) return { valid: false, msg: config.paymentRequiredText };

  if (method.value === 'upi') {
    const sub = state.block.querySelector('input[name="upiOption"]:checked');
    if (!sub) return { valid: false, msg: 'Please select a UPI option.' };
    if (sub.value === 'Other UPI') {
      const upiId = state.block.querySelector('#upiIdInput')?.value.trim();
      if (!upiId) {
        showFieldError(state.block, 'errUpiId', 'Please enter your UPI ID.');
        return { valid: false, msg: 'Please enter your UPI ID.' };
      }
      clearFieldError(state.block, 'errUpiId');
    }
    return { valid: true };
  }

  if (method.value === 'netbanking') {
    const bank = state.block.querySelector('input[name="bankOption"]:checked');
    return bank ? { valid: true } : { valid: false, msg: 'Please select a bank.' };
  }

  if (method.value === 'card') {
    return validateCardPayment(state.block);
  }

  if (method.value === 'cod') return { valid: true };
  return { valid: false, msg: config.paymentRequiredText };
}

function validateCardPayment(block) {
  let valid = true;
  const number = block.querySelector('#cardNumber')?.value.replace(/\s/g, '') || '';
  const holder = block.querySelector('#cardHolder')?.value.trim() || '';
  const expiry = block.querySelector('#cardExpiry')?.value.trim() || '';
  const cvv = block.querySelector('#cardCvv')?.value.trim() || '';

  if (!/^\d{16}$/.test(number)) {
    showFieldError(block, 'errCardNum', 'Enter a valid 16-digit card number.');
    valid = false;
  } else {
    clearFieldError(block, 'errCardNum');
  }

  if (!holder) {
    showFieldError(block, 'errCardHolder', 'Card holder name is required.');
    valid = false;
  } else {
    clearFieldError(block, 'errCardHolder');
  }

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) || !isExpiryFuture(expiry)) {
    showFieldError(block, 'errCardExpiry', 'Enter a valid future expiry (MM/YY).');
    valid = false;
  } else {
    clearFieldError(block, 'errCardExpiry');
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    showFieldError(block, 'errCardCvv', 'Enter a valid CVV.');
    valid = false;
  } else {
    clearFieldError(block, 'errCardCvv');
  }

  return valid ? { valid: true } : { valid: false, msg: 'Please fix card details.' };
}

function getSelectedPaymentLabel(block) {
  const method = block.querySelector('input[name="paymentMethod"]:checked');
  if (!method) return null;

  if (method.value === 'upi') {
    const sub = block.querySelector('input[name="upiOption"]:checked');
    if (!sub) return null;
    if (sub.value === 'Other UPI') {
      const upiId = block.querySelector('#upiIdInput')?.value.trim();
      return upiId ? `UPI (${upiId})` : null;
    }
    return `${sub.value} (UPI)`;
  }

  if (method.value === 'netbanking') {
    const bank = block.querySelector('input[name="bankOption"]:checked');
    return bank ? `${bank.value} Net Banking` : null;
  }

  if (method.value === 'card') {
    const number = block.querySelector('#cardNumber')?.value.replace(/\s/g, '') || '';
    return number.length >= 4 ? `Card ending ${number.slice(-4)}` : null;
  }

  if (method.value === 'cod') return 'Cash on Delivery';
  return null;
}

function markStepDone(state, step) {
  const stepEl = state.steps.querySelector(`[data-step="${step}"]`);
  if (!stepEl) return;
  stepEl.classList.remove('active');
  stepEl.classList.add('done');
}

function updatePlaceOrderButton(state) {
  if (!state.summary?.place) return;
  const ready = Boolean(state.selectedAddressId);
  state.summary.place.disabled = !ready;
  state.summary.place.setAttribute('aria-disabled', String(!ready));
}

function generateOrderId() {
  const year = new Date().getFullYear();
  const counter = parseInt(localStorage.getItem('orderCounter') || '0', 10) + 1;
  localStorage.setItem('orderCounter', String(counter));
  return `HERB-${year}-${String(counter).padStart(6, '0')}`;
}

function showPlaceError(state, message) {
  state.summary.error.textContent = message;
  showToast(message, 'error');
  window.setTimeout(() => {
    state.summary.error.textContent = '';
  }, 4000);
}

function placeOrder(state, config) {
  if (!state.selectedAddressId) {
    showPlaceError(state, config.addressRequiredText);
    return;
  }

  const paymentState = validatePayment(state, config);
  if (!paymentState.valid) {
    showPlaceError(state, paymentState.msg);
    return;
  }

  const address = getAddresses().find((item) => item.id === state.selectedAddressId);
  if (!address) {
    showPlaceError(state, config.addressRequiredText);
    return;
  }

  const paymentLabel = getSelectedPaymentLabel(state.block);
  const totals = calcTotals(state.items, state.activeCoupon);

  const order = {
    orderId: generateOrderId(),
    userId: getUserEmail(),
    items: state.items.map((item) => ({
      id: item.id,
      name: item.name,
      weight: item.weight,
      qty: item.qty,
      price: item.price,
    })),
    address: {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      area: address.area || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },
    paymentMethod: paymentLabel,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    couponCode: state.activeCoupon || '',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  const allOrders = readJsonStorage(localStorage, 'orders', {});
  const userOrders = allOrders[getUserEmail()] || [];
  userOrders.unshift(order);
  allOrders[getUserEmail()] = userOrders;
  localStorage.setItem('orders', JSON.stringify(allOrders));

  if (isDirectMode()) {
    sessionStorage.removeItem('directCheckoutItem');
  } else {
    localStorage.removeItem('cart');
    localStorage.removeItem('appliedCoupon');
  }

  updateCartBadge();
  queueToast(config.orderSuccessText, 'success');
  window.location.href = `${config.orderSuccessPath}?orderId=${encodeURIComponent(order.orderId)}`;
}

function setupInputFormatting(block) {
  const cardNumber = block.querySelector('#cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', (event) => {
      const value = event.target.value.replace(/\D/g, '').slice(0, 16);
      event.target.value = value.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  const cardExpiry = block.querySelector('#cardExpiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', (event) => {
      let value = event.target.value.replace(/\D/g, '').slice(0, 4);
      if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
      event.target.value = value;
    });
  }
}

function buildLayout(state, config) {
  state.steps = buildSteps(config);

  const page = document.createElement('main');
  page.className = 'checkout-page';

  const body = document.createElement('div');
  body.className = 'checkout-body';

  const sections = document.createElement('div');
  sections.className = 'checkout-sections-col';
  sections.append(buildAddressSection(state, config), buildPaymentSection(state, config));

  const rail = document.createElement('aside');
  rail.className = 'checkout-right-rail';
  rail.setAttribute('aria-label', 'Checkout sidebar');
  rail.append(buildCouponPanel(state, config), buildSummary(state, config));

  body.append(sections, rail);
  page.append(body);

  return [state.steps, page];
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  if (config.requireLogin && localStorage.getItem('loggedIn') !== 'true') {
    redirectToLogin(config);
    return;
  }

  const items = resolveItems();
  if (!items.length) {
    block.append(buildEmptyState(config));
    window.setTimeout(() => {
      window.location.href = isDirectMode() ? config.shopPath : config.cartPath;
    }, 0);
    return;
  }

  const state = {
    block,
    items,
    activeCoupon: getActiveCoupon(),
    selectedAddressId: '',
    steps: null,
    summary: null,
    coupon: null,
    renderAddresses: null,
  };

  block.append(...buildLayout(state, config));
  setupInputFormatting(block);
  renderItems(state);
  renderTotals(state, config);
  syncCouponUI(state);
  updatePlaceOrderButton(state);
}
