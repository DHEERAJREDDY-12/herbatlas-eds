const DATA_URL = '/data/herbs.json';

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
    backText: 'Back to Browse',
    backLink: '/browse',
    detailBase: '/herb-detail',
    shopDetailBase: '/shop-detail',
    relatedTitle: 'Related Herbs',
    usesTitle: 'Medicinal Uses',
    dosageTitle: 'How to Use & Dosage',
    warningsTitle: 'Warnings & Precautions',
    cautionTitle: 'Why Use with Caution',
    avoidTitle: 'Who Should Avoid',
    interactionsTitle: 'Drug Interactions',
    funFactTitle: 'Did You Know?',
    missingTitle: 'Herb not found',
    missingText: 'Choose a herb from the browse page.',
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));
    const value = getText(getCell(row, 1));

    if (key === 'back-link-text' || key === 'back-text') {
      config.backText = value || config.backText;
      return;
    }

    if (key === 'back-link') {
      config.backLink = getHref(getCell(row, 1)) || config.backLink;
      return;
    }

    if (key === 'detail-base' || key === 'detail-link-base') {
      config.detailBase = getHref(getCell(row, 1)) || config.detailBase;
      return;
    }

    if (key === 'shop-detail-base' || key === 'shop-link-base') {
      config.shopDetailBase = getHref(getCell(row, 1)) || config.shopDetailBase;
      return;
    }

    if (key === 'related-title') {
      config.relatedTitle = value || config.relatedTitle;
      return;
    }

    if (key === 'uses-title') {
      config.usesTitle = value || config.usesTitle;
      return;
    }

    if (key === 'dosage-title') {
      config.dosageTitle = value || config.dosageTitle;
      return;
    }

    if (key === 'warnings-title') {
      config.warningsTitle = value || config.warningsTitle;
      return;
    }

    if (key === 'caution-title') {
      config.cautionTitle = value || config.cautionTitle;
      return;
    }

    if (key === 'avoid-title') {
      config.avoidTitle = value || config.avoidTitle;
      return;
    }

    if (key === 'interactions-title') {
      config.interactionsTitle = value || config.interactionsTitle;
      return;
    }

    if (key === 'fun-fact-title') {
      config.funFactTitle = value || config.funFactTitle;
      return;
    }

    if (key === 'missing-title') {
      config.missingTitle = value || config.missingTitle;
      return;
    }

    if (key === 'missing-text') {
      config.missingText = value || config.missingText;
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

function getCurrentId() {
  const id = parseInt(new URLSearchParams(window.location.search).get('id'), 10);
  return Number.isFinite(id) ? id : null;
}

function getSafetyLabel(safety) {
  return safety === 'safe' ? 'Generally Safe' : 'Use with Caution';
}

function getDetailHref(herb, detailBase) {
  const separator = detailBase.includes('?') ? '&' : '?';
  return `${detailBase}${separator}id=${encodeURIComponent(herb.id)}`;
}

function getShopDetailHref(herb, shopDetailBase, weight = '') {
  if (!herb?.id) return '/shop';

  const separator = shopDetailBase.includes('?') ? '&' : '?';
  const href = `${shopDetailBase}${separator}id=${encodeURIComponent(herb.id)}`;
  return weight ? `${href}&weight=${encodeURIComponent(weight)}` : href;
}

function getWeightValue(weight) {
  return parseInt((weight || '').replace(/[^0-9]/g, ''), 10) || 0;
}

function getSortedWeights(herb) {
  return [...(herb.weights || [])].sort((a, b) => getWeightValue(a) - getWeightValue(b));
}

function getQuickCartWeight(herb) {
  const sortedWeights = getSortedWeights(herb);
  return sortedWeights[1] || sortedWeights[0] || '';
}

function getBulkDiscount(weightRatio) {
  if (weightRatio >= 10) return 0.22;
  if (weightRatio >= 5) return 0.16;
  if (weightRatio >= 4) return 0.14;
  if (weightRatio >= 3) return 0.1;
  if (weightRatio >= 2.5) return 0.08;
  if (weightRatio >= 2) return 0.06;
  return 0;
}

function getPriceForWeight(herb, weight) {
  if (!herb || !herb.weights?.length) return herb ? herb.price : 0;

  const sortedWeights = getSortedWeights(herb);
  const baseAmount = getWeightValue(sortedWeights[0]);
  const selectedAmount = getWeightValue(weight);
  if (!baseAmount || !selectedAmount) return herb.price;

  const weightRatio = selectedAmount / baseAmount;
  const linearPrice = herb.price * weightRatio;
  const discountedPrice = linearPrice * (1 - getBulkDiscount(weightRatio));
  return Math.max(herb.price, Math.round(discountedPrice));
}

function getCartItems() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function updateCartBadge() {
  if (typeof window.updateCartBadge === 'function') {
    window.updateCartBadge();
    return;
  }

  const total = getCartItems().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  document.querySelectorAll('#cartBadge, .cart-badge').forEach((badge) => {
    badge.textContent = total;
  });
}

function showToast(message, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
  }
}

