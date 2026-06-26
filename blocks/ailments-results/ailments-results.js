const DEFAULT_AILMENTS_DATA = '/data/ailments.json';
const DEFAULT_HERBS_DATA = '/data/herbs.json';
const DEFAULT_PAGE_SIZE = 4;

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
    ailmentsData: DEFAULT_AILMENTS_DATA,
    herbsData: DEFAULT_HERBS_DATA,
    detailBase: '/herb-detail',
    pageSize: DEFAULT_PAGE_SIZE,
    clearText: 'Clear',
    resultsTitlePrefix: 'Herbs for',
    emptyTitle: 'No herbs found',
    emptyText: 'No herbs are mapped to this concern yet.',
    unavailableText: 'Ailment recommendations are unavailable right now.',
    guides: [],
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    if (key === 'ailments-data' || key === 'ailment-data') {
      config.ailmentsData = getHref(getCell(row, 1)) || config.ailmentsData;
      return;
    }

    if (key === 'herbs-data' || key === 'herb-data') {
      config.herbsData = getHref(getCell(row, 1)) || config.herbsData;
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

    if (key === 'clear-text') {
      config.clearText = value || config.clearText;
      return;
    }

    if (key === 'results-title-prefix') {
      config.resultsTitlePrefix = value || config.resultsTitlePrefix;
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

    if (key === 'unavailable-text') {
      config.unavailableText = value || config.unavailableText;
      return;
    }

    if (key === 'guide') {
      config.guides.push({
        number: value,
        title: getText(getCell(row, 2)),
        text: getText(getCell(row, 3)),
      });
    }
  });

  if (!config.guides.length) {
    config.guides = [
      {
        number: '1',
        title: 'Choose a concern',
        text: 'Start with the symptom or wellness goal you care about most.',
      },
      {
        number: '2',
        title: 'Compare herbs',
        text: 'Review best-for labels and safety status before opening details.',
      },
      {
        number: '3',
        title: 'Save your profile',
        text: 'Use Account for personal recommendations on the home page.',
      },
    ];
  }

  return config;
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load ${url}`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function getSafetyLabel(safety) {
  return safety === 'safe' ? 'Generally Safe' : 'Use with Caution';
}

function getDetailHref(herb, detailBase) {
  const separator = detailBase.includes('?') ? '&' : '?';
  return `${detailBase}${separator}id=${encodeURIComponent(herb.id)}`;
}

function truncateText(text, maxLength = 80) {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trim()}...`;
}

function buildGuide(config) {
  const guide = document.createElement('section');
  guide.className = 'ailments-results-guide';
  guide.setAttribute('aria-label', 'How to use ailment recommendations');

  config.guides.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'ailments-results-guide-card';

    const number = document.createElement('span');
    number.textContent = item.number;
    card.append(number);

    const title = document.createElement('strong');
    title.textContent = item.title;
    card.append(title);

    const text = document.createElement('p');
    text.textContent = item.text;
    card.append(text);

    guide.append(card);
  });

  return guide;
}

function buildAilmentCard(ailment) {
  const card = document.createElement('button');
  card.className = 'ailments-results-ailment-card';
  card.type = 'button';
  card.dataset.ailmentId = ailment.id;

  const icon = document.createElement('span');
  icon.className = 'ailments-results-ailment-icon';

  const image = document.createElement('img');
  image.src = ailment.icon;
  image.alt = ailment.name;
  image.width = 32;
  image.height = 32;
  image.loading = 'lazy';
  image.addEventListener('error', () => {
    icon.textContent = 'Herb';
  }, { once: true });
  icon.append(image);
  card.append(icon);

  const title = document.createElement('span');
  title.className = 'ailments-results-ailment-title';
  title.textContent = ailment.name;
  card.append(title);

  const description = document.createElement('span');
  description.className = 'ailments-results-ailment-desc';
  description.textContent = ailment.description;
  card.append(description);

  const count = document.createElement('span');
  count.className = 'ailments-results-ailment-count';
  count.textContent = `${ailment.herb_ids?.length || 0} herbs`;
  card.append(count);

  return card;
}

function buildTag(text, className) {
  const tag = document.createElement('span');
  tag.className = `ailments-results-tag ${className}`;
  tag.textContent = text;
  return tag;
}

