#!/usr/bin/env python3
"""Gera o kit GreatPages a partir da landing page (index.html + CSS + JS).

O kit separa a página em blocos para colar em elementos HTML do GreatPages:
  00-estilos-1..3.html  CSS (compactado e dividido em 3), fontes e marcação inicial
  01..13-*.html        uma seção por arquivo (cole em ordem, um elemento HTML por seção)
  99-scripts.html      bibliotecas, configuração e animações (cole uma vez, no fim da página)

Para não conflitar com o CSS do GreatPages:
  - toda classe recebe o prefixo "sn-";
  - os estilos de base (reset, fonte, links) valem só dentro de elementos .sn,
    com especificidade zero (:where), como na página original;
  - nada é aplicado ao <body> da página.

Uso:  python3 tools/build_greatpages.py            (a partir da pasta sertao-negocios)
"""
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "greatpages"
IMG_TOKEN = "IMAGEM/"  # trocar pelo link de cada imagem depois de subir no GreatPages

html = (ROOT / "index.html").read_text()
css = (ROOT / "assets/css/main.css").read_text()
js = (ROOT / "assets/js/main.js").read_text()
cfg = (ROOT / "assets/js/config.js").read_text()


def fail(msg):
    sys.exit(f"[build_greatpages] {msg}")


def must_replace(text, old, new, count=1):
    if old not in text:
        fail(f"trecho não encontrado: {old[:70]!r}")
    return text.replace(old, new, count)


# ---------------------------------------------------------------------------
# 1. Conjunto de classes a prefixar
# ---------------------------------------------------------------------------
classes = set()
for attr in re.findall(r'class="([^"]*)"', html):
    classes.update(attr.split())
css_no_urls = re.sub(r"url\([^)]*\)", "", css)
classes.update(re.findall(r"\.([a-zA-Z_][\w-]*)", css_no_urls))
# Classes adicionadas só pelo JavaScript
classes.update({"is-scrolled", "is-hidden", "is-light", "is-visible", "is-loading",
                "is-invalid", "is-valid", "is-active", "split-line", "split-line-mask",
                "w", "js", "reduced-motion", "no-motion"})
classes -= {"lenis", "lenis-smooth", "lenis-stopped"}
classes = {c for c in classes if not c.startswith("sn-")}

PFX = "sn-"


def prefix_selectors(text):
    """Prefixa .classe em seletores CSS (ignora url(...))."""
    parts = re.split(r"(url\([^)]*\))", text)
    for i in range(0, len(parts), 2):
        parts[i] = re.sub(r"\.([a-zA-Z_][\w-]*)",
                          lambda m: "." + PFX + m.group(1) if m.group(1) in classes else m.group(0),
                          parts[i])
    return "".join(parts)


def prefix_html(text):
    return re.sub(r'class="([^"]*)"',
                  lambda m: 'class="' + " ".join(PFX + c if c in classes else c for c in m.group(1).split()) + '"',
                  text)


def prefix_js(text):
    # Seletores dentro de strings ('...' e `...`), exceto caminhos de arquivo
    def in_string(m):
        q, body = m.group(1), m.group(2)
        if "/" in body:
            return m.group(0)
        return q + prefix_selectors(body) + q
    text = re.sub(r"(['`])((?:\\.|(?!\1).)*)\1", in_string, text)
    # Nomes de classe soltos
    text = re.sub(r"(classList\.(?:add|remove|toggle|contains)\(\s*)'([\w-]+)'",
                  lambda m: m.group(1) + "'" + (PFX + m.group(2) if m.group(2) in classes else m.group(2)) + "'", text)
    text = re.sub(r"((?:className|linesClass|wordsClass):\s*)'([\w-]+)'",
                  lambda m: m.group(1) + "'" + (PFX + m.group(2) if m.group(2) in classes else m.group(2)) + "'", text)
    return text


