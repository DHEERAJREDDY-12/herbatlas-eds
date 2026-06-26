const DEFAULT_DATA_URL = '/data/herbs.json';
const DEFAULT_DETAIL_BASE = '/herb-detail';
const DEFAULT_ACCOUNT_LINK = '/account';
const DEFAULT_LIMIT = 4;

function toKey(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+([a-z])/g, (_, char) => char.toUpperCase());
}

function textContent(cell) {
  return cell?.textContent?.trim() || '';
}

function htmlContent(cell) {
  return cell?.innerHTML?.trim() || '';
}

function normalizeInlineHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html || '';

  if (
    template.content.childElementCount === 1
    && template.content.firstElementChild.tagName === 'P'
  ) {
    return template.content.firstElementChild.innerHTML.trim();
  }

  return template.innerHTML.trim();
}

function getLink(cell) {
  const anchor = cell?.querySelector('a');
  return anchor?.getAttribute('href') || textContent(cell);
}

function readConfig(block) {
  return [...block.children].reduce((config, row) => {
    const cells = [...row.children];
    const label = textContent(cells[0]);
    if (!label) return config;

    const key = toKey(label);
    const valueCell = cells[1];
    const value = key.includes('Link') || key.includes('Base') || key.includes('Data')
      ? getLink(valueCell)
      : textContent(valueCell);
    const html = htmlContent(valueCell);

    return {
      ...config,
      [key]: value,
      [`${key}Html`]: html,
    };
  }, {});
}

function parseStorageJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch (error) {
    return fallback;
  }
}

function getUserEmail() {
  return localStorage.getItem('userEmail') || '';
}

function getSavedProfile() {
  const email = getUserEmail();
  if (!email) return null;

  const profiles = parseStorageJson('userProfiles', {});
  return profiles[email] || null;
}

async function loadHerbs(dataUrl) {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error(`Unable to load herbs from ${dataUrl}`);
  }
  return response.json();
}

function normalizedList(value) {
  return Array.isArray(value) ? value : [];
}

function shouldAvoidHerb(herb, profile) {
  if (profile.safety === 'safe' && herb.safety !== 'safe') return true;
  if (Number(profile.age) > 0 && Number(profile.age) < 18 && herb.safety === 'restricted') return true;
  if (profile.sex === 'male' && herb.name === 'Shatavari') return true;

  const warningText = normalizedList(herb.warnings).join(' ').toLowerCase();
  const drugText = normalizedList(herb.drug_interactions).join(' ').toLowerCase();

  return normalizedList(profile.avoid).some((note) => {
    const avoidNote = String(note).toLowerCase();
    if (avoidNote === 'pregnant') return warningText.includes('pregnancy');
    if (avoidNote === 'breastfeeding') return warningText.includes('breastfeeding');
    return warningText.includes(avoidNote) || drugText.includes(avoidNote);
  });
}

