import { biblioteca } from "./biblioteca.js";
(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]')) s(i);
  new MutationObserver((i) => {
    for (const r of i)
      if (r.type === "childList")
        for (const a of r.addedNodes) a.tagName === "LINK" && a.rel === "modulepreload" && s(a);
  }).observe(document, { childList: !0, subtree: !0 });
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
const tt = `{t: Varanda de Domingo}
{st: Exemplo do Cifrador}
{key: G}

[Intro]
G   D/F#   Em   C   (x2)

[Primeira parte]
G                    D/F#
  O café na mesa, o sol pela janela
Em                    C
  Domingo devagar, ninguém tem pressa
G                        D/F#
  A rede balançando, a conversa vai e vem
Em                C           D
  E a tarde inteira cabe aqui também

[Refrão]
C            D            G      D/F#   Em
  Fica mais um pouco, deixa o tempo passar
C             D              G
  Que a varanda é grande e tem lugar

[Ponte]
[Am7]Quando a noite [D7(9)]chega, a gente [G7M]acende a [E7]luz
[Am7]Canta mais uma [Cm6]pra fechar o [D4]dia [D]

[Final]
C   D   G7M`,
  nt = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  st = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
  it = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 },
  w = (e) => ((e % 12) + 12) % 12,
  W = (e, t = !1) => (t ? st : nt)[w(e)];
function Me(e) {
  let t = it[e[0]];
  return e[1] === "#" ? t++ : e[1] === "b" && t--, w(t);
}
const at = [
  ["maj7", { maj7: !0 }],
  ["maj9", { maj7: !0, ext: [14] }],
  ["7M", { maj7: !0 }],
  ["M7", { maj7: !0 }],
  ["7+", { maj7: !0 }],
  ["maj", { maj7: !0 }],
  ["Δ", { maj7: !0 }],
  ["sus2", { third: 2 }],
  ["sus4", { third: 5 }],
  ["sus", { third: 5 }],
  ["add9", { ext: [14] }],
  ["add2", { ext: [14] }],
  ["add11", { ext: [17] }],
  ["add4", { ext: [17] }],
  ["b13", { ext: [20] }],
  ["-13", { ext: [20] }],
  ["#11", { ext: [18] }],
  ["+11", { ext: [18] }],
  ["b9", { ext: [13] }],
  ["-9", { ext: [13] }],
  ["#9", { ext: [15] }],
  ["+9", { ext: [15] }],
  ["b5", { fifth: 6 }],
  ["-5", { fifth: 6 }],
  ["#5", { fifth: 8 }],
  ["+5", { fifth: 8 }],
  ["13", { ext: [21] }],
  ["11", { ext: [17] }],
  ["9", { ext: [14] }],
  ["7", { sev: !0 }],
  ["6", { ext: [9] }],
  ["5", { power: !0 }],
  ["4", { third: 5 }],
  ["2", { ext: [14] }],
  ["+", { fifth: 8 }],
];
function rt(e) {
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
    const f = at.find(([p]) => t.startsWith(p));
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
  return { iv: [...new Set(u.map(w))], minor: n === 3 && !a, dim: a };
}
function C(e) {
  if (!e) return null;
  const n = e.replace(/\/(?=[\d#+\-]|b\d)/g, "").match(/^([A-G])([#b]?)([^/]*)(?:\/([A-G][#b]?))?$/);
  if (!n) return null;
  const s = rt(n[3]);
  return s ? { root: Me(n[1] + n[2]), q: n[3], bass: n[4] ? Me(n[4]) : null, ...s } : null;
}
function ne(e, t = 0, n = !1) {
  return W(e.root + t, n) + e.q + (e.bass != null ? "/" + W(e.bass + t, n) : "");
}
const ot = new Set([5, 10, 3, 8, 1, 6]),
  ct = new Set([2, 7, 0, 5, 10, 3]);
function he(e) {
  return e ? (e.minor ? ct : ot).has(w(e.tonic)) : !1;
}
function lt(e, t) {
  const n = t ? w(e + 3) : e;
  return { maj: [n, w(n + 5), w(n + 7)], min: [w(n + 2), w(n + 4), w(n + 9)] };
}
function ut(e) {
  if (!e.length) return null;
  let t = null;
  for (let n = 0; n < 12; n++)
    for (const s of [!1, !0]) {
      const i = lt(n, s);
      let r = 0;
      e.forEach((a, l) => {
        (a.minor ? i.min.includes(a.root) : !a.dim && i.maj.includes(a.root)) && (r += 1),
          a.root === n && a.minor === s && (r += l === 0 || l === e.length - 1 ? 1.5 : 0.5),
          s && a.root === w(n + 7) && !a.minor && (r += 0.4);
      }),
        (!t || r > t.s) && (t = { tonic: n, minor: s, s: r });
    }
  return t && { tonic: t.tonic, minor: t.minor };
}
function Ne(e) {
  const t = C((e || "").trim());
  return t ? { tonic: t.root, minor: t.minor } : null;
}
const q = (e, t = he(e)) => (e ? W(e.tonic, t) + (e.minor ? "m" : "") : "?"),
  je = /^(\|+:?|:?\|+|\(|\)|\[|\]|x\d+|\d+x|[-–—]+|\/+|%|\.+|\d+:\d{2}|\d+\.|\*+|~+)$/i,
  dt = /^([A-Za-zÀ-ÿ0-9ºª]+:|\[[^\]]+\]:?)$/;
function ft(e) {
  const t = e.match(/^([(\[|]*)(.*?)([)\]|,.;]*)$/);
  let n = t[2],
    s = t[3];
  for (; (n.match(/\(/g) || []).length > (n.match(/\)/g) || []).length && s.startsWith(")"); )
    (n += ")"), (s = s.slice(1));
  return { pre: t[1], core: n, post: s };
}
function Ue(e) {
  const t = [],
    n = /\S+/g;
  let s,
    i = 0,
    r = 0;
  for (; (s = n.exec(e)); ) {
    const a = s[0],
      { pre: l, core: u, post: f } = ft(a),
      c = u ? C(u) : null;
    if (c) i++, t.push({ pos: s.index, raw: a, pre: l, core: u, post: f, ch: c });
    else if (je.test(a) || je.test(u) || u === "") t.push({ pos: s.index, raw: a });
    else if (r === 0 && dt.test(a)) t.push({ pos: s.index, raw: a, label: !0 });
    else return null;
    r++;
  }
  return i ? t : null;
}
function Pe(e) {
  if (!/\[[^\]]+\]/.test(e)) return null;
  const t = [...e.matchAll(/\[([^\]]+)\]/g)];
  if (!t.every((r) => C(r[1].trim()))) return null;
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
function ge(e) {
  const t = { title: "", artist: "", key: "" },
    n = [],
    s = (i) => {
      if (!i.trim()) {
        n.push({ kind: "blank" });
        return;
      }
      const r = i.match(/^\s*\[([^\]]+)\]\s*$/);
      if (r && !C(r[1].trim())) {
        n.push({ kind: "sec", text: r[1].trim() });
        return;
      }
      const a = Ue(i);
      if (a) {
        n.push({ kind: "chords", toks: a });
        return;
      }
      n.push({ kind: "lyr", text: i });
    };
  for (let i of e.replace(/\r/g, "").split(`
`)) {
    i = i.replace(/\t/g, "    ").replace(/\s+$/, "");
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
              ? n.push({ kind: "sec", text: u })
              : (l === "soc" || l === "start_of_chorus") && n.push({ kind: "sec", text: u || "Refrão" });
      continue;
    }
    const a = Pe(i);
    a ? a.forEach(s) : s(i);
  }
  return { meta: t, lines: n };
}
function qe(e) {
  const t = [];
  for (const n of e.lines) if (n.kind === "chords") for (const s of n.toks) s.ch && t.push(s.ch);
  return t;
}
function Ie(e, t, n) {
  const s = [];
  let i = 0,
    r = 0;
  return (
    e.forEach((a, l) => {
      const u = a.ch ? ne(a.ch, t, n) : "",
        f = a.ch ? a.pre + u + a.post : a.raw;
      let c = a.pos;
      l > 0 && (c = Math.max(a.pos, a.pos > r ? i + 1 : i)),
        c > i && s.push({ text: " ".repeat(c - i) }),
        a.ch
          ? (a.pre && s.push({ text: a.pre }),
            s.push({ text: u, chord: u }),
            a.post && s.push({ text: a.post }))
          : s.push({ text: a.raw }),
        (i = c + f.length),
        (r = a.pos + a.raw.length);
    }),
    s
  );
}
function pt(e, t, n) {
  return e
    .replace(/\r/g, "")
    .split(
      `
`,
    )
    .map((s) => {
      if (/^\s*\{/.test(s))
        return s.replace(/^(\s*\{\s*(?:key|k)\s*:\s*)([^}]+?)(\s*\})$/i, (r, a, l, u) => {
          const f = C(l.trim());
          return f ? a + ne(f, t, n) + u : a + l + u;
        });
      if (Pe(s)) return s.replace(/\[([^\]]+)\]/g, (r, a) => "[" + ne(C(a.trim()), t, n) + "]");
      const i = Ue(s.replace(/\t/g, "    "));
      return i
        ? Ie(i, t, n)
            .map((r) => r.text)
            .join("")
        : s;
    }).join(`
`);
}
const X = [40, 45, 50, 55, 59, 64],
  Fe = new Map();
