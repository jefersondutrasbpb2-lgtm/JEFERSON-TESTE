// Monta a Escala do Louvor dentro do site (out/escalas/), depois do next build.
//
// A pasta vira o subdomínio escalas.igrejacongregacionalpombal.com.br (e o endereço /escalas do
// site). Vão juntos o app (web/escala-louvor), a ligação com o servidor (servidor.js), a API em
// PHP e os dados de partida (semente.php, usados só enquanto o servidor não tem dados).
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const app = "web/escala-louvor";
const destino = "out/escalas";
const CABECA = "<?php exit; ?>\n";

rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });

for (const arquivo of ["app.js", "engine.js", "dados-iniciais.js"]) copyFileSync(join(app, arquivo), join(destino, arquivo));
copyFileSync(join(app, "servidor/servidor.js"), join(destino, "servidor.js"));
copyFileSync(join(app, "servidor/api.php"), join(destino, "api.php"));
if (existsSync("out/icon.png")) copyFileSync("out/icon.png", join(destino, "icon.png"));

const versao = Date.now().toString(36);
let pagina = readFileSync(join(app, "index.html"), "utf8");
const antes = pagina;
pagina = pagina
  .replace("<title>", '<meta name="robots" content="noindex" />\n<link rel="icon" href="icon.png" />\n<title>')
  .replace('<script src="engine.js"></script>', `<script src="engine.js?v=${versao}"></script>`)
  .replace('<script src="dados-iniciais.js"></script>', `<script src="dados-iniciais.js?v=${versao}"></script>`)
  .replace('<script src="app.js"></script>', `<script src="servidor.js?v=${versao}"></script>\n<script src="app.js?v=${versao}"></script>`);
if (pagina === antes || !pagina.includes("servidor.js")) throw new Error("index.html da escala mudou: não achei onde colocar servidor.js");
writeFileSync(join(destino, "index.html"), pagina);

const semente = JSON.parse(readFileSync(join(app, "servidor/semente.json"), "utf8"));
writeFileSync(join(destino, "semente.php"), CABECA + JSON.stringify(semente));

writeFileSync(join(destino, ".htaccess"), [
  "# Escala do Louvor (subdomínio escalas e /escalas do site).",
  "DirectoryIndex index.html",
  "Options -Indexes",
  '<FilesMatch "\\.(lock|tmp|json)$">',
  "  Require all denied",
  "</FilesMatch>",
  "<IfModule mod_headers.c>",
  '  <FilesMatch "\\.(html|js|php)$">',
  '    Header set Cache-Control "no-cache"',
  "  </FilesMatch>",
  "</IfModule>",
  "",
].join("\n"));

console.log(`Escala montada em ${destino}/`);