function scoreProfileHerbs(herbs, profile, limit) {
  if (!profile || !normalizedList(profile.goals).length) return [];

  return herbs
    .filter((herb) => !shouldAvoidHerb(herb, profile))
    .map((herb) => {
      const goalScore = normalizedList(profile.goals).reduce((score, goal) => (
        normalizedList(herb.ailments).includes(goal) ? score + 10 : score
      ), 0);
      const safetyScore = herb.safety === 'safe' ? 2 : 0;

      return {
        herb,
        score: goalScore + safetyScore,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.herb);
}

function getSafetyLabel(safety) {
  if (safety === 'safe') return 'Generally Safe';
  if (safety === 'caution') return 'Use with Caution';
  return 'Restricted Use';
}

function getRecommendationReason(herb, profile) {
  const matchedGoals = normalizedList(profile?.goals)
    .filter((goal) => normalizedList(herb.ailments).includes(goal));
  const parts = [];

  if (matchedGoals.length) {
    parts.push(`Matched: ${matchedGoals.slice(0, 2).join(', ')}`);
  }

  if (herb.safety === 'safe') {
    parts.push('Safety: generally safe');
  }

  return parts.join(' | ') || herb.best_for || '';
}

function getDetailHref(detailBase, herb) {
  const separator = detailBase.includes('?') ? '&' : '?';
  return `${detailBase}${separator}id=${encodeURIComponent(herb.id)}`;
}

function cardTags(herb) {
  return [herb.region, getSafetyLabel(herb.safety)].filter(Boolean);
}

function createCard(herb, profile, index, detailBase) {
  const card = document.createElement('a');
  card.className = 'recommended-herbs-card';
  card.href = getDetailHref(detailBase, herb);

  const image = herb.image || '';
  const badge = index === 0 ? 'Best match' : getSafetyLabel(herb.safety);
  const tags = cardTags(herb).map((tag) => `<span>${tag}</span>`).join('');

  card.innerHTML = `
    <div class="recommended-herbs-image">
      ${image ? `<img src="${image}" alt="${herb.name}" loading="lazy">` : ''}
      <span class="recommended-herbs-badge">${badge}</span>
    </div>
    <div class="recommended-herbs-body">
      <h3>${herb.name || ''}</h3>
      <p class="recommended-herbs-sci">${herb.scientific || ''}</p>
      <p>${getRecommendationReason(herb, profile)}</p>
      <div class="recommended-herbs-tags">${tags}</div>
    </div>
  `;

  return card;
}

function createHeader(config) {
  const hasHeader = config.eyebrow || config.title || config.ctaText;
  if (!hasHeader) return null;

  const header = document.createElement('div');
  header.className = 'recommended-herbs-header';

  const copy = document.createElement('div');
  copy.innerHTML = `
    ${config.eyebrow ? `<p class="recommended-herbs-label">${config.eyebrow}</p>` : ''}
    ${config.titleHtml ? `<h2 class="recommended-herbs-title">${normalizeInlineHtml(config.titleHtml)}</h2>` : ''}
  `;
  header.append(copy);

  if (config.ctaText) {
    const cta = document.createElement('a');
    cta.className = 'recommended-herbs-link';
    cta.href = config.ctaLink || DEFAULT_ACCOUNT_LINK;
    cta.textContent = config.ctaText;
    header.append(cta);
  }

  return header;
}

function createEmptyState(config) {
  const empty = document.createElement('div');
  empty.className = 'recommended-herbs-empty';
  empty.innerHTML = `
    <p class="recommended-herbs-label">${config.emptyLabel || 'Personalized suggestions'}</p>
    <h3>${config.emptyTitle || 'Create your personal herb profile'}</h3>
    <p>${config.emptyText || 'Save your wellness goals and preferences to view herb recommendations tailored to your needs.'}</p>
    <a href="${config.accountLink || DEFAULT_ACCOUNT_LINK}">${config.emptyCtaText || 'Go to Personal Herb Profile'}</a>
  `;
  return empty;
}

function hideBlock(block) {
  block.textContent = '';
  block.hidden = true;
}

function renderRecommendations(block, config, herbs, profile) {
  const limit = Number(config.limit) || DEFAULT_LIMIT;
  const detailBase = config.detailBase || DEFAULT_DETAIL_BASE;
  const recommendations = scoreProfileHerbs(herbs, profile, limit);

  block.textContent = '';

  if (!recommendations.length) {
    block.append(createEmptyState(config));
    return;
  }

  const header = createHeader(config);
  const grid = document.createElement('div');
  grid.className = 'recommended-herbs-grid';
  recommendations.forEach((herb, index) => {
    grid.append(createCard(herb, profile, index, detailBase));
  });

  if (header) block.append(header);
  block.append(grid);
}

function renderError(block, config) {
  block.textContent = '';
  const error = document.createElement('div');
  error.className = 'recommended-herbs-empty';
  error.innerHTML = `
    <p class="recommended-herbs-label">Recommendations</p>
    <h3>Unable to load recommendations</h3>
    <p>${config.unavailableText || 'Recommended herbs are unavailable right now.'}</p>
  `;
  block.append(error);
}

export default async function decorate(block) {
  const config = readConfig(block);
  const loggedOutBehavior = (config.loggedOutBehavior || 'hide').toLowerCase();
  const shouldShowEmpty = ['show empty', 'show-empty', 'showempty'].includes(loggedOutBehavior);
  const hasEmail = Boolean(getUserEmail());

  block.className = 'recommended-herbs';

  if (!hasEmail && !shouldShowEmpty) {
    hideBlock(block);
    return;
  }

  try {
    const herbs = await loadHerbs(config.herbsData || DEFAULT_DATA_URL);
    const profile = getSavedProfile();
    renderRecommendations(block, config, herbs, profile);
  } catch (error) {
    renderError(block, config);
  }
}