function oe(e, t, n = null) {
  const s = n ?? e,
    i = `${e}|${t.join(",")}|${s}`,
    r = Fe.get(i);
  if (r) return r;
  const a = t.map((g) => w(e + g)),
    l = new Set([...a, s]),
    u = w(e + 7),
    f = new Set([e, s]);
  for (const g of t)
    ([2, 3, 4, 5, 8, 9, 10, 11].includes(g) || (g === 6 && t.includes(3) && !t.includes(4))) &&
      f.add(w(e + g));
  t.length <= 2 && a.forEach((g) => f.add(g));
  const c = new Set(a.filter((g) => g !== u || t.length <= 2));
  c.add(s);
  let p = [];
  for (const g of [
    { req: c, minPlay: 4 },
    { req: f, minPlay: 4 },
    { req: f, minPlay: 3 },
  ]) {
    const b = new Map(),
      x = new Array(6);
    for (let k = 0; k <= 9; k++) {
      const Q = k === 0 ? [0, 1, 2, 3] : [k, k + 1, k + 2, k + 3];
      k > 0 && k <= 4 && Q.unshift(0);
      const et = X.map((U) => ["x", ...Q.filter((A) => l.has((U + A) % 12))]),
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
          if ((X[A] + M[A]) % 12 !== s) return;
          const ue = new Set(),
            D = [];
          let Ee = 0;
          for (let m = A; m <= O; m++) ue.add((X[m] + M[m]) % 12), M[m] > 0 ? D.push(m) : Ee++;
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
          (!Ce || Ce.score > Le) && b.set(Te, { frets: x.slice(), score: Le, barre: R ? j : 0 });
        };
      ke(0);
    }
    if (((p = [...b.values()].sort((k, Q) => k.score - Q.score)), p.length)) break;
  }
  const h = p.slice(0, 6);
  return Fe.set(i, h), h;
}
function De(e, t) {
  if (!e.length) return 0;
  let n = 0;
  for (const s of e) {
    const i = oe(w(s.root + t), s.iv, s.bass == null ? null : w(s.bass + t));
    n += i.length ? i[0].score : 12;
  }
  return n / e.length;
}
function mt(e, t, n) {
  if (!e.length) return null;
  let s = n,
    i = De(e, t - n);
  for (let r = 0; r <= 7; r++) {
    const a = De(e, t - r);
    a < i - 0.35 && ((i = a), (s = r));
  }
  return s;
}
function ht(e, t) {
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
      const g = (X[p] + c) % 12;
      f += `<circle class="dot${g === t ? " root" : ""}" cx="${h}" cy="${u(c - a) + 8.5}" r="5.4"/>`;
    }),
    f + "</svg>"
  );
}
function gt(e, t, n) {
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
const Oe = 11025;
async function bt(e) {
  const t = await e.arrayBuffer();
  return new OfflineAudioContext(1, 1, 44100).decodeAudioData(t);
}
async function vt(e, t = Oe) {
  const n = new OfflineAudioContext(1, Math.max(1, Math.ceil(e.duration * t)), t),
    s = n.createBufferSource();
  return (s.buffer = e), s.connect(n.destination), s.start(), (await n.startRendering()).getChannelData(0);
}
function yt(e, t, n, s) {
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
    a.postMessage({ samples: l, sr: t, opts: n }, [l.buffer]);
  });
}
async function xt() {
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
function wt(e) {
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
  return new Blob([s], { type: "audio/wav" });
}
const E = {
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
  ve = (e) => e.trim().replace(/\/+$/, "");
async function $t(e) {
  const t = await fetch(ve(e) + "/api/health");
  if (!t.ok) throw new Error("Servidor respondeu " + t.status);
  return t.json();
}
async function kt(e, t) {
  const n = await fetch(ve(e) + "/api/jobs", { method: "POST", body: t });
  if (!n.ok)
    throw new Error((await n.json().catch(() => ({}))).detail || "Falha ao enviar (" + n.status + ")");
  return n.json();
}
async function St(e, t, n, s) {
  const i = new FormData();
  t.file && i.append("file", t.file),
    t.url && i.append("url", t.url),
    i.append("lyrics", String(n.lyrics)),
    i.append("separate", String(n.separate)),
    i.append("sevenths", String(n.sevenths)),
    i.append("language", n.language);
  let r = await kt(e, i);
  for (; r.status === "queued" || r.status === "running"; ) {
    s(r.step, r.progress), await new Promise((l) => setTimeout(l, 1500));
    const a = await fetch(ve(e) + "/api/jobs/" + r.id);
    if (!a.ok) throw new Error("Perdi o contato com o servidor (" + a.status + ")");
    r = await a.json();
  }
  if (r.status === "error" || !r.result) throw new Error(r.error || "A análise falhou no servidor.");
  return r.result;
}
const o = (e) => document.getElementById(e),
  y = (e) => e.replace(/[&<>"]/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[t]),
  ce = (e) => ((e = Math.max(0, e)), Math.floor(e / 60) + ":" + String(Math.floor(e % 60)).padStart(2, "0")),
  L = o("src"),
  d = {
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
let P = null;
const se = () => d.semis - (d.inst === "guitar" ? d.capo : 0),
  pe = (e, t) => (e ? { tonic: w(e.tonic + t), minor: e.minor } : null),
  ee = (e) => (d.acc === "auto" ? he(e) : d.acc === "b");
function He(e, t, n = 0) {
  const s = C(e);
  if (!s) return "";
  if (d.inst === "keys") {
    const r = [...s.iv]
      .sort((a, l) => a - l)
      .map((a) => W(s.root + a, t))
      .join(" ");
    return (
      gt(s.root, s.iv, s.bass) +
      `<div class="notes">${y((s.bass != null ? W(s.bass, t) + " | " : "") + r)}</div>`
    );
  }
  const i = oe(s.root, s.iv, s.bass);
  return i.length ? ht(i[Math.min(n, i.length - 1)], s.root) : '<div class="notes">sem posição</div>';
}
/**
 * Linha de acordes + linha de letra viram blocos "acorde em cima, pedaço da letra embaixo".
 * Assim a linha quebra no fim da tela sem perder o acorde de cada sílaba. Pedaços da mesma
 * palavra ficam juntos (não quebram no meio da palavra).
 */
function linhaCifrada(partes, letra, acorde) {
  const ancoras = [];
  let col = 0;
  for (const b of partes) {
    if (b.text.trim()) {
      const html = b.chord ? acorde(b) : `<span class="mk">${y(b.text)}</span>`,
        ult = ancoras[ancoras.length - 1];
      ult && ult.fim === col
        ? ((ult.html += html), (ult.fim += b.text.length))
        : ancoras.push({ col, fim: col + b.text.length, html });
    }
    col += b.text.length;
  }
  const blocos = [],
    pedacos = (txt, html) => {
      const ps = txt.match(/^\s*\S*\s*|\S+\s*/g) || [""];
      ps.forEach((t, i) => (t || (i === 0 && html)) && blocos.push({ html: i === 0 ? html : "", txt: t }));
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
                `<span class="bl"><span class="cr">${bl.html}</span><span class="ly">${y(bl.txt) || " "}</span></span>`,
            )
            .join("") +
          "</span>",
      )
      .join("") +
    "</div>"
  );
}
function T() {
  const e = L.value,
    t = ge(e),
    n = qe(t);
  P = Ne(t.meta.key) || ut(n);
  const s = pe(P, d.semis),
    i = pe(P, se()),
    r = ee(i),
    a = se();
  (o("shTitle").textContent = o("songTitle").value || t.meta.title || "Sem título"),
    (o("shSub").textContent = o("songArtist").value || t.meta.artist || ""),
    (o("keyBox").textContent = q(s, ee(s))),
    (o("cbKey").textContent = q(s, ee(s)));
  let l = "";
  P &&
    ((l += `<span class="pill">Tom original ${y(q(P))}</span>`),
    d.semis &&
      (l += `<span class="pill">${d.semis > 0 ? "+" : ""}${d.semis} semitom${Math.abs(d.semis) > 1 ? "s" : ""} · soa em ${y(q(s, ee(s)))}</span>`),
    d.inst === "guitar" &&
      d.capo &&
      (l += `<span class="pill warn">Capo na ${d.capo}ª casa · formas de ${y(q(i, r))}</span>`));
  const u = d.inst === "guitar" ? mt(n, d.semis, d.capo) : null;
  u != null &&
    u !== d.capo &&
    (l += `<span class="pill">Mais fácil com capo ${u} <button id="applyCapo" data-c="${u}">usar</button></span>`),
    (o("keyLine").innerHTML = l);
  const f = document.getElementById("applyCapo");
  f &&
    (f.onclick = () => {
      (d.capo = Number(f.dataset.c)), (o("capoSel").value = String(d.capo)), T();
    });
  const c = [];
  let p = "";
  const acorde = (b) => (
    c.includes(b.chord) || c.push(b.chord), `<b class="ch" data-c="${y(b.chord)}">${y(b.chord)}</b>`
  );
  for (let idx = 0; idx < t.lines.length; idx++) {
    const h = t.lines[idx];
    if (h.kind === "blank") {
      p && (p += '<div class="gap"></div>');
      continue;
    }
    if (h.kind === "sec") {
      p += `</div><div class="secao"><div class="ln sec">${y(h.text)}</div>`;
      continue;
    }
    if (h.kind === "lyr") {
      p += `<div class="ln lyr">${y(h.text)}</div>`;
      continue;
    }
    const g = Ie(h.toks, a, r),
      prox = t.lines[idx + 1];
    if (prox && prox.kind === "lyr") {
      (p += linhaCifrada(g, prox.text, acorde)), idx++;
      continue;
    }
    p += '<div class="ln chords">' + g.map((b) => (b.chord ? acorde(b) : y(b.text))).join("") + "</div>";
  }
  (o("sheet").innerHTML = p
    ? ('<div class="secao">' + p + "</div>").replace(
        /<div class="secao">(<div class="gap"><\/div>)*<\/div>/g,
        "",
      )
    : '<p class="empty">Cole ou escreva uma cifra no editor para ela aparecer aqui.</p>'),
    (o("diagrams").innerHTML = c
      .map((h) => {
        const g = C(h),
          b = d.inst === "guitar" ? oe(g.root, g.iv, g.bass).length : 0,
          x = d.voice[h] || 0,
          k =
            b > 1
              ? `<div class="cyc"><button data-d="-1" aria-label="Posição anterior de ${y(h)}">‹</button>${Math.min(x, b - 1) + 1}/${b}<button data-d="1" aria-label="Próxima posição de ${y(h)}">›</button></div>`
              : "";
        return `<div class="dcard" data-c="${y(h)}"><div class="nm">${y(h)}</div>${He(h, r, x)}${k}</div>`;
      })
      .join("")),
    marcarSalvo(),
    E.set("draft", {
      text: e,
      title: o("songTitle").value,
      artist: o("songArtist").value,
      id: d.songId,
      base: d.songBase,
      salvo: d.salvo,
    });
}
o("diagrams").addEventListener("click", (e) => {
  const t = e.target.closest("button[data-d]");
  if (!t) return;
  const n = t.closest(".dcard").dataset.c,
    s = C(n),
    i = oe(s.root, s.iv, s.bass).length;
  (d.voice[n] = ((((d.voice[n] || 0) + Number(t.dataset.d)) % i) + i) % i), T();
});
o("sheet").addEventListener("click", (e) => {
  const t = e.target.closest(".ch");
  if (!t) return;
  const n = [...document.querySelectorAll(".dcard")].find((s) => s.dataset.c === t.dataset.c);
  n &&
    (n.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }),
    n.classList.add("flash"),
    setTimeout(() => n.classList.remove("flash"), 900));
});
const ie = o("capoSel");
for (let e = 0; e <= 9; e++)
  ie.insertAdjacentHTML("beforeend", `<option value="${e}">${e ? e + "ª casa" : "Sem capo"}</option>`);
o("tUp").onclick = () => {
  (d.semis = d.semis >= 11 ? 0 : d.semis + 1), T();
};
o("tDown").onclick = () => {
  (d.semis = d.semis <= -11 ? 0 : d.semis - 1), T();
};
o("tReset").onclick = () => {
  (d.semis = 0), T();
};
ie.onchange = () => {
  (d.capo = Number(ie.value)), T();
};
o("accSel").onchange = (e) => {
  (d.acc = e.target.value), T();
};
function ze(e) {
  (d.inst = e),
    o("instGuitar").setAttribute("aria-pressed", String(e === "guitar")),
    o("instKeys").setAttribute("aria-pressed", String(e === "keys")),
    (o("capoGrp").hidden = e !== "guitar"),
    E.set("inst", e),
    T(),
    $ && N(!0);
}
o("instGuitar").onclick = () => ze("guitar");
o("instKeys").onclick = () => ze("keys");
function ye(e) {
  (d.size = Math.max(12, Math.min(40, e))),
    document.documentElement.style.setProperty("--sheet-size", d.size + "px"),
    E.set("size", d.size);
}
o("fUp").onclick = () => ye(d.size + 1);
o("fDown").onclick = () => ye(d.size - 1);
function xe(e) {
  (d.editor = e),
    o("cifraGrid").classList.toggle("no-editor", !e),
    o("editorBtn").setAttribute("aria-pressed", String(e));
}
o("editorBtn").onclick = () => xe(!d.editor);
let Be = 0;
for (const e of ["src", "songTitle", "songArtist"])
  o(e).addEventListener("input", () => {
    clearTimeout(Be), (Be = window.setTimeout(T, 180));
  });
let le = !1,
  te = 0,
  de = 0,
  z = null;
function Ke(e) {
  if (le) {
    if (te) {
      de += ((e - te) / 1e3) * Number(o("scrollSpeed").value) * 9;
      const t = Math.floor(de);
      t && (window.scrollBy(0, t), (de -= t));
    }
    if (((te = e), window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2)) {
      we(!1);
      return;
    }
    requestAnimationFrame(Ke);
  }
}
async function we(e) {
  var n;
  le = e;
  for (const b of [o("scrollBtn"), o("cbScroll")])
    b.setAttribute("aria-pressed", String(e)), (b.textContent = e ? "❚❚ Pausar" : "▶ Rolar");
  if (e) {
    (te = 0), requestAnimationFrame(Ke);
    try {
      z = (await ((n = navigator.wakeLock) == null ? void 0 : n.request("screen"))) ?? null;
    } catch {}
  } else z == null || z.release().catch(() => {}), (z = null);
}
o("scrollBtn").onclick = () => we(!le);
function ae(e) {
  (o("edStatus").textContent = e),
    window.setTimeout(() => {
      o("edStatus").textContent === e && (o("edStatus").textContent = "");
    }, 3500);
}
async function Ve(e, t) {
  try {
    await navigator.clipboard.writeText(e), ae(t);
  } catch {
    L.focus(), L.select(), ae("Texto selecionado. Use Ctrl+C para copiar.");
  }
}
o("saveBtn").onclick = async () => {
  const botao = o("saveBtn"),
    t = ge(L.value);
  if (!L.value.trim()) return ae("Escreva ou cole a cifra antes de salvar.");
  botao.disabled = !0;
  try {
    const { cifra, como } = await biblioteca.salvar(
      {
        id: d.songId,
        title: o("songTitle").value || t.meta.title || "Sem título",
        artist: o("songArtist").value || t.meta.artist || "",
        text: L.value,
      },
      d.songBase,
    );
    (d.songId = cifra.id),
      (d.songBase = como === "pendente" ? d.songBase : cifra.updated),
      (d.salvo = instantaneo()),
      T(),
      $e();
    ae(
      como === "copia"
        ? `Outra pessoa tinha alterado essa cifra. A sua versão foi salva como “${cifra.title}”.`
        : como === "pendente"
          ? `Sem internet: “${cifra.title}” ficou guardada neste aparelho e vai para a biblioteca quando a conexão voltar.`
          : `“${cifra.title}” salva na biblioteca compartilhada.`,
    );
  } catch (erro) {
    ae(erro.message || "Não consegui salvar.");
  } finally {
    botao.disabled = !1;
  }
};
o("importFile").onchange = async (e) => {
  var s;
  const t = e.target,
    n = (s = t.files) == null ? void 0 : s[0];
  n &&
    (J({ title: "", artist: "", text: await n.text(), id: null }),
    ae(`Arquivo “${n.name}” aberto.`),
    (t.value = ""));
};
o("copyBtn").onclick = () => Ve(L.value, "Texto copiado.");
o("copyTrBtn").onclick = () => {
  const e = pe(P, se());
  Ve(pt(L.value, se(), ee(e)), "Texto copiado no tom atual.");
};
function J(e) {
  (o("songTitle").value = e.title || ""),
    (o("songArtist").value = e.artist || ""),
    (L.value = e.text || ""),
    (d.songId = e.id),
    (d.songBase = e.updated ?? null),
    (d.semis = 0),
    (d.capo = 0),
    (ie.value = "0"),
    (d.voice = {}),
    (d.salvo = e.id ? instantaneo() : null),
    T();
}
const semAcento = (e) => (e || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
let libDesfazer = null;
function libAviso(texto, desfazerId = null) {
  libDesfazer = desfazerId;
  o("libMsg").innerHTML = texto
    ? y(texto) + (desfazerId ? ' <button class="btn ghost" data-a="undo">Desfazer</button>' : "")
    : "";
}
function $e() {
  const pend = biblioteca.pendentes(),
    total = biblioteca.cifras.length;
  o("libStatus").textContent =
    biblioteca.conectado === !1
      ? `Sem conexão com o servidor. Mostrando a última cópia que este aparelho recebeu (${total} cifra${total === 1 ? "" : "s"}).`
      : biblioteca.conectado
        ? `${total} cifra${total === 1 ? "" : "s"} · todo mundo que abre o Cifrador vê e edita esta biblioteca.`
        : "Carregando a biblioteca…";
  o("libPend").hidden = !pend.length;
  pend.length &&
    (o("libPendTxt").textContent =
      pend.length === 1
        ? "1 cifra está só neste aparelho e ainda não foi para a biblioteca compartilhada."
        : `${pend.length} cifras estão só neste aparelho e ainda não foram para a biblioteca compartilhada.`);
  const busca = semAcento(o("libBusca").value.trim()),
    lista = [
      ...pend.map((t) => ({ ...t, pendente: !0 })),
      ...[...biblioteca.cifras].sort((a, b) =>
        a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" }),
      ),
    ].filter((t) => !busca || semAcento(t.title + " " + t.artist + " " + t.text).includes(busca));
  if (!lista.length) {
    o("libGrid").innerHTML = busca
      ? '<p class="empty">Nenhuma cifra encontrada com essa busca.</p>'
      : '<p class="empty">Nenhuma cifra salva ainda. No editor, toque em “Salvar na biblioteca”.</p>';
    return;
  }
  o("libGrid").innerHTML = lista
    .map((t) => {
      const g = ge(t.text),
        n = [...new Set(qe(g).map((s) => ne(s)))].slice(0, 8).join("  ");
      return `<article class="song" data-id="${y(t.id)}"><div class="songtop"><h4><button class="linkbtn" data-a="open">${y(t.title)}</button></h4><span class="tom" title="Tom">${y(tomDe(t))}</span></div><div class="meta">${y(t.artist || "Artista não informado")}${t.pendente ? ' · <span class="pend">só neste aparelho</span>' : ""}</div><div class="chs">${y(n)}</div><div class="row"><button class="btn primary" data-a="play">▶ Tocar</button><button class="btn" data-a="open">Abrir e editar</button><button class="btn ghost" data-a="del">Excluir</button></div></article>`;
    })
    .join("");
}
async function libAtualizar() {
  try {
    await biblioteca.carregar();
  } catch (erro) {
    libAviso(erro.message);
  }
  $e();
}
o("libBusca").addEventListener("input", () => $e());
o("libEnviar").onclick = async () => {
  const botao = o("libEnviar");
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
    (botao.disabled = !1), $e();
  }
};
o("libMsg").addEventListener("click", async (e) => {
  if (!e.target.closest('button[data-a="undo"]') || !libDesfazer) return;
  try {
    const c = await biblioteca.restaurar(libDesfazer);
    libAviso(`“${c.title}” voltou para a biblioteca.`);
  } catch (erro) {
    libAviso(erro.message);
  }
  $e();
});
o("libGrid").addEventListener("click", async (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  const n = t.closest(".song").dataset.id,
    i = biblioteca.achar(n);
  if (t.dataset.a === "open" && i)
    return J(i), xe(!window.matchMedia("(max-width: 860px)").matches), Y("cifra"), scrollTo(0, 0);
  if (t.dataset.a === "play" && i) return J(i), entrarCulto();
  if (t.dataset.a === "del")
    return (
      (t.textContent = "Confirmar exclusão"), (t.dataset.a = "del2"), void (t.style.color = "var(--danger)")
    );
  if (t.dataset.a !== "del2" || !i) return;
  t.disabled = !0;
  try {
    const pend = biblioteca.pendentes().some((r) => r.id === n) && !biblioteca.cifras.some((r) => r.id === n);
    await biblioteca.apagar(n), d.songId === n && ((d.songId = null), (d.songBase = null));
    libAviso(`“${i.title}” foi excluída.`, pend ? null : n);
  } catch (erro) {
    libAviso(
      erro.codigo === "offline" ? "Sem conexão com o servidor: não deu para excluir agora." : erro.message,
    );
  }
  $e();
});
document.addEventListener("visibilitychange", () => {
  !document.hidden && !o("tab-lib").hidden && libAtualizar();
});
function Y(e) {
  document.querySelectorAll(".view").forEach((t) => (t.hidden = t.id !== "tab-" + e)),
    document
      .querySelectorAll(".tabs button")
      .forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === e))),
    e !== "cifra" && le && we(!1),
    e === "lib" && libAtualizar(),
    e === "culto" && repAtualizar(),
    e !== "cifra" && culto && sairCulto(),
    E.set("tab", e);
}
document.querySelectorAll(".tabs button").forEach((e) => (e.onclick = () => Y(e.dataset.tab)));
let $ = null,
  S = null,
  fe = null,
  K = !1,
  Ge = 0,
  B = "",
  v = null,
  V = !1;
