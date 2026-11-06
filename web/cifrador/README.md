# Cifrador

App de cifras do ministério de louvor, publicado em
`cifras.igrejacongregacionalpombal.com.br` (pasta `public_html/cifras` na Hostinger).

- **Cifra**: cola uma cifra (acordes em cima da letra ou ChordPro), transpõe, capotraste,
  desenhos dos acordes para violão e teclado, rolagem automática.
- **Do áudio ou vídeo**: tira os acordes de um arquivo, no próprio navegador (`assets/worker.js`).
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

Enviar para `public_html/cifras` na Hostinger: `index.html`, `api.php`, `.htaccess`, `sw.js`,
`manifest.webmanifest`, `icon.svg` e a pasta `assets/`.
