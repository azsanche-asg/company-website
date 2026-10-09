/* Preserve enquiry context and prepare a local draft without sending a message. */
const form = document.querySelector('#contact-form');
import { topics, isSocialEnquiry, isImagingEnquiry, imagingModalities, prepareEnquiry } from './contact-message.mjs?v=20261009-clinical';
const params = new URLSearchParams(window.location.search);
const topic = params.get('topic');
if (Object.hasOwn(topics, topic)) form.elements.topic.value = topic;
const domain = params.get('domain');
if ([...form.elements.domain.options].some(option => option.value === domain)) {
  form.elements.domain.value = domain;
}
const modality = params.get('modality');
if (Object.hasOwn(imagingModalities, modality)) form.elements.imagingModality.value = modality;
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
const imagingFields = document.querySelector('#imaging-context');
const messageHint = document.querySelector('#message-hint');
const genericMessageHint = messageHint.textContent;
const generic = { title: title.innerHTML, lead: lead.textContent, hint: hint.textContent,
  placeholder: message.placeholder, button: button.innerHTML };
function updateContext() {
  const social = isSocialEnquiry({ topic: form.elements.topic.value, domain: form.elements.domain.value });
  const imaging = isImagingEnquiry({ topic: form.elements.topic.value, domain: form.elements.domain.value });
  intro.dataset.imaging = String(imaging);
  imagingFields.hidden = !imaging;
  for (const field of imagingFields.querySelectorAll('input,select')) field.disabled = !imaging;
  messageHint.textContent = imaging ? '20–3,000 characters. Describe the workflow only; leave out patient data and confidential details.' : genericMessageHint;
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
  } else if (imaging) {
    const selected = form.elements.imagingModality.value;
    const context = {
      'chest-xray': {title:'Let’s evaluate one chest-X-ray finding.', placeholder:'Which finding does your AI produce, and what would you want to improve for the radiologist?'},
      fundus: {title:'Let’s evaluate your grading workflow.', placeholder:'Which routine image results receive an extra check today, and how does your service complete the screening encounter?'},
      oct: {title:'Let’s evaluate one OCT finding.', placeholder:'Which findings do you verify today—per B-scan, volume or examination—and what would you want to improve?'}
    }[selected];
    title.textContent = context?.title || 'Let’s evaluate one imaging task.';
    lead.textContent = 'Start with one finding and the work around it. We can scope a retrospective comparison, the references it needs and what would count as a worthwhile result.';
    hint.textContent = 'A short description is enough. No dataset or technical specification needed here.';
    messageLabel.textContent = 'What does your team check today?';
    message.placeholder = context?.placeholder || 'Which AI finding do you use, how is it checked, and what would you like to improve?';
    button.textContent = 'Prepare evaluation enquiry ↗';
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
