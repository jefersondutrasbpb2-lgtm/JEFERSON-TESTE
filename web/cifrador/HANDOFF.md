# Especificação técnica: Cifras IEC Pombal

Documento de referência para quem for alterar o app. Descreve o app **como ele está hoje** (código em
`web/cifrador/`, publicado em `cifras.igrejacongregacionalpombal.com.br`). Quando mudar o
comportamento, atualize este arquivo junto.

## 1. Visão geral

App de cifras do louvor da IEC Pombal. São **3 usuários, todos instrumentistas**, e cada um usa de
forma **independente** (ninguém guia a tela dos outros):

| Usuário | Instrumento | Aparelho no culto | Consequência de projeto |
|---|---|---|---|
| Jefferson | Guitarra e violão | Computador na banquinha, a ~1 m | Música inteira na tela, letra grande, trocar de música pelo pedal |
| Natan | Violão | Computador na banquinha | Igual ao Jefferson; capo próprio |
| Juninho | Teclado | Celular deitado em cima do teclado | Mãos ocupadas, tela baixa: ajuste automático em paisagem, barra numa linha |

**Compartilhado no servidor:** biblioteca de cifras e repertórios.
**Só no aparelho de cada um:** tom, capo, instrumento, tamanho da letra, ajuste à tela, desenhos,
música aberta no modo culto.

Sem etapa de build: HTML, CSS e JS (módulo ES) vão como estão. Back-end em PHP sem banco
(`api.php`, arquivo JSON fora da pasta pública).

## 2. Estrutura das telas

```
Menu lateral (computador) / barra embaixo (celular):  Busca · Repertórios · Cifras · Áudio

Busca (início)            Repertórios                 Cifras             Áudio
├ Campo grande            ├ ★ Favoritas (fixa no topo)├ + Nova cifra     ├ Arquivo / exemplo
├ ★ Favoritas             ├ Pastas: nome, nº, data    ├ Busca            └ Avançado: servidor
├ Abertas recentemente    └ Pasta aberta:             └ Cards A–Z
└ Resultados                 ⠿ arrastar, tom − +, ✕, Imprimir, ▶ Tocar

Cifra aberta (a partir de qualquer lista):  ‹ Voltar · ★ · + Repertório · Imprimir
├ Barra: Tom, Instrumento, Capo, Ajustes, Editar, Modo culto
├ Editor (esq.) │ Folha (dir.): seções em faixa colorida
└ Modo culto (palco): fundo escuro, setas ‹ › nas laterais, bolinhas de posição, barra embaixo
```

**Só no aparelho de cada pessoa (além do que já era):** favoritas (`favoritos`), abertas recentemente
(`recentes`, 12), tema (`tema`: claro/escuro/sem escolha) e fundo escuro no palco (`palcoEscuro`,
ligado por padrão).

## 3. Layout e pontos de quebra

| Faixa | O que muda | Por quê |
|---|---|---|
| **> 860px** (computador) | Menu lateral de 232px. Cifra em 2 colunas (editor 5fr, folha 8fr). Barra de ferramentas completa, fixa no topo ao rolar. Modo culto começa com **Ajustar à tela** ligado | Jefferson e Natan usam computador |
| **≤ 860px** (celular em pé) | Menu vira barra de 4 ícones embaixo (56px). Uma coluna; editor escondido até tocar em **Editar**. Barra mostra Tom, Instrumento, Capo; o resto em **Ajustes**. Botões com 44px. No repertório, a ordem muda arrastando ⠿ (↑ ↓ só no computador). Setas laterais do palco escondidas (‹ › ficam na barra) | Toque com o dedo; espaço vertical |
| **Paisagem e altura ≤ 520px** (celular deitado) | Barra do modo culto numa linha só. Ajustar à tela liga sozinho | Celular do Juninho em cima do teclado |

