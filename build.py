import html, os, re, shutil, sys
sys.path.insert(0, os.path.dirname(__file__))
from strings import EN, TH

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
assert set(EN) == set(TH), set(EN) ^ set(TH)

for strings, path in ((EN, "/"), (TH, "/th/")):
    vals = dict(strings, **CONFIG)
    vals["self_path"] = path
    vals["home_href"] = path
    vals["lang_switch_short_lc"] = strings["lang_switch_short"].lower()
    def sub(m):
        k = m.group(1)
        if k not in vals: raise KeyError(k)
        return html.escape(vals[k], quote=True)
    out = re.sub(r"\{\{(\w+)\}\}", sub, tpl)
    d = os.path.join(OUT, path.strip("/"))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(out)

open(os.path.join(OUT, "robots.txt"), "w").write("User-agent: *\nAllow: /\nSitemap: https://banaroo.app/sitemap.xml\n")
open(os.path.join(OUT, "sitemap.xml"), "w").write("""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://banaroo.app/</loc></url>
<url><loc>https://banaroo.app/th/</loc></url>
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
