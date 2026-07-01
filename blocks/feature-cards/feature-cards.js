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

function isHrefValue(value) {
  return /^(\/|https?:\/\/|mailto:|tel:|#)/i.test(value || '');
}

function logout() {
  if (window.herbAtlasLogout) {
    window.herbAtlasLogout();
    return;
  }

  localStorage.removeItem('loggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('cart');
  localStorage.removeItem('appliedCoupon');
  window.location.href = '/login';
}

function normalizeInlineHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = (html || '')
    .replace(/&lt;(\/?)(em|strong|br)&gt;/gi, '<$1$2>')
    .replace(/&lt;br\s*\/&gt;/gi, '<br>');

  tmp.querySelectorAll('em').forEach((emphasis) => {
    if (emphasis.textContent.trim().toLowerCase() === 'herbatlas works') {
      emphasis.innerHTML = 'HerbAtlas';
      emphasis.insertAdjacentText('afterend', ' Works');
    }
  });

  if (tmp.children.length === 1 && tmp.firstElementChild.tagName === 'P') {
    return tmp.firstElementChild.innerHTML.trim();
  }

  return tmp.innerHTML;
}

function isHeaderRow(row) {
  const labels = [...row.children].map((cell) => getText(cell).toLowerCase());
  return labels.includes('title') && (labels.includes('icon') || labels.includes('image'));
}

function isStatsHeaderRow(row) {
  const labels = [...row.children].map((cell) => getText(cell).toLowerCase());
  return labels.includes('number') && labels.includes('label');
}

function isProcessHeaderRow(row) {
  const labels = [...row.children].map((cell) => getText(cell).toLowerCase());
  return labels.includes('step') && labels.includes('title') && labels.includes('description');
}

function buildStat(stat) {
  const item = document.createElement('div');
  item.className = 'feature-cards-stat';

  if (stat.number) {
    const number = document.createElement('strong');
    number.className = 'feature-cards-stat-number';
    number.innerHTML = normalizeInlineHtml(stat.number);
    item.append(number);
  }

  if (stat.label) {
    const label = document.createElement('span');
    label.className = 'feature-cards-stat-label';
    label.innerHTML = normalizeInlineHtml(stat.label);
    item.append(label);
  }

  if (stat.description) {
    const description = document.createElement('p');
    description.className = 'feature-cards-stat-description';
    description.innerHTML = normalizeInlineHtml(stat.description);
    item.append(description);
  }

  return item;
}

function readStats(rows) {
  return rows
    .filter((row) => !isStatsHeaderRow(row))
    .map((row) => ({
      number: getHtml(getCell(row, 0)),
      label: getHtml(getCell(row, 1)),
      description: getHtml(getCell(row, 2)),
    }))
    .filter((stat) => stat.number || stat.label || stat.description);
}

function createProcessIcon(cell) {
  const picture = cell?.querySelector('picture');
  if (picture) {
    const icon = document.createElement('span');
    icon.className = 'feature-cards-process-icon feature-cards-process-icon-image';
    icon.append(picture.cloneNode(true));
    return icon;
  }

  const img = cell?.querySelector('img');
  if (img) {
    const icon = document.createElement('span');
    icon.className = 'feature-cards-process-icon feature-cards-process-icon-image';
    icon.append(img.cloneNode(true));
    return icon;
  }

  const mediaPath = getHref(cell);
  if (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(mediaPath)) {
    const icon = document.createElement('span');
    icon.className = 'feature-cards-process-icon feature-cards-process-icon-image';

    const image = document.createElement('img');
    image.src = mediaPath;
    image.alt = '';
    image.loading = 'lazy';
    icon.append(image);
    return icon;
  }

  const text = getHtml(cell);
  if (!getText(cell)) return null;

  const icon = document.createElement('span');
  icon.className = 'feature-cards-process-icon';
  icon.innerHTML = normalizeInlineHtml(text);
  return icon;
}

function buildProcessStep(stepData) {
  const step = document.createElement('article');
  step.className = 'feature-cards-process-step';

  const icon = createProcessIcon(stepData.iconCell);
  if (icon) step.append(icon);

  if (stepData.title) {
    const title = document.createElement('h3');
    title.innerHTML = normalizeInlineHtml(stepData.title);
    step.append(title);
  }

  if (stepData.description) {
    const description = document.createElement('p');
    description.innerHTML = normalizeInlineHtml(stepData.description);
    step.append(description);
  }

  return step;
}

function readProcessSteps(rows) {
  return rows
    .filter((row) => !isProcessHeaderRow(row))
    .map((row) => ({
      iconCell: getCell(row, 0),
      title: getHtml(getCell(row, 1)),
      description: getHtml(getCell(row, 2)),
    }))
    .filter((step) => getText(step.iconCell) || step.title || step.description);
}

function normalizeKey(cell) {
  return getText(cell).toLowerCase().replace(/\s+/g, '-');
}

function isConfigRow(row) {
  return [
    'eyebrow',
    'label',
    'title',
    'description',
    'cta-text',
    'link-text',
    'cta-link',
    'link',
  ].includes(normalizeKey(getCell(row, 0)));
}

function readHeaderConfig(rows) {
  const config = {
    eyebrow: '',
    title: '',
    description: '',
    ctaText: '',
    ctaLink: '',
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

    if (key === 'description') {
      config.description = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'cta-text' || key === 'link-text') {
      config.ctaText = getText(getCell(row, 1));
      return;
    }

    if (key === 'cta-link' || key === 'link') {
      config.ctaLink = getHref(getCell(row, 1));
    }
  });

  return config;
}