function addHerbToCart(herb, weight) {
  if (!herb?.stock || !weight) return false;

  const cart = getCartItems();
  const price = getPriceForWeight(herb, weight);
  const existing = cart.find((item) => item.id === herb.id && item.weight === weight);

  if (existing) {
    existing.qty += 1;
    existing.price = price;
  } else {
    cart.push({
      id: herb.id,
      name: herb.name,
      image: herb.image,
      price,
      weight,
      qty: 1,
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  return true;
}

function normalizeListValues(values) {
  if (!values) return [];
  if (Array.isArray(values)) return values.map((value) => String(value).toLowerCase());
  return String(values).split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
}

function getRelatedHerbs(currentHerb, herbs) {
  if (Array.isArray(currentHerb.related_herbs) && currentHerb.related_herbs.length) {
    return currentHerb.related_herbs
      .map((id) => herbs.find((herb) => herb.id === id))
      .filter(Boolean)
      .slice(0, 4);
  }

  const currentTerms = new Set([
    ...normalizeListValues(currentHerb.ailments),
    ...normalizeListValues(currentHerb.best_for),
  ]);

  return herbs
    .filter((herb) => herb.id !== currentHerb.id)
    .map((herb) => {
      const terms = [
        ...normalizeListValues(herb.ailments),
        ...normalizeListValues(herb.best_for),
      ];
      const shared = terms.filter((term) => currentTerms.has(term)).length;
      return { herb, shared };
    })
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || a.herb.name.localeCompare(b.herb.name))
    .slice(0, 4)
    .map(({ herb }) => herb);
}

function createBadge(text, className = '') {
  const badge = document.createElement('span');
  badge.className = `herb-detail-badge ${className}`.trim();
  badge.textContent = text;
  return badge;
}

function createList(items, className) {
  const list = document.createElement('ul');
  list.className = className;

  items.filter(Boolean).forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.append(li);
  });

  return list;
}

function createSection(titleText, className = '') {
  const section = document.createElement('section');
  section.className = `herb-detail-section ${className}`.trim();

  const title = document.createElement('h2');
  title.className = 'herb-detail-section-title';
  title.textContent = titleText;
  section.append(title);

  return section;
}