function buildHerbCard(herb, config, isFirst) {
  const card = document.createElement('a');
  card.className = 'ailments-results-herb-card';
  card.href = getDetailHref(herb, config.detailBase);
  card.setAttribute('aria-label', `View ${herb.name}`);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'ailments-results-herb-img';

  const image = document.createElement('img');
  image.src = herb.image;
  image.alt = `${herb.name} - ${herb.scientific_name}`;
  image.width = 300;
  image.height = 190;
  if (isFirst) {
    image.fetchPriority = 'high';
  } else {
    image.loading = 'lazy';
  }
  image.addEventListener('error', () => {
    image.style.display = 'none';
  }, { once: true });
  imageWrap.append(image);

  const badge = document.createElement('span');
  badge.className = 'ailments-results-herb-badge';
  badge.textContent = getSafetyLabel(herb.safety);
  imageWrap.append(badge);
  card.append(imageWrap);

  const body = document.createElement('div');
  body.className = 'ailments-results-herb-body';

  const title = document.createElement('h3');
  title.textContent = herb.name;
  body.append(title);

  const scientificName = document.createElement('span');
  scientificName.className = 'ailments-results-herb-sci';
  scientificName.textContent = herb.scientific_name;
  body.append(scientificName);

  const description = document.createElement('p');
  description.textContent = truncateText(herb.description);
  body.append(description);

  const tags = document.createElement('div');
  tags.className = 'ailments-results-tags';
  tags.append(
    buildTag(herb.best_for, 'tag-green'),
    buildTag(getSafetyLabel(herb.safety), `tag-${herb.safety}`),
  );
  body.append(tags);

  card.append(body);
  return card;
}

function getSelectedHerbs(state) {
  const ailment = state.ailments.find((item) => item.id === state.selectedAilmentId);
  if (!ailment) return [];
  const ids = new Set(ailment.herb_ids || []);
  return state.herbs.filter((herb) => ids.has(herb.id));
}

function getCountText(total, start, end) {
  if (total === 0) return 'Showing 0 herbs';
  return `Showing ${start + 1}-${end} of ${total} herbs`;
}

function scrollToResults(results) {
  const top = results.getBoundingClientRect().top + window.scrollY - 110;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function renderPagination(state, shell, onPageChange) {
  const herbs = getSelectedHerbs(state);
  const totalPages = Math.ceil(herbs.length / state.config.pageSize);
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
      onPageChange(page);
    });

    shell.pagination.append(button);
  };

  addButton('<', state.currentPage - 1, 'ailments-results-page arrow', state.currentPage === 1);

  for (let page = 1; page <= totalPages; page += 1) {
    addButton(
      String(page),
      page,
      page === state.currentPage
        ? 'ailments-results-page active'
        : 'ailments-results-page',
      false,
      page === state.currentPage,
    );
  }

  addButton('>', state.currentPage + 1, 'ailments-results-page arrow', state.currentPage === totalPages);
}

function renderResults(state, shell, shouldScroll) {
  const selected = state.ailments.find((item) => item.id === state.selectedAilmentId);
  if (!selected) return;

  const herbs = getSelectedHerbs(state);
  const start = (state.currentPage - 1) * state.config.pageSize;
  const end = Math.min(start + state.config.pageSize, herbs.length);
  const pageHerbs = herbs.slice(start, end);

  shell.results.classList.add('show');
  shell.resultsTitle.textContent = '';
  shell.resultsTitle.append(
    `${state.config.resultsTitlePrefix} `,
    Object.assign(document.createElement('em'), { textContent: selected.name }),
  );
  shell.resultsTip.textContent = selected.tip || '';
  shell.resultsLabel.textContent = getCountText(herbs.length, start, end);
  shell.resultsGrid.textContent = '';

  if (!pageHerbs.length) {
    shell.empty.classList.remove('hidden');
    shell.resultsGrid.classList.add('hidden');
  } else {
    shell.empty.classList.add('hidden');
    shell.resultsGrid.classList.remove('hidden');
    pageHerbs.forEach((herb, index) => {
      const isFirst = index === 0 && state.currentPage === 1;
      shell.resultsGrid.append(buildHerbCard(herb, state.config, isFirst));
    });
  }

  renderPagination(state, shell, (page) => {
    state.currentPage = page;
    renderResults(state, shell, shouldScroll);
  });
  if (shouldScroll) scrollToResults(shell.results);
}

