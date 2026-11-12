# Escala do Louvor — IEC Pombal

Ferramenta para montar, com antecedência, escalas **quinzenais ou mensais** do grupo de louvor: quem serve em cada
função e quais salmos, hinos e louvores são cantados em cada culto. A liturgia é organizada pelo pastor e não faz parte
da ferramenta.

No ar em **escalas.igrejacongregacionalpombal.com.br**. Lá, os dados ficam no servidor da igreja e aparecem iguais no
celular e no computador. Aberto direto do arquivo (`index.html`, sem instalar nada), o app guarda tudo só no próprio
aparelho. Em **Ajustes › Backup** dá para baixar uma cópia.

## Telas

| Tela | O que faz |
| --- | --- |
| **Início** | Visão geral com dados reais: próximo culto (equipe e repertório), escala vigente (cultos, integrantes, pendências), pendências com atalho para o culto, respostas de disponibilidade e repertório. Escalas já cumpridas não aparecem aqui. |
| **Escala** | A escala aberta (a em vigor ou a próxima), com setas para a anterior e a próxima, situação (rascunho ou confirmada) e um cartão por culto (equipe por função, com iniciais, e músicas em ordem). Qualquer pessoa monta ou altera: tocar numa pessoa ou música abre a lista de opções, com "Sortear outra", "Tirar esta vaga" e "Manter esta escolha"; **+ Pessoa** e **+ Música** acrescentam vagas. **Nova escala** pode ser sorteada ou criada **do zero** (só as vagas, para escolher à mão), e **Esvaziar para montar à mão** limpa uma escala já feita. As setas mudam a ordem das músicas. No celular, só o próximo culto vem aberto: os outros mostram um resumo (equipe 3/9, o que falta e as músicas) e abrem ao tocar; **Abrir todos / Resumir todos** troca de uma vez. Um número só, "a resolver", junta os conflitos e avisos; as vagas que esperam alguém marcar "posso" contam à parte, em cinza ("aguardando"). Nos três pontinhos de cada culto, **Copiar ou enviar só este dia** manda só aquele dia (o domingo vai com manhã e noite juntas). **Enviar no WhatsApp** mostra a prévia editável, avisa se há algo a definir e copia ou abre o WhatsApp. Na escala em andamento, os dias que já passaram saem da tela (e das pendências) e ficam no botão "N dias já cumpridos · ver". Quando o último dia de uma escala passa, ela vai para o **Arquivo** (botão no topo e na lista de escalas), onde continua aberta para consulta. |
| **Agenda** | Calendário do mês (ou lista) com os cultos de hoje em diante: com escala, solenes ou ainda sem escala; tocar num culto abre o cartão na escala. Abaixo, o pedido de disponibilidade, que acompanha a escala mais nova ainda não cumprida (sem escala: as próximas duas semanas; dá para escolher outro período à mão), quem respondeu numa grade pessoa × dia e o botão que gera (ou atualiza) a escala com as respostas. **Pedir no WhatsApp** copia o convite com o link; **Colar respostas** lê os códigos `#disp` de quem respondeu por mensagem. |
| **Músicas** | Repertório com busca e filtros com contagem (Salmos e Hinos, louvores, aptas ao solene, fora do rodízio) e filtro por **assunto do hinário** (tema e subtema, ex.: Jesus Cristo › Nascimento). Cada música tem etiquetas, link do YouTube, tom e quando foi e quando será cantada; os hinos da coletânea têm a **letra** (ícone de livro). **Importar** aceita texto colado do Word, Excel ou WhatsApp. **Compartilhar louvores** manda o link da lista só dos louvores (sem os Salmos e Hinos), com os tocados no último mês, em 2 ou em 3 meses marcados, ou a lista em texto para o WhatsApp. |
| **Louvores** | Fora do menu, no endereço `#louvores?dias=30` (ou 60, 90): a lista que se manda para quem não usa o app, sem os menus. Mostra cada louvor com autor, tom, link para ouvir e se foi tocado no período, com busca e filtros Tocados / Não tocados. O **+** de cada louvor põe a música num culto das escalas em aberto: o próximo fim de semana aparece primeiro, o domingo à noite recebe junto com a manhã, a música entra na vaga de louvor livre (ou numa vaga nova) e fica fixada; avisa se já está no culto ou se não segue a orientação do culto solene. |
| **Equipe** | Titulares por função (e onde falta titular) e um cartão por pessoa: funções, cultos em que serve, quantas vezes está na escala aberta e se já mandou a disponibilidade. |
| **Disponibilidade** | Qualquer pessoa escolhe o próprio nome e marca, no calendário, os dias que vêm: um toque = posso, dois = não posso, três = sem marcar. Fica no menu do computador e nos botões "Minha disponibilidade" do Início e da Agenda. |
| **Ajustes** | Fora do menu, no endereço `#ajustes`: cultos da semana, orientação pastoral, repetição, etiquetas, igreja e link, funções, aparência, backup e instalação do app. |

