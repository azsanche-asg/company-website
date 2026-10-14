/* Preserve enquiry context and prepare a local draft without sending a message. */
const form = document.querySelector('#contact-form');
import { topics, isDocumentationEnquiry, isSocialEnquiry, isImagingEnquiry, isInvoiceEnquiry, isSupportEnquiry, imagingModalities, prepareEnquiry } from './contact-message.mjs?v=20261014-providers';
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
const documentationFields = document.querySelector('#documentation-context');
const socialFields = document.querySelector('#social-context');
const supportFields = document.querySelector('#support-context');
const invoiceFields = document.querySelector('#invoice-context');
const imagingFields = document.querySelector('#imaging-context');
const messageHint = document.querySelector('#message-hint');
const genericMessageHint = messageHint.textContent;
const generic = { title: title.innerHTML, lead: lead.textContent, hint: hint.textContent,
  placeholder: message.placeholder, button: button.innerHTML };
function updateContext() {
  const documentation = isDocumentationEnquiry({ topic: form.elements.topic.value, domain: form.elements.domain.value });
  intro.dataset.documentation = String(documentation);
  documentationFields.hidden = !documentation;
  for (const field of documentationFields.querySelectorAll('input,select')) field.disabled = !documentation;
  const social = isSocialEnquiry({ topic: form.elements.topic.value, domain: form.elements.domain.value });
  const imaging = isImagingEnquiry({ topic: form.elements.topic.value, domain: form.elements.domain.value });
  const invoice = isInvoiceEnquiry({ topic: form.elements.topic.value, domain: form.elements.domain.value });
  const support = isSupportEnquiry({ topic: form.elements.topic.value, domain: form.elements.domain.value });
  intro.dataset.support = String(support);
  supportFields.hidden = !support;
  for (const field of supportFields.querySelectorAll('input,select')) field.disabled = !support;
  intro.dataset.invoice = String(invoice);
  invoiceFields.hidden = !invoice;
  for (const field of invoiceFields.querySelectorAll('input,select')) field.disabled = !invoice;
  intro.dataset.imaging = String(imaging);
  imagingFields.hidden = !imaging;
  for (const field of imagingFields.querySelectorAll('input,select')) field.disabled = !imaging;
  messageHint.textContent = documentation ? '20–3,000 characters. Describe the workflow only; do not include patient names, notes, transcripts or other health information.' : support ? '20–3,000 characters. Describe the workflow; leave out customer conversations, account details and personal data.' : imaging ? '20–3,000 characters. Describe the workflow only; leave out patient data and confidential details.' : invoice ? '20–3,000 characters. Describe the task; leave out real invoices, supplier details and banking information.' : genericMessageHint;
  intro.dataset.social = String(social);
  socialFields.hidden = !social;
  for (const field of socialFields.querySelectorAll('input,select')) field.disabled = !social;
  if (documentation) {
    title.textContent = 'Tell us about your scribe.';
    lead.textContent = 'Choose one workflow to evaluate for errors and extra checking.';
    hint.textContent = 'A short description is enough. No patient data needed.';
    messageLabel.textContent = 'Which note workflow should we assess?';
    message.placeholder = 'Note type, clinical setting and checks you want to improve.';
    button.textContent = 'Prepare documentation enquiry ↗︎';
  } else if (social) {
    title.textContent = 'Tell us about your listening product or workflow.';
    lead.textContent = 'Which prioritization decision would you like to automate? We can scope one workflow and assess review effort alongside the risk of missed priority mentions.';
    hint.textContent = 'A short description is enough to start. No dataset or technical specification needed here.';
    messageLabel.textContent = 'What would you like your product to automate?';
    message.placeholder = 'Describe one customer workflow, how AI prioritizes mentions today and what review work you want to reduce.';
    button.textContent = 'Prepare social intelligence enquiry ↗︎';
  } else if (imaging) {
    const selected = form.elements.imagingModality.value;
    const context = {
      'chest-xray': 'The findings your product provides and what you want to improve for radiologists.',
      fundus: 'How your product uses fundus grades and where additional checks happen.',
      oct: 'How your product uses OCT findings and where additional verification happens.'
    }[selected];
    title.textContent = 'Tell us about your imaging product.';
    lead.textContent = 'Which AI findings does it use, and what would you like to improve?';
    hint.textContent = 'A short description is enough. No dataset or technical specification needed here.';
    messageLabel.textContent = 'Which workflow should we assess?';
    message.placeholder = context || 'AI findings, current checks and what you want to improve.';
    button.textContent = 'Prepare evaluation enquiry ↗︎';
  } else if (invoice) {
    title.textContent = 'Tell us about your invoice product.';
    lead.textContent = 'Choose one customer workflow to evaluate.';
    hint.textContent = 'A short description is enough. No invoices needed.';
    messageLabel.textContent = 'Which customer workflow should we assess?';
    message.placeholder = 'Invoice types, fields, existing controls and what you want to improve.';
    button.textContent = 'Prepare invoice enquiry ↗︎';
  } else if (support) {
    title.textContent = 'Tell us about your support product.';
    lead.textContent = 'Choose one customer workflow to evaluate.';
    hint.textContent = 'A short description is enough. No customer records needed.';
    messageLabel.textContent = 'Which customer workflow should we assess?';
    message.placeholder = 'Reply type, existing controls and what you want to improve.';
    button.textContent = 'Prepare support enquiry ↗︎';
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
