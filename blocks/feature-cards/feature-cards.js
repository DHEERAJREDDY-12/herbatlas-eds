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
  tmp.innerHTML = html;

  if (tmp.children.length === 1 && tmp.firstElementChild.tagName === 'P') {
    return tmp.firstElementChild.innerHTML.trim();
  }

  return html;
}

function isHeaderRow(row) {
  const labels = [...row.children].map((cell) => getText(cell).toLowerCase());
  return labels.includes('title') && (labels.includes('icon') || labels.includes('image'));
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
  const card = document.createElement(isLogout ? 'button' : isWholeCardLink ? 'a' : 'article');
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
    .filter((row) => !isHeaderRow(row))
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
  const cards = readCards([...block.children]);
  block.textContent = '';

  cards.forEach((cardData) => {
    block.append(buildCard(cardData));
  });
}
