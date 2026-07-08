/* eslint-disable no-use-before-define, quotes */

const SVG_EYE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const SVG_EYE_OFF = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeInlineHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const inlineHtml = tmp.children.length === 1 && tmp.firstElementChild.tagName === 'P'
    ? tmp.firstElementChild.innerHTML.trim()
    : html;

  return inlineHtml
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
    .replace(/&lt;em&gt;/gi, '<em>')
    .replace(/&lt;\/em&gt;/gi, '</em>');
}

function readConfig(rows) {
  const config = {
    defaultReturnPath: '/',
    image: '/images/herbs/ashwagandha.webp',
    fallbackImage: '/images/herbs/turmeric.webp',
    imageAlt: 'Herb',
    visualTitle: "Nature's pharmacy,<br><em>curated for you</em>",
    herbCount: '40',
    herbCountLabel: 'Herbs',
    ailmentCount: '8',
    ailmentCountLabel: 'Ailments',
    signInTabText: 'Sign In',
    registerTabText: 'Create Account',
    signInTitle: 'Welcome back',
    signInDescription: 'Sign in to continue your herb journey',
    registerTitle: 'Create Account',
    registerDescription: 'Join thousands of herb enthusiasts',
    emailLabel: 'Email Address*',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password*',
    passwordPlaceholder: '........',
    rememberText: 'Remember me',
    forgotText: 'Forgot password?',
    firstNameLabel: 'First Name*',
    firstNamePlaceholder: 'Priya',
    lastNameLabel: 'Last Name',
    lastNamePlaceholder: 'Sharma',
    registerPasswordPlaceholder: 'Min 6 characters',
    confirmPasswordLabel: 'Confirm Password*',
    confirmPasswordPlaceholder: 'Repeat password',
    passwordRequirementsTitle: 'Password must include:',
    signInButtonText: 'Sign In',
    registerButtonText: 'Create Account',
    switchToRegisterText: "Don't have an account?",
    switchToRegisterLinkText: 'Create one free',
    switchToSignInText: 'Already have an account?',
    switchToSignInLinkText: 'Sign in',
    missingFieldsText: 'Please fill in all fields.',
    invalidEmailText: 'Please enter a valid email.',
    noAccountText: 'No account found with that email. Redirecting to sign up...',
    incorrectPasswordText: 'Incorrect password. Please try again.',
    passwordInvalidText: 'Password must include at least 6 characters, one uppercase letter, one lowercase letter, one number and one symbol.',
    passwordMismatchText: 'Passwords do not match.',
    existingAccountText: 'An account with this email already exists. Redirecting to sign in...',
    signInSuccessText: 'Account signed in successfully',
    registerSuccessText: 'Account created successfully. Welcome to HerbAtlas!',
    cartNoticeText: 'Sign in required to add items to your cart.',
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    [
      'default-return-path',
      'image',
      'fallback-image',
    ].forEach((fieldKey) => {
      if (key !== fieldKey) return;
      const prop = fieldKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      config[prop] = getHref(getCell(row, 1)) || config[prop];
    });

    if (key === 'visual-title') {
      config.visualTitle = normalizeInlineHtml(getHtml(getCell(row, 1))) || config.visualTitle;
      return;
    }

    [
      'image-alt',
      'herb-count',
      'herb-count-label',
      'ailment-count',
      'ailment-count-label',
      'sign-in-tab-text',
      'register-tab-text',
      'sign-in-title',
      'sign-in-description',
      'register-title',
      'register-description',
      'email-label',
      'email-placeholder',
      'password-label',
      'password-placeholder',
      'remember-text',
      'forgot-text',
      'first-name-label',
      'first-name-placeholder',
      'last-name-label',
      'last-name-placeholder',
      'register-password-placeholder',
      'confirm-password-label',
      'confirm-password-placeholder',
      'password-requirements-title',
      'sign-in-button-text',
      'register-button-text',
      'switch-to-register-text',
      'switch-to-register-link-text',
      'switch-to-sign-in-text',
      'switch-to-sign-in-link-text',
      'missing-fields-text',
      'invalid-email-text',
      'no-account-text',
      'incorrect-password-text',
      'password-invalid-text',
      'password-mismatch-text',
      'existing-account-text',
      'sign-in-success-text',
      'register-success-text',
      'cart-notice-text',
    ].forEach((fieldKey) => {
      if (key !== fieldKey) return;
      const prop = fieldKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
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

function writeUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getUsers() {
  const users = readJsonStorage(localStorage, 'users', []);
  return Array.isArray(users) ? users : [];
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordRules(value) {
  return {
    length: value.length >= 6,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };
}

function isPasswordValid(value) {
  return Object.values(getPasswordRules(value)).every(Boolean);
}

function getRequestedTab() {
  return new URLSearchParams(window.location.search).get('tab') === 'register' ? 'register' : 'signin';
}

function getSafeReturnUrl(config) {
  const params = new URLSearchParams(window.location.search);
  const target = params.get('return') || config.defaultReturnPath;
  const safeTarget = target.includes('://') ? config.defaultReturnPath : target;

  if (params.get('notice') === 'cart' && ['/shop', 'shop.html'].includes(safeTarget)) {
    return `${safeTarget}?cartReady=1`;
  }

  return safeTarget;
}

function showError(element, message, notify = true) {
  element.textContent = message;
  element.classList.remove('hidden');
  if (notify) showToast(message, 'error');
}

function hideError(element) {
  element.textContent = '';
  element.classList.add('hidden');
}

function setAuthUser(user) {
  localStorage.setItem('loggedIn', 'true');
  localStorage.setItem('userName', user.firstName);
  localStorage.setItem('userEmail', user.email);
}

function buildPasswordButton() {
  const button = document.createElement('button');
  button.className = 'pwd-toggle';
  button.type = 'button';
  button.setAttribute('aria-label', 'Toggle password visibility');
  button.innerHTML = SVG_EYE;
  return button;
}

function buildPasswordControl(id, placeholder, autocomplete) {
  const wrap = document.createElement('div');
  wrap.className = 'password-wrap';

  const input = document.createElement('input');
  input.type = 'password';
  input.id = id;
  input.placeholder = placeholder;
  input.autocomplete = autocomplete;

  const button = buildPasswordButton();
  button.addEventListener('click', () => {
    const isShowing = input.type === 'text';
    input.type = isShowing ? 'password' : 'text';
    button.innerHTML = isShowing ? SVG_EYE : SVG_EYE_OFF;
    button.classList.toggle('active', !isShowing);
  });

  wrap.append(input, button);
  return wrap;
}

function buildField(labelText, input) {
  const field = document.createElement('div');
  field.className = 'form-field';

  const label = document.createElement('label');
  label.htmlFor = input.id || input.querySelector('input')?.id;
  label.textContent = labelText;

  field.append(label, input);
  return field;
}

function buildTextInput(id, type, placeholder, autocomplete) {
  const input = document.createElement('input');
  input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.autocomplete = autocomplete;
  return input;
}

function buildPasswordRequirements(config) {
  const wrap = document.createElement('div');
  wrap.className = 'password-requirements';
  wrap.id = 'passwordRequirements';
  wrap.setAttribute('aria-live', 'polite');

  const title = document.createElement('p');
  title.textContent = config.passwordRequirementsTitle;

  const list = document.createElement('ul');
  [
    ['length', 'Minimum 6 characters'],
    ['upper', 'One uppercase letter'],
    ['lower', 'One lowercase letter'],
    ['number', 'One number'],
    ['symbol', 'One symbol'],
  ].forEach(([rule, text]) => {
    const item = document.createElement('li');
    item.dataset.passwordRule = rule;
    item.textContent = text;
    list.append(item);
  });

  wrap.append(title, list);
  return wrap;
}

function buildStrength() {
  const fragment = document.createDocumentFragment();
  const bar = document.createElement('div');
  bar.className = 'strength-bar';
  const fill = document.createElement('div');
  fill.className = 'strength-fill';
  bar.append(fill);

  const label = document.createElement('span');
  label.className = 'strength-label';
  fragment.append(bar, label);

  return { fragment, fill, label };
}

function buildFormHeader(titleText, descriptionText) {
  const header = document.createElement('div');
  header.className = 'form-header';

  const title = document.createElement('h2');
  title.textContent = titleText;

  const description = document.createElement('p');
  description.textContent = descriptionText;

  header.append(title, description);
  return header;
}

function buildSignInForm(state, config) {
  const panel = document.createElement('form');
  panel.className = 'login-form-panel';
  panel.id = 'signinForm';
  panel.noValidate = true;

  panel.append(
    buildFormHeader(config.signInTitle, config.signInDescription),
    buildField(config.emailLabel, buildTextInput('signinEmail', 'email', config.emailPlaceholder, 'email')),
    buildField(config.passwordLabel, buildPasswordControl('signinPassword', config.passwordPlaceholder, 'current-password')),
  );

  const row = document.createElement('div');
  row.className = 'form-row-between';
  row.innerHTML = `
    <label class="remember-check"><input type="checkbox" id="rememberMe">${escapeHtml(config.rememberText)}</label>
    <a href="#" class="forgot-link">${escapeHtml(config.forgotText)}</a>
  `;

  const error = document.createElement('div');
  error.className = 'login-error hidden';
  error.id = 'signinError';

  const button = document.createElement('button');
  button.className = 'login-btn';
  button.type = 'submit';
  button.textContent = config.signInButtonText;

  const switchText = document.createElement('p');
  switchText.className = 'switch-text';
  switchText.innerHTML = `${escapeHtml(config.switchToRegisterText)} <a href="#">${escapeHtml(config.switchToRegisterLinkText)}</a>`;
  switchText.querySelector('a').addEventListener('click', (event) => {
    event.preventDefault();
    switchTab(state, 'register');
  });

  row.querySelector('.forgot-link').addEventListener('click', (event) => event.preventDefault());
  panel.append(row, error, button, switchText);
  panel.addEventListener('submit', (event) => signIn(event, state, config));

  return panel;
}

function buildRegisterForm(state, config) {
  const panel = document.createElement('form');
  panel.className = 'login-form-panel hidden';
  panel.id = 'registerForm';
  panel.noValidate = true;

  const nameRow = document.createElement('div');
  nameRow.className = 'form-row-2col';
  nameRow.append(
    buildField(config.firstNameLabel, buildTextInput('regFirstName', 'text', config.firstNamePlaceholder, 'given-name')),
    buildField(config.lastNameLabel, buildTextInput('regLastName', 'text', config.lastNamePlaceholder, 'family-name')),
  );

  const passwordField = buildField(
    config.passwordLabel,
    buildPasswordControl('regPassword', config.registerPasswordPlaceholder, 'new-password'),
  );
  const requirements = buildPasswordRequirements(config);
  const strength = buildStrength();
  passwordField.append(requirements, strength.fragment);

  const passwordInput = passwordField.querySelector('#regPassword');
  passwordInput.setAttribute('aria-describedby', 'passwordRequirements');
  passwordInput.addEventListener('focus', () => requirements.classList.add('open'));
  passwordInput.addEventListener('blur', () => {
    if (!passwordInput.value) requirements.classList.remove('open');
  });
  passwordInput.addEventListener('input', () => updatePasswordFeedback(passwordInput.value, requirements, strength));

  panel.append(
    buildFormHeader(config.registerTitle, config.registerDescription),
    nameRow,
    buildField(config.emailLabel, buildTextInput('regEmail', 'email', config.emailPlaceholder, 'email')),
    passwordField,
    buildField(config.confirmPasswordLabel, buildPasswordControl('regConfirm', config.confirmPasswordPlaceholder, 'new-password')),
  );

  const error = document.createElement('div');
  error.className = 'login-error hidden';
  error.id = 'registerError';

  const button = document.createElement('button');
  button.className = 'login-btn';
  button.type = 'submit';
  button.textContent = config.registerButtonText;

  const switchText = document.createElement('p');
  switchText.className = 'switch-text';
  switchText.innerHTML = `${escapeHtml(config.switchToSignInText)} <a href="#">${escapeHtml(config.switchToSignInLinkText)}</a>`;
  switchText.querySelector('a').addEventListener('click', (event) => {
    event.preventDefault();
    switchTab(state, 'signin');
  });

  panel.append(error, button, switchText);
  panel.addEventListener('submit', (event) => register(event, state, config));

  return panel;
}

function updatePasswordFeedback(value, requirements, strength) {
  requirements.classList.add('open');
  const rules = getPasswordRules(value);
  Object.entries(rules).forEach(([rule, met]) => {
    requirements.querySelector(`[data-password-rule="${rule}"]`)?.classList.toggle('met', met);
  });

  if (!value) {
    strength.fill.style.width = '0';
    strength.label.textContent = '';
    return;
  }

  const score = Object.values(rules).filter(Boolean).length;
  const levels = [
    { pct: '20%', color: '#e57373', text: 'Very weak' },
    { pct: '40%', color: '#ffb74d', text: 'Weak' },
    { pct: '60%', color: '#ffd54f', text: 'Fair' },
    { pct: '80%', color: '#81c784', text: 'Strong' },
    { pct: '100%', color: '#388e3c', text: 'Very strong' },
  ];
  const level = levels[Math.max(score - 1, 0)];
  strength.fill.style.width = level.pct;
  strength.fill.style.backgroundColor = level.color;
  strength.label.textContent = level.text;
}

function switchTab(state, tab) {
  if (state.currentTab === tab) return;

  const isRegister = tab === 'register';
  const outEl = isRegister ? state.signInForm : state.registerForm;
  const inEl = isRegister ? state.registerForm : state.signInForm;
  const outClass = isRegister ? 'form-slide-out-left' : 'form-slide-out-right';
  const inClass = isRegister ? 'form-slide-in-right' : 'form-slide-in-left';

  outEl.classList.add(outClass);
  window.setTimeout(() => {
    outEl.classList.add('hidden');
    outEl.classList.remove(outClass);
    inEl.classList.remove('hidden');
    inEl.classList.add(inClass);
    window.setTimeout(() => inEl.classList.remove(inClass), 360);
  }, 260);

  state.indicator.classList.toggle('right', isRegister);
  state.signInTab.classList.toggle('active', !isRegister);
  state.registerTab.classList.toggle('active', isRegister);
  state.currentTab = tab;
}

function redirectAfterAuth(config) {
  window.location.href = getSafeReturnUrl(config);
}

function signIn(event, state, config) {
  event.preventDefault();
  const email = state.block.querySelector('#signinEmail').value.trim();
  const password = state.block.querySelector('#signinPassword').value;
  const error = state.block.querySelector('#signinError');

  if (!email || !password) {
    showError(error, config.missingFieldsText);
    return;
  }

  if (!isValidEmail(email)) {
    showError(error, config.invalidEmailText);
    return;
  }

  const users = getUsers();
  const emailMatch = users.find((user) => user.email === email);
  const fullMatch = users.find((user) => user.email === email && user.password === password);

  if (!emailMatch) {
    showError(error, config.noAccountText);
    window.setTimeout(() => {
      state.block.querySelector('#regEmail').value = email;
      switchTab(state, 'register');
      hideError(error);
    }, 1400);
    return;
  }

  if (!fullMatch) {
    showError(error, config.incorrectPasswordText);
    return;
  }

  setAuthUser(fullMatch);
  queueToast(config.signInSuccessText, 'success');
  redirectAfterAuth(config);
}

function register(event, state, config) {
  event.preventDefault();

  const firstName = state.block.querySelector('#regFirstName').value.trim();
  const lastName = state.block.querySelector('#regLastName').value.trim();
  const email = state.block.querySelector('#regEmail').value.trim();
  const password = state.block.querySelector('#regPassword').value;
  const confirm = state.block.querySelector('#regConfirm').value;
  const error = state.block.querySelector('#registerError');

  if (!firstName || !lastName || !email || !password || !confirm) {
    showError(error, config.missingFieldsText);
    return;
  }

  if (!isValidEmail(email)) {
    showError(error, config.invalidEmailText);
    return;
  }

  if (!isPasswordValid(password)) {
    const passwordField = state.block.querySelector('#regPassword');
    const requirements = state.block.querySelector('#passwordRequirements');
    requirements.classList.add('open');
    updatePasswordFeedback(password, requirements, {
      fill: state.block.querySelector('.strength-fill'),
      label: state.block.querySelector('.strength-label'),
    });
    passwordField.focus();
    showError(error, config.passwordInvalidText);
    return;
  }

  if (password !== confirm) {
    showError(error, config.passwordMismatchText);
    return;
  }

  const users = getUsers();
  if (users.find((user) => user.email === email)) {
    showError(error, config.existingAccountText);
    window.setTimeout(() => {
      state.block.querySelector('#signinEmail').value = email;
      switchTab(state, 'signin');
      hideError(error);
    }, 1400);
    return;
  }

  const user = {
    firstName,
    lastName,
    email,
    password,
  };

  users.push(user);
  writeUsers(users);
  setAuthUser(user);
  queueToast(config.registerSuccessText, 'success');
  redirectAfterAuth(config);
}

async function updateHerbCount(element, fallback) {
  element.textContent = fallback;
  try {
    const response = await fetch('/data/herbs.json');
    if (!response.ok) return;
    const herbs = await response.json();
    if (Array.isArray(herbs) && herbs.length) element.textContent = `${herbs.length}+`;
  } catch {
    element.textContent = fallback;
  }
}

function buildVisual(config) {
  const visual = document.createElement('div');
  visual.className = 'login-visual';

  visual.innerHTML = `
    <div class="login-visual-inner">
      <div class="login-visual-hero">
        <img src="${escapeHtml(config.image)}" alt="${escapeHtml(config.imageAlt)}" class="login-hero-img">
        <div class="login-hero-ring"></div>
        <div class="login-hero-ring login-hero-ring-2"></div>
      </div>
      <p class="login-visual-title">${config.visualTitle}</p>
      <div class="login-stats">
        <div class="login-stat">
          <span class="stat-n login-herb-count">${escapeHtml(config.herbCount)}</span>
          <span class="stat-l">${escapeHtml(config.herbCountLabel)}</span>
        </div>
        <div class="login-stat-div"></div>
        <div class="login-stat">
          <span class="stat-n">${escapeHtml(config.ailmentCount)}</span>
          <span class="stat-l">${escapeHtml(config.ailmentCountLabel)}</span>
        </div>
      </div>
    </div>
  `;

  const image = visual.querySelector('img');
  image.addEventListener('error', () => {
    if (image.src.endsWith(config.fallbackImage)) return;
    image.src = config.fallbackImage;
  });

  updateHerbCount(visual.querySelector('.login-herb-count'), config.herbCount);
  return visual;
}

function buildTabs(state, config) {
  const tabs = document.createElement('div');
  tabs.className = 'login-tabs';

  const signInTab = document.createElement('button');
  signInTab.className = 'login-tab active';
  signInTab.type = 'button';
  signInTab.textContent = config.signInTabText;

  const registerTab = document.createElement('button');
  registerTab.className = 'login-tab';
  registerTab.type = 'button';
  registerTab.textContent = config.registerTabText;

  const indicator = document.createElement('div');
  indicator.className = 'login-tab-indicator';

  state.signInTab = signInTab;
  state.registerTab = registerTab;
  state.indicator = indicator;

  signInTab.addEventListener('click', () => switchTab(state, 'signin'));
  registerTab.addEventListener('click', () => switchTab(state, 'register'));

  tabs.append(signInTab, registerTab, indicator);
  return tabs;
}

function buildFormSide(state, config) {
  const side = document.createElement('div');
  side.className = 'login-form-side';

  const wrap = document.createElement('div');
  wrap.className = 'login-form-wrap';

  const forms = document.createElement('div');
  forms.className = 'login-forms-container';
  state.signInForm = buildSignInForm(state, config);
  state.registerForm = buildRegisterForm(state, config);
  forms.append(state.signInForm, state.registerForm);

  wrap.append(buildTabs(state, config), forms);
  side.append(wrap);
  return side;
}

function handleInitialState(state, config) {
  if (localStorage.getItem('loggedIn') === 'true') {
    redirectAfterAuth(config);
    return;
  }

  if (getRequestedTab() === 'register') {
    state.currentTab = 'signin';
    switchTab(state, 'register');
  }

  const params = new URLSearchParams(window.location.search);
  const notice = sessionStorage.getItem('authNotice') || params.get('notice');
  if (!notice) return;

  const message = notice === 'cart' ? config.cartNoticeText : notice;
  showToast(message, notice === 'cart' ? 'warning' : 'info');
  showError(state.block.querySelector('#signinError'), message, false);
  sessionStorage.removeItem('authNotice');
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const state = {
    block,
    currentTab: 'signin',
    signInForm: null,
    registerForm: null,
    signInTab: null,
    registerTab: null,
    indicator: null,
  };

  const page = document.createElement('div');
  page.className = 'login-page';
  page.append(buildVisual(config), buildFormSide(state, config));

  block.append(page);
  handleInitialState(state, config);
}
