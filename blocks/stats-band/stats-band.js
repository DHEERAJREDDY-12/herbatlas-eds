function getCell(row, index) {
  return row?.children[index] || null;
}

function getText(cell) {
  return cell?.textContent.trim() || '';
}

function getHtml(cell) {
  return cell?.innerHTML.trim() || '';
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
  return labels.includes('number') && labels.includes('label');
}

function readStats(rows) {
  return rows
    .filter((row) => !isHeaderRow(row))
    .map((row) => ({
      number: getHtml(getCell(row, 0)),
      label: getHtml(getCell(row, 1)),
      description: getHtml(getCell(row, 2)),
    }))
    .filter((stat) => stat.number || stat.label || stat.description);
}

function buildStat(stat) {
  const item = document.createElement('div');
  item.className = 'stats-band-item';

  if (stat.number) {
    const number = document.createElement('strong');
    number.className = 'stats-band-number';
    number.innerHTML = normalizeInlineHtml(stat.number);
    item.append(number);
  }

  if (stat.label) {
    const label = document.createElement('span');
    label.className = 'stats-band-label';
    label.innerHTML = normalizeInlineHtml(stat.label);
    item.append(label);
  }

  if (stat.description) {
    const description = document.createElement('p');
    description.className = 'stats-band-description';
    description.innerHTML = normalizeInlineHtml(stat.description);
    item.append(description);
  }

  return item;
}

export default function decorate(block) {
  const stats = readStats([...block.children]);
  block.textContent = '';

  stats.forEach((stat) => {
    block.append(buildStat(stat));
  });
}
