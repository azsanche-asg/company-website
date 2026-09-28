"""Build the web demo from its self-contained offline edition.

Extract assets without resizing or re-encoding the research photographs.
The web app requests only the image currently shown by the existing viewer.
"""
import base64
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "downloads/EyeTrustAI-Fundus-Screening.html"
OUTPUT = ROOT / "demos/EyeTrustAI-Fundus-Screening.html"
ASSETS = ROOT / "assets/fundus"


def build():
    ASSETS.mkdir(parents=True, exist_ok=True)
    source = SOURCE.read_text()
    records = {}
    extensions = {"image/jpeg": "jpg", "image/png": "png", "font/woff2": "woff2"}

    def extract(match):
        mime, encoded = match.groups()
        data = base64.b64decode(encoded, validate=True)
        digest = hashlib.sha256(data).hexdigest()
        filename = f"{digest[:20]}.{extensions[mime]}"
        (ASSETS / filename).write_bytes(data)
        records[filename] = {"mime": mime, "bytes": len(data), "sha256": digest}
        return f"../assets/fundus/{filename}"

    web = re.sub(r"data:(image/jpeg|image/png|font/woff2);base64,([A-Za-z0-9+/=]+)", extract, source)
    web = web.replace('href="https://eyetrustai.com/', 'href="/')
    web = web.replace("Offline walkthrough", "Browser walkthrough")
    web = web.replace("img-src data:", "img-src 'self' data:", 1)
    web = web.replace("font-src data:", "font-src 'self' data:", 1)
    marker = '</section><div class="mode-grid">'
    assert marker in web, "Fundus chooser structure changed"
    web = web.replace(marker, '<p class="download-demo"><a href="../downloads/EyeTrustAI-Fundus-Screening.html" download>Download the offline demo</a></p>' + marker, 1)
    OUTPUT.write_text(web)
    (ASSETS / "manifest.json").write_text(json.dumps(records, indent=2) + "\n")
    print(f"Fundus HTML: {len(source.encode()):,} → {len(web.encode()):,} bytes; {len(records)} unchanged assets")


if __name__ == "__main__":
    build()