- Largura máxima do conteúdo: `.wrap` com 1320px; no modo culto ajustado, sem limite.
- Margem lateral: `max(16px, safe-area)`. Respeita o notch do iPhone (`env(safe-area-inset-*)`).
- Página nunca rola para o lado. A cifra quebra a linha (seção 6.3); só tablatura pode ter rolagem horizontal própria.

## 4. Tokens de design

Definidos em `:root` (`assets/estilo.css`). Modo escuro automático (`prefers-color-scheme`) ou forçado
com `data-theme="dark"`/`"light"` no `<html>`.

### Cores

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--paper` | `#f5f6fa` | `#0e1120` | Fundo da página |
| `--surface` | `#ffffff` | `#161a2c` | Cards, folha, inputs, barra do culto |
| `--surface-2` | `#eceff7` | `#1e2339` | Fundo das abas, `code` |
| `--ink` | `#141a2e` | `#e6e9f4` | Texto principal, letra da música |
| `--muted` | `#58617d` | `#98a1be` | Texto secundário, rótulos, títulos de seção da música |
| `--line` | `#d8ddea` | `#2b3250` | Bordas, divisória entre colunas, tracinho entre sílabas |
| `--chord` | `#2343cf` | `#93a9ff` | **Acordes**, botão principal, foco, tom |
| `--chord-soft` | `#e3e8fb` | `#232b52` | Botão ligado (`aria-pressed`), selo de tom, "Salvo ✓" |
| `--hot` / `--hot-soft` | `#d98e04` / `#fff1d1` | `#f4b63c` / `#3a2e12` | Avisos (capo, pendentes), destaque do desenho ao tocar no acorde |
| `--bass` | `#0e7c66` | `#4cc9a6` | Nota do baixo no desenho do teclado |
| `--danger` | `#b42318` | `#f97066` | Excluir, erros |

Contraste verificado com axe (WCAG 2.1 AA): **sem violações** nas 4 abas, claro e escuro.

### Tipografia

| Token | Fonte | Uso |
|---|---|---|
| `--display` | Bricolage Grotesque 600/800 | Marca, títulos, nomes de seção da música (INTRO, REFRÃO) |
| `--body` | Atkinson Hyperlegible 400/700 | Interface e **letra da música** (escolhida por legibilidade) |
| `--mono` | JetBrains Mono 400/700 | **Acordes**, tablatura, editor de texto |
| `--sheet-size` | 17px (12–40, A−/A+) | Tamanho da folha da cifra fora do ajuste à tela |

| Elemento | Tamanho / peso |
|---|---|
| Título da música | `clamp(26px, 4vw, 38px)` / 800; no modo ajustado `clamp(20px, 2.6vw, 30px)` |
| Título de aba (Biblioteca, Repertórios) | 24px / 800 |
| Corpo da interface | 15px / 1.5 |
| Rótulo da barra (TOM, CAPO) | 12px / 700, maiúsculas, `letter-spacing .08em` |
| Dicas e status | 13–14px, `--muted` |
| Folha da cifra | `--sheet-size`, `line-height 1.35` (1.25 no modo ajustado) |

### Espaçamento e raios

| Token | Valor | Token | Valor |
|---|---|---|---|
| `--space-1` | 4px | `--space-6` | 14px |
| `--space-2` | 6px | `--space-7` | 16px (margem lateral) |
| `--space-3` | 8px | `--space-8` | 18px |
| `--space-4` | 10px | `--space-9` | 22px |
| `--space-5` | 12px | `--space-10` | 24px |

| Token | Valor | Uso |
|---|---|---|
| `--radius-2xs` | 4px | `code`, detalhes pequenos |
| `--radius-xs` | 6px | Botões das abas, selo de tom, ‹ › dos desenhos |
| `--radius-sm` | 8px | Botões, selects |
| `--radius-md` | 10px | Inputs, abas, cards pequenos |
| `--radius-lg` | 12px | Cards, folha da cifra, itens de repertório |
| `--radius-pill` | 999px | Pílulas, dica do modo culto |