## Disponibilidade da equipe

No site, o app é aberto: quem tem o link vê e edita tudo, com todos os menus. O link do convite (com
`#disponibilidade`) abre direto a tela **Sua disponibilidade**: a pessoa escolhe o próprio nome, toca no calendário os
dias em que **pode** servir e envia.

- A resposta vai direto para o servidor e aparece na Agenda de quem estiver com o app aberto em até 20 segundos.
- Se o envio falhar (sem internet, por exemplo), a ferramenta mostra um texto com o código `#disp` para mandar pelo
  WhatsApp, e quem monta a escala usa **Colar respostas**.
- **A escala acompanha as respostas**: quando alguém marca ou muda a disponibilidade depois da escala montada, os
  cultos que ainda vão acontecer se ajustam sozinhos: sai quem agora não pode e as vagas vazias recebem quem marcou
  "posso". O que foi fixado à mão só muda se a própria pessoa marcar "não posso" depois; numa escala montada do zero,
  as vagas não se preenchem sozinhas. Quem estiver com o app aberto vê a mudança em até 20 segundos, sem recarregar.
- No sorteio só entra quem marcou **posso** naquele dia; quem marcou que não pode, deixou o dia sem marcar ou não
  respondeu fica de fora, e a vaga fica vazia se ninguém marcou. À mão dá para pôr qualquer pessoa, e a escala avisa
  quando ela não marcou que pode. A regra pode ser desligada em Ajustes › Escolha das músicas.

## Servidor

`servidor/api.php` guarda tudo num arquivo fora da pasta pública (`domains/<domínio>/escala-dados/banco.php`) e
`servidor/servidor.js` liga o app a ela. Como todos editam, o servidor guarda por dia uma cópia de como o banco estava
antes da primeira alteração (`escala-dados/backup-AAAA-MM-DD.php`, últimos 60 dias); além disso, **Ajustes › Backup**
baixa uma cópia. `servidor/semente.json` são os dados de partida, usados só enquanto o servidor
não tem dados. A publicação monta a pasta `escalas/` do site com `scripts/montar-escala.mjs`.
- No sorteio só entra quem marcou **posso** naquele dia; quem marcou que não pode, deixou o dia sem marcar ou não
  respondeu fica de fora, e a vaga fica vazia se ninguém marcou. À mão dá para pôr qualquer pessoa, e a escala avisa
  quando ela não marcou que pode. A regra pode ser desligada em Ajustes › Escolha das músicas.

## Regras da geração

- **Culto solene**: Salmos e Hinos precisam ter as etiquetas definidas (padrão: *trinitário*) e louvores, as deles
  (padrão: *cristocêntrico* e *doutrinário*). Se faltar música apta, o campo fica vazio e a escala mostra a pendência;
  a ferramenta não coloca uma música fora da orientação.
- Uma música não se repete antes do intervalo configurado (padrão: 3 semanas). Com repertório curto, ela repete a que
  foi cantada há mais tempo e mostra um alerta. Os cultos solenes escolhem as músicas primeiro.
- Quem serviu menos é escalado primeiro; a ferramenta evita a mesma pessoa em cultos seguidos e em duas funções no mesmo
  culto, e nunca escala ninguém em data marcada como indisponível.
- Quem só apoia numa função (ex.: bateria de apoio) só entra nela quando nenhum titular pode, e a escala avisa.
- **Domingo**: o culto das 18h repete a equipe e as músicas do culto das 9h e aparece no mesmo cartão. Nele só se muda
  a ordem das músicas (Ajustes › Cultos › "Mesma equipe e músicas de outro culto").
- O que foi escolhido à mão fica fixado e não muda ao sortear de novo. Excluir e sortear de novo podem ser desfeitos
  pelo aviso que aparece no rodapé.

## Design system

Tudo o que é visual sai dos **tokens** no começo de `index.html` (`:root`, com a versão escura logo abaixo). O
**Guia visual** do app (`#guia`) mostra os tokens e os componentes desenhados com o CSS de verdade, nos dois temas.

