/* eslint-disable no-use-before-define */

const DEFAULT_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
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
    addressesPath: '/addresses',
    requireLogin: true,
    listTitle: 'Saved Addresses',
    formTitleAdd: 'Add New Address',
    formTitleEdit: 'Edit Address',
    showFormText: '+ Add New Address',
    saveText: 'Save Address',
    updateText: 'Update Address',
    cancelText: 'Cancel',
    emptyText: 'No saved addresses yet. Add your first delivery address.',
    defaultBadgeText: 'Default',
    editText: 'Edit',
    setDefaultText: 'Set Default',
    deleteText: 'Delete',
    defaultCheckboxText: 'Set as default address',
    fullNameLabel: 'Full Name',
    phoneLabel: 'Phone Number',
    line1Label: 'House / Flat Number',
    line2Label: 'Street',
    areaLabel: 'Area',
    cityLabel: 'City',
    stateLabel: 'State',
    pincodeLabel: 'Pincode',
    selectStateText: 'Select State',
    validationText: 'Please correct the highlighted address fields.',
    savedText: 'Address saved successfully',
    deletedText: 'Address deleted successfully',
    deleteConfirmText: 'Press delete again within a few seconds to remove this address.',
    fullNameError: 'Full name is required.',
    phoneError: 'Enter a valid 10-digit phone number.',
    line1Error: 'House / flat number is required.',
    cityError: 'City is required.',
    stateError: 'Please select a state.',
    pincodeError: 'Enter a valid 6-digit pincode.',
    states: [...DEFAULT_STATES],
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    ['login-path', 'addresses-path'].forEach((fieldKey) => {
      if (key !== fieldKey) return;
      const prop = fieldKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      config[prop] = getHref(getCell(row, 1)) || config[prop];
    });

    if (key === 'require-login') {
      config.requireLogin = value.toLowerCase() !== 'false';
      return;
    }

    if (key === 'state-options') {
      const states = value.split(',').map((item) => item.trim()).filter(Boolean);
      if (states.length) config.states = states;
      return;
    }

    [
      'list-title',
      'form-title-add',
      'form-title-edit',
      'show-form-text',
      'save-text',
      'update-text',
      'cancel-text',
      'empty-text',
      'default-badge-text',
      'edit-text',
      'set-default-text',
      'delete-text',
      'default-checkbox-text',
      'full-name-label',
      'phone-label',
      'line1-label',
      'line2-label',
      'area-label',
      'city-label',
      'state-label',
      'pincode-label',
      'select-state-text',
      'validation-text',
      'saved-text',
      'deleted-text',
      'delete-confirm-text',
      'full-name-error',
      'phone-error',
      'line1-error',
      'city-error',
      'state-error',
      'pincode-error',
    ].forEach((fieldKey) => {
      if (key !== fieldKey) return;
      const prop = fieldKey.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());
      config[prop] = value || config[prop];
    });
  });

  return config;
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

function getReturnUrl() {
  return new URLSearchParams(window.location.search).get('return') || '';
}

function getLoginReturn(config) {
  const params = new URLSearchParams(window.location.search);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return `${config.addressesPath}${suffix}`;
}

function getAllAddresses() {
  const store = readJsonStorage(localStorage, 'addresses', {});
  const addresses = store[getUserEmail()] || [];
  return Array.isArray(addresses) ? addresses : [];
}