function buildHeader(config) {
  if (!config.eyebrow && !config.title && !config.description && !config.ctaText) return null;

  const header = document.createElement('div');
  header.className = 'feature-cards-header';

  const text = document.createElement('div');
  text.className = 'feature-cards-header-text';

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'feature-cards-header-label';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    text.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h2');
    title.className = 'feature-cards-header-title';
    title.innerHTML = normalizeInlineHtml(config.title);
    text.append(title);
  }

  if (config.description) {
    const description = document.createElement('p');
    description.className = 'feature-cards-header-description';
    description.innerHTML = normalizeInlineHtml(config.description);
    text.append(description);
  }

  header.append(text);

  if (config.ctaText && config.ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'feature-cards-header-cta';
    cta.href = config.ctaLink;
    cta.textContent = config.ctaText;
    header.append(cta);
  }

  return header;
}

function readStepsConfig(rows) {
  const config = {
    eyebrow: '',
    title: '',
    steps: [],
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

    if (key === 'step') {
      config.steps.push({
        number: getHtml(getCell(row, 1)),
        title: getHtml(getCell(row, 2)),
        description: getHtml(getCell(row, 3)),
      });
    }
  });

  return config;
}

function readCalloutConfig(rows) {
  const config = {
    eyebrow: '',
    icon: '',
    title: '',
    body: [],
    meta: '',
    variant: '',
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));

    if (key === 'eyebrow' || key === 'label') {
      config.eyebrow = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'icon') {
      config.icon = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'title') {
      config.title = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'body' || key === 'text' || key === 'description') {
      const body = getHtml(getCell(row, 1));
      if (body) config.body.push(body);
      return;
    }

    if (key === 'meta' || key === 'footer') {
      config.meta = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'variant') {
      config.variant = getText(getCell(row, 1));
    }
  });

  return config;
}

function addVariantClasses(block, variant) {
  variant
    .split(',')
    .map((item) => item.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean)
    .forEach((item) => block.classList.add(item));
}

function buildCallout(config) {
  const fragment = document.createDocumentFragment();

  if (config.icon) {
    const icon = document.createElement('span');
    icon.className = 'feature-cards-callout-icon';
    icon.innerHTML = normalizeInlineHtml(config.icon);
    fragment.append(icon);
  }

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'feature-cards-callout-eyebrow';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    fragment.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h2');
    title.className = 'feature-cards-callout-title';
    title.innerHTML = normalizeInlineHtml(config.title);
    fragment.append(title);
  }

  config.body.forEach((item) => {
    const body = document.createElement('p');
    body.className = 'feature-cards-callout-body';
    body.innerHTML = normalizeInlineHtml(item);
    fragment.append(body);
  });

  if (config.meta) {
    const meta = document.createElement('p');
    meta.className = 'feature-cards-callout-meta';
    meta.innerHTML = normalizeInlineHtml(config.meta);
    fragment.append(meta);
  }

  return fragment;
}

