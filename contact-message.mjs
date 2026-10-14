/* Pure draft formatting. This module does not send messages or request data. */
export const topics = {
  platform: 'Platform pilot', solution: 'Domain solution',
  research: 'Research', other: 'General enquiry'
};
const evidenceLabels = { available: 'Available', some: 'Some examples', none: 'Not yet', unsure: 'Not sure' };
export const isDocumentationEnquiry = values => values.topic === 'solution' && values.domain === 'clinical';
export const isSocialEnquiry = values => values.topic === 'solution' && values.domain === 'social';
export const isInvoiceEnquiry = values => values.topic === 'solution' && values.domain === 'invoices';
export const isSupportEnquiry = values => values.topic === 'solution' && values.domain === 'support';
export const isImagingEnquiry = values => values.topic === 'solution' && values.domain === 'imaging';
export const imagingModalities = { 'chest-xray':'Chest X-ray', fundus:'Fundus screening', oct:'OCT', another:'Another imaging task' };
export function prepareEnquiry(values, domainLabel = '') {
  const text = key => String(values[key] ?? '').trim();
  const documentation = isDocumentationEnquiry(values);
  const social = isSocialEnquiry(values);
  const imaging = isImagingEnquiry(values);
  const invoice = isInvoiceEnquiry(values);
  const support = isSupportEnquiry(values);
  const modality = Object.hasOwn(imagingModalities, values.imagingModality) ? imagingModalities[values.imagingModality] : null;
  const enquiry = documentation ? 'AI scribe / documentation product evaluation' : social ? 'Social intelligence product / workflow evaluation' : imaging ? `${modality || 'Medical imaging'} product evaluation` : invoice ? 'Invoice automation product evaluation' : support ? 'AI customer-support product evaluation' : (topics[values.topic] || topics.other);
  const subject = `EyeTrustAI — ${enquiry}`;
  const lines = [`Enquiry: ${enquiry}`, `Name: ${text('name')}`, `Reply email: ${text('email')}`];
  if (text('organisation')) lines.push(`Organisation: ${text('organisation')}`);
  if (values.topic === 'solution' && values.domain) lines.push(`Application: ${domainLabel}`);
  if (social && text('listeningTool')) lines.push(`Listening product / current AI: ${text('listeningTool')}`);
  if (social && evidenceLabels[values.reviewedEvidence]) lines.push(`Reviewed examples: ${evidenceLabels[values.reviewedEvidence]}`);
  if (imaging && modality) lines.push(`Imaging task: ${modality}`);
  if (imaging && text('imagingTool')) lines.push(`Your product / AI models: ${text('imagingTool')}`);
  if (imaging && evidenceLabels[values.imagingEvidence]) lines.push(`Reviewed imaging examples: ${evidenceLabels[values.imagingEvidence]}`);
  if (invoice && text('invoiceTool')) lines.push(`Your product / extraction models: ${text('invoiceTool')}`);
  if (invoice && text('invoiceVolume')) lines.push(`Invoice volume for this workflow: ${text('invoiceVolume')}`);
  if (invoice && evidenceLabels[values.invoiceEvidence]) lines.push(`Source-linked reviewed examples: ${evidenceLabels[values.invoiceEvidence]}`);
  if (support && text('supportTool')) lines.push(`Your product / models used: ${text('supportTool')}`);
  if (support && evidenceLabels[values.supportEvidence]) lines.push(`Reviewed replies and supporting sources: ${evidenceLabels[values.supportEvidence]}`);
  if (documentation && text('documentationTool')) lines.push(`Documentation product / current models: ${text('documentationTool')}`);
  if (documentation && evidenceLabels[values.documentationEvidence]) lines.push(`Reviewed drafts with their source: ${evidenceLabels[values.documentationEvidence]}`);
  const body = `${lines.join('\n')}\n\n${text('message')}`;
  return { subject, body, text: `To: info@eyetrustai.com\nSubject: ${subject}\n\n${body}`,
    href: `mailto:info@eyetrustai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}
