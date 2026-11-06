<?php
// API da biblioteca compartilhada do Cifrador. É aberta: quem tem o link vê e edita tudo.
//
//   GET  api.php?acao=lista        tudo: {cifras: {id: cifra}, repertorios: {id: repertorio}}
//   POST api.php?acao=gravar       {cifra: {id?, title, artist, text}, antes}
//                                  "antes" é o "updated" da cifra quando foi aberta (null se nova).
//                                  Se outra pessoa gravou no meio tempo, responde 409 com a versão atual.
//   POST api.php?acao=apagar       {id}       a cifra vai para a lixeira (30 dias)
//   POST api.php?acao=restaurar    {id}       tira da lixeira
//   POST api.php?acao=gravar_repertorio  {repertorio: {id?, nome, data, itens: [{id, semis}]}, antes}
//                                  Como nas cifras: se outra pessoa gravou no meio tempo, responde 409.
//   POST api.php?acao=apagar_repertorio  {id}
//
// Os dados ficam num arquivo fora da pasta pública quando dá (domains/<domínio>/cifras-dados/);
// se não der, em _dados/ ao lado, protegido. O arquivo começa com um trecho PHP que encerra a
// execução, para nunca ser entregue como texto. A cada dia com alteração fica uma cópia do banco
// como estava antes (backup-AAAA-MM-DD.php); as dos últimos 60 dias são mantidas.

declare(strict_types=1);