Use sempre os tokens em `gap`, `padding`, `margin` e `border-radius`. Valores fora da escala
(1–3px, 20px, 40px, 80px) continuam como número quando são ajustes finos de um elemento só.

## 5. Componentes

| Componente | Classe | Variantes | Observações |
|---|---|---|---|
| Botão | `.btn` | `.primary` (azul), `.ghost` (sem fundo), `.sq` (quadrado 34px / 44px no celular), `.perigo` | `aria-pressed="true"` deixa com fundo `--chord-soft`; `:disabled` com opacidade .45 |
| Grupo segmentado | `.seg` | — | Violão / Teclado; o ligado fica azul cheio |
| Abas | `.tabs` | — | `role="tablist"`, botões `role="tab"` com `aria-selected` |
| Selo de tom | `.keybox` | — | Texto mono azul, **sem cara de botão** (não é clicável) |
| Pílula | `.pill` | `.warn` | Tom original, transposição, capo, sugestão de capo com botão "usar" |
| Card | `.song` | `.passado` (repertório de data passada, opacidade .75) | Usado na biblioteca e nos repertórios |
| Desenho de acorde | `.dcard` | violão (SVG 96×124) / teclado (SVG 160×70) | ‹ › trocam a posição (1/6…); fundo laranja por 0,9 s ao tocar no acorde na folha |
| Folha da cifra | `.sheet` | normal / `.culto.ajuste` (colunas) | Ver seção 6.3 |
| Barra do modo culto | `.cultobar` | 2 linhas / 1 linha em paisagem | Fixa embaixo; some no computador quando parado |
| Item do repertório | `.replist li` | — | Número grande, nome, tom − +, ↑ ↓ ✕ |
| Aviso de pendentes | `.pendbox` | — | Fundo `--hot-soft`, botão "Enviar para a biblioteca" |

## 6. Telas, estados e interações

### 6.1 Biblioteca (tela inicial)

| Elemento | Estado | Comportamento |
|---|---|---|
| Lista | Padrão | Pendentes primeiro, depois A–Z (`localeCompare` pt-BR, sem diferenciar acento/maiúscula) |
| Card | — | Nome (botão), selo do tom, artista, até 8 acordes, botões **▶ Tocar** · **Abrir e editar** · **Excluir** |
| Busca | Digitando | Filtra na hora por nome + artista + letra, sem acento |
| Excluir | 1º toque | Texto vira "Confirmar exclusão" em `--danger` |
| Excluir | 2º toque | Vai para a lixeira; aviso com **Desfazer** |
| Status | Carregando | "Carregando a biblioteca…" |
| Status | Sem internet | "Sem conexão com o servidor. Mostrando a última cópia…" |
| Vazia | — | "Nenhuma cifra salva ainda…" |
| Busca sem resultado | — | "Nenhuma cifra encontrada com essa busca." |

Atualiza ao abrir a aba e ao voltar para o app (`visibilitychange`).

### 6.2 Editor (aba Cifra)

| Elemento | Estado | Comportamento |
|---|---|---|
| Salvar | Cifra nova | "Salvar na biblioteca" |
| Salvar | Sem mudanças | "Salvo na biblioteca ✓" (fundo `--chord-soft`) |
| Salvar | Alterada | "Salvar alterações" |
| Salvar | Enviando | Botão desabilitado |
| Salvar | Conflito (outra pessoa salvou antes) | Salva como "Nome (cópia)" e avisa |
| Salvar | Sem internet | Fica "só neste aparelho" até enviar |
| Salvar | Vazia | "Escreva ou cole a cifra antes de salvar." |
| Texto | Digitando | Folha redesenha 180 ms depois da última tecla |
| Rascunho | — | Texto, nome e artista ficam no `localStorage` e voltam ao reabrir |

### 6.3 Folha da cifra (desenho)

- **Acordes em cima + letra embaixo** viram blocos: um acorde e o pedaço da letra até o próximo
  acorde. A linha quebra entre palavras, nunca no meio de uma palavra.
