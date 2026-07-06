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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeInlineHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = (html || '')
    .replace(/&lt;(\/?)(em|strong|br)&gt;/gi, '<$1$2>')
    .replace(/&lt;br\s*\/&gt;/gi, '<br>');

  tmp.querySelectorAll('*').forEach((el) => {
    if (!['EM', 'STRONG', 'BR'].includes(el.tagName)) {
      el.replaceWith(document.createTextNode(el.textContent));
    }
  });

  return tmp.innerHTML;
}

function normalizeSuccessTitle(html) {
  const normalized = normalizeInlineHtml(html);
  if (/<em[\s>]/i.test(normalized)) return normalized;
  return normalized.replace(/Successfully!/i, '<em>Successfully!</em>');
}

function readConfig(rows) {
  const config = {
    loginPath: '/login',
    ordersPath: '/orders',
    shopPath: '/shop',
    requireLogin: true,
    emptyTitle: 'No orders yet',
    emptyText: 'Browse our herb shop and place your first order.',
    emptyCtaText: 'Browse Shop',
    deliveryAddressLabel: 'Delivery Address',
    paymentMethodLabel: 'Payment Method',
    productLabel: 'Product',
    weightLabel: 'Weight',
    quantityLabel: 'Qty',
    amountLabel: 'Amount',
    subtotalLabel: 'Subtotal',
    discountLabel: 'Discount',
    shippingLabel: 'Shipping',
    taxLabel: 'GST',
    totalLabel: 'Total',
    successTitle: 'Order Placed <em>Successfully!</em>',
    successSubtitle: "Thank you for your order. We'll start processing it right away.",
    missingTitle: 'Order details could not be found.',
    missingText: 'The order may have been removed or you may be signed in with a different account.',
    orderIdLabel: 'Order ID',
    orderDateLabel: 'Order Date',
    paymentLabel: 'Payment',
    deliveryLabel: 'Deliver To',
    successTotalLabel: 'Total Paid',
    itemsLabel: 'Ordered Items',
    estimateTitle: 'Estimated Delivery',
    estimateFallback: '3-5 Business Days',
    estimateSuffix: '3-5 business days',
    ordersText: 'View My Orders',
    ordersLink: '/orders',
    shopText: 'Continue Shopping',
    shopLink: '/shop',
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    ['login-path', 'orders-path', 'shop-path'].forEach((fieldKey) => {
      if (key !== fieldKey) return;
      const prop = fieldKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      config[prop] = getHref(getCell(row, 1)) || config[prop];
    });

    if (key === 'title') {
      config.successTitle = getCell(row, 1)?.innerHTML.trim() || config.successTitle;
      return;
    }

    ['orders-link', 'shop-link'].forEach((fieldKey) => {
      if (key !== fieldKey) return;
      const prop = fieldKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      config[prop] = getHref(getCell(row, 1)) || config[prop];
    });

    if (key === 'require-login') {
      config.requireLogin = value.toLowerCase() !== 'false';
      return;
    }

    [
      'empty-title',
      'empty-text',
      'empty-cta-text',
      'delivery-address-label',
      'payment-method-label',
      'product-label',
      'weight-label',
      'quantity-label',
      'amount-label',
      'subtotal-label',
      'discount-label',
      'shipping-label',
      'tax-label',
      'total-label',
      'subtitle',
      'missing-title',
      'missing-text',
      'order-id-label',
      'order-date-label',
      'payment-label',
      'delivery-label',
      'items-label',
      'estimate-title',
      'estimate-fallback',
      'estimate-suffix',
      'orders-text',
      'shop-text',
    ].forEach((fieldKey) => {
      if (key !== fieldKey) return;
      const prop = fieldKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      if (fieldKey === 'subtitle') config.successSubtitle = value || config.successSubtitle;
      else if (fieldKey === 'total-label') config.totalLabel = value || config.totalLabel;
      else config[prop] = value || config[prop];
    });

    if (key === 'total-label') {
      config.successTotalLabel = value || config.successTotalLabel;
    }
  });

  return config;
}

function readOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem('orders') || '{}');
    return orders && typeof orders === 'object' ? orders : {};
  } catch {
    return {};
  }
}

function getOrders() {
  const userEmail = localStorage.getItem('userEmail') || '';
  const allOrders = readOrders();
  const orders = allOrders[userEmail] || [];
  return Array.isArray(orders) ? orders : [];
}

function getOrderId() {
  return new URLSearchParams(window.location.search).get('orderId') || '';
}

function getOrderById(orderId) {
  if (!orderId) return null;
  return getOrders().find((order) => order.orderId === orderId) || null;
}

function formatDate(iso) {
  if (!iso) return '';

  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatSuccessDate(iso) {
  if (!iso) return '';

  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function estimatedDelivery(iso, fallback) {
  if (!iso) return fallback;

  try {
    const base = new Date(iso);
    base.setDate(base.getDate() + 5);
    return base.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return fallback;
  }
}

function statusClass(status) {
  const map = {
    Pending: 'pending',
    Processing: 'processing',
    Shipped: 'shipped',
    Delivered: 'delivered',
  };
  return map[status] || 'pending';
}

function getFullAddressText(address = {}) {
  return [
    address.addressLine1,
    address.addressLine2,
    address.area,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean).join(', ');
}

function getAddressText(address = {}) {
  return [
    address.addressLine1,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean).join(', ');
}

function buildSuccessDetailRow(label, value, isStrong = false) {
  const row = document.createElement('div');
  row.className = 'osd-row';

  const labelEl = document.createElement('span');
  labelEl.className = 'osd-label';
  labelEl.textContent = label;

  const valueEl = document.createElement('div');
  valueEl.className = 'osd-value';
  valueEl.innerHTML = isStrong ? `<strong>${value}</strong>` : value;

  row.append(labelEl, valueEl);
  return row;
}

function buildEmpty(config) {
  const empty = document.createElement('div');
  empty.className = 'orders-empty';

  const title = document.createElement('h3');
  title.textContent = config.emptyTitle;

  const text = document.createElement('p');
  text.textContent = config.emptyText;

  const link = document.createElement('a');
  link.href = config.shopPath;
  link.className = 'orders-empty-cta';
  link.textContent = config.emptyCtaText;

  empty.append(title, text, link);
  return empty;
}

function updateOrdersHero(orders, config) {
  const heroDescription = document.querySelector('.hero .hero-description');
  if (!heroDescription) return;

  heroDescription.textContent = orders.length
    ? `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`
    : config.emptyTitle;
}

function buildSuccessItems(order, config) {
  const section = document.createElement('div');
  section.className = 'order-success-items';

  const title = document.createElement('h2');
  title.textContent = config.itemsLabel;

  const list = document.createElement('div');
  list.className = 'order-success-items-list';

  (order.items || []).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'order-success-item';
    row.innerHTML = `
      <span class="order-success-item-copy">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.weight)} x ${escapeHtml(item.qty)}</span>
      </span>
      <span class="order-success-item-price">Rs.${(item.price || 0) * (item.qty || 0)}</span>
    `;
    list.append(row);
  });

  section.append(title, list);
  return section;
}

function buildSuccessActions(config) {
  const actions = document.createElement('div');
  actions.className = 'order-success-actions';

  const orders = document.createElement('a');
  orders.className = 'btn-success-primary';
  orders.href = config.ordersLink;
  orders.textContent = config.ordersText;

  const shop = document.createElement('a');
  shop.className = 'btn-success-outline';
  shop.href = config.shopLink;
  shop.textContent = config.shopText;

  actions.append(orders, shop);
  return actions;
}

function buildSuccessMissing(config) {
  const page = document.createElement('main');
  page.className = 'order-success-page';

  const card = document.createElement('div');
  card.className = 'order-success-card';

  const icon = document.createElement('div');
  icon.className = 'order-success-icon missing';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '!';

  const title = document.createElement('h1');
  title.textContent = config.missingTitle;

  const text = document.createElement('p');
  text.className = 'order-success-subtitle';
  text.textContent = config.missingText;

  card.append(icon, title, text, buildSuccessActions(config));
  page.append(card);
  return page;
}

