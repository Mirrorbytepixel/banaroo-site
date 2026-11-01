import html, os, re, shutil, sys
sys.path.insert(0, os.path.dirname(__file__))
from strings import EN, TH
from strings_ru import RU
from strings_zh import ZH

CONFIG = {
  "demo_url": "https://demo.banaroo.app",
  "site_url": "https://baylight.banaroo.app",
  "line_url": "",       # e.g. https://lin.ee/xxxx once the LINE OA exists
  "whatsapp_url": "",   # e.g. https://wa.me/66XXXXXXXXX
}
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "dist")
tpl = open(os.path.join(ROOT, "template.html"), encoding="utf-8").read()

shutil.rmtree(OUT, ignore_errors=True)
shutil.copytree(os.path.join(ROOT, "src"), OUT)
LANGS = [  # code, menu label, path, strings
  ("en", "English", "/", EN),
  ("th", "ภาษาไทย", "/th/", TH),
  ("ru", "Русский", "/ru/", RU),
  ("zh", "中文", "/zh/", ZH),
]
for code, _, _, d in LANGS:
    missing, extra = set(EN) - set(d), set(d) - set(EN)
    assert not missing and not extra, (code, missing, extra)

hreflangs = "\n".join(f'<link rel="alternate" hreflang="{c}" href="https://banaroo.app{p}">' for c, _, p, _ in LANGS)
hreflangs += '\n<link rel="alternate" hreflang="x-default" href="https://banaroo.app/">'

for code, label, path, strings in LANGS:
    vals = dict(strings, **CONFIG)
    vals["self_path"] = path
    vals["home_href"] = path
    vals["lang_code_upper"] = {"zh": "中文"}.get(code, code.upper())
    raw = {
      "hreflangs": hreflangs,
      "lang_menu": "".join(
        f'<a href="{p}" hreflang="{c}" lang="{c}"{" aria-current=\"true\"" if c == code else ""}>{html.escape(l)}</a>'
        for c, l, p, _ in LANGS),
    }
    def sub(m):
        k = m.group(1) or m.group(2)
        if m.group(1):
            return raw[k] if k in raw else vals[k]
        if k not in vals: raise KeyError(k)
        return html.escape(vals[k], quote=True)
    out = re.sub(r"\{\{\{(\w+)\}\}\}|\{\{(\w+)\}\}", sub, tpl)
    d = os.path.join(OUT, path.strip("/"))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(out)

open(os.path.join(OUT, "robots.txt"), "w").write("User-agent: *\nAllow: /\nDisallow: /stats/\nSitemap: https://banaroo.app/sitemap.xml\n")
open(os.path.join(OUT, "sitemap.xml"), "w").write("""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://banaroo.app/</loc></url>
<url><loc>https://banaroo.app/th/</loc></url>
<url><loc>https://banaroo.app/ru/</loc></url>
<url><loc>https://banaroo.app/zh/</loc></url>
</urlset>
""")
open(os.path.join(OUT, "_headers"), "w").write("""/img/*
  Cache-Control: public, max-age=604800
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
""")
open(os.path.join(OUT, "_redirects"), "w").write("https://www.banaroo.app/* https://banaroo.app/:splat 301!\n")
print("built", OUT)
