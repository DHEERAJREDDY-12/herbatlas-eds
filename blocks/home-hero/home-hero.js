const INTERVAL_MS = 4000;
const TRANSITION_MS = 500;
const HERB_COUNT_FALLBACK = 40;

function getCell(row, index) {
  return row?.children[index] || null;
}

function getText(cell) {
  return cell?.textContent.trim() || '';
}

function getHtml(cell) {
  return cell?.innerHTML.trim() || '';
}

function getTextFromHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent.trim();
}

function normalizeInlineHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  if (tmp.children.length === 1 && tmp.firstElementChild.tagName === 'P') {
    return tmp.firstElementChild.innerHTML.trim();
  }
  return html;
}

function normalizeAuthoredHeroHtml(html, preserveLineBreaks = false) {
  let normalized = normalizeInlineHtml(html)
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
    .replace(/&lt;em&gt;/gi, '<em>')
    .replace(/&lt;\/em&gt;/gi, '</em>');

  if (preserveLineBreaks) {
    normalized = normalized.replace(/\r?\n/g, '<br>');
  }

  return normalized;
}

function normalizeKey(cell) {
  return getText(cell).toLowerCase().replace(/\s+/g, '-');
}

function getHref(cell) {
  const link = cell?.querySelector('a[href]');
  return link?.getAttribute('href') || getText(cell);
}

function replaceHerbCountPlaceholder(html) {
  const countMarkup = '<span class="hh-herb-count">40</span>';
  return html.replace(/\{\{\s*herbcount\s*\}\}|\{\s*herbcount\s*\}/gi, countMarkup);
}

function setImageLoadingPriority(imageRoot, isLcpImage = false) {
  const img = imageRoot?.tagName === 'IMG' ? imageRoot : imageRoot?.querySelector?.('img');
  if (!img) return;

  img.loading = isLcpImage ? 'eager' : 'lazy';
  img.decoding = 'async';

  if (isLcpImage) {
    img.setAttribute('fetchpriority', 'high');
  } else {
    img.removeAttribute('fetchpriority');
  }
}

function createImage(cell, alt, isLcpImage = false) {
  const picture = cell?.querySelector('picture');
  if (picture) {
    const clonedPicture = picture.cloneNode(true);
    const img = clonedPicture.querySelector('img');
    if (img) {
      if (alt) img.alt = alt;
      // Set dimensions to prevent CLS
      if (!img.width) img.width = 260;
      if (!img.height) img.height = 173;
    }
    setImageLoadingPriority(clonedPicture, isLcpImage);
    return clonedPicture;
  }

  const img = cell?.querySelector('img');
  if (img) {
    const clonedImg = img.cloneNode(true);
    if (alt) clonedImg.alt = alt;
    // Set dimensions to prevent CLS
    if (!clonedImg.width) clonedImg.width = 260;
    if (!clonedImg.height) clonedImg.height = 173;
    setImageLoadingPriority(clonedImg, isLcpImage);
    return clonedImg;
  }

  const src = getHref(cell);
  if (!src) return null;

  const fallbackImg = document.createElement('img');
  fallbackImg.src = src;
  fallbackImg.alt = alt || '';
  // Set dimensions to prevent CLS
  fallbackImg.width = 260;
  fallbackImg.height = 173;
  setImageLoadingPriority(fallbackImg, isLcpImage);
  return fallbackImg;
}

function readConfig(rows) {
  const config = {
    eyebrow: '',
    title: '',
    description: '',
    stats: [],
    slides: [],
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));

    if (key === 'eyebrow') {
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

    if (key === 'stat') {
      config.stats.push({
        value: getHtml(getCell(row, 1)),
        label: getHtml(getCell(row, 2)),
      });
      return;
    }

    if (key === 'slide') {
      config.slides.push({
        label: getHtml(getCell(row, 1)),
        imageCell: getCell(row, 2),
        alt: getText(getCell(row, 3)),
        title: getHtml(getCell(row, 4)),
        meta: getHtml(getCell(row, 5)),
        uses: getHtml(getCell(row, 6)),
        ctaText: getText(getCell(row, 7)),
        ctaHref: getHref(getCell(row, 8)),
        offerCode: getText(getCell(row, 9)),
      });
    }
  });

  return config;
}

