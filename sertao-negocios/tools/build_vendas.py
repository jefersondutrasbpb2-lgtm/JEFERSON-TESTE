#!/usr/bin/env python3
"""Gera a página de vendas (vendas.html) a partir da página de captura (index.html).

As seções em comum (palestrantes, programação, experiência, quem faz...) vêm do index.html,
então uma mudança feita lá entra aqui na próxima geração. O que muda na versão de vendas:
- topo com o card de compra (Smart e VIP com valor e botão) no lugar do formulário;
- seção "Ingressos" com os dois cards, valores do lote e botões de checkout;
- perguntas, final, barra do celular e menu falando de compra, e sem o formulário de inscrição.

Valores e links de checkout ficam em INGRESSOS, logo abaixo.

Uso:  python3 tools/build_vendas.py      (a partir da pasta sertao-negocios)
Saída: vendas.html (depois: python3 tools/build_gp_html.py vendas)
"""
import re
import sys
from html import escape
from urllib.parse import quote
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Lote à venda e links dos checkouts. de: valor de referência ("De R$ 397 por apenas"); parcelas/parcela: o destaque
# do card; price: valor à vista; anterior: valor do lote que já fechou, mostrado riscado e apagado
LOTE = "Lote 1"
LOTE_ANTERIOR = "Lote 0"
# Escassez: True quando o lote estiver nos últimos ingressos (troca selos, textos e mostra o aviso na seção de ingressos)
ULTIMOS = True
LOTE_STATUS = "últimos ingressos" if ULTIMOS else "disponível"
LOTE_FRASE = (f"Estamos nos últimos ingressos do {LOTE}, e quando ele virar o valor sobe." if ULTIMOS
              else f"O {LOTE} está aberto, e os próximos lotes sobem de valor.")
INGRESSOS = {
    "smart": {"de": 397, "parcelas": 12, "parcela": 25.55, "price": 247, "anterior": 197, "checkout": "https://chk.eduzz.com/39VKR1KYWR"},
    "vip": {"de": 597, "parcelas": 12, "parcela": 35.89, "price": 347, "anterior": 297, "checkout": "https://chk.eduzz.com/39YNX2NQWO"},
}
WA_DUVIDA = ("https://wa.me/5583996986238?text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20os%20"
             "ingressos%20do%20Sert%C3%A3o%20Neg%C3%B3cios%202026.")


def fail(msg):
    sys.exit(f"[build_vendas] {msg}")


def must_replace(text, old, new):
    if text.count(old) != 1:
        fail(f"trecho não encontrado (ou repetido): {old[:70]!r}")
    return text.replace(old, new)


def must_sub(text, pattern, new):
    out, n = re.subn(pattern, lambda _: new, text, count=1, flags=re.S)
    if n != 1:
        fail(f"bloco não encontrado: {pattern[:70]!r}")
    return out


def brl(value):
    if value is None:
        return "R$ 000"  # valor ainda não informado: fica evidente na revisão
    inteiro, centavos = f"{value:,.2f}".split(".")
    inteiro = inteiro.replace(",", ".")
    return f"R$ {inteiro}" if centavos == "00" else f"R$ {inteiro},{centavos}"


def parcelado(t):
    return f'{t["parcelas"] or "00"}x de {brl(t["parcela"])}'


def attrs(key, cta):
    t = INGRESSOS[key]
    price = f' data-price="{t["price"]}"' if t["price"] is not None else ""
    return f'href="{escape(t["checkout"])}" data-checkout="{key}"{price} data-cta="{cta}"'


html = (ROOT / "index.html").read_text()

# <head>
html = must_replace(html, "<title>Sertão Negócios 2026 · 03 e 04 de dezembro · Patos-PB</title>",
                    "<title>Ingressos · Sertão Negócios 2026 · 03 e 04 de dezembro · Patos-PB</title>")
html = must_sub(html, r'<meta name="description" content="[^"]*">',
                '<meta name="description" content="Ingressos Smart e VIP do Sertão Negócios 2026, com Moisés Ramos, '
                'Rick Chesther, Rossandro Klinjey, Padre Fabrício Timóteo e mais 10 palestrantes. 03 e 04 de dezembro, '
                f'em Patos-PB. ' + (f'Últimos ingressos do {LOTE}.' if ULTIMOS else f'{LOTE} disponível.') + '">')

# Menu
html = must_replace(html, '<a href="#lote-0">Lote 0</a>', '<a href="#ingressos">Ingressos</a>')
html = must_replace(html, '<a class="btn btn--sm btn--sol nav__cta" href="#cadastro" data-cta="nav">Quero o lote 0</a>',
                    '<a class="btn btn--sm btn--sol nav__cta" href="#ingressos" data-cta="nav">Comprar ingresso</a>')

