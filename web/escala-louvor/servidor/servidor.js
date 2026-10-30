/* Escala do Louvor — ligação com o servidor da igreja (api.php).
 *
 * Oferece ao app o mesmo formato de banco que ele já usa (doc/collection, get/set/delete,
 * onSnapshot). O app é aberto: quem tem o link edita tudo. Só é carregado na versão
 * publicada no site, ao lado de api.php.
 */
(function () {
  "use strict";

  const API = "api.php";
  let atual = null; // último retrato do servidor: { dados, escalas, respostas }
  let pedindo = null;

  async function chamar(acao, corpo) {
    const resp = await fetch(`${API}?acao=${acao}`, corpo === undefined
      ? { credentials: "same-origin", cache: "no-store" }
      : { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
    let dados = null;
    try { dados = await resp.json(); } catch (e) { /* resposta sem JSON */ }
    if (!resp.ok) {
      const erro = new Error((dados && dados.mensagem) || `Erro ${resp.status}`);
      erro.code = (dados && dados.erro) || String(resp.status);
      throw erro;
    }
    return dados;
  }

  async function retrato() {
    if (atual) return atual;
    if (!pedindo) pedindo = chamar("tudo").then((t) => { atual = t; return t; }).finally(() => { pedindo = null; });
    return pedindo;
  }

  const foto = (id, dados) => ({ id, exists: dados !== undefined && dados !== null, data: () => dados });
  const mapa = (t, colecao) => (t && t[colecao]) || {};

  function documento(colecao, id) {
    return {
      get: async () => foto(id, mapa(await retrato(), colecao)[id]),
      set: async (dados) => {
        await chamar("gravar", { colecao, id, dados });
        if (atual) mapa(atual, colecao)[id] = dados;
      },
      delete: async () => {
        await chamar("apagar", { colecao, id });
        if (atual) delete mapa(atual, colecao)[id];
      },
    };
  }

  function colecao(nome) {
    return {
      doc: (id) => documento(nome, id),
      get: async () => {
        const docs = Object.entries(mapa(await retrato(), nome)).map(([id, d]) => foto(id, d));
        return { docs, size: docs.length };
      },
      /** Sem conexão aberta: confere a cada 20 s (só as respostas mudam por fora). */
      onSnapshot(aoMudar, aoFalhar) {
        let ultimo = JSON.stringify(mapa(atual, nome));
        const conferir = async () => {
          if (document.hidden) return;
          try {
            const vindo = nome === "respostas" ? (await chamar("respostas")).respostas : mapa(await chamar("tudo"), nome);
            const json = JSON.stringify(vindo || {});
            if (json === ultimo) return;
            ultimo = json;
            if (atual) atual[nome] = vindo || {};
            const docs = Object.entries(vindo || {}).map(([id, d]) => foto(id, d));
            aoMudar({ docs, size: docs.length });
          } catch (e) {
            if (aoFalhar) aoFalhar(e);
          }
        };
        const timer = setInterval(conferir, 20000);
        document.addEventListener("visibilitychange", conferir);
        return () => { clearInterval(timer); document.removeEventListener("visibilitychange", conferir); };
      },
    };
  }

  window.EscalaServidor = {
    db: {
      doc(caminho) {
        const [col, id] = caminho.split("/");
        return documento(col, id);
      },
      collection: colecao,
    },
    user: { canEdit: async () => true },
  };
})();