async function getAvailableHerbCount() {
  if (Array.isArray(window.HERBS_DATA) && window.HERBS_DATA.length) {
    return window.HERBS_DATA.length;
  }

  try {
    const resp = await fetch('/data/herbs.json');
    if (!resp.ok) return HERB_COUNT_FALLBACK;
    const data = await resp.json();
    return Array.isArray(data) && data.length ? data.length : HERB_COUNT_FALLBACK;
  } catch {
    return HERB_COUNT_FALLBACK;
  }
}

async function updateHerbCount(block) {
  const count = await getAvailableHerbCount();
  block.querySelectorAll('.hh-herb-count').forEach((el) => {
    el.textContent = count;
  });
}

function buildIntro(config) {
  const content = document.createElement('div');
  content.className = 'hh-content';

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'hh-eyebrow';
    eyebrow.innerHTML = normalizeAuthoredHeroHtml(config.eyebrow);
    content.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h1');
    title.innerHTML = replaceHerbCountPlaceholder(normalizeAuthoredHeroHtml(config.title, true));
    content.append(title);
  }

  if (config.description) {
    const description = document.createElement('p');
    description.className = 'hh-sub';
    description.innerHTML = replaceHerbCountPlaceholder(normalizeAuthoredHeroHtml(config.description));
    content.append(description);
  }

  if (config.stats.length) {
    const stats = document.createElement('div');
    stats.className = 'hh-stats';

    config.stats.forEach((item) => {
      const stat = document.createElement('div');
      stat.className = 'hh-stat';

      const value = document.createElement('span');
      value.className = 'hh-stat-num';
      if (getTextFromHtml(item.label).toLowerCase().includes('herb')) {
        value.classList.add('hh-herb-count');
      }
      value.innerHTML = replaceHerbCountPlaceholder(normalizeInlineHtml(item.value));

      const label = document.createElement('span');
      label.className = 'hh-stat-label';
      label.innerHTML = normalizeInlineHtml(item.label);

      stat.append(value, label);
      stats.append(stat);
    });

    content.append(stats);
  }

  return content;
}

function buildSlide(slide, index) {
  const article = document.createElement('article');
  article.className = index === 0 ? 'hh-slide hh-slide-active' : 'hh-slide';
  article.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');

  if (slide.label) {
    const label = document.createElement('span');
    label.className = 'hh-card-label';
    label.innerHTML = normalizeAuthoredHeroHtml(slide.label);
    article.append(label);
  }

  const imageWrap = document.createElement('div');
  imageWrap.className = 'hh-img-wrap';
  const image = createImage(slide.imageCell, slide.alt, index === 0);
  if (image) imageWrap.append(image);
  article.append(imageWrap);

  if (slide.title) {
    const title = document.createElement('h2');
    title.innerHTML = normalizeAuthoredHeroHtml(slide.title);
    article.append(title);
  }

  if (slide.meta) {
    const meta = document.createElement('p');
    meta.innerHTML = normalizeAuthoredHeroHtml(slide.meta);
    article.append(meta);
  }

  if (slide.uses) {
    const uses = document.createElement('span');
    uses.className = 'hh-card-uses';
    uses.innerHTML = normalizeAuthoredHeroHtml(slide.uses);
    article.append(uses);
  }

  if (slide.ctaText && slide.ctaHref) {
    const cta = document.createElement('a');
    cta.className = 'hh-btn';
    cta.href = slide.ctaHref;
    cta.textContent = slide.ctaText;
    if (slide.offerCode) {
      cta.dataset.heroOffer = slide.offerCode;
    }
    article.append(cta);
  }

  return article;
}