function selectAilment(state, shell, id, shouldScroll = true) {
  const ailment = state.ailments.find((item) => item.id === id);
  if (!ailment) return;

  state.selectedAilmentId = id;
  state.currentPage = 1;

  shell.cards.querySelectorAll('.ailments-results-ailment-card').forEach((card) => {
    const isActive = Number(card.dataset.ailmentId) === id;
    card.classList.toggle('active', isActive);
    card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  renderResults(state, shell, shouldScroll);
}

function clearSelection(state, shell) {
  state.selectedAilmentId = null;
  state.currentPage = 1;
  shell.cards.querySelectorAll('.ailments-results-ailment-card').forEach((card) => {
    card.classList.remove('active');
    card.setAttribute('aria-pressed', 'false');
  });
  shell.pagination.textContent = '';
  shell.results.classList.remove('show');
}

function buildShell(config) {
  const guide = buildGuide(config);

  const body = document.createElement('div');
  body.className = 'ailments-results-body';

  const cards = document.createElement('div');
  cards.className = 'ailments-results-cards-grid';
  body.append(cards);

  const results = document.createElement('section');
  results.className = 'ailments-results-panel';
  results.setAttribute('aria-live', 'polite');

  const header = document.createElement('div');
  header.className = 'ailments-results-header';

  const headerText = document.createElement('div');

  const resultsLabel = document.createElement('p');
  resultsLabel.className = 'ailments-results-label';
  headerText.append(resultsLabel);

  const resultsTitle = document.createElement('h3');
  resultsTitle.className = 'ailments-results-title';
  headerText.append(resultsTitle);

  const resultsTip = document.createElement('p');
  resultsTip.className = 'ailments-results-tip';
  headerText.append(resultsTip);

  header.append(headerText);

  const clear = document.createElement('button');
  clear.className = 'ailments-results-clear';
  clear.type = 'button';
  clear.textContent = config.clearText;
  header.append(clear);

  const resultsGrid = document.createElement('div');
  resultsGrid.className = 'ailments-results-herbs-grid';

  const empty = document.createElement('div');
  empty.className = 'ailments-results-empty hidden';
  empty.setAttribute('role', 'status');

  const emptyTitle = document.createElement('h3');
  emptyTitle.textContent = config.emptyTitle;
  empty.append(emptyTitle);

  const emptyText = document.createElement('p');
  emptyText.textContent = config.emptyText;
  empty.append(emptyText);

  const pagination = document.createElement('nav');
  pagination.className = 'ailments-results-pagination';
  pagination.setAttribute('aria-label', 'Ailment herb results pagination');

  results.append(header, resultsGrid, empty, pagination);

  return {
    guide,
    body,
    cards,
    results,
    resultsLabel,
    resultsTitle,
    resultsTip,
    resultsGrid,
    empty,
    pagination,
    clear,
  };
}

function renderAilmentCards(state, shell) {
  shell.cards.textContent = '';

  state.ailments.forEach((ailment) => {
    const card = buildAilmentCard(ailment);
    card.addEventListener('click', () => selectAilment(state, shell, ailment.id));
    shell.cards.append(card);
  });
}

function applyUrlPreselect(state, shell) {
  const param = new URLSearchParams(window.location.search).get('ailment');
  if (!param) return;

  const match = state.ailments.find(
    (ailment) => ailment.name.toLowerCase() === param.toLowerCase(),
  );
  if (match) selectAilment(state, shell, match.id);
}

function renderError(block, message) {
  const error = document.createElement('p');
  error.className = 'ailments-results-error';
  error.textContent = message;
  block.append(error);
}

export default async function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const shell = buildShell(config);
  block.append(shell.guide, shell.body, shell.results);

  try {
    const [ailments, herbs] = await Promise.all([
      loadJson(config.ailmentsData),
      loadJson(config.herbsData),
    ]);

    const state = {
      config,
      ailments,
      herbs,
      selectedAilmentId: null,
      currentPage: 1,
    };

    renderAilmentCards(state, shell);
    shell.clear.addEventListener('click', () => clearSelection(state, shell));
    applyUrlPreselect(state, shell);
  } catch (error) {
    // Keep the page usable if one of the JSON requests fails.
    // eslint-disable-next-line no-console
    console.warn(error);
    renderError(block, config.unavailableText);
  }
}
