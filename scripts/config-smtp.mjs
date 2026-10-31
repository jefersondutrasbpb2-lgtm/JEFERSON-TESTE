// Grava out/api/config.php com a senha da caixa site@ (secret SMTP_SENHA do GitHub), para os
// formulários enviarem pelo SMTP da Hostinger. Roda só na publicação; a senha não fica no
// repositório. Acessar config.php pelo navegador não mostra nada: o PHP só devolve os dados.
import { existsSync, writeFileSync } from "node:fs";

const senha = process.env.SMTP_SENHA || "";
const usuario = process.env.SMTP_USUARIO || "site@igrejacongregacionalpombal.com.br";

if (!senha) {
  console.log("SMTP_SENHA não configurado: os formulários usam a função mail() do PHP.");
  process.exit(0);
}
if (!existsSync("out/api")) throw new Error("out/api não existe: rode o build antes.");

const php = (v) => `'${v.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
writeFileSync("out/api/config.php", `<?php\nreturn ['usuario' => ${php(usuario)}, 'senha' => ${php(senha)}];\n`, { mode: 0o600 });
console.log(`Envio dos formulários configurado pela caixa ${usuario}.`);
