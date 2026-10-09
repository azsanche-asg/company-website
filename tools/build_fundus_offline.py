"""Refresh the offline download from the current web walkthrough.

Embed original research-image bytes; do not resize, re-encode or alter scores.
The web walkthrough is the reviewed release source, never an old download.
"""
from pathlib import Path
import base64
import re

ROOT = Path(__file__).resolve().parents[1]


def build():
    source = ROOT / 'demos/EyeTrustAI-Fundus-Screening.html'
    text = source.read_text()
    references = sorted(set(re.findall(r'assets/imaging-batch1/fundus/[^\s"\'<>]+\.jpg', text)))
    assert len(references) == 10, 'Expected the ten original IDRiD image assets'
    for ref in references:
        encoded = base64.b64encode((source.parent / ref).read_bytes()).decode()
        text = text.replace(ref, 'data:image/jpeg;base64,' + encoded)
    text = re.sub(r'\.\./(index|medical-imaging|contact|solutions|research)\.html',
                  r'https://eyetrustai.com/\1.html', text)
    assert 'assets/imaging-batch1/fundus/' not in text
    destination = ROOT / 'downloads/EyeTrustAI-Fundus-Screening.html'
    destination.write_text(text)
    print(f'Updated offline fundus walkthrough: {len(references)} unchanged images, {destination.stat().st_size:,} bytes')


if __name__ == '__main__':
    build()
