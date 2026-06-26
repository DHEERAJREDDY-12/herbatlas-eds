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
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    ['login-path', 'orders-path', 'shop-path'].forEach((fieldKey) => {
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

function getOrders() {
  const userEmail = localStorage.getItem('userEmail') || '';
  const allOrders = readOrders();
  const orders = allOrders[userEmail] || [];
  return Array.isArray(orders) ? orders : [];
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

function statusClass(status) {
  const map = {
    Pending: 'pending',
    Processing: 'processing',
    Shipped: 'shipped',
    Delivered: 'delivered',
  };
  return map[status] || 'pending';
}

function getAddressText(address = {}) {
  return [
    address.addressLine1,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean).join(', ');
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

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  if (config.requireLogin && localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = `${config.loginPath}?return=${encodeURIComponent(config.ordersPath)}`;
    return;
  }

  renderOrders(block, config);
}
