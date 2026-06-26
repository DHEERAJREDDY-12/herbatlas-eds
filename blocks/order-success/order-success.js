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

function readConfig(rows) {
  const config = {
    title: 'Order Placed <em>Successfully!</em>',
    subtitle: "Thank you for your order. We'll start processing it right away.",
    missingTitle: 'Order details could not be found.',
    missingText: 'The order may have been removed or you may be signed in with a different account.',
    orderIdLabel: 'Order ID',
    orderDateLabel: 'Order Date',
    paymentLabel: 'Payment',
    deliveryLabel: 'Deliver To',
    totalLabel: 'Total Paid',
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

    if (key === 'title') {
      config.title = getCell(row, 1)?.innerHTML.trim() || config.title;
      return;
    }

    ['orders-link', 'shop-link'].forEach((fieldKey) => {
      if (key !== fieldKey) return;
      const prop = fieldKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      config[prop] = getHref(getCell(row, 1)) || config[prop];
    });

    [
      'subtitle',
      'missing-title',
      'missing-text',
      'order-id-label',
      'order-date-label',
      'payment-label',
      'delivery-label',
      'total-label',
      'items-label',
      'estimate-title',
      'estimate-fallback',
      'estimate-suffix',
      'orders-text',
      'shop-text',
    ].forEach((fieldKey) => {
      if (key !== fieldKey) return;
      const prop = fieldKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      config[prop] = value || config[prop];
    });
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

function getOrderId() {
  return new URLSearchParams(window.location.search).get('orderId') || '';
}

function getOrder() {
  const orderId = getOrderId();
  if (!orderId) return null;

  const userEmail = localStorage.getItem('userEmail') || '';
  const allOrders = readOrders();
  const userOrders = Array.isArray(allOrders[userEmail]) ? allOrders[userEmail] : [];
  return userOrders.find((order) => order.orderId === orderId) || null;
}

function formatDate(iso) {
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

function addressText(address = {}) {
  return [
    address.addressLine1,
    address.addressLine2,
    address.area,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean).join(', ');
}

function buildDetailRow(label, value, isStrong = false) {
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

function buildItems(order, config) {
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

function buildActions(config) {
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

function buildMissing(config) {
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

  const actions = buildActions(config);
  card.append(icon, title, text, actions);
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
  icon.textContent = '✓';

  const title = document.createElement('h1');
  title.innerHTML = config.title;

  const subtitle = document.createElement('p');
  subtitle.className = 'order-success-subtitle';
  subtitle.textContent = config.subtitle;

  const details = document.createElement('div');
  details.className = 'order-success-details';
  details.setAttribute('role', 'region');
  details.setAttribute('aria-label', 'Order details');

  const address = order.address || {};
  details.append(
    buildDetailRow(config.orderIdLabel, escapeHtml(order.orderId), true),
    buildDetailRow(config.orderDateLabel, escapeHtml(formatDate(order.createdAt))),
    buildDetailRow(config.paymentLabel, escapeHtml(order.paymentMethod)),
    buildDetailRow(
      config.deliveryLabel,
      `<strong>${escapeHtml(address.fullName)}</strong>${escapeHtml(address.phone)}<br>${escapeHtml(addressText(address))}`,
    ),
    buildDetailRow(config.totalLabel, `Rs.${escapeHtml(order.total)}`, true),
  );

  const estimateDate = estimatedDelivery(order.createdAt, config.estimateFallback);
  const estimate = document.createElement('div');
  estimate.className = 'order-delivery-estimate';
  estimate.setAttribute('role', 'note');
  estimate.setAttribute('aria-label', 'Delivery estimate');
  estimate.innerHTML = `
    <span class="delivery-icon" aria-hidden="true"></span>
    <span class="delivery-text">
      <strong>${config.estimateTitle}</strong>
      <span>By ${escapeHtml(estimateDate)} (${escapeHtml(config.estimateSuffix)})</span>
    </span>
  `;

  card.append(
    icon,
    title,
    subtitle,
    details,
    buildItems(order, config),
    estimate,
    buildActions(config),
  );
  page.append(card);
  document.title = `Order ${order.orderId} Confirmed - HerbAtlas`;
  return page;
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const orderId = getOrderId();
  if (!orderId) {
    window.setTimeout(() => {
      window.location.href = config.ordersLink;
    }, 0);
    block.append(buildMissing(config));
    return;
  }

  const order = getOrder();
  block.append(order ? buildSuccess(order, config) : buildMissing(config));
}
