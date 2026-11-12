import { textoDoPdf, separarCabecalho } from "./importar.js?v=0f527f0755";
import { biblioteca } from "./biblioteca.js?v=f63588bc71";
(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]')) s(i);
  new MutationObserver((i) => {
    for (const r of i)
      if (r.type === "childList")
        for (const a of r.addedNodes) a.tagName === "LINK" && a.rel === "modulepreload" && s(a);
  }).observe(document, {
    childList: !0,
    subtree: !0,
  });
  function n(i) {
    const r = {};
    return (
      i.integrity && (r.integrity = i.integrity),
      i.referrerPolicy && (r.referrerPolicy = i.referrerPolicy),
      i.crossOrigin === "use-credentials"
        ? (r.credentials = "include")
        : i.crossOrigin === "anonymous"
          ? (r.credentials = "omit")
          : (r.credentials = "same-origin"),
      r
    );
  }
  function s(i) {
    if (i.ep) return;
    i.ep = !0;
    const r = n(i);
    fetch(i.href, r);
  }
})();
const NOTAS_SUSTENIDO = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  NOTAS_BEMOL = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
  NOTA_NATURAL = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  },
  mod12 = (e) => ((e % 12) + 12) % 12,
  nomeNota = (e, t = !1) => (t ? NOTAS_BEMOL : NOTAS_SUSTENIDO)[mod12(e)];
