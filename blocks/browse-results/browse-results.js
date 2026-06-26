const DATA_URL = '/data/herbs.json';
const DEFAULT_PAGE_SIZE = 8;

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
    label: 'Safety',
    allLabel: 'All',
    safeLabel: 'Safe Only',
    cautionLabel: 'Caution',
    detailBase: '/herb-detail',
    pageSize: DEFAULT_PAGE_SIZE,
    emptyTitle: 'No herbs found',
    emptyText: 'Try adjusting your filters or search term',
    clearText: 'Clear Filters',
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    if (key === 'label') {
      config.label = value || config.label;
      return;
    }

    if (key === 'all-label') {
      config.allLabel = value || config.allLabel;
      return;
    }

    if (key === 'safe-label') {
      config.safeLabel = value || config.safeLabel;
      return;
    }

    if (key === 'caution-label') {
      config.cautionLabel = value || config.cautionLabel;
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

    if (key === 'empty-title') {
      config.emptyTitle = value || config.emptyTitle;
      return;
    }

    if (key === 'empty-text') {
      config.emptyText = value || config.emptyText;
      return;
    }

    if (key === 'clear-text') {
      config.clearText = value || config.clearText;
    }
  });

  return config;
}

async function loadHerbs() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Unable to load ${DATA_URL}`);
  const herbs = await response.json();
  return Array.isArray(herbs) ? herbs : [];
}

function getSafetyLabel(safety) {
  return safety === 'safe' ? 'Generally Safe' : 'Use with Caution';
}

function getDetailHref(herb, detailBase) {
  const separator = detailBase.includes('?') ? '&' : '?';
  return `${detailBase}${separator}id=${encodeURIComponent(herb.id)}`;
}

function truncateText(text, maxLength = 90) {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trim()}...`;
}

function buildTag(text, className) {
  const tag = document.createElement('span');
  tag.className = `browse-results-tag ${className}`;
  tag.textContent = text;
  return tag;
}

function buildCard(herb, config, isFirst) {
  const card = document.createElement('a');
  card.className = 'browse-results-card';
  card.href = getDetailHref(herb, config.detailBase);
  card.setAttribute('aria-label', `View ${herb.name}`);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'browse-results-card-img';

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
  badge.className = 'browse-results-card-badge';
  badge.textContent = getSafetyLabel(herb.safety);
  imageWrap.append(badge);

  const body = document.createElement('div');
  body.className = 'browse-results-card-body';

  const title = document.createElement('h2');
  title.className = 'browse-results-card-name';
  title.textContent = herb.name;
  body.append(title);

  const scientificName = document.createElement('span');
  scientificName.className = 'browse-results-card-sci';
  scientificName.textContent = herb.scientific_name;
  body.append(scientificName);

  const description = document.createElement('p');
  description.textContent = truncateText(herb.description);
  body.append(description);

  const tags = document.createElement('div');
  tags.className = 'browse-results-tags';
  tags.append(
    buildTag(herb.best_for, 'tag-green'),
    buildTag(herb.region, 'tag-brown'),
    buildTag(getSafetyLabel(herb.safety), `tag-${herb.safety}`),
  );
  body.append(tags);

  card.append(imageWrap, body);
  return card;
}

function getSearchTerm() {
  return new URLSearchParams(window.location.search).get('search')?.trim().toLowerCase() || '';
}

function filterHerbs(herbs, safety) {
  const search = getSearchTerm();

  return herbs.filter((herb) => {
    if (safety && herb.safety !== safety) return false;
    if (search && !herb.name.toLowerCase().includes(search)) return false;
    return true;
  });
}

function getCountText(total, start, end) {
  if (total === 0) return '0 herbs found';
  return `Showing ${start + 1}-${end} of ${total} herbs`;
}

function buildFilterChip(label, safety, activeSafety) {
  const button = document.createElement('button');
  button.className = safety === activeSafety
    ? 'browse-results-chip active'
    : 'browse-results-chip';
  button.type = 'button';
  button.dataset.safety = safety;
  button.textContent = label;
  if (safety === activeSafety) button.setAttribute('aria-pressed', 'true');
  else button.setAttribute('aria-pressed', 'false');
  return button;
}