function isTeamHeaderRow(row) {
  const labels = [...row.children].map((cell) => getText(cell).toLowerCase());
  return labels.includes('image') && (labels.includes('name') || labels.includes('title'));
}

function createTeamImage(cell, alt) {
  const picture = cell?.querySelector('picture');
  if (picture) {
    const clonedPicture = picture.cloneNode(true);
    const img = clonedPicture.querySelector('img');
    if (img && alt) img.alt = alt;
    return clonedPicture;
  }

  const img = cell?.querySelector('img');
  if (img) {
    const clonedImg = img.cloneNode(true);
    if (alt) clonedImg.alt = alt;
    return clonedImg;
  }

  const src = getHref(cell);
  if (!src) return null;

  const fallbackImg = document.createElement('img');
  fallbackImg.src = src;
  fallbackImg.alt = alt || '';
  fallbackImg.loading = 'lazy';
  return fallbackImg;
}

function readTeamCards(rows) {
  return rows
    .filter((row) => !isTeamHeaderRow(row) && !isConfigRow(row))
    .map((row) => ({
      imageCell: getCell(row, 0),
      imageAlt: getText(getCell(row, 1)),
      name: getHtml(getCell(row, 2)),
      role: getHtml(getCell(row, 3)),
      description: getHtml(getCell(row, 4)),
      linkText: getText(getCell(row, 5)),
      linkUrl: getHref(getCell(row, 6)),
    }))
    .filter((card) => getText(card.imageCell) || card.name || card.role || card.description);
}

function buildTeamCard(cardData) {
  const card = document.createElement('article');
  card.className = 'feature-cards-team-card';

  const image = createTeamImage(cardData.imageCell, cardData.imageAlt);
  if (image) {
    const media = document.createElement('div');
    media.className = 'feature-cards-team-media';
    media.append(image);
    card.append(media);
  }

  const body = document.createElement('div');
  body.className = 'feature-cards-team-body';

  if (cardData.name) {
    const name = document.createElement('h3');
    name.innerHTML = normalizeInlineHtml(cardData.name);
    body.append(name);
  }

  if (cardData.role) {
    const role = document.createElement('span');
    role.className = 'feature-cards-team-role';
    role.innerHTML = normalizeInlineHtml(cardData.role);
    body.append(role);
  }

  if (cardData.description) {
    const description = document.createElement('p');
    description.innerHTML = normalizeInlineHtml(cardData.description);
    body.append(description);
  }

  if (cardData.linkText && cardData.linkUrl) {
    const link = document.createElement('a');
    link.className = 'feature-cards-team-link';
    link.href = cardData.linkUrl;
    link.textContent = cardData.linkText;
    body.append(link);
  }

  if (body.children.length) card.append(body);
  return card;
}

function buildSteps(config) {
  const fragment = document.createDocumentFragment();

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'feature-cards-steps-label';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    fragment.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h2');
    title.className = 'feature-cards-steps-title';
    title.innerHTML = normalizeInlineHtml(config.title);
    fragment.append(title);
  }

  const grid = document.createElement('div');
  grid.className = 'feature-cards-steps-grid';

  config.steps.forEach((stepData) => {
    const step = document.createElement('article');
    step.className = 'feature-cards-steps-step';

    if (stepData.number) {
      const number = document.createElement('span');
      number.className = 'feature-cards-steps-number';
      number.innerHTML = normalizeInlineHtml(stepData.number);
      step.append(number);
    }

    if (stepData.title) {
      const title = document.createElement('h3');
      title.innerHTML = normalizeInlineHtml(stepData.title);
      step.append(title);
    }

    if (stepData.description) {
      const copy = document.createElement('p');
      copy.innerHTML = normalizeInlineHtml(stepData.description);
      step.append(copy);
    }

    grid.append(step);
  });

  if (grid.children.length) fragment.append(grid);
  return fragment;
}