# Palco: palestrantes já revelados entre os 10 que completam a programação, na ordem em que foram anunciados
REVELADOS = [
    {"slug": "linda", "nome": "Linda Carvalho", "nome_html": "Linda<br>Carvalho", "papel": "Palestrante",
     "tema": "Comunicação, imagem e posicionamento",
     "bio": "Comunicadora e empreendedora, tem 20 anos de carreira na TV e no rádio e é uma das vozes mais influentes "
            "da comunicação na Paraíba. Como estrategista de comunicação, ajuda pequenos e médios empresários a vender "
            "mais e a se posicionar melhor usando a própria imagem, e empresta a sua a marcas que querem comunicar os seus valores."},
    {"slug": "irclebson", "nome": "Irclebson Ramos", "nome_html": "Irclebson<br>Ramos", "papel": "Palestrante",
     "tema": "Liderança, legado e prosperidade",
     "bio": "Empresário, autor e presidente do Grupo Makários, holding com mais de 20 empresas no Brasil, em Portugal e nos "
            "Estados Unidos. Começou a empreender ainda menino, vendendo ovos de Páscoa, e hoje se dedica a formar líderes e "
            "fortalecer empresários. É autor do livro Dia a Dia de um Afortunado."},
    {"slug": "fabio", "nome": "Fábio Farias", "nome_html": "Fábio<br>Farias", "papel": "Palestrante",
     "tema": "Expansão, vendas e experiência do cliente",
     "bio": "Fundador da franquia Love Gifts, com mais de 100 unidades no Brasil, é formado em Marketing e tem MBA em Gestão "
            "Empresarial. Especialista em expansão de negócios, aceleração de vendas, importação, comportamento de consumo e "
            "experiência do cliente, também criou o projeto social Criança Empreendedora."},
    {"slug": "anna", "nome": "Anna Stefania", "nome_html": "Anna<br>Stefania", "papel": "Palestrante",
     "tema": "Empreendedorismo regional e conexão entre negócios",
     "bio": "Gerente da Agência Sebrae de Patos e representante da Expo Business e da FENEMP, iniciativas que fortalecem o "
            "empreendedorismo e conectam negócios. Atua para aproximar os empreendedores da região de conhecimento, "
            "oportunidades e iniciativas que fazem as empresas crescerem."},
    {"slug": "catarina", "nome": "Catarina Medeiros", "nome_html": "Catarina<br>Medeiros", "papel": "Palestrante",
     "tema": "Gestão, liderança e empresa familiar",
     "bio": "Administradora, empresária e consultora, está à frente da Panificadora Vitória, empresa familiar com mais de "
            "60 anos de história. Formada pela UFPB, com MBA pela PUCRS, cresceu no balcão da família e, na pandemia, "
            "modernizou o negócio com novos canais de venda e presença digital. Hoje leva para a consultoria a experiência "
            "de quem conhece o negócio do balcão à gestão."},
    {"slug": "roberto", "nome": "Roberto Moraes", "nome_html": "Roberto<br>Moraes", "papel": "Palestrante",
     "tema": "Gestão financeira, lucro e caixa",
     "bio": "Consultor financeiro e especialista em gestão financeira empresarial, passou 12 anos na Eletrobras Chesf "
            "gerindo um orçamento superior a R$ 5 bilhões e atua como consultor parceiro do Sebrae e do Grupo Primo. "
            "É criador do Ciclo do Sucesso Financeiro, método que ajuda pequenas e médias empresas a gerar mais lucro e mais caixa."},
    {"slug": "eduardo", "nome": "Eduardo Calaça", "nome_html": "Eduardo<br>Calaça", "papel": "Palestrante",
     "tema": "Liderança e alta performance",
     "bio": "Mestre em Administração Estratégica, com MBAs em Marketing e Inovação, é palestrante, mentor e especialista em "
            "gestão, liderança e alta performance. CEO da Imersão Líder de Impacto, da Positive Academy e do Leader Clube, "
            "mentoria premium para líderes e times, soma mais de 20 anos formando líderes e já acelerou mais de 1.000 gestores."},
    {"slug": "karla", "nome": "Karla Vital", "nome_html": "Karla<br>Vital", "papel": "Palestrante",
     "tema": "Odontologia como negócio e presença digital",
     "bio": "Cirurgiã-dentista e referência nas regiões do Seridó e da Borborema paraibana. Criadora do Método K, une a "
            "experiência clínica ao mundo digital para transformar a odontologia em um negócio de sucesso."},
    # Casal numa palestra só: ocupa uma das 10 vagas, mas conta dois nomes confirmados ("pessoas": 2)
    {"slug": "irany-gustavo", "nome": "Irany Martins e Gustavo Lucena", "nome_html": "Irany &amp;<br>Gustavo",
     "papel": "Palestrantes", "pessoas": 2,
     "tema": "Fé, coragem e visão empreendedora",
     "bio": "Irany Martins e Gustavo Lucena fundaram há 19 anos a Casa do Bolo Sertanejo, empresa referência no Sertão "
            "paraibano, e transformaram um sonho em um negócio de sucesso. Com uma trajetória marcada por fé, coragem e "
            "visão empreendedora, são exemplo de determinação, superação e crescimento empresarial."},
    {"slug": "iva", "nome": "Ivã Spolaor", "nome_html": "Ivã<br>Spolaor", "papel": "Palestrante",
     "tema": "Tráfego, dados e comportamento do consumidor",
     "bio": "Sócio-fundador da iD Tráfego, há 5 anos ajuda empresas a anunciar com intenção e clareza, a partir de dados, "
            "e já atendeu mais de 100 empresas. Em Patos, mostra como o comportamento do consumidor está mudando e o que a "
            "sua empresa precisa fazer para continuar sendo encontrada."},
    {"slug": "rayran", "nome": "Rayran Sales", "nome_html": "Rayran<br>Sales", "papel": "Palestrante",
     "tema": "Estratégia, crescimento e lucratividade",
     "bio": "Contador, empresário e palestrante, trocou o futebol pelo empreendedorismo e construiu a trajetória movido por "
            "desafios, visão estratégica e determinação. Cofundador e CEO da Bumax Contabilidade, é especialista em estratégia "
            "empresarial e atua no desenvolvimento de negócios, com foco em crescimento, escala e lucratividade."},
    {"slug": "fast-ia", "nome": "Caio Galindo e João Guilherme", "nome_html": "Caio &amp;<br>João",
     "papel": "Palestrantes", "pessoas": 2,
     "tema": "Inteligência artificial e tecnologia para negócios",
     "bio": "Caio Galindo e João Guilherme são empresários e cofundadores da Fast IA, especializada em soluções tecnológicas "
            "e inteligência artificial para negócios. Com foco em inovação e eficiência, ajudam empresas a identificar "
            "oportunidades, automatizar processos e melhorar a gestão por meio da tecnologia."},
    {"slug": "jaqueline", "nome": "Jaqueline Araújo", "nome_html": "Jaqueline<br>Araújo", "papel": "Palestrante",
     "tema": "Liderança e inovação no varejo",
     "bio": "Empresária e CEO da Skyler Patos, referência em liderança e inovação no varejo de moda masculina. Enfermeira, "
            "consultora de moda e mentora pelo Método Marotela, concilia a carreira com o papel de mãe de Caroline e João "
            "Pedro, sempre em busca de transformação e excelência."},
    {"slug": "rodrigo", "nome": "Dr. Rodrigo Pontes de Mello", "nome_html": "Rodrigo<br>de Mello", "papel": "Palestrante",
     "tema": "Saúde mental, propósito e empreendedorismo",
     "bio": "Psicólogo e doutor em Psicologia Clínica pela Universidade Católica de Pernambuco (Unicap), é fundador e diretor "
            "da Anima Clínica de Psicologia e cofundador, com a esposa, da Salus Clínica de Saúde Mental. Casado, pai de "
            "Maria Alice, apicultor e criador de ovelhas e cabras, entende que a vida está nas experiências profundas, "
            "vividas a cada instante, a partir da essência do que empreendemos."},
    {"slug": "alessia", "nome": "Aléssia Saluára", "nome_html": "Aléssia<br>Saluára", "papel": "Palestrante",
     "tema": "Branding e posicionamento de marca",
     "bio": "Publicitária e especialista em branding, soma 24 anos de experiência e mais de 650 marcas posicionadas no mundo. "
            "Pós-graduada em Gestão Empresarial pela FGV, Master Coach e analista comportamental pela Febracis, já trabalhou "
            "com marcas de nomes como Rick Chesther, Roberto Justus, Walter Longo, Paulo Vieira, Bráulio Bessa e João Kepler."},
    {"slug": "irauna", "nome": "Iraúna Rocha", "nome_html": "Iraúna<br>Rocha", "papel": "Palestrante",
     "tema": "Gestão e planejamento tributário",
     "bio": "Contador e CEO da Exate Soluções Contábeis, é especialista em reduzir a carga tributária dentro da legalidade, "
            "ajudando empresas a encontrar oportunidades para otimizar os custos com tributos. No Sertão Negócios, fala sobre "
            "gestão tributária e a importância do planejamento para quem busca mais eficiência financeira e crescimento sustentável."},
]
# O palco começou com 10 vagas anunciadas; se entrarem mais nomes, o total acompanha
A_REVELAR = max(0, 10 - len(REVELADOS))
NOVOS = sum(r.get("pessoas", 1) for r in REVELADOS)   # pessoas reveladas (o casal conta duas)
CONFIRMADOS = 4 + sum(r.get("pessoas", 1) for r in REVELADOS)
plural = A_REVELAR != 1
cards = "".join(f'''
        <article class="speaker speaker--d" data-speaker>
          <div class="speaker__frame" data-speed="0.03">
            <img src="assets/img/speaker-{r["slug"]}.webp" alt="{r["nome"]}" width="640" height="800" loading="lazy" decoding="async">
          </div>
          <div class="speaker__info">
            <p class="speaker__role">{r["papel"]}</p>
            <h3 class="speaker__name">{r["nome_html"]}</h3>
            <p class="speaker__topic">{r["tema"]}</p>
            <p class="speaker__bio">{r["bio"]}</p>
          </div>
        </article>
''' for r in REVELADOS)
html = must_replace(html, '''        </article>

        <aside class="speaker-cases" data-reveal>''', '        </article>\n' + cards + '''
        <aside class="speaker-cases" data-reveal>''')
