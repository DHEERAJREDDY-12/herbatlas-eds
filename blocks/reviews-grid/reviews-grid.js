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

function getBoolean(value) {
  return ['true', 'yes', 'verified', '1'].includes(value.toLowerCase());
}

function getInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function clampRating(value) {
  const rating = parseInt(value, 10);
  if (!Number.isFinite(rating)) return 5;
  return Math.min(5, Math.max(0, rating));
}

function parseBadges(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readConfig(rows) {
  const config = {
    eyebrow: '',
    title: '',
    ctaText: '',
    ctaLink: '',
    reviews: [],
    aggregate: null,
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

    if (key === 'review') {
      const name = getText(getCell(row, 1));
      const rating = clampRating(getText(getCell(row, 2)));
      const text = getHtml(getCell(row, 3));
      const product = getText(getCell(row, 4));
      const verified = getBoolean(getText(getCell(row, 5)));
      const avatar = getText(getCell(row, 6));
      const location = getText(getCell(row, 7));

      if (name && text) {
        config.reviews.push({
          name,
          rating,
          text,
          product,
          verified,
          avatar,
          location,
        });
      }
      return;
    }

    if (key === 'aggregate') {
      config.aggregate = {
        score: getText(getCell(row, 1)),
        label: getText(getCell(row, 2)) || 'out of 5',
        count: getText(getCell(row, 3)),
        badges: parseBadges(getText(getCell(row, 4))),
      };
    }
  });

  return config;
}

function buildStars(rating) {
  const container = document.createElement('div');
  
  const stars = document.createElement('div');
  stars.className = 'reviews-grid-stars';
  stars.setAttribute('aria-hidden', 'true');

  for (let i = 1; i <= 5; i += 1) {
    const star = document.createElement('span');
    star.className = i > rating
      ? 'reviews-grid-star empty'
      : 'reviews-grid-star';
    star.innerHTML = '&#9733;';
    stars.append(star);
  }

  container.append(stars);

  // Add screen-reader-only text outside aria-hidden parent
  const srText = document.createElement('span');
  srText.className = 'sr-only';
  srText.textContent = `${rating} out of 5 stars`;
  container.append(srText);

  return container;
}

function buildHeader(config) {
  if (!config.eyebrow && !config.title && !config.ctaText) return null;

  const header = document.createElement('div');
  header.className = 'reviews-grid-header';

  const textWrap = document.createElement('div');

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'reviews-grid-label';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    textWrap.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h2');
    title.className = 'reviews-grid-title';
    title.innerHTML = normalizeInlineHtml(config.title);
    textWrap.append(title);
  }

  header.append(textWrap);

  if (config.ctaText && config.ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'reviews-grid-cta';
    cta.href = config.ctaLink;
    cta.textContent = config.ctaText;
    header.append(cta);
  }

  return header;
}

function buildAvatar(review) {
  const avatar = document.createElement('div');
  avatar.className = 'reviews-grid-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = review.avatar || getInitial(review.name);
  return avatar;
}

function buildReviewCard(review) {
  const card = document.createElement('article');
  card.className = 'reviews-grid-card';

  card.append(buildStars(review.rating));

  const text = document.createElement('p');
  text.className = 'reviews-grid-text';
  text.innerHTML = normalizeInlineHtml(review.text);
  card.append(text);

  const meta = document.createElement('div');
  meta.className = 'reviews-grid-meta';
  meta.append(buildAvatar(review));

  const details = document.createElement('div');
  details.className = 'reviews-grid-details';

  const name = document.createElement('span');
  name.className = 'reviews-grid-name';
  name.textContent = review.name;
  details.append(name);

  if (review.product || review.location) {
    const product = document.createElement('span');
    product.className = 'reviews-grid-product';
    product.textContent = review.product || review.location;
    details.append(product);
  }

  meta.append(details);

  if (review.verified) {
    const verified = document.createElement('span');
    verified.className = 'reviews-grid-verified';
    verified.textContent = 'Verified';
    meta.append(verified);
  }

  card.append(meta);
  return card;
}

function buildAggregate(aggregate) {
  if (!aggregate) return null;

  const rating = clampRating(aggregate.score);
  const strip = document.createElement('div');
  strip.className = 'reviews-grid-aggregate';

  const score = document.createElement('div');
  score.className = 'reviews-grid-agg-score';

  const number = document.createElement('span');
  number.className = 'reviews-grid-agg-num';
  number.textContent = aggregate.score;
  score.append(number);

  const label = document.createElement('span');
  label.className = 'reviews-grid-agg-label';
  label.textContent = aggregate.label;
  score.append(label);
  strip.append(score);

  const stars = document.createElement('div');
  stars.className = 'reviews-grid-agg-stars';
  stars.append(buildStars(rating));

  if (aggregate.count) {
    const count = document.createElement('span');
    count.className = 'reviews-grid-agg-count';
    count.textContent = aggregate.count;
    stars.append(count);
  }
  strip.append(stars);

  if (aggregate.badges.length) {
    const divider = document.createElement('div');
    divider.className = 'reviews-grid-agg-divider';
    divider.setAttribute('aria-hidden', 'true');
    strip.append(divider);

    const badges = document.createElement('div');
    badges.className = 'reviews-grid-agg-badges';
    aggregate.badges.forEach((item) => {
      const badge = document.createElement('span');
      badge.className = 'reviews-grid-agg-badge';
      badge.textContent = item;
      badges.append(badge);
    });
    strip.append(badges);
  }

  return strip;
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const header = buildHeader(config);
  if (header) block.append(header);

  if (config.reviews.length) {
    const grid = document.createElement('div');
    grid.className = 'reviews-grid-list';

    config.reviews.forEach((review) => {
      grid.append(buildReviewCard(review));
    });

    block.append(grid);
  }

  const aggregate = buildAggregate(config.aggregate);
  if (aggregate) block.append(aggregate);
}