function saveAllAddresses(list) {
  const store = readJsonStorage(localStorage, 'addresses', {});
  store[getUserEmail()] = list;
  localStorage.setItem('addresses', JSON.stringify(store));
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

function createButton(className, text) {
  const button = document.createElement('button');
  button.className = className;
  button.type = 'button';
  button.textContent = text;
  return button;
}

function formatAddressLines(address) {
  const lineOne = `${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ''}`;
  const lineTwo = `${address.area ? `${address.area}, ` : ''}${address.city}, ${address.state} - ${address.pincode}`;
  return [lineOne, lineTwo];
}

function buildEmpty(config) {
  const empty = document.createElement('div');
  empty.className = 'addresses-empty';
  const text = document.createElement('p');
  text.textContent = config.emptyText;
  empty.append(text);
  return empty;
}

function buildAddressCard(address, state, config) {
  const card = document.createElement('article');
  card.className = address.isDefault ? 'address-card is-default' : 'address-card';

  if (address.isDefault) {
    const badge = document.createElement('span');
    badge.className = 'address-default-badge';
    badge.textContent = config.defaultBadgeText;
    card.append(badge);
  }

  const name = document.createElement('div');
  name.className = 'address-card-name';
  name.textContent = address.fullName;

  const phone = document.createElement('div');
  phone.className = 'address-card-phone';
  phone.textContent = address.phone;

  const lines = document.createElement('div');
  lines.className = 'address-card-lines';
  const addressLines = formatAddressLines(address);
  lines.append(document.createTextNode(addressLines[0]), document.createElement('br'), document.createTextNode(addressLines[1]));

  const actions = document.createElement('div');
  actions.className = 'address-card-actions';

  const edit = createButton('addr-action-btn', config.editText);
  edit.addEventListener('click', () => editAddress(address.id, state, config));
  actions.append(edit);

  if (!address.isDefault) {
    const setDefault = createButton('addr-action-btn set-default', config.setDefaultText);
    setDefault.addEventListener('click', () => setDefaultAddress(address.id, state));
    actions.append(setDefault);
  }

  const remove = createButton('addr-action-btn delete', config.deleteText);
  remove.addEventListener('click', () => deleteAddress(address.id, state, config));
  actions.append(remove);

  card.append(name, phone, lines, actions);
  return card;
}

function renderAddressList(state, config) {
  const list = getAllAddresses();
  state.list.textContent = '';

  if (!list.length) {
    state.list.append(buildEmpty(config));
    return;
  }

  list.forEach((address) => {
    state.list.append(buildAddressCard(address, state, config));
  });
}

function buildInput(id, type, placeholder, attrs = '') {
  return `<input type="${type}" id="${id}" placeholder="${escapeHtml(placeholder)}" ${attrs}>`;
}

function buildField(id, label, inputHtml, errorId, required = false) {
  const req = required ? ' <span class="req" aria-hidden="true">*</span>' : '';
  const error = errorId ? `<span class="addr-field-error" id="${errorId}" role="alert"></span>` : '';
  return `
    <div class="addr-field">
      <label for="${id}">${escapeHtml(label)}${req}</label>
      ${inputHtml}
      ${error}
    </div>
  `;
}

function buildStateOptions(config) {
  return [
    `<option value="">${escapeHtml(config.selectStateText)}</option>`,
    ...config.states.map((stateName) => `<option>${escapeHtml(stateName)}</option>`),
  ].join('');
}

function buildFormPanel(config) {
  const panel = document.createElement('aside');
  panel.className = 'address-form-panel';
  panel.setAttribute('aria-label', 'Address form');

  panel.innerHTML = `
    <h2 id="addrFormTitle">${escapeHtml(config.formTitleAdd)}</h2>
    <form class="address-form" novalidate>
      <input type="hidden" id="addrEditId">
      ${buildField(
    'addrFullName',
    config.fullNameLabel,
    buildInput('addrFullName', 'text', 'Priya Sharma', 'autocomplete="name"'),
    'errFullName',
    true,
  )}
      ${buildField(
    'addrPhone',
    config.phoneLabel,
    buildInput('addrPhone', 'tel', '9876543210', 'autocomplete="tel" inputmode="numeric" maxlength="10"'),
    'errPhone',
    true,
  )}
      ${buildField(
    'addrLine1',
    config.line1Label,
    buildInput('addrLine1', 'text', 'Flat 4B, Sunrise Apartments', 'autocomplete="address-line1"'),
    'errLine1',
    true,
  )}
      ${buildField(
    'addrLine2',
    config.line2Label,
    buildInput('addrLine2', 'text', 'MG Road', 'autocomplete="address-line2"'),
    '',
  )}
      ${buildField(
    'addrArea',
    config.areaLabel,
    buildInput('addrArea', 'text', 'Indiranagar'),
    '',
  )}
      <div class="addr-field-row">
        ${buildField(
    'addrCity',
    config.cityLabel,
    buildInput('addrCity', 'text', 'Bengaluru', 'autocomplete="address-level2"'),
    'errCity',
    true,
  )}
        ${buildField(
    'addrState',
    config.stateLabel,
    `<select id="addrState" autocomplete="address-level1">${buildStateOptions(config)}</select>`,
    'errState',
    true,
  )}
      </div>
      ${buildField(
    'addrPincode',
    config.pincodeLabel,
    buildInput('addrPincode', 'text', '560001', 'inputmode="numeric" maxlength="6" autocomplete="postal-code"'),
    'errPincode',
    true,
  )}
      <div class="addr-default-field">
        <input type="checkbox" id="addrSetDefault">
        <label for="addrSetDefault">${escapeHtml(config.defaultCheckboxText)}</label>
      </div>
      <button type="submit" class="addr-save-btn" id="addrSaveBtn">${escapeHtml(config.saveText)}</button>
      <button type="button" class="addr-cancel-btn hidden" id="addrCancelBtn">${escapeHtml(config.cancelText)}</button>
    </form>
  `;

  return panel;
}

function collectRefs(block) {
  const fieldIds = [
    'addrEditId',
    'addrFullName',
    'addrPhone',
    'addrLine1',
    'addrLine2',
    'addrArea',
    'addrCity',
    'addrState',
    'addrPincode',
    'addrSetDefault',
  ];
  const errorIds = ['errFullName', 'errPhone', 'errLine1', 'errCity', 'errState', 'errPincode'];

  return {
    fields: Object.fromEntries(fieldIds.map((id) => [id, block.querySelector(`#${id}`)])),
    errors: Object.fromEntries(errorIds.map((id) => [id, block.querySelector(`#${id}`)])),
    title: block.querySelector('#addrFormTitle'),
    save: block.querySelector('#addrSaveBtn'),
    cancel: block.querySelector('#addrCancelBtn'),
    form: block.querySelector('.address-form'),
    panel: block.querySelector('.address-form-panel'),
  };
}

function clearErrors(refs) {
  Object.values(refs.errors).forEach((error) => {
    if (error) error.textContent = '';
  });
  [
    refs.fields.addrFullName,
    refs.fields.addrPhone,
    refs.fields.addrLine1,
    refs.fields.addrCity,
    refs.fields.addrState,
    refs.fields.addrPincode,
  ].forEach((field) => field?.classList.remove('error'));
}

function setError(refs, fieldName, errorName, message) {
  refs.fields[fieldName]?.classList.add('error');
  if (refs.errors[errorName]) refs.errors[errorName].textContent = message;
}

function clearForm(state, config) {
  Object.entries(state.refs.fields).forEach(([key, field]) => {
    if (!field) return;
    if (key === 'addrSetDefault') {
      field.checked = false;
    } else {
      field.value = '';
    }
  });
  state.refs.title.textContent = config.formTitleAdd;
  state.refs.save.textContent = config.saveText;
  state.refs.cancel.classList.add('hidden');
  clearErrors(state.refs);
}

function validateForm(state, config) {
  const { refs } = state;
  clearErrors(refs);
  let valid = true;

  const fullName = refs.fields.addrFullName.value.trim();
  const phone = refs.fields.addrPhone.value.trim();
  const line1 = refs.fields.addrLine1.value.trim();
  const city = refs.fields.addrCity.value.trim();
  const selectedState = refs.fields.addrState.value;
  const pincode = refs.fields.addrPincode.value.trim();

  if (!fullName) {
    setError(refs, 'addrFullName', 'errFullName', config.fullNameError);
    valid = false;
  }
  if (!/^\d{10}$/.test(phone)) {
    setError(refs, 'addrPhone', 'errPhone', config.phoneError);
    valid = false;
  }
  if (!line1) {
    setError(refs, 'addrLine1', 'errLine1', config.line1Error);
    valid = false;
  }
  if (!city) {
    setError(refs, 'addrCity', 'errCity', config.cityError);
    valid = false;
  }
  if (!selectedState) {
    setError(refs, 'addrState', 'errState', config.stateError);
    valid = false;
  }
  if (!/^\d{6}$/.test(pincode)) {
    setError(refs, 'addrPincode', 'errPincode', config.pincodeError);
    valid = false;
  }

  return valid;
}

function getFormData(state) {
  const { fields } = state.refs;
  const editId = fields.addrEditId.value;

  return {
    id: editId || `addr_${Date.now()}`,
    fullName: fields.addrFullName.value.trim(),
    phone: fields.addrPhone.value.trim(),
    addressLine1: fields.addrLine1.value.trim(),
    addressLine2: fields.addrLine2.value.trim(),
    area: fields.addrArea.value.trim(),
    city: fields.addrCity.value.trim(),
    state: fields.addrState.value,
    pincode: fields.addrPincode.value.trim(),
    isDefault: fields.addrSetDefault.checked,
  };
}

function saveAddress(event, state, config) {
  event.preventDefault();

  if (!validateForm(state, config)) {
    showToast(config.validationText, 'error');
    return;
  }

  const editId = state.refs.fields.addrEditId.value;
  const data = getFormData(state);
  let list = getAllAddresses();

  if (editId) {
    list = list.map((address) => (address.id === editId ? { ...address, ...data } : address));
  } else {
    list.push(data);
  }

  if (data.isDefault) {
    list = list.map((address) => ({ ...address, isDefault: address.id === data.id }));
  }

  if (list.length === 1) {
    list[0].isDefault = true;
  }

  saveAllAddresses(list);
  clearForm(state, config);
  renderAddressList(state, config);

  const returnUrl = getReturnUrl();
  if (returnUrl) {
    queueToast(config.savedText, 'success');
    window.location.href = returnUrl;
    return;
  }

  showToast(config.savedText, 'success');
}

function editAddress(id, state, config) {
  const address = getAllAddresses().find((item) => item.id === id);
  if (!address) return;

  const { fields } = state.refs;
  fields.addrEditId.value = address.id;
  fields.addrFullName.value = address.fullName;
  fields.addrPhone.value = address.phone;
  fields.addrLine1.value = address.addressLine1;
  fields.addrLine2.value = address.addressLine2 || '';
  fields.addrArea.value = address.area || '';
  fields.addrCity.value = address.city;
  fields.addrState.value = address.state;
  fields.addrPincode.value = address.pincode;
  fields.addrSetDefault.checked = Boolean(address.isDefault);

  state.refs.title.textContent = config.formTitleEdit;
  state.refs.save.textContent = config.updateText;
  state.refs.cancel.classList.remove('hidden');
  clearErrors(state.refs);
  state.refs.panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteAddress(id, state, config) {
  if (!state.pendingDeleteIds.has(id)) {
    const timeout = window.setTimeout(() => state.pendingDeleteIds.delete(id), 4000);
    state.pendingDeleteIds.set(id, timeout);
    showToast(config.deleteConfirmText, 'warning');
    return;
  }

  window.clearTimeout(state.pendingDeleteIds.get(id));
  state.pendingDeleteIds.delete(id);

  const list = getAllAddresses().filter((address) => address.id !== id);
  if (list.length && !list.some((address) => address.isDefault)) {
    list[0].isDefault = true;
  }

  saveAllAddresses(list);
  renderAddressList(state, config);
  showToast(config.deletedText, 'success');
}

function setDefaultAddress(id, state) {
  const list = getAllAddresses().map((address) => ({
    ...address,
    isDefault: address.id === id,
  }));
  saveAllAddresses(list);
  renderAddressList(state, state.config);
}

function buildLayout(state, config) {
  const page = document.createElement('main');
  page.className = 'addresses-page';

  const body = document.createElement('div');
  body.className = 'addresses-body';

  const section = document.createElement('section');
  section.className = 'addresses-list-section';
  section.setAttribute('aria-label', 'Saved addresses');

  const title = document.createElement('h2');
  title.textContent = config.listTitle;

  const list = document.createElement('div');
  list.className = 'addresses-list';

  const addButton = createButton('btn-primary addresses-add-btn', config.showFormText);
  addButton.addEventListener('click', () => {
    clearForm(state, config);
    state.refs.panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  section.append(title, list, addButton);
  body.append(section, buildFormPanel(config));
  page.append(body);

  state.list = list;
  return page;
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  if (config.requireLogin && localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = `${config.loginPath}?return=${encodeURIComponent(getLoginReturn(config))}`;
    return;
  }

  const state = {
    block,
    config,
    list: null,
    refs: null,
    pendingDeleteIds: new Map(),
  };

  block.append(buildLayout(state, config));
  state.refs = collectRefs(block);
  state.refs.form.addEventListener('submit', (event) => saveAddress(event, state, config));
  state.refs.cancel.addEventListener('click', () => clearForm(state, config));
  renderAddressList(state, config);
}
