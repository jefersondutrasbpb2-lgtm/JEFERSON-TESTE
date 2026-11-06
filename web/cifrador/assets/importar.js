// Importar cifra de PDF e separar o cabeçalho (nome, artista) de um texto colado.
//
// PDF: lido no próprio navegador com o pdf.js (carregado só quando alguém importa um PDF).
// O PDF guarda pedaços de texto com posição (x, y). As linhas são remontadas pela altura (y), e
// cada pedaço vai para a coluna que corresponde ao seu x. Para os acordes ficarem em cima da
// sílaba certa mesmo com fonte de largura variável, a coluna de um acorde é medida com a largura
// média das letras da linha de letra logo abaixo dele.
// PDF que é só imagem (foto, digitalização) não tem texto: aí avisamos.

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
let carregando = null;

function carregarPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return (carregando ??= new Promise((ok, falha) => {
    const s = document.createElement("script");
    s.src = PDFJS + "pdf.min.js";
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
      ok(window.pdfjsLib);
    };
    s.onerror = () => {
      carregando = null;
      falha(new Error("Não consegui carregar o leitor de PDF. Confira a internet e tente de novo."));
    };
    document.head.append(s);
  }));
}

const mediana = (v) => {
  const o = [...v].sort((a, b) => a - b);
  return o.length ? o[Math.floor(o.length / 2)] : 0;
};

// Rodapés e cabeçalhos de impressão que não fazem parte da cifra.
const LIXO = /(cifraclub\.com|cifras\.com\.br|^\s*\d+\s*\/\s*\d+\s*$|^\s*p[áa]gina\s+\d+)/i;

/**
 * Monta o texto de uma página a partir dos itens do pdf.js.
 * ehLinhaDeAcordes(texto) diz se uma linha é só de acordes (vem do app, que sabe ler acordes).
 */
export function montarLinhas(itens, ehLinhaDeAcordes) {
  const its = itens
    .filter((i) => i.str && i.str.trim())
    .map((i) => ({
      s: i.str,
      x: i.transform[4],
      y: i.transform[5],
      w: i.width,
      h: Math.abs(i.transform[3]) || i.height || 10,
    }));
  if (!its.length) return "";
  const alt = mediana(its.map((i) => i.h)),
    larguras = its.filter((i) => i.s.length >= 2 && i.w > 0).map((i) => i.w / i.s.length),
    cw = larguras.length ? mediana(larguras) : alt * 0.6,
    x0 = Math.min(...its.map((i) => i.x));

  // Agrupa em linhas: mesma altura (tolerância de meia letra), de cima para baixo.
  its.sort((a, b) => b.y - a.y || a.x - b.x);
  const linhas = [];
  for (const it of its) {
    const l = linhas[linhas.length - 1];
    l && Math.abs(l.y - it.y) < alt * 0.45 ? l.itens.push(it) : linhas.push({ y: it.y, itens: [it] });
  }
  for (const l of linhas) {
    l.itens.sort((a, b) => a.x - b.x);
    l.texto = l.itens.map((i) => i.s).join(" ");
  }

  const montar = (l, colDe) => {
    let s = "";
    for (const it of l.itens) {
      const col = Math.max(0, colDe(it));
      if (col > s.length) s = s.padEnd(col);
      else if (s && !/\s$/.test(s) && !/^\s/.test(it.s) && col < s.length) s += " ";
      s += it.s;
    }
    return s.replace(/\s+$/, "");
  };
  const colPadrao = (it) => Math.round((it.x - x0) / cw);

  const saida = [];
  let yAnterior = null;
  linhas.forEach((l, k) => {
    if (LIXO.test(l.texto)) return;
    // Espaço vertical maior que uma linha e meia vira linha em branco (separa as partes).
    if (yAnterior !== null && yAnterior - l.y > alt * 1.9 && saida[saida.length - 1] !== "") saida.push("");
    yAnterior = l.y;
    const abaixo = linhas[k + 1];
    if (ehLinhaDeAcordes(l.texto) && abaixo && !ehLinhaDeAcordes(abaixo.texto) && !LIXO.test(abaixo.texto)) {
      // Acordes medidos pela letra de baixo (largura média das letras dela).
      const letras = abaixo.itens.reduce((n, i) => n + i.s.length, 0),
        larg = abaixo.itens.reduce((n, i) => n + i.w, 0),
        cwLetra = letras && larg ? larg / letras : cw,
        ini = abaixo.itens[0],
        colIni = colPadrao(ini);
      saida.push(montar(l, (it) => colIni + Math.round((it.x - ini.x) / cwLetra)));
      return;
    }
    if (abaixo === undefined || !ehLinhaDeAcordes(l.texto)) {
      const anterior = linhas[k - 1];
      // Letra que tem acordes em cima: medida com a própria largura média, como os acordes.
      if (anterior && ehLinhaDeAcordes(anterior.texto) && !ehLinhaDeAcordes(l.texto)) {
        const letras = l.itens.reduce((n, i) => n + i.s.length, 0),
          larg = l.itens.reduce((n, i) => n + i.w, 0),
          cwLetra = letras && larg ? larg / letras : cw,
          ini = l.itens[0],
          colIni = colPadrao(ini);
        saida.push(montar(l, (it) => colIni + Math.round((it.x - ini.x) / cwLetra)));
        return;
      }
    }
    saida.push(montar(l, colPadrao));
  });
  return saida.join("\n");
}

/** Lê um arquivo PDF e devolve o texto da cifra, com as linhas e os acordes no lugar. */
export async function textoDoPdf(arquivo, ehLinhaDeAcordes) {
  const pdfjs = await carregarPdfJs(),
    pdf = await pdfjs.getDocument({ data: await arquivo.arrayBuffer() }).promise,
    paginas = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const pagina = await pdf.getPage(n),
      conteudo = await pagina.getTextContent();
    paginas.push(montarLinhas(conteudo.items, ehLinhaDeAcordes));
  }
  const texto = paginas.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!texto)
    throw new Error(
      "Esse PDF não tem texto para ler: parece ser uma foto ou digitalização. Use um PDF gerado pelo site de cifra ou pelo Word.",
    );
  return texto;
}

/**
 * Separa nome e artista do começo de um texto no formato dos sites de cifra:
 *   Colossenses 1
 *   Projeto Sola
 *   Tom: C
 * Só separa quando há uma linha "Tom:" entre as 6 primeiras linhas com texto; senão devolve tudo
 * como está (para não confundir a primeira linha da letra com o nome da música).
 */
export function separarCabecalho(texto, ehLinhaDeAcordes) {
  const linhas = texto.replace(/\r/g, "").split("\n"),
    comTexto = linhas.map((l, i) => [l.trim(), i]).filter(([l]) => l),
    iTom = comTexto.slice(0, 6).findIndex(([l]) => /^tom\s*:/i.test(l));
  if (iTom < 1) return { title: "", artist: "", texto };
  const antes = comTexto.slice(0, iTom).filter(([l]) => !ehLinhaDeAcordes(l) && !/^\[.*\]$/.test(l));
  if (!antes.length) return { title: "", artist: "", texto };
  const ultima = comTexto[iTom - 1][1];
  return {
    title: antes[0][0],
    artist: antes[1] ? antes[1][0] : "",
    texto: linhas.slice(ultima + 1).join("\n").replace(/^\n+/, ""),
  };
}
