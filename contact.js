/* Preserve enquiry context and prepare a local draft without sending a message. */
const form = document.querySelector('#contact-form');
const topics = {
  platform: 'Platform pilot',
  solution: 'Domain solution',
  research: 'Research',
  other: 'General enquiry'
};
const params = new URLSearchParams(window.location.search);
const topic = params.get('topic');
if (Object.hasOwn(topics, topic)) form.elements.topic.value = topic;
const domain = params.get('domain');
if ([...form.elements.domain.options].some(option => option.value === domain)) {
  form.elements.domain.value = domain;
}
const button = document.querySelector('#email-submit');
const draft = document.querySelector('#email-draft');
const message = form.elements.message;
const name = form.elements.name;
const copyButton = document.querySelector('#draft-copy');
const copyStatus = document.querySelector('#copy-status');
button.disabled = false;
form.addEventListener('input', () => {
  name.setCustomValidity('');
  message.setCustomValidity('');
  copyStatus.textContent = '';
  draft.hidden = true;
});
form.addEventListener('change', () => { draft.hidden = true; });
form.addEventListener('submit', event => {
  event.preventDefault();
  name.setCustomValidity(name.value.trim() ? '' : 'Please enter your name. Spaces alone are not a name.');
  message.setCustomValidity(message.value.trim().length < 20 ? 'Please write at least 20 characters about your enquiry.' : '');
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const selectedTopic = values.get('topic');
  const subject = `EyeTrustAI — ${topics[selectedTopic]}`;
  const lines = [
    `Enquiry: ${topics[selectedTopic]}`,
    `Name: ${values.get('name').trim()}`,
    `Reply email: ${values.get('email').trim()}`
  ];
  if (values.get('organisation').trim()) lines.push(`Organisation: ${values.get('organisation').trim()}`);
  if (selectedTopic === 'solution' && values.get('domain')) {
    lines.push(`Application: ${form.elements.domain.selectedOptions[0].text}`);
  }
  const body = `${lines.join('\n')}\n\n${message.value.trim()}`;
  document.querySelector('#draft-text').textContent = `To: info@eyetrustai.com\nSubject: ${subject}\n\n${body}`;
  document.querySelector('#draft-link').href = `mailto:info@eyetrustai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  draft.hidden = false;
  document.querySelector('#draft-title').focus();
});

copyButton.addEventListener('click', async () => {
  const text = document.querySelector('#draft-text');
  try {
    await navigator.clipboard.writeText(text.textContent);
    copyStatus.textContent = 'Enquiry copied, including the email address and subject. Paste it into your email app to send it. No message has been sent.';
  } catch {
    text.closest('details').open = true;
    text.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = 'Automatic copying is unavailable. The enquiry text is selected below; use your device’s Copy command, then paste it into your email app.';
  }
});