function numeroDaNota(e) {
  let t = NOTA_NATURAL[e[0]];
  return e[1] === "#" ? t++ : e[1] === "b" && t--, mod12(t);
}
const SUFIXOS_ACORDE = [
  [
    "maj7",
    {
      maj7: !0,
    },
  ],
  [
    "maj9",
    {
      maj7: !0,
      ext: [14],
    },
  ],
  [
    "7M",
    {
      maj7: !0,
    },
  ],
  [
    "M7",
    {
      maj7: !0,
    },
  ],
  [
    "7+",
    {
      maj7: !0,
    },
  ],
  [
    "maj",
    {
      maj7: !0,
    },
  ],
  [
    "Δ",
    {
      maj7: !0,
    },
  ],
  [
    "sus2",
    {
      third: 2,
    },
  ],
  [
    "sus4",
    {
      third: 5,
    },
  ],
  [
    "sus",
    {
      third: 5,
    },
  ],
  [
    "add9",
    {
      ext: [14],
    },
  ],
  [
    "add2",
    {
      ext: [14],
    },
  ],
  [
    "add11",
    {
      ext: [17],
    },
  ],
  [
    "add4",
    {
      ext: [17],
    },
  ],
  [
    "b13",
    {
      ext: [20],
    },
  ],
  [
    "-13",
    {
      ext: [20],
    },
  ],
  [
    "#11",
    {
      ext: [18],
    },
  ],
  [
    "+11",
    {
      ext: [18],
    },
  ],
  [
    "b9",
    {
      ext: [13],
    },
  ],
  [
    "-9",
    {
      ext: [13],
    },
  ],
  [
    "#9",
    {
      ext: [15],
    },
  ],
  [
    "+9",
    {
      ext: [15],
    },
  ],
  [
    "b5",
    {
      fifth: 6,
    },
  ],
  [
    "-5",
    {
      fifth: 6,
    },
  ],
  [
    "#5",
    {
      fifth: 8,
    },
  ],
  [
    "+5",
    {
      fifth: 8,
    },
  ],
  [
    "13",
    {
      ext: [21],
    },
  ],
  [
    "11",
    {
      ext: [17],
    },
  ],
  [
    "9",
    {
      ext: [14],
    },
  ],
  [
    "7",
    {
      sev: !0,
    },
  ],
  [
    "6",
    {
      ext: [9],
    },
  ],
  [
    "5",
    {
      power: !0,
    },
  ],
  [
    "4",
    {
      third: 5,
    },
  ],
  [
    "2",
    {
      ext: [14],
    },
  ],
  [
    "+",
    {
      fifth: 8,
    },
  ],
];
function lerQualidade(e) {
  let t = e.replace(/[()\s,]/g, ""),
    n = 4,
    s = 7,
    i = null,
    r = !1,
    a = !1;
  const l = [];
  for (
    t.startsWith("min")
      ? ((n = 3), (t = t.slice(3)))
      : /^m(?!aj)/.test(t)
        ? ((n = 3), (t = t.slice(1)))
        : /^(dim|°|º)/.test(t)
          ? ((n = 3), (s = 6), (a = !0), (t = t.replace(/^(dim|°|º)/, "")))
          : t.startsWith("aug")
            ? ((s = 8), (t = t.slice(3)))
            : t.startsWith("ø") && ((n = 3), (s = 6), (i = 10), (t = t.slice(1)));
    t.length;

  ) {
    const f = SUFIXOS_ACORDE.find(([p]) => t.startsWith(p));
    if (!f) return null;
    const c = f[1];
    c.third != null && (n = c.third),
      c.fifth != null && (s = c.fifth),
      c.ext && l.push(...c.ext),
      c.sev && (i = a ? 9 : 10),
      c.maj7 && (i = 11),
      c.power && (r = !0),
      (t = t.slice(f[0].length));
  }
  const u = [0];
  r || u.push(n), u.push(s), i != null && u.push(i);
  for (const f of l) u.push(f % 12);
  return {
    iv: [...new Set(u.map(mod12))],
    minor: n === 3 && !a,
    dim: a,
  };
}
function lerAcorde(e) {
  if (!e) return null;
  const n = e.replace(/\/(?=[\d#+\-]|b\d)/g, "").match(/^([A-G])([#b]?)([^/]*)(?:\/([A-G][#b]?))?$/);
  if (!n) return null;
  const s = lerQualidade(n[3]);
  return s
    ? {
        root: numeroDaNota(n[1] + n[2]),
        q: n[3],
        bass: n[4] ? numeroDaNota(n[4]) : null,
        ...s,
      }
    : null;
}
function nomeAcorde(e, t = 0, n = !1) {
  return nomeNota(e.root + t, n) + e.q + (e.bass != null ? "/" + nomeNota(e.bass + t, n) : "");
}
const TONS_MAIORES_COM_BEMOL = new Set([5, 10, 3, 8, 1, 6]),
  TONS_MENORES_COM_BEMOL = new Set([2, 7, 0, 5, 10, 3]);
function tomUsaBemol(e) {
  return e ? (e.minor ? TONS_MENORES_COM_BEMOL : TONS_MAIORES_COM_BEMOL).has(mod12(e.tonic)) : !1;
}
function acordesDoCampo(e, t) {
  const n = t ? mod12(e + 3) : e;
  return {
    maj: [n, mod12(n + 5), mod12(n + 7)],
    min: [mod12(n + 2), mod12(n + 4), mod12(n + 9)],
  };
}
function estimarTom(e) {
  if (!e.length) return null;
  let t = null;
  for (let n = 0; n < 12; n++)
    for (const s of [!1, !0]) {
      const i = acordesDoCampo(n, s);
      let r = 0;
      e.forEach((a, l) => {
        (a.minor ? i.min.includes(a.root) : !a.dim && i.maj.includes(a.root)) && (r += 1),
          a.root === n && a.minor === s && (r += l === 0 || l === e.length - 1 ? 1.5 : 0.5),
          s && a.root === mod12(n + 7) && !a.minor && (r += 0.4);
      }),
        (!t || r > t.s) &&
          (t = {
            tonic: n,
            minor: s,
            s: r,
          });
    }
  return (
    t && {
      tonic: t.tonic,
      minor: t.minor,
    }
  );
}
function tomDeTexto(e) {
  const t = lerAcorde((e || "").trim());
  return t
    ? {
        tonic: t.root,
        minor: t.minor,
      }
    : null;
}
const nomeDoTom = (e, t = tomUsaBemol(e)) => (e ? nomeNota(e.tonic, t) + (e.minor ? "m" : "") : "?"),
  // "_" liga acordes que mudam sobre a mesma sílaba ("G__D", "A4___A"), como nos Salmos e Hinos cifrados.
  TOKEN_NEUTRO = /^(\|+:?|:?\|+|\(|\)|\[|\]|x\d+|\d+x|[-–—]+|\/+|%|\.+|\d+:\d{2}|\d+\.|\*+|~+|_+)$/i,
  ROTULO_DE_LINHA = /^([A-Za-zÀ-ÿ0-9ºª]+:|\[[^\]]+\]:?)$/;
function separarPontuacao(e) {
  const t = e.match(/^([(\[|]*)(.*?)([)\]|,.;]*)$/);
  let n = t[2],
    s = t[3];
  for (; (n.match(/\(/g) || []).length > (n.match(/\)/g) || []).length && s.startsWith(")"); )
    (n += ")"), (s = s.slice(1));
  return {
    pre: t[1],
    core: n,
    post: s,
  };
}
function lerLinhaDeAcordes(e) {
  const t = [],
    n = /[^\s_]+|_+/g; // "_" separa acordes ligados ("G__D"); numa letra ("ali___an__ça") a linha continua sendo letra
  let s,
    i = 0,
    r = 0;
  for (; (s = n.exec(e)); ) {
    const a = s[0],
      { pre: l, core: u, post: f } = separarPontuacao(a),
      c = u ? lerAcorde(u) : null;
    if (c)
      i++,
        t.push({
          pos: s.index,
          raw: a,
          pre: l,
          core: u,
          post: f,
          ch: c,
        });
    else if (TOKEN_NEUTRO.test(a) || TOKEN_NEUTRO.test(u) || u === "")
      t.push({
        pos: s.index,
        raw: a,
      });
    else if (r === 0 && ROTULO_DE_LINHA.test(a))
      t.push({
        pos: s.index,
        raw: a,
        label: !0,
      });
    else return null;
    r++;
  }
  return i ? t : null;
}
function chordProParaLinhas(e) {
  if (!/\[[^\]]+\]/.test(e)) return null;
  const t = [...e.matchAll(/\[([^\]]+)\]/g)];
  if (!t.every((r) => lerAcorde(r[1].trim()))) return null;
  let n = 0,
    s = "",
    i = "";
  for (const r of t)
    (i += e.slice(n, r.index)),
      s.length > i.length && (i = i.padEnd(s.length + 1)),
      (s = s.padEnd(i.length) + r[1].trim()),
      (n = r.index + r[0].length);
  return (i += e.slice(n)), i.trim() ? [s, i] : [s];
}
function lerCifra(e) {
  const t = {
      title: "",
      artist: "",
      key: "",
    },
    n = [],
    s = (i, src = null) => {
      if (!i.trim()) {
        n.push({
          kind: "blank",
        });
        return;
      }
      const r = i.match(/^\s*\[([^\]]+)\]\s*$/);
      if (r && !lerAcorde(r[1].trim())) {
        n.push({
          kind: "sec",
          text: r[1].trim(),
        });
        return;
      }
      const a = lerLinhaDeAcordes(i);
      if (a) {
        n.push({
          kind: "chords",
          toks: a,
          src, // linha do texto de onde veio (null: veio de [C]letra no formato ChordPro)
        });
        return;
      }
      n.push({
        kind: "lyr",
        text: i,
      });
    };
  let linhaSrc = -1;
  // Sites de cifra às vezes colam caracteres invisíveis (espaço de largura zero, BOM) e espaços
  // não separáveis: sem limpar, "​C   F7M" não é reconhecido como linha de acordes.
  for (let i of e
    .replace(/\r/g, "")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\u00A0/g, " ").split(`
`)) {
    linhaSrc++;
    i = i.replace(/\t/g, "    ").replace(/\s+$/, "");
    // "Tom: C" (como vem do Cifra Club e outros sites) marca o tom, como {key: C}.
    const tom = i.match(/^\s*Tom\s*:\s*([A-G][#b]?m?)\s*(\(.*\))?\s*$/i);
    if (tom && lerAcorde(tom[1])) {
      t.key || (t.key = tom[1]);
      continue;
    }
    const r = i.match(/^\s*\{\s*([\w_]+)\s*(?::\s*(.*?))?\s*\}\s*$/);
    if (r) {
      const l = r[1].toLowerCase(),
        u = r[2] || "";
      l === "t" || l === "title"
        ? (t.title = u)
        : l === "st" || l === "subtitle" || l === "artist"
          ? (t.artist = u)
          : l === "key" || l === "k"
            ? (t.key = u)
            : l === "c" || l === "comment" || l === "ci"
              ? n.push({
                  kind: "sec",
                  text: u,
                })
              : (l === "soc" || l === "start_of_chorus") &&
                n.push({
                  kind: "sec",
                  text: u || "Refrão",
                });
      continue;
    }
    const a = chordProParaLinhas(i);
    a ? a.forEach((x) => s(x)) : s(i, linhaSrc);
  }
  return {
    meta: t,
    lines: n,
  };
}
function acordesDaCifra(e) {
  const t = [];
  for (const n of e.lines) if (n.kind === "chords") for (const s of n.toks) s.ch && t.push(s.ch);
  return t;
}
function posicionarAcordes(e, t, n) {
  const s = [];
  let i = 0,
    r = 0;
  return (
    e.forEach((a, l) => {
      const u = a.ch ? nomeAcorde(a.ch, t, n) : "",
        f = a.ch ? a.pre + u + a.post : a.raw;
      let c = a.pos;
      l > 0 && (c = Math.max(a.pos, a.pos > r ? i + 1 : i)),
        c > i &&
          s.push({
            text: " ".repeat(c - i),
          }),
        a.ch
          ? (a.pre &&
              s.push({
                text: a.pre,
              }),
            s.push({
              text: u,
              chord: u,
              tok: a,
            }),
            a.post &&
              s.push({
                text: a.post,
              }))
          : s.push({
              text: a.raw,
            }),
        (i = c + f.length),
        (r = a.pos + a.raw.length);
    }),
    s
  );
}
function transporTexto(e, t, n) {
  return e
    .replace(/\r/g, "")
    .split(
      `
`,
    )
    .map((s) => {
      if (/^\s*\{/.test(s))
        return s.replace(/^(\s*\{\s*(?:key|k)\s*:\s*)([^}]+?)(\s*\})$/i, (r, a, l, u) => {
          const f = lerAcorde(l.trim());
          return f ? a + nomeAcorde(f, t, n) + u : a + l + u;
        });
      if (chordProParaLinhas(s))
        return s.replace(/\[([^\]]+)\]/g, (r, a) => "[" + nomeAcorde(lerAcorde(a.trim()), t, n) + "]");
      const i = lerLinhaDeAcordes(s.replace(/\t/g, "    "));
      return i
        ? posicionarAcordes(i, t, n)
            .map((r) => r.text)
            .join("")
        : s;
    }).join(`
`);
}
const CORDAS_VIOLAO = [40, 45, 50, 55, 59, 64],
  cachePosicoes = new Map();
function posicoesViolao(e, t, n = null) {
  const s = n ?? e,
    i = `${e}|${t.join(",")}|${s}`,
    r = cachePosicoes.get(i);
  if (r) return r;
  const a = t.map((g) => mod12(e + g)),
    l = new Set([...a, s]),
    u = mod12(e + 7),
    f = new Set([e, s]);
  for (const g of t)
    ([2, 3, 4, 5, 8, 9, 10, 11].includes(g) || (g === 6 && t.includes(3) && !t.includes(4))) &&
      f.add(mod12(e + g));
  t.length <= 2 && a.forEach((g) => f.add(g));
  const c = new Set(a.filter((g) => g !== u || t.length <= 2));
  c.add(s);
  let p = [];
  for (const g of [
    {
      req: c,
      minPlay: 4,
    },
    {
      req: f,
      minPlay: 4,
    },
    {
      req: f,
      minPlay: 3,
    },
  ]) {
    const b = new Map(),
      x = new Array(6);
    for (let k = 0; k <= 9; k++) {
      const Q = k === 0 ? [0, 1, 2, 3] : [k, k + 1, k + 2, k + 3];
      k > 0 && k <= 4 && Q.unshift(0);
      const et = CORDAS_VIOLAO.map((U) => ["x", ...Q.filter((A) => l.has((U + A) % 12))]),
        ke = (U) => {
          if (U < 6) {
            for (const m of et[U]) (x[U] = m), ke(U + 1);
            return;
          }
          let A = -1,
            O = -1;
          for (let m = 0; m < 6; m++) x[m] !== "x" && (A < 0 && (A = m), (O = m));
          if (A < 0) return;
          for (let m = A; m <= O; m++) if (x[m] === "x") return;
          const Se = O - A + 1;
          if (Se < g.minPlay) return;
          const M = x;
          if ((CORDAS_VIOLAO[A] + M[A]) % 12 !== s) return;
          const ue = new Set(),
            D = [];
          let Ee = 0;
          for (let m = A; m <= O; m++) ue.add((CORDAS_VIOLAO[m] + M[m]) % 12), M[m] > 0 ? D.push(m) : Ee++;
          for (const m of g.req) if (!ue.has(m)) return;
          let j = 0,
            Z = 0,
            R = !1,
            H = 0,
            Ae = 0;
          if (D.length) {
            if (((j = Math.min(...D.map((m) => M[m]))), (Z = Math.max(...D.map((m) => M[m]))), Z - j > 3))
              return;
            if (((H = D.length), H > 4)) {
              const m = D.filter((F) => M[F] === j);
              if (m.length >= 2) {
                R = !0;
                for (let F = m[0]; F <= m[m.length - 1]; F++) M[F] < j && (R = !1);
              }
              R && (H = 1 + D.filter((F) => M[F] > j).length);
            }
            if (H > 4) return;
            for (let m = A + 1; m <= O; m++) M[m] === 0 && D.some((F) => F < m) && Ae++;
          }
          const Le =
              j * 0.9 +
              H * 0.5 +
              (6 - Se) * 1 +
              (Z - j) * 0.3 +
              (Z >= 4 ? Ae * 0.9 : 0) +
              (ue.has(u) || !a.includes(u) ? 0 : 0.7) +
              (R ? 0.8 : 0) +
              (Ee && j > 3 ? 0.6 : 0),
            Te = x.join(","),
            Ce = b.get(Te);
          (!Ce || Ce.score > Le) &&
            b.set(Te, {
              frets: x.slice(),
              score: Le,
              barre: R ? j : 0,
            });
        };
      ke(0);
    }
    if (((p = [...b.values()].sort((k, Q) => k.score - Q.score)), p.length)) break;
  }
  const h = p.slice(0, 6);
  return cachePosicoes.set(i, h), h;
}
function dificuldadeMedia(e, t) {
  if (!e.length) return 0;
  let n = 0;
  for (const s of e) {
    const i = posicoesViolao(mod12(s.root + t), s.iv, s.bass == null ? null : mod12(s.bass + t));
    n += i.length ? i[0].score : 12;
  }
  return n / e.length;
}
function sugerirCapo(e, t, n) {
  if (!e.length) return null;
  let s = n,
    i = dificuldadeMedia(e, t - n);
  for (let r = 0; r <= 7; r++) {
    const a = dificuldadeMedia(e, t - r);
    a < i - 0.35 && ((i = a), (s = r));
  }
  return s;
}
function desenhoViolao(e, t) {
  const n = e.frets,
    s = n.filter((c) => c !== "x" && c > 0),
    i = s.length ? Math.max(...s) : 0,
    r = s.length ? Math.min(...s) : 0,
    a = i <= 4 ? 1 : r,
    l = (c) => 16 + c * 14,
    u = (c) => 30 + c * 17;
  let f = `<svg class="dsvg" width="96" height="124" viewBox="0 0 100 128" role="img" aria-label="Posição ${n.join(" ")}">`;
  for (let c = 0; c <= 5; c++)
    f += `<line class="${c === 0 && a === 1 ? "nut" : "fr"}" x1="${l(0)}" y1="${u(c)}" x2="${l(5)}" y2="${u(c)}"/>`;
  for (let c = 0; c < 6; c++) f += `<line class="str" x1="${l(c)}" y1="${u(0)}" x2="${l(c)}" y2="${u(5)}"/>`;
  if ((a > 1 && (f += `<text x="2" y="${u(0) + 12}">${a}</text>`), e.barre)) {
    const c = n.map((b, x) => (b === e.barre ? x : -1)).filter((b) => b >= 0),
      p = c[0],
      h = c[c.length - 1],
      g = u(e.barre - a) + 8.5;
    f += `<rect class="barre" x="${l(p) - 5}" y="${g - 5}" width="${l(h) - l(p) + 10}" height="10" rx="5"/>`;
  }
  return (
    n.forEach((c, p) => {
      const h = l(p);
      if (c === "x") {
        f += `<path class="mk" d="M${h - 3.5} 14l7 7M${h + 3.5} 14l-7 7"/>`;
        return;
      }
      if (c === 0) {
        f += `<circle class="mk" cx="${h}" cy="17.5" r="3.6"/>`;
        return;
      }
      if (e.barre && c === e.barre) return;
      const g = (CORDAS_VIOLAO[p] + c) % 12;
      f += `<circle class="dot${g === t ? " root" : ""}" cx="${h}" cy="${u(c - a) + 8.5}" r="5.4"/>`;
    }),
    f + "</svg>"
  );
}
function desenhoTeclado(e, t, n) {
  const s = [0, 2, 4, 5, 7, 9, 11],
    i = [
      [1, 0],
      [3, 1],
      [6, 3],
      [8, 4],
      [10, 5],
    ],
    r = new Set(),
    a = n ?? e;
  for (const c of [...t].sort((p, h) => p - h)) {
    let p = 12 + e + c;
    p > 23 && (p -= 12), r.add(p);
  }
  const l = 11,
    u = 62;
  let f = `<svg class="dsvg kb" width="160" height="70" viewBox="0 0 ${14 * l + 2} ${u + 4}" role="img" aria-label="Teclado">`;
  for (let c = 0; c < 2; c++)
    s.forEach((p, h) => {
      const g = c * 12 + p,
        b = r.has(g) ? "w on" : c === 0 && p === a ? "w bs" : "w";
      f += `<rect class="${b}" x="${1 + (c * 7 + h) * l}" y="1" width="${l}" height="${u}" rx="1.5"/>`;
    });
  for (let c = 0; c < 2; c++)
    i.forEach(([p, h]) => {
      const g = c * 12 + p,
        b = r.has(g) ? "on" : c === 0 && p === a ? "bs" : "b";
      f += `<rect class="${b}" x="${1 + (c * 7 + h + 1) * l - 3.6}" y="1" width="7.2" height="${u * 0.6}" rx="1"/>`;
    });
  return f + "</svg>";
}
const TAXA_ANALISE = 11025;
async function decodificarAudio(e) {
  const t = await e.arrayBuffer();
  return new OfflineAudioContext(1, 1, 44100).decodeAudioData(t);
}
async function reamostrar(e, t = TAXA_ANALISE) {
  const n = new OfflineAudioContext(1, Math.max(1, Math.ceil(e.duration * t)), t),
    s = n.createBufferSource();
  return (s.buffer = e), s.connect(n.destination), s.start(), (await n.startRendering()).getChannelData(0);
}
function analisarNoWorker(e, t, n, s) {
  return new Promise((i, r) => {
    const a = new Worker(new URL("" + new URL("worker.js", import.meta.url).href, import.meta.url), {
      type: "module",
    });
    (a.onmessage = (u) => {
      const f = u.data;
      f.type === "progress"
        ? s(f.p)
        : f.type === "done"
          ? (a.terminate(), i(f.result))
          : (a.terminate(), r(new Error(f.message)));
    }),
      (a.onerror = (u) => {
        a.terminate(), r(new Error(u.message));
      });
    const l = e.slice();
    a.postMessage(
      {
        samples: l,
        sr: t,
        opts: n,
      },
      [l.buffer],
    );
  });
}
async function gerarAudioExemplo() {
  const s = [
      [43, 59, 62, 67],
      [38, 57, 62, 66],
      [40, 59, 64, 67],
      [36, 60, 64, 67],
    ],
    i = new OfflineAudioContext(1, Math.ceil((s.length * 2 * 2 + 0.5) * 22050), 22050),
    r = i.createGain();
  (r.gain.value = 0.16), r.connect(i.destination);
  for (let a = 0; a < 2; a++)
    s.forEach((l, u) => {
      const f = (a * s.length + u) * 2;
      for (let c = 0; c < 4; c++) {
        const p = f + (c * 2) / 4;
        l.forEach((h, g) => {
          const b = i.createOscillator(),
            x = i.createGain();
          (b.type = g === 0 ? "sine" : "triangle"),
            (b.frequency.value = 440 * Math.pow(2, (h - 69) / 12)),
            x.gain.setValueAtTime(0, p),
            x.gain.linearRampToValueAtTime(g === 0 ? 1.2 : 0.7, p + 0.01),
            x.gain.exponentialRampToValueAtTime(0.05, p + 2 / 4),
            b.connect(x),
            x.connect(r),
            b.start(p + g * 0.012),
            b.stop(p + 2 / 4 + 0.02);
        });
      }
    });
  return i.startRendering();
}
function paraWav(e) {
  const t = e.getChannelData(0),
    n = t.length,
    s = new ArrayBuffer(44 + n * 2),
    i = new DataView(s),
    r = (a, l) => {
      for (let u = 0; u < l.length; u++) i.setUint8(a + u, l.charCodeAt(u));
    };
  r(0, "RIFF"),
    i.setUint32(4, 36 + n * 2, !0),
    r(8, "WAVE"),
    r(12, "fmt "),
    i.setUint32(16, 16, !0),
    i.setUint16(20, 1, !0),
    i.setUint16(22, 1, !0),
    i.setUint32(24, e.sampleRate, !0),
    i.setUint32(28, e.sampleRate * 2, !0),
    i.setUint16(32, 2, !0),
    i.setUint16(34, 16, !0),
    r(36, "data"),
    i.setUint32(40, n * 2, !0);
  for (let a = 0; a < n; a++) i.setInt16(44 + a * 2, Math.max(-1, Math.min(1, t[a])) * 32767, !0);
  return new Blob([s], {
    type: "audio/wav",
  });
}
const guardado = {
    get(e, t) {
      try {
        const n = localStorage.getItem("cifrador." + e);
        return n == null ? t : JSON.parse(n);
      } catch {
        return t;
      }
    },
    set(e, t) {
      try {
        localStorage.setItem("cifrador." + e, JSON.stringify(t));
      } catch {}
    },
  },
  semBarraFinal = (e) => e.trim().replace(/\/+$/, "");
async function servidorSaude(e) {
  const t = await fetch(semBarraFinal(e) + "/api/health");
  if (!t.ok) throw new Error("Servidor respondeu " + t.status);
  return t.json();
}
async function servidorCriarTarefa(e, t) {
  const n = await fetch(semBarraFinal(e) + "/api/jobs", {
    method: "POST",
    body: t,
  });
  if (!n.ok)
    throw new Error((await n.json().catch(() => ({}))).detail || "Falha ao enviar (" + n.status + ")");
  return n.json();
}
async function servidorAnalisar(e, t, n, s) {
  const i = new FormData();
  t.file && i.append("file", t.file),
    t.url && i.append("url", t.url),
    i.append("lyrics", String(n.lyrics)),
    i.append("separate", String(n.separate)),
    i.append("sevenths", String(n.sevenths)),
    i.append("language", n.language);
  let r = await servidorCriarTarefa(e, i);
  for (; r.status === "queued" || r.status === "running"; ) {
    s(r.step, r.progress), await new Promise((l) => setTimeout(l, 1500));
    const a = await fetch(semBarraFinal(e) + "/api/jobs/" + r.id);
    if (!a.ok) throw new Error("Perdi o contato com o servidor (" + a.status + ")");
    r = await a.json();
  }
  if (r.status === "error" || !r.result) throw new Error(r.error || "A análise falhou no servidor.");
  return r.result;
}
const elemento = (e) => document.getElementById(e),
  esc = (e) =>
    e.replace(
      /[&<>"]/g,
      (t) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
        })[t],
    ),
  formatarTempo = (e) => (
    (e = Math.max(0, e)), Math.floor(e / 60) + ":" + String(Math.floor(e % 60)).padStart(2, "0")
  ),
  editorTexto = elemento("src"),
  estado = {
    semis: 0,
    inst: "guitar",
    capo: 0,
    acc: "auto",
    size: 17,
    voice: {},
    editor: !0,
    songId: null,
    songBase: null,
  };