function G(e, t = !1) {
  (o("auStatus").textContent = e), o("auStatus").classList.toggle("err", t);
}
const I = (e) => (o("prog").style.width = (e * 100).toFixed(0) + "%");
function We(e, t) {
  fe && URL.revokeObjectURL(fe),
    (fe = e),
    (o("media").innerHTML = t
      ? '<video id="player" controls playsinline></video>'
      : '<audio id="player" controls></audio>'),
    (S = o("player")),
    (S.src = e),
    S.addEventListener("play", () => {
      cancelAnimationFrame(Ge);
      const n = () => {
        N(), S && !S.paused && (Ge = requestAnimationFrame(n));
      };
      n();
    }),
    S.addEventListener("seeked", () => N()),
    S.addEventListener("pause", () => N());
}
async function _e(e) {
  const t = await vt(e);
  return (
    G("Analisando as notas…"),
    yt(t, Oe, { penalty: Number(o("optSens").value), sevenths: o("optSev").checked }, I)
  );
}
function Et() {
  return {
    lyrics: o("apiLyrics").checked,
    separate: o("apiSeparate").checked,
    sevenths: o("optSev").checked,
    language: "pt",
  };
}
const At = {
  queued: "Na fila…",
  download: "Baixando o áudio…",
  decode: "Lendo o áudio…",
  separate: "Separando os instrumentos…",
  chords: "Tirando os acordes…",
  lyrics: "Transcrevendo a letra…",
  align: "Encaixando acordes na letra…",
};
async function Je(e) {
  const t = await St(o("apiUrl").value, e, Et(), (n, s) => {
    G(At[n] || n), I(s);
  });
  return I(1), t;
}
function Ye(e) {
  return {
    key: Ne(e.key) || { tonic: 0, minor: !1 },
    duration: e.duration,
    segments: e.chords.map((n) => ({ ...n, none: !n.label })),
  };
}
async function Qe(e) {
  if (!e) return;
  (B = e.name.replace(/\.[^.]+$/, "")), I(0), (v = null), G(`Lendo “${e.name}”…`);
  const t = /^video\//.test(e.type) || /\.(mp4|webm|mov|m4v|mkv)$/i.test(e.name);
  try {
    We(URL.createObjectURL(e), t),
      V && o("apiUse").checked ? ((v = await Je({ file: e })), re(Ye(v))) : re(await _e(await bt(e)));
  } catch (n) {
    console.error(n),
      G(
        n instanceof Error && V
          ? n.message
          : "Não consegui ler o áudio desse arquivo. Tente um mp3, m4a, wav, mp4 ou webm.",
        !0,
      );
  }
}
function re(e) {
  var s;
  $ = e;
  const t = e.segments.filter((i) => !i.none).length,
    n = (s = v == null ? void 0 : v.warnings) != null && s.length ? " " + v.warnings.join(" ") : "";
  G(
    `Pronto: ${t} trechos com acorde em ${ce(e.duration)}. Dê play para acompanhar e corrija o que soar errado.${n}`,
  ),
    (o("resTitle").textContent = (v == null ? void 0 : v.title) || B || "Resultado"),
    (o("resKey").textContent = "Tom estimado: " + q(e.key)),
    (o("resActions").hidden = !1),
    (o("nowBox").hidden = !1),
    (o("openFull").hidden = !(v != null && v.chordpro)),
    Ze(),
    N(!0);
}
function Lt(e) {
  var s;
  const t = $.segments;
  let n = t.findIndex((i) => e >= i.start && e < i.end);
  return n < 0 && (n = e < (((s = t[0]) == null ? void 0 : s.start) || 0) ? 0 : t.length - 1), n;
}
let me = -2;
function N(e = !1) {
  if (!$) return;
  const t = S ? S.currentTime : 0,
    n = Lt(t),
    s = $.segments[n];
  if (
    !s ||
    ((o("nowBar").style.width = Math.min(1, (t - s.start) / Math.max(0.01, s.end - s.start)) * 100 + "%"),
    n === me && !e)
  )
    return;
  me = n;
  const i = $.segments.find((r, a) => a > n && !r.none);
  (o("nowChord").textContent = s.none ? "–" : s.label),
    (o("nextChord").textContent = i ? i.label : "fim"),
    (o("nowDiag").innerHTML = s.none ? "" : He(s.label, he($.key))),
    document.querySelectorAll(".chip").forEach((r) => r.classList.toggle("cur", Number(r.dataset.i) === n));
}
function Ze() {
  o("timeline").innerHTML = $.segments
    .map((e, t) =>
      e.none
        ? ""
        : `<button class="chip" data-i="${t}"><span class="c">${y(e.label)}</span><span class="t">${ce(e.start)}</span></button>`,
    )
    .join("");
}
o("timeline").addEventListener("click", (e) => {
  const t = e.target,
    n = t.closest(".chip");
  if (!n || !$ || t.tagName === "INPUT") return;
  const s = Number(n.dataset.i),
    i = $.segments[s];
  if (!K) {
    S && ((S.currentTime = i.start + 0.01), N(!0));
    return;
  }
  n.querySelector(".c").outerHTML =
    `<input id="chipEdit" value="${y(i.label)}" aria-label="Acorde em ${ce(i.start)}">`;
  const r = o("chipEdit");
  r.focus(),
    r.select(),
    r.addEventListener(
      "blur",
      () => {
        const a = r.value.trim();
        a ? C(a) && (i.label = a) : ($.segments.splice(s, 1), s > 0 && ($.segments[s - 1].end = i.end)),
          (v = null),
          (o("openFull").hidden = !0),
          Ze(),
          (me = -2),
          N(!0);
      },
      { once: !0 },
    ),
    r.addEventListener("keydown", (a) => {
      a.key === "Enter" && r.blur(), a.key === "Escape" && ((r.value = i.label), r.blur());
    });
});
o("editChips").onclick = () => {
  (K = !K), o("editChips").setAttribute("aria-pressed", String(K)), (o("editHint").hidden = !K);
};
o("toSheet").onclick = () => {
  if (!$) return;
  const e = $.segments.filter((n) => !n.none);
  let t = `{t: ${B || "Música"}}
{key: ${q($.key)}}

[Acordes tirados do áudio]
`;
  for (let n = 0; n < e.length; n += 4) {
    const s = e.slice(n, n + 4);
    t +=
      ce(s[0].start).padEnd(7) +
      s
        .map((i) => i.label.padEnd(8))
        .join("")
        .trimEnd() +
      `

`;
  }
  (t += `[Escreva a letra embaixo de cada linha de acordes]
`),
    J({ title: B, artist: "", text: t, id: null }),
    xe(!0),
    Y("cifra"),
    window.scrollTo(0, 0);
};
o("openFull").onclick = () => {
  v &&
    (J({ title: v.title || B, artist: "", text: v.chordpro, id: null }), Y("cifra"), window.scrollTo(0, 0));
};
o("mediaFile").onchange = (e) => {
  var n;
  const t = e.target;
  Qe((n = t.files) == null ? void 0 : n[0]), (t.value = "");
};
const _ = o("drop");
for (const e of ["dragenter", "dragover"])
  _.addEventListener(e, (t) => {
    t.preventDefault(), _.classList.add("over");
  });
