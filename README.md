# Igreja Evangélica Congregacional de Pombal — website institucional

Site institucional multipágina da **Igreja Evangélica Congregacional de Pombal (PB)**, fundada em 13 de dezembro de 1970.

Conceito criativo: **"Uma história de fé, Palavra e serviço."** Uma experiência editorial e contemplativa que conecta
passado, presente e missão: tipografia clássica, fotografia documental, mapas vetoriais e animações narrativas discretas.

> **Status: versão em revisão.** Vários dados (endereço, horários, contatos, situação dos campos missionários etc.)
> aguardam confirmação da liderança. Veja **[CONTENT-REVIEW.md](./CONTENT-REVIEW.md)** antes de publicar.

---

## Páginas

| Rota | Conteúdo |
| --- | --- |
| `/` | Homepage narrativa em 10 seções: abertura, essência, 1970, linha do tempo, mapa missionário, O Bom Samaritano, mensagens, comunidade, cultos e visita |
| `/nossa-historia/` | Scrollytelling em 6 capítulos, registros fundadores, pastores, linha do tempo e chamada para o acervo histórico |
| `/quem-somos/` | Missão, as cinco solas, convicções e a tradição congregacional |
| `/ministerios/` | Áreas da vida da igreja |
| `/missoes/` | Mapa interativo, igrejas organizadas, congregação, comunidades rurais, campos missionários e O Bom Samaritano |
| `/mensagens/` | Biblioteca de pregações com busca e filtros (série, pregador) e player do YouTube sob demanda |
| `/agenda/` | Programação semanal e eventos |
| `/visite/` | Planeje sua visita: horários, passo a passo, perguntas frequentes e mapa |
| `/contato/` | Canais oficiais, formulário de contato, pedido de oração confidencial e política de privacidade |

## Stack

- **Next.js 16** (App Router) com exportação estática (`output: "export"`) — gera HTML puro em `out/`
- **TypeScript** e **CSS moderno** com design tokens (sem framework CSS)
- **GSAP 3** + **ScrollTrigger**, **SplitText** e **DrawSVG**
- **Lenis** para rolagem suave, sincronizada ao ticker do GSAP
- Fontes auto-hospedadas via Fontsource: **Cormorant Garamond** (títulos) e **Manrope** (texto)
- Mapas gerados a partir dos limites estaduais do IBGE (`scripts/build-geo.mjs` com `d3-geo`)

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # gera o site estático em out/
npm run typecheck
```

O conteúdo de `out/` pode ser hospedado em qualquer serviço estático (Vercel, Netlify, Cloudflare Pages, GitHub Pages,
hospedagem tradicional).

### Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Domínio oficial (canonical, Open Graph, sitemap) |
| `NEXT_PUBLIC_BASE_PATH` | Subdiretório, se houver (ex.: `/site` no GitHub Pages) |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | Endpoint que recebe o formulário de contato (POST JSON) |
| `NEXT_PUBLIC_PRAYER_ENDPOINT` | Endpoint que recebe os pedidos de oração (POST JSON) |

Os formulários funcionam com serviços como Formspree ou Getform, ou com um endpoint próprio. Sem endpoint configurado,
o formulário valida os dados e oferece o envio por e-mail com o texto já preenchido.

## Atualizando o conteúdo

Todo o conteúdo editável fica em `src/content/` — não é preciso mexer nos componentes.

| Arquivo | O que contém |
| --- | --- |
| `site.ts` | Nome, endereço, telefone, e-mail, redes sociais, menu e o interruptor `reviewMode` |
| `historia.ts` | Fundação, primeiro Conselho, primeira diretoria, pastores e marcos da linha do tempo |
| `fe.ts` | Textos bíblicos, cinco solas, convicções e nota sobre a tradição congregacional |
| `ministerios.ts` | Áreas e ministérios (com campos opcionais de coordenação e horário) |
| `missoes.ts` | Campos missionários e o projeto O Bom Samaritano |
| `agenda.json` | Programação semanal e eventos |
| `mensagens.json` | Biblioteca de mensagens (título, data, pregador, referência, série, `youtubeId`) |
| `media.ts` | Registro das fotografias do site |

Os arquivos JSON têm formato simples e podem ser conectados a um CMS headless (Decap CMS, Sanity, Strapi etc.) sem
alterar os componentes.

### Fotografias

1. Coloque as imagens em `public/images/` (preferencialmente **WebP ou AVIF**, até ~2400 px no maior lado).
2. Preencha a entrada correspondente em `src/content/media.ts` com `src`, `alt`, `width` e `height` (opcionalmente
   `variants` com versões menores, para carregamento responsivo).

Enquanto uma imagem não existir, o site mostra um espaço reservado descrevendo a fotografia esperada. **Não use imagens
geradas por IA como se fossem registros reais da igreja.** Fotos de crianças exigem autorização dos responsáveis (LGPD).

### Identidade visual

O logotipo oficial está em `public/brand/` (versão azul para fundos claros e versão branca para fundos escuros) e é
exibido por `src/components/layout/BrandLogo.tsx`, que escolhe a versão conforme o tom da seção. O ícone do site
(`src/app/icon.png` e `apple-icon.png`) usa o símbolo da cruz e do sol. A paleta deriva das cores oficiais: o azul
`#195691` é o destaque sobre fundos claros e um dourado solar, derivado do amarelo `#FFCC00`, é usado sobre fundos
escuros.