lista = [r["nome"] for r in REVELADOS]
nomes = ", ".join(lista)
nomes_e = " e ".join([", ".join(lista[:-1]), lista[-1]]) if len(lista) > 1 else lista[0]
# Até três nomes, a frase cita cada um; depois, só a quantidade (a lista completa já está nos cards)
POR_EXTENSO = {4: "Quatro", 5: "Cinco", 6: "Seis", 7: "Sete", 8: "Oito", 9: "Nove", 10: "Os dez"}
abertura = (f"{nomes_e} {'abrem' if len(lista) > 1 else 'abre'} a lista" if len(lista) <= 3
            else f"{POR_EXTENSO.get(len(lista), len(lista))} deles já estão aqui no palco")
html = must_replace(html, '<span class="stat__n" data-count="4">04</span><span class="stat__l">nomes confirmados</span>',
                    f'<span class="stat__n" data-count="{CONFIRMADOS}">{CONFIRMADOS:02d}</span><span class="stat__l">nomes confirmados</span>')
if A_REVELAR:
    html = must_replace(html, "Padre Fabrício Timóteo e mais 10 palestrantes. 03 e 04 de dezembro",
                        f"Padre Fabrício Timóteo, {nomes} e mais {A_REVELAR} {'palestrantes' if plural else 'palestrante'}. 03 e 04 de dezembro")
    html = must_replace(html, '<span class="stat__n" data-count="10">10</span><span class="stat__l">palestrantes a revelar</span>',
                        f'<span class="stat__n" data-count="{A_REVELAR}">{A_REVELAR:02d}</span><span class="stat__l">{"palestrantes a revelar" if plural else "palestrante a revelar"}</span>')
    html = must_replace(html, "<p>Outros 10 palestrantes, escolhidos a dedo, completam a programação. Cada nome é revelado no Instagram,",
                        f"<p>Outros 10 palestrantes, escolhidos a dedo, completam a programação. {abertura}, e cada novo nome é revelado no Instagram,")
    html = must_replace(html, '<span class="speaker-cases__n">+10</span>', f'<span class="speaker-cases__n">+{A_REVELAR}</span>')
    html = must_replace(html, "<p><strong>palestrantes</strong> escolhidos a dedo completam este palco. Os nomes são revelados um a um no Instagram,",
                        "<p><strong>palestrantes</strong> escolhidos a dedo ainda completam este palco. Os nomes são revelados um a um no Instagram,"
                        if plural else
                        "<p><strong>palestrante</strong> escolhido a dedo ainda completa este palco. O nome é revelado em breve no Instagram,")
