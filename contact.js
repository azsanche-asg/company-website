/* Preserve enquiry context and prepare a local draft without sending a message. */
const form = document.querySelector('#contact-form');
import { topics, isSocialEnquiry, prepareEnquiry } from './contact-message.mjs';
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
const intro = document.querySelector('.contact-intro');
const title = intro.querySelector('h1');
const lead = intro.querySelector('.lead');
const hint = form.querySelector('.hint-solution');
const messageLabel = document.querySelector('#message-label');
const socialFields = document.querySelector('#social-context');
const generic = { title: title.innerHTML, lead: lead.textContent, hint: hint.textContent,
  placeholder: message.placeholder, button: button.innerHTML };
function updateContext() {
  const social = isSocialEnquiry({ topic: form.elements.topic.value, domain: form.elements.domain.value });
  intro.dataset.social = String(social);
  socialFields.hidden = !social;
  for (const field of socialFields.querySelectorAll('input,select')) field.disabled = !social;
  if (social) {
    title.textContent = 'Let’s evaluate your listening workflow.';
    lead.textContent = 'Tell us what you monitor and what your team reviews today. We can discuss the evidence needed to evaluate review effort and missed priority mentions.';
    hint.textContent = 'A short description is enough to start. No dataset or technical specification needed here.';
    messageLabel.textContent = 'What would you like to improve?';
    message.placeholder = 'What do you monitor, which mentions need attention, and how does your team review them today?';
    button.textContent = 'Prepare workflow enquiry ↗';
  } else {
    title.innerHTML = generic.title;
    lead.textContent = generic.lead;
    hint.textContent = generic.hint;
    messageLabel.textContent = 'Your message';
    message.placeholder = generic.placeholder;
    button.innerHTML = generic.button;
  }
}
updateContext();
button.disabled = false;
form.addEventListener('input', () => {
  name.setCustomValidity('');
  message.setCustomValidity('');
  copyStatus.textContent = '';
  draft.hidden = true;
});
form.addEventListener('change', () => { draft.hidden = true; updateContext(); });
form.addEventListener('submit', event => {
  event.preventDefault();
  name.setCustomValidity(name.value.trim() ? '' : 'Please enter your name. Spaces alone are not a name.');
  message.setCustomValidity(message.value.trim().length < 20 ? 'Please write at least 20 characters about your enquiry.' : '');
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const enquiry = prepareEnquiry(Object.fromEntries(values), form.elements.domain.selectedOptions[0].text);
  document.querySelector('#draft-text').textContent = enquiry.text;
  document.querySelector('#draft-link').href = enquiry.href;
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
