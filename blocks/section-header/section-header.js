function getCell(row, index) {
  return row?.children[index] || null;
}

function getText(cell) {
  return cell?.textContent.trim() || '';
}

function getHtml(cell) {
  return cell?.innerHTML.trim() || '';
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

function getHref(cell) {
  const link = cell?.querySelector('a[href]');
  return link?.getAttribute('href') || getText(cell);
}

function isTruthy(value) {
  return ['true', 'yes', '1', 'signed in', 'logged in'].includes(value.toLowerCase());
}

function isLoggedIn() {
  return localStorage.getItem('loggedIn') === 'true' || Boolean(localStorage.getItem('userEmail'));
}

function createTextCell(value) {
  const cell = document.createElement('div');
  cell.textContent = value;
  return cell;
}

function getConfigPairs(rows) {
  const pairs = [];
  let pendingLabel = null;

  rows.forEach((row) => {
    const cells = [...row.children].filter((cell) => getText(cell) || getHtml(cell));

    if (cells.length >= 2) {
      pairs.push([cells[0], cells[1]]);
      pendingLabel = null;
      return;
    }

    if (cells.length === 1) {
      if (!pendingLabel) {
        pendingLabel = cells[0];
        return;
      }

      pairs.push([pendingLabel, cells[0]]);
      pendingLabel = null;
    }
  });

  return pairs;
}

function getFlatConfigPairs(source) {
  const labels = new Set([
    'eyebrow',
    'label',
    'title',
    'description',
    'subtitle',
    'cta text',
    'link text',
    'cta link',
    'link',
    'auth required',
    'logged in only',
    'show when signed in',
  ]);
  const lines = source.textContent
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const pairs = [];

  lines.forEach((line, index) => {
    if (!labels.has(line.toLowerCase())) return;
    const nextLine = lines[index + 1];
    if (nextLine) pairs.push([createTextCell(line), createTextCell(nextLine)]);
  });

  return pairs;
}

function readConfig(source) {
  const config = {
    eyebrow: '',
    title: '',
    description: '',
    ctaText: '',
    ctaLink: '',
    authRequired: false,
  };
  const rows = [...source.children];
  const pairs = getConfigPairs(rows);
  const configPairs = pairs.length ? pairs : getFlatConfigPairs(source);

  configPairs.forEach(([labelCell, valueCell]) => {
    const key = normalizeKey(labelCell);

    if (key === 'eyebrow' || key === 'label') {
      config.eyebrow = getHtml(valueCell);
      return;
    }

    if (key === 'title') {
      config.title = getHtml(valueCell);
      return;
    }

    if (key === 'description' || key === 'subtitle') {
      config.description = getHtml(valueCell);
      return;
    }

    if (key === 'cta-text' || key === 'link-text') {
      config.ctaText = getText(valueCell);
      return;
    }

    if (key === 'cta-link' || key === 'link') {
      config.ctaLink = getHref(valueCell);
      return;
    }

    if (key === 'auth-required' || key === 'logged-in-only' || key === 'show-when-signed-in') {
      config.authRequired = isTruthy(getText(valueCell));
    }
  });

  return config;
}

function buildTextGroup(config) {
  const textGroup = document.createElement('div');
  textGroup.className = 'section-header-text';

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'section-header-label';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    textGroup.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h2');
    title.className = 'section-header-title';
    title.innerHTML = normalizeInlineHtml(config.title);
    textGroup.append(title);
  }

  if (config.description) {
    const description = document.createElement('p');
    description.className = 'section-header-description';
    description.innerHTML = normalizeInlineHtml(config.description);
    textGroup.append(description);
  }

  return textGroup;
}

function buildCta(config) {
  if (!config.ctaText || !config.ctaLink) return null;

  const cta = document.createElement('a');
  cta.className = 'section-header-cta';
  cta.href = config.ctaLink;
  cta.textContent = config.ctaText;
  return cta;
}

export default function decorate(block) {
  const source = block.cloneNode(true);
  block.textContent = '';
  const config = readConfig(source);

  if (config.authRequired && !isLoggedIn()) {
    block.hidden = true;
    return;
  }

  const textGroup = buildTextGroup(config);
  if (textGroup.children.length) block.append(textGroup);

  const cta = buildCta(config);
  if (cta) block.append(cta);
}
