# Kit GreatPages · Sertão Negócios 2026

Este kit monta no GreatPages a mesma landing page aprovada, bloco a bloco.
Os blocos já vêm preparados para não conflitar com o estilo do GreatPages: todas as classes começam com `sn-` e nenhum estilo é aplicado fora deles.

## O que tem aqui

| Arquivo | Onde colar | Quantas vezes |
|---|---|---|
| `00-cabecalho.html` | Campo de códigos do **cabeçalho** da página (head) | Uma vez |
| `01-topo.html` … `13-rodape.html` | Um **elemento HTML** por arquivo, cada um na sua seção, nesta ordem | Um por seção |
| `99-scripts.html` | Campo de códigos do **fim da página** (antes de `</body>`) | Uma vez |
| `imagens/` | Biblioteca de mídia do GreatPages | 12 imagens da página + 1 de compartilhamento |

Ordem das seções: 01 topo · 02 proposta · 03 história · 04 região (mapa) · 05 por que participar · 06 palestrantes · 07 programação · 08 experiência · 09 ingressos · 10 realização · 11 inscrição · 12 final · 13 rodapé.

## Passo 1 · Faça primeiro o teste rápido

Antes de montar tudo, crie uma página de rascunho só com:

1. `00-cabecalho.html` no cabeçalho;
2. uma seção com `01-topo.html`;
3. uma seção com `03-historia.html`;
4. `99-scripts.html` no fim da página.

Publique e abra no navegador (no celular também). Confira:

- [ ] O logo, a data e os botões aparecem, e o topo anima ao carregar.
- [ ] A rolagem fica suave.
- [ ] Na história do Sertão, no computador, a imagem fica parada enquanto o texto passa ao lado.
- [ ] A barra de navegação fica fixa no alto e some ao rolar para baixo.
- [ ] Não há faixa vazia nem corte entre o topo e a seção seguinte.

As imagens ainda aparecem quebradas nesse teste, e tudo bem: os endereços são trocados no passo 3.

Se tudo isso funcionar, o resto da página funciona. Se algo falhar, veja "Se algo não funcionar" no fim deste guia.

## Passo 2 · Configure a página

- **Fundo da página:** `#090c3a` (azul-noite).
- **Cabeçalho e rodapé padrão do GreatPages:** desligue. O kit tem navegação e rodapé próprios.
- **Cada seção que recebe um bloco:**
  - largura total (100%, sem limite de largura do conteúdo);
  - espaçamento interno (padding) zero em cima, embaixo e nas laterais;
  - margem zero entre seções;
  - sem cor ou imagem de fundo;
  - sem animação de entrada do GreatPages.
- **Elemento HTML:** largura total, sem margem, visível no computador **e** no celular. Não precisa ajustar nada no modo celular do editor: o código já se adapta sozinho a cada tela.

## Passo 3 · Suba as imagens

Suba os 12 arquivos de imagem da pasta `imagens/` (o `og-logo.png` é só para o SEO, no passo 6) na biblioteca de mídia do GreatPages e copie o link de cada um.

Nos blocos, cada imagem aparece como `IMAGEM/nome-do-arquivo`, por exemplo `IMAGEM/speaker-rick.webp`. Há dois jeitos de trocar:

- **Mais fácil:** me mande a lista com o nome de cada arquivo e o link que o GreatPages gerou. Eu devolvo os blocos com os links já trocados.
- **Por conta própria:** abra cada arquivo `.html` num editor de texto (Bloco de Notas, VS Code), use "Localizar e substituir" para trocar `IMAGEM/nome-do-arquivo` pelo link completo e salve antes de colar.

Onde cada imagem é usada:

| Imagem | Bloco |
|---|---|
| `logo-sertao-negocios.webp` | 00 (pré-carregamento) e 01 |
| `logo-sertao-negocios-sm.webp` | 01 (navegação) e 13 |
| `patos-aerea.webp` | 01 |
| `patos-entardecer.webp`, `patos-letreiro.webp` | 03 |
| `speaker-rick.webp`, `speaker-rossandro.webp`, `speaker-moises.webp` | 06 |
| `sebrae-patos.webp`, `logo-sebrae.png`, `logo-mr3.png`, `logo-ancora.png` | 10 (logos também no 13) |

