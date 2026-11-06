const rt = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  st = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
  w = (r) => ((r % 12) + 12) % 12,
  lt = (r, c = !1) => (c ? st : rt)[w(r)],
  ft = new Set([5, 10, 3, 8, 1, 6]),
  at = new Set([2, 7, 0, 5, 10, 3]);
function ct(r) {
  return r ? (r.minor ? at : ft).has(w(r.tonic)) : !1;
}
function it(r, c) {
  const i = c ? w(r + 3) : r;
  return { maj: [i, w(i + 5), w(i + 7)], min: [w(i + 2), w(i + 4), w(i + 9)] };
}
function ht(r) {
  const c = new Float32Array(r / 2),
    i = new Float32Array(r / 2);
  for (let e = 0; e < r / 2; e++)
    (c[e] = Math.cos((2 * Math.PI * e) / r)), (i[e] = -Math.sin((2 * Math.PI * e) / r));
  const h = new Uint32Array(r);
  for (let e = 0, f = 0; e < r; e++) {
    h[e] = f;
    let a = r >> 1;
    for (; f & a; ) (f ^= a), (a >>= 1);
    f |= a;
  }
  return (e, f) => {
    for (let a = 0; a < r; a++) {
      const M = h[a];
      if (a < M) {
        let s = e[a];
        (e[a] = e[M]), (e[M] = s), (s = f[a]), (f[a] = f[M]), (f[M] = s);
      }
    }
    for (let a = 2; a <= r; a <<= 1) {
      const M = a >> 1,
        s = r / a;
      for (let u = 0; u < r; u += a)
        for (let F = 0; F < M; F++) {
          const d = u + F,
            g = d + M,
            v = c[F * s],
            _ = i[F * s],
            I = e[g] * v - f[g] * _,
            k = e[g] * _ + f[g] * v;
          (e[g] = e[d] - I), (f[g] = f[d] - k), (e[d] += I), (f[d] += k);
        }
    }
  };
}
const mt = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
  yt = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
