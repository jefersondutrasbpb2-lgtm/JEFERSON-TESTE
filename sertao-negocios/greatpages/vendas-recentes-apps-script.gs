/**
 * Sertão Negócios 2026 · Vendas recentes para o aviso da página de vendas
 *
 * Onde colar
 *   Na planilha "SN26 · Vendas Eduzz": Extensões → Apps Script. Crie um arquivo novo
 *   (botão + → Script), chame de "vendas-recentes" e cole tudo isto. Não mexe no script
 *   de sincronização com a Eduzz que já existe ali.
 *
 * Como publicar
 *   Implantar → Nova implantação → tipo "App da Web"
 *     Executar como: Eu
 *     Quem pode acessar: Qualquer pessoa
 *   Copie a URL que termina em /exec e cole no aviso (aviso-vendas.html, constante FONTE).
 *
 * O que sai para a internet (e só isso)
 *   Vendas PAGAS de ingressos do Sertão Negócios, as 30 mais recentes, com:
 *   primeiro nome, UF (PB, RN, PE...), tipo de ingresso (VIP ou Smart) e data do pagamento.
 *   Nunca sai sobrenome, cidade, e-mail, telefone, valor ou id da venda.
 *   Compras feitas no nome de empresa ficam de fora.
 *
 * Se já existir uma função doGet nesse projeto, avise antes de colar.
 */

var SN26_ABA = 'vendas';
var SN26_LIMITE = 30;
var SN26_CACHE = 'sn26_vendas_recentes';

function doGet() {
  var cache = CacheService.getScriptCache();
  var json = cache.get(SN26_CACHE);
  if (!json) {
    json = JSON.stringify({ atualizado: new Date().toISOString(), vendas: sn26VendasRecentes_() });
    cache.put(SN26_CACHE, json, 300); // 5 minutos
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function sn26VendasRecentes_() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SN26_ABA);
  if (!aba) return [];
  var dados = aba.getDataRange().getValues();
  var cab = dados.shift().map(function (c) { return String(c).trim(); });
  var col = function (nome) { return cab.indexOf(nome); };
  var iStatus = col('status'), iProduto = col('produto'), iPaga = col('paga_em'),
      iNome = col('comprador_nome'), iUF = col('estado');

  var vistos = {};
  var lista = [];
  dados.forEach(function (l) {
    if (String(l[iStatus]).trim() !== 'paid') return;
    var produto = String(l[iProduto]);
    if (produto.indexOf('Sertão Negócios') !== 0) return;
    var nome = String(l[iNome]).replace(/\s+/g, ' ').trim();
    if (!nome || sn26EhEmpresa_(nome)) return;
    var chave = nome.toLowerCase();
    if (vistos[chave]) return;
    vistos[chave] = true;
    var paga = l[iPaga] instanceof Date ? l[iPaga] : new Date(l[iPaga]);
    if (isNaN(paga)) return;
    lista.push({
      nome: sn26PrimeiroNome_(nome),
      uf: /^[A-Za-z]{2}$/.test(String(l[iUF]).trim()) ? String(l[iUF]).trim().toUpperCase() : '',
      ingresso: /vip/i.test(produto) ? 'VIP' : 'Smart',
      quando: paga.toISOString()
    });
  });
  lista.sort(function (a, b) { return a.quando < b.quando ? 1 : -1; });
  return lista.slice(0, SN26_LIMITE);
}

function sn26EhEmpresa_(nome) {
  return /(^|\s)(ltda|eireli|epp|mei|me|s\/a)\.?(\s|$)|cl[ií]nica|farm[aá]cia|dental|odonto|constru|com[eé]rcio|servi[cç]os|consultoria|distribuidora|loja|empresa|associa[cç][aã]o|instituto|escola|col[eé]gio|academia|restaurante|hotel|agro|ind[uú]stria|club|clube|[oó]p?tica|[oó]culos|studio|est[uú]dio|grupo|center|centro|imobili[aá]ria|advocacia|contabilidade|cont[aá]beis/i.test(nome);
}

function sn26PrimeiroNome_(nome) {
  var p = nome.split(' ')[0].toLowerCase();
  return p.charAt(0).toUpperCase() + p.slice(1);
}

/** Para testar no editor: Executar → sn26Teste e ver o resultado no registro. */
function sn26Teste() {
  CacheService.getScriptCache().remove(SN26_CACHE);
  Logger.log(JSON.stringify(sn26VendasRecentes_(), null, 2));
}