let tomOriginal = null;
const deslocamentoDasFormas = () => estado.semis - (estado.inst === "guitar" ? estado.capo : 0),
  transporTom = (e, t) =>
    e
      ? {
          tonic: mod12(e.tonic + t),
          minor: e.minor,
        }
      : null,
  preferirBemol = (e) => (estado.acc === "auto" ? tomUsaBemol(e) : estado.acc === "b");
function desenhoAcorde(e, t, n = 0) {
  const s = lerAcorde(e);
  if (!s) return "";
  if (estado.inst === "keys") {
    const r = [...s.iv]
      .sort((a, l) => a - l)
      .map((a) => nomeNota(s.root + a, t))
      .join(" ");
    return (
      desenhoTeclado(s.root, s.iv, s.bass) +
      `<div class="notes">${esc((s.bass != null ? nomeNota(s.bass, t) + " | " : "") + r)}</div>`
    );
  }
  const i = posicoesViolao(s.root, s.iv, s.bass);
  return i.length
    ? desenhoViolao(i[Math.min(n, i.length - 1)], s.root)
    : '<div class="notes">sem posição</div>';
}
/**
 * Linha de acordes + linha de letra viram blocos "acorde em cima, pedaço da letra embaixo".
 * Assim a linha quebra no fim da tela sem perder o acorde de cada sílaba. Pedaços da mesma
 * palavra ficam juntos (não quebram no meio da palavra).
 */
/** Linha de tablatura (e|--3--5--|, E|-----, |--0--2--|): vai em fonte de largura fixa para alinhar. */
const ehTab = (t) => /^\s*([A-Ga-g][#b]?\s*)?\|.*-{2,}/.test(t) || /-{3,}\d|\d-{3,}/.test(t);
function linhaCifrada(partes, letra, acorde) {
  const ancoras = [];
  let col = 0;
  for (const b of partes) {
    if (b.text.trim()) {
      const html = b.chord ? acorde(b) : `<span class="mk">${esc(b.text)}</span>`,
        ult = ancoras[ancoras.length - 1];
      ult && ult.fim === col
        ? ((ult.html += html), (ult.fim += b.text.length))
        : ancoras.push({
            col,
            fim: col + b.text.length,
            html,
          });
    }
    col += b.text.length;
  }
  const blocos = [],
    pedacos = (txt, html) => {
      const ps = txt.match(/^\s*\S*\s*|\S+\s*/g) || [""];
      ps.forEach(
        (t, i) =>
          (t || (i === 0 && html)) &&
          blocos.push({
            html: i === 0 ? html : "",
            txt: t,
          }),
      );
    };
  ancoras.length && ancoras[0].col > 0 && pedacos(letra.slice(0, ancoras[0].col), "");
  ancoras.length || pedacos(letra, "");
  ancoras.forEach((an, i) => {
    const fim = i + 1 < ancoras.length ? ancoras[i + 1].col : letra.length;
    pedacos(an.col < letra.length ? letra.slice(an.col, Math.max(fim, an.col)) : "", an.html);
  });
  const palavras = [];
  blocos.forEach((bl, i) => {
    const ant = blocos[i - 1],
      junta = ant && /\S$/.test(ant.txt) && /^\S/.test(bl.txt);
    junta ? palavras[palavras.length - 1].push(bl) : palavras.push([bl]);
  });
  return (
    '<div class="ln par">' +
    palavras
      .map(
        (w) =>
          '<span class="pw">' +
          w
            .map(
              (bl) =>
                `<span class="bl"><span class="cr">${bl.html}</span><span class="ly">${esc(bl.txt) || " "}</span></span>`,
            )
            .join("") +
          "</span>",
      )
      .join("") +
    "</div>"
  );
}
/**
 * Monta o HTML da folha de uma cifra já lida (lerCifra), com os acordes deslocados "desloc"
 * semitons e escritos com bemol ou sustenido. Devolve {html, acordes}: acordes na ordem em que
 * aparecem, sem repetir (para os desenhos). Usada na tela e na impressão.
 */
function montarFolha(cifra, desloc, bemol) {
  const acordes = [];
  let p = "";
  let src = null;
  const acorde = (b) => (
    acordes.includes(b.chord) || acordes.push(b.chord),
    `<b class="ch" data-c="${esc(b.chord)}"${src != null && b.tok ? ` data-l="${src}" data-p="${b.tok.pos + b.tok.pre.length}" data-n="${b.tok.core.length}"` : ""}>${esc(b.chord)}</b>`
  );
  const t = cifra,
    a = desloc,
    r = bemol;
  for (let idx = 0; idx < t.lines.length; idx++) {
    const h = t.lines[idx];
    if (h.kind === "blank") {
      p && (p += '<div class="gap"></div>');
      continue;
    }
    if (h.kind === "sec") {
      p += `</div><div class="secao"><div class="ln sec">${esc(h.text)}</div>`;
      continue;
    }
    if (h.kind === "lyr") {
      p += `<div class="ln ${ehTab(h.text) ? "tab" : "lyr"}">${esc(h.text)}</div>`;
      continue;
    }
    src = h.src;
    const g = posicionarAcordes(h.toks, a, r),
      prox = t.lines[idx + 1];
    if (prox && prox.kind === "lyr") {
      (p += linhaCifrada(g, prox.text, acorde)), idx++;
      continue;
    }
    p += '<div class="ln chords">' + g.map((b) => (b.chord ? acorde(b) : esc(b.text))).join("") + "</div>";
  }
  return {
    html: p
      ? ('<div class="secao">' + p + "</div>").replace(
          /<div class="secao">(<div class="gap"><\/div>)*<\/div>/g,
          "",
        )
      : "",
    acordes,
  };
}
function renderizar() {
  const e = editorTexto.value,
    t = lerCifra(e),
    n = acordesDaCifra(t);
  tomOriginal = tomDeTexto(t.meta.key) || estimarTom(n);
  const s = transporTom(tomOriginal, estado.semis),
    i = transporTom(tomOriginal, deslocamentoDasFormas()),
    r = preferirBemol(i),
    a = deslocamentoDasFormas();
  (elemento("shTitle").textContent = elemento("songTitle").value || t.meta.title || "Sem título"),
    (elemento("shSub").textContent = elemento("songArtist").value || t.meta.artist || ""),
    (elemento("keyBox").textContent = nomeDoTom(s, preferirBemol(s))),
    (elemento("cbKey").textContent = nomeDoTom(s, preferirBemol(s)));
  let l = "";
  tomOriginal &&
    ((l += `<span class="pill">Tom original ${esc(nomeDoTom(tomOriginal))}</span>`),
    estado.semis &&
      (l += `<span class="pill">${estado.semis > 0 ? "+" : ""}${estado.semis} semitom${Math.abs(estado.semis) > 1 ? "s" : ""} · soa em ${esc(nomeDoTom(s, preferirBemol(s)))}</span>`),
    estado.inst === "guitar" &&
      estado.capo &&
      (l += `<span class="pill warn">Capo na ${estado.capo}ª casa · formas de ${esc(nomeDoTom(i, r))}</span>`));
  const u = estado.inst === "guitar" ? sugerirCapo(n, estado.semis, estado.capo) : null;
  u != null &&
    u !== estado.capo &&
    (l += `<span class="pill">Mais fácil com capo ${u} <button id="applyCapo" data-c="${u}">usar</button></span>`),
    (elemento("keyLine").innerHTML = l);
  const f = document.getElementById("applyCapo");
  f &&
    (f.onclick = () => {
      (estado.capo = Number(f.dataset.c)),
        (elemento("capoSel").value = String(estado.capo)),
        guardarCapo(),
        renderizar();
    });
  const { html: folha, acordes: c } = montarFolha(t, a, r);
  (elemento("sheet").innerHTML =
    folha || '<p class="empty">Cole ou escreva uma cifra no editor para ela aparecer aqui.</p>'),
    (elemento("diagrams").innerHTML = c
      .map((h) => {
        const g = lerAcorde(h),
          b = estado.inst === "guitar" ? posicoesViolao(g.root, g.iv, g.bass).length : 0,
          x = estado.voice[h] || 0,
          k =
            b > 1
              ? `<div class="cyc"><button data-d="-1" aria-label="Posição anterior de ${esc(h)}">‹</button>${Math.min(x, b - 1) + 1}/${b}<button data-d="1" aria-label="Próxima posição de ${esc(h)}">›</button></div>`
              : "";
        return `<div class="dcard" data-c="${esc(h)}"><div class="nm">${esc(h)}</div>${desenhoAcorde(h, r, x)}${k}</div>`;
      })
      .join("")),
    marcarSalvo(),
    marcarFavorito(),
    guardado.set("draft", {
      text: e,
      title: elemento("songTitle").value,
      artist: elemento("songArtist").value,
      id: estado.songId,
      base: estado.songBase,
      salvo: estado.salvo,
    });
}
elemento("diagrams").addEventListener("click", (e) => {
  const t = e.target.closest("button[data-d]");
  if (!t) return;
  const n = t.closest(".dcard").dataset.c,
    s = lerAcorde(n),
    i = posicoesViolao(s.root, s.iv, s.bass).length;
  (estado.voice[n] = ((((estado.voice[n] || 0) + Number(t.dataset.d)) % i) + i) % i), renderizar();
});
elemento("sheet").addEventListener("click", (e) => {
  const t = e.target.closest(".ch");
  if (!t) return;
  if (estado.editor && !culto && t.dataset.l != null) return abrirEdicaoAcorde(t);
  const n = [...document.querySelectorAll(".dcard")].find((s) => s.dataset.c === t.dataset.c);
  n &&
    (n.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    }),
    n.classList.add("flash"),
    setTimeout(() => n.classList.remove("flash"), 900));
});
const seletorCapo = elemento("capoSel");
for (let e = 0; e <= 9; e++)
  seletorCapo.insertAdjacentHTML(
    "beforeend",
    `<option value="${e}">${e ? e + "ª casa" : "Sem capo"}</option>`,
  );
elemento("tUp").onclick = () => {
  (estado.semis = estado.semis >= 11 ? 0 : estado.semis + 1), renderizar();
};
elemento("tDown").onclick = () => {
  (estado.semis = estado.semis <= -11 ? 0 : estado.semis - 1), renderizar();
};
elemento("tReset").onclick = () => {
  (estado.semis = 0), renderizar();
};
/** Capo que esta pessoa usa em cada música. Fica só neste aparelho. */
function guardarCapo() {
  if (!estado.songId) return;
  const capos = guardado.get("capos", {});
  estado.capo ? (capos[estado.songId] = estado.capo) : delete capos[estado.songId],
    guardado.set("capos", capos);
}
seletorCapo.onchange = () => {
  (estado.capo = Number(seletorCapo.value)), guardarCapo(), renderizar();
};
elemento("accSel").onchange = (e) => {
  (estado.acc = e.target.value), renderizar();
};
function escolherInstrumento(e) {
  (estado.inst = e),
    elemento("instGuitar").setAttribute("aria-pressed", String(e === "guitar")),
    elemento("instKeys").setAttribute("aria-pressed", String(e === "keys")),
    (elemento("capoGrp").hidden = e !== "guitar"),
    guardado.set("inst", e),
    renderizar(),
    analise && atualizarAcordeAtual(!0);
}
elemento("instGuitar").onclick = () => escolherInstrumento("guitar");
elemento("instKeys").onclick = () => escolherInstrumento("keys");
function tamanhoLetra(e) {
  (estado.size = Math.max(12, Math.min(40, e))),
    document.documentElement.style.setProperty("--sheet-size", estado.size + "px"),
    guardado.set("size", estado.size);
}
elemento("fUp").onclick = () => tamanhoLetra(estado.size + 1);
elemento("fDown").onclick = () => tamanhoLetra(estado.size - 1);
function mostrarEditor(e) {
  (estado.editor = e),
    elemento("cifraGrid").classList.toggle("no-editor", !e),
    elemento("editorBtn").setAttribute("aria-pressed", String(e));
}
elemento("editorBtn").onclick = () => mostrarEditor(!estado.editor);
let timerDigitacao = 0;
for (const e of ["src", "songTitle", "songArtist"])
  elemento(e).addEventListener("input", () => {
    clearTimeout(timerDigitacao), (timerDigitacao = window.setTimeout(renderizar, 180));
  });
let rolando = !1,
  ultimoQuadro = 0,
  rolagemAcumulada = 0,
  travaRolagem = null;
