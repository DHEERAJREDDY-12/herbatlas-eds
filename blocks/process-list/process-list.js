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

function normalizeInlineHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  if (tmp.children.length === 1 && tmp.firstElementChild.tagName === 'P') {
    return tmp.firstElementChild.innerHTML.trim();
  }

  return html;
}

function isHeaderRow(row) {
  const labels = [...row.children].map((cell) => getText(cell).toLowerCase());
  return labels.includes('title') && labels.includes('description');
}

function createIcon(cell) {
  const picture = cell?.querySelector('picture');
  if (picture) {
    const icon = document.createElement('span');
    icon.className = 'process-list-icon process-list-icon-image';
    icon.append(picture.cloneNode(true));
    return icon;
  }

  const img = cell?.querySelector('img');
  if (img) {
    const icon = document.createElement('span');
    icon.className = 'process-list-icon process-list-icon-image';
    icon.append(img.cloneNode(true));
    return icon;
  }

  const mediaPath = getHref(cell);
  if (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(mediaPath)) {
    const icon = document.createElement('span');
    icon.className = 'process-list-icon process-list-icon-image';

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
  icon.className = 'process-list-icon';
  icon.innerHTML = normalizeInlineHtml(text);
  return icon;
}

function readSteps(rows) {
  return rows
    .filter((row) => !isHeaderRow(row))
    .map((row) => ({
      iconCell: getCell(row, 0),
      title: getHtml(getCell(row, 1)),
      description: getHtml(getCell(row, 2)),
    }))
    .filter((step) => getText(step.iconCell) || step.title || step.description);
}

function buildStep(stepData) {
  const step = document.createElement('article');
  step.className = 'process-list-step';

  const icon = createIcon(stepData.iconCell);
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

export default function decorate(block) {
  const steps = readSteps([...block.children]);
  block.textContent = '';

  steps.forEach((stepData) => {
    block.append(buildStep(stepData));
  });
}