## Passo 4 · Cole os blocos

1. Cole `00-cabecalho.html` no campo de códigos do cabeçalho.
2. Crie as 13 seções na ordem e cole um arquivo em cada elemento HTML.
3. Cole `99-scripts.html` no campo de códigos do fim da página.

Copie sempre o arquivo **inteiro**, do primeiro ao último caractere.

## Passo 5 · Formulário

O formulário do bloco 11 valida os campos e dispara os eventos de conversão, mas só envia os dados quando você informa para onde.
No `99-scripts.html`, preencha `leadEndpoint` com a URL do webhook do seu CRM ou automação (Make, Zapier, n8n, RD Station, Google Apps Script…).
Enquanto estiver vazio, o envio é **simulado**: aparece "Cadastro recebido", mas o lead não é salvo.

- Webhook que recebe JSON: deixe `payloadFormat: 'json'` e `requestMode: 'cors'`.
- Google Apps Script ou webhook sem CORS: use `payloadFormat: 'form'` e `requestMode: 'no-cors'`.

Campos enviados: `nome`, `whatsapp`, `email`, `cidade`, `interesse` (`smart`, `vip` ou `expositor`), `consentimento`, as UTMs, `pagina` e `enviado_em`.

**Alternativa:** usar o formulário nativo do GreatPages, que já se integra às ferramentas de leads dele. Nesse caso, no bloco 11, coloque o formulário do GreatPages no lugar do formulário do kit. O visual fica por conta dos estilos do GreatPages.

## Passo 6 · SEO e rastreamento

Preencha nas configurações de SEO da página:

- **Título:** `Sertão Negócios 2026 · 03 e 04 de dezembro · Patos-PB`
- **Descrição:** `Dois dias de palestras com Rick Chester, Rossandro Klinjey e Moisés Ramos, cases reais de empresários do Sertão, networking e área de estandes. 03 e 04 de dezembro, auditório do Sebrae em Patos-PB.`
- **Imagem de compartilhamento:** `imagens/og-logo.png`.

Pixel da Meta, Google Analytics e Tag Manager podem ser instalados normalmente pelo GreatPages.
O kit envia os eventos `cta_click`, `form_start`, `form_error`, `generate_lead` e `form_submit_error` para o `dataLayer`, e `Lead` para o Pixel.

Também falta completar a **política de privacidade** (bloco 13) com razão social, CNPJ e contato do responsável pelos dados.

## Se algo não funcionar

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Nada anima e a rolagem não é suave | Os scripts não rodaram | Confira se `99-scripts.html` está no campo de **fim da página**, não num elemento HTML. |
| Página sem estilo (texto preto, sem cores) | O cabeçalho não foi aplicado | Confira o campo do cabeçalho. Se o GreatPages limitar o tamanho desse campo, cole o `00-cabecalho.html` num elemento HTML no **topo** da página. |
| Faixas vazias entre as seções ou cantos arredondados cortados | Espaçamento ou recorte das seções do GreatPages | Zere o espaçamento das seções. Se continuar, adicione ao fim do `00-cabecalho.html`: `<style>:root{--sn-overlap:0px}</style>` |
| Na história do Sertão a imagem não fica parada, ou o mapa não fica fixo enquanto se desenha | Alguma caixa do GreatPages em volta da seção corta o conteúdo | Me mande o link do teste. Dá para ajustar com um CSS específico para o GreatPages. |
| Barra de navegação ou botão fixo do celular rolando junto com a página | Alguma caixa do GreatPages com animação ou efeito em volta do bloco | Desligue animações de entrada da seção e do elemento. |
| Botões ou títulos com fonte ou cor diferentes | Estilo do tema do GreatPages se sobrepondo | Me mande o link e eu reforço as regras do kit. |

## Para quem mantém o código

O kit é gerado automaticamente a partir da página original (`index.html`, `assets/css/main.css`, `assets/js/main.js`).
Depois de qualquer mudança nela, gere o kit de novo:

```bash
cd sertao-negocios
python3 tools/build_greatpages.py
```