- Acorde no meio da palavra mais largo que a sílaba: um **tracinho** (`--line`, 2px) liga as sílabas.
- Linha só de acordes (Intro, Final): mono, quebra nos espaços.
- `[Seção]` sozinha na linha: título da seção; cada seção é um bloco `.secao` que não se divide entre colunas.
- Tablatura (`e|--3--5--|`): mono, sem quebra, rolagem horizontal própria se não couber.
- Tocar num acorde rola até o desenho dele e pisca o card.

### 6.4 Modo culto

| Gatilho | Comportamento |
|---|---|
| **Modo culto** / **▶ Tocar** | Esconde topo, barra de ferramentas e editor. Pede tela cheia (não funciona no iPhone) e tela acesa (Wake Lock) |
| Tocando repertório | Barra mostra "2 de 5 · Nome do repertório", ‹ e ›; cada música abre no tom do repertório e no **capo deste aparelho** |
| − / + | Muda o tom só neste aparelho; não altera o repertório |
| A− / A+ | Desliga o ajuste à tela e usa o tamanho escolhido |
| **⤢ Ajustar à tela** | Liga/desliga; a escolha fica guardada separada para tela em pé e deitada |
| Entrar (computador, ajuste ligado) | A barra **já começa escondida**, para não cobrir o fim da música. Aparece por 3,5 s a dica "Mexa o mouse para ver os controles" no canto de cima |
| Mexer o mouse / tocar na tela | A barra aparece; some de novo 2,5 s depois de parar. **Teclado e pedal não trazem a barra** |
| Foco por Tab dentro da barra | A barra fica visível enquanto o foco estiver nela |
| iPhone fora da Tela de Início | Nas 3 primeiras vezes, dica "Tela cheia no iPhone: Compartilhar → Adicionar à Tela de Início" (6 s) |
| Esc / ✕ Sair | Sai do modo culto e da tela cheia |

**Teclado e pedal de virar página** (ignorado quando o foco está num campo):

| Tecla | Sempre | Com ajuste à tela |
|---|---|---|
| → / Page Down | Próxima música | Próxima música |
| ← / Page Up | Música anterior | Música anterior |
| ↓ / Espaço / Enter | (rolam a página) | Próxima música |
| ↑ | (rola a página) | Música anterior |

Botões da barra perdem o foco depois do clique, para o espaço do pedal não repetir o botão.

**Algoritmo do ajuste à tela** (`ajustarTela()`):
1. Altura disponível = altura da janela − topo da folha − barra (só em tela de toque) − 10px.
2. Para 1 até `min(4, largura ÷ 260)` colunas: busca binária do maior tamanho de letra entre **12 e 56px** em que nada transborda.
3. Nota de cada opção = tamanho × (1 − 0,7 × fração de linhas quebradas). Ganha a maior nota.
4. Se nada couber nem com 12px: uma coluna, 15px, com rolagem (`body.naocabe`).
5. Recalcula ao redimensionar, girar o celular, mudar de tom e trocar de música.

### 6.5 Repertórios (aba Culto)

| Elemento | Comportamento |
|---|---|
| Lista | Próximos primeiro (data mais perto no topo), depois os passados (mais recente primeiro) |
| Novo | Nome "Culto de domingo", data do próximo domingo; já salva |
| Adicionar | Busca na biblioteca (até 8 sugestões com artista e tom); tocar adiciona no fim |
| Itens | Tom − + (de −11 a +11 semitons), ↑ ↓ para reordenar, ✕ para tirar |
| Salvar | Automático, 700 ms depois da última mudança, em fila; "Salvando…" → "Salvo ✓ · a equipe já vê" |
| Conflito | Se outra pessoa salvou o mesmo repertório no meio tempo, o seu vira "Nome (cópia)" e o campo Nome mostra isso |
| Sem internet | "Sem internet: guardado neste aparelho…". Fica em `repertoriosPendentes` (repertório novo ganha id temporário `t…`) e aparece na lista. É enviado quando a internet volta ou quando a lista atualiza, **uma vez só** mesmo que os dois aconteçam juntos |
| Música excluída da biblioteca | Item mostra "Música excluída da biblioteca"; no culto, tela avisando |
| Excluir | Confirmação em 2 toques; sem lixeira (há o backup diário) |