else:
    # Palco completo: sem "a revelar"; o destaque vira um chamado para garantir o lugar
    html = must_replace(html, "Padre Fabrício Timóteo e mais 10 palestrantes. 03 e 04 de dezembro",
                        f"Padre Fabrício Timóteo e mais {NOVOS} palestrantes. 03 e 04 de dezembro")
    html = must_replace(html, '<span class="stat__n" data-count="10">10</span><span class="stat__l">palestrantes a revelar</span>',
                        f'<span class="stat__n" data-count="{NOVOS}">{NOVOS:02d}</span><span class="stat__l">novos nomes no palco</span>')
    html = must_replace(html, "<h3>Um palco ainda por revelar</h3>", "<h3>Um palco completo</h3>")
    html = must_sub(html, r"<p>Outros 10 palestrantes, escolhidos a dedo, completam a programação\. Cada nome é revelado no Instagram,.*?</p>",
                    f"<p>Outros {NOVOS} palestrantes, escolhidos a dedo, completam a programação. Todos já estão aqui no palco.</p>")
    html = must_sub(html, r'<aside class="speaker-cases" data-reveal>.*?</aside>', f'''<aside class="speaker-cases speaker-cases--done" data-reveal>
          <span class="speaker-cases__n">{CONFIRMADOS}</span>
          <div>
            <p><strong>nomes no palco</strong>, em dois dias de conteúdo. O palco está completo, e os 400 lugares não aumentam.</p>
            <a class="btn btn--sol speaker-cases__cta" href="#ingressos" data-cta="palco-completo"><span>Garantir meu ingresso</span><svg class="btn__icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
          </div>
        </aside>''')