function passoRolagem(e) {
  if (rolando) {
    if (ultimoQuadro) {
      rolagemAcumulada += ((e - ultimoQuadro) / 1e3) * Number(elemento("scrollSpeed").value) * 9;
      const t = Math.floor(rolagemAcumulada);
      t && (window.scrollBy(0, t), (rolagemAcumulada -= t));
    }
    if (
      ((ultimoQuadro = e), window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2)
    ) {
      rolar(!1);
      return;
    }
    requestAnimationFrame(passoRolagem);
  }
}
async function rolar(e) {
  var n;
  rolando = e;
  for (const b of [elemento("scrollBtn"), elemento("cbScroll")])
    b.setAttribute("aria-pressed", String(e)), (b.textContent = e ? "❚❚ Pausar" : "▶ Rolar");
  if (e) {
    (ultimoQuadro = 0), requestAnimationFrame(passoRolagem);
    try {
      travaRolagem = (await ((n = navigator.wakeLock) == null ? void 0 : n.request("screen"))) ?? null;
    } catch {}
  } else travaRolagem == null || travaRolagem.release().catch(() => {}), (travaRolagem = null);
}
elemento("scrollBtn").onclick = () => rolar(!rolando);
function avisoEditor(e) {
  (elemento("edStatus").textContent = e),
    window.setTimeout(() => {
      elemento("edStatus").textContent === e && (elemento("edStatus").textContent = "");
    }, 3500);
}
async function copiar(e, t) {
  try {
    await navigator.clipboard.writeText(e), avisoEditor(t);
  } catch {
    editorTexto.focus(), editorTexto.select(), avisoEditor("Texto selecionado. Use Ctrl+C para copiar.");
  }
}
elemento("saveBtn").onclick = async () => {
  const botao = elemento("saveBtn"),
    t = lerCifra(editorTexto.value);
  if (!editorTexto.value.trim()) return avisoEditor("Escreva ou cole a cifra antes de salvar.");
  botao.disabled = !0;
  try {
    const { cifra, como } = await biblioteca.salvar(
      {
        id: estado.songId,
        title: elemento("songTitle").value || t.meta.title || "Sem título",
        artist: elemento("songArtist").value || t.meta.artist || "",
        text: editorTexto.value,
      },
      estado.songBase,
    );
    (estado.songId = cifra.id),
      (estado.songBase = como === "pendente" ? estado.songBase : cifra.updated),
      (estado.salvo = instantaneo()),
      renderizar(),
      renderizarBiblioteca();
    avisoEditor(
      como === "copia"
        ? `Outra pessoa tinha alterado essa cifra. A sua versão foi salva como “${cifra.title}”.`
        : como === "pendente"
          ? `Sem internet: “${cifra.title}” ficou guardada neste aparelho e vai para a biblioteca quando a conexão voltar.`
          : `“${cifra.title}” salva na biblioteca compartilhada.`,
    );
  } catch (erro) {
    avisoEditor(erro.message || "Não consegui salvar.");
  } finally {
    botao.disabled = !1;
  }
};
const ehLinhaDeAcordes = (t) => !!lerLinhaDeAcordes(t.replace(/\t/g, "    "));
elemento("importFile").onchange = async (e) => {
  const entrada = e.target,
    arquivo = entrada.files && entrada.files[0];
  if (!arquivo) return;
  entrada.value = "";
  const nome = arquivo.name.replace(/\.[^.]+$/, "");
  try {
    const pdf = /\.pdf$/i.test(arquivo.name) || arquivo.type === "application/pdf";
    pdf && avisoEditor("Lendo o PDF…");
    const texto = pdf ? await textoDoPdf(arquivo, ehLinhaDeAcordes) : await arquivo.text(),
      cab = separarCabecalho(texto, ehLinhaDeAcordes);
    abrirCifra({ title: cab.title || nome, artist: cab.artist, text: cab.texto, id: null }),
      mostrarEditor(!0);
    avisoEditor(
      pdf
        ? `PDF “${arquivo.name}” lido. Confira os acordes (toque num acorde para acertar a posição) e salve.`
        : `Arquivo “${arquivo.name}” aberto.`,
    );
  } catch (erro) {
    avisoEditor(erro.message || "Não consegui ler esse arquivo.");
  }
};
// Colou uma cifra de site (com nome, artista e "Tom:" no começo): separa o nome e o artista.
editorTexto.addEventListener("paste", () =>
  setTimeout(() => {
    if (elemento("songTitle").value.trim()) return;
    const cab = separarCabecalho(editorTexto.value, ehLinhaDeAcordes);
    cab.title &&
      ((elemento("songTitle").value = cab.title),
      (elemento("songArtist").value = cab.artist),
      (editorTexto.value = cab.texto),
      renderizar(),
      avisoEditor(`Reconheci “${cab.title}”${cab.artist ? ` de ${cab.artist}` : ""}. Confira e salve.`));
  }),
);

/* ===================== Editar acorde direto na cifra ===================== */
// Com o editor aberto, tocar num acorde abre ‹ › (mover uma letra), o nome e Apagar. As mudanças
// vão para o texto do editor, no tom original da cifra (o que está na tela pode estar transposto).
let acAlvo = null; // {l: linha do texto, p: coluna do acorde, n: tamanho}
function textoNormalizado() {
  // As colunas da folha são as do texto já limpo (sem invisíveis, tab = 4 espaços): o editor passa a usar o mesmo.
  const limpo = editorTexto.value
    .replace(/\r/g, "")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\t/g, "    ");
  limpo !== editorTexto.value && (editorTexto.value = limpo);
  return limpo.split("\n");
}
function posicionarEdicao() {
  const el = acAlvo && elemento("sheet").querySelector(`.ch[data-l="${acAlvo.l}"][data-p="${acAlvo.p}"]`),
    caixa = elemento("acEdit");
  if (!el) return fecharEdicaoAcorde();
  document.querySelectorAll(".ch.editando").forEach((x) => x.classList.remove("editando")),
    el.classList.add("editando");
  // Acima do acorde, para não cobrir a letra que fica embaixo dele (é por ela que se acerta a posição).
  const r = el.getBoundingClientRect(),
    larg = caixa.offsetWidth || 300,
    alto = caixa.offsetHeight || 52,
    acima = r.top - alto - 8 > 0;
  (caixa.style.top = (acima ? r.top - alto - 8 : r.bottom + r.height * 1.6 + 8) + scrollY + "px"),
    (caixa.style.left = Math.max(8, Math.min(r.left + scrollX, innerWidth - larg - 8)) + "px");
}
function abrirEdicaoAcorde(el) {
  (acAlvo = { l: Number(el.dataset.l), p: Number(el.dataset.p), n: Number(el.dataset.n) }),
    (elemento("acNome").value = el.dataset.c),
    (elemento("acEdit").hidden = !1),
    posicionarEdicao(),
    elemento("acNome").focus(),
    elemento("acNome").select();
}
function fecharEdicaoAcorde() {
  (acAlvo = null), (elemento("acEdit").hidden = !0);
  document.querySelectorAll(".ch.editando").forEach((x) => x.classList.remove("editando"));
}
function mudarLinha(fn) {
  const linhas = textoNormalizado(),
    { l, p, n } = acAlvo,
    linha = (linhas[l] || "").padEnd(p + n),
    nova = fn(linha, p, n);
  if (!nova) return;
  (linhas[l] = nova.linha.replace(/\s+$/, "")), (editorTexto.value = linhas.join("\n"));
  (acAlvo = nova.alvo), renderizar(), acAlvo ? posicionarEdicao() : fecharEdicaoAcorde();
}
elemento("acEdit").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-m]");
  if (!b || !acAlvo) return;
  const m = Number(b.dataset.m);
  mudarLinha((linha, p, n) => {
    const acorde = linha.slice(p, p + n);
    if (m < 0) {
      if (p === 0 || linha[p - 1] !== " ") return null; // já encostado no começo ou em outro acorde
      return {
        linha: linha.slice(0, p - 1) + acorde + " " + linha.slice(p + n),
        alvo: { l: acAlvo.l, p: p - 1, n },
      };
    }
    const depois = linha.slice(p + n);
    return {
      linha: linha.slice(0, p) + " " + acorde + (depois.startsWith(" ") ? depois.slice(1) : depois),
      alvo: { l: acAlvo.l, p: p + 1, n },
    };
  });
});
function trocarNomeAcorde() {
  if (!acAlvo) return;
  const novo = elemento("acNome").value.trim(),
    lido = lerAcorde(novo);
  if (!lido) return avisoEditor(`“${novo}” não é um acorde que eu reconheça.`);
  // O nome digitado está no tom da tela; no texto vai no tom original.
  const original = nomeAcorde(lido, -deslocamentoDasFormas(), tomOriginal ? tomUsaBemol(tomOriginal) : !1);
  mudarLinha((linha, p, n) => {
    const depois = linha.slice(p + n),
      diferenca = original.length - n,
      espacos = depois.match(/^ */)[0].length,
      // Acorde maior: ocupa os espaços que vêm depois, deixando pelo menos um antes do próximo
      // acorde, para não empurrar os outros. Acorde menor: completa com espaços.
      consome = diferenca > 0 ? Math.min(diferenca, depois.trim() ? Math.max(0, espacos - 1) : espacos) : 0,
      resto = diferenca < 0 ? " ".repeat(-diferenca) + depois : depois.slice(consome);
    return { linha: linha.slice(0, p) + original + resto, alvo: { l: acAlvo.l, p, n: original.length } };
  });
}
elemento("acOk").onclick = () => {
  const el = acAlvo && elemento("sheet").querySelector(`.ch[data-l="${acAlvo.l}"][data-p="${acAlvo.p}"]`);
  el && elemento("acNome").value.trim() !== el.dataset.c && trocarNomeAcorde(), fecharEdicaoAcorde();
};
elemento("acNome").addEventListener("keydown", (e) => {
  e.key === "Enter" && (e.preventDefault(), elemento("acOk").click()),
    e.key === "Escape" && fecharEdicaoAcorde();
});
elemento("acApagar").onclick = () =>
  mudarLinha((linha, p, n) => ({
    linha: linha.slice(0, p) + " ".repeat(n) + linha.slice(p + n),
    alvo: null,
  }));