for (const e of ["dragleave", "drop"])
  _.addEventListener(e, (t) => {
    t.preventDefault(), _.classList.remove("over");
  });
_.addEventListener("drop", (e) => {
  var t;
  return Qe((t = e.dataTransfer) == null ? void 0 : t.files[0]);
});
o("demoBtn").onclick = async () => {
  (B = "Exemplo sintetizado"), (v = null), I(0), G("Gerando o áudio de exemplo…");
  try {
    const e = await xt();
    We(URL.createObjectURL(wt(e)), !1), re(await _e(e));
  } catch (e) {
    console.error(e), G("Este navegador não conseguiu gerar o áudio de exemplo.", !0);
  }
};
async function Xe() {
  const e = o("apiUrl").value.trim();
  if ((E.set("api", e), !e)) {
    (V = !1), (o("apiBox").hidden = !0), (o("apiFeat").innerHTML = "");
    return;
  }
  o("apiFeat").innerHTML = "<span>Conectando…</span>";
  try {
    const t = await $t(e);
    (V = !0), (o("apiBox").hidden = !1);
    const n = {
      youtube: "YouTube",
      lyrics: "Letra (Whisper)",
      separate: "Separação (Demucs)",
      ffmpeg: "ffmpeg",
    };
    (o("apiFeat").innerHTML =
      '<span class="on">Conectado</span>' +
      Object.entries(t.features)
        .map(([s, i]) => `<span class="${i ? "on" : ""}">${y(n[s] || s)}${i ? "" : " indisponível"}</span>`)
        .join("")),
      (o("apiLyrics").disabled = !t.features.lyrics),
      (o("apiLyrics").checked = !!t.features.lyrics),
      (o("apiSeparate").disabled = !t.features.separate),
      (o("ytUrl").disabled = o("ytGo").disabled = !t.features.youtube);
  } catch {
    (V = !1),
      (o("apiBox").hidden = !0),
      (o("apiFeat").innerHTML =
        "<span>Não consegui falar com o servidor. Confira o endereço e se ele está rodando.</span>");
  }
}
o("apiConnect").onclick = Xe;
o("ytGo").onclick = async () => {
  const e = o("ytUrl").value.trim();
  if (e) {
    I(0), (B = "");
    try {
      (v = await Je({ url: e })),
        (B = v.title),
        (o("media").innerHTML =
          `<p class="hint">Áudio do link analisado no servidor. <a href="${y(e)}" target="_blank" rel="noopener">Abrir o vídeo</a> para ouvir junto.</p>`),
        (S = null),
        re(Ye(v));
    } catch (t) {
      G(t instanceof Error ? t.message : "A análise falhou.", !0);
    }
  }
};
/* ===================== Salvo / não salvo ===================== */
function instantaneo() {
  return JSON.stringify([o("songTitle").value, o("songArtist").value, L.value]);
}
function marcarSalvo() {
  const b = o("saveBtn"),
    igual = d.salvo != null && d.salvo === instantaneo();
  (b.textContent = igual ? "Salvo na biblioteca ✓" : d.songId ? "Salvar alterações" : "Salvar na biblioteca"),
    b.classList.toggle("ok", igual);
}

