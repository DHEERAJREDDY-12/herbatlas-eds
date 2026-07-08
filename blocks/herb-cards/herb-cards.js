import { createOptimizedPicture } from '../../scripts/aem.js';

const DEFAULT_LIMIT = 4;
const DATA_URL = '/data/herbs.json';
const DEFAULT_ACCOUNT_LINK = '/account';
const CARD_IMAGE_BREAKPOINTS = [
  { media: '(min-width: 1000px)', width: '600' },
  { media: '(min-width: 600px)', width: '520' },
  { width: '360' },
];

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

function normalizeInlineHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  if (tmp.children.length === 1 && tmp.firstElementChild.tagName === 'P') {
    return tmp.firstElementChild.innerHTML.trim();
  }

  return html;
}

function readConfig(rows) {
  const config = {
    accountLink: DEFAULT_ACCOUNT_LINK,
    dataUrl: DATA_URL,
    eyebrow: '',
    title: '',
    ctaText: '',
    ctaLink: '',
    emptyCtaText: 'Go to Personal Herb Profile',
    emptyLabel: 'Personalized Suggestions',
    emptyText: 'Save your wellness goals and preferences to view herb recommendations tailored to your needs.',
    emptyTitle: 'Create your personal herb profile',
    mode: 'recent',
    showEmpty: false,
    limit: DEFAULT_LIMIT,
    detailBase: '/herb-detail',
    unavailableText: 'Recommended herbs are unavailable right now.',
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));

    if (key === 'eyebrow' || key === 'label') {
      config.eyebrow = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'title') {
      config.title = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'cta-text' || key === 'link-text') {
      config.ctaText = getText(getCell(row, 1));
      return;
    }

    if (key === 'cta-link' || key === 'link') {
      config.ctaLink = getHref(getCell(row, 1));
      return;
    }

    if (key === 'mode') {
      config.mode = getText(getCell(row, 1)).toLowerCase() || config.mode;
      return;
    }

    if (key === 'data' || key === 'herbs-data') {
      config.dataUrl = getHref(getCell(row, 1)) || config.dataUrl;
      return;
    }

    if (key === 'account-link') {
      config.accountLink = getHref(getCell(row, 1)) || config.accountLink;
      return;
    }

    if (key === 'show-empty') {
      config.showEmpty = ['yes', 'true', 'show', 'show empty', 'show-empty'].includes(
        getText(getCell(row, 1)).toLowerCase(),
      );
      return;
    }

    if (key === 'logged-out-behavior') {
      config.showEmpty = ['show empty', 'show-empty', 'showempty'].includes(
        getText(getCell(row, 1)).toLowerCase(),
      );
      return;
    }

    if (key === 'empty-label') {
      config.emptyLabel = getText(getCell(row, 1)) || config.emptyLabel;
      return;
    }

    if (key === 'empty-title') {
      config.emptyTitle = getText(getCell(row, 1)) || config.emptyTitle;
      return;
    }

    if (key === 'empty-text') {
      config.emptyText = getText(getCell(row, 1)) || config.emptyText;
      return;
    }

    if (key === 'empty-cta-text') {
      config.emptyCtaText = getText(getCell(row, 1)) || config.emptyCtaText;
      return;
    }

    if (key === 'unavailable-text') {
      config.unavailableText = getText(getCell(row, 1)) || config.unavailableText;
      return;
    }

    if (key === 'limit' || key === 'count') {
      const limit = parseInt(getText(getCell(row, 1)), 10);
      if (Number.isFinite(limit) && limit > 0) config.limit = limit;
      return;
    }

    if (key === 'detail-base' || key === 'detail-link-base') {
      config.detailBase = getHref(getCell(row, 1)) || config.detailBase;
    }
  });

  return config;
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

