// Ajuda a publicação na Hostinger (usado pelo workflow publicar-hostinger.yml).
//
//   node scripts/hostinger-ftp.mjs pasta     escolhe a pasta do site e grava "pasta=..." em $GITHUB_OUTPUT
//   node scripts/hostinger-ftp.mjs limpar    apaga o default.php ("Página padrão") da pasta do site
//
// Usa do ambiente: FTP_SERVER, FTP_PORTA (padrão 21), FTP_USERNAME, FTP_PASSWORD, FTP_PROTOCOLO,
// FTP_PASTA, DOMINIO e PASTA.
// O certificado é tratado como na etapa de envio (FTP-Deploy-Action, modo "loose"), porque a Hostinger
// entrega o FTP por IP e o certificado é de outro nome.
import { appendFileSync } from "node:fs";
import { Client } from "basic-ftp";

const env = process.env;
const modo = process.argv[2];

const cliente = new Client(30000);
try {
  await cliente.access({
    host: env.FTP_SERVER,
    port: Number(env.FTP_PORTA) || 21,
    user: env.FTP_USERNAME,
    password: env.FTP_PASSWORD,
    secure: (env.FTP_PROTOCOLO || "ftps") === "ftps",
    secureOptions: { rejectUnauthorized: false },
  });
  const nomes = async (caminho) => (await cliente.list(caminho)).map((item) => item.name);

  if (modo === "pasta") {
    console.log("Pastas na raiz da conta FTP:", (await nomes("/")).join(", "));
    let pasta = env.FTP_PASTA;
    if (!pasta) {
      // A Hostinger guarda cada site em domains/<domínio>/public_html.
      const listar = async (caminho) => {
        try {
          const lista = await nomes(caminho);
          console.log(`${caminho}:`, lista.join(", ") || "(vazia)");
          return lista;
        } catch (erro) {
          console.log(`${caminho}: não deu para listar (${erro.message})`);
          return [];
        }
      };
      const sites = [];
      for (const nome of await listar("domains/")) {
        if (nome.startsWith(".")) continue;
        if ((await listar(`domains/${nome}/`)).includes("public_html")) sites.push(nome);
      }
      console.log("Sites em domains/:", sites.join(", ") || "(nenhum)");
      const dominio = env.DOMINIO.replace(/^www\./, "");
      const site =
        sites.find((nome) => nome.replace(/^www\./, "") === dominio) ??
        sites.find((nome) => nome.includes(dominio.split(".")[0])) ??
        (sites.length === 1 ? sites[0] : undefined);
      pasta = site ? `domains/${site}/public_html/` : "public_html/";
    }
    console.log(`Pasta do site: ${pasta}`);
    console.log("Conteúdo atual:", (await nomes(pasta).catch(() => [])).join(", ") || "(vazia)");
    appendFileSync(env.GITHUB_OUTPUT, `pasta=${pasta}\n`);
  } else if (modo === "limpar") {
    if ((await nomes(env.PASTA)).includes("default.php")) {
      await cliente.remove(`${env.PASTA}default.php`);
      console.log("default.php removido.");
    } else {
      console.log("Não há default.php.");
    }
  } else {
    throw new Error(`Modo desconhecido: ${modo}`);
  }
} finally {
  cliente.close();
}
