<?php
/**
 * Vídeos recentes e transmissão ao vivo do canal da IEC Pombal no YouTube.
 *
 * Usado pela seção "Assista aos cultos" da página inicial. Lê o feed RSS
 * público do canal (sem chave de API) e a página /live do canal, guarda o
 * resultado em cache por alguns minutos e devolve JSON:
 *
 *   { "ok": true, "live": {id,title,published} | null, "videos": [...], "fetchedAt": "..." }
 *
 * Se o YouTube não responder, devolve o último resultado guardado.
 */
declare(strict_types=1);

const CANAL_ID = 'UCY4CMIAu_8OxAHGlAsKuIJw';
const MAX_VIDEOS = 8;
const CACHE_VIDEOS = 900;   // 15 min
const CACHE_AO_VIVO = 180;  // 3 min
const TEMPO_LIMITE = 6;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=60');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

/** Pasta do cache: fora da pasta pública quando possível. */
function pastaCache(): ?string
{
    foreach ([dirname(__DIR__, 2) . '/site-cache', __DIR__ . '/_cache'] as $pasta) {
        if ((is_dir($pasta) || @mkdir($pasta, 0700, true)) && is_writable($pasta)) {
            if (str_starts_with($pasta, __DIR__) && !is_file("$pasta/.htaccess")) {
                file_put_contents("$pasta/.htaccess", "Require all denied\nDeny from all\n");
            }
            return $pasta;
        }
    }
    return null;
}

function baixar(string $url): ?string
{
    $cabecalhos = [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
        'Accept-Language: pt-BR,pt;q=0.9',
        'Cookie: SOCS=CAI; CONSENT=YES+',
    ];
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_TIMEOUT => TEMPO_LIMITE,
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_HTTPHEADER => $cabecalhos,
            CURLOPT_ENCODING => '',
        ]);
        $corpo = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
        return ($corpo !== false && $status === 200) ? (string) $corpo : null;
    }
    $ctx = stream_context_create(['http' => [
        'timeout' => TEMPO_LIMITE,
        'header' => implode("\r\n", $cabecalhos),
        'ignore_errors' => true,
    ]]);
    $corpo = @file_get_contents($url, false, $ctx);
    $status = 0;
    foreach ($http_response_header ?? [] as $linha) {
        if (preg_match('#^HTTP/\S+\s+(\d{3})#', $linha, $m)) $status = (int) $m[1];
    }
    return ($corpo !== false && $status === 200) ? $corpo : null;
}

/** Vídeos do feed RSS, sem as transmissões só agendadas (0 visualizações). */
function lerFeed(): ?array
{
    $xml = baixar('https://www.youtube.com/feeds/videos.xml?channel_id=' . CANAL_ID);
    if ($xml === null) return null;
    $videos = [];
    if (!preg_match_all('#<entry>(.*?)</entry>#s', $xml, $entradas)) return null;
    foreach ($entradas[1] as $e) {
        if (!preg_match('#<yt:videoId>([\w-]{11})</yt:videoId>#', $e, $id)) continue;
        if (preg_match('#<media:statistics views="(\d+)"#', $e, $v) && $v[1] === '0') continue;
        preg_match('#<title>(.*?)</title>#s', $e, $titulo);
        preg_match('#<published>(.*?)</published>#', $e, $data);
        $videos[] = [
            'id' => $id[1],
            'title' => html_entity_decode(trim($titulo[1] ?? ''), ENT_QUOTES | ENT_XML1, 'UTF-8'),
            'published' => trim($data[1] ?? ''),
        ];
        if (count($videos) >= MAX_VIDEOS) break;
    }
    return $videos ?: null;
}

/**
 * Transmissão em andamento: a página /live do canal só mostra um vídeo
 * marcado como "isLive" enquanto a transmissão está no ar.
 * Devolve o vídeo, null (nada no ar) ou false (não foi possível verificar).
 */
function lerAoVivo(): array|null|false
{
    $html = baixar('https://www.youtube.com/channel/' . CANAL_ID . '/live');
    if ($html === null) return false;
    if (!preg_match('#"videoViewCountRenderer":\{.{0,600}?"isLive":true#s', $html)) return null;
    if (!preg_match('#"currentVideoEndpoint":\{.{0,800}?"videoId":"([\w-]{11})"#s', $html, $id)) return null;
    $titulo = '';
    if (preg_match('#"videoPrimaryInfoRenderer":\{"title":\{"runs":\[\{"text":"((?:[^"\\\\]|\\\\.)*)"#', $html, $t)) {
        $titulo = (string) json_decode('"' . $t[1] . '"');
    }
    return ['id' => $id[1], 'title' => $titulo, 'published' => gmdate('c')];
}

$pasta = pastaCache();
$arquivo = $pasta ? "$pasta/youtube.json" : null;
$cache = ($arquivo && is_file($arquivo)) ? json_decode((string) file_get_contents($arquivo), true) : null;
if (!is_array($cache)) $cache = ['videos' => [], 'live' => null, 'videosEm' => 0, 'aoVivoEm' => 0];

$agora = time();
$mudou = false;

if ($agora - (int) ($cache['videosEm'] ?? 0) >= CACHE_VIDEOS) {
    $videos = lerFeed();
    // Mesmo se falhar, espera o intervalo antes de tentar de novo.
    $cache['videosEm'] = $videos === null ? $agora - CACHE_VIDEOS + 120 : $agora;
    if ($videos !== null) {
        $cache['videos'] = $videos;
        $cache['fetchedAt'] = gmdate('c');
    }
    $mudou = true;
}

if ($agora - (int) ($cache['aoVivoEm'] ?? 0) >= CACHE_AO_VIVO) {
    $live = lerAoVivo();
    if ($live !== false) {
        $cache['live'] = $live;
        $cache['aoVivoEm'] = $agora;
    } else {
        $cache['aoVivoEm'] = $agora - CACHE_AO_VIVO + 60;
    }
    $mudou = true;
}

if ($mudou && $arquivo) {
    file_put_contents($arquivo, json_encode($cache, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

echo json_encode([
    'ok' => !empty($cache['videos']) || !empty($cache['live']),
    'channelId' => CANAL_ID,
    'fetchedAt' => $cache['fetchedAt'] ?? null,
    'live' => $cache['live'] ?? null,
    'videos' => $cache['videos'] ?? [],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
