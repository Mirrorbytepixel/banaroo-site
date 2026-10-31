# Banaroo sales site (banaroo.app)

Static page in English (`/`) and Thai (`/th/`).

- Copy: `strings.py` (EN and TH dictionaries; keys must match)
- Layout: `template.html` (`{{key}}` placeholders)
- Styles, script, images: `src/`
- Links (demo, LINE, WhatsApp): `CONFIG` in `build.py`

Build: `python3 build.py` writes `dist/`. Netlify runs this on every push to `main` (see `netlify.toml`).