function buildSuccess(order, config) {
  const page = document.createElement('main');
  page.className = 'order-success-page';

  const card = document.createElement('div');
  card.className = 'order-success-card';

  const icon = document.createElement('div');
  icon.className = 'order-success-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = '&#10003;';

  const title = document.createElement('h1');
  title.innerHTML = normalizeSuccessTitle(config.successTitle);

  const subtitle = document.createElement('p');
  subtitle.className = 'order-success-subtitle';
  subtitle.textContent = config.successSubtitle;

  const details = document.createElement('div');
  details.className = 'order-success-details';
  details.setAttribute('role', 'region');
  details.setAttribute('aria-label', 'Order details');

  const address = order.address || {};
  details.append(
    buildSuccessDetailRow(config.orderIdLabel, escapeHtml(order.orderId), true),
    buildSuccessDetailRow(config.orderDateLabel, escapeHtml(formatSuccessDate(order.createdAt))),
    buildSuccessDetailRow(config.paymentLabel, escapeHtml(order.paymentMethod)),
    buildSuccessDetailRow(
      config.deliveryLabel,
      `<strong>${escapeHtml(address.fullName)}</strong>${escapeHtml(address.phone)}<br>${escapeHtml(getFullAddressText(address))}`,
    ),
    buildSuccessDetailRow(config.successTotalLabel, `Rs.${escapeHtml(order.total)}`, true),
  );

  const estimateDate = estimatedDelivery(order.createdAt, config.estimateFallback);
  const estimate = document.createElement('div');
  estimate.className = 'order-delivery-estimate';
  estimate.setAttribute('role', 'note');
  estimate.setAttribute('aria-label', 'Delivery estimate');
  estimate.innerHTML = `
    <span class="delivery-icon" aria-hidden="true"></span>
    <span class="delivery-text">
      <strong>${escapeHtml(config.estimateTitle)}</strong>
      <span>By ${escapeHtml(estimateDate)} (${escapeHtml(config.estimateSuffix)})</span>
    </span>
  `;

  card.append(
    icon,
    title,
    subtitle,
    details,
    buildSuccessItems(order, config),
    estimate,
    buildSuccessActions(config),
  );
  page.append(card);
  document.title = `Order ${order.orderId} Confirmed - HerbAtlas`;
  return page;
}

function buildOrderHead(order) {
  const head = document.createElement('button');
  head.className = 'order-card-head';
  head.type = 'button';
  head.setAttribute('aria-expanded', 'false');

  const info = document.createElement('span');
  info.className = 'order-card-info';
  info.innerHTML = `
    <span class="order-id">${escapeHtml(order.orderId)}</span>
    <span class="order-date">${escapeHtml(formatDate(order.createdAt))}</span>
  `;

  const status = document.createElement('span');
  status.className = `order-status-badge ${statusClass(order.status)}`;
  status.textContent = order.status || 'Pending';

  const amount = document.createElement('span');
  amount.className = 'order-amount';
  amount.textContent = `Rs.${order.total || 0}`;

  const toggle = document.createElement('span');
  toggle.className = 'order-toggle-icon';
  toggle.setAttribute('aria-hidden', 'true');
  toggle.textContent = '⌄';

  head.append(info, status, amount, toggle);
  return head;
}

function buildDetailBlocks(order, config) {
  const grid = document.createElement('div');
  grid.className = 'order-detail-grid';
  const address = order.address || {};

  const addressBlock = document.createElement('div');
  addressBlock.className = 'order-detail-block';
  addressBlock.innerHTML = `
    <h4>${escapeHtml(config.deliveryAddressLabel)}</h4>
    <p>
      <strong>${escapeHtml(address.fullName)}</strong><br>
      ${escapeHtml(address.phone)}<br>
      ${escapeHtml(getAddressText(address))}
    </p>
  `;

  const paymentBlock = document.createElement('div');
  paymentBlock.className = 'order-detail-block';
  paymentBlock.innerHTML = `
    <h4>${escapeHtml(config.paymentMethodLabel)}</h4>
    <p>${escapeHtml(order.paymentMethod)}</p>
  `;

  grid.append(addressBlock, paymentBlock);
  return grid;
}