# ---------------------------------------------------------------------------
# 2. CSS isolado
# ---------------------------------------------------------------------------
base_old = css[css.index("/* ---------- Base ---------- */"):css.index(".sprite {")]
base_new = """/* ---------- Base (só dentro dos blocos do Sertão Negócios) ---------- */
:where(.sn), :where(.sn) *, :where(.sn) *::before, :where(.sn) *::after { box-sizing: border-box; }
html { scroll-padding-top: var(--nav-h); }
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-stopped { overflow: hidden; }

:where(.sn) {
  font-family: var(--font-body);
  font-size: clamp(1rem, .96rem + .2vw, 1.125rem);
  font-weight: 500;
  line-height: 1.6;
  color: var(--branco);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  text-align: left;
  letter-spacing: normal;
}
:where(.sn) :is(img, svg) { display: block; max-width: 100%; }
:where(.sn) img { height: auto; border: 0; }
:where(.sn) a { color: inherit; }
:where(.sn) :is(h1, h2, h3, h4, p, ul, ol, dl, dt, dd, li, figure, figcaption, a, span, label, legend, time, small, strong, em, blockquote) { margin: 0; }
/* Neutraliza estilos genéricos de texto do construtor (mesma especificidade de um seletor de tag) */
:where(.sn) :is(h1, h2, h3, h4, p, li, a, span, dt, dd, label, legend, time, figcaption, button, input) { color: inherit; font-family: inherit; text-shadow: none; }
:where(.sn) :is(div, section, header, footer, article, aside, nav, figure, form, fieldset, ul, ol, dl, p, li, a, span, dt, dd, label, legend, time, figcaption, small, blockquote) { font-size: inherit; line-height: inherit; letter-spacing: inherit; text-transform: inherit; font-weight: inherit; text-align: inherit; }
:where(.sn) :is(ul, ol) { padding: 0; list-style: none; }
:where(.sn) button { font: inherit; color: inherit; }
:where(.sn) :focus-visible { outline: 3px solid var(--ceu); outline-offset: 3px; border-radius: 6px; }
:where(.sn) ::selection { background: var(--sol); color: var(--branco); }
/* Encaixe entre seções: se o GreatPages cortar os cantos arredondados, use --sn-overlap: 0px */
:root { --sn-overlap: var(--radius-lg); }

"""
kit_css = css.replace(base_old, base_new)
kit_css = re.sub(r"@font-face \{.*?\}\n", "", kit_css, flags=re.S)
n_overlap = kit_css.count("margin-top: calc(var(--radius-lg) * -1);")
if n_overlap < 10:
    fail("sobreposição entre seções não encontrada no CSS")
kit_css = kit_css.replace("margin-top: calc(var(--radius-lg) * -1);", "margin-top: calc(var(--sn-overlap) * -1);")
kit_css = prefix_selectors(kit_css)
# rem -> px: o GreatPages muda o tamanho de fonte base da página (html), o que encolheria todo texto medido em rem
def _rem_to_px(m):
    v = float(m.group(1)) * 16
    return (f"{v:.2f}".rstrip("0").rstrip(".")) + "px"
kit_css = re.sub(r"(?<![\w.-])(\d*\.?\d+)rem\b", _rem_to_px, kit_css)
if re.search(r"\d\s*rem\b", kit_css):
    fail("sobrou unidade rem no CSS do kit")
# .sn é a classe-raiz (não prefixar a si mesma)
kit_css = kit_css.replace(".sn-sn", ".sn")

# ---------------------------------------------------------------------------
# 3. HTML em blocos
# ---------------------------------------------------------------------------
def between(start, end):
    i = html.index(start)
    j = html.index(end, i + len(start))
    return html[i:j]


def add_root_class(fragment):
    """Adiciona a classe-raiz 'sn' ao primeiro elemento do bloco."""
    return re.sub(r'^(\s*<[a-z]+[^>]*?class=")', r"\1sn ", fragment, count=1)


def img_paths(fragment):
    return fragment.replace("assets/img/", IMG_TOKEN)


sprite = between('<svg class="sprite"', "<a class=\"skip\"").strip()
skip = '<a class="skip" href="#inicio">Pular para o conteúdo</a>'
nav = between('<header class="nav"', "<main").strip()
section_markers = [
    ("01-topo", "<!-- ====== 01 HERO", "<!-- ====== 02"),
    ("02-proposta", "<!-- ====== 02 MANIFESTO", "<!-- ====== 03"),
    ("03-historia", "<!-- ====== 03 HISTÓRIA", "<!-- ====== 04"),
    ("04-regiao", "<!-- ====== 04 MAPA", "<!-- ====== 05"),
    ("05-por-que", "<!-- ====== 05 POR QUE", "<!-- ====== 06"),
    ("06-palestrantes", "<!-- ====== 06 PALESTRANTES", "<!-- ====== 07"),
    ("07-programacao", "<!-- ====== 07 PROGRAMAÇÃO", "<!-- ====== 08"),
    ("08-experiencia", "<!-- ====== 08 EXPERIÊNCIA", "<!-- ====== 09"),
    ("09-ingressos", "<!-- ====== 09 INGRESSOS", "<!-- ====== 10"),
    ("10-realizacao", "<!-- ====== 10 REALIZAÇÃO", "<!-- ====== 11"),
    ("11-inscricao", "<!-- ====== 11 INSCRIÇÃO", "<!-- ====== 12"),
    ("12-final", "<!-- ====== 12 FINAL", "</main>"),
]
blocks = {}
for name, start, end in section_markers:
    frag = between(start, end)
    frag = frag[frag.index("<section"):].rstrip()
    blocks[name] = frag