async function loadHerbs(dataUrl = DATA_URL) {
  if (dataUrl === DATA_URL && Array.isArray(window.HERBS_DATA)) return window.HERBS_DATA;

  if (dataUrl === DATA_URL) {
    window.HERBS_DATA_PROMISE ||= fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${dataUrl}`);
        return response.json();
      })
      .then((data) => {
        window.HERBS_DATA = Array.isArray(data) ? data : [];
        return window.HERBS_DATA;
      });
    return window.HERBS_DATA_PROMISE;
  }

  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error(`Unable to load ${dataUrl}`);
  const herbs = await response.json();
  return Array.isArray(herbs) ? herbs : [];
}

function getSafetyLabel(safety) {
  if (safety === 'restricted') return 'Restricted Use';
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

function buildHeader(config) {
  if (!config.eyebrow && !config.title && !config.ctaText) return null;

  const header = document.createElement('div');
  header.className = 'herb-cards-header';

  const textWrap = document.createElement('div');

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'herb-cards-label';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    textWrap.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h2');
    title.className = 'herb-cards-title';
    title.innerHTML = normalizeInlineHtml(config.title);
    textWrap.append(title);
  }

  header.append(textWrap);

  if (config.ctaText && config.ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'herb-cards-view-all';
    cta.href = config.ctaLink;
    cta.textContent = config.ctaText;
    header.append(cta);
  }

  return header;
}

function buildTag(text, className) {
  const tag = document.createElement('span');
  tag.className = `herb-cards-tag ${className}`;
  tag.textContent = text;
  return tag;
}

function buildOptimizedCardImage(src, alt, isFirst = false) {
  const picture = createOptimizedPicture(src, alt, isFirst, CARD_IMAGE_BREAKPOINTS);
  const image = picture.querySelector('img');
  if (image) {
    image.width = 300;
    image.height = 190;
    image.decoding = 'async';
    if (isFirst) image.fetchPriority = 'high';
  }
  return picture;
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

function selectHerbs(herbs, config) {
  if (config.mode === 'recommended') {
    return scoreProfileHerbs(herbs, getSavedProfile(), config.limit);
  }

  if (config.mode === 'recent') {
    return herbs.slice(-config.limit);
  }

  // Future modes can branch here without changing the card rendering layer.
  return herbs.slice(-config.limit);
}

function buildRecommendedCard(herb, profile, index, detailBase) {
  const card = document.createElement('a');
  card.className = 'recommended-herbs-card';
  card.href = getDetailHref(herb, detailBase);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'recommended-herbs-image';

  if (herb.image) {
    imageWrap.append(buildOptimizedCardImage(herb.image, herb.name, index === 0));
  }

  const badge = document.createElement('span');
  badge.className = 'recommended-herbs-badge';
  badge.textContent = index === 0 ? 'Best match' : getSafetyLabel(herb.safety);
  imageWrap.append(badge);

  const body = document.createElement('div');
  body.className = 'recommended-herbs-body';

  const title = document.createElement('h3');
  title.textContent = herb.name || '';
  body.append(title);

  const scientificName = document.createElement('p');
  scientificName.className = 'recommended-herbs-sci';
  scientificName.textContent = herb.scientific || herb.scientific_name || '';
  body.append(scientificName);

  const reason = document.createElement('p');
  reason.textContent = getRecommendationReason(herb, profile);
  body.append(reason);

  const tags = document.createElement('div');
  tags.className = 'recommended-herbs-tags';
  [herb.region, getSafetyLabel(herb.safety)].filter(Boolean).forEach((tagText) => {
    const tag = document.createElement('span');
    tag.textContent = tagText;
    tags.append(tag);
  });
  body.append(tags);

  card.append(imageWrap, body);
  return card;
}

function buildCard(herb, detailBase, isFirst = false) {
  const href = getDetailHref(herb, detailBase);
  const card = document.createElement('a');
  card.className = 'herb-card';
  card.href = href;

  const imageWrap = document.createElement('div');
  imageWrap.className = 'herb-card-img';

  imageWrap.append(buildOptimizedCardImage(herb.image, herb.name, isFirst));

  const badge = document.createElement('span');
  badge.className = 'herb-card-badge';
  badge.textContent = getSafetyLabel(herb.safety);
  imageWrap.append(badge);

  const body = document.createElement('div');
  body.className = 'herb-card-body';

  const title = document.createElement('h3');
  title.textContent = herb.name;
  body.append(title);

  const scientificName = document.createElement('p');
  scientificName.className = 'herb-card-sci';
  scientificName.textContent = herb.scientific_name;
  body.append(scientificName);

  const description = document.createElement('p');
  description.textContent = truncateText(herb.description);
  body.append(description);

  const tags = document.createElement('div');
  tags.className = 'herb-cards-tags';
  tags.append(
    buildTag(herb.best_for, 'tag-green'),
    buildTag(herb.region, 'tag-brown'),
    buildTag(getSafetyLabel(herb.safety), `tag-${herb.safety}`),
  );
  body.append(tags);

  card.append(imageWrap, body);
  return card;
}

function buildGrid(herbs, config) {
  const grid = document.createElement('div');
  grid.className = config.mode === 'recommended' ? 'recommended-herbs-grid' : 'herb-cards-grid';

  const profile = getSavedProfile();
  selectHerbs(herbs, config).forEach((herb, index) => {
    grid.append(
      config.mode === 'recommended'
        ? buildRecommendedCard(herb, profile, index, config.detailBase)
        : buildCard(herb, config.detailBase, index === 0),
    );
  });

  return grid;
}

function buildEmptyState(config) {
  const empty = document.createElement('div');
  empty.className = 'recommended-herbs-empty';
  empty.innerHTML = `
    <p class="recommended-herbs-label">${config.emptyLabel}</p>
    <h3>${config.emptyTitle}</h3>
    <p>${config.emptyText}</p>
    <a href="${config.accountLink}">${config.emptyCtaText}</a>
  `;
  return empty;
}

function hideBlock(block) {
  const wrapper = block.closest('.herb-cards-wrapper');
  if (wrapper) {
    wrapper.hidden = true;
    return;
  }

  block.hidden = true;
}

function renderError(block, config) {
  const error = document.createElement('p');
  error.className = 'herb-cards-error';
  error.textContent = config.mode === 'recommended'
    ? config.unavailableText
    : 'Herbs are unavailable right now.';
  block.append(error);
}

export default async function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';
  if (config.mode === 'recommended') block.classList.add('recommended');

  if (config.mode === 'recommended' && !getUserEmail()) {
    hideBlock(block);
    return;
  }

  const header = buildHeader(config);

  try {
    const herbs = await loadHerbs(config.dataUrl);
    const grid = buildGrid(herbs, config);

    if (config.mode === 'recommended' && !grid.children.length) {
      block.append(buildEmptyState(config));
      return;
    }

    if (header) block.append(header);
    block.append(grid);
  } catch (error) {
    // Keep the page usable if the JSON request fails.
    // eslint-disable-next-line no-console
    console.warn(error);
    renderError(block, config);
  }
}
