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
| **Início** | Visão geral com dados reais: próximo culto (equipe e repertório), escala vigente (cultos, integrantes, pendências), pendências com atalho para o culto, respostas de disponibilidade e repertório. |
| **Escala** | A escala aberta, com setas para a anterior e a próxima, situação (rascunho ou confirmada) e um cartão por culto (equipe por função, com iniciais, e músicas em ordem). Qualquer pessoa monta ou altera: tocar numa pessoa ou música abre a lista de opções, com "Sortear outra", "Tirar esta vaga" e "Manter esta escolha"; **+ Pessoa** e **+ Música** acrescentam vagas. **Nova escala** pode ser sorteada ou criada **do zero** (só as vagas, para escolher à mão), e **Esvaziar para montar à mão** limpa uma escala já feita. As setas mudam a ordem das músicas. **Enviar no WhatsApp** mostra a prévia editável, avisa se há algo a definir e copia ou abre o WhatsApp. |
| **Agenda** | Calendário do mês (ou lista) com os cultos de cada dia: com escala, solenes ou ainda sem escala; tocar num culto abre o cartão na escala. Abaixo, o pedido de disponibilidade (padrão: as próximas duas semanas), quem respondeu numa grade pessoa × dia e o botão que gera (ou atualiza) a escala com as respostas. **Pedir no WhatsApp** copia o convite com o link; **Colar respostas** lê os códigos `#disp` de quem respondeu por mensagem. |
| **Músicas** | Repertório com busca e filtros com contagem (Salmos e Hinos, louvores, aptas ao solene, fora do rodízio). Cada música tem etiquetas, link do YouTube, tom e quando foi e quando será cantada. **Importar** aceita texto colado do Word, Excel ou WhatsApp. |
| **Equipe** | Titulares por função (e onde falta titular) e um cartão por pessoa: funções, cultos em que serve, quantas vezes está na escala aberta e se já mandou a disponibilidade. |
| **Disponibilidade** | Qualquer pessoa escolhe o próprio nome e marca, no calendário, os dias em que pode (toque de novo desmarca). Fica no menu do computador e nos botões "Minha disponibilidade" do Início e da Agenda. |
| **Ajustes** | Fora do menu, no endereço `#ajustes`: cultos da semana, orientação pastoral, repetição, etiquetas, igreja e link, funções, aparência, backup e instalação do app. |

## Disponibilidade da equipe

No site, o app é aberto: quem tem o link vê e edita tudo, com todos os menus. O link do convite (com
`#disponibilidade`) abre direto a tela **Sua disponibilidade**: a pessoa escolhe o próprio nome, toca no calendário os
dias em que **pode** servir e envia.

- A resposta vai direto para o servidor e aparece na Agenda de quem estiver com o app aberto em até 20 segundos.
- Se o envio falhar (sem internet, por exemplo), a ferramenta mostra um texto com o código `#disp` para mandar pelo
  WhatsApp, e quem monta a escala usa **Colar respostas**.
- Na geração, quem marcou que não pode fica de fora; quem confirmou vem antes de quem não respondeu. Em Ajustes ›
  Escolha das músicas dá para escalar **só** quem respondeu.

## Servidor

`servidor/api.php` guarda tudo num arquivo fora da pasta pública (`domains/<domínio>/escala-dados/banco.php`) e
`servidor/servidor.js` liga o app a ela. Como todos editam, o servidor guarda por dia uma cópia de como o banco estava
antes da primeira alteração (`escala-dados/backup-AAAA-MM-DD.php`, últimos 60 dias); além disso, **Ajustes › Backup**
baixa uma cópia. `servidor/semente.json` são os dados de partida, usados só enquanto o servidor
não tem dados. A publicação monta a pasta `escalas/` do site com `scripts/montar-escala.mjs`.
- Na geração, quem marcou que não pode fica de fora; quem confirmou vem antes de quem não respondeu. Em Ajustes ›
  Escolha das músicas dá para escalar **só** quem respondeu.

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

## Visual e usabilidade

- **Identidade**: a logomarca da Escala do Louvor (`marca/`), azul-marinho `#0B2345`, azul de ação `#1E5A96` e o dourado
  `#F5BE22` como assinatura (item ativo, culto solene, indicadores). Títulos em Plus Jakarta Sans e texto em Inter,
  as duas variáveis e servidas pelo próprio app (`fontes/`, licença OFL). Ícones Lucide. As cores, a tipografia, os
  espaçamentos, os raios e as sombras são tokens no começo de `index.html`, com versão escura.
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
- **Salmos e Hinos**: a seção "Trindade" do hinário (nº 29 Invocação, 30 Vem, ó Todo-Poderoso!, 31 Adoração à Trindade,
  32 Aleluia ao Deus triúno, 33 Invocação e Louvor, 34 Santíssima Trindade, 35 Glória à Trindade), 228 Louvor à Trindade
  e 245 Culto à Trindade, conforme o índice do [hinologia.org](http://www.hinologia.org/salmos-e-hinos-sh/); mais o
  247 (do modelo de liturgia; título a confirmar) e "Ao Deus de Abraão" (número a confirmar). O 29 foi cantado em
  18/10/2026.
- **Quantidade de músicas por culto**: dos "Modelos de liturgia IEC Pombal" (domingo: 1 de Salmos e Hinos e 3
  louvores; oração e doutrina: 2 e 2).
- **Cultos**: domingo 9h (culto matinal e EBD) e 18h (culto solene), terça 19h30 (oração) e quinta 19h30 (doutrina
  ou estudo bíblico). Os dois de domingo são solenes. A equipe de cada culto é uma sugestão inicial.
- **Equipe**: lista do ministério de louvor (out/2026).
- **Etiquetas**: primeira sugestão, para revisar com o pastor (filtro "Aptas ao solene").
