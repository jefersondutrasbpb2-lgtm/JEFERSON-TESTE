# Design System — Método MAR (Moisés Ramos)

> Extraído por engenharia reversa da LP atual (moisesramos.me). Esta é a base visual que vamos usar para reconstruir a página do zero quando a copy chegar.

## 1. Conceito de Marca

Estética "autoridade + evento premium presencial": paleta náutica (azul-marinho profundo + dourado), alto contraste, seções pretas alternando com seções claras para dar ritmo de leitura, prova social em vídeo pesada, CTA verde vibrante destoando de propósito (ação/dinheiro) do resto da paleta fria/quente.

Tom visual: sério, corporativo-premium, mas com energia de lançamento (contador regressivo, urgência, selos de pagamento). Não é "SaaS clean" — é direct-response de evento high-ticket.

## 2. Paleta de Cores (tokens)

| Token | Hex | Uso |
|---|---|---|
| `--color-navy-950` | `#07080A` | Fundo hero, seções pretas |
| `--color-navy-900` | `#0B1324` | Fundo seção "Como funciona o método", cards escuros |
| `--color-black` | `#000000` / `#1C1C1C` | Fundo seção VSL, blocos alternados |
| `--color-blue-primary` | `#0E46A3` | Cards de benefício ("Diagnóstico...", "Alcance..."), botão "Garantir o meu lugar" no topbar |
| `--color-blue-primary-dark` | `#0C4391` | Variante hover/borda |
| `--color-gold-500` | `#D4AF37` | Topbar, bordas dos cards, destaques de texto, título "Método MAR" nas seções escuras |
| `--color-gold-600` | `#C9A227` | Cards "Quem deve participar" (fundo dourado sólido) |
| `--color-green-cta` | `#26B70B` | Botão CTA principal ("Quero participar com meu sócio") — cor exclusiva de conversão |
| `--color-red-alert` | `#F93332` | Banner de aviso/urgência |
| `--color-gray-100` | `#ECECEC` | Fundo de seções claras (texto institucional) |
| `--color-white` | `#FFFFFF` | Texto sobre fundo escuro |
| `--color-ink` | `#0B1220` | Texto sobre fundo claro (quase preto-azulado, não preto puro) |

**Regra de uso:** verde é **só** para o CTA de conversão — nunca usar em outro elemento, pra manter o contraste de "ação". Dourado é o acento de marca/luxo. Azul-marinho é a base estrutural. Vermelho só aparece 1x, no bloco de urgência/aviso.

## 3. Tipografia

- **Headlines / display:** sans-serif geométrica arredondada, peso Bold/ExtraBold (visual tipo **Baloo 2** ou **Fredoka SemiBold** — terminais bem arredondados, alto impacto). Usada em H1, H2 de seção e no logotipo "MÉTODO MAR".
- **Corpo de texto:** sans-serif humanista neutra (tipo **Inter**, **Nunito Sans** ou **Open Sans**), regular/medium, boa legibilidade em blocos longos.
- **Números (contador regressivo):** mesma família de display, em caixa alta com tracking levemente aberto.

Recomendação para produção web (Google Fonts, licença livre, visual muito próximo do original):
```css
--font-display: 'Baloo 2', 'Fredoka', sans-serif; /* headlines */
--font-body: 'Inter', 'Nunito Sans', sans-serif;   /* parágrafos, labels */
```

## 4. Escala tipográfica (sugerida, mobile-first)

| Nível | Tamanho (mobile / desktop) | Peso |
|---|---|---|
| H1 (hero) | 32px / 56px | 800 |
| H2 (seção) | 26px / 40px | 800 |
| H3 (card/subtítulo) | 18px / 22px | 700 |
| Body | 16px / 18px | 400–500 |
| Small/legal | 12px / 13px | 400 |

## 5. Componentes identificados

1. **Topbar de urgência (sticky)** — fundo dourado, contador regressivo (dias/horas/min/seg em caixas azul-marinho), data, local, vagas limitadas, botão azul "GARANTIR O MEU LUGAR".
2. **Hero** — fundo com foto do palestrante em navy escuro, headline grande em branco + destaque dourado, subheadline, bullet de oferta ("Garanta 1 ingresso e ganhe 2 lugares"), CTA verde grande, selos de pagamento (Visa/Master/Pix/etc).
3. **Banner de aviso** — fullwidth vermelho, ícone de alerta, texto centralizado com trecho em negrito.
4. **Bloco VSL** — fundo preto, player de vídeo com thumbnail + "Aperte o play", CTA verde abaixo + selos.
5. **Cards de benefício (azul)** — fundo azul-marinho sólido, ícone check dourado no canto superior, sombra dourada offset (efeito 3D/neobrutalista leve), texto branco.
6. **Cards dourados (persona)** — fundo dourado sólido, ícone circular navy, texto navy.
7. **Timeline de programação** — linha horizontal com nós circulares dourados, labels de horário acima/abaixo alternando.
8. **Grid de depoimentos em vídeo** — thumbnails 4 colunas, overlay play vermelho estilo YouTube, legenda com citação curta.
9. **Bloco de oferta física (apostila)** — imagem do produto físico + citação em destaque num card azul.
10. **Card de preço "Ingresso Duplo"** — header dourado, corpo navy-escuro quase preto, lista de bullets com check, formulário inline (nome + telefone + checkbox consentimento), CTA verde.
11. **Bloco de autoridade** — foto do mentor + bio, fundo preto.
12. **FAQ (accordion)** — primeira pergunta aberta (fundo azul), demais fechadas (fundo dourado), ícone +/−.
13. **Footer** — fundo azul-marinho, logo "Âncora X", copyright, disclaimer legal em texto pequeno.

## 6. Padrões de layout

- Alternância rítmica de fundo: **claro → escuro → claro → escuro** a cada seção, pra criar blocos visuais nítidos no scroll.
- CTA verde repetido no fim de quase toda seção (ancoragem de conversão constante).
- Selos de pagamento sempre logo abaixo do CTA.
- Cards sempre com leve rotação/sombra offset dourada — dá um toque "adesivo/carimbo", não é flat puro.
- Border-radius generoso (~12–16px) em botões e cards; botões CTA em pill/rounded-xl.

## 7. Próximo passo

Aguardando o documento de copy para reconstruir a página do zero em cima deste design system (HTML/CSS semântico + JS, mobile-first, performático, mantendo a identidade visual acima mas sem herdar os problemas técnicos da página atual).
