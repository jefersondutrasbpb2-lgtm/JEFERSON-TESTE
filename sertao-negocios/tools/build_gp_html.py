#!/usr/bin/env python3
"""Gera a versão "página HTML" do GreatPages: a landing inteira num index.html só.

Diferente do kit em blocos (build_greatpages.py), aqui o GreatPages recebe o documento completo,
que pode ser lido e trocado pela MCP do GreatPages (pages_html_get / pages_html_sync).

- CSS e JavaScript embutidos; GSAP e Lenis pelos CDNs; fontes pelo Google Fonts.
- Imagens apontando para os links já enviados ao GreatPages (greatpages/links-imagens.json).
- Pixel da Meta e Google Analytics no <head> (numa página HTML eles vêm do próprio HTML).
- Formulário enviado pelo GreatPages (formMode "greatpages"): o JS só valida e mede.

Uso:  python3 tools/build_gp_html.py      (a partir da pasta sertao-negocios)
Saída: greatpages-html/index.html
"""
import base64
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "greatpages-html"

PIXEL_ID = "702365151785211"
GA_ID = "G-1W7GNPN0EL"
SITE_URL = "https://www.sertaonegocios.com.br/"

CDN = {
    "assets/vendor/gsap.min.js": "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js",
    "assets/vendor/ScrollTrigger.min.js": "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js",
    "assets/vendor/SplitText.min.js": "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js",
    "assets/vendor/DrawSVGPlugin.min.js": "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/DrawSVGPlugin.min.js",
    "assets/vendor/lenis.min.js": "https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js",
}


def fail(msg):
    sys.exit(f"[build_gp_html] {msg}")


def must_replace(text, old, new):
    if old not in text:
        fail(f"trecho não encontrado: {old[:70]!r}")
    return text.replace(old, new)


html = (ROOT / "index.html").read_text()
css = (ROOT / "assets/css/main.css").read_text()
js = (ROOT / "assets/js/main.js").read_text()
cfg = (ROOT / "assets/js/config.js").read_text()
links = json.loads((ROOT / "greatpages/links-imagens.json").read_text())

# Fontes: Google Fonts no lugar dos arquivos locais
css = re.sub(r"@font-face \{.*?\}\n", "", css, flags=re.S)
fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Manrope:wght@400..800&display=swap">')
html = re.sub(r'\s*<link rel="preload" href="assets/fonts/[^>]*>', "", html)
html = must_replace(html, '<link rel="stylesheet" href="assets/css/main.css">', fonts + "\n  <style>\n" + css + "\n  </style>")

# Ícone da aba embutido; endereço canônico e imagem de compartilhamento absolutos
favicon = base64.b64encode((ROOT / "assets/img/favicon.svg").read_bytes()).decode()
html = must_replace(html, 'href="assets/img/favicon.svg"', f'href="data:image/svg+xml;base64,{favicon}"')
html = must_replace(html, '<link rel="canonical" href="./">', f'<link rel="canonical" href="{SITE_URL}">')
html = must_replace(html, 'content="assets/img/og-logo.png"', f'content="{links["logo-sertao-negocios.webp"]}"')

# Imagens: links do GreatPages
for name, url in links.items():
    html = html.replace(f"assets/img/{name}", url)
left = sorted(set(re.findall(r"assets/img/[\w.-]+", html)))
if left:
    fail(f"imagens sem link do GreatPages: {left}")

# Formulário: chave que o GreatPages criou na importação e destino depois do envio (grupo da comunidade)
GP_FORM_KEY = "acvpruwy"
COMMUNITY_URL = "https://chat.whatsapp.com/It1MX9ij3o48Zzbvo04Vkq"
html = must_replace(html, '<form class="form" id="lead-form" novalidate data-form>',
                    f'<form data-gp-form="{GP_FORM_KEY}" data-gp-conversao="true" data-gp-apos-envio="mensagem" '
                    f'class="form" id="lead-form" novalidate data-form>')

# Pixel da Meta e Google Analytics
tracking = f"""
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', '{GA_ID}');
  </script>
  <!-- Pixel da Meta -->
  <script>
    !function(f,b,e,v,n,t,s){{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)}};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '{PIXEL_ID}');
    fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id={PIXEL_ID}&ev=PageView&noscript=1"></noscript>
"""
html = must_replace(html, "</head>", tracking + "</head>")

# Scripts: bibliotecas pelos CDNs; configuração e animações embutidas
for local, remote in CDN.items():
    html = must_replace(html, f'<script src="{local}" defer></script>', f'<script src="{remote}" defer></script>')
cfg = must_replace(cfg, "  leadEndpoint: '',", "  // Página HTML do GreatPages: o envio do formulário é do próprio GreatPages\n  formMode: 'greatpages',\n  leadEndpoint: '',")
# Depois do cadastro: mensagem de sucesso com o botão do grupo e, em seguida, vai sozinho para a comunidade
cfg = must_replace(cfg, "  redirectUrl: '',", f"  redirectUrl: '{COMMUNITY_URL}',")
html = must_replace(html, '<script src="assets/js/config.js" defer></script>', "<script>\n" + cfg.strip() + "\n</script>")
html = must_replace(html, '<script src="assets/js/main.js" defer></script>',
                    "<script>\ndocument.addEventListener('DOMContentLoaded', function () {\n" + js.strip() + "\n});\n</script>")

if re.search(r'(?:src|href)="assets/', html):
    fail("ainda há caminhos assets/ no HTML")

OUT.mkdir(exist_ok=True)
(OUT / "index.html").write_text(html)
print(f"Página HTML gerada em {(OUT / 'index.html').relative_to(ROOT.parent)} ({len(html) // 1024} KB)")