/** Tom de uma cifra da biblioteca (com semis de transposição), por exemplo "G" ou "Em". */
function tomDe(c, semis = 0) {
  const g = ge(c.text || ""),
    k = Ne(g.meta.key) || ut(qe(g));
  if (!k) return "–";
  const t = pe(k, semis);
  return q(t, he(t));
}

/* ===================== Desenhos e ajustes ===================== */
function mostrarDesenhos(v) {
  (d.diag = v),
    E.set("diag", v),
    o("diagBtn").setAttribute("aria-pressed", String(v)),
    (o("diagrams").hidden = !v);
}
o("diagBtn").onclick = () => mostrarDesenhos(!d.diag);
o("maisBtn").onclick = () => {
  const aberto = o("maisBtn").getAttribute("aria-expanded") !== "true";
  o("maisBtn").setAttribute("aria-expanded", String(aberto)),
    document.querySelector(".toolbar").classList.toggle("aberta", aberto);
};
o("libNova").onclick = () => {
  J({ title: "", artist: "", text: "", id: null }),
    xe(!0),
    Y("cifra"),
    scrollTo(0, 0),
    o("songTitle").focus();
};
o("newBtn").onclick = () => {
  J({ title: "", artist: "", text: "", id: null }), xe(!0), o("songTitle").focus();
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
  (culto = { rep, pos }), rep && abrirDoRepertorio(), Y("cifra"), xe(!1);
  document.body.classList.add("culto"), (o("cultoBar").hidden = !1), manterTelaAcesa(!0);
  try {
    document.fullscreenEnabled &&
      !document.fullscreenElement &&
      document.documentElement.requestFullscreen().catch(() => {});
  } catch {}
  scrollTo(0, 0), barraCulto();
}
function sairCulto() {
  (culto = null),
    ajustarTela(),
    document.body.classList.remove("ocioso"),
    document.body.classList.remove("culto"),
    (o("cultoBar").hidden = !0),
    le && we(!1),
    manterTelaAcesa(!1);
  document.fullscreenElement && document.exitFullscreen().catch(() => {});
}
function abrirDoRepertorio() {
  const it = culto.rep.itens[culto.pos],
    c = it && biblioteca.achar(it.id);
  J(c || { title: "Música não encontrada", artist: "Ela foi excluída da biblioteca.", text: "", id: null }),
    (d.semis = (it && it.semis) || 0),
    T(),
    le && we(!1),
    scrollTo(0, 0),
    barraCulto();
}
/* ---------- Ajustar à tela: a música inteira na tela, sem rolar ---------- */
// Testa de 1 até N colunas e, para cada uma, o maior tamanho de letra em que tudo cabe; fica com o maior.
function ajustarTela() {
  const sh = o("sheet"),
    ligado = !!culto && d.ajuste;
  document.body.classList.toggle("ajuste", ligado), o("cbFit").setAttribute("aria-pressed", String(ligado));
  if (!ligado) {
    document.body.classList.remove("naocabe"),
      sh.style.removeProperty("height"),
      sh.style.removeProperty("font-size"),
      sh.style.removeProperty("column-count");
    return;
  }
  sh.style.height = "auto";
  // No computador a barra some sozinha; em celular e tablet ela fica, então a música termina acima dela.
  const barra = matchMedia("(hover: hover)").matches ? 0 : o("cultoBar").offsetHeight,
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
    (!melhor || nota > melhor.nota + 0.3) && (melhor = { cols, tam: lo, nota });
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
let ajusteQuadro = 0;
const reajustar = () => {
  cancelAnimationFrame(ajusteQuadro), (ajusteQuadro = requestAnimationFrame(ajustarTela));
};
window.addEventListener("resize", reajustar);
document.fonts && document.fonts.ready.then(reajustar);
o("cbFit").onclick = () => {
  (d.ajuste = !d.ajuste), E.set("ajuste", d.ajuste), le && we(!1), scrollTo(0, 0), ajustarTela();
};
// No computador, com a música ajustada, a barra some sozinha e volta ao mexer o mouse.
let ociosoTimer = 0;
function acordar() {
  document.body.classList.remove("ocioso"), clearTimeout(ociosoTimer);
  culto &&
    d.ajuste &&
    matchMedia("(hover: hover)").matches &&
    (ociosoTimer = setTimeout(() => document.body.classList.add("ocioso"), 2500));
}
for (const ev of ["mousemove", "keydown", "touchstart"])
  document.addEventListener(ev, acordar, { passive: !0 });

function barraCulto() {
  reajustar(), acordar();
  const r = culto && culto.rep;
  (o("cbPrev").hidden = o("cbNext").hidden = !r),
    (o("cbPos").textContent = r
      ? `${culto.pos + 1} de ${r.itens.length} · ${r.nome}`
      : o("shTitle").textContent);
  r && ((o("cbPrev").disabled = culto.pos <= 0), (o("cbNext").disabled = culto.pos >= r.itens.length - 1));
}
const andar = (passo) => {
  if (!culto || !culto.rep) return;
  const novo = culto.pos + passo;
  novo >= 0 && novo < culto.rep.itens.length && ((culto.pos = novo), abrirDoRepertorio());
};
o("cultoBtn").onclick = () => entrarCulto();
o("cbExit").onclick = sairCulto;
o("cbPrev").onclick = () => andar(-1);
o("cbNext").onclick = () => andar(1);
o("cbUp").onclick = () => (o("tUp").click(), reajustar());
o("cbDown").onclick = () => (o("tDown").click(), reajustar());
const letraManual = (passo) => {
  d.ajuste && ((d.ajuste = !1), E.set("ajuste", !1), ajustarTela()), ye(d.size + passo);
};
o("cbFUp").onclick = () => letraManual(1);
o("cbFDown").onclick = () => letraManual(-1);
o("cbScroll").onclick = () => we(!le);
document.addEventListener("keydown", (e) => {
  if (!culto || e.target.closest("input, textarea, select")) return;
  e.key === "Escape"
    ? sairCulto()
    : e.key === "ArrowRight" || e.key === "PageDown"
      ? andar(1)
      : (e.key === "ArrowLeft" || e.key === "PageUp") && andar(-1);
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
  o("repMsg").textContent = t;
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
  (o("repLista").hidden = !1), (o("repEdit").hidden = !0);
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
  o("repGrid").innerHTML = lista.length
    ? lista
        .map((r) => {
          const nomes = r.itens.map((it) => (biblioteca.achar(it.id) || { title: "?" }).title);
          return `<article class="song${r.data && r.data < hoje ? " passado" : ""}" data-id="${y(r.id)}"><h4><button class="linkbtn" data-a="abrir">${y(r.nome)}</button></h4><div class="meta">${y(dataBR(r.data))} · ${nomes.length} música${nomes.length === 1 ? "" : "s"}</div><div class="replist-mini">${y(nomes.slice(0, 4).join(" · ") + (nomes.length > 4 ? " …" : ""))}</div><div class="row"><button class="btn primary" data-a="tocar"${nomes.length ? "" : " disabled"}>▶ Tocar</button><button class="btn" data-a="abrir">Montar</button></div></article>`;
        })
        .join("")
    : '<p class="empty">Nenhum repertório ainda. Toque em “+ Novo repertório” para montar o do próximo culto.</p>';
}
o("repGrid").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-a]");
  if (!b) return;
  const r = biblioteca.repertorios.find((x) => x.id === b.closest(".song").dataset.id);
  r && (b.dataset.a === "tocar" ? r.itens.length && entrarCulto(structuredClone(r), 0) : repAbrir(r));
});
function repAbrir(r) {
  (repAtual = structuredClone(r)),
    (o("repLista").hidden = !0),
    (o("repEdit").hidden = !1),
    (o("repNome").value = r.nome),
    (o("repData").value = r.data || "");
  (o("repSalvo").textContent = ""),
    (o("repBusca").value = ""),
    (o("repSug").innerHTML = ""),
    (o("repApagar").textContent = "Excluir repertório"),
    repItens(),
    scrollTo(0, 0);
}
o("repNovo").onclick = () => {
  repAbrir({ id: null, nome: "Culto de domingo", data: proxDomingo(), itens: [] }),
    o("repNome").select(),
    repMudou();
};
o("repVoltar").onclick = () => {
  (repAtual = null), repLista();
};
function repItens() {
  const r = repAtual;
  o("repTocar").disabled = !r.itens.length;
  o("repItens").innerHTML = r.itens.length
    ? r.itens
        .map((it, i) => {
          const c = biblioteca.achar(it.id);
          return `<li data-i="${i}"><div class="ri-nome"><strong>${y(c ? c.title : "Música excluída da biblioteca")}</strong><span>${y(c ? c.artist || "" : "")}</span></div><div class="ri-tom" role="group" aria-label="Tom de ${y(c ? c.title : "")}"><button class="btn sq" data-a="tom" data-d="-1" aria-label="Meio tom abaixo">−</button><span class="keybox">${y(c ? tomDe(c, it.semis) : "–")}</span><button class="btn sq" data-a="tom" data-d="1" aria-label="Meio tom acima">+</button></div><div class="ri-ord"><button class="btn sq" data-a="sobe" aria-label="Subir"${i ? "" : " disabled"}>↑</button><button class="btn sq" data-a="desce" aria-label="Descer"${i < r.itens.length - 1 ? "" : " disabled"}>↓</button><button class="btn sq ghost" data-a="tira" aria-label="Tirar do repertório">✕</button></div></li>`;
        })
        .join("")
    : '<p class="empty">Nenhuma música ainda. Busque abaixo e toque no nome para adicionar.</p>';
}
o("repItens").addEventListener("click", (e) => {
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
o("repBusca").addEventListener("input", () => {
  const busca = semAcento(o("repBusca").value.trim());
  o("repSug").innerHTML = busca
    ? biblioteca.cifras
        .filter((c) => semAcento(c.title + " " + c.artist + " " + c.text).includes(busca))
        .slice(0, 8)
        .map(
          (c) =>
            `<button class="sug" data-id="${y(c.id)}"><strong>${y(c.title)}</strong> <span>${y(c.artist || "")} · ${y(tomDe(c))}</span></button>`,
        )
        .join("") || '<p class="hint">Nada encontrado na biblioteca.</p>'
    : "";
});
o("repSug").addEventListener("click", (e) => {
  const b = e.target.closest("button.sug");
  b &&
    (repAtual.itens.push({ id: b.dataset.id, semis: 0 }),
    (o("repBusca").value = ""),
    (o("repSug").innerHTML = ""),
    repItens(),
    repMudou(),
    o("repBusca").focus());
});
for (const id of ["repNome", "repData"])
  o(id).addEventListener("input", () => {
    (repAtual.nome = o("repNome").value), (repAtual.data = o("repData").value), repMudou();
  });
function repMudou() {
  clearTimeout(repTimer), (o("repSalvo").textContent = "Salvando…");
  repTimer = setTimeout(() => {
    const atual = repAtual;
    repFila = repFila.then(async () => {
      try {
        const salvo = await biblioteca.salvarRepertorio(atual);
        (atual.id = salvo.id), repAtual === atual && (o("repSalvo").textContent = "Salvo ✓ · a equipe já vê");
      } catch (erro) {
        repAtual === atual &&
          (o("repSalvo").textContent =
            erro.codigo === "offline"
              ? "Sem internet: não foi salvo. Tente de novo quando a conexão voltar."
              : erro.message);
      }
    });
  }, 700);
}
o("repTocar").onclick = () => repAtual.itens.length && entrarCulto(structuredClone(repAtual), 0);
o("repApagar").onclick = async () => {
  const b = o("repApagar");
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
    o("repSalvo").textContent = erro.message;
  }
};

(function () {
  var s;
  const t = E.get("draft", null);
  (s = t == null ? void 0 : t.text) != null && s.trim()
    ? ((L.value = t.text),
      (o("songTitle").value = t.title || ""),
      (o("songArtist").value = t.artist || ""),
      (d.songId = t.id || null),
      (d.songBase = t.base ?? null),
      (d.salvo = t.salvo ?? null))
    : (L.value = ""),
    ye(E.get("size", 17)),
    (d.inst = E.get("inst", "guitar")),
    o("instGuitar").setAttribute("aria-pressed", String(d.inst === "guitar")),
    o("instKeys").setAttribute("aria-pressed", String(d.inst === "keys")),
    (o("capoGrp").hidden = d.inst !== "guitar"),
    xe(!window.matchMedia("(max-width: 860px)").matches),
    T(),
    $e(),
    (d.ajuste = E.get("ajuste", window.matchMedia("(min-width: 861px)").matches)),
    (d.diag = E.get("diag", !0)),
    mostrarDesenhos(d.diag),
    Y(E.get("tab", L.value.trim() ? "cifra" : "lib")),
    o("tab-lib").hidden && libAtualizar();
  const n = E.get("api", "") || void 0 || "";
  n && ((o("apiUrl").value = n), Xe()),
    "serviceWorker" in navigator && navigator.serviceWorker.register("./sw.js").catch(() => {});
})();