footer = between("<footer", "<!-- CTA fixo no mobile -->").strip()
dock = between("<!-- CTA fixo no mobile -->", "<!-- Política de privacidade -->").strip()
dock = dock[dock.index("<div"):]
dialog = between("<!-- Política de privacidade -->", "<script src=").strip()
dialog = dialog[dialog.index("<dialog"):]

# Elementos de página inteira vão junto com o topo (sprite, navegação) e o rodapé (dock, privacidade)
for k in blocks:
    blocks[k] = add_root_class(blocks[k])
sprite = add_root_class(sprite)
nav = add_root_class(nav)
skip = add_root_class(skip)
footer = add_root_class(footer)
dock = add_root_class(dock)
dialog = add_root_class(dialog)

blocks["01-topo"] = "\n\n".join([sprite, skip, nav, blocks["01-topo"]])
blocks["13-rodape"] = "\n\n".join([footer, dock, dialog])

HEADER_NOTE = "<!-- Sertão Negócios 2026 · bloco {name} · GreatPages: Adicionar bloco > elemento HTML/CSS -->\n"
for k in list(blocks):
    blocks[k] = HEADER_NOTE.format(name=k) + img_paths(prefix_html(blocks[k])) + "\n"

# ---------------------------------------------------------------------------
# 4. Cabeçalho e scripts
# ---------------------------------------------------------------------------
ld_json = re.search(r'<script type="application/ld\+json">.*?</script>', html, re.S).group(0)
head = f"""<!-- Sertão Negócios 2026 · 00 ESTILOS · GreatPages: Configurações > Javascript & CSS > Adicionar código (tipo Funcionamento) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Manrope:wght@400..800&display=swap">
<link rel="preload" href="{IMG_TOKEN}logo-sertao-negocios.webp" as="image" fetchpriority="high">
<script>
  document.documentElement.classList.add('sn-js');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('sn-reduced-motion');
</script>
<style>
{kit_css}
</style>
{ld_json}
"""

kit_js = prefix_js(js)
kit_js = must_replace(kit_js, "(() => {\n  'use strict';", "const __snRun = () => {\n  'use strict';")
if not kit_js.rstrip().endswith("})();"):
    fail("fim do main.js inesperado")
fit_js = (ROOT / "tools/gp_fit.js").read_text()
kit_js = kit_js.rstrip()[:-len("})();")] + (
    "};\n" + fit_js +
    "  const __snBoot = () => { __snFit(); __snRun(); };\n"
    "  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', __snBoot);\n  else __snBoot();\n")
kit_js = "{\n" + kit_js + "}\n"

scripts = f"""<!-- Sertão Negócios 2026 · 99 SCRIPTS · GreatPages: Configurações > Javascript & CSS > Adicionar código (tipo Funcionamento) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/DrawSVGPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js"></script>
<script>
{cfg.strip()}
</script>
<script>
{kit_js}</script>
"""

# Estilos em 3 códigos menores: o campo de código do GreatPages fica no limite com ~50 mil caracteres
def minify_css(c):
    c = re.sub(r"/\*.*?\*/", "", c, flags=re.S)
    c = re.sub(r"\s+", " ", c)
    c = re.sub(r"\s*([{};,])\s*", r"\1", c)
    return c.replace(";}", "}").replace("}", "}\n").strip()  # uma regra por linha


def split_rules(c, n):
    """Divide em n partes de tamanho parecido, sempre no fim de uma regra de nível superior."""
    cuts, depth = [], 0
    for i, ch in enumerate(c):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                cuts.append(i + 1)
    if depth != 0:
        fail("chaves desbalanceadas no CSS")
    chunks, last = [], 0
    for k in range(1, n):
        cut = min(cuts, key=lambda x: abs(x - len(c) * k / n))
        chunks.append(c[last:cut])
        last = cut
    chunks.append(c[last:])
    return chunks


BOOST = ":not(#sn-x)"  # soma o peso de um #id a todo seletor do kit, sem mudar a ordem entre as regras dele


