/**
 * Baixa a lista dos vídeos mais recentes do canal da igreja no YouTube
 * (feed RSS público, sem chave de API) e grava em src/content/youtube.json.
 *
 * Esse arquivo é a lista que já vem no HTML do site. No ar, a seção
 * "Assista aos cultos" ainda consulta /api/youtube.php, que traz os vídeos
 * novos e avisa quando há transmissão ao vivo, sem precisar republicar.
 *
 * Se a busca falhar, a lista anterior é mantida e o build continua.
 *
 * Uso: npm run youtube   (também roda antes de npm run build)
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const CHANNEL_ID = "UCY4CMIAu_8OxAHGlAsKuIJw";
const OUT = "src/content/youtube.json";
const MAX = 8;

const decode = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&");

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1].trim()) : "";
};

export function parseFeed(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map(([, e]) => {
      const views = e.match(/<media:statistics views="(\d+)"/);
      return {
        id: tag(e, "yt:videoId"),
        title: tag(e, "title"),
        published: tag(e, "published"),
        // Transmissões só agendadas entram no feed antes de acontecer, com 0 visualizações.
        views: views ? Number(views[1]) : null,
      };
    })
    .filter((v) => /^[\w-]{11}$/.test(v.id) && v.views !== 0)
    .slice(0, MAX)
    .map(({ id, title, published }) => ({ id, title, published }));
}

async function main() {
  const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : null;
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const videos = parseFeed(await res.text());
    if (!videos.length) throw new Error("feed sem vídeos");
    const data = { channelId: CHANNEL_ID, fetchedAt: new Date().toISOString(), live: null, videos };
    if (JSON.stringify(previous?.videos) === JSON.stringify(videos)) {
      console.log(`YouTube: ${videos.length} vídeos, sem novidades.`);
      return;
    }
    writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
    console.log(`YouTube: ${videos.length} vídeos gravados em ${OUT}.`);
  } catch (err) {
    console.warn(`YouTube: não foi possível atualizar a lista (${err.message}); mantendo a anterior.`);
    if (!previous) {
      writeFileSync(OUT, JSON.stringify({ channelId: CHANNEL_ID, fetchedAt: null, live: null, videos: [] }, null, 2) + "\n");
    }
  }
}

main();
