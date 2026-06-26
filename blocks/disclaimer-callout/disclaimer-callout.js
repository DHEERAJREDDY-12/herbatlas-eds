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

function readConfig(rows) {
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

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  if (config.variant) addVariantClasses(block, config.variant);

  if (config.icon) {
    const icon = document.createElement('span');
    icon.className = 'disclaimer-callout-icon';
    icon.innerHTML = normalizeInlineHtml(config.icon);
    block.append(icon);
  }

  if (config.eyebrow) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'disclaimer-callout-eyebrow';
    eyebrow.innerHTML = normalizeInlineHtml(config.eyebrow);
    block.append(eyebrow);
  }

  if (config.title) {
    const title = document.createElement('h2');
    title.className = 'disclaimer-callout-title';
    title.innerHTML = normalizeInlineHtml(config.title);
    block.append(title);
  }

  config.body.forEach((item) => {
    const body = document.createElement('p');
    body.className = 'disclaimer-callout-body';
    body.innerHTML = normalizeInlineHtml(item);
    block.append(body);
  });

  if (config.meta) {
    const meta = document.createElement('p');
    meta.className = 'disclaimer-callout-meta';
    meta.innerHTML = normalizeInlineHtml(config.meta);
    block.append(meta);
  }
}