# Topo: card de compra no lugar do formulário
s, v = INGRESSOS["smart"], INGRESSOS["vip"]
hero_buy = f'''<div class="hero__form buy" id="comprar" data-hero="cta" data-dock-after>
        <p class="buy__tag"><span class="lot__dot" aria-hidden="true"></span>{LOTE} · {LOTE_STATUS}</p>
        <a class="buy__opt" {attrs("smart", "hero-smart")}>
          <span class="buy__name">Smart</span>
          <span class="buy__desc">Acesso completo aos dois dias</span>
          <span class="buy__price"><small class="buy__x">{s["parcelas"] or "00"}x de</small>{brl(s["parcela"])}<small>Comprar</small></span>
        </a>
        <a class="buy__opt buy__opt--vip" {attrs("vip", "hero-vip")}>
          <span class="buy__name">VIP</span>
          <span class="buy__desc">Assento perto do palco, kit e 3 bônus exclusivos</span>
          <span class="buy__price"><small class="buy__x">{v["parcelas"] or "00"}x de</small>{brl(v["parcela"])}<small>Comprar</small></span>
        </a>
        <a class="buy__more" href="#ingressos" data-cta="hero-comparar">Ver tudo o que cada ingresso inclui</a>
      </div>
'''
html = must_sub(html, r'<div class="hero__form" id="cadastro".*?\n        </div>\n      </div>\n', hero_buy)



# Patrocínio e apoio: faixa de logos no fim da seção "Quem faz" (na ordem em que devem aparecer)
PATROCINIO = [
    {"slug": "mr3", "nome": "MR3 Gestão de Marketing e Consultoria"},
    {"slug": "masterdigna", "nome": "MasterDigna Cuidado Familiar", "alto": True},
    {"slug": "ancorax", "nome": "Âncora X"},
    {"slug": "bumax", "nome": "BUMAX Contabilidade", "escuro": True},   # letra branca: cartão escuro
    {"slug": "fera", "nome": "FERA Colégio e Curso"},
    {"slug": "skyler", "nome": "Skyler Lifewear"},
    {"slug": "visare", "nome": "Visare Soluções Integradas"},
    {"slug": "invictus", "nome": "Academia Invictus", "alto": True},
    {"slug": "fastia", "nome": "FAST.IA"},
]
logos = "".join(f'''
            <li class="sponsor{' sponsor--dark' if p.get('escuro') else ''}{' sponsor--alto' if p.get('alto') else ''}"><img src="assets/img/patrocinio-{p["slug"]}.webp" alt="{p["nome"]}" loading="lazy" decoding="async"></li>'''
                for p in PATROCINIO)
html = must_replace(html, '''          </ul>
        </article>
      </div>
    </div>
  </section>

  <!-- ====== 08 PERGUNTAS FREQUENTES ====== -->''', f'''          </ul>
        </article>
      </div>

      <div class="sponsors" data-reveal>
        <div class="sponsors__head">
          <p class="sponsors__title">Patrocínio e apoio</p>
          <p class="sponsors__lead">Empresas que acreditam no Sertão Negócios.</p>
        </div>
        <ul class="sponsors__grid" aria-label="Patrocinadores e apoiadores">{logos}
        </ul>
      </div>
    </div>
  </section>

  <!-- ====== 08 PERGUNTAS FREQUENTES ====== -->''')

