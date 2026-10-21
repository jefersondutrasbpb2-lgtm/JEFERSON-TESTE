/**
 * Baixa as publicações mais recentes dos perfis do Instagram configurados
 * em src/content/instagram.ts e as grava como conteúdo estático do site.
 *
 * Fontes aceitas (uma por feed, via variável de ambiente):
 *   IG_FEED_<ID>   URL de um feed JSON (ex.: https://feeds.behold.so/XXXX).
 *                  Também aceita "file:caminho.json" para testes.
 *   IG_TOKEN_<ID>  Token de acesso da API do Instagram (Instagram Login).
 *
 * Sem variável configurada ou se a busca falhar, o conteúdo anterior é
 * mantido e o build continua normalmente.
 *
 * Uso: npm run instagram   (também roda antes de npm run build)
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_POSTS = 10;
const FEEDS = [
  { id: "bom-samaritano", handle: "obom.samaritano", feedEnv: "IG_FEED_BOM_SAMARITANO", tokenEnv: "IG_TOKEN_BOM_SAMARITANO" },
];

const readJson = async (url) => {
  if (url.startsWith("file:")) return JSON.parse(readFileSync(url.slice(5), "utf8"));
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao ler ${url.split("?")[0]}`);
  return res.json();
};

/** Normaliza o formato do Behold e o da API do Instagram para um só. */
function normalize(json) {
  const list = Array.isArray(json) ? json : json.posts ?? json.data ?? [];
  return list
    .map((p) => {
      const type = p.mediaType ?? p.media_type ?? "IMAGE";
      const image =
        p.sizes?.medium?.mediaUrl ??
        (type === "VIDEO" ? p.thumbnailUrl ?? p.thumbnail_url : null) ??
        p.mediaUrl ??
        p.media_url;
      return {
        id: String(p.id),
        remote: image,
        caption: (p.prunedCaption ?? p.caption ?? "").trim(),
        permalink: p.permalink,
        timestamp: p.timestamp,
        type,
      };
    })
    .filter((p) => p.remote && p.permalink)
    .slice(0, MAX_POSTS);
}

async function download(url, dest) {
  if (url.startsWith("file:")) {
    writeFileSync(dest, readFileSync(url.slice(5)));
    return;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ao baixar imagem`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

for (const feed of FEEDS) {
  const feedUrl = process.env[feed.feedEnv];
  const token = process.env[feed.tokenEnv];
  const source =
    feedUrl ||
    (token &&
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${MAX_POSTS}&access_token=${token}`);

  if (!source) {
    console.log(`[instagram] ${feed.handle}: nenhuma fonte configurada (${feed.feedEnv} ou ${feed.tokenEnv}); mantendo o conteúdo atual.`);
    continue;
  }

  try {
    const posts = normalize(await readJson(source));
    if (!posts.length) throw new Error("o feed não retornou publicações com imagem");

    const dir = join("public", "instagram", feed.id);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });

    const saved = [];
    for (const p of posts) {
      const file = `${p.id.replace(/[^\w-]/g, "")}.jpg`;
      try {
        await download(p.remote, join(dir, file));
        saved.push({ id: p.id, image: `/instagram/${feed.id}/${file}`, caption: p.caption, permalink: p.permalink, timestamp: p.timestamp, type: p.type });
      } catch (e) {
        console.warn(`[instagram] ${feed.handle}: imagem ${p.id} ignorada (${e.message})`);
      }
    }
    if (!saved.length) throw new Error("nenhuma imagem pôde ser baixada");

    const out = { id: feed.id, handle: feed.handle, updatedAt: new Date().toISOString(), posts: saved };
    writeFileSync(join("src", "content", "instagram", `${feed.id}.json`), JSON.stringify(out, null, 2) + "\n");
    console.log(`[instagram] ${feed.handle}: ${saved.length} publicações atualizadas.`);
  } catch (e) {
    const jsonPath = join("src", "content", "instagram", `${feed.id}.json`);
    console.warn(`[instagram] ${feed.handle}: não foi possível atualizar (${e.message}); mantendo ${existsSync(jsonPath) ? "o conteúdo anterior" : "o carrossel com fotos do projeto"}.`);
  }
}