def _split_top(text, sep):
    out, depth, cur = [], 0, ""
    for ch in text:
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        if ch == sep and depth == 0:
            out.append(cur)
            cur = ""
        else:
            cur += ch
    out.append(cur)
    return out


def _boost_selector(sel):
    sel = sel.strip()
    depth = 0
    for i, ch in enumerate(sel):
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        elif depth == 0 and sel.startswith("::", i):
            return sel[:i] + BOOST + sel[i:]
    return sel + BOOST


def boost_css(c):
    """Aumenta a especificidade de todas as regras (o CSS do GreatPages vence seletores de classe)."""
    out, i, stack, start = [], 0, [], 0
    while i < len(c):
        ch = c[i]
        if ch == "{":
            prelude = c[start:i]
            lead = prelude[:len(prelude) - len(prelude.lstrip())]
            pre = prelude.strip()
            if pre.startswith("@"):
                stack.append("keyframes" if "keyframes" in pre.split()[0] else "at")
                out.append(prelude + "{")
            elif stack and stack[-1] == "keyframes":
                stack.append("frame")
                out.append(prelude + "{")
            else:
                stack.append("rule")
                out.append(lead + ",".join(_boost_selector(x) for x in _split_top(pre, ",")) + "{")
            start = i + 1
        elif ch == "}":
            out.append(c[start:i + 1])
            stack.pop()
            start = i + 1
        i += 1
    out.append(c[start:])
    return "".join(out)


css_parts = split_rules(boost_css(minify_css(kit_css)), 3)
NOTE = "<!-- Sertão Negócios 2026 · ESTILOS {i} de 3 · GreatPages: Configurações > Javascript & CSS > Adicionar código (tipo Funcionamento), na ordem 1, 2, 3 -->\n"
head_parts = [
    NOTE.format(i=1) + head[head.index("<link"):head.index("<style>")] + "<style>" + css_parts[0] + "</style>\n",
    NOTE.format(i=2) + "<style>" + css_parts[1] + "</style>\n",
    NOTE.format(i=3) + "<style>" + css_parts[2] + "</style>\n" + ld_json + "\n",
]

# ---------------------------------------------------------------------------
# 5. Links das imagens já enviadas ao GreatPages (greatpages/links-imagens.json)
# ---------------------------------------------------------------------------
import json
links_file = OUT / "links-imagens.json"
links = json.loads(links_file.read_text()) if links_file.exists() else {}

def apply_links(text):
    for name, url in links.items():
        text = text.replace(IMG_TOKEN + name, url)
    return text

# ---------------------------------------------------------------------------
# 6. Gravação
# ---------------------------------------------------------------------------
if OUT.exists():
    for p in OUT.glob("[0-9][0-9]-*.html"):  # preserva teste-diagnostico.html
        p.unlink()
    shutil.rmtree(OUT / "imagens", ignore_errors=True)
OUT.mkdir(exist_ok=True)
for i, part in enumerate(head_parts, 1):
    (OUT / f"00-estilos-{i}.html").write_text(apply_links(part))
for k, v in blocks.items():
    (OUT / f"{k}.html").write_text(apply_links(v))
(OUT / "99-scripts.html").write_text(scripts)

used = sorted(set(re.findall(re.escape(IMG_TOKEN) + r"([\w.-]+)", head + "".join(blocks.values()))))
(OUT / "imagens").mkdir()
for f in used + ["og-logo.png"]:  # og-logo: imagem de compartilhamento (SEO)
    shutil.copy(ROOT / "assets/img" / f, OUT / "imagens" / f)

# Conferências
everything = head + "".join(blocks.values()) + scripts
leftover = [c for c in re.findall(r'class="([^"]*)"', "".join(blocks.values())) for c in c.split()
            if c != "sn" and not c.startswith(PFX)]
if leftover:
    fail(f"classes sem prefixo no HTML: {sorted(set(leftover))[:10]}")
if "assets/" in "".join(blocks.values()):
    fail("ainda há caminhos assets/ nos blocos")
pending = {}
for p in sorted(OUT.glob("[0-9][0-9]-*.html")):
    left = sorted(set(re.findall(re.escape(IMG_TOKEN) + r"([\w.-]+)", p.read_text())))
    if left:
        pending[p.name] = left
print("Imagens ainda sem link:", pending if pending else "nenhuma")
print(f"Kit gerado em {OUT.relative_to(ROOT.parent)}: {len(blocks)} blocos, {len(used)} imagens, "
      f"{len(kit_css)//1024} KB de CSS, {len(classes)} classes prefixadas.")