### 6.6 Áudio

Igual ao protótipo, com duas mudanças: o resultado vazio fica escondido até haver análise, e o
servidor de análise fica recolhido em **Avançado**.

## 7. Dados e servidor (`api.php`)

| Ação | Método | Corpo | Resposta |
|---|---|---|---|
| `lista` | GET | — | `{cifras: {id: Cifra}, repertorios: {id: Repertorio}}` |
| `gravar` | POST | `{cifra: {id?, title, artist, text}, antes}` | `{cifra}` ou **409** `{atual}` se `updated ≠ antes` |
| `apagar` / `restaurar` | POST | `{id}` | Lixeira de 30 dias |
| `gravar_repertorio` | POST | `{repertorio: {id?, nome, data, itens: [{id, semis}]}, antes}` | `{repertorio}` ou **409** `{atual}` se `updated ≠ antes` |
| `apagar_repertorio` | POST | `{id}` | — |

- `Cifra = {id, title, artist, text, created, updated}`. Limites: nome/artista com 200 caracteres,
  texto com 60.000, até 5.000 cifras.
- `Repertorio = {id, nome, data: "AAAA-MM-DD" | "", itens, created, updated}`. Até 60 itens e 1.000 repertórios.
- POST só aceito da própria origem. Backup diário (60 dias) em `cifras-dados/`, fora da pasta pública.

**`localStorage` (prefixo `cifrador.`), só neste aparelho:** `draft`, `size`, `inst`, `tab`, `diag`,
`ajuste.empe`, `ajuste.deitado`, `capos` (`{idDaCifra: casa}`), `biblioteca` e `repertorios`
(cópias para usar sem internet), `songs` (cifras pendentes de envio), `repertoriosPendentes`,
`dicaIOS` (quantas vezes a dica apareceu), `api`.

**Instalar como app:** `manifest.webmanifest` com ícones `icon.svg`, `icon-192.png` e `icon-512.png`;
`icon-180.png` para a Tela de Início do iPhone; `apple-mobile-web-app-capable` para abrir sem a barra
do Safari.

## 8. Casos extremos

| Caso | Comportamento |
|---|---|
| Título muito longo | Quebra a linha (`overflow-wrap: anywhere`); no card e no repertório não corta |
| Música longa no celular em pé | Ajuste desligado por padrão; ligado e sem caber, volta a rolar |
| Música curta no computador | Letra pode chegar a 56px (máximo) |
| Sem internet | Biblioteca e repertórios mostram a última cópia; cifras e repertórios salvos ficam pendentes e sobem quando a internet volta |
| Servidor fora do ar (500) | Mensagem do servidor no status; nada é perdido no aparelho |
| Duas pessoas na mesma cifra ou no mesmo repertório | A segunda vira "(cópia)" |
| Cifra sem acordes reconhecidos | Mostra só a letra; tom "–" |
| Acorde desconhecido (ex.: `X7`) | A linha é tratada como letra |
| Tablatura larga | Rolagem horizontal só na linha da tablatura |
| Cifras da versão antiga | Aparecem como "só neste aparelho" com botão para enviar |

## 9. Movimento

| Elemento | Gatilho | Animação | Duração | Curva |
|---|---|---|---|---|
| Barra do modo culto | 2,5 s sem mexer o mouse (computador, ajuste ligado) | Some e desce 100% | 250 ms | padrão (`ease`) |
| Barra de progresso do áudio | Progresso | Largura | 150 ms | padrão |
| Card do desenho | Tocar no acorde | Borda e sombra `--hot` | 900 ms (troca de classe) | — |
| Rolagem automática | ▶ Rolar | `scrollBy` a cada quadro, velocidade 1–10 × 9 px/s | contínua | linear |