document.addEventListener("click", (e) => {
  acAlvo && !e.target.closest("#acEdit, .ch") && fecharEdicaoAcorde();
});
window.addEventListener("resize", () => acAlvo && posicionarEdicao());
elemento("copyBtn").onclick = () => copiar(editorTexto.value, "Texto copiado.");
elemento("copyTrBtn").onclick = () => {
  const e = transporTom(tomOriginal, deslocamentoDasFormas());
  copiar(
    transporTexto(editorTexto.value, deslocamentoDasFormas(), preferirBemol(e)),
    "Texto copiado no tom atual.",
  );
};
function abrirCifra(e) {
  e.id &&
    !String(e.id).startsWith("p") &&
    guardado.set("recentes", [e.id, ...guardado.get("recentes", []).filter((x) => x !== e.id)].slice(0, 12));
  (elemento("songTitle").value = e.title || ""),
    (elemento("songArtist").value = e.artist || ""),
    (editorTexto.value = e.text || ""),
    (estado.songId = e.id),
    (estado.songBase = e.updated ?? null),
    (estado.semis = 0),
    (estado.capo = (e.id && guardado.get("capos", {})[e.id]) || 0),
    (seletorCapo.value = String(estado.capo)),
    (estado.voice = {}),
    (estado.salvo = e.id ? instantaneo() : null),
    renderizar();
}
const semAcento = (e) => (e || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
let libDesfazer = null;
function libAviso(texto, desfazerId = null) {
  libDesfazer = desfazerId;
  elemento("libMsg").innerHTML = texto
    ? esc(texto) + (desfazerId ? ' <button class="btn ghost" data-a="undo">Desfazer</button>' : "")
    : "";
}
function renderizarBiblioteca() {
  const pend = biblioteca.pendentes(),
    total = biblioteca.cifras.length;
  elemento("libStatus").textContent =
    biblioteca.conectado === !1
      ? `Sem conexão com o servidor. Mostrando a última cópia que este aparelho recebeu (${total} cifra${total === 1 ? "" : "s"}).`
      : biblioteca.conectado
        ? `${total} cifra${total === 1 ? "" : "s"} · todo mundo que abre o Cifrador vê e edita esta biblioteca.`
        : "Carregando a biblioteca…";
  elemento("libPend").hidden = !pend.length;
  pend.length &&
    (elemento("libPendTxt").textContent =
      pend.length === 1
        ? "1 cifra está só neste aparelho e ainda não foi para a biblioteca compartilhada."
        : `${pend.length} cifras estão só neste aparelho e ainda não foram para a biblioteca compartilhada.`);
  const busca = semAcento(elemento("libBusca").value.trim()),
    lista = [
      ...pend.map((t) => ({
        ...t,
        pendente: !0,
      })),
      ...[...biblioteca.cifras].sort(ordemDaLista),
    ]
      .filter(passaFiltro)
      .filter((t) => !busca || semAcento(t.title + " " + t.artist + " " + t.text).includes(busca));
  marcarFiltros();
  if (!lista.length) {
    elemento("libGrid").innerHTML =
      busca || filtroTipo !== "todas"
        ? '<p class="empty">Nenhuma cifra encontrada com essa busca.</p>'
        : '<p class="empty">Nenhuma cifra salva ainda. No editor, toque em “Salvar na biblioteca”.</p>';
    return;
  }
  elemento("libGrid").innerHTML = lista
    .map((t) => {
      const g = lerCifra(t.text),
        n = [...new Set(acordesDaCifra(g).map((s) => nomeAcorde(s)))].slice(0, 8).join("  ");
      return `<article class="song" data-id="${esc(t.id)}"><div class="songtop"><h4><button class="linkbtn" data-a="open">${esc(t.title)}</button></h4><span class="tom" title="Tom">${esc(tomDe(t))}</span></div><div class="meta">${esc(t.artist || "Artista não informado")}${t.pendente ? ' · <span class="pend">só neste aparelho</span>' : ""}</div><div class="chs">${esc(n)}</div><div class="row"><button class="btn primary" data-a="play">▶ Tocar</button><button class="btn" data-a="open">Abrir e editar</button><button class="btn ghost" data-a="del">Excluir</button></div></article>`;
    })
    .join("");
}
async function libAtualizar() {
  try {
    await biblioteca.carregar();
  } catch (erro) {
    libAviso(erro.message);
  }
  renderizarBiblioteca();
}
elemento("libBusca").addEventListener("input", () => renderizarBiblioteca());
elemento("libEnviar").onclick = async () => {
  const botao = elemento("libEnviar");
  botao.disabled = !0;
  try {
    const n = await biblioteca.enviarPendentes();
    libAviso(n === 1 ? "1 cifra enviada para a biblioteca." : `${n} cifras enviadas para a biblioteca.`);
    await biblioteca.carregar().catch(() => {});
  } catch (erro) {
    libAviso(
      erro.codigo === "offline" ? "Sem conexão com o servidor. Tente de novo mais tarde." : erro.message,
    );
  } finally {
    (botao.disabled = !1), renderizarBiblioteca();
  }
};
elemento("libMsg").addEventListener("click", async (e) => {
  if (!e.target.closest('button[data-a="undo"]') || !libDesfazer) return;
  try {
    const c = await biblioteca.restaurar(libDesfazer);
    libAviso(`“${c.title}” voltou para a biblioteca.`);
  } catch (erro) {
    libAviso(erro.message);
  }
  renderizarBiblioteca();
});
elemento("libGrid").addEventListener("click", async (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  const n = t.closest(".song").dataset.id,
    i = biblioteca.achar(n);
  if (t.dataset.a === "open" && i)
    return (
      abrirCifra(i),
      mostrarEditor(!window.matchMedia("(max-width: 860px)").matches),
      mostrarAba("cifra"),
      scrollTo(0, 0)
    );
  if (t.dataset.a === "play" && i) return abrirCifra(i), entrarCulto();
  if (t.dataset.a === "del")
    return (
      (t.textContent = "Confirmar exclusão"), (t.dataset.a = "del2"), void (t.style.color = "var(--danger)")
    );
  if (t.dataset.a !== "del2" || !i) return;
  t.disabled = !0;
  try {
    const pend = biblioteca.pendentes().some((r) => r.id === n) && !biblioteca.cifras.some((r) => r.id === n);
    await biblioteca.apagar(n), estado.songId === n && ((estado.songId = null), (estado.songBase = null));
    libAviso(`“${i.title}” foi excluída.`, pend ? null : n);
  } catch (erro) {
    libAviso(
      erro.codigo === "offline" ? "Sem conexão com o servidor: não deu para excluir agora." : erro.message,
    );
  }
  renderizarBiblioteca();
});
document.addEventListener("visibilitychange", () => {
  !document.hidden && !elemento("tab-lib").hidden && libAtualizar();
});
function mostrarAba(e) {
  const atual = [...document.querySelectorAll(".view")].find((t) => !t.hidden);
  atual && e === "cifra" && atual.id !== "tab-cifra" && (estado.abaAnterior = atual.id.slice(4));
  document.querySelectorAll(".view").forEach((t) => (t.hidden = t.id !== "tab-" + e)),
    document
      .querySelectorAll(".tabs button")
      .forEach((t) =>
        t.setAttribute(
          "aria-selected",
          String(t.dataset.tab === (e === "cifra" ? estado.abaAnterior || "lib" : e)),
        ),
      ),
    e !== "cifra" && rolando && rolar(!1),
    e === "lib" && libAtualizar(),
    e === "busca" && buscaAtualizar(),
    e === "culto" && repAtualizar(),
    e !== "cifra" && culto && sairCulto(),
    guardado.set("tab", e);
}
document.querySelectorAll(".tabs button").forEach((e) => (e.onclick = () => mostrarAba(e.dataset.tab)));
let analise = null,
  player = null,
  urlMidia = null,
  corrigindoAcordes = !1,
  quadroPlayer = 0,
  nomeArquivo = "",
  resultadoServidor = null,
  servidorConectado = !1;
function statusAudio(e, t = !1) {
  (elemento("auStatus").textContent = e), elemento("auStatus").classList.toggle("err", t);
}
const progresso = (e) => (elemento("prog").style.width = (e * 100).toFixed(0) + "%");
function criarPlayer(e, t) {
  urlMidia && URL.revokeObjectURL(urlMidia),
    (urlMidia = e),
    (elemento("media").innerHTML = t
      ? '<video id="player" controls playsinline></video>'
      : '<audio id="player" controls></audio>'),
    (player = elemento("player")),
    (player.src = e),
    player.addEventListener("play", () => {
      cancelAnimationFrame(quadroPlayer);
      const n = () => {
        atualizarAcordeAtual(), player && !player.paused && (quadroPlayer = requestAnimationFrame(n));
      };
      n();
    }),
    player.addEventListener("seeked", () => atualizarAcordeAtual()),
    player.addEventListener("pause", () => atualizarAcordeAtual());
}
async function analisarLocal(e) {
  const t = await reamostrar(e);
  return (
    statusAudio("Analisando as notas…"),
    analisarNoWorker(
      t,
      TAXA_ANALISE,
      {
        penalty: Number(elemento("optSens").value),
        sevenths: elemento("optSev").checked,
      },
      progresso,
    )
  );
}
function opcoesServidor() {
  return {
    lyrics: elemento("apiLyrics").checked,
    separate: elemento("apiSeparate").checked,
    sevenths: elemento("optSev").checked,
    language: "pt",
  };
}
const PASSOS_SERVIDOR = {
  queued: "Na fila…",
  download: "Baixando o áudio…",
  decode: "Lendo o áudio…",
  separate: "Separando os instrumentos…",
  chords: "Tirando os acordes…",
  lyrics: "Transcrevendo a letra…",
  align: "Encaixando acordes na letra…",
};
async function analisarNoServidor(e) {
  const t = await servidorAnalisar(elemento("apiUrl").value, e, opcoesServidor(), (n, s) => {
    statusAudio(PASSOS_SERVIDOR[n] || n), progresso(s);
  });
  return progresso(1), t;
}
function resultadoDoServidor(e) {
  return {
    key: tomDeTexto(e.key) || {
      tonic: 0,
      minor: !1,
    },
    duration: e.duration,
    segments: e.chords.map((n) => ({
      ...n,
      none: !n.label,
    })),
  };
}
async function abrirArquivoMidia(e) {
  if (!e) return;
  (nomeArquivo = e.name.replace(/\.[^.]+$/, "")),
    progresso(0),
    (resultadoServidor = null),
    statusAudio(`Lendo “${e.name}”…`);
  const t = /^video\//.test(e.type) || /\.(mp4|webm|mov|m4v|mkv)$/i.test(e.name);
  try {
    criarPlayer(URL.createObjectURL(e), t),
      servidorConectado && elemento("apiUse").checked
        ? ((resultadoServidor = await analisarNoServidor({
            file: e,
          })),
          mostrarResultado(resultadoDoServidor(resultadoServidor)))
        : mostrarResultado(await analisarLocal(await decodificarAudio(e)));
  } catch (n) {
    console.error(n),
      statusAudio(
        n instanceof Error && servidorConectado
          ? n.message
          : "Não consegui ler o áudio desse arquivo. Tente um mp3, m4a, wav, mp4 ou webm.",
        !0,
      );
  }
}
function mostrarResultado(e) {
  var s;
  analise = e;
  const t = e.segments.filter((i) => !i.none).length,
    n =
      (s = resultadoServidor == null ? void 0 : resultadoServidor.warnings) != null && s.length
        ? " " + resultadoServidor.warnings.join(" ")
        : "";
  statusAudio(
    `Pronto: ${t} trechos com acorde em ${formatarTempo(e.duration)}. Dê play para acompanhar e corrija o que soar errado.${n}`,
  ),
    (elemento("resTitle").textContent =
      (resultadoServidor == null ? void 0 : resultadoServidor.title) || nomeArquivo || "Resultado"),
    (elemento("resKey").textContent = "Tom estimado: " + nomeDoTom(e.key)),
    (elemento("resActions").hidden = !1),
    (elemento("nowBox").hidden = !1),
    (elemento("openFull").hidden = !(resultadoServidor != null && resultadoServidor.chordpro)),
    renderizarLinhaDoTempo(),
    atualizarAcordeAtual(!0);
}
function segmentoNoTempo(e) {
  var s;
  const t = analise.segments;
  let n = t.findIndex((i) => e >= i.start && e < i.end);
  return n < 0 && (n = e < (((s = t[0]) == null ? void 0 : s.start) || 0) ? 0 : t.length - 1), n;
}
let ultimoSegmento = -2;
function atualizarAcordeAtual(e = !1) {
  if (!analise) return;
  const t = player ? player.currentTime : 0,
    n = segmentoNoTempo(t),
    s = analise.segments[n];
  if (
    !s ||
    ((elemento("nowBar").style.width =
      Math.min(1, (t - s.start) / Math.max(0.01, s.end - s.start)) * 100 + "%"),
    n === ultimoSegmento && !e)
  )
    return;
  ultimoSegmento = n;
  const i = analise.segments.find((r, a) => a > n && !r.none);
  (elemento("nowChord").textContent = s.none ? "–" : s.label),
    (elemento("nextChord").textContent = i ? i.label : "fim"),
    (elemento("nowDiag").innerHTML = s.none ? "" : desenhoAcorde(s.label, tomUsaBemol(analise.key))),
    document.querySelectorAll(".chip").forEach((r) => r.classList.toggle("cur", Number(r.dataset.i) === n));
}
function renderizarLinhaDoTempo() {
  elemento("timeline").innerHTML = analise.segments
    .map((e, t) =>
      e.none
        ? ""
        : `<button class="chip" data-i="${t}"><span class="c">${esc(e.label)}</span><span class="t">${formatarTempo(e.start)}</span></button>`,
    )
    .join("");
}
elemento("timeline").addEventListener("click", (e) => {
  const t = e.target,
    n = t.closest(".chip");
  if (!n || !analise || t.tagName === "INPUT") return;
  const s = Number(n.dataset.i),
    i = analise.segments[s];
  if (!corrigindoAcordes) {
    player && ((player.currentTime = i.start + 0.01), atualizarAcordeAtual(!0));
    return;
  }
  n.querySelector(".c").outerHTML =
    `<input id="chipEdit" value="${esc(i.label)}" aria-label="Acorde em ${formatarTempo(i.start)}">`;
  const r = elemento("chipEdit");
  r.focus(),
    r.select(),
    r.addEventListener(
      "blur",
      () => {
        const a = r.value.trim();
        a
          ? lerAcorde(a) && (i.label = a)
          : (analise.segments.splice(s, 1), s > 0 && (analise.segments[s - 1].end = i.end)),
          (resultadoServidor = null),
          (elemento("openFull").hidden = !0),
          renderizarLinhaDoTempo(),
          (ultimoSegmento = -2),
          atualizarAcordeAtual(!0);
      },
      {
        once: !0,
      },
    ),
    r.addEventListener("keydown", (a) => {
      a.key === "Enter" && r.blur(), a.key === "Escape" && ((r.value = i.label), r.blur());
    });
});
elemento("editChips").onclick = () => {
  (corrigindoAcordes = !corrigindoAcordes),
    elemento("editChips").setAttribute("aria-pressed", String(corrigindoAcordes)),
    (elemento("editHint").hidden = !corrigindoAcordes);
};
elemento("toSheet").onclick = () => {
  if (!analise) return;
  const e = analise.segments.filter((n) => !n.none);
  let t = `{t: ${nomeArquivo || "Música"}}
{key: ${nomeDoTom(analise.key)}}

[Acordes tirados do áudio]
`;
  for (let n = 0; n < e.length; n += 4) {
    const s = e.slice(n, n + 4);
    t +=
      formatarTempo(s[0].start).padEnd(7) +
      s
        .map((i) => i.label.padEnd(8))
        .join("")
        .trimEnd() +
      `

`;
  }
  (t += `[Escreva a letra embaixo de cada linha de acordes]
`),
    abrirCifra({
      title: nomeArquivo,
      artist: "",
      text: t,
      id: null,
    }),
    mostrarEditor(!0),
    mostrarAba("cifra"),
    window.scrollTo(0, 0);
};
elemento("openFull").onclick = () => {
  resultadoServidor &&
    (abrirCifra({
      title: resultadoServidor.title || nomeArquivo,
      artist: "",
      text: resultadoServidor.chordpro,
      id: null,
    }),
    mostrarAba("cifra"),
    window.scrollTo(0, 0));
};
elemento("mediaFile").onchange = (e) => {
  var n;
  const t = e.target;
  abrirArquivoMidia((n = t.files) == null ? void 0 : n[0]), (t.value = "");
};
const areaSoltar = elemento("drop");
for (const e of ["dragenter", "dragover"])
  areaSoltar.addEventListener(e, (t) => {
    t.preventDefault(), areaSoltar.classList.add("over");
  });
for (const e of ["dragleave", "drop"])
  areaSoltar.addEventListener(e, (t) => {
    t.preventDefault(), areaSoltar.classList.remove("over");
  });
areaSoltar.addEventListener("drop", (e) => {
  var t;
  return abrirArquivoMidia((t = e.dataTransfer) == null ? void 0 : t.files[0]);
});
elemento("demoBtn").onclick = async () => {
  (nomeArquivo = "Exemplo sintetizado"),
    (resultadoServidor = null),
    progresso(0),
    statusAudio("Gerando o áudio de exemplo…");
  try {
    const e = await gerarAudioExemplo();
    criarPlayer(URL.createObjectURL(paraWav(e)), !1), mostrarResultado(await analisarLocal(e));
  } catch (e) {
    console.error(e), statusAudio("Este navegador não conseguiu gerar o áudio de exemplo.", !0);
  }
};
async function conectarServidor() {
  const e = elemento("apiUrl").value.trim();
  if ((guardado.set("api", e), !e)) {
    (servidorConectado = !1), (elemento("apiBox").hidden = !0), (elemento("apiFeat").innerHTML = "");
    return;
  }
  elemento("apiFeat").innerHTML = "<span>Conectando…</span>";
  try {
    const t = await servidorSaude(e);
    (servidorConectado = !0), (elemento("apiBox").hidden = !1);
    const n = {
      youtube: "YouTube",
      lyrics: "Letra (Whisper)",
      separate: "Separação (Demucs)",
      ffmpeg: "ffmpeg",
    };
    (elemento("apiFeat").innerHTML =
      '<span class="on">Conectado</span>' +
      Object.entries(t.features)
        .map(([s, i]) => `<span class="${i ? "on" : ""}">${esc(n[s] || s)}${i ? "" : " indisponível"}</span>`)
        .join("")),
      (elemento("apiLyrics").disabled = !t.features.lyrics),
      (elemento("apiLyrics").checked = !!t.features.lyrics),
      (elemento("apiSeparate").disabled = !t.features.separate),
      (elemento("ytUrl").disabled = elemento("ytGo").disabled = !t.features.youtube);
  } catch {
    (servidorConectado = !1),
      (elemento("apiBox").hidden = !0),
      (elemento("apiFeat").innerHTML =
        "<span>Não consegui falar com o servidor. Confira o endereço e se ele está rodando.</span>");
  }
}
elemento("apiConnect").onclick = conectarServidor;
elemento("ytGo").onclick = async () => {
  const e = elemento("ytUrl").value.trim();
  if (e) {
    progresso(0), (nomeArquivo = "");
    try {
      (resultadoServidor = await analisarNoServidor({
        url: e,
      })),
        (nomeArquivo = resultadoServidor.title),
        (elemento("media").innerHTML =
          `<p class="hint">Áudio do link analisado no servidor. <a href="${esc(e)}" target="_blank" rel="noopener">Abrir o vídeo</a> para ouvir junto.</p>`),
        (player = null),
        mostrarResultado(resultadoDoServidor(resultadoServidor));
    } catch (t) {
      statusAudio(t instanceof Error ? t.message : "A análise falhou.", !0);
    }
  }
};
/* ===================== Salvo / não salvo ===================== */
function instantaneo() {
  return JSON.stringify([elemento("songTitle").value, elemento("songArtist").value, editorTexto.value]);
}
function marcarSalvo() {
  const b = elemento("saveBtn"),
    igual = estado.salvo != null && estado.salvo === instantaneo();
  (b.textContent = igual
    ? "Salvo na biblioteca ✓"
    : estado.songId
      ? "Salvar alterações"
      : "Salvar na biblioteca"),
    b.classList.toggle("ok", igual);
}

/** Tom de uma cifra da biblioteca (com semis de transposição), por exemplo "G" ou "Em". */
function tomDe(c, semis = 0) {
  const g = lerCifra(c.text || ""),
    k = tomDeTexto(g.meta.key) || estimarTom(acordesDaCifra(g));
  if (!k) return "–";
  const t = transporTom(k, semis);
  return nomeDoTom(t, tomUsaBemol(t));
}

/* ===================== Desenhos e ajustes ===================== */
function mostrarDesenhos(v) {
  (estado.diag = v),
    guardado.set("diag", v),
    elemento("diagBtn").setAttribute("aria-pressed", String(v)),
    (elemento("diagrams").hidden = !v);
}
elemento("diagBtn").onclick = () => mostrarDesenhos(!estado.diag);
elemento("maisBtn").onclick = () => {
  const aberto = elemento("maisBtn").getAttribute("aria-expanded") !== "true";
  elemento("maisBtn").setAttribute("aria-expanded", String(aberto)),
    document.querySelector(".toolbar").classList.toggle("aberta", aberto);
};
elemento("libNova").onclick = () => {
  abrirCifra({
    title: "",
    artist: "",
    text: "",
    id: null,
  }),
    mostrarEditor(!0),
    mostrarAba("cifra"),
    scrollTo(0, 0),
    elemento("songTitle").focus();
};
elemento("newBtn").onclick = () => {
  abrirCifra({
    title: "",
    artist: "",
    text: "",
    id: null,
  }),
    mostrarEditor(!0),
    elemento("songTitle").focus();
};

/* ===================== Modo culto ===================== */
// culto = null fora do modo; {rep, pos} tocando um repertório; {rep: null} tocando uma música só.
let culto = null,
  travaTela = null;
async function manterTelaAcesa(v) {
  try {
    v && !travaTela
      ? (travaTela = (await navigator.wakeLock?.request("screen")) ?? null)
      : !v && travaTela && (await travaTela.release(), (travaTela = null));
  } catch {}
}
document.addEventListener("visibilitychange", () => {
  !document.hidden && culto && ((travaTela = null), manterTelaAcesa(!0));
});
function entrarCulto(rep = null, pos = 0) {
  (culto = {
    rep,
    pos,
  }),
    rep && abrirDoRepertorio(),
    mostrarAba("cifra"),
    mostrarEditor(!1);
  document.body.classList.add("culto"),
    (elemento("cultoBar").hidden = !1),
    manterTelaAcesa(!0),
    aplicarTema();
  try {
    document.fullscreenEnabled &&
      !document.fullscreenElement &&
      document.documentElement.requestFullscreen().catch(() => {});
  } catch {}
  scrollTo(0, 0),
    barraCulto(),
    clearTimeout(ociosoTimer),
    document.body.classList.remove("ocioso"),
    dormir(),
    dicaAoEntrar();
}
function sairCulto() {
  (culto = null),
    (elemento("cbDica").hidden = !0),
    ajustarTela(),
    document.body.classList.remove("ocioso"),
    document.body.classList.remove("culto"),
    (elemento("cultoBar").hidden = !0),
    rolando && rolar(!1),
    manterTelaAcesa(!1),
    palcoNavegacao(),
    aplicarTema();
  document.fullscreenElement && document.exitFullscreen().catch(() => {});
}
function abrirDoRepertorio() {
  const it = culto.rep.itens[culto.pos],
    c = it && biblioteca.achar(it.id);
  abrirCifra(
    c || {
      title: "Música não encontrada",
      artist: "Ela foi excluída da biblioteca.",
      text: "",
      id: null,
    },
  ),
    (estado.semis = (it && it.semis) || 0),
    renderizar(),
    rolando && rolar(!1),
    scrollTo(0, 0),
    barraCulto();
}
/* ---------- Ajustar à tela: a música inteira na tela, sem rolar ---------- */
// Testa de 1 até N colunas e, para cada uma, o maior tamanho de letra em que tudo cabe; fica com o maior.
function ajustarTela() {
  const sh = elemento("sheet"),
    ligado = !!culto && estado.ajuste;
  document.body.classList.toggle("ajuste", ligado),
    elemento("cbFit").setAttribute("aria-pressed", String(ligado));
  if (!ligado) {
    document.body.classList.remove("naocabe"),
      sh.style.removeProperty("height"),
      sh.style.removeProperty("font-size"),
      sh.style.removeProperty("column-count");
    return;
  }
  sh.style.height = "auto";
  // No computador a barra some sozinha; em celular e tablet ela fica, então a música termina acima dela.
  const barra = matchMedia("(hover: hover)").matches ? 0 : elemento("cultoBar").offsetHeight,
    alto = Math.floor(window.innerHeight - sh.getBoundingClientRect().top - barra - 10);
  sh.style.height = Math.max(120, alto) + "px";
  const largura = sh.clientWidth,
    maxCols = Math.max(1, Math.min(4, Math.floor(largura / 260))),
    cabe = () => sh.scrollWidth <= sh.clientWidth + 1 && sh.scrollHeight <= sh.clientHeight + 1,
    // Parte das linhas que quebraram (linha quebrada é mais difícil de ler que letra um pouco menor).
    quebradas = (tam) => {
      const ls = sh.querySelectorAll(".ln.par, .ln.lyr, .ln.chords");
      let n = 0;
      for (const l of ls) l.offsetHeight > tam * (l.classList.contains("par") ? 3.3 : 1.9) && n++;
      return ls.length ? n / ls.length : 0;
    },
    MINIMO = 12;
  let melhor = null;
  for (let cols = 1; cols <= maxCols; cols++) {
    sh.style.columnCount = String(cols);
    let lo = MINIMO,
      hi = 56;
    if (((sh.style.fontSize = lo + "px"), !cabe())) continue;
    for (; hi - lo > 0.5; ) {
      const meio = (lo + hi) / 2;
      (sh.style.fontSize = meio + "px"), cabe() ? (lo = meio) : (hi = meio);
    }
    sh.style.fontSize = lo + "px";
    const nota = lo * (1 - 0.7 * quebradas(lo));
    (!melhor || nota > melhor.nota + 0.3) &&
      (melhor = {
        cols,
        tam: lo,
        nota,
      });
  }
  if (!melhor) {
    // Não cabe nem com a letra mínima: mostra numa coluna e deixa rolar.
    document.body.classList.add("naocabe"),
      sh.style.removeProperty("height"),
      (sh.style.columnCount = "1"),
      (sh.style.fontSize = "15px");
    return;
  }
  document.body.classList.remove("naocabe"),
    (sh.style.columnCount = String(melhor.cols)),
    (sh.style.fontSize = Math.floor(melhor.tam * 2) / 2 + "px");
}
// A escolha de ajustar fica guardada separada para tela em pé e deitada: no celular em pé a música
// costuma não caber; deitado (em cima do teclado) cabe em colunas. Computador conta como deitado.
const deitado = () => window.matchMedia("(orientation: landscape)").matches,
  ajusteChave = () => (deitado() ? "ajuste.deitado" : "ajuste.empe"),
  ajustePadrao = () =>
    guardado.get(ajusteChave(), deitado() || window.matchMedia("(min-width: 861px)").matches);
window.matchMedia("(orientation: landscape)").addEventListener("change", () => {
  (estado.ajuste = ajustePadrao()), culto && reajustar();
});
let ajusteQuadro = 0;
const reajustar = () => {
  cancelAnimationFrame(ajusteQuadro), (ajusteQuadro = requestAnimationFrame(ajustarTela));
};
window.addEventListener("resize", reajustar);
document.fonts && document.fonts.ready.then(reajustar);
elemento("cbFit").onclick = () => {
  (estado.ajuste = !estado.ajuste),
    guardado.set(ajusteChave(), estado.ajuste),
    rolando && rolar(!1),
    scrollTo(0, 0),
    ajustarTela(),
    acordar();
};
// No computador, com a música ajustada, a barra fica escondida e aparece ao mexer o mouse
// (some de novo 2,5 s depois). Teclado e pedal NÃO trazem a barra: trocar de música pelo pedal
// não pode cobrir o fim da música.
let ociosoTimer = 0;
const barraSome = () => culto && estado.ajuste && matchMedia("(hover: hover)").matches;
function dormir() {
  barraSome() &&
    !elemento("cultoBar").contains(document.activeElement) &&
    document.body.classList.add("ocioso");
}
function acordar() {
  document.body.classList.remove("ocioso"), clearTimeout(ociosoTimer);
  barraSome() && (ociosoTimer = setTimeout(dormir, 2500));
}
document.addEventListener("mousemove", (e) => (e.movementX || e.movementY) && acordar(), {
  passive: !0,
});
document.addEventListener("touchstart", acordar, {
  passive: !0,
});
elemento("cultoBar").addEventListener("focusin", acordar);
let dicaTimer = 0;
function dica(texto, ms = 3500) {
  const el = elemento("cbDica");
  (el.textContent = texto),
    (el.hidden = !1),
    clearTimeout(dicaTimer),
    (dicaTimer = setTimeout(() => (el.hidden = !0), ms));
}
function dicaAoEntrar() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) && !navigator.standalone,
    vezes = guardado.get("dicaIOS", 0);
  if (ios && vezes < 3)
    return (
      guardado.set("dicaIOS", vezes + 1),
      dica("Tela cheia no iPhone: Compartilhar → Adicionar à Tela de Início", 6000)
    );
  barraSome() && dica("Mexa o mouse para ver os controles");
}
function barraCulto() {
  reajustar(), palcoNavegacao();
  const r = culto && culto.rep;
  (elemento("cbPrev").hidden = elemento("cbNext").hidden = !r),
    (elemento("cbPos").textContent = r
      ? `${culto.pos + 1} de ${r.itens.length} · ${r.nome}`
      : elemento("shTitle").textContent);
  r &&
    ((elemento("cbPrev").disabled = culto.pos <= 0),
    (elemento("cbNext").disabled = culto.pos >= r.itens.length - 1));
}
const andar = (passo) => {
  if (!culto || !culto.rep) return;
  const novo = culto.pos + passo;
  novo >= 0 && novo < culto.rep.itens.length && ((culto.pos = novo), abrirDoRepertorio());
};
elemento("cultoBtn").onclick = () => entrarCulto();
elemento("cbExit").onclick = sairCulto;
elemento("cbPrev").onclick = () => andar(-1);
elemento("cbNext").onclick = () => andar(1);
elemento("cbUp").onclick = () => (elemento("tUp").click(), reajustar());
elemento("cbDown").onclick = () => (elemento("tDown").click(), reajustar());
const letraManual = (passo) => {
  estado.ajuste && ((estado.ajuste = !1), guardado.set(ajusteChave(), !1), ajustarTela()),
    tamanhoLetra(estado.size + passo);
};
// Botão da barra não fica com o foco: assim espaço/Enter do pedal trocam de música, não repetem o botão.
elemento("cultoBar").addEventListener("click", () =>
  setTimeout(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()),
);
elemento("cbFUp").onclick = () => letraManual(1);
elemento("cbFDown").onclick = () => letraManual(-1);
elemento("cbScroll").onclick = () => rolar(!rolando);
document.addEventListener("keydown", (e) => {
  if (!culto || e.target.closest("input, textarea, select")) return;
  const proxima = ["ArrowRight", "PageDown"].concat(estado.ajuste ? ["ArrowDown", " ", "Enter"] : []),
    anterior = ["ArrowLeft", "PageUp"].concat(estado.ajuste ? ["ArrowUp"] : []);
  if (e.key === "Escape") return sairCulto();
  proxima.includes(e.key)
    ? (e.preventDefault(), andar(1))
    : anterior.includes(e.key) && (e.preventDefault(), andar(-1));
});

