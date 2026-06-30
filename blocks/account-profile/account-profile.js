const PROFILE_KEY = 'userProfiles';

const DEFAULT_GOALS = [
  ['Stress & Anxiety', 'Stress'],
  ['Sleep Issues', 'Sleep'],
  ['Low Immunity', 'Immunity'],
  ['Digestion', 'Digestion'],
  ['Skin Problems', 'Skin'],
  ['Joint Pain', 'Joint Pain'],
  ['Low Energy', 'Energy'],
  ['Hormonal Balance', 'Hormonal'],
];

const DEFAULT_AVOID = [
  ['pregnant', 'Pregnant', 'female'],
  ['breastfeeding', 'Breastfeeding', 'female'],
  ['blood thinners', 'Blood thinners', 'all'],
  ['diabetes medications', 'Diabetes medication', 'all'],
  ['high blood pressure', 'High blood pressure', 'all'],
  ['autoimmune', 'Autoimmune condition', 'all'],
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

function readOptionRows(rows, rowKey, defaults) {
  const items = [];

  rows.forEach((row) => {
    if (normalizeKey(getCell(row, 0)) !== rowKey) return;
    const value = getText(getCell(row, 1));
    const label = getText(getCell(row, 2));
    const visibility = getText(getCell(row, 3)).toLowerCase();
    if (!value || !label) return;
    items.push([value, label, visibility || 'all']);
  });

  return items.length ? items : defaults;
}

function readConfig(rows) {
  const config = {
    loginPath: '/login',
    accountPath: '/account',
    profilePath: '/profile',
    recommendationsPath: '/#recommendedForYou',
    contactPath: '/contact',
    requireLogin: true,
    summaryLabel: 'Saved Profile',
    noGoalsText: 'No goals saved yet',
    incompleteText: 'Complete the form to unlock home-page recommendations.',
    safeOnlyText: 'Safe-only recommendations.',
    allSuitableText: 'All suitable recommendations.',
    viewRecommendationsText: 'View recommendations',
    contactSupportText: 'Contact support',
    panelTitle: 'Basic Details',
    notSavedText: 'Not saved yet',
    savedText: 'Profile saved',
    saveSuccessText: 'Profile saved successfully',
    ageLabel: 'Age',
    agePlaceholder: 'Example: 28',
    sexLabel: 'Sex',
    sexAnyText: 'Prefer not to say',
    sexFemaleText: 'Female',
    sexMaleText: 'Male',
    goalsTitle: 'Primary wellness goals',
    safetyNotesTitle: 'Safety notes',
    safetyPreferenceLabel: 'Safety preference',
    safeOnlyOption: 'Safe only',
    allSuitableOption: 'Show all suitable herbs',
    saveButtonText: 'Save Profile',
    authNoticeText: 'Sign in required to open your account.',
    goals: readOptionRows(rows, 'goal', DEFAULT_GOALS),
    avoid: readOptionRows(rows, 'safety-note', DEFAULT_AVOID),
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    [
      'login-path',
      'account-path',
      'profile-path',
      'recommendations-path',
      'contact-path',
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
      'summary-label',
      'no-goals-text',
      'incomplete-text',
      'safe-only-text',
      'all-suitable-text',
      'view-recommendations-text',
      'contact-support-text',
      'panel-title',
      'not-saved-text',
      'saved-text',
      'save-success-text',
      'age-label',
      'age-placeholder',
      'sex-label',
      'sex-any-text',
      'sex-female-text',
      'sex-male-text',
      'goals-title',
      'safety-notes-title',
      'safety-preference-label',
      'safe-only-option',
      'all-suitable-option',
      'save-button-text',
      'auth-notice-text',
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

function getUserEmail() {
  return localStorage.getItem('userEmail') || '';
}

function getUserName() {
  return localStorage.getItem('userName') || 'there';
}

function getProfiles() {
  return readJsonStorage(localStorage, PROFILE_KEY, {});
}

function getProfile() {
  return getProfiles()[getUserEmail()] || null;
}

function saveProfile(profile) {
  const profiles = getProfiles();
  profiles[getUserEmail()] = profile;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
}

function showToast(message, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
  }
}

function getLoginHref(config) {
  sessionStorage.setItem('authNotice', config.authNoticeText);
  const returnPath = config.accountPath || window.location.pathname;
  return `${config.loginPath}?notice=${encodeURIComponent(config.authNoticeText)}&return=${encodeURIComponent(returnPath)}`;
}

function requireLogin(config) {
  if (!config.requireLogin) return false;
  if (localStorage.getItem('loggedIn') === 'true' && getUserEmail()) return false;
  window.location.href = getLoginHref(config);
  return true;
}

function buildOption(value, label, className = '') {
  const option = document.createElement('label');
  option.className = className ? `account-profile-option ${className}` : 'account-profile-option';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.value = value;

  option.append(input, document.createTextNode(` ${label}`));
  return option;
}

function buildOptionGroup(titleText, className) {
  const field = document.createElement('div');
  field.className = 'account-profile-field';

  const title = document.createElement('div');
  title.className = 'account-profile-field-title';
  title.textContent = titleText;

  const grid = document.createElement('div');
  grid.className = className;

  field.append(title, grid);
  return { field, grid };
}

function buildSelect(id, options) {
  const select = document.createElement('select');
  select.id = id;

  options.forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.append(option);
  });

  return select;
}

function buildField(labelText, input) {
  const label = document.createElement('label');
  label.className = 'account-profile-label';
  label.htmlFor = input.id;
  label.append(document.createTextNode(labelText), input);
  return label;
}

function buildSummary(config) {
  const summary = document.createElement('aside');
  summary.className = 'account-profile-summary';

  const copy = document.createElement('div');

  const label = document.createElement('span');
  label.className = 'account-profile-summary-label';
  label.textContent = config.summaryLabel;

  const goals = document.createElement('strong');
  goals.className = 'account-profile-summary-goals';

  const meta = document.createElement('p');
  meta.className = 'account-profile-summary-meta';

  copy.append(label, goals, meta);

  const actions = document.createElement('div');
  actions.className = 'account-profile-summary-actions';

  const recommendations = document.createElement('a');
  recommendations.href = config.recommendationsPath;
  recommendations.textContent = config.viewRecommendationsText;

  const contact = document.createElement('a');
  contact.href = config.contactPath;
  contact.textContent = config.contactSupportText;

  actions.append(recommendations, contact);
  summary.append(copy, actions);

  return { summary, goals, meta };
}

function buildForm(config) {
  const form = document.createElement('form');
  form.className = 'account-profile-panel';
  form.noValidate = true;

  const head = document.createElement('div');
  head.className = 'account-profile-panel-head';

  const title = document.createElement('h2');
  title.textContent = config.panelTitle;

  const status = document.createElement('span');
  status.className = 'account-profile-save-status';
  status.textContent = config.notSavedText;

  head.append(title, status);

  const row = document.createElement('div');
  row.className = 'account-profile-form-row';

  const age = document.createElement('input');
  age.id = 'accountProfileAge';
  age.type = 'number';
  age.min = '1';
  age.max = '100';
  age.placeholder = config.agePlaceholder;
  row.append(buildField(config.ageLabel, age));

  const sex = buildSelect('accountProfileSex', [
    ['any', config.sexAnyText],
    ['female', config.sexFemaleText],
    ['male', config.sexMaleText],
  ]);
  row.append(buildField(config.sexLabel, sex));

  const goals = buildOptionGroup(config.goalsTitle, 'account-profile-option-grid');
  config.goals.forEach(([value, label]) => goals.grid.append(buildOption(value, label)));

  const avoid = buildOptionGroup(config.safetyNotesTitle, 'account-profile-option-grid');
  config.avoid.forEach(([value, label, visibility]) => {
    avoid.grid.append(buildOption(value, label, visibility === 'female' ? 'female-only' : ''));
  });

  const safety = buildSelect('accountProfileSafety', [
    ['safe', config.safeOnlyOption],
    ['all', config.allSuitableOption],
  ]);

  const save = document.createElement('button');
  save.className = 'account-profile-save';
  save.type = 'submit';
  save.textContent = config.saveButtonText;

  form.append(
    head,
    row,
    goals.field,
    avoid.field,
    buildField(config.safetyPreferenceLabel, safety),
    save,
  );

  return {
    form,
    status,
    age,
    sex,
    safety,
    goalsGrid: goals.grid,
    avoidGrid: avoid.grid,
  };
}

function getCheckedValues(container) {
  return [...container.querySelectorAll('input:checked')].map((input) => input.value);
}

function setCheckedValues(container, values) {
  container.querySelectorAll('input').forEach((input) => {
    input.checked = values.includes(input.value);
  });
}

function updateFemaleOptions(refs) {
  const isFemale = refs.sex.value === 'female';
  refs.avoidGrid.querySelectorAll('.female-only').forEach((option) => {
    option.hidden = !isFemale;
    if (!isFemale) option.querySelector('input').checked = false;
  });
}

function updateSummary(refs, profile, config) {
  if (!profile?.goals?.length) {
    refs.summaryGoals.textContent = config.noGoalsText;
    refs.summaryMeta.textContent = config.incompleteText;
    return;
  }

  refs.summaryGoals.textContent = profile.goals.slice(0, 3).join(', ');
  refs.summaryMeta.textContent = profile.safety === 'safe'
    ? config.safeOnlyText
    : config.allSuitableText;
}

function loadProfile(refs, config) {
  const profile = getProfile();
  if (!profile) {
    updateFemaleOptions(refs);
    updateSummary(refs, null, config);
    return;
  }

  refs.age.value = profile.age || '';
  refs.sex.value = profile.sex || 'any';
  refs.safety.value = profile.safety || 'safe';
  setCheckedValues(refs.goalsGrid, profile.goals || []);
  setCheckedValues(refs.avoidGrid, profile.avoid || []);
  refs.status.textContent = config.savedText;
  updateFemaleOptions(refs);
  updateSummary(refs, profile, config);
}

function collectProfile(refs) {
  return {
    age: parseInt(refs.age.value, 10) || 0,
    sex: refs.sex.value,
    safety: refs.safety.value,
    goals: getCheckedValues(refs.goalsGrid),
    avoid: getCheckedValues(refs.avoidGrid).map((value) => value.toLowerCase()),
    savedAt: new Date().toISOString(),
  };
}

function saveCurrentProfile(event, refs, config) {
  event.preventDefault();
  const profile = collectProfile(refs);
  saveProfile(profile);
  refs.status.textContent = config.saveSuccessText;
  refs.status.classList.add('success');
  refs.status.hidden = false;
  updateSummary(refs, profile, config);
  showToast(config.saveSuccessText, 'success');

  window.setTimeout(() => {
    refs.status.textContent = config.savedText;
    refs.status.classList.remove('success');
  }, 3000);
}

function buildLayout(config) {
  const page = document.createElement('main');
  page.className = 'account-profile-page';

  const grid = document.createElement('section');
  grid.className = 'account-profile-grid';

  const summaryRefs = buildSummary(config);
  const formRefs = buildForm(config);

  grid.append(summaryRefs.summary, formRefs.form);
  page.append(grid);

  return {
    page,
    ...formRefs,
    summaryGoals: summaryRefs.goals,
    summaryMeta: summaryRefs.meta,
  };
}

function updateAccountHeroIntro(block) {
  const main = block.closest('main') || document;
  const hero = main.querySelector('.hero.simple.dark') || document.querySelector('.hero.simple.dark');
  const description = hero?.querySelector('.hero-description');
  if (!description) return;

  description.textContent = `Hi ${getUserName()}, save your details once and HerbAtlas will tune home-page recommendations to your profile.`;
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  if (requireLogin(config)) return;

  updateAccountHeroIntro(block);

  const refs = buildLayout(config);
  block.append(refs.page);

  refs.sex.addEventListener('change', () => updateFemaleOptions(refs));
  refs.form.addEventListener('submit', (event) => saveCurrentProfile(event, refs, config));
  loadProfile(refs, config);
}
