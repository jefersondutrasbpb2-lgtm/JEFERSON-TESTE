<?php
// Recebe os formulários do site (Contato e Pedido de oração) e envia por e-mail à secretaria.
//
//   POST /api/formulario.php   corpo JSON: { tipo: "contato" | "oracao", idioma, ...campos }
//   GET  /api/formulario.php   verificação: informa se o envio de e-mail está disponível
//
// Nada é guardado no servidor: a mensagem segue só por e-mail. Para limitar abusos, guarda-se
// apenas um resumo (hash) do IP com o horário dos envios recentes, fora da pasta pública quando dá.

declare(strict_types=1);

// Quem recebe as mensagens e quem aparece como remetente. O remetente precisa ser um endereço do
// próprio domínio para o e-mail não ser recusado; a resposta vai direto ao visitante (Reply-To).
const DESTINO = 'sec.iec.2017@gmail.com';
const REMETENTE = 'site@igrejacongregacionalpombal.com.br';
const NOME_REMETENTE = 'Site IEC Pombal';
const DOMINIOS = ['igrejacongregacionalpombal.com.br', 'www.igrejacongregacionalpombal.com.br'];

const LIMITE_CORPO = 20_000;
const ENVIOS_POR_JANELA = 5;
const JANELA_SEGUNDOS = 600;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');

function responder(int $status, array $corpo): never
{
    http_response_code($status);
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    responder(200, ['ok' => true, 'email' => function_exists('mail')]);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, ['ok' => false, 'erro' => 'metodo']);
}

// Só aceita envios feitos a partir do próprio site.
$origem = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
$host = strtolower((string) parse_url($origem, PHP_URL_HOST));
if (!in_array($host, DOMINIOS, true)) {
    responder(403, ['ok' => false, 'erro' => 'origem']);
}

$bruto = (string) file_get_contents('php://input', false, null, 0, LIMITE_CORPO + 1);
if (strlen($bruto) > LIMITE_CORPO) responder(413, ['ok' => false, 'erro' => 'grande_demais']);
$dados = json_decode($bruto, true);
if (!is_array($dados)) responder(400, ['ok' => false, 'erro' => 'formato']);

/** Texto de um campo, sem espaços nas pontas e com tamanho máximo. */
function campo(array $d, string $nome, int $max = 200): string
{
    $v = $d[$nome] ?? '';
    if (!is_string($v)) return '';
    $v = trim(str_replace("\r\n", "\n", $v));
    return mb_substr($v, 0, $max);
}

/** Para usar em cabeçalhos de e-mail: uma linha só, sem quebras (evita injeção de cabeçalhos). */
function linha(string $v): string
{
    return trim(preg_replace('/[\r\n\t]+/', ' ', $v) ?? '');
}

// Campo-armadilha: preenchido por robôs, invisível para pessoas. Finge sucesso.
if (campo($dados, 'website') !== '') responder(200, ['ok' => true]);

$tipo = campo($dados, 'tipo', 20);
if (!in_array($tipo, ['contato', 'oracao'], true)) responder(400, ['ok' => false, 'erro' => 'tipo']);
if (campo($dados, 'consentimento', 10) !== 'sim') responder(422, ['ok' => false, 'erro' => 'consentimento']);

$idiomas = ['pt' => 'Português', 'en' => 'Inglês', 'es' => 'Espanhol'];
$idioma = $idiomas[campo($dados, 'idioma', 5)] ?? 'Português';

/** Pasta para o controle de envios: fora da pasta pública quando possível. */
function pastaDados(): ?string
{
    foreach ([dirname(__DIR__, 2) . '/formularios-dados', __DIR__ . '/_dados'] as $pasta) {
        if ((is_dir($pasta) || @mkdir($pasta, 0700, true)) && is_writable($pasta)) {
            if (str_starts_with($pasta, __DIR__) && !is_file("$pasta/.htaccess")) {
                file_put_contents("$pasta/.htaccess", "Require all denied\nDeny from all\n");
            }
            return $pasta;
        }
    }
    return null;
}

