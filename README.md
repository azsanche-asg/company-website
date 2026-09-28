# EyeTrustAI website

Static website for https://eyetrustai.com/.

## Development

Serve the repository root over HTTP; no package installation or build step is needed for normal edits. Use a root-mounted server because demo and error-page recovery links are root-relative.

The marketing pages use shared CSS. `contact.js` validates enquiries, prepares an email draft and provides a clipboard handoff; it never submits an enquiry. `legacy-links.js` preserves seven homepage bookmarks from before the redesign. `404.html` provides branded recovery for missing URLs.

The ten interactive demos under `demos/` expose website navigation on their chooser and application screens. `demo-navigation.css` styles the shared exits and responsive toolbar. The three embedded players reserve 56 px for the website navigation and retain their sandboxed application frames. Demo policies allow the necessary same-origin styles/assets; network connections and form submissions remain disabled.

Fundus has a web edition with separately cached, unchanged image/font assets in `assets/fundus/`, plus a self-contained edition in `downloads/`. To regenerate the web edition after editing its offline source:

```sh
python3 tools/build_fundus_web.py
```

The offline source embeds its navigation styles; keep that copy aligned with `demo-navigation.css` when changing shared demo styling. The builder preserves image bytes and writes their SHA-256 manifest. Research image provenance and workflow calculations remain unchanged.

## Publishing

GitHub Pages publishes the root of `main`. Keep `CNAME` and `.nojekyll` in place. Publishing requires write access to `azsanche-asg/company-website`.

## Previous version

The website preceding the September 2026 redesign is preserved on branch `codex/backup-before-redesign-2026-09-26`, at commit `c2e054af226d755880f66d61f68f2aff501da11d`.