/* ===================== Repertórios do culto ===================== */
let repAtual = null,
  repFila = Promise.resolve(),
  repTimer = 0;
const dataLocal = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`,
  proxDomingo = () => {
    const dt = new Date();
    return dt.setDate(dt.getDate() + ((7 - dt.getDay()) % 7)), dataLocal(dt);
  },
  dataBR = (s) =>
    s
      ? new Date(s + "T12:00").toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "Sem data";
function repAviso(t) {
  elemento("repMsg").textContent = t;
}
async function repAtualizar() {
  try {
    await biblioteca.carregar();
  } catch (erro) {
    repAviso(erro.message);
  }
  repAtual ? repItens() : repLista();
}
function repLista() {
  (elemento("repLista").hidden = !1), (elemento("repEdit").hidden = !0);
  const hoje = dataLocal(new Date()),
    lista = [...biblioteca.repertorios].sort((a, b) => {
      const fa = a.data && a.data >= hoje,
        fb = b.data && b.data >= hoje;
      return fa !== fb
        ? fa
          ? -1
          : 1
        : fa
          ? a.data.localeCompare(b.data)
          : (b.data || "").localeCompare(a.data || "");
    });
  biblioteca.conectado === !1 &&
    repAviso("Sem conexão com o servidor. Mostrando a última cópia deste aparelho.");
  const filtro = semAcento(elemento("repFiltro").value.trim()),
    visiveis = lista.filter(
      (r) =>
        !filtro ||
        semAcento(
          r.nome + " " + r.itens.map((it) => (biblioteca.achar(it.id) || { title: "" }).title).join(" "),
        ).includes(filtro),
    ),
    favs = favoritas(),
    pasta =
      '<span class="pasta" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></span>',
    linhaFav =
      !filtro && favs.length
        ? `<article class="linha fav" data-id="__fav"><span class="pasta" aria-hidden="true">★</span><button class="l-nome linkbtn" data-a="favs"><strong>Favoritas</strong><span>${favs.length} música${favs.length === 1 ? "" : "s"} · só neste aparelho</span></button><button class="btn primary" data-a="tocar">▶ Tocar</button></article>`
        : "";
  elemento("repGrid").innerHTML =
    linhaFav +
    (visiveis.length
      ? visiveis
          .map((r) => {
            const n = r.itens.length,
              pend = r.id.startsWith("t") || biblioteca.repertoriosPendentes().some((x) => x.rep.id === r.id);
            return `<article class="linha${r.data && r.data < hoje ? " passado" : ""}" data-id="${esc(r.id)}">${pasta}<button class="l-nome linkbtn" data-a="abrir"><strong>${esc(r.nome)}</strong><span>${n} música${n === 1 ? "" : "s"}${r.data ? " · " + esc(dataBR(r.data)) : ""}${pend ? ' · <span class="pend">só neste aparelho</span>' : ""}</span></button><button class="btn primary" data-a="tocar"${n ? "" : " disabled"} aria-label="Tocar ${esc(r.nome)}">▶ Tocar</button></article>`;
          })
          .join("")
      : filtro
        ? '<p class="empty">Nenhum repertório com essa busca.</p>'
        : '<p class="empty">Nenhum repertório ainda. Toque em “+ Novo” para montar o do próximo culto ou uma pasta como “Salmos e Hinos”.</p>');
}
elemento("repFiltro").addEventListener("input", () => repLista());
elemento("repGrid").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-a]");
  if (!b) return;
  const id = b.closest(".linha").dataset.id;
  if (id === "__fav") return b.dataset.a === "tocar" ? tocarFavoritas() : mostrarAba("busca");
  const r = biblioteca.repertorios.find((x) => x.id === id);
  r && (b.dataset.a === "tocar" ? r.itens.length && entrarCulto(structuredClone(r), 0) : repAbrir(r));
});
function repAbrir(r) {
  (repAtual = structuredClone(r)),
    (elemento("repLista").hidden = !0),
    (elemento("repEdit").hidden = !1),
    (elemento("repNome").value = r.nome),
    (elemento("repData").value = r.data || "");
  (elemento("repSalvo").textContent = ""),
    (elemento("repBusca").value = ""),
    (elemento("repSug").innerHTML = ""),
    (elemento("repApagar").textContent = "Excluir repertório"),
    repItens(),
    scrollTo(0, 0);
}
elemento("repNovo").onclick = () => {
  repAbrir({
    id: null,
    nome: "Novo repertório",
    data: "",
    itens: [],
  }),
    elemento("repNome").select(),
    repMudou();
};
elemento("repVoltar").onclick = () => {
  (repAtual = null), repLista();
};
function repItens() {
  const r = repAtual;
  elemento("repTocar").disabled = !r.itens.length;
  elemento("repItens").innerHTML = r.itens.length
    ? r.itens
        .map((it, i) => {
          const c = biblioteca.achar(it.id);
          return `<li data-i="${i}"><span class="alca" aria-hidden="true" title="Arraste para mudar a ordem">⠿</span><div class="ri-nome"><strong>${esc(c ? c.title : "Música excluída da biblioteca")}</strong><span>${esc(c ? c.artist || "" : "")}</span></div><div class="ri-tom" role="group" aria-label="Tom de ${esc(c ? c.title : "")}"><button class="btn sq" data-a="tom" data-d="-1" aria-label="Meio tom abaixo">−</button><span class="keybox">${esc(c ? tomDe(c, it.semis) : "–")}</span><button class="btn sq" data-a="tom" data-d="1" aria-label="Meio tom acima">+</button></div><div class="ri-ord"><button class="btn sq" data-a="sobe" aria-label="Subir"${i ? "" : " disabled"}>↑</button><button class="btn sq" data-a="desce" aria-label="Descer"${i < r.itens.length - 1 ? "" : " disabled"}>↓</button><button class="btn sq ghost" data-a="tira" aria-label="Tirar do repertório">✕</button></div></li>`;
        })
        .join("")
    : '<p class="empty">Nenhuma música ainda. Busque abaixo e toque no nome para adicionar.</p>';
}
elemento("repItens").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-a]");
  if (!b) return;
  const i = Number(b.closest("li").dataset.i),
    its = repAtual.itens;
  if (b.dataset.a === "tom") {
    let v = (its[i].semis || 0) + Number(b.dataset.d);
    its[i].semis = v > 11 ? v - 12 : v < -11 ? v + 12 : v;
  } else
    b.dataset.a === "sobe"
      ? ([its[i - 1], its[i]] = [its[i], its[i - 1]])
      : b.dataset.a === "desce"
        ? ([its[i + 1], its[i]] = [its[i], its[i + 1]])
        : its.splice(i, 1);
  repItens(), repMudou();
});
elemento("repBusca").addEventListener("input", () => {
  const busca = semAcento(elemento("repBusca").value.trim());
  elemento("repSug").innerHTML = busca
    ? biblioteca.cifras
        .filter((c) => semAcento(c.title + " " + c.artist + " " + c.text).includes(busca))
        .slice(0, 8)
        .map(
          (c) =>
            `<button class="sug" data-id="${esc(c.id)}"><strong>${esc(c.title)}</strong> <span>${esc(c.artist || "")} · ${esc(tomDe(c))}</span></button>`,
        )
        .join("") || '<p class="hint">Nada encontrado na biblioteca.</p>'
    : "";
});
elemento("repSug").addEventListener("click", (e) => {
  const b = e.target.closest("button.sug");
  b &&
    (repAtual.itens.push({
      id: b.dataset.id,
      semis: 0,
    }),
    (elemento("repBusca").value = ""),
    (elemento("repSug").innerHTML = ""),
    repItens(),
    repMudou(),
    elemento("repBusca").focus());
});
for (const id of ["repNome", "repData"])
  elemento(id).addEventListener("input", () => {
    (repAtual.nome = elemento("repNome").value), (repAtual.data = elemento("repData").value), repMudou();
  });
function repMudou() {
  clearTimeout(repTimer), (elemento("repSalvo").textContent = "Salvando…");
  repTimer = setTimeout(() => {
    const atual = repAtual;
    repFila = repFila.then(async () => {
      try {
        const { repertorio: salvo, como } = await biblioteca.salvarRepertorio(atual, atual.updated);
        (atual.id = salvo.id), (atual.updated = salvo.updated), (atual.nome = salvo.nome);
        if (repAtual !== atual) return;
        como === "copia" && (elemento("repNome").value = salvo.nome);
        elemento("repSalvo").textContent =
          como === "copia"
            ? `Outra pessoa alterou este repertório ao mesmo tempo. O seu foi salvo como “${salvo.nome}”.`
            : como === "pendente"
              ? "Sem internet: guardado neste aparelho. Vai para o servidor quando a conexão voltar."
              : "Salvo ✓ · a equipe já vê";
      } catch (erro) {
        repAtual === atual && (elemento("repSalvo").textContent = erro.message);
      }
    });
  }, 700);
}
elemento("repTocar").onclick = () => repAtual.itens.length && entrarCulto(structuredClone(repAtual), 0);
elemento("repApagar").onclick = async () => {
  const b = elemento("repApagar");
  if (b.dataset.conf !== "1")
    return (b.dataset.conf = "1"), (b.textContent = "Confirmar exclusão do repertório");
  b.dataset.conf = "";
  try {
    clearTimeout(repTimer),
      await repFila,
      repAtual.id && (await biblioteca.apagarRepertorio(repAtual.id)),
      (repAtual = null),
      repAviso("Repertório excluído."),
      repLista();
  } catch (erro) {
    elemento("repSalvo").textContent =
      erro.codigo === "offline" ? "Sem internet: não deu para excluir agora." : erro.message;
  }
};
// Quando a internet volta, envia o que ficou guardado no aparelho e atualiza a tela aberta.
window.addEventListener("online", async () => {
  await biblioteca.carregar().catch(() => {});
  await biblioteca.enviarPendentes().catch(() => {});
  renderizarBiblioteca(), elemento("tab-culto").hidden || (repAtual ? repItens() : repLista());
});
/* ===================== Filtro: Louvores · Salmos e Hinos ===================== */
// Hino = cifra com artista começando por "Salmos e Hinos" (ex.: "Salmos e Hinos nº 001"). Assim um hino
// cadastrado depois entra no filtro só de escrever o artista desse jeito. A escolha fica neste aparelho.
const ehHino = (c) => /^\s*salmos?\s+e\s+hinos/i.test((c && c.artist) || ""),
  numeroHino = (c) => {
    const m = ((c && c.artist) || "").match(/(\d+)/);
    return m ? Number(m[1]) : 1e9;
  };
let filtroTipo = guardado.get("filtroTipo", "todas");
const passaFiltro = (c) => !!c && (filtroTipo === "todas" || (filtroTipo === "hinos") === ehHino(c));
// Hinos pela numeração do hinário; o resto em ordem alfabética.
function ordemDaLista(a, b) {
  if (filtroTipo === "hinos" && ehHino(a) && ehHino(b)) return numeroHino(a) - numeroHino(b);
  return a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" });
}
function marcarFiltros() {
  const todas = [
      ...biblioteca.cifras,
      ...biblioteca.pendentes().filter((p) => !biblioteca.cifras.some((c) => c.id === p.id)),
    ],
    hinos = todas.filter(ehHino).length,
    n = { todas: todas.length, hinos, louvores: todas.length - hinos };
  for (const b of document.querySelectorAll(".filtros button")) {
    b.setAttribute("aria-pressed", String(b.dataset.f === filtroTipo));
    b.querySelector("span").textContent = n[b.dataset.f];
  }
}
for (const g of document.querySelectorAll(".filtros"))
  g.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-f]");
    if (!b) return;
    (filtroTipo = b.dataset.f), guardado.set("filtroTipo", filtroTipo), renderizarBiblioteca(), buscaRender();
  });

/* ===================== Tema (claro / escuro) ===================== */
// Escolha da pessoa ("claro", "escuro" ou sem escolha = segue o aparelho). No modo culto, o
// palco usa fundo escuro por padrão (estado.palcoEscuro), sem mudar a escolha da pessoa.
const escuroDoAparelho = () => matchMedia("(prefers-color-scheme: dark)").matches;
function aplicarTema() {
  const escolha = guardado.get("tema", null),
    escuro = culto && estado.palcoEscuro ? !0 : escolha ? escolha === "escuro" : escuroDoAparelho();
  document.documentElement.dataset.theme = escuro ? "dark" : "light";
  for (const b of document.querySelectorAll(".temaBtn")) b.setAttribute("aria-pressed", String(escuro));
  elemento("cbTema").setAttribute("aria-pressed", String(!!estado.palcoEscuro));
  elemento("cbTema").textContent = estado.palcoEscuro ? "☾" : "☀";
}
for (const b of document.querySelectorAll(".temaBtn"))
  b.onclick = () => {
    guardado.set("tema", document.documentElement.dataset.theme === "dark" ? "claro" : "escuro"),
      aplicarTema();
  };
elemento("cbTema").onclick = () => {
  (estado.palcoEscuro = !estado.palcoEscuro), guardado.set("palcoEscuro", estado.palcoEscuro), aplicarTema();
};

/* ===================== Favoritas e recentes (só neste aparelho) ===================== */
const favoritas = () => guardado.get("favoritos", []).filter((id) => biblioteca.achar(id));
function marcarFavorito() {
  const fav = !!estado.songId && guardado.get("favoritos", []).includes(estado.songId),
    b = elemento("favBtn");
  b.setAttribute("aria-pressed", String(fav)), (b.textContent = fav ? "★" : "☆");
  b.setAttribute("aria-label", fav ? "Tirar das favoritas" : "Favoritar");
}
elemento("favBtn").onclick = () => {
  if (!estado.songId || String(estado.songId).startsWith("p"))
    return avisoEditor("Salve a cifra na biblioteca antes de favoritar.");
  const favs = guardado.get("favoritos", []),
    tem = favs.includes(estado.songId);
  guardado.set("favoritos", tem ? favs.filter((x) => x !== estado.songId) : [estado.songId, ...favs]),
    marcarFavorito();
};
function tocarFavoritas() {
  const itens = favoritas().map((id) => ({ id, semis: 0 }));
  itens.length && entrarCulto({ id: null, nome: "Favoritas", itens }, 0);
}

/* ===================== Busca (tela inicial) ===================== */
function linhaCifra(c) {
  return `<article class="linha" data-id="${esc(c.id)}"><button class="l-nome linkbtn" data-a="abrir"><strong>${esc(c.title)}</strong><span>${esc(c.artist || "Artista não informado")}</span></button><span class="tom" title="Tom">${esc(tomDe(c))}</span><button class="btn sq" data-a="tocar" aria-label="Tocar ${esc(c.title)}">▶</button></article>`;
}
function buscaRender() {
  marcarFiltros();
  const q = semAcento(elemento("buscaTexto").value.trim()),
    todas = [
      ...biblioteca.pendentes(),
      ...biblioteca.cifras.filter((c) => !biblioteca.pendentes().some((p) => p.id === c.id)),
    ].filter(passaFiltro);
  if (q) {
    const achadas = todas
      .filter((c) => semAcento(c.title + " " + c.artist + " " + c.text).includes(q))
      .sort((a, b) => {
        const ta = semAcento(a.title).includes(q),
          tb = semAcento(b.title).includes(q);
        return ta !== tb ? (ta ? -1 : 1) : ordemDaLista(a, b);
      });
    elemento("buscaRes").innerHTML = achadas.length
      ? `<h3 class="secao-tit">${achadas.length} resultado${achadas.length === 1 ? "" : "s"}</h3><div class="lista">${achadas.slice(0, 40).map(linhaCifra).join("")}</div>`
      : '<p class="empty">Nenhuma cifra encontrada. <button class="linkbtn" data-a="nova">Cadastrar uma nova</button></p>';
    return;
  }
  const favs = favoritas()
      .map((id) => biblioteca.achar(id))
      .filter(passaFiltro),
    recentes = guardado
      .get("recentes", [])
      .map((id) => biblioteca.achar(id))
      .filter(Boolean)
      .filter(passaFiltro)
      .slice(0, 8),
    bloco = (tit, lista, extra = "") =>
      lista.length
        ? `<h3 class="secao-tit">${tit}${extra}</h3><div class="lista">${lista.map(linhaCifra).join("")}</div>`
        : "";
  elemento("buscaRes").innerHTML =
    bloco(
      "★ Favoritas",
      favs,
      favs.length ? ' <button class="linkbtn" data-a="tocarFavs">▶ tocar todas</button>' : "",
    ) + bloco("Abertas recentemente", recentes) ||
    (todas.length
      ? `<p class="empty">${todas.length} cifra${todas.length === 1 ? "" : "s"} na biblioteca. Busque acima ou veja todas em <button class="linkbtn" data-a="todas">Cifras</button>.</p>`
      : '<p class="empty">A biblioteca ainda está vazia. <button class="linkbtn" data-a="nova">Cadastre a primeira cifra</button>.</p>');
}
async function buscaAtualizar() {
  buscaRender();
  try {
    await biblioteca.carregar();
  } catch {}
  buscaRender();
}
elemento("buscaTexto").addEventListener("input", buscaRender);
elemento("buscaTexto").addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const primeira = elemento("buscaRes").querySelector('.linha [data-a="abrir"]');
  primeira && primeira.click();
});
elemento("buscaNova").onclick = () => elemento("libNova").click();
elemento("buscaRes").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-a]");
  if (!b) return;
  if (b.dataset.a === "nova") return elemento("libNova").click();
  if (b.dataset.a === "todas") return mostrarAba("lib");
  if (b.dataset.a === "tocarFavs") return tocarFavoritas();
  const c = biblioteca.achar(b.closest(".linha").dataset.id);
  c &&
    (b.dataset.a === "tocar"
      ? (abrirCifra(c), entrarCulto())
      : (abrirCifra(c), mostrarEditor(!1), mostrarAba("cifra"), scrollTo(0, 0)));
});

/* ===================== Voltar e adicionar ao repertório ===================== */
elemento("voltarBtn").onclick = () => mostrarAba(estado.abaAnterior || "busca");
function fecharMenuRep() {
  (elemento("addRepMenu").hidden = !0), elemento("addRepBtn").setAttribute("aria-expanded", "false");
}
elemento("addRepBtn").onclick = (e) => {
  e.stopPropagation();
  const menu = elemento("addRepMenu");
  if (!menu.hidden) return fecharMenuRep();
  if (!estado.songId || String(estado.songId).startsWith("p"))
    return avisoEditor("Salve a cifra na biblioteca antes de pôr num repertório.");
  const reps = [...biblioteca.repertorios].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  menu.innerHTML =
    `<p class="menu-tit">Adicionar no tom ${esc(elemento("keyBox").textContent)} a:</p>` +
    reps
      .map((r) => {
        const ja = r.itens.some((it) => it.id === estado.songId);
        return `<button data-id="${esc(r.id)}"${ja ? " disabled" : ""}>${esc(r.nome)}${ja ? " · já está" : ""}</button>`;
      })
      .join("") +
    '<button data-id="__novo">+ Novo repertório com esta música</button>';
  (menu.hidden = !1), elemento("addRepBtn").setAttribute("aria-expanded", "true");
};
document.addEventListener("click", (e) => e.target.closest(".menuwrap") || fecharMenuRep());
elemento("addRepMenu").addEventListener("click", async (e) => {
  const b = e.target.closest("button[data-id]");
  if (!b) return;
  fecharMenuRep();
  const item = { id: estado.songId, semis: estado.semis },
    r =
      b.dataset.id === "__novo"
        ? { id: null, nome: elemento("shTitle").textContent, data: "", itens: [] }
        : structuredClone(biblioteca.repertorios.find((x) => x.id === b.dataset.id));
  r.itens.push(item);
  try {
    const { repertorio, como } = await biblioteca.salvarRepertorio(r, r.updated ?? null);
    avisoEditor(
      como === "pendente"
        ? `Sem internet: adicionada a “${repertorio.nome}” neste aparelho; vai para o servidor quando a conexão voltar.`
        : `Adicionada a “${repertorio.nome}”${como === "copia" ? " (outra pessoa tinha alterado; virou cópia)" : ""}.`,
    );
  } catch (erro) {
    avisoEditor(erro.message);
  }
});

/* ===================== Imprimir / PDF ===================== */
function folhaParaImprimir(c, semis) {
  const t = lerCifra(c.text || ""),
    k = tomDeTexto(t.meta.key) || estimarTom(acordesDaCifra(t)),
    tom = k && transporTom(k, semis),
    { html } = montarFolha(t, semis, tom ? preferirBemol(tom) : !1);
  return `<article class="imp-musica"><h1>${esc(c.title || t.meta.title || "Sem título")}</h1><p class="imp-sub">${esc(c.artist || t.meta.artist || "")}${tom ? ` · Tom: ${esc(nomeDoTom(tom, preferirBemol(tom)))}` : ""}</p><div class="sheet">${html}</div></article>`;
}
function imprimir(html, titulo) {
  const antes = document.title;
  (elemento("impressao").innerHTML = html), (document.title = titulo);
  window.print();
  setTimeout(() => ((document.title = antes), (elemento("impressao").innerHTML = "")), 500);
}
elemento("printBtn").onclick = () =>
  imprimir(
    folhaParaImprimir(
      {
        title: elemento("shTitle").textContent,
        artist: elemento("shSub").textContent,
        text: editorTexto.value,
      },
      estado.semis,
    ),
    elemento("shTitle").textContent,
  );
elemento("repImprimir").onclick = () => {
  const r = repAtual;
  if (!r || !r.itens.length) return;
  const capa = `<header class="imp-capa"><h1>${esc(r.nome)}</h1><p>${r.data ? esc(dataBR(r.data)) + " · " : ""}${r.itens.length} músicas</p><ol>${r.itens.map((it) => `<li>${esc((biblioteca.achar(it.id) || { title: "?" }).title)} <b>${esc(biblioteca.achar(it.id) ? tomDe(biblioteca.achar(it.id), it.semis) : "")}</b></li>`).join("")}</ol></header>`;
  imprimir(
    capa +
      r.itens
        .map((it) => biblioteca.achar(it.id))
        .map((c, i) => (c ? folhaParaImprimir(c, r.itens[i].semis || 0) : ""))
        .join(""),
    r.nome,
  );
};

/* ===================== Palco: setas laterais e bolinhas ===================== */
function palcoNavegacao() {
  const r = culto && culto.rep;
  for (const id of ["palcoPrev", "palcoNext", "palcoPos"]) elemento(id).hidden = !r || r.itens.length < 2;
  document.body.classList.toggle("com-setas", !!r && r.itens.length > 1);
  if (!r || r.itens.length < 2) return;
  (elemento("palcoPrev").disabled = culto.pos <= 0),
    (elemento("palcoNext").disabled = culto.pos >= r.itens.length - 1);
  // Até 15 músicas: uma bolinha por música (tocar pula para ela). Mais que isso (ex.: a pasta
  // Salmos e Hinos) não caberia: mostra só "12 / 72".
  if (r.itens.length > 15) {
    elemento("palcoPos").innerHTML = `<span class="palco-cont">${culto.pos + 1} / ${r.itens.length}</span>`;
    return;
  }
  elemento("palcoPos").innerHTML = r.itens
    .map((it, i) => {
      const c = biblioteca.achar(it.id);
      return `<button data-i="${i}" aria-label="${i + 1}: ${esc(c ? c.title : "?")}"${i === culto.pos ? ' aria-current="true"' : ""}></button>`;
    })
    .join("");
}
elemento("palcoPrev").onclick = () => andar(-1);
elemento("palcoNext").onclick = () => andar(1);
elemento("palcoPos").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-i]");
  b && culto && culto.rep && ((culto.pos = Number(b.dataset.i)), abrirDoRepertorio());
});

/* ===================== Arrastar para mudar a ordem do repertório ===================== */
// Funciona com mouse e com o dedo: segura a alça ⠿ e arrasta. ↑ ↓ continuam para o teclado.
elemento("repItens").addEventListener("pointerdown", (e) => {
  const alca = e.target.closest(".alca");
  if (!alca) return;
  e.preventDefault();
  const lista = elemento("repItens"),
    li = alca.closest("li");
  // Ouve na página inteira: mover a linha no DOM solta a captura do ponteiro.
  li.classList.add("arrastando");
  const mover = (ev) => {
      const alvo = [...lista.children].find((x) => {
        const r = x.getBoundingClientRect();
        return x !== li && ev.clientY >= r.top && ev.clientY <= r.bottom;
      });
      if (!alvo) return;
      const r = alvo.getBoundingClientRect();
      ev.clientY < r.top + r.height / 2
        ? lista.insertBefore(li, alvo)
        : lista.insertBefore(li, alvo.nextSibling);
    },
    soltar = () => {
      document.removeEventListener("pointermove", mover),
        document.removeEventListener("pointerup", soltar),
        document.removeEventListener("pointercancel", soltar);
      li.classList.remove("arrastando");
      const ordem = [...lista.children].map((x) => Number(x.dataset.i)),
        mudou = ordem.some((v, i) => v !== i);
      mudou && ((repAtual.itens = ordem.map((i) => repAtual.itens[i])), repMudou()), repItens();
    };
  document.addEventListener("pointermove", mover),
    document.addEventListener("pointerup", soltar),
    document.addEventListener("pointercancel", soltar);
});

(function () {
  var s;
  const t = guardado.get("draft", null);
  (s = t == null ? void 0 : t.text) != null && s.trim()
    ? ((editorTexto.value = t.text),
      (elemento("songTitle").value = t.title || ""),
      (elemento("songArtist").value = t.artist || ""),
      (estado.songId = t.id || null),
      (estado.songBase = t.base ?? null),
      (estado.salvo = t.salvo ?? null))
    : (editorTexto.value = ""),
    tamanhoLetra(guardado.get("size", 17)),
    (estado.inst = guardado.get("inst", "guitar")),
    elemento("instGuitar").setAttribute("aria-pressed", String(estado.inst === "guitar")),
    elemento("instKeys").setAttribute("aria-pressed", String(estado.inst === "keys")),
    (elemento("capoGrp").hidden = estado.inst !== "guitar"),
    mostrarEditor(!window.matchMedia("(max-width: 860px)").matches),
    renderizar(),
    renderizarBiblioteca(),
    (estado.ajuste = ajustePadrao()),
    (estado.diag = guardado.get("diag", !0)),
    mostrarDesenhos(estado.diag),
    (estado.palcoEscuro = guardado.get("palcoEscuro", !0)),
    aplicarTema(),
    mostrarAba(
      ["busca", "lib", "culto", "audio"].includes(guardado.get("tab")) ? guardado.get("tab") : "busca",
    ),
    elemento("tab-lib").hidden && libAtualizar();
  const n = guardado.get("api", "") || void 0 || "";
  n && ((elemento("apiUrl").value = n), conectarServidor()),
    "serviceWorker" in navigator && navigator.serviceWorker.register("./sw.js").catch(() => {});
})();
