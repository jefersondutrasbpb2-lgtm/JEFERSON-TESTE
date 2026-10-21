<?php
// API da Escala do Louvor no servidor da igreja. O app é aberto: quem tem o link vê e edita tudo.
//
//   GET  api.php?acao=tudo        dados, escalas e respostas
//   GET  api.php?acao=respostas   só as respostas de disponibilidade
//   POST api.php?acao=gravar      {colecao, id, dados}
//   POST api.php?acao=apagar      {colecao, id}
//
// Os dados ficam num arquivo fora da pasta pública quando dá (domains/<domínio>/escala-dados/);
// se não der, em _dados/ ao lado, protegido. O arquivo começa com um trecho PHP que encerra a
// execução, para nunca ser entregue como texto. A cada dia com alteração fica uma cópia do banco
// como estava antes (backup-AAAA-MM-DD.php); as dos últimos 60 dias são mantidas.

declare(strict_types=1);

const COLECOES = ['dados', 'escalas', 'respostas'];
const SECOES = ['config', 'pessoas', 'musicas', 'cultos'];
const CABECA = "<?php exit; ?>\n";
const LIMITE = 2_000_000;
const DIAS_DE_BACKUP = 60;

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

/** Guarda, uma vez por dia, o banco como estava antes da primeira alteração do dia. */
function backupDoDia(string $pasta, string $arquivo): void
{
    $copia = "$pasta/backup-" . date('Y-m-d') . '.php';
    if (is_file($copia) || !is_file($arquivo)) return;
    copy($arquivo, $copia);
    foreach (glob("$pasta/backup-*.php") ?: [] as $antiga) {
        if (filemtime($antiga) < time() - DIAS_DE_BACKUP * 86400) unlink($antiga);
    }
}

/** Lê o banco; com $mudar, altera e grava sob trava exclusiva. */
function banco(?callable $mudar = null): array
{
    $pasta = pastaDados();
    $arquivo = "$pasta/banco.php";
    $trava = fopen($arquivo . '.lock', 'c');
    flock($trava, $mudar ? LOCK_EX : LOCK_SH);
    try {
        $banco = lerArquivo($arquivo) ?? lerArquivo(__DIR__ . '/semente.php') ?? [];
        foreach (COLECOES as $c) $banco[$c] = $banco[$c] ?? [];
        if ($mudar) {
            backupDoDia($pasta, $arquivo);
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

$acao = $_GET['acao'] ?? '';
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'GET' && $acao === 'tudo') responder(200, paraObjeto(banco()));
if ($metodo === 'GET' && $acao === 'respostas') responder(200, ['respostas' => paraObjeto(banco())['respostas']]);
if ($metodo !== 'POST') responder(405, ['erro' => 'metodo', 'mensagem' => 'Use POST.']);

// Pedidos que gravam só vêm da própria página.
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
$semPorta = fn (string $host) => strtolower(preg_replace('/:\d+$/', '', $host));
if ($origem !== '' && $semPorta((string) parse_url($origem, PHP_URL_HOST)) !== $semPorta($_SERVER['HTTP_HOST'] ?? '')) responder(403, ['erro' => 'origem', 'mensagem' => 'Origem não permitida.']);

$pedido = corpo();

if ($acao === 'gravar' || $acao === 'apagar') {
    $colecao = (string) ($pedido['colecao'] ?? '');
    $id = validarId($colecao, $pedido['id'] ?? null);
    banco(function (array $banco) use ($acao, $colecao, $id, $pedido) {
        if ($acao === 'apagar') {
            unset($banco[$colecao][$id]);
            return $banco;
        }
        $dados = $pedido['dados'] ?? null;
        if (!is_array($dados)) responder(400, ['erro' => 'invalid_argument', 'mensagem' => 'Dados inválidos.']);
        $banco[$colecao][$id] = $dados;
        return $banco;
    });
    responder(200, ['ok' => true]);
}

responder(400, ['erro' => 'acao', 'mensagem' => 'Ação desconhecida.']);
