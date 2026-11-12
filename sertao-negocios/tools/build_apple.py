#!/usr/bin/env python3
"""Versão de teste "Apple design" da página de vendas: o mesmo HTML com a camada assets/css/apple.css.

Só acrescenta um <style id="apple-design"> no fim do <head>, depois de todo o CSS da página,
sem mexer em textos, scripts ou links. Assim a cópia segue igual à página de vendas em conteúdo.

Uso:  python3 tools/build_apple.py <html da página de vendas> <saída>
      (a entrada costuma ser o HTML baixado do GreatPages ou greatpages-vendas/index.html)
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

if len(sys.argv) != 3:
    sys.exit(__doc__)
src, out = map(Path, sys.argv[1:])
html = src.read_text(encoding="utf-8")
css = (ROOT / "assets/css/apple.css").read_text(encoding="utf-8")

if 'id="apple-design"' in html:
    sys.exit("[build_apple] a página já tem a camada apple-design")
if html.count("</head>") != 1:
    sys.exit("[build_apple] </head> não encontrado (ou repetido)")
html = html.replace("</head>", f'<style id="apple-design">\n{css}</style>\n</head>')
html = html.replace("<title>Ingressos · Sertão Negócios 2026", "<title>[Teste Apple] Ingressos · Sertão Negócios 2026", 1)
# Cópia de teste: fora das buscas do Google para não competir com a página oficial
html = html.replace('<meta name="viewport"', '<meta name="robots" content="noindex, nofollow">\n  <meta name="viewport"', 1)

out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"Versão Apple gerada em {out} ({len(html) // 1024} KB)")