| Família | Tokens | Regra |
|---|---|---|
| Cores da marca | `--navy`, `--navy-2`, `--azul`, `--azul-forte`, `--azul-suave`, `--azul-linha`, `--dourado`, `--dourado-suave`, `--dourado-tinta` | Dourado é assinatura: item ativo, culto solene, marca. |
| Superfícies e texto | `--bg`, `--surface(-2/-3)`, `--line(-2)`, `--ink(-2)`, `--muted` | — |
| Estados | `--ok`, `--alerta`, `--erro`, `--espera` (cada um com `-suave`) | Vermelho/âmbar só para o que precisa de alguém; vaga aguardando é `--espera` (cinza). |
| Sobre cor | `--sobre-cor`, `--sobre-cor-suave`, `--ativo`, `--branco`, `--sobre-navy`, `--zap(-forte)`, `--lateral-*` | Texto em cima de fundo colorido; o tema escuro troca sozinho. |
| Paletas | `--funcao-<instrumento>(-tinta)`, `--avatar-1…6(-tinta)` | Instrumentos usam `data-funcao`; avatares, `data-cor`. |
| Tipografia | `--t-3xs` 10 · `--t-2xs` 11 · `--t-xs` 12 · `--t-sm` 13 · `--t-md` 15 · `--t-lg` 17 · `--t-xl` 20 · `--t-2xl` 24 · `--t-3xl` 28 · `--t-campo` 16 | Campos sempre `--t-campo` (o iPhone não dá zoom). |
| Espaçamento | `--e-1` 4 · `--e-2` 8 · `--e-3` 12 · `--e-4` 16 · `--e-5` 20 · `--e-6` 24 · `--e-8` 32; meios-passos `--e-05` 2 · `--e-15` 6 · `--e-25` 10 · `--e-35` 14 | Meios-passos só dentro de componentes pequenos. |
| Cantos | `--r-xs` 2 · `--r-sm` 8 · `--r-md` 12 · `--r-lg` 16 · `--r-xl` 20 · `--r-full` | Círculos com `50%`. |
| Sombras | `--sombra-1` cartão · `--sombra-2` destaque · `--sombra-3` painel e aviso | — |
| Toque | `--toque-sm` 40 · `--toque` 44 · `--toque-lg` 52 | 44 é o padrão; 40 só em listas densas e dentro de cartões. |
| Camadas | `--z-fixo` 30 · `--z-painel` 50 · `--z-aviso` 60 | — |
| Movimento | `--rapido`, `--curva` | Tudo respeita "reduzir movimento". |

**Componentes** (nomes em português, variante como segunda classe): `.btn` (`.primario`, `.tonal`, `.texto`,
`.perigo`, `.zap`; modificadores `.mini`, `.icone`, `.largo`), `.selo` (`.ok`, `.alerta`, `.erro`, `.neutro`, `.info`,
`.solene`, `.funcao-selo`), `.chip`, `.segmentado`, `.pessoa` (vaga: `data-nivel` = `erro`, `alerta` ou `espera`;
`.vazia`; `.leitura`), `.musica`, `.cartao`, `.culto` (`.resumido`), `.faixa` (`.alerta`, `.erro`, `.info`), `.campo`
(erro com `aria-invalid` + `.erro-campo`, via `erroNoCampo()` em `app.js`), `.interruptor`, `.estado-vazio`,
`.avatar`, `.instr`, painel (`painel()`) e aviso de rodapé (`avisar()`).

**Utilitários** para o layout que se repete, no lugar de `style` no código: `.pilha` (+ `.pilha-1/2/3/4/6`),
`.grade-campos`, `.linha-icone` (`.em-linha`), `.junto`, `.a-esquerda`, `.empurra`, `.cresce`, `.centro`,
`.encolhe`, `.recorte`, `.medida`, `.sem-recuo`, `.sem-recuo-topo`, `.sem-borda`, `.recuo-*`, `.selo-grande`,
`.texto-md/lg/xl`, `.texto-ok`, `.forte`. `style` no código fica só para valores calculados (por exemplo a largura
de uma barra de progresso) e casos únicos.

## Visual e usabilidade

- **Identidade**: a logomarca da Escala do Louvor (`marca/`), azul-marinho `#0B2345`, azul de ação `#1E5A96` e o dourado
  `#F5BE22` como assinatura (item ativo, culto solene, indicadores). Títulos em Plus Jakarta Sans e texto em Inter,
  as duas variáveis e servidas pelo próprio app (`fontes/`, licença OFL). Ícones Lucide. As cores, a tipografia, os
  espaçamentos, os raios e as sombras são tokens no começo de `index.html`, com versão escura.
