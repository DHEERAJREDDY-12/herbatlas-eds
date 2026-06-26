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

function isHeaderRow(row) {
  const labels = [...row.children].map((cell) => getText(cell).toLowerCase());
  return labels.includes('question') && labels.includes('answer');
}

function isOpenValue(value) {
  return ['open', 'true', 'yes', '1'].includes(value.trim().toLowerCase());
}

function readConfig(rows) {
  const config = {
    title: '',
    description: '',
    items: [],
  };

  rows.forEach((row) => {
    if (isHeaderRow(row)) return;

    const key = normalizeKey(getCell(row, 0));

    if (key === 'title') {
      config.title = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'description' || key === 'subtitle') {
      config.description = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'question' || key === 'item') {
      const question = getHtml(getCell(row, 1));
      const answer = getHtml(getCell(row, 2));
      const open = isOpenValue(getText(getCell(row, 3)));

      if (question || answer) {
        config.items.push({ question, answer, open });
      }
      return;
    }

    const question = getHtml(getCell(row, 0));
    const answer = getHtml(getCell(row, 1));
    const open = isOpenValue(getText(getCell(row, 2)));

    if (question || answer) {
      config.items.push({ question, answer, open });
    }
  });

  return config;
}

function buildIntro(config) {
  const intro = document.createElement('div');
  intro.className = 'faq-intro';

  if (config.title) {
    const title = document.createElement('h2');
    title.innerHTML = normalizeInlineHtml(config.title);
    intro.append(title);
  }

  if (config.description) {
    const description = document.createElement('p');
    description.innerHTML = normalizeInlineHtml(config.description);
    intro.append(description);
  }

  return intro;
}

function buildItem(item) {
  const details = document.createElement('details');
  details.className = 'faq-item';
  if (item.open) details.open = true;

  const summary = document.createElement('summary');
  summary.innerHTML = normalizeInlineHtml(item.question);
  details.append(summary);

  if (item.answer) {
    const answer = document.createElement('div');
    answer.className = 'faq-answer';
    answer.innerHTML = item.answer;
    details.append(answer);
  }

  return details;
}

function enableSingleOpen(list) {
  list.addEventListener('toggle', (event) => {
    const openedItem = event.target;
    if (!(openedItem instanceof HTMLDetailsElement) || !openedItem.open) return;

    list.querySelectorAll('.faq-item[open]').forEach((item) => {
      if (item !== openedItem) item.open = false;
    });
  }, true);
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const intro = buildIntro(config);
  if (intro.children.length) block.append(intro);

  const list = document.createElement('div');
  list.className = 'faq-list';
  config.items.forEach((item) => {
    list.append(buildItem(item));
  });

  if (list.children.length) {
    enableSingleOpen(list);
    block.append(list);
  }
}