# Kit com materiais e brindes é do VIP: credenciamento sem o moleskine para todos e com a fila do VIP
html = must_replace(html, "<p>Retirada de credencial, pulseira e moleskine.</p>", "<p>Retirada de credencial e pulseira.</p>")
html = must_replace(html, "<p>Credenciais, pulseiras e moleskine para cada participante, com balcões dimensionados para a abertura.</p>",
                    "<p>Credenciais e pulseiras para cada participante, balcões dimensionados para a abertura e fila exclusiva para o VIP.</p>")


def ticket_price(key):
    t = INGRESSOS[key]
    return (f'<div class="ticket__price">'
            f'<span class="ticket__lot"><span class="lot__dot" aria-hidden="true"></span>{LOTE} · {LOTE_STATUS}</span>'
            f'<span class="ticket__from">De <s>{brl(t["de"])}</s> por apenas</span>'
            f'<span class="ticket__value"><small>{t["parcelas"] or "00"}x de</small> {brl(t["parcela"])}</span>'
            f'<span class="ticket__inst">ou <strong>{brl(t["price"])}</strong> à vista</span>'
            f'<span class="ticket__old">{LOTE_ANTERIOR} <s>{brl(t["anterior"])}</s> <em>encerrado</em></span></div>')


# Hotel parceiro: card depois dos ingressos. Reserva por telefone fixo e e-mail da recepção (o hotel não tem WhatsApp)
HOTEL = {
    "nome": "Nord Easy Patos",
    "rede": "Nord Hotéis",
    "endereco": "R. Darcílio Vanderlei da Nóbrega, 399, Brasília, Patos-PB",
    "telefone": "(83) 3421-2829",
    "tel": "+558334212829",
    "email": "recepcao.easypatos@nordhoteis.com.br",
    "detalhes": "Hotel 3 estrelas · check-in a partir das 15h · check-out até as 12h · recepção 24 horas",
}
hotel_assunto = quote("Hospedagem para o Sertão Negócios 2026")
hotel_link = (f'''<div class="hotel__actions">
            <a class="btn btn--sol btn--lg" href="tel:{HOTEL["tel"]}"><span class="hotel__call">Ligar para reservar <small>{HOTEL["telefone"]}</small></span></a>
            <a class="hotel__mail" href="mailto:{HOTEL["email"]}?subject={hotel_assunto}">ou escreva para {HOTEL["email"]}</a>
          </div>''')
hotel_html = f'''
      <article class="hotel" data-reveal>
        <div class="hotel__media"><img src="assets/img/hotel-nord-easy.webp" alt="Fachada do hotel {HOTEL["nome"]}" width="560" height="845" loading="lazy" decoding="async"></div>
        <div class="hotel__body">
          <p class="hotel__tag">Hotel parceiro</p>
          <h3 class="hotel__title">Vem de fora de Patos? Fique no {HOTEL["nome"]}.</h3>
          <p>O hotel da rede {HOTEL["rede"]} é o parceiro do Sertão Negócios para quem vem de outras cidades.</p>
          <p class="hotel__address">{HOTEL["endereco"]}</p>
          <p class="hotel__details">{HOTEL["detalhes"]}</p>
          {hotel_link}
        </div>
      </article>'''

# Aviso de escassez no topo da seção de ingressos
escassez_html = f'''<div class="scarce" role="note" data-reveal>
          <span class="lot__dot" aria-hidden="true"></span>
          <p><strong>Últimos ingressos do {LOTE}.</strong> Quando eles acabarem, o lote vira e o mesmo ingresso passa a custar mais.</p>
        </div>
        ''' if ULTIMOS else ""

# Com o aviso de últimos ingressos, o parágrafo sai (falar do Lote 0 confundia o comprador)
tickets_lead = ("" if ULTIMOS else f'O <strong>{LOTE}</strong> está aberto, com pagamento em até <strong>{INGRESSOS["smart"]["parcelas"] or "00"}x</strong>. O {LOTE_ANTERIOR}, a condição de abertura das vendas, já foi encerrado, e os próximos lotes sobem de valor.')

tickets_lead_html = f'<p class="tickets__lead" data-reveal>{tickets_lead}</p>' if tickets_lead else ""

