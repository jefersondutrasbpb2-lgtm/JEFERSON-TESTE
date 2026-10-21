<?php
// API da Escala do Louvor no servidor da igreja.
//
//   GET  api.php?acao=tudo        dados, escalas, respostas e se quem pede é o coordenador
//   GET  api.php?acao=respostas   só as respostas de disponibilidade
//   POST api.php?acao=gravar      {colecao, id, dados}  coordenador (ou a própria resposta de alguém da equipe)
//   POST api.php?acao=apagar      {colecao, id}         coordenador
//   POST api.php?acao=entrar      {senha}               abre a sessão do coordenador
//   POST api.php?acao=sair
//
// Os dados ficam num arquivo fora da pasta pública quando dá (domains/<domínio>/escala-dados/);
// se não der, em _dados/ ao lado, protegido. O arquivo começa com um trecho PHP que encerra a
// execução, para nunca ser entregue como texto. A senha vem de config.php, gerado na publicação.

declare(strict_types=1);

const COLECOES = ['dados', 'escalas', 'respostas'];
const SECOES = ['config', 'pessoas', 'musicas', 'cultos'];
const CABECA = "<?php exit; ?>\n";
const LIMITE = 2_000_000;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function responder(int $status, array $corpo): never
{
    http_response_code($status);
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function pastaDados(): string
{
    foreach ([dirname(__DIR__, 2) . '/escala-dados', __DIR__ . '/_dados'] as $pasta) {
        if (is_dir($pasta) || @mkdir($pasta, 0700, true)) {
            if (is_writable($pasta)) {
                if (str_starts_with($pasta, __DIR__) && !is_file("$pasta/.htaccess")) {
                    file_put_contents("$pasta/.htaccess", "Require all denied\nDeny from all\n");
                }
                return $pasta;
            }
        }
    }
    responder(500, ['erro' => 'sem_pasta', 'mensagem' => 'Não há onde guardar os dados no servidor.']);
}

function lerArquivo(string $arquivo): ?array
{
    if (!is_file($arquivo)) return null;
    $texto = (string) file_get_contents($arquivo);
    if (str_starts_with($texto, CABECA)) $texto = substr($texto, strlen(CABECA));
    $dados = json_decode($texto, true);
    return is_array($dados) ? $dados : null;
}

function vazio(): array
{
    return ['dados' => new stdClass(), 'escalas' => new stdClass(), 'respostas' => new stdClass()];
}

/** Lê o banco; com $mudar, altera e grava sob trava exclusiva. */
function banco(?callable $mudar = null): array
{
    $arquivo = pastaDados() . '/banco.php';
    $trava = fopen($arquivo . '.lock', 'c');
    flock($trava, $mudar ? LOCK_EX : LOCK_SH);
    try {
        $banco = lerArquivo($arquivo) ?? lerArquivo(__DIR__ . '/semente.php') ?? json_decode(json_encode(vazio()), true);
        foreach (COLECOES as $c) $banco[$c] = $banco[$c] ?? [];
        if ($mudar) {
            $banco = $mudar($banco);
            $json = json_encode($banco, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $temporario = $arquivo . '.tmp';
            file_put_contents($temporario, CABECA . $json);
            rename($temporario, $arquivo);
        }
        return $banco;
    } finally {
        flock($trava, LOCK_UN);
        fclose($trava);
    }
}

function paraObjeto(array $banco): array
{
    foreach (COLECOES as $c) if (!$banco[$c]) $banco[$c] = new stdClass();
    return $banco;
}

function configuracao(): array
{
    $arquivo = __DIR__ . '/config.php';
    $config = is_file($arquivo) ? include $arquivo : [];
    return is_array($config) ? $config : [];
}

function iniciarSessao(): void
{
    session_name('escala');
    session_set_cookie_params(['lifetime' => 60 * 60 * 24 * 30, 'path' => '/', 'secure' => !empty($_SERVER['HTTPS']), 'httponly' => true, 'samesite' => 'Lax']);
    ini_set('session.gc_maxlifetime', (string) (60 * 60 * 24 * 30));
    session_start();
}

function coordena(): bool
{
    return !empty($_SESSION['coordena']);
}

function corpo(): array
{
    $texto = file_get_contents('php://input', false, null, 0, LIMITE + 1);
    if ($texto === false || strlen($texto) > LIMITE) responder(413, ['erro' => 'invalid_argument', 'mensagem' => 'Dados grandes demais.']);
    $dados = json_decode($texto, true);
    if (!is_array($dados)) responder(400, ['erro' => 'invalid_argument', 'mensagem' => 'Pedido inválido.']);
    return $dados;
}

function validarId(string $colecao, mixed $id): string
{
    if (!in_array($colecao, COLECOES, true)) responder(400, ['erro' => 'invalid_argument', 'mensagem' => 'Coleção desconhecida.']);
    if (!is_string($id) || !preg_match('/^[A-Za-z0-9_.-]{1,120}$/', $id)) responder(400, ['erro' => 'invalid_argument', 'mensagem' => 'Identificador inválido.']);
    if ($colecao === 'dados' && !in_array($id, array_merge(SECOES, ['liturgias', 'oficiais']), true)) responder(400, ['erro' => 'invalid_argument', 'mensagem' => 'Seção desconhecida.']);
    return $id;
}

/** Resposta de disponibilidade enviada por alguém da equipe (sem sessão de coordenador). */
function validarResposta(array $banco, string $id, mixed $r): array
{
    $pessoas = $banco['dados']['pessoas']['itens'] ?? [];
    $ok = is_array($r)
        && preg_match('/^([A-Za-z0-9_-]+)__(\d{4}-\d{2}-\d{2})$/', $id, $m)
        && ($r['id'] ?? null) === $id
        && ($r['pessoaId'] ?? null) === $m[1]
        && ($r['inicio'] ?? null) === $m[2]
        && is_string($r['fim'] ?? null) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $r['fim'])
        && is_array($r['dias'] ?? null) && count($r['dias']) <= 62
        && is_string($r['obs'] ?? '') && mb_strlen($r['obs'] ?? '') <= 500
        && in_array($m[1], array_column($pessoas, 'id'), true);
    if ($ok) foreach ($r['dias'] as $d) if (!is_string($d) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)) $ok = false;
    if (!$ok) responder(400, ['erro' => 'invalid_argument', 'mensagem' => 'Resposta inválida.']);
    return [
        'id' => $id, 'pessoaId' => $r['pessoaId'], 'inicio' => $r['inicio'], 'fim' => $r['fim'],
        'dias' => array_values($r['dias']), 'obs' => (string) ($r['obs'] ?? ''), 'em' => gmdate('Y-m-d\TH:i:s.v\Z'),
    ];
}