function buildCarousel(config) {
  const carousel = document.createElement('div');
  carousel.className = 'hh-carousel';
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-label', 'Featured herbs carousel');
  carousel.tabIndex = 0;

  const track = document.createElement('div');
  track.className = 'hh-track';
  track.setAttribute('aria-live', 'polite');
  track.setAttribute('aria-atomic', 'false');

  config.slides.forEach((slide, index) => {
    track.append(buildSlide(slide, index));
  });

  carousel.append(track);

  if (config.slides.length > 1) {
    const prev = document.createElement('button');
    prev.className = 'hh-arrow hh-arrow-prev';
    prev.type = 'button';
    prev.setAttribute('aria-label', 'Previous slide');
    prev.innerHTML = '&#8249;';

    const next = document.createElement('button');
    next.className = 'hh-arrow hh-arrow-next';
    next.type = 'button';
    next.setAttribute('aria-label', 'Next slide');
    next.innerHTML = '&#8250;';

    const dots = document.createElement('div');
    dots.className = 'hh-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Carousel slide navigation');

    config.slides.forEach((slide, index) => {
      const dot = document.createElement('button');
      dot.className = index === 0 ? 'hh-dot hh-dot-active' : 'hh-dot';
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      dot.setAttribute('aria-label', `Slide ${index + 1}`);
      dot.dataset.index = index;
      dots.append(dot);
    });

    carousel.append(prev, next, dots);
  }

  return carousel;
}

function initCarousel(carousel) {
  const slides = [...carousel.querySelectorAll('.hh-slide')];
  const dots = [...carousel.querySelectorAll('.hh-dot')];
  const prevBtn = carousel.querySelector('.hh-arrow-prev');
  const nextBtn = carousel.querySelector('.hh-arrow-next');
  const offerBtns = [...carousel.querySelectorAll('[data-hero-offer]')];

  if (slides.length < 2) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let timer = null;
  let transitioning = false;
  let touchStartX = 0;
  let goTo;

  function startTimer() {
    if (!timer && !prefersReduced) {
      timer = setInterval(() => goTo(current + 1), INTERVAL_MS);
    }
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  goTo = function goToSlide(index, fromInteraction = false) {
    if (transitioning || index === current) return;
    transitioning = true;

    slides[current].classList.remove('hh-slide-active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('hh-dot-active');
    dots[current].setAttribute('aria-selected', 'false');

    current = ((index % slides.length) + slides.length) % slides.length;

    slides[current].classList.add('hh-slide-active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('hh-dot-active');
    dots[current].setAttribute('aria-selected', 'true');
    carousel.setAttribute(
      'aria-label',
      `Featured herbs carousel, slide ${current + 1} of ${slides.length}`,
    );

    setTimeout(() => {
      transitioning = false;
    }, prefersReduced ? 0 : TRANSITION_MS);

    if (fromInteraction) {
      stopTimer();
      startTimer();
    }
  };

  prevBtn?.addEventListener('click', () => {
    stopTimer();
    goTo(current - 1, true);
  });

  nextBtn?.addEventListener('click', () => {
    stopTimer();
    goTo(current + 1, true);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopTimer();
      goTo(index, true);
    });
  });

  offerBtns.forEach((button) => {
    button.addEventListener('click', () => {
      localStorage.setItem('showCoupon', 'true');
    });
  });

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      stopTimer();
      goTo(current - 1, true);
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      stopTimer();
      goTo(current + 1, true);
      event.preventDefault();
    }
  });

  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);
  carousel.addEventListener('focusin', stopTimer);
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) startTimer();
  });

  carousel.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
    stopTimer();
  }, { passive: true });

  carousel.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      goTo(delta < 0 ? current + 1 : current - 1, true);
    } else {
      startTimer();
    }
  }, { passive: true });

  startTimer();
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const intro = buildIntro(config);
  const carousel = buildCarousel(config);

  block.append(intro);
  if (config.slides.length) block.append(carousel);

  updateHerbCount(block);
  initCarousel(carousel);
}