function buildItemsTable(order, config) {
  const table = document.createElement('table');
  table.className = 'order-items-table';
  table.setAttribute('aria-label', 'Order items');

  table.innerHTML = `
    <thead>
      <tr>
        <th>${escapeHtml(config.productLabel)}</th>
        <th>${escapeHtml(config.weightLabel)}</th>
        <th>${escapeHtml(config.quantityLabel)}</th>
        <th>${escapeHtml(config.amountLabel)}</th>
      </tr>
    </thead>
  `;

  const body = document.createElement('tbody');
  (order.items || []).forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.weight)}</td>
      <td>${escapeHtml(item.qty)}</td>
      <td>Rs.${(item.price || 0) * (item.qty || 0)}</td>
    `;
    body.append(row);
  });
  table.append(body);
  return table;
}

function buildTotals(order, config) {
  const totals = document.createElement('div');
  totals.className = 'order-totals';

  const rows = [
    [config.subtotalLabel, `Rs.${order.subtotal || 0}`, ''],
  ];

  if ((order.discount || 0) > 0) {
    rows.push([
      `${config.discountLabel}${order.couponCode ? ` (${order.couponCode})` : ''}`,
      `-Rs.${order.discount}`,
      'discount',
    ]);
  }

  rows.push(
    [config.shippingLabel, order.shipping === 0 ? 'Free' : `Rs.${order.shipping || 0}`, ''],
    [config.taxLabel, `Rs.${order.tax || 0}`, ''],
    [config.totalLabel, `Rs.${order.total || 0}`, 'grand'],
  );

  rows.forEach(([label, value, className]) => {
    const row = document.createElement('div');
    row.className = className ? `order-total-row ${className}` : 'order-total-row';
    row.innerHTML = `<span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span>`;
    totals.append(row);
  });

  return totals;
}

function buildOrderCard(order, index, config) {
  const card = document.createElement('article');
  card.className = 'order-card';

  const head = buildOrderHead(order);
  const detail = document.createElement('div');
  detail.className = 'order-detail';
  detail.id = `order-detail-${index}`;
  head.setAttribute('aria-controls', detail.id);

  head.addEventListener('click', () => {
    const isOpen = card.classList.toggle('open');
    head.setAttribute('aria-expanded', String(isOpen));
  });

  detail.append(
    buildDetailBlocks(order, config),
    buildItemsTable(order, config),
    buildTotals(order, config),
  );

  card.append(head, detail);
  return card;
}

function renderOrders(block, config) {
  const orders = getOrders();
  updateOrdersHero(orders, config);

  const body = document.createElement('main');
  body.className = 'orders-page';

  const list = document.createElement('div');
  list.className = 'orders-body';

  if (!orders.length) {
    list.append(buildEmpty(config));
  } else {
    orders.forEach((order, index) => {
      list.append(buildOrderCard(order, index, config));
    });
  }

  body.append(list);
  block.append(body);
}

function renderSuccess(block, config) {
  const orderId = getOrderId();
  if (!orderId) {
    window.setTimeout(() => {
      window.location.href = config.ordersLink;
    }, 0);
    block.append(buildSuccessMissing(config));
    return;
  }

  const order = getOrderById(orderId);
  block.append(order ? buildSuccess(order, config) : buildSuccessMissing(config));
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  if (block.classList.contains('success')) {
    renderSuccess(block, config);
    return;
  }

  if (config.requireLogin && localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = `${config.loginPath}?return=${encodeURIComponent(config.ordersPath)}`;
    return;
  }

  renderOrders(block, config);
}
