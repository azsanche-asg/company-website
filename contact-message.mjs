/* Pure draft formatting. This module does not send messages or request data. */
export const topics = {
  platform: 'Platform pilot', solution: 'Domain solution',
  research: 'Research', other: 'General enquiry'
};
const evidenceLabels = { available: 'Available', some: 'Some examples', none: 'Not yet', unsure: 'Not sure' };
export const isSocialEnquiry = values => values.topic === 'solution' && values.domain === 'social';
export const isImagingEnquiry = values => values.topic === 'solution' && values.domain === 'imaging';
export const imagingModalities = { 'chest-xray':'Chest X-ray', fundus:'Fundus screening', oct:'OCT', another:'Another imaging task' };
export function prepareEnquiry(values, domainLabel = '') {
  const text = key => String(values[key] ?? '').trim();
  const social = isSocialEnquiry(values);
  const imaging = isImagingEnquiry(values);
  const modality = Object.hasOwn(imagingModalities, values.imagingModality) ? imagingModalities[values.imagingModality] : null;
  const enquiry = social ? 'Social listening workflow evaluation' : imaging ? `${modality || 'Medical imaging'} workflow evaluation` : (topics[values.topic] || topics.other);
  const subject = `EyeTrustAI — ${enquiry}`;
  const lines = [`Enquiry: ${enquiry}`, `Name: ${text('name')}`, `Reply email: ${text('email')}`];
  if (text('organisation')) lines.push(`Organisation: ${text('organisation')}`);
  if (values.topic === 'solution' && values.domain) lines.push(`Application: ${domainLabel}`);
  if (social && text('listeningTool')) lines.push(`Current AI / listening tool: ${text('listeningTool')}`);
  if (social && evidenceLabels[values.reviewedEvidence]) lines.push(`Reviewed examples: ${evidenceLabels[values.reviewedEvidence]}`);
  if (imaging && modality) lines.push(`Imaging task: ${modality}`);
  if (imaging && text('imagingTool')) lines.push(`Current model / workflow: ${text('imagingTool')}`);
  if (imaging && evidenceLabels[values.imagingEvidence]) lines.push(`Reviewed imaging examples: ${evidenceLabels[values.imagingEvidence]}`);
  const body = `${lines.join('\n')}\n\n${text('message')}`;
  return { subject, body, text: `To: info@eyetrustai.com\nSubject: ${subject}\n\n${body}`,
    href: `mailto:info@eyetrustai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}