/** Limita tentativas de senha: 8 erros em 15 minutos bloqueiam aquele endereço por um tempo. */
function tentativas(bool $errou): bool
{
    $arquivo = pastaDados() . '/tentativas.php';
    $lista = lerArquivo($arquivo) ?? [];
    $ip = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');
    $agora = time();
    $recentes = array_values(array_filter($lista[$ip] ?? [], fn ($t) => $t > $agora - 900));
    if ($errou) {
        $recentes[] = $agora;
        $lista[$ip] = $recentes;
        file_put_contents($arquivo, CABECA . json_encode($lista), LOCK_EX);
    }
    return count($recentes) < 8;
}

iniciarSessao();
$acao = $_GET['acao'] ?? '';
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'GET' && $acao === 'tudo') {
    $banco = banco();
    session_write_close();
    responder(200, paraObjeto($banco) + ['coordena' => coordena(), 'senhaDefinida' => !empty(configuracao()['senha_hash'])]);
}
if ($metodo === 'GET' && $acao === 'respostas') {
    $banco = banco();
    session_write_close();
    responder(200, ['respostas' => paraObjeto($banco)['respostas']]);
}
if ($metodo !== 'POST') responder(405, ['erro' => 'metodo', 'mensagem' => 'Use POST.']);

// Pedidos que gravam só vêm da própria página.
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
$semPorta = fn (string $host) => strtolower(preg_replace('/:\d+$/', '', $host));
if ($origem !== '' && $semPorta((string) parse_url($origem, PHP_URL_HOST)) !== $semPorta($_SERVER['HTTP_HOST'] ?? '')) responder(403, ['erro' => 'revoked', 'mensagem' => 'Origem não permitida.']);

$pedido = corpo();

if ($acao === 'entrar') {
    $hash = configuracao()['senha_hash'] ?? '';
    if ($hash === '') responder(503, ['erro' => 'sem_senha', 'mensagem' => 'A senha do coordenador ainda não foi configurada.']);
    if (!tentativas(false)) responder(429, ['erro' => 'muitas', 'mensagem' => 'Muitas tentativas. Espere alguns minutos.']);
    if (!password_verify((string) ($pedido['senha'] ?? ''), $hash)) {
        tentativas(true);
        sleep(1);
        responder(401, ['erro' => 'senha', 'mensagem' => 'Senha incorreta.']);
    }
    session_regenerate_id(true);
    $_SESSION['coordena'] = true;
    responder(200, ['coordena' => true]);
}
if ($acao === 'sair') {
    $_SESSION = [];
    session_destroy();
    responder(200, ['coordena' => false]);
}

if ($acao === 'gravar' || $acao === 'apagar') {
    $colecao = (string) ($pedido['colecao'] ?? '');
    $id = validarId($colecao, $pedido['id'] ?? null);
    $chefe = coordena();
    session_write_close();
    if (!$chefe && !($acao === 'gravar' && $colecao === 'respostas')) responder(401, ['erro' => 'revoked', 'mensagem' => 'Entre como coordenador para alterar a escala.']);
    banco(function (array $banco) use ($acao, $colecao, $id, $pedido, $chefe) {
        if ($acao === 'apagar') {
            unset($banco[$colecao][$id]);
            return $banco;
        }
        $dados = $pedido['dados'] ?? null;
        if (!is_array($dados)) responder(400, ['erro' => 'invalid_argument', 'mensagem' => 'Dados inválidos.']);
        $banco[$colecao][$id] = $chefe ? $dados : validarResposta($banco, $id, $dados);
        return $banco;
    });
    responder(200, ['ok' => true]);
}

responder(400, ['erro' => 'acao', 'mensagem' => 'Ação desconhecida.']);