function formatDosageTitle(key) {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildHero(herb, config) {
  const hero = document.createElement('section');
  hero.className = 'herb-detail-hero';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'herb-detail-image-wrap';

  const image = document.createElement('img');
  image.className = 'herb-detail-image';
  image.src = herb.image;
  image.alt = herb.name;
  image.width = 260;
  image.height = 260;
  image.fetchPriority = 'high';
  image.addEventListener('error', () => {
    image.style.display = 'none';
  }, { once: true });
  imageWrap.append(image);

  const content = document.createElement('div');
  content.className = 'herb-detail-hero-content';

  const back = document.createElement('a');
  back.className = 'herb-detail-back';
  back.href = config.backLink;
  back.textContent = config.backText;
  content.append(back);

  const title = document.createElement('h1');
  title.textContent = herb.name;
  content.append(title);

  const scientific = document.createElement('p');
  scientific.className = 'herb-detail-scientific';
  scientific.textContent = herb.scientific_name;
  content.append(scientific);

  const description = document.createElement('p');
  description.className = 'herb-detail-description';
  description.textContent = herb.description;
  content.append(description);

  const badges = document.createElement('div');
  badges.className = 'herb-detail-badges';
  badges.append(
    createBadge(getSafetyLabel(herb.safety), `badge-${herb.safety}`),
    createBadge(herb.region, 'badge-region'),
    createBadge(herb.type, 'badge-type'),
  );
  content.append(badges);

  hero.append(imageWrap, content);
  return hero;
}

function buildAtAGlance(herb) {
  const glance = document.createElement('section');
  glance.className = 'herb-detail-glance';

  [
    ['Best For', herb.best_for],
    ['Origin', herb.origin],
    ['Part Used', herb.type],
    ['Preparation', 'Powder'],
    ['Safety', getSafetyLabel(herb.safety)],
  ].forEach(([labelText, valueText]) => {
    const item = document.createElement('div');
    item.className = 'herb-detail-glance-item';

    const label = document.createElement('span');
    label.className = 'herb-detail-glance-label';
    label.textContent = labelText;

    const value = document.createElement('span');
    value.className = labelText === 'Safety'
      ? `herb-detail-glance-value safety-${herb.safety}`
      : 'herb-detail-glance-value';
    value.textContent = valueText;

    item.append(label, value);
    glance.append(item);
  });

  return glance;
}

function buildUses(herb, config) {
  const section = createSection(config.usesTitle);
  section.append(createList(herb.uses || [], 'herb-detail-uses-list'));
  return section;
}

function buildDosage(herb, config) {
  const section = createSection(config.dosageTitle);
  const grid = document.createElement('div');
  grid.className = 'herb-detail-dosage-grid';

  Object.entries(herb.dosage || {}).forEach(([method, text]) => {
    const card = document.createElement('article');
    card.className = 'herb-detail-dosage-card';

    const title = document.createElement('h3');
    title.textContent = formatDosageTitle(method);

    const body = document.createElement('p');
    body.textContent = text;

    card.append(title, body);
    grid.append(card);
  });

  section.append(grid);
  return section;
}

function buildWarningBox(titleText, items, className, note) {
  if ((!items || !items.length) && !note) return null;

  const box = document.createElement('div');
  box.className = `herb-detail-warning-box ${className}`;

  const title = document.createElement('h3');
  title.textContent = titleText;
  box.append(title);

  if (items?.length) box.append(createList(items, 'herb-detail-warning-list'));

  if (note) {
    const noteEl = document.createElement('p');
    noteEl.className = 'herb-detail-doctor-note';
    noteEl.textContent = note;
    box.append(noteEl);
  }

  return box;
}

function buildWarnings(herb, config) {
  const section = createSection(config.warningsTitle, 'herb-detail-warnings-section');
  const doctorNote = 'Doctor recommendation is required before use, especially if you are pregnant, breastfeeding, taking medicines or managing a medical condition.';

  const cautionBox = herb.safety === 'caution'
    ? buildWarningBox(
      config.cautionTitle,
      herb.caution_reasons || [],
      'warning-caution',
      doctorNote,
    )
    : null;

  const avoidBox = buildWarningBox(config.avoidTitle, herb.warnings || [], 'warning-yellow');
  const interactionsBox = buildWarningBox(
    config.interactionsTitle,
    herb.drug_interactions || [],
    'warning-red',
  );

  [cautionBox, avoidBox, interactionsBox].filter(Boolean).forEach((box) => section.append(box));
  return section;
}

function buildFunFact(herb, config) {
  if (!herb.fun_fact) return null;

  const section = document.createElement('section');
  section.className = 'herb-detail-fun-fact-section';

  const box = document.createElement('div');
  box.className = 'herb-detail-fun-fact-box';

  const title = document.createElement('h2');
  title.textContent = config.funFactTitle;

  const text = document.createElement('p');
  text.textContent = herb.fun_fact;

  const origin = document.createElement('span');
  origin.textContent = `Traditional knowledge - ${herb.region}`;

  box.append(title, text, origin);
  section.append(box);
  return section;
}

function buildShopCta(herb, config) {
  const selectedWeight = getQuickCartWeight(herb);
  const canAddToCart = Boolean(herb.stock && selectedWeight);

  const card = document.createElement('aside');
  card.className = 'herb-detail-sidebar-card herb-detail-shop-card';

  const title = document.createElement('h3');
  title.textContent = 'Want to Buy This Herb?';

  const text = document.createElement('p');
  text.textContent = 'Check price, stock and delivery options in the shop.';

  const shopLink = document.createElement('a');
  shopLink.className = 'herb-detail-shop-link';
  shopLink.href = getShopDetailHref(herb, config.shopDetailBase, selectedWeight);
  shopLink.textContent = 'View Product in Shop page';

  const addButton = document.createElement('button');
  addButton.className = 'herb-detail-shop-add';
  addButton.type = 'button';
  addButton.textContent = 'Add to Cart';
  addButton.disabled = !canAddToCart;

  const note = document.createElement('p');
  note.className = 'herb-detail-shop-note';
  note.textContent = canAddToCart
    ? `Adds ${selectedWeight} pack directly to your cart.`
    : 'Currently unavailable for direct cart add.';

  addButton.addEventListener('click', () => {
    if (!addHerbToCart(herb, selectedWeight)) return;

    const originalText = addButton.textContent;
    addButton.textContent = 'Added to Cart';
    addButton.classList.add('added');
    window.setTimeout(() => {
      addButton.textContent = originalText;
      addButton.classList.remove('added');
    }, 1500);

    showToast(`${herb.name} ${selectedWeight} added to your cart.`, 'success');
  });

  card.append(title, text, shopLink, addButton, note);
  return card;
}

function buildRelated(herb, herbs, config) {
  const relatedHerbs = getRelatedHerbs(herb, herbs);
  if (!relatedHerbs.length) return null;

  const card = document.createElement('aside');
  card.className = 'herb-detail-sidebar-card';

  const title = document.createElement('h3');
  title.textContent = config.relatedTitle;
  card.append(title);

  const list = document.createElement('div');
  list.className = 'herb-detail-related-list';

  relatedHerbs.forEach((related) => {
    const row = document.createElement('a');
    row.className = 'herb-detail-related-row';
    row.href = getDetailHref(related, config.detailBase);

    const thumb = document.createElement('span');
    thumb.className = 'herb-detail-related-thumb';

    const image = document.createElement('img');
    image.src = related.image;
    image.alt = related.name;
    image.loading = 'lazy';
    image.width = 48;
    image.height = 48;
    image.addEventListener('error', () => {
      image.style.display = 'none';
    }, { once: true });
    thumb.append(image);

    const info = document.createElement('span');
    info.className = 'herb-detail-related-info';

    const name = document.createElement('strong');
    name.textContent = related.name;

    const meta = document.createElement('span');
    meta.textContent = related.best_for;

    info.append(name, meta);
    row.append(thumb, info);
    list.append(row);
  });

  card.append(list);
  return card;
}

function buildBody(herb, herbs, config) {
  const body = document.createElement('div');
  body.className = 'herb-detail-body';

  const main = document.createElement('div');
  main.className = 'herb-detail-main';
  main.append(
    buildUses(herb, config),
    buildDosage(herb, config),
    buildWarnings(herb, config),
  );

  const funFact = buildFunFact(herb, config);
  if (funFact) main.append(funFact);

  const sidebar = document.createElement('div');
  sidebar.className = 'herb-detail-sidebar';
  const sidebarInner = document.createElement('div');
  sidebarInner.className = 'herb-detail-sidebar-inner';

  sidebarInner.append(buildShopCta(herb, config));

  const related = buildRelated(herb, herbs, config);
  if (related) sidebarInner.append(related);
  sidebar.append(sidebarInner);

  body.append(main, sidebar);
  return body;
}

function buildMissing(config) {
  const wrapper = document.createElement('div');
  wrapper.className = 'herb-detail-missing';

  const title = document.createElement('h1');
  title.textContent = config.missingTitle;

  const text = document.createElement('p');
  text.textContent = config.missingText;

  const link = document.createElement('a');
  link.href = config.backLink;
  link.textContent = config.backText;

  wrapper.append(title, text, link);
  return wrapper;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const config = readConfig(rows);
  block.textContent = '';

  try {
    const herbs = await loadHerbs();
    const currentId = getCurrentId();
    const herb = herbs.find((item) => item.id === currentId);

    if (!herb) {
      block.append(buildMissing(config));
      return;
    }

    document.title = `${herb.name} - HerbAtlas`;

    block.append(
      buildHero(herb, config),
      buildAtAGlance(herb),
      buildBody(herb, herbs, config),
    );
  } catch (error) {
    // Keep the page usable if the JSON fails during preview or local development.
    block.append(buildMissing({
      ...config,
      missingTitle: 'Unable to load herb details',
      missingText: error.message,
    }));
  }
}