- **Design system**: veja a seção abaixo e o **Guia visual** do app (`#guia`, link em Ajustes › Aparência).
- **Acessibilidade (WCAG 2.1 AA)**: contraste de pelo menos 4,5:1 em todo texto, nos dois temas (inclusive o
  cinza `--muted` e o verde do WhatsApp); link "Pular para o conteúdo"; foco visível em tudo; painéis com
  `role="dialog"`, foco preso dentro enquanto abertos, Esc fecha e o foco volta para onde estava; o calendário e as
  vagas dizem o estado em texto (não só pela cor); erros de formulário no próprio campo; avisos em região ao vivo;
  sem rolagem lateral até 320 px de largura, com texto a 200% ou com mais espaçamento entre letras e linhas; respeita
  "reduzir movimento". Verificado com o axe-core em todas as telas e painéis, nos temas claro e escuro.
- **Celular**: barra superior compacta com a marca e o estado do salvamento; barra inferior com Início, Escala,
  Agenda, Músicas e Equipe; edição em painéis que sobem da base; respeito às áreas seguras.
- **Computador** (a partir de 960 px): menu lateral azul-marinho, conteúdo em grade (painel inicial em três colunas,
  agenda com calendário e dia lado a lado, equipe em cartões).
- **Salvamento**: o indicador mostra Salvando, Salvo (só depois que o servidor confirma), Sem conexão ou Falha ao
  salvar. Sem internet no meio do uso, as alterações ficam no aparelho e vão quando a conexão volta; se o servidor
  não responde ao abrir, o app mostra a última cópia do aparelho só para leitura, para nada se perder.
- **App instalável (PWA)**: `manifest.webmanifest` e `sw.js` (só no site). A casca do app fica em cache por versão;
  os dados nunca vêm do cache. Quando sai uma versão nova, um aviso oferece **Atualizar**.
- "Desfazer" no lugar de perguntas de confirmação; alvos de toque de 44 px; foco visível; nomes acessíveis nos
  controles; estados que não dependem só da cor; respeito a "reduzir movimento".

## Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Página, tokens de design e estilos |
| `fontes/`, `marca/` | Fontes (Inter, Plus Jakarta Sans) e logomarca, favicon e ícones do app |
| `manifest.webmanifest`, `sw.js` | App instalável (o service worker só roda no site) |
| `app.js` | Interface e armazenamento |
| `engine.js` | Regras da escala e da disponibilidade (funções puras) |
| `dados-iniciais.js` | Repertório, equipe e cultos da igreja; regras padrão |
| `engine.test.js` | Testes: `node --test web/escala-louvor/engine.test.js` |

Dados salvos por versões anteriores (com liturgia e oficiais) são convertidos automaticamente ao abrir.

## De onde vieram os dados iniciais

- **Louvores**: "Repertório – Grupo de louvor IEC de Pombal/PB" (100 itens). Títulos repetidos viraram uma música só;
  quando o vídeo era outro, o segundo link ficou nas observações.
- **Coletânea da igreja**: os 100 hinos da "Coletânea de Hinos dos Salmos e Hinos" (IEC de João Pessoa), com número,
  título e letra (`letras-sh.js`, carregado só quando alguém abre a tela de músicas ou uma letra). Entram sem
  etiquetas: "trinitário" (que libera o hino para o culto solene) fica para o pastor marcar. O tema e o subtema de cada hino
  saem do número, pelo **Índice de Assuntos** do hinário (`TEMAS_HINARIO` em `engine.js`); os números entre parênteses
  no índice (hinos de outras seções indicados para aquele assunto) também entram no filtro.
- **Salmos e Hinos**: a seção "Trindade" do hinário (nº 29 Invocação, 30 Vem, ó Todo-Poderoso!, 31 Adoração à Trindade,
  32 Aleluia ao Deus triúno, 33 Invocação e Louvor, 34 Santíssima Trindade, 35 Glória à Trindade), 228 Louvor à Trindade
  e 245 Culto à Trindade, conforme o índice do [hinologia.org](http://www.hinologia.org/salmos-e-hinos-sh/); mais o
  247 "Santo! Santo! Santo!" (do modelo de liturgia) e o 232 "Ao Deus de Abraão" (número e título conferidos na coletânea). O 29 foi cantado em
  18/10/2026.
- **Quantidade de músicas por culto**: dos "Modelos de liturgia IEC Pombal" (domingo: 1 de Salmos e Hinos e 3
  louvores; oração e doutrina: 2 e 2).
- **Cultos**: domingo 9h (culto matinal e EBD) e 18h (culto solene), terça 19h30 (oração) e quinta 19h30 (doutrina
  ou estudo bíblico). Os dois de domingo são solenes. A equipe de cada culto é uma sugestão inicial.
- **Equipe**: lista do ministério de louvor (out/2026).
- **Etiquetas**: primeira sugestão, para revisar com o pastor (filtro "Aptas ao solene").
