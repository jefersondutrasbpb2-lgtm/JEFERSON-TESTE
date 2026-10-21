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
- Fontes auto-hospedadas via Fontsource: **Bricolage Grotesque** (títulos e destaques) e **Manrope** (texto)
- Mapas gerados a partir dos limites estaduais do IBGE (`scripts/build-geo.mjs` com `d3-geo`)

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # gera o site estático em out/
npm run typecheck
```

Para gerar uma prévia com páginas planas e caminhos relativos (útil para visualizar o site fora do domínio
definitivo), use `npm run preview:build`; a saída fica em `preview/`.

O conteúdo de `out/` pode ser hospedado em qualquer serviço estático (Vercel, Netlify, Cloudflare Pages, GitHub Pages,
hospedagem tradicional).

### Publicação na Hostinger (automática)

O workflow `.github/workflows/publicar-hostinger.yml` monta o site e envia a pasta `out/` por FTP para a Hostinger a
cada envio para o branch principal (`claude/church-website-design-akEr2`). Também dá para rodar à mão em
**Actions › Publicar site na Hostinger › Run workflow**. Só os arquivos que mudaram são enviados.

Configuração (uma vez):

1. No hPanel da Hostinger, em **Arquivos › Contas FTP**, veja o servidor (IP ou `ftp.seudominio`), o usuário e a
   senha da conta FTP.
2. No GitHub, em **Settings › Secrets and variables › Actions › Secrets**, crie `FTP_SERVER`, `FTP_USERNAME` e
   `FTP_PASSWORD`.
3. Opcional, na aba **Variables** da mesma página:
   - `FTP_PASTA`: pasta do site no servidor. Sem ela, a publicação usa `/domains/<domínio>/public_html/` quando essa
     pasta abre (padrão da Hostinger; a conta FTP não a mostra na listagem) e, se não, `public_html/`. Use `./` se a conta FTP já abrir dentro da pasta do
     site;
   - `FTP_PROTOCOLO`: `ftps` (padrão, com criptografia) ou `ftp`, se a conexão criptografada falhar;
   - `SITE_URL`: endereço oficial (padrão `https://www.igrejacongregacionalpombal.com.br`);
   - `CONTACT_ENDPOINT` e `PRAYER_ENDPOINT`: endereços que recebem os formulários.
4. Se já houver outro site na pasta `public_html`, faça um backup e retire os arquivos antigos antes da primeira
   publicação. A publicação retira o `default.php` ("Página padrão") que a Hostinger cria; o arquivo
   `public/.htaccess` faz o `index.html` ter prioridade e usa a página 404 do site.
5. No hPanel, ative o SSL gratuito do domínio e a opção **Forçar HTTPS**.

### Endereço da Escala do Louvor

A escala roda no próprio servidor: `escalas.igrejacongregacionalpombal.com.br` (subdomínio criado no hPanel com a
pasta `public_html/escalas`) e `www.igrejacongregacionalpombal.com.br/escalas`; `/escala` redireciona para o
subdomínio. Depois do `next build`, `scripts/montar-escala.mjs` monta `out/escalas/` com o app de `web/escala-louvor/`
e a API em PHP. O app é aberto: quem tem o link edita tudo (veja `web/escala-louvor/README.md`).

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

### Feed do Instagram (O Bom Samaritano)

A página de Missões tem um carrossel com as publicações de **@obom.samaritano**. As publicações são baixadas no
momento do build (`npm run instagram`, que também roda antes de `npm run build`) e as imagens ficam hospedadas no
próprio site — o visitante não carrega nada do Instagram.

O Instagram não permite ler publicações apenas pelo @: a conta precisa autorizar o acesso uma vez. Há dois caminhos:

1. **Behold (mais simples, plano gratuito):** crie uma conta em behold.so, conecte o Instagram @obom.samaritano,
   crie um feed do tipo JSON e copie a URL (`https://feeds.behold.so/...`) para a variável
   `IG_FEED_BOM_SAMARITANO`.
2. **API oficial da Meta:** crie um app em developers.facebook.com com o produto "Instagram API with Instagram Login",
   gere um token de longa duração para a conta e coloque em `IG_TOKEN_BOM_SAMARITANO` (o token expira em 60 dias e
   precisa ser renovado).

Enquanto nenhuma das variáveis estiver configurada, o carrossel mostra as fotos do projeto e um link para o perfil.
As publicações se atualizam a cada novo build do site; na hospedagem, configure um build agendado (por exemplo,
diário) para manter o carrossel em dia. Para incluir outro perfil, acrescente-o em `FEEDS` no script e registre o
arquivo JSON em `src/content/instagram.ts`.

### Identidade visual

O logotipo oficial está em `public/brand/` (versão azul para fundos claros e versão branca para fundos escuros) e é
exibido por `src/components/layout/BrandLogo.tsx`, que escolhe a versão conforme o tom da seção. O ícone do site
(`src/app/icon.png` e `apple-icon.png`) usa o símbolo da cruz e do sol. A paleta deriva das cores oficiais: azul-marinho
`#0B2447` nos blocos escuros, azul `#195691` como destaque sobre fundos claros e em blocos institucionais, e o amarelo
`#FFCC00` como destaque sobre fundos escuros.

### Destaque de evento

Um evento com `"highlight": true` em `agenda.json` aparece em destaque logo abaixo da abertura da página inicial e
some automaticamente no dia seguinte à data do evento, sem precisar republicar o site.

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

`web/escala-louvor/` é a ferramenta interna de escalas do ministério de louvor (veja o
[README](./web/escala-louvor/README.md) dela). Não faz parte do site público.

`tools/` e `web/nam-gain/` contêm uma ferramenta independente (NAM Gain) e não fazem parte do site da igreja.