function createMedia(cell) {
  const picture = cell?.querySelector('picture');
  if (picture) {
    const media = document.createElement('div');
    media.className = 'feature-cards-media feature-cards-media-image';
    media.append(picture.cloneNode(true));
    return media;
  }

  const img = cell?.querySelector('img');
  if (img) {
    const media = document.createElement('div');
    media.className = 'feature-cards-media feature-cards-media-image';
    media.append(img.cloneNode(true));
    return media;
  }

  const mediaPath = getHref(cell);
  if (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(mediaPath)) {
    const media = document.createElement('div');
    media.className = 'feature-cards-media feature-cards-media-image';

    const image = document.createElement('img');
    image.src = mediaPath;
    image.alt = '';
    image.loading = 'lazy';
    media.append(image);
    return media;
  }

  const icon = getHtml(cell);
  if (!getText(cell)) return null;

  const media = document.createElement('span');
  media.className = 'feature-cards-media feature-cards-icon';
  media.innerHTML = normalizeInlineHtml(icon);
  return media;
}

function buildCard(cardData) {
  const isLogout = cardData.action === 'sign-out';
  const isWholeCardLink = Boolean(cardData.linkUrl) && !isLogout;
  let cardTag = 'article';
  if (isLogout) cardTag = 'button';
  else if (isWholeCardLink) cardTag = 'a';
  const card = document.createElement(cardTag);
  card.className = 'feature-card';

  if (isWholeCardLink) {
    card.href = cardData.linkUrl;
    card.classList.add('has-link', 'whole-card-link');
  }

  if (isLogout) {
    card.type = 'button';
    card.classList.add('has-link', 'feature-card-logout');
    card.addEventListener('click', logout);
  }

  const media = createMedia(cardData.iconCell);
  if (media) card.append(media);

  if (cardData.title) {
    const title = document.createElement('h3');
    title.innerHTML = normalizeInlineHtml(cardData.title);
    card.append(title);
  }

  if (cardData.description) {
    const description = document.createElement('p');
    description.innerHTML = normalizeInlineHtml(cardData.description);
    card.append(description);
  }

  if (cardData.linkText && cardData.linkUrl) {
    const cta = document.createElement('span');
    cta.className = 'feature-card-link';
    cta.textContent = cardData.linkText;
    card.append(cta);
    card.classList.add('has-link');
  }

  return card;
}

function readCards(rows) {
  return rows
    .filter((row) => !isHeaderRow(row) && !isConfigRow(row))
    .map((row) => {
      const fourthCellValue = getHref(getCell(row, 3));
      const fifthCellValue = getHref(getCell(row, 4));
      const action = fourthCellValue.toLowerCase().replace(/\s+/g, '-');

      return {
        iconCell: getCell(row, 0),
        title: getHtml(getCell(row, 1)),
        description: getHtml(getCell(row, 2)),
        linkText: fifthCellValue ? getText(getCell(row, 3)) : '',
        linkUrl: fifthCellValue || (isHrefValue(fourthCellValue) ? fourthCellValue : ''),
        action: action === 'sign-out' || action === 'signout' ? 'sign-out' : '',
      };
    })
    .filter((card) => getText(card.iconCell) || card.title || card.description);
}

export default function decorate(block) {
  const rows = [...block.children];
  const header = buildHeader(readHeaderConfig(rows));

  if (block.classList.contains('stats')) {
    const stats = readStats(rows.filter((row) => !isConfigRow(row)));
    block.textContent = '';
    if (header) block.append(header);
    stats.forEach((stat) => {
      block.append(buildStat(stat));
    });
    return;
  }

  if (block.classList.contains('steps')) {
    const config = readStepsConfig([...block.children]);
    block.textContent = '';
    block.append(buildSteps(config));
    return;
  }

  if (block.classList.contains('team')) {
    const teamCards = readTeamCards(rows);
    block.textContent = '';
    if (header) block.append(header);
    teamCards.forEach((cardData) => {
      block.append(buildTeamCard(cardData));
    });
    return;
  }

  if (block.classList.contains('callout')) {
    const config = readCalloutConfig([...block.children]);
    block.textContent = '';
    if (config.variant) addVariantClasses(block, config.variant);
    block.append(buildCallout(config));
    return;
  }

  if (block.classList.contains('process')) {
    const steps = readProcessSteps(rows.filter((row) => !isConfigRow(row)));
    block.textContent = '';
    if (header) block.append(header);
    steps.forEach((stepData) => {
      block.append(buildProcessStep(stepData));
    });
    return;
  }

  const cards = readCards(rows);
  block.textContent = '';
  if (header) block.append(header);

  cards.forEach((cardData) => {
    block.append(buildCard(cardData));
  });
}
