# Kit GreatPages · Sertão Negócios 2026

Este kit monta no GreatPages a mesma landing page aprovada, bloco a bloco.
Os blocos já vêm preparados para não conflitar com o estilo do GreatPages: todas as classes começam com `sn-` e nenhum estilo é aplicado fora deles.

## O que tem aqui

| Arquivo | Onde colar no GreatPages | Quantas vezes |
|---|---|---|
| `teste-diagnostico.html` | Elemento **HTML/CSS** numa página de rascunho (veja o passo 0) | Só no teste |
| `00-estilos-1.html`, `00-estilos-2.html`, `00-estilos-3.html` | **Configurações (engrenagem) → Javascript & CSS → Adicionar código**, tipo **Funcionamento**, um código por arquivo, nomes "Sertão Negócios · Estilos 1", "2" e "3", criados nessa ordem | Uma vez cada |
| `01-topo.html` … `13-rodape.html` | **Adicionar bloco** → elemento **HTML/CSS**, um arquivo por bloco, nesta ordem | Um por bloco |
| `99-scripts.html` | **Configurações → Javascript & CSS → Adicionar código**, tipo **Funcionamento**, nome "Sertão Negócios · Scripts" | Uma vez |

Use sempre o tipo **Funcionamento** nos quatro códigos. Os tipos "Estatísticas" e "Marketing" podem ficar bloqueados até o visitante aceitar os cookies (LGPD), e a página ficaria sem estilo e sem animação.
| `imagens/` | Biblioteca de mídia do GreatPages | 12 imagens da página + 1 de compartilhamento |

Ordem das seções: 01 topo · 02 proposta · 03 história · 04 região (mapa) · 05 por que participar · 06 palestrantes · 07 programação · 08 experiência · 09 ingressos · 10 realização · 11 inscrição · 12 final · 13 rodapé.

## Passo 0 · Diagnóstico (2 minutos)

1. Crie uma página de rascunho, adicione um bloco e, dentro dele, um elemento **HTML/CSS**.
2. Cole o conteúdo de `teste-diagnostico.html`.
3. Adicione um segundo bloco qualquer embaixo, com um texto.
4. Publique e abra o **link publicado** (não a pré-visualização do editor).
5. Role a página até o fim do degradê azul→vermelho e volte para a caixa azul-escura.
6. Clique em **Copiar resultado** e cole o texto na conversa.

Com isso eu sei se o elemento HTML/CSS do GreatPages comporta os efeitos do kit, e ajusto o que for preciso antes de você montar tudo.

## Passo 1 · Faça o teste rápido

Antes de montar tudo, crie uma página de rascunho só com:

1. os três `00-estilos-*.html` em Configurações → Javascript & CSS (tipo Funcionamento), na ordem 1, 2, 3;
2. uma seção com `01-topo.html`;
3. uma seção com `03-historia.html`;
4. `99-scripts.html` em Configurações → Javascript & CSS (tipo Funcionamento).

Publique e abra no navegador (no celular também). Confira:

- [ ] O logo, a data e os botões aparecem, e o topo anima ao carregar.
- [ ] A rolagem fica suave.
- [ ] Na história do Sertão, no computador, a imagem fica parada enquanto o texto passa ao lado.
- [ ] A barra de navegação fica fixa no alto e some ao rolar para baixo.
- [ ] Não há faixa vazia nem corte entre o topo e a seção seguinte.

As imagens ainda aparecem quebradas nesse teste, e tudo bem: os endereços são trocados no passo 3.

Se tudo isso funcionar, o resto da página funciona. Se algo falhar, veja "Se algo não funcionar" no fim deste guia.

## Encaixe automático

O código de Scripts (`99-scripts.html`) ajusta sozinho cada bloco que recebe uma seção do kit:
- estica o elemento para a largura total da tela;
- deixa o bloco com a altura real do conteúdo, no computador e no celular;
- troca o corte (`overflow: hidden`) das caixas em volta por um corte que não quebra os efeitos de "ficar parado".

Por isso a altura que você der ao bloco e ao elemento no editor não importa. Deixe qualquer altura que caiba na tela do editor.

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

1. Em Configurações → Javascript & CSS, adicione `00-estilos-1.html`, `00-estilos-2.html`, `00-estilos-3.html` e `99-scripts.html` como quatro códigos do tipo Funcionamento, nessa ordem.
2. Crie os 13 blocos na ordem e cole um arquivo em cada elemento HTML/CSS.

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
| Nada anima e a rolagem não é suave | Os scripts não rodaram | Confira se `99-scripts.html` foi adicionado em Configurações → Javascript & CSS com o tipo **Funcionamento**. |
| Página sem estilo (texto preto, sem cores) | O código de estilos não foi aplicado | Confira se os três `00-estilos-*.html` estão em Configurações → Javascript & CSS com o tipo **Funcionamento** e se cada um termina em `</style>` (o 3 termina em `</script>`). |
| Faixas vazias entre as seções ou cantos arredondados cortados | Espaçamento ou recorte das seções do GreatPages | Zere o espaçamento das seções. Se continuar, adicione ao fim do `00-estilos-3.html`: `<style>:root{--sn-overlap:0px}</style>` |
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
