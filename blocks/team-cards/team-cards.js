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
  return labels.includes('image') && labels.includes('name');
}

function createImage(cell, alt) {
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

function readCards(rows) {
  return rows
    .filter((row) => !isHeaderRow(row))
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

function buildCard(cardData) {
  const card = document.createElement('article');
  card.className = 'team-card';

  const image = createImage(cardData.imageCell, cardData.imageAlt);
  if (image) {
    const media = document.createElement('div');
    media.className = 'team-card-media';
    media.append(image);
    card.append(media);
  }

  const body = document.createElement('div');
  body.className = 'team-card-body';

  if (cardData.name) {
    const name = document.createElement('h3');
    name.innerHTML = normalizeInlineHtml(cardData.name);
    body.append(name);
  }

  if (cardData.role) {
    const role = document.createElement('span');
    role.className = 'team-card-role';
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
    link.className = 'team-card-link';
    link.href = cardData.linkUrl;
    link.textContent = cardData.linkText;
    body.append(link);
  }

  if (body.children.length) card.append(body);
  return card;
}

export default function decorate(block) {
  const cards = readCards([...block.children]);
  block.textContent = '';

  cards.forEach((cardData) => {
    block.append(buildCard(cardData));
  });
}