function tt(r, c) {
  const i = r.length;
  let h = 0,
    e = 0;
  for (let s = 0; s < i; s++) (h += r[s]), (e += c[s]);
  (h /= i), (e /= i);
  let f = 0,
    a = 0,
    M = 0;
  for (let s = 0; s < i; s++) {
    const u = r[s] - h,
      F = c[s] - e;
    (f += u * F), (a += u * u), (M += F * F);
  }
  return f / Math.sqrt(a * M || 1);
}
function W(r, c, i) {
  const h = new Float32Array(12);
  c.forEach((f, a) => (h[w(r + f)] = i[a]));
  let e = 0;
  for (const f of h) e += f * f;
  e = Math.sqrt(e);
  for (let f = 0; f < 12; f++) h[f] /= e;
  return h;
}
const z = (r, c, i) => {
  let h = 0;
  for (let e = 0; e < 12; e++) h += r[c + e] * i[e];
  return h;
};
function Mt(r, c, i = {}, h = () => {}) {
  const a = i.penalty ?? 0.2;
  let M = r;
  if (M.length < 8192) {
    const t = new Float32Array(8192);
    t.set(M), (M = t);
  }
  const s = Math.floor((M.length - 8192) / 2048) + 1,
    u = new Float32Array(8192);
  for (let t = 0; t < 8192; t++) u[t] = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 8191);
  const F = ht(8192),
    d = new Float32Array(8192),
    g = new Float32Array(8192),
    v = new Float32Array(8192 / 2),
    _ = Math.max(2, Math.floor((55 * 8192) / c)),
    I = Math.min(8192 / 2 - 2, Math.ceil((1800 * 8192) / c)),
    k = new Float32Array(s * 12),
    j = new Float32Array(s * 12),
    D = new Float32Array(s);
  for (let t = 0; t < s; t++) {
    const l = t * 2048;
    for (let o = 0; o < 8192; o++) (d[o] = M[l + o] * u[o]), (g[o] = 0);
    F(d, g);
    for (let o = _ - 1; o <= I + 1; o++) v[o] = Math.hypot(d[o], g[o]);
    for (let o = _; o <= I; o++) {
      const n = v[o];
      if (n > v[o - 1] && n >= v[o + 1]) {
        const m = v[o - 1],
          y = v[o + 1],
          b = m - 2 * n + y,
          H = b ? (0.5 * (m - y)) / b : 0,
          L = ((o + H) * c) / 8192,
          E = w(Math.round(69 + 12 * Math.log2(L / 440))),
          A = n * n;
        (k[t * 12 + E] += A), (D[t] += A), L < 260 && (j[t * 12 + E] += A);
      }
    }
    t % 64 === 0 && h(t / s);
  }
  for (let t = 0; t < s; t++) {
    let l = 0,
      o = 0;
    for (let n = 0; n < 12; n++) {
      const m = Math.sqrt(k[t * 12 + n]);
      (k[t * 12 + n] = m), (l += m * m);
      const y = Math.sqrt(j[t * 12 + n]);
      (j[t * 12 + n] = y), y > o && (o = y);
    }
    l = Math.sqrt(l) || 1;
    for (let n = 0; n < 12; n++) (k[t * 12 + n] /= l), (j[t * 12 + n] /= o || 1);
  }
  const U = 2,
    G = new Float32Array(s * 12),
    Q = new Float32Array(s * 12);
  for (let t = 0; t < s; t++) {
    let l = 0;
    for (let o = 0; o < 12; o++) {
      let n = 0,
        m = 0;
      for (let y = -U; y <= U; y++) {
        const b = Math.min(s - 1, Math.max(0, t + y));
        (n += k[b * 12 + o]), (m += j[b * 12 + o]);
      }
      (G[t * 12 + o] = n), (Q[t * 12 + o] = m / (2 * U + 1)), (l += n * n);
    }
    l = Math.sqrt(l) || 1;
    for (let o = 0; o < 12; o++) G[t * 12 + o] /= l;
  }
  const V = Array.from(D).sort((t, l) => t - l),
    X = V[Math.floor(V.length * 0.95)] || 1,
    Y = new Float32Array(12);
  for (let t = 0; t < s; t++) if (D[t] > X * 0.01) for (let l = 0; l < 12; l++) Y[l] += k[t * 12 + l];
  let q = { tonic: 0, minor: !1, r: -2 };
  for (let t = 0; t < 12; t++) {
    const l = Array.from({ length: 12 }, (m, y) => Y[w(y + t)]),
      o = tt(l, mt),
      n = tt(l, yt);
    o > q.r && (q = { tonic: t, minor: !1, r: o }), n > q.r && (q = { tonic: t, minor: !0, r: n });
  }
  const Z = it(q.tonic, q.minor),
    T = [];
  for (let t = 0; t < 12; t++)
    T.push({ root: t, minor: !1, v: W(t, [0, 4, 7], [1, 0.9, 0.85]) }),
      T.push({ root: t, minor: !0, v: W(t, [0, 3, 7], [1, 0.9, 0.85]) });
  const p = T.length + 1,
    K = new Float32Array(s * p);
  for (let t = 0; t < s; t++) {
    const l = D[t] < X * 0.004;
    for (let o = 0; o < T.length; o++) {
      const n = T[o];
      let m = z(G, t * 12, n.v) + 0.1 * Q[t * 12 + n.root];
      (n.minor ? Z.min : Z.maj).includes(n.root) && (m += 0.03), (K[t * p + o] = l ? 0 : m);
    }
    K[t * p + T.length] = l ? 1 : 0.25;
  }
  const x = new Float32Array(p),
    P = new Float32Array(p),
    J = new Uint8Array(s * p);
  for (let t = 0; t < p; t++) x[t] = K[t];
  for (let t = 1; t < s; t++) {
    let l = 0;
    for (let o = 1; o < p; o++) x[o] > x[l] && (l = o);
    for (let o = 0; o < p; o++) {
      const n = x[o],
        m = x[l] - a;
      n >= m ? ((P[o] = n), (J[t * p + o] = o)) : ((P[o] = m), (J[t * p + o] = l)), (P[o] += K[t * p + o]);
    }
    x.set(P);
  }
  const C = new Uint8Array(s);
  let O = 0;
  for (let t = 1; t < p; t++) x[t] > x[O] && (O = t);
  C[s - 1] = O;
  for (let t = s - 1; t > 0; t--) C[t - 1] = J[t * p + C[t]];
  const B = [];
  for (let t = 0; t < s; t++) {
    const l = B[B.length - 1];
    l && l.s === C[t] ? (l.f1 = t) : B.push({ s: C[t], f0: t, f1: t });
  }
  const ot = Math.ceil((0.45 * c) / 2048),
    N = [];
  for (const t of B)
    (N.length && t.f1 - t.f0 + 1 < ot) || (N.length && N[N.length - 1].s === t.s)
      ? (N[N.length - 1].f1 = t.f1)
      : N.push({ ...t });
  const et = ct(q),
    $ = (t) => (t * 2048 + 8192 / 2) / c,
    nt = N.map((t) => {
      const l = t.f0 === 0 ? 0 : $(t.f0) - 2048 / c / 2,
        o = $(t.f1) + 2048 / c / 2;
      if (t.s === T.length) return { start: l, end: o, label: "", none: !0 };
      const n = T[t.s];
      let m = n.minor ? "m" : "";
      if (i.sevenths) {
        const y = new Float32Array(12);
        for (let A = t.f0; A <= t.f1; A++) for (let S = 0; S < 12; S++) y[S] += G[A * 12 + S];
        let b = 0;
        for (const A of y) b += A * A;
        b = Math.sqrt(b) || 1;
        for (let A = 0; A < 12; A++) y[A] /= b;
        const H = z(y, 0, n.v),
          L = n.minor
            ? [["m7", [0, 3, 7, 10]]]
            : [
                ["7", [0, 4, 7, 10]],
                ["7M", [0, 4, 7, 11]],
              ];
        let E = null;
        for (const [A, S] of L) {
          const R = z(y, 0, W(n.root, S, [1, 0.9, 0.85, 0.75]));
          R > H + 0.02 && (!E || R > E.sc) && (E = { sf: A, sc: R });
        }
        E && (m = E.sf);
      }
      return { start: l, end: o, label: lt(n.root, et) + m };
    });
  return h(1), { segments: nt, key: { tonic: q.tonic, minor: q.minor }, duration: r.length / c };
}
self.onmessage = (r) => {
  const { samples: c, sr: i, opts: h } = r.data;
  try {
    const e = Mt(c, i, h, (f) => self.postMessage({ type: "progress", p: f }));
    self.postMessage({ type: "done", result: e });
  } catch (e) {
    self.postMessage({ type: "error", message: String(e) });
  }
};
