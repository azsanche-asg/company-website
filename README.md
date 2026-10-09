# EyeTrustAI website

Static website for https://eyetrustai.com/.

## Development

Serve the repository root over HTTP; no package installation or build step is needed for normal edits. Use a root-mounted server because demo and error-page recovery links are root-relative.

The marketing pages use shared CSS. `contact.js` validates enquiries, prepares an email draft and provides a clipboard handoff; it never submits an enquiry. `legacy-links.js` preserves seven homepage bookmarks from before the redesign. `404.html` provides branded recovery for missing URLs.

The ten interactive demos under `demos/` expose website navigation on their chooser and application screens. `demo-navigation.css` styles the shared exits and responsive toolbar. The three embedded players reserve 56 px for the website navigation and retain their sandboxed application frames. Demo policies allow the necessary same-origin styles/assets; network connections and form submissions remain disabled.

The chest-X-ray, fundus and OCT walkthroughs serve unchanged research images from `demos/assets/imaging-batch1/`. Chest-X-ray images are NIH ChestX-ray14 examples; historical CheXpert benchmark results remain explicitly separate. The medical page, medical Research sections and contextual contact drafts accompany the three guided journeys.

Fundus also retains its self-contained download at the existing URL. After updating the reviewed web walkthrough and its assets, refresh the download with:

```sh
python3 tools/build_fundus_offline.py
```

The offline builder embeds original image bytes and points website links to the live site. It never regenerates a web release from an outdated offline edition. Research-image provenance and workflow calculations remain unchanged.

## Publishing

GitHub Pages publishes the root of `main`. Keep `CNAME` and `.nojekyll` in place. Publishing requires write access to `azsanche-asg/company-website`.

## Previous version

The website preceding the September 2026 redesign is preserved on branch `codex/backup-before-redesign-2026-09-26`, at commit `c2e054af226d755880f66d61f68f2aff501da11d`.
