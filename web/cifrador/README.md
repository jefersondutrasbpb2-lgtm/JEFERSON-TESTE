# Cifras IEC Pombal (Cifrador)

App de cifras do ministério de louvor da Igreja Evangélica Congregacional de Pombal, publicado em
`cifras.igrejacongregacionalpombal.com.br` (pasta `public_html/cifras` na Hostinger).

- **Busca** (tela inicial): campo grande, favoritas e abertas recentemente. Menu lateral no
  computador e barra embaixo no celular: Busca · Repertórios · Cifras · Áudio.
- **Cifras**: todas as cifras da igreja em ordem alfabética, com o tom de cada uma.
- **Cifra aberta**: ★ favoritar, + adicionar ao repertório no tom da tela, imprimir/PDF; seções da
  música em faixa colorida.
- **Cifra**: cola uma cifra (acordes em cima da letra ou ChordPro), transpõe, capotraste,
  desenhos dos acordes para violão e teclado, rolagem automática. A cifra quebra a linha no fim da
  tela mantendo cada acorde em cima da sua sílaba (dá para ler no celular sem arrastar para o lado).
- **Modo culto**: tela só com a música e uma barra embaixo (tom, tamanho da letra, rolagem, sair).
  Tocando um repertório, a barra passa para a próxima música já no tom combinado. Mantém a tela acesa.
  **Ajustar à tela** (ligado por padrão no computador): a música inteira na tela, sem rolar. O app
  testa de 1 a 4 colunas e escolhe o maior tamanho de letra que cabe, preferindo não quebrar linhas.
  No computador a barra some depois de 2,5 s parado e volta ao mexer o mouse. Se não couber nem
  com letra de 12px (música longa no celular), volta a rolar.
  Celular deitado (ex.: em cima do teclado) também liga o ajuste sozinho, com a barra numa linha só.
- **Cada um usa do seu jeito:** tom, letra, instrumento, ajuste à tela, capo e a música aberta no
  modo culto ficam só no aparelho de cada pessoa. O que é compartilhado é a biblioteca e os
  repertórios (o tom do repertório é o ponto de partida). O capo que cada um usa em cada música fica
  guardado no aparelho dele.
- **Pedal de virar página:** no modo culto, ← → e Page Up/Down trocam de música; com o ajuste à
  tela ligado, ↑ ↓, espaço e Enter também.
- **Tablatura:** linhas como `e|--3--5--|` aparecem em fonte de largura fixa, alinhadas.
- **Culto (repertórios)**: a ordem das músicas de cada culto, com o tom de cada uma, compartilhada
  com a equipe.
- **Áudio**: tira os acordes de um arquivo, no próprio navegador (`assets/worker.js`).
- **Biblioteca compartilhada**: as cifras ficam no servidor (`api.php`) e todo mundo que abre o
  Cifrador vê e edita as mesmas. É aberta, sem login, como a Escala do Louvor.

## Arquivos

Não tem etapa de build: os arquivos desta pasta vão como estão para o servidor.

| Arquivo | O que é |
| --- | --- |
| `index.html` | Página e marcação das 3 abas |
| `assets/app.js` | Lógica do app (leitura da cifra, transposição, acordes, biblioteca, áudio) |
| `assets/biblioteca.js` | Conversa com `api.php`: lista, salva, exclui, guarda cópia para usar sem internet |
| `api.php` | API da biblioteca (PHP, sem banco MySQL) |
| `.htaccess` | Bloqueia arquivos internos e evita cache velho de html/js |
| `assets/worker.js` | Análise do áudio (cromagrama e detecção de acordes) |
| `assets/estilo.css` | Visual |
| `sw.js`, `manifest.webmanifest`, `icon.svg` | PWA (abrir sem internet e instalar no celular) |

O código veio do primeiro protótipo, que só existia já compilado. Os arquivos foram
formatados para leitura, mas os nomes das variáveis internas ainda são curtos. Vale
renomear aos poucos, conforme as partes forem sendo alteradas.

## Biblioteca compartilhada

- **Onde ficam os dados:** `domains/igrejacongregacionalpombal.com.br/cifras-dados/banco.php`, fora da
  pasta pública. Se não der para criar lá, ficam em `_dados/` ao lado de `api.php`, bloqueada por `.htaccess`.
- **Backup:** a cada dia com alteração fica `backup-AAAA-MM-DD.php` com o banco como estava antes. São
  mantidos 60 dias.
- **Excluir:** a cifra vai para a lixeira por 30 dias. Logo depois de excluir, aparece "Desfazer".
- **Duas pessoas editando a mesma cifra:** quem salvar por último não apaga o trabalho do outro. A
  versão dele é salva como "Nome (cópia)".
- **Sem internet:** a biblioteca mostra a última cópia recebida, e o que for salvo fica no aparelho
  com o aviso "só neste aparelho" até alguém tocar em "Enviar para a biblioteca".
- **Cifras da versão antiga** (que ficavam só no navegador) aparecem do mesmo jeito, como pendentes
  para enviar.

## Testar localmente

Com PHP, para a biblioteca funcionar (os dados vão para `../../cifras-dados`):

```bash
cd web/cifrador && php -S 127.0.0.1:8765
```

Depois abra http://127.0.0.1:8765. Sem PHP, `python3 -m http.server` também abre o app, mas a
biblioteca fica no modo sem conexão.

## Publicar

1. Rode `node web/cifrador/versionar.mjs`. Ele põe a versão (hash do conteúdo) nos endereços de
   `estilo.css`, `app.js` e `biblioteca.js`. **Não pule:** o CDN da Hostinger guarda CSS por até
   7 dias, e sem a versão no endereço o navegador pode receber o CSS antigo com o JS novo.
2. Envie para `public_html/cifras`: `api.php`, `.htaccess`, `sw.js`, `manifest.webmanifest`,
   `icon.svg`, `icon-*.png`, a pasta `assets/` e por último o `index.html`.
3. Limpe o cache do site na Hostinger (hPanel › Cache, ou a ferramenta de limpar cache).