/** No máximo ENVIOS_POR_JANELA envios por IP a cada JANELA_SEGUNDOS. */
function dentroDoLimite(): bool
{
    $pasta = pastaDados();
    if ($pasta === null) return true;
    $arquivo = "$pasta/limites.json";
    $chave = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|iec-pombal');
    $agora = time();
    $f = fopen($arquivo, 'c+');
    if ($f === false) return true;
    flock($f, LOCK_EX);
    $lista = json_decode((string) stream_get_contents($f), true);
    $lista = is_array($lista) ? $lista : [];
    foreach ($lista as $k => $horarios) {
        $lista[$k] = array_values(array_filter((array) $horarios, fn ($t) => $t > $agora - JANELA_SEGUNDOS));
        if (!$lista[$k]) unset($lista[$k]);
    }
    $permitido = count($lista[$chave] ?? []) < ENVIOS_POR_JANELA;
    if ($permitido) $lista[$chave][] = $agora;
    ftruncate($f, 0);
    rewind($f);
    fwrite($f, json_encode($lista));
    flock($f, LOCK_UN);
    fclose($f);
    return $permitido;
}

// Monta a mensagem conforme o formulário.
$replyTo = '';
if ($tipo === 'contato') {
    $nome = campo($dados, 'nome', 120);
    $email = campo($dados, 'email', 160);
    $telefone = campo($dados, 'telefone', 60);
    $assunto = campo($dados, 'assunto', 120);
    $mensagem = campo($dados, 'mensagem', 6000);
    if (mb_strlen($nome) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($mensagem) < 10) {
        responder(422, ['ok' => false, 'erro' => 'campos']);
    }
    $replyTo = $email;
    $titulo = 'Contato pelo site — ' . ($assunto !== '' ? $assunto : 'mensagem');
    $corpo = "Nova mensagem enviada pelo formulário de Contato do site.\n\n"
        . "Nome: $nome\n"
        . "E-mail: $email\n"
        . ($telefone !== '' ? "Telefone / WhatsApp: $telefone\n" : '')
        . ($assunto !== '' ? "Assunto: $assunto\n" : '')
        . "Idioma da página: $idioma\n\n"
        . "Mensagem:\n$mensagem\n";
} else {
    $pedido = campo($dados, 'pedido', 6000);
    $nome = campo($dados, 'nome-oracao', 120);
    $contato = campo($dados, 'contato', 160);
    $retorno = campo($dados, 'retorno', 10) === 'sim';
    if (mb_strlen($pedido) < 5 || ($retorno && $contato === '')) {
        responder(422, ['ok' => false, 'erro' => 'campos']);
    }
    if (filter_var($contato, FILTER_VALIDATE_EMAIL)) $replyTo = $contato;
    $titulo = 'Pedido de oração (confidencial)';
    $corpo = "Novo pedido de oração enviado pelo site. Trate com confidencialidade.\n\n"
        . 'Nome: ' . ($nome !== '' ? $nome : '(anônimo)') . "\n"
        . 'Deseja retorno: ' . ($retorno ? 'sim' : 'não') . "\n"
        . ($contato !== '' ? "Telefone ou e-mail: $contato\n" : '')
        . "Idioma da página: $idioma\n\n"
        . "Pedido:\n$pedido\n";
}

if (!dentroDoLimite()) responder(429, ['ok' => false, 'erro' => 'muitos_envios']);

date_default_timezone_set('America/Fortaleza');
$corpo .= "\n—\nEnviado em " . date('d/m/Y \à\s H:i') . " pelo site igrejacongregacionalpombal.com.br.\n"
    . "A pessoa concordou com o uso dos dados apenas para esta finalidade (LGPD).\n";

$cabecalhos = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: =?UTF-8?B?' . base64_encode(NOME_REMETENTE) . '?= <' . REMETENTE . '>',
];
if ($replyTo !== '') $cabecalhos[] = 'Reply-To: ' . linha($replyTo);

$enviado = function_exists('mail') && @mail(
    DESTINO,
    '=?UTF-8?B?' . base64_encode(linha('[Site] ' . $titulo)) . '?=',
    $corpo,
    implode("\r\n", $cabecalhos),
    '-f' . REMETENTE
);

if (!$enviado) responder(502, ['ok' => false, 'erro' => 'envio']);
responder(200, ['ok' => true]);