# Ingressos no lugar do lote 0
tickets = f'''<!-- ====== 06 INGRESSOS ====== -->
  <section class="tickets" id="ingressos" data-theme="dark" aria-labelledby="tickets-title" data-dock-hide>
    <div class="wrap">
      <header class="tickets__head">
        <p class="kicker"><span class="kicker__num">05</span>Ingressos</p>
        <h2 class="h-display" id="tickets-title" data-split>Escolha como você vai viver o Sertão Negócios.</h2>
        {escassez_html}{tickets_lead_html}
      </header>

      <div class="tickets__grid">
        <article class="ticket" data-reveal>
          <header>
            <p class="ticket__type">Smart</p>
            <p class="ticket__desc">O essencial dos dois dias.</p>
          </header>
          {ticket_price("smart")}
          <ul class="ticket__list">
            <li>Acesso completo ao evento</li>
            <li>Pulseira personalizada Smart</li>
            <li>Acesso à área de estandes de negócios, para networking</li>
            <li>Certificado de participação</li>
          </ul>
          <a class="btn btn--light btn--lg btn--block" {attrs("smart", "ticket-smart")}>
            <span>Comprar o Smart</span>
            <svg class="btn__icon" aria-hidden="true"><use href="#i-arrow"/></svg>
          </a>
        </article>

        <article class="ticket ticket--vip" data-reveal>
          <span class="ticket__badge">Mais completo</span>
          <header>
            <p class="ticket__type">VIP</p>
            <p class="ticket__desc">A experiência ampliada.</p>
          </header>
          {ticket_price("vip")}
          <ul class="ticket__list">
            <li>Tudo o que o Smart oferece</li>
            <li>Credenciamento exclusivo, com fila diferenciada</li>
            <li>Assento preferencial, mais perto do palco</li>
            <li>Kit do participante, com materiais e brindes</li>
            <li><strong>Bônus:</strong> Sertão Book, o resumo digital das palestras</li>
            <li><strong>Bônus:</strong> Treinamento de Gestão de Alta Performance com Moisés Ramos</li>
            <li><strong>Bônus:</strong> Treinamento online ao vivo de Marketing e Vendas com Moisés Ramos</li>
          </ul>
          <a class="btn btn--sol btn--lg btn--block" {attrs("vip", "ticket-vip")}>
            <span>Comprar o VIP</span>
            <svg class="btn__icon" aria-hidden="true"><use href="#i-arrow"/></svg>
          </a>
        </article>
      </div>

      <div class="presale" data-reveal>
        <div class="presale__text">
          <p class="presale__title">São 400 lugares.</p>
          <p>Ficou com alguma dúvida antes de comprar? Fale com o Atendimento Sertão Negócios.</p>
          <p class="presale__urgency">{LOTE_FRASE}</p>
        </div>
        <a class="btn btn--light btn--lg" href="{WA_DUVIDA}" target="_blank" rel="noopener" data-wa-direct="duvida-ingresso">
          <span>Tirar dúvida no WhatsApp</span>
          <svg class="btn__icon" aria-hidden="true"><use href="#i-arrow"/></svg>
        </a>
      </div>
{hotel_html}
    </div>
  </section>

  '''
html = must_sub(html, r'<!-- ====== 06 LOTE 0 ====== -->.*?</section>\n\n  ', tickets)

# Perguntas: as duas do lote 0 viram compra e diferença entre os ingressos
faq_new = '''<details class="qa" data-reveal>
          <summary><span>Qual a diferença entre o Smart e o VIP?</span><span class="qa__icon" aria-hidden="true"></span></summary>
          <div class="qa__a"><p>O Smart dá acesso completo ao evento, com pulseira personalizada, área de estandes de negócios e certificado de participação. O VIP inclui tudo isso e acrescenta credenciamento exclusivo com fila diferenciada, assento preferencial mais perto do palco e o kit do participante, com materiais e brindes. Ainda leva três bônus exclusivos: o Sertão Book, com o resumo digital das palestras, o Treinamento de Gestão de Alta Performance e o treinamento online ao vivo de Marketing e Vendas, os dois com Moisés Ramos.</p></div>
        </details>
        <details class="qa" data-reveal>
          <summary><span>Como faço para comprar?</span><span class="qa__icon" aria-hidden="true"></span></summary>
          <div class="qa__a"><p>Escolha o Smart ou o VIP aqui na página, clique em comprar e finalize o pagamento no checkout. Se precisar de ajuda, fale com o Atendimento Sertão Negócios pelo WhatsApp, <a href="''' + WA_DUVIDA + '''" target="_blank" rel="noopener" data-wa-direct="duvida-ingresso">(83) 9 9698-6238</a>.</p></div>
        </details>
        <details class="qa" data-reveal>
          <summary><span>Qual lote está à venda?</span><span class="qa__icon" aria-hidden="true"></span></summary>
          <div class="qa__a"><p>O ''' + LOTE + (''', e ele já está nos últimos ingressos''' if ULTIMOS else '') + '''. O ''' + LOTE_ANTERIOR + ''', a condição de abertura das vendas, já foi encerrado, e os próximos lotes sobem de valor.</p></div>
        </details>
        <details class="qa" data-reveal>
          <summary><span>Posso parcelar?</span><span class="qa__icon" aria-hidden="true"></span></summary>
          <div class="qa__a"><p>Pode. O Smart sai em ''' + parcelado(INGRESSOS["smart"]) + ''' e o VIP em ''' + parcelado(INGRESSOS["vip"]) + ''', ou ''' + brl(INGRESSOS["smart"]["price"]) + ''' e ''' + brl(INGRESSOS["vip"]["price"]) + ''' à vista.</p></div>
        </details>
        <details class="qa" data-reveal>
          <summary><span>Onde posso me hospedar?</span><span class="qa__icon" aria-hidden="true"></span></summary>
          <div class="qa__a"><p>O ''' + HOTEL["nome"] + ''' é o hotel parceiro do evento. Ele fica na ''' + HOTEL["endereco"] + '''. Para reservar, ligue para ''' + HOTEL["telefone"] + '''.</p></div>
        </details>
        <details class="qa" data-reveal>
          <summary><span>Quem conduz o conteúdo de gestão?</span>'''