function buildShell(config) {
  const filterBar = document.createElement('div');
  filterBar.className = 'browse-results-filter';
  filterBar.setAttribute('role', 'search');
  filterBar.setAttribute('aria-label', 'Filter herbs');

  const label = document.createElement('span');
  label.className = 'browse-results-filter-label';
  label.textContent = config.label;
  filterBar.append(label);

  const chipGroup = document.createElement('div');
  chipGroup.className = 'browse-results-chip-group';
  chipGroup.setAttribute('role', 'group');
  chipGroup.setAttribute('aria-label', 'Filter by safety rating');
  filterBar.append(chipGroup);

  const count = document.createElement('span');
  count.className = 'browse-results-count';
  count.setAttribute('aria-live', 'polite');
  count.setAttribute('aria-atomic', 'true');
  filterBar.append(count);

  const body = document.createElement('div');
  body.className = 'browse-results-body';

  const grid = document.createElement('div');
  grid.className = 'browse-results-grid';
  grid.setAttribute('aria-label', 'Herb results');
  body.append(grid);

  const empty = document.createElement('div');
  empty.className = 'browse-results-empty hidden';
  empty.setAttribute('role', 'status');

  const emptyTitle = document.createElement('h2');
  emptyTitle.textContent = config.emptyTitle;
  empty.append(emptyTitle);

  const emptyText = document.createElement('p');
  emptyText.textContent = config.emptyText;
  empty.append(emptyText);

  const clear = document.createElement('button');
  clear.className = 'browse-results-clear';
  clear.type = 'button';
  clear.textContent = config.clearText;
  empty.append(clear);

  body.append(empty);

  const pagination = document.createElement('nav');
  pagination.className = 'browse-results-pagination';
  pagination.setAttribute('aria-label', 'Herb list pagination');

  return {
    filterBar,
    chipGroup,
    count,
    body,
    grid,
    empty,
    clear,
    pagination,
  };
}

function scrollToBlock(block) {
  const top = block.getBoundingClientRect().top + window.scrollY - 110;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function renderPagination(state, shell, onUpdate) {
  const totalPages = Math.ceil(state.filtered.length / state.config.pageSize);
  shell.pagination.textContent = '';

  if (totalPages <= 1) return;

  const addButton = (label, page, className, disabled = false, current = false) => {
    const button = document.createElement('button');
    button.className = className;
    button.type = 'button';
    button.textContent = label;
    if (disabled) {
      button.classList.add('disabled');
      button.setAttribute('aria-disabled', 'true');
      button.disabled = true;
    }
    if (current) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => {
      if (disabled) return;
      state.currentPage = page;
      onUpdate(true);
    });
    shell.pagination.append(button);
  };

  addButton('←', state.currentPage - 1, 'browse-results-page arrow', state.currentPage === 1);

  for (let page = 1; page <= totalPages; page += 1) {
    addButton(
      String(page),
      page,
      page === state.currentPage ? 'browse-results-page active' : 'browse-results-page',
      false,
      page === state.currentPage,
    );
  }

  addButton('→', state.currentPage + 1, 'browse-results-page arrow', state.currentPage === totalPages);
}

function renderFilters(state, shell, onUpdate) {
  shell.chipGroup.textContent = '';
  shell.chipGroup.append(
    buildFilterChip(state.config.allLabel, '', state.activeSafety),
    buildFilterChip(state.config.safeLabel, 'safe', state.activeSafety),
    buildFilterChip(state.config.cautionLabel, 'caution', state.activeSafety),
  );

  shell.chipGroup.querySelectorAll('.browse-results-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.activeSafety = chip.dataset.safety;
      state.currentPage = 1;
      state.filtered = filterHerbs(state.herbs, state.activeSafety);
      onUpdate(false);
    });
  });
}

function render(state, shell, block) {
  const onUpdate = (shouldScroll) => {
    render(state, shell, block);
    if (shouldScroll) scrollToBlock(block);
  };
  const { pageSize } = state.config;
  const start = (state.currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, state.filtered.length);
  const pageHerbs = state.filtered.slice(start, end);

  renderFilters(state, shell, onUpdate);
  shell.count.textContent = getCountText(state.filtered.length, start, end);
  shell.grid.textContent = '';

  if (!pageHerbs.length) {
    shell.empty.classList.remove('hidden');
  } else {
    shell.empty.classList.add('hidden');
    pageHerbs.forEach((herb, index) => {
      shell.grid.append(buildCard(herb, state.config, index === 0 && state.currentPage === 1));
    });
  }

  renderPagination(state, shell, onUpdate);
}

function renderError(block) {
  const error = document.createElement('p');
  error.className = 'browse-results-error';
  error.textContent = 'Herbs are unavailable right now.';
  block.append(error);
}

export default async function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const shell = buildShell(config);
  block.append(shell.filterBar, shell.body, shell.pagination);

  try {
    const herbs = await loadHerbs();
    const state = {
      config,
      herbs,
      filtered: filterHerbs(herbs, ''),
      currentPage: 1,
      activeSafety: '',
    };

    shell.clear.addEventListener('click', () => {
      state.activeSafety = '';
      state.currentPage = 1;
      state.filtered = filterHerbs(state.herbs, state.activeSafety);
      render(state, shell, block);
    });

    render(state, shell, block);
  } catch (error) {
    // Keep the page usable if the JSON request fails.
    // eslint-disable-next-line no-console
    console.warn(error);
    renderError(block);
  }
}
