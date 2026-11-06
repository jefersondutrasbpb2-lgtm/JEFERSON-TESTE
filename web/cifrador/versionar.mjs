// Coloca a versão (hash do conteúdo) nos endereços de estilo.css, app.js, biblioteca.js e importar.js.
// Rode antes de publicar:  node web/cifrador/versionar.mjs
// Assim cada publicação tem endereços novos e nenhum cache (navegador ou CDN da Hostinger)
// consegue entregar um arquivo antigo junto com os novos.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const pasta = dirname(fileURLToPath(import.meta.url));
const ler = (f) => readFileSync(join(pasta, f), "utf8");
const hash = (txt) => createHash("sha256").update(txt).digest("hex").slice(0, 10);
const trocar = (txt, nome, v) => txt.replace(new RegExp(nome.replace(".", "\\.") + "(\\?v=[\\w-]*)?", "g"), `${nome}?v=${v}`);

// biblioteca.js e importar.js primeiro: a versão deles entra no app.js, e a do app.js no index.html.
let app = ler("assets/app.js");
app = trocar(app, "biblioteca.js", hash(ler("assets/biblioteca.js")));
app = trocar(app, "importar.js", hash(ler("assets/importar.js")));
writeFileSync(join(pasta, "assets/app.js"), app);

let pagina = ler("index.html");
pagina = trocar(pagina, "app.js", hash(app));
pagina = trocar(pagina, "estilo.css", hash(ler("assets/estilo.css")));
writeFileSync(join(pasta, "index.html"), pagina);
console.log("Versões atualizadas em index.html e assets/app.js");
