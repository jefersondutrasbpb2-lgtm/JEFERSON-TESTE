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
| **Escala** | Mostra a escala aberta, um cartão por culto (equipe e músicas em ordem). Tocar numa pessoa ou música abre a lista de opções, com "Sortear outra" e "Manter esta escolha". As setas mudam a ordem das músicas. **Enviar no WhatsApp** copia a escala formatada. |
| **Agenda** | Pedido de disponibilidade (padrão: as próximas duas semanas). Mostra quem já respondeu, numa grade pessoa × dia, e gera (ou atualiza) a escala do período com as respostas. **Pedir no WhatsApp** copia o convite com o link; **Colar respostas** lê os códigos `#disp` de quem respondeu por mensagem. |
| **Músicas** | Repertório com busca e filtros (Salmos e Hinos, louvores, aptas ao solene). Cada música tem etiquetas, link do YouTube, tom e a última vez que foi cantada. **Importar** aceita texto colado do Word, Excel ou WhatsApp. |
| **Equipe** | Quem faz o quê (titular ou só apoio), em quais cultos serve e as datas em que não pode. |
| **Ajustes** | Cultos da semana (dia, hora, equipe, quantas músicas, se é solene), orientação pastoral, funções, etiquetas e backup. |

## Disponibilidade da equipe

Quem abre o link (com ou sem `#disponibilidade`) e não entrou como coordenador vê só a tela **Sua
disponibilidade**: escolhe o próprio nome, toca no calendário os dias em que **pode** servir e envia.

- A resposta vai direto para o servidor e aparece na Agenda do coordenador em até 20 segundos. A equipe só consegue
  gravar a própria disponibilidade; equipe, músicas e escalas só o coordenador muda.
- Se o envio falhar (sem internet, por exemplo), a ferramenta mostra um texto com o código `#disp` para mandar pelo
  WhatsApp, e o coordenador usa **Colar respostas**.

## Coordenador

Na tela de disponibilidade, **Sou o coordenador** pede a senha. Ela é o secret `ESCALA_SENHA` do GitHub (Settings ›
Secrets and variables › Actions); a publicação guarda no servidor só a senha cifrada. Para trocar, altere o secret e
publique de novo. A sessão dura 30 dias no aparelho; **Ajustes › Sair do modo coordenador** encerra antes.

## Servidor

`servidor/api.php` guarda tudo num arquivo fora da pasta pública (`domains/<domínio>/escala-dados/banco.php`) e
`servidor/servidor.js` liga o app a ela. `servidor/semente.json` são os dados de partida, usados só enquanto o servidor
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

## Usabilidade

A interface segue diretrizes atuais de usabilidade: barra de navegação inferior com quatro destinos no celular e abas
no topo no computador; edição em painéis que sobem da base (modais centralizados em telas grandes); "Desfazer" no lugar
de perguntas de confirmação; alvos de toque de pelo menos 44 px; telas que mostram primeiro uma lista simples e os
detalhes só ao tocar; contraste e foco visíveis, modo escuro automático e respeito a "reduzir movimento".

## Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Página e estilos |
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
