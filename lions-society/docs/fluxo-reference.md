# Referência estrutural: página do Fluxo

Fonte: print de página inteira (PDF) enviado pelo usuário, capturado com FireShot em
2026-09-19, de `https://vendatodosantodia.com.br/fluxo`. O acesso direto (Playwright/WebFetch)
a esse domínio está bloqueado pela política de rede deste ambiente (proxy responde 403), então
a análise abaixo foi feita sobre o print, não sobre estilos computados ao vivo.

O print original está em `docs/fluxo/fluxo-print-completo.png`.

**Uso desta referência:** só estrutura, ritmo e padrão de componentes. Nenhum texto, imagem,
logo, ícone ou cor de marca do Fluxo entra no projeto — a identidade visual é 100% da Lions
Society (dourado sobre quase preto, tokens do protótipo `reference/lions-society-aplicacao.html`).

## Ordem e ritmo das seções

1. **Hero**: cartão escuro de cantos arredondados (não full-bleed — a página base é clara),
   manchete grande em duas linhas com a última expressão em destaque de cor, submanchete curta,
   um único botão de ação, foto do mentor + multidão ao lado.
2. **"A mentoria é para"**: título centralizado grande, grade 2×2 (desktop) de linhas curtas,
   cada uma com um ícone de seta diagonal à esquerda — exatamente o padrão de lista que o prompt
   já pede para "pra quem é".
3. Parágrafo-ponte curto ("clique no botão abaixo e agende...") imediatamente antes do CTA —
   esse padrão de "uma linha antes do botão explicando o que acontece depois do clique" se repete
   várias vezes ao longo da página, sempre com o mesmo botão.
4. **"Como organizamos"**: outro cartão escuro, título, subtítulo, grade de 6 blocos (3 colunas ×
   2 linhas no desktop) cada um com ícone circular colorido, título em negrito e texto curto —
   padrão de "blocos de entrega em sequência com ícone".
5. **Prova / resultados**: grade de cards de depoimento (4 colunas no desktop), cada card = foto
   quadrada com nome sobreposto no topo, ícone de play central (indica vídeo) e uma manchete de
   resultado curta abaixo da foto (ex.: número + prazo). Muitas fileiras seguidas — mural denso.
6. **Teaser de material bônus**: um único botão secundário, em cor propositalmente diferente do
   CTA principal (nunca a mesma cor), com um texto curto de bridge acima — nunca compete com o
   CTA principal em tamanho ou destaque.
7. **Linha do tempo por fases**: cartões empilhados verticalmente, cada um com um "selo de fase"
   colorido (cor muda por fase, cria uma linha vertical contínua ligando os selos) e a frase do
   marco que aquela fase entrega. Corresponde ao pedido de "linha do tempo por fases, cada fase
   com o marco que a pessoa entrega ao fim".
8. **Bloco de assinatura/citação**: cartão escuro isolado, frase curta atribuída a uma pessoa de
   autoridade, texto pequeno de contexto ao lado, CTA ao lado (desktop) — funciona como pausa de
   autoridade antes de seguir para a seção de perfil/filtro.
9. **"Pra quem indicamos"**: nuvem de chips/pílulas com muitos nichos, texto curto de abertura,
   CTA.
10. **Autoridade**: título + subtítulo, depois cards de perfil alternando lado da foto (foto
    esquerda/texto direita, depois invertido), foto em bloco colorido, nome em barra de destaque.
11. **FAQ**: título, lista de perguntas ao fundo desfocada/desabilitada, com um cartão sobreposto
    dizendo que a seção foi desativada e direcionando para agendar uma conversa — deliberadamente
    reforça o CTA em vez de responder objeções no texto.
12. **Rodapé**: mínimo, copyright + 2 links legais, fundo escuro.

## Padrões adotados na Lions Society (adaptados aos tokens dela)

- CTA sempre com o mesmo estilo/cor em toda a página (dourado, `--gold`), nunca mudando de cor
  entre seções — já é assim no protótipo.
- Uma linha curta de bridge antes do botão nas seções 6, 8 e 9 (conforme o `copy-final`).
- Lista "pra quem é" com seta diagonal (já implementada no protótipo com `#i-arrow`/ícone check).
- Blocos de entrega com ícone + título + texto curto em sequência (seções 5, 6 e 7 do protótipo).
- Grade de resultados com foto/vídeo + nome + manchete de resultado com prazo (mural, seção 8b).
- Linha do tempo por fases com marco entregue ao fim de cada uma (seção 5, "O que muda no seu
  ano").
- Teaser de material de prova com um único botão secundário, em peso visual menor que o CTA
  principal (seção 8c, "livro de resultados").
- Frase de assinatura do mentor antes do título de fechamento (seção 13).

## O que NÃO foi trazido do Fluxo

- Cor de marca (lima/roxo/preto do Fluxo) — a Lions Society usa só os tokens do protótipo
  (dourado `#e2c24f` sobre `#0e0d0b`/`#171511`, claro `#f2f2f2`).
- FAQ "desativado" — a Lions Society mantém a sanfona de FAQ funcional e respondendo objeções na
  própria página, conforme travas do prompt.
- Estrutura de "página clara com cartões escuros flutuando" — a Lions Society mantém a alternância
  de seções inteiras escuro/claro já testada no protótipo, que é a fonte da verdade de layout.
- Qualquer texto, nome, foto, ícone ou logo do Fluxo.
