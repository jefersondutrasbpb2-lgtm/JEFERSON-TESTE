// Monta a Escala do Louvor dentro do site (out/escalas/), depois do next build.
//
// A pasta vira o subdomínio escalas.igrejacongregacionalpombal.com.br (e o endereço /escalas do
// site). Vão juntos o app (web/escala-louvor) com fontes, marca, manifesto e service worker (PWA),
// a ligação com o servidor (servidor.js), a API em PHP e os dados de partida (semente.php, usados
// só enquanto o servidor não tem dados).
import { copyFileSync, cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const app = "web/escala-louvor";
const destino = "out/escalas";
const CABECA = "<?php exit; ?>\n";
const versao = Date.now().toString(36);

rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });

for (const arquivo of ["app.js", "engine.js", "dados-iniciais.js", "manifest.webmanifest"]) copyFileSync(join(app, arquivo), join(destino, arquivo));
cpSync(join(app, "fontes"), join(destino, "fontes"), { recursive: true, filter: (f) => !f.endsWith(".txt") });
cpSync(join(app, "marca"), join(destino, "marca"), { recursive: true, filter: (f) => !f.endsWith("icone-1024.png") });
copyFileSync(join(app, "servidor/servidor.js"), join(destino, "servidor.js"));
copyFileSync(join(app, "servidor/api.php"), join(destino, "api.php"));

// Scripts com a versão no endereço: cada publicação pede os arquivos novos.
const comVersao = (nome) => `${nome}?v=${versao}`;
let pagina = readFileSync(join(app, "index.html"), "utf8");
const antes = pagina;
pagina = pagina
  .replace("<title>", '<meta name="robots" content="noindex" />\n<title>')
  .replace('<script src="engine.js" defer></script>', `<script src="${comVersao("engine.js")}" defer></script>`)
  .replace('<script src="dados-iniciais.js" defer></script>', `<script src="${comVersao("dados-iniciais.js")}" defer></script>`)
  .replace('<script src="app.js" defer></script>', `<script src="${comVersao("servidor.js")}" defer></script>\n<script src="${comVersao("app.js")}" defer></script>`);
if (pagina === antes || !pagina.includes("servidor.js")) throw new Error("index.html da escala mudou: não achei onde colocar servidor.js");
writeFileSync(join(destino, "index.html"), pagina);

const casca = [
  "index.html", comVersao("engine.js"), comVersao("dados-iniciais.js"), comVersao("servidor.js"), comVersao("app.js"),
  "manifest.webmanifest", "fontes/inter.woff2", "fontes/plus-jakarta-sans.woff2",
  "marca/marca.svg", "marca/favicon-32.png", "marca/icone-192.png", "marca/apple-touch-icon.png",
];
writeFileSync(join(destino, "sw.js"), readFileSync(join(app, "sw.js"), "utf8")
  .replace('"__VERSAO__"', JSON.stringify(versao))
  .replace("__ARQUIVOS__", JSON.stringify(casca)));

const semente = JSON.parse(readFileSync(join(app, "servidor/semente.json"), "utf8"));
writeFileSync(join(destino, "semente.php"), CABECA + JSON.stringify(semente));

writeFileSync(join(destino, ".htaccess"), [
  "# Escala do Louvor (subdomínio escalas e /escalas do site).",
  "DirectoryIndex index.html",
  "Options -Indexes",
  "AddType application/manifest+json .webmanifest",
  '<FilesMatch "\\.(lock|tmp|json)$">',
  "  Require all denied",
  "</FilesMatch>",
  "<IfModule mod_headers.c>",
  '  <FilesMatch "\\.(html|js|php|webmanifest)$">',
  '    Header set Cache-Control "no-cache"',
  "  </FilesMatch>",
  '  <FilesMatch "\\.(woff2|png|svg)$">',
  '    Header set Cache-Control "public, max-age=2592000"',
  "  </FilesMatch>",
  "</IfModule>",
  "",
].join("\n"));

console.log(`Escala montada em ${destino}/ (versão ${versao})`);