html = must_sub(html, r'<details class="qa" data-reveal>\s*<summary><span>Quando sai o valor do ingresso\?</span>.*?'
                      r'<details class="qa" data-reveal>\s*<summary><span>Quem conduz o conteúdo de gestão\?</span>', faq_new)

# Sem o formulário de inscrição
html = must_sub(html, r'  <!-- ====== 09 INSCRIÇÃO ====== -->.*?</section>\n\n', '')

# Final
html = must_replace(html, '''<a class="btn btn--light btn--lg" href="#cadastro" data-cta="final" data-reveal>
        <span>Quero o lote 0</span>''', '''<a class="btn btn--light btn--lg" href="#ingressos" data-cta="final" data-reveal>
        <span>Garantir meu ingresso</span>''')
html = must_sub(html, r'<p class="finale__ps" data-reveal>.*?</p>',
                f'<p class="finale__ps" data-reveal>Os 400 lugares não aumentam. {LOTE_FRASE}</p>')

# Barra do celular e WhatsApp
html = must_replace(html, '<a class="btn btn--sol btn--block" href="#cadastro" data-cta="dock">Entrar na comunidade · grátis</a>',
                    f'<a class="btn btn--sol btn--block" href="#ingressos" data-cta="dock">' + (f'Últimos ingressos · {LOTE}' if ULTIMOS else f'Garantir meu ingresso · {LOTE}') + '</a>')
html = must_replace(html, '<span class="wa__opt-d">Lote 0, programação e inscrição</span>',
                    '<span class="wa__opt-d">Ingressos, pagamento e programação</span>')

# Privacidade: sem formulário nesta página
html = must_sub(html, r'(<h2 id="privacy-title">Política de privacidade</h2>).*?(<button type="button" class="btn btn--sol" data-close-privacy>)',
                r'''<h2 id="privacy-title">Política de privacidade</h2>
    <p>Esta página usa ferramentas de medição (Meta e Google) para entender como as pessoas chegam até aqui e quais anúncios funcionam. Os dados da compra são informados e tratados na plataforma de pagamento do checkout.</p>
    <p>A organização do Sertão Negócios usa os dados dos participantes apenas para a comunicação do evento, com base na Lei 13.709/2018 (LGPD), e não os vende nem os compartilha com terceiros para outras finalidades.</p>
    <p>Você pode, a qualquer momento, pedir acesso, correção ou exclusão dos seus dados entrando em contato com a organização pelos canais oficiais do evento.</p>
    <button type="button" class="btn btn--sol" data-close-privacy>''')

for leftover in ('#cadastro', 'data-form', 'lote-0', 'comunidade · grátis'):
    if leftover in html:
        fail(f"ainda há {leftover!r} na página de vendas")

(ROOT / "vendas.html").write_text(html)
faltam = [k for k, t in INGRESSOS.items() if t["price"] is None or t["checkout"].startswith("#")]
print(f"Página de vendas gerada em {(ROOT / 'vendas.html').relative_to(ROOT.parent)}"
      + (f" · faltam valor/checkout de: {', '.join(faltam)}" if faltam else ""))