const CABECA = "<?php exit; ?>\n";
const LIMITE_PEDIDO = 300_000;
const LIMITE_TEXTO = 60_000;
const LIMITE_NOME = 200;
const MAXIMO_CIFRAS = 5000;
const DIAS_DE_BACKUP = 60;
const DIAS_NA_LIXEIRA = 30;
const MAXIMO_REPERTORIOS = 1000;
const MAXIMO_ITENS = 60;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function responder(int $status, array $corpo): never
{
    http_response_code($status);
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function falhar(int $status, string $erro, string $mensagem): never
{
    responder($status, ['erro' => $erro, 'mensagem' => $mensagem]);
}

function pastaDados(): string
{
    foreach ([dirname(__DIR__, 2) . '/cifras-dados', __DIR__ . '/_dados'] as $pasta) {
        if ((is_dir($pasta) || @mkdir($pasta, 0700, true)) && is_writable($pasta)) {
            if (str_starts_with($pasta, __DIR__) && !is_file("$pasta/.htaccess")) {
                file_put_contents("$pasta/.htaccess", "Require all denied\nDeny from all\n");
            }
            return $pasta;
        }
    }
    falhar(500, 'sem_pasta', 'Não há onde guardar as cifras no servidor.');
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

/** Lê o banco; com $mudar, altera e grava sob trava exclusiva. $mudar devolve [banco, resposta]. */
function banco(?callable $mudar = null): array
{
    $pasta = pastaDados();
    $arquivo = "$pasta/banco.php";
    $trava = fopen($arquivo . '.lock', 'c');
    flock($trava, $mudar ? LOCK_EX : LOCK_SH);
    try {
        $banco = lerArquivo($arquivo) ?? [];
        $banco['cifras'] = $banco['cifras'] ?? [];
        $banco['lixeira'] = $banco['lixeira'] ?? [];
        $banco['repertorios'] = $banco['repertorios'] ?? [];
        if (!$mudar) return [$banco, null];
        backupDoDia($pasta, $arquivo);
        [$banco, $resposta] = $mudar($banco);
        $limite = (time() - DIAS_NA_LIXEIRA * 86400) * 1000;
        $banco['lixeira'] = array_filter($banco['lixeira'], fn ($c) => ($c['apagada'] ?? 0) >= $limite);
        $json = json_encode($banco, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $temporario = $arquivo . '.tmp';
        file_put_contents($temporario, CABECA . $json);
        rename($temporario, $arquivo);
        return [$banco, $resposta];
    } finally {
        flock($trava, LOCK_UN);
        fclose($trava);
    }
}

function corpo(): array
{
    $texto = file_get_contents('php://input', false, null, 0, LIMITE_PEDIDO + 1);
    if ($texto === false || strlen($texto) > LIMITE_PEDIDO) falhar(413, 'grande', 'Cifra grande demais.');
    $dados = json_decode($texto, true);
    if (!is_array($dados)) falhar(400, 'invalido', 'Pedido inválido.');
    return $dados;
}

function idValido(mixed $id): bool
{
    return is_string($id) && preg_match('/^[A-Za-z0-9_-]{1,40}$/', $id) === 1;
}

function textoLimpo(mixed $valor, int $limite, string $campo): string
{
    if ($valor === null) return '';
    if (!is_string($valor)) falhar(400, 'invalido', "Campo $campo inválido.");
    if (mb_strlen($valor) > $limite) falhar(413, 'grande', "Campo $campo grande demais.");
    return $valor;
}

function agora(): int
{
    return (int) round(microtime(true) * 1000);
}

$acao = $_GET['acao'] ?? '';
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'GET' && $acao === 'lista') {
    [$banco] = banco();
    responder(200, [
        'cifras' => $banco['cifras'] ?: new stdClass(),
        'repertorios' => $banco['repertorios'] ?: new stdClass(),
    ]);
}
if ($metodo !== 'POST') falhar(405, 'metodo', 'Use POST.');

// Pedidos que gravam só vêm da própria página.
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
$semPorta = fn (string $host) => strtolower((string) preg_replace('/:\d+$/', '', $host));
if ($origem !== '' && $semPorta((string) parse_url($origem, PHP_URL_HOST)) !== $semPorta($_SERVER['HTTP_HOST'] ?? '')) {
    falhar(403, 'origem', 'Origem não permitida.');
}

$pedido = corpo();

if ($acao === 'gravar') {
    $entrada = $pedido['cifra'] ?? null;
    if (!is_array($entrada)) falhar(400, 'invalido', 'Cifra inválida.');
    $id = $entrada['id'] ?? null;
    if ($id !== null && !idValido($id)) falhar(400, 'invalido', 'Identificador inválido.');
    $antes = $pedido['antes'] ?? null;
    $texto = textoLimpo($entrada['text'] ?? '', LIMITE_TEXTO, 'texto');
    if (trim($texto) === '') falhar(400, 'vazia', 'A cifra está vazia.');
    $cifra = [
        'title' => trim(textoLimpo($entrada['title'] ?? '', LIMITE_NOME, 'nome')) ?: 'Sem título',
        'artist' => trim(textoLimpo($entrada['artist'] ?? '', LIMITE_NOME, 'artista')),
        'text' => $texto,
    ];

    [, $resposta] = banco(function (array $banco) use ($id, $antes, $cifra) {
        $atual = $id !== null ? ($banco['cifras'][$id] ?? null) : null;
        if ($atual && ($atual['updated'] ?? null) !== $antes) {
            responder(409, ['erro' => 'conflito', 'mensagem' => 'Outra pessoa alterou esta cifra.', 'atual' => $atual]);
        }
        if (!$atual && count($banco['cifras']) >= MAXIMO_CIFRAS) falhar(507, 'cheio', 'A biblioteca chegou ao limite de cifras.');
        $id = $id ?? ('c' . bin2hex(random_bytes(6)));
        $cifra = ['id' => $id] + $cifra + ['created' => $atual['created'] ?? agora(), 'updated' => agora()];
        $banco['cifras'][$id] = $cifra;
        unset($banco['lixeira'][$id]);
        return [$banco, $cifra];
    });
    responder(200, ['ok' => true, 'cifra' => $resposta]);
}

if ($acao === 'apagar' || $acao === 'restaurar') {
    $id = $pedido['id'] ?? null;
    if (!idValido($id)) falhar(400, 'invalido', 'Identificador inválido.');
    [, $resposta] = banco(function (array $banco) use ($acao, $id) {
        if ($acao === 'apagar') {
            if (isset($banco['cifras'][$id])) {
                $banco['lixeira'][$id] = $banco['cifras'][$id] + ['apagada' => agora()];
                unset($banco['cifras'][$id]);
            }
            return [$banco, null];
        }
        $cifra = $banco['lixeira'][$id] ?? null;
        if (!$cifra) falhar(404, 'nao_achei', 'Essa cifra não está mais na lixeira.');
        unset($cifra['apagada'], $banco['lixeira'][$id]);
        $banco['cifras'][$id] = $cifra;
        return [$banco, $cifra];
    });
    responder(200, ['ok' => true, 'cifra' => $resposta]);
}

if ($acao === 'gravar_repertorio') {
    $entrada = $pedido['repertorio'] ?? null;
    if (!is_array($entrada)) falhar(400, 'invalido', 'Repertório inválido.');
    $id = $entrada['id'] ?? null;
    if ($id !== null && !idValido($id)) falhar(400, 'invalido', 'Identificador inválido.');
    $data = $entrada['data'] ?? '';
    if (!is_string($data) || ($data !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $data))) falhar(400, 'invalido', 'Data inválida.');
    $itens = $entrada['itens'] ?? [];
    if (!is_array($itens) || count($itens) > MAXIMO_ITENS) falhar(400, 'invalido', 'Músicas demais no repertório.');
    $limpos = [];
    foreach ($itens as $item) {
        if (!is_array($item) || !idValido($item['id'] ?? null)) falhar(400, 'invalido', 'Música inválida no repertório.');
        $semis = $item['semis'] ?? 0;
        if (!is_int($semis) || $semis < -11 || $semis > 11) falhar(400, 'invalido', 'Tom inválido no repertório.');
        $limpos[] = ['id' => $item['id'], 'semis' => $semis];
    }
    $repertorio = [
        'nome' => trim(textoLimpo($entrada['nome'] ?? '', LIMITE_NOME, 'nome')) ?: 'Culto',
        'data' => $data,
        'itens' => $limpos,
    ];
    $verificar = array_key_exists('antes', $pedido);
    $antes = $pedido['antes'] ?? null;
    [, $resposta] = banco(function (array $banco) use ($id, $repertorio, $verificar, $antes) {
        $atual = $id !== null ? ($banco['repertorios'][$id] ?? null) : null;
        if ($atual && $verificar && ($atual['updated'] ?? null) !== $antes) {
            responder(409, ['erro' => 'conflito', 'mensagem' => 'Outra pessoa alterou este repertório.', 'atual' => $atual]);
        }
        if (!$atual && count($banco['repertorios']) >= MAXIMO_REPERTORIOS) falhar(507, 'cheio', 'Limite de repertórios atingido.');
        $id = $id ?? ('r' . bin2hex(random_bytes(6)));
        $repertorio = ['id' => $id] + $repertorio + ['created' => $atual['created'] ?? agora(), 'updated' => agora()];
        $banco['repertorios'][$id] = $repertorio;
        return [$banco, $repertorio];
    });
    responder(200, ['ok' => true, 'repertorio' => $resposta]);
}

if ($acao === 'apagar_repertorio') {
    $id = $pedido['id'] ?? null;
    if (!idValido($id)) falhar(400, 'invalido', 'Identificador inválido.');
    banco(function (array $banco) use ($id) {
        unset($banco['repertorios'][$id]);
        return [$banco, null];
    });
    responder(200, ['ok' => true]);
}

falhar(400, 'acao', 'Ação desconhecida.');
