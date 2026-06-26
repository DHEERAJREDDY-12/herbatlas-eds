function normalizeInlineHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';

  if (tmp.children.length === 1 && tmp.firstElementChild.tagName === 'P') {
    return tmp.firstElementChild.innerHTML.trim();
  }

  return html || '';
}

export default function decorate(block) {
  const rows = [...block.children];
  const eyebrowRow = rows.shift();
  const titleRow = rows.shift();

  const eyebrow = eyebrowRow?.firstElementChild;
  const title = titleRow?.firstElementChild;

  block.textContent = '';

  if (eyebrow?.textContent.trim()) {
    const label = document.createElement('p');
    label.className = 'process-steps-label';
    label.innerHTML = normalizeInlineHtml(eyebrow.innerHTML);
    block.append(label);
  }

  if (title?.textContent.trim()) {
    const heading = document.createElement('h2');
    heading.className = 'process-steps-title';
    heading.innerHTML = normalizeInlineHtml(title.innerHTML);
    block.append(heading);
  }

  const grid = document.createElement('div');
  grid.className = 'process-steps-grid';

  rows.forEach((row) => {
    const cells = [...row.children];
    const [numberCell, titleCell, textCell] = cells;

    const hasContent = numberCell?.textContent.trim()
      || titleCell?.textContent.trim()
      || textCell?.textContent.trim();

    if (!hasContent) {
      return;
    }

    const step = document.createElement('article');
    step.className = 'process-steps-step';

    const number = document.createElement('span');
    number.className = 'process-steps-number';
    number.innerHTML = normalizeInlineHtml(numberCell?.innerHTML);
    step.append(number);

    if (titleCell?.textContent.trim()) {
      const stepTitle = document.createElement('h3');
      stepTitle.innerHTML = normalizeInlineHtml(titleCell.innerHTML);
      step.append(stepTitle);
    }

    if (textCell?.textContent.trim()) {
      const copy = document.createElement('p');
      copy.innerHTML = normalizeInlineHtml(textCell.innerHTML);
      step.append(copy);
    }

    grid.append(step);
  });

  if (grid.children.length) block.append(grid);
}