### Modo de revisão

Com `reviewMode = true` (em `src/content/site.ts`), o site exibe um aviso discreto, marca os itens pendentes com o selo
**"a confirmar"** e mostra conteúdos de exemplo (mensagens e eventos marcados com `example: true`) para visualizar o
layout. Depois de validar tudo, remova os `pending: true` confirmados e mude para `reviewMode = false`: selos, aviso e
exemplos deixam de aparecer.

## Arquitetura de movimento

- As páginas são **HTML estático completo**. As animações são uma camada de aprimoramento declarada por atributos
  `data-*` (`data-reveal`, `data-split`, `data-mask`, `data-parallax`, `data-draw`, `data-progress`, `data-story`…) e
  orquestradas por `src/components/motion/MotionDirector.tsx`, recriado a cada navegação em `app/template.tsx`.
- `SmoothScroll.tsx` cria uma única instância do Lenis e a acopla ao `gsap.ticker`, com `ScrollTrigger.update` no evento
  de rolagem — sem rolagem duplicada. Âncoras internas e troca de página são tratadas pelo Lenis.
- Um script síncrono no `<head>` adiciona as classes `js`/`motion` antes da primeira pintura; um *failsafe* em CSS
  revela todo o conteúdo se o JavaScript não carregar.
- Com **`prefers-reduced-motion`**, o Lenis e as animações não são iniciados e todo o conteúdo fica visível.
- Animações usam `transform`, `opacity` e `clip-path`; `ScrollTrigger.refresh()` é chamado quando fontes, imagens ou a
  altura da página mudam.

## Acessibilidade e desempenho

- HTML semântico, link "Pular para o conteúdo", navegação completa por teclado, menu com *focus trap* e tecla Esc,
  abas do mapa com setas, estados de foco visíveis e contraste AA (auditado com axe-core em todas as páginas).
- Formulários com rótulos, mensagens de erro associadas (`aria-describedby`), foco no primeiro campo inválido,
  honeypot e checagem de tempo contra spam.
- Google Maps e YouTube só carregam após clique (privacidade e Core Web Vitals).
- Fontes auto-hospedadas, imagens com dimensões fixas (`aspect-ratio`) e `loading="lazy"`, sem dependências supérfluas.
- Metadados por página, Open Graph, `sitemap.xml`, `robots.txt` e dados estruturados (`schema.org/Church`).

## Mapas

`src/content/geo.generated.ts` é gerado por `scripts/build-geo.mjs` a partir de um GeoJSON dos estados brasileiros
(base IBGE, via `codeforamerica/click_that_hood`). Para regenerar:

```bash
curl -o /tmp/brazil-states.geojson https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson
npm run geo -- /tmp/brazil-states.geojson
```

As posições dos campos são aproximadas e identificadas como ilustrativas no site.

## Outros conteúdos do repositório

`tools/` e `web/nam-gain/` contêm uma ferramenta independente (NAM Gain) e não fazem parte do site da igreja.