Com `prefers-reduced-motion: reduce`, as transições de barra e progresso são desligadas.

## 10. Acessibilidade

- **Ordem de foco:** abas → barra de ferramentas (Tom, Instrumento, Capo, Ajustes, Editar, Modo
  culto) → editor → folha. No modo culto: Sair → ‹ → › → Ajustar → tom → letra → rolar.
- **Foco visível:** contorno 2px `--chord`, afastado 2px.
- **Papéis e rótulos:** abas com `role="tab"`/`aria-selected`; botões de ícone com `aria-label`
  ("Meio tom acima", "Próxima música", "Posição anterior de G"…); botões de alternar com
  `aria-pressed`; **Ajustes** com `aria-expanded`.
- **Anúncios (`aria-live="polite"`):** status do editor, da biblioteca, dos repertórios e do áudio,
  e o tom atual.
- **Toque:** 44px de altura no celular; ‹ › dos desenhos com 36×32px (mínimo de 24px do WCAG 2.2 atendido).
- **Verificação:** axe-core, regras `wcag2a` + `wcag2aa`: 0 violações.

## 10b. Recursos da reformulação (inspirada na organização de apps de cifra pagos)

| Recurso | Comportamento |
|---|---|
| Busca (tela inicial) | Filtra nome, artista e letra sem acento; títulos que batem vêm primeiro; Enter abre o primeiro. Sem texto: Favoritas e Abertas recentemente |
| ★ Favoritar | Na cifra aberta; só neste aparelho. "▶ tocar todas" toca as favoritas como um repertório |
| + Repertório | Menu com os repertórios; adiciona a música **no tom que está na tela**. "Novo repertório com esta música" cria um com o nome da música. Já presente: desabilitado |
| Repertórios como pastas | Data opcional; novos começam sem data. Busca por nome do repertório ou das músicas. Pendentes (sem internet) marcados "só neste aparelho" |
| Arrastar | Alça ⠿ com mouse ou dedo (Pointer Events na página inteira, porque mover a linha solta a captura do ponteiro); salva sozinho |
| Seções em faixa | `.ln.sec` com fundo `--chord` e texto branco (escuro: fundo `--chord-soft`, texto `--chord`) |
| Palco | Fundo escuro por padrão (☾/☀ na barra muda, guardado no aparelho). Tocando repertório com 2+ músicas: setas ‹ › de 56px nas laterais e bolinhas no topo (tocar numa bolinha pula para a música). No computador somem junto com a barra |
| Imprimir / PDF | Cifra: a folha no tom da tela. Repertório: capa com a lista e o tom de cada música, depois uma música por página. Duas colunas, faixas das seções em azul claro. Usa `window.print()` (o navegador oferece "Salvar como PDF") |
| Modo escuro | Botão no menu (computador) e no canto da Busca (celular) |

## 11. Código

- `assets/app.js`: os nomes do arquivo inteiro são legíveis (`renderizar`, `abrirCifra`,
  `mostrarAba`, `estado`, `elemento`, `lerCifra`, `transporTom`, `posicoesViolao`…). Foram
  renomeados com o Babel, respeitando o escopo de cada variável. Parâmetros e variáveis locais
  dentro de funções antigas ainda são curtos (`e`, `t`, `n`): renomeie ao mexer na função.
- `assets/worker.js` (análise de áudio) continua com os nomes do protótipo.

## 12. Limites conhecidos

1. **Tela cheia no iPhone:** o Safari não deixa uma página entrar em tela cheia. Adicionado à Tela de
   Início, o app abre sem a barra do Safari; o app avisa como fazer.
2. **Barra no celular e tablet:** sem mouse, a barra fica sempre visível. Por isso a música ajustada
   termina acima dela.
