# Sertão Negócios 2026 · Landing page

Página de captura do **Sertão Negócios 2026**, que acontece em 03 e 04 de dezembro de 2026 no auditório do Sebrae em Patos-PB.
É um site estático (HTML, CSS e JS), sem etapa de build: basta publicar a pasta `sertao-negocios/` em qualquer hospedagem estática.

```bash
# pré-visualização local
python3 -m http.server 8080 --directory sertao-negocios
```

## Kit GreatPages

A pasta `greatpages/` traz a mesma página dividida em blocos para colar em elementos HTML do GreatPages, com o passo a passo em `greatpages/LEIA-ME.md`. Ela é gerada por `python3 tools/build_greatpages.py`; rode de novo depois de qualquer mudança na página.

## Antes de publicar

1. **Formulário:** em `assets/js/config.js`, preencha `leadEndpoint` com a URL do seu webhook ou CRM. Com o campo vazio, a página roda em modo de demonstração: o envio é simulado e um aviso aparece no console.
   - Para webhook JSON (Make, Zapier, n8n, RD Station etc.), use `payloadFormat: 'json'` e `requestMode: 'cors'`.
   - Para Google Apps Script ou outro webhook sem CORS, use `payloadFormat: 'form'` e `requestMode: 'no-cors'`.
   - Se quiser mandar a pessoa para uma página de obrigado ou para um grupo de WhatsApp depois do envio, preencha `redirectUrl`.
2. **Política de privacidade:** o texto do `<dialog id="privacy">` no `index.html` é genérico. Complete-o com a razão social, o CNPJ e o canal de contato do controlador dos dados.
3. **Pixel e Analytics:** a página envia eventos para `window.dataLayer`, para `gtag()` (quando existir) e para `fbq('track', 'Lead')`. Basta instalar o GTM, o GA4 ou o Pixel da Meta no `<head>`.
   Eventos enviados: `cta_click` (com `cta_location`), `form_start`, `form_error`, `generate_lead` (com `interesse`) e `form_submit_error`.
4. **Domínio:** troque o `canonical` e as URLs de `og:image` para endereços absolutos do seu domínio.

### Campos enviados

`nome`, `whatsapp` (só dígitos), `email`, `cidade`, `interesse` (`smart`, `vip` ou `expositor`), `consentimento`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `pagina` e `enviado_em`.

Os links podem pré-selecionar o interesse com `?interesse=vip`. As UTMs da URL são capturadas automaticamente.

## Estrutura e direção

| Seção | Função |
|---|---|
| Hero | Logo 3D, data, local e CTA. Linhas topográficas se desenham na entrada e o horizonte de Patos fica em parallax. |
| 01 A proposta | Manifesto com palavras que acendem conforme a rolagem. |
| 02 O Sertão | Sticky storytelling em 4 capítulos: pecuária, algodão, Patos e economia de hoje. |
| 03 Área de influência | Mapa SVG fixado na tela enquanto as conexões e a BR-230 se desenham. |
| 04 Por que participar | Números com contador, benefícios e público. |
| 05 Palestrantes | Recortes em PNG/WebP sobre o gradiente pôr do sol, mais os 10 cases. |
| 06 Programação | Linha do tempo dos dois dias, que se preenche com o scroll. |
| 07 Experiência | Estrutura do evento e CTA para expositores. |
| 08 Ingressos | Smart e VIP, com CTAs que pré-selecionam o formulário. |
| 09 Quem faz | Sebrae, MR3, Âncora e a metodologia PBXP / Summit Paraíba. |
| 10 Inscrição | Formulário com validação, máscara, LGPD, honeypot e estados de envio. |

- **Tipografia:** *Bricolage Grotesque* (eixos de peso e tamanho óptico) nos títulos, com contornos expressivos que conversam com o logo arredondado. *Manrope* no texto, pela ótima legibilidade no mobile. As duas fontes ficam hospedadas localmente.
- **Paleta:** cobalto da marca, sol/brasa (o gradiente pôr do sol das peças), céu como destaque e areia como respiro editorial.
- **Movimento:** Lenis sincronizado com o ticker do GSAP e o ScrollTrigger, SplitText e DrawSVG (GSAP 3.13, versões locais em `assets/vendor`).
- **Acessibilidade:** com `prefers-reduced-motion`, o Lenis e as animações são desligados. Sem JavaScript, todo o conteúdo continua visível.

## Conteúdo

Todas as informações vêm do *Projeto Geral* e do *Plano Sertão Negócios 2026 (ajustado)*. Valores de lote, nomes dos 10 empresários e a grade detalhada ainda não foram definidos nesses documentos, por isso não aparecem na página.
As fotos dos palestrantes e da cidade foram enviadas pela organização. Os palestrantes tiveram o fundo removido. A foto do Rossandro chegou em baixa resolução (450×600 px); vale trocar `assets/img/speaker-rossandro.webp` pelo original em alta assim que houver.
