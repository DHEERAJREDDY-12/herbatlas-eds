const STORAGE_KEY = 'contactMessages';

const DEFAULT_FIELDS = [
  {
    key: 'name',
    label: 'Name',
    placeholder: 'Your name',
    type: 'text',
    required: true,
  },
  {
    key: 'email',
    label: 'Email',
    placeholder: 'you@example.com',
    type: 'email',
    required: true,
  },
  {
    key: 'subject',
    label: 'Subject',
    placeholder: 'Order issue, product question...',
    type: 'text',
    required: true,
  },
  {
    key: 'message',
    label: 'Message',
    placeholder: 'Describe your problem here...',
    type: 'textarea',
    required: true,
  },
];

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

function isRequired(value) {
  if (!value) return true;
  return !['false', 'no', 'optional', '0'].includes(value.trim().toLowerCase());
}

function fieldFromRow(row) {
  const key = getText(getCell(row, 1)).toLowerCase().replace(/\s+/g, '-');
  if (!key) return null;

  return {
    key,
    label: getText(getCell(row, 2)) || key,
    placeholder: getText(getCell(row, 3)),
    type: getText(getCell(row, 4)).toLowerCase() || 'text',
    required: isRequired(getText(getCell(row, 5))),
  };
}

function readConfig(rows) {
  const config = {
    title: '',
    description: '',
    submitText: 'Send Message',
    fields: [],
  };

  rows.forEach((row) => {
    const key = normalizeKey(getCell(row, 0));

    if (key === 'title') {
      config.title = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'description' || key === 'subtitle') {
      config.description = getHtml(getCell(row, 1));
      return;
    }

    if (key === 'submit-text' || key === 'button-text') {
      config.submitText = getText(getCell(row, 1)) || config.submitText;
      return;
    }

    if (key === 'field') {
      const field = fieldFromRow(row);
      if (field) config.fields.push(field);
    }
  });

  if (!config.fields.length) {
    config.fields = DEFAULT_FIELDS;
  }

  return config;
}

function buildIntro(config) {
  const intro = document.createElement('div');
  intro.className = 'contact-form-intro';

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

function buildField(field) {
  const label = document.createElement('label');
  label.className = 'contact-form-field';
  label.htmlFor = `contact-${field.key}`;

  const labelText = document.createElement('span');
  labelText.textContent = field.label;
  label.append(labelText);

  const control = field.type === 'textarea'
    ? document.createElement('textarea')
    : document.createElement('input');

  control.id = `contact-${field.key}`;
  control.name = field.key;
  control.placeholder = field.placeholder || '';
  control.required = field.required;

  if (field.type === 'textarea') {
    control.rows = 6;
  } else {
    control.type = field.type || 'text';
  }

  label.append(control);
  return label;
}

function showToast(message, type) {
  if (window.showToast) {
    window.showToast(message, type);
  }
}

function getFormValue(form, name) {
  return form.elements[name]?.value.trim() || '';
}

function prefillUserFields(form) {
  const savedEmail = localStorage.getItem('userEmail');
  const savedName = localStorage.getItem('userName');

  if (form.elements.email && savedEmail) {
    form.elements.email.value = savedEmail;
  }

  if (form.elements.name && savedName && !form.elements.name.value) {
    form.elements.name.value = savedName;
  }
}

function saveMessage(messageData) {
  const existingMessages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  existingMessages.push(messageData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingMessages));
}

function handleSubmit(form) {
  const name = getFormValue(form, 'name');
  const email = getFormValue(form, 'email');
  const subject = getFormValue(form, 'subject');
  const message = getFormValue(form, 'message');

  if (!name || !email || !subject || !message) {
    showToast('Please complete all contact form fields', 'warning');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address', 'warning');
    return;
  }

  saveMessage({
    name,
    email,
    subject,
    message,
    createdAt: new Date().toISOString(),
  });

  form.reset();
  prefillUserFields(form);
  showToast('Your message has been sent. We will get back to you shortly.', 'success');
}

function buildForm(config) {
  const form = document.createElement('form');
  form.className = 'contact-form-form';
  form.noValidate = true;

  const grid = document.createElement('div');
  grid.className = 'contact-form-grid';

  config.fields.forEach((field) => {
    const fieldElement = buildField(field);
    if (field.type === 'textarea') {
      form.append(fieldElement);
    } else {
      grid.append(fieldElement);
    }
  });

  if (grid.children.length) {
    form.prepend(grid);
  }

  const button = document.createElement('button');
  button.className = 'contact-form-submit';
  button.type = 'submit';
  button.textContent = config.submitText;
  form.append(button);

  prefillUserFields(form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleSubmit(form);
  });

  return form;
}

export default function decorate(block) {
  const config = readConfig([...block.children]);
  block.textContent = '';

  const intro = buildIntro(config);
  if (intro.children.length) block.append(intro);

  block.append(buildForm(config));
}
