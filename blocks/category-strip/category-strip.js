const DEFAULT_AILMENT_MAP = {
  Stress: 'Stress & Anxiety',
  Sleep: 'Sleep Issues',
  Immunity: 'Low Immunity',
  Digestion: 'Digestion',
  Skin: 'Skin Problems',
  Energy: 'Low Energy',
  'Joint Pain': 'Joint Pain',
  Hormonal: 'Hormonal Balance',
};

function getCell(row, index) {
  return row?.children[index] || null;
}

function getText(cell) {
  return cell?.textContent.trim() || '';
}

function normalizeKey(cell) {
  return getText(cell).toLowerCase().replace(/\s+/g, '-');
}

function getHref(cell) {
  const link = cell?.querySelector('a[href]');
  return link?.getAttribute('href') || getText(cell);
}

function getTarget(label, value) {
  if (value && value.includes('?')) return value;

  const ailment = value || DEFAULT_AILMENT_MAP[label];
  if (!ailment) return '';

  return `/ailments?ailment=${encodeURIComponent(ailment)}`;
}

function readRows(rows) {
  const config = {
    label: 'Browse by',
    pills: [],
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));

    if (key === 'label') {
      config.label = getText(getCell(row, 1)) || config.label;
      return;
    }

    if (key === 'pill') {
      const label = getText(getCell(row, 1));
      const value = getHref(getCell(row, 2));
      if (label) {
        config.pills.push({
          label,
          target: getTarget(label, value),
        });
      }
    }
  });

  return config;
}

export default function decorate(block) {
  const config = readRows([...block.children]);
  block.textContent = '';

  const label = document.createElement('span');
  label.className = 'category-strip-label';
  label.textContent = config.label;
  block.append(label);

  config.pills.forEach((item) => {
    const pill = document.createElement('button');
    pill.className = 'category-strip-pill';
    pill.type = 'button';
    pill.textContent = item.label;
    pill.setAttribute('aria-label', `Browse by ${item.label}`);

    if (item.target) {
      pill.addEventListener('click', () => {
        window.location.href = item.target;
      });
    }

    block.append(pill);
  });
}
