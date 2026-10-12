/**
 * Gera uma prévia estática do site com páginas planas e caminhos relativos,
 * para visualização fora do domínio definitivo (ex.: artefato privado).
 *
 * Uso: npm run preview:build   →   saída em preview/
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const DEST = "preview";

execSync("npx next build", { stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_PREVIEW_STATIC: "1" } });

rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });

const relNext = (s) =>
  s
    .replaceAll("/_next/static/", "./next/_next/static/")
    .replaceAll('TURBOPACK_CHUNK_BASE_PATH:"/_next/"', 'TURBOPACK_CHUNK_BASE_PATH:"./next/_next/"')
    .replaceAll('href="/icon.png', 'href="./icon.png')
    .replaceAll('href="/apple-icon.png', 'href="./apple-icon.png')
    .replaceAll('href="/favicon.ico', 'href="./favicon.ico');

// Páginas: out/index.html → inicio.html; out/<rota>/index.html → <rota>.html
const pages = [["index.html", "inicio.html"]];
for (const entry of readdirSync(OUT)) {
  const p = join(OUT, entry, "index.html");
  if (statSync(join(OUT, entry)).isDirectory() && existsSync(p) && !["_next", "_not-found", "404"].includes(entry)) {
    pages.push([join(entry, "index.html"), `${entry}.html`]);
  }
}
for (const [src, dest] of pages) {
  writeFileSync(join(DEST, dest), relNext(readFileSync(join(OUT, src), "utf8")));
}

// Arquivos estáticos
for (const dir of ["brand", "images"]) cpSync(join(OUT, dir), join(DEST, dir), { recursive: true });
for (const f of ["icon.png", "apple-icon.png", "opengraph-image.jpg"]) if (existsSync(join(OUT, f))) cpSync(join(OUT, f), join(DEST, f));

// _next → next/_next (nomes iniciados por "_" não podem ficar na raiz da prévia);
// scripts com caminhos relativos; CSS com fontes relativas à própria folha
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
for (const file of walk(join(OUT, "_next"))) {
  const target = join(DEST, "next", file.slice(OUT.length + 1));
  mkdirSync(join(target, ".."), { recursive: true });
  // U+FFFD literal (em decodificadores de bibliotecas) vira escape equivalente
  if (file.endsWith(".js")) writeFileSync(target, relNext(readFileSync(file, "utf8")).replaceAll("\uFFFD", "\\ufffd"));
  else if (file.endsWith(".css"))
    writeFileSync(target, readFileSync(file, "utf8").replaceAll("url(/_next/static/media/", "url(../media/"));
  else if (!file.endsWith(".txt") && !file.endsWith(".map")) cpSync(file, target);
}
// Página de entrada (o artefato abre aqui e segue para inicio.html)
cpSync("scripts/preview-entry.html", join(DEST, "index.html"));

console.log("Prévia gerada em", DEST, "—", pages.map((p) => p[1]).join(", "));
