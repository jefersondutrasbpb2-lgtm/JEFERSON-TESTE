# Cifrador

App de cifras do ministério de louvor, publicado em
`cifras.igrejacongregacionalpombal.com.br` (pasta `public_html/cifras` na Hostinger).

- **Cifra**: cola uma cifra (acordes em cima da letra ou ChordPro), transpõe, capotraste,
  desenhos dos acordes para violão e teclado, rolagem automática.
- **Do áudio ou vídeo**: tira os acordes de um arquivo, no próprio navegador (`assets/worker.js`).
- **Biblioteca**: as cifras ficam salvas no `localStorage` de cada navegador (chave `cifrador.songs`),
  não no servidor.

## Arquivos

Não tem etapa de build: os arquivos desta pasta vão como estão para o servidor.

| Arquivo | O que é |
| --- | --- |
| `index.html` | Página e marcação das 3 abas |
| `assets/app.js` | Lógica do app (leitura da cifra, transposição, acordes, biblioteca, áudio) |
| `assets/worker.js` | Análise do áudio (cromagrama e detecção de acordes) |
| `assets/estilo.css` | Visual |
| `sw.js`, `manifest.webmanifest`, `icon.svg` | PWA (abrir sem internet e instalar no celular) |

O código veio do primeiro protótipo, que só existia já compilado. Os arquivos foram
formatados para leitura, mas os nomes das variáveis internas ainda são curtos. Vale
renomear aos poucos, conforme as partes forem sendo alteradas.

## Testar localmente

```bash
cd web/cifrador && python3 -m http.server 8765
```

Depois abra http://localhost:8765.
