// Biblioteca compartilhada: as cifras ficam no servidor da igreja (api.php) e todo mundo vê as mesmas.
//
// - Uma cópia da última lista recebida fica no aparelho, para abrir a biblioteca sem internet.
// - O que não deu para gravar no servidor (sem internet, ou cifras da versão antiga, que ficavam só
//   no navegador) fica em "pendentes" até ser enviado.

const API = "./api.php";
const CHAVE_COPIA = "cifrador.biblioteca";
const CHAVE_REPERTORIOS = "cifrador.repertorios";
const CHAVE_REP_PENDENTES = "cifrador.repertoriosPendentes"; // [{rep, antes}] salvos sem internet
const CHAVE_PENDENTES = "cifrador.songs"; // mesma chave da versão antiga: as cifras dela viram pendentes

function ler(chave, padrao) {
  try {
    const valor = localStorage.getItem(chave);
    return valor == null ? padrao : JSON.parse(valor);
  } catch {
    return padrao;
  }
}
function guardar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {}
}

export class ErroServidor extends Error {
  constructor(mensagem, codigo, dados) {
    super(mensagem);
    this.codigo = codigo;
    this.dados = dados;
  }
}

async function chamar(acao, corpo) {
  let resposta;
  try {
    resposta = await fetch(
      `${API}?acao=${acao}`,
      corpo === undefined
        ? { cache: "no-store" }
        : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) },
    );
  } catch {
    throw new ErroServidor("Sem conexão com o servidor.", "offline");
  }
  let dados = null;
  try {
    dados = await resposta.json();
  } catch {}
  if (!resposta.ok || !dados) {
    throw new ErroServidor(
      (dados && dados.mensagem) || `O servidor respondeu ${resposta.status}.`,
      (dados && dados.erro) || (resposta.ok ? "resposta" : "offline"),
      dados,
    );
  }
  return dados;
}

const porData = (a, b) => (b.updated || 0) - (a.updated || 0);

export const biblioteca = {
  cifras: ler(CHAVE_COPIA, []),
  repertorios: ler(CHAVE_REPERTORIOS, []),
  conectado: null, // null: ainda não tentou; true/false: última tentativa
  atualizada: 0,

  pendentes() {
    return ler(CHAVE_PENDENTES, []);
  },

  achar(id) {
    return this.cifras.find((c) => c.id === id) || this.pendentes().find((c) => c.id === id) || null;
  },

  async carregar() {
    try {
      const { cifras, repertorios } = await chamar("lista");
      this.cifras = Object.values(cifras).sort(porData);
      // O que foi salvo sem internet vale por cima do que veio do servidor, até ser enviado.
      const pend = this.repertoriosPendentes().map((p) => p.rep),
        ids = new Set(pend.map((r) => r.id));
      this.repertorios = [...pend, ...Object.values(repertorios || {}).filter((r) => !ids.has(r.id))];
      guardar(CHAVE_REPERTORIOS, this.repertorios);
      this.conectado = true;
      this.atualizada = Date.now();
      guardar(CHAVE_COPIA, this.cifras);
      if (pend.length) await this.enviarRepertoriosPendentes().catch(() => {});
    } catch (erro) {
      this.conectado = false;
      if (erro.codigo !== "offline") throw erro;
    }
    return this.cifras;
  },

  _colocar(cifra) {
    this.cifras = [cifra, ...this.cifras.filter((c) => c.id !== cifra.id)].sort(porData);
    guardar(CHAVE_COPIA, this.cifras);
  },

  _tirarPendente(id) {
    guardar(
      CHAVE_PENDENTES,
      this.pendentes().filter((c) => c.id !== id),
    );
  },

  /** Grava no servidor; se outra pessoa alterou no meio tempo, grava como cópia. Sem internet, lança "offline". */
  async _gravar(cifra, antes, idLocal) {
    let como = "salva";
    let r;
    try {
      r = await chamar("gravar", { cifra, antes: antes ?? null });
    } catch (erro) {
      if (erro.codigo !== "conflito") throw erro;
      this._colocar(erro.dados.atual);
      r = await chamar("gravar", {
        cifra: { ...cifra, id: null, title: `${cifra.title} (cópia)` },
        antes: null,
      });
      como = "copia";
    }
    this.conectado = true;
    if (idLocal) this._tirarPendente(idLocal);
    this._colocar(r.cifra);
    return { cifra: r.cifra, como };
  },

  /**
   * Salva uma cifra. "antes" é o updated dela quando foi aberta (null se é nova).
   * Devolve {cifra, como}: como = "salva", "copia" (outra pessoa tinha alterado; virou uma cópia)
   * ou "pendente" (sem internet; fica no aparelho até enviar).
   */
  async salvar(dados, antes) {
    const cifra = { id: dados.id || null, title: dados.title, artist: dados.artist, text: dados.text };
    const ehPendente = dados.id && this.pendentes().some((c) => c.id === dados.id);
    if (ehPendente && !this.cifras.some((c) => c.id === dados.id)) cifra.id = null; // ainda não existe no servidor
    try {
      return await this._gravar(
        cifra,
        ehPendente ? this.pendentes().find((c) => c.id === dados.id).antes : antes,
        dados.id,
      );
    } catch (erro) {
      if (erro.codigo !== "offline") throw erro;
      this.conectado = false;
      const anterior = ehPendente ? this.pendentes().find((c) => c.id === dados.id) : null;
      const pendente = {
        ...cifra,
        id: dados.id || "p" + Date.now().toString(36),
        antes: anterior ? (anterior.antes ?? null) : (antes ?? null),
        updated: Date.now(),
      };
      guardar(CHAVE_PENDENTES, [pendente, ...this.pendentes().filter((c) => c.id !== pendente.id)]);
      return { cifra: pendente, como: "pendente" };
    }
  },

  /** Envia para o servidor as cifras que ficaram só neste aparelho (uma vez só, como os repertórios). */
  enviarPendentes() {
    return (this._enviandoCifras ??= this._enviarCifras().finally(() => (this._enviandoCifras = null)));
  },

  async _enviarCifras() {
    let enviadas = 0;
    for (const p of this.pendentes()) {
      // Só vai com o id de antes quem já existe no servidor; o resto (inclusive as cifras da versão antiga) entra como nova.
      const existe = p.antes != null && this.cifras.some((c) => c.id === p.id);
      await this._gravar(
        { id: existe ? p.id : null, title: p.title, artist: p.artist, text: p.text },
        existe ? p.antes : null,
        p.id,
      );
      enviadas++;
    }
    return enviadas;
  },

  async apagar(id) {
    if (this.pendentes().some((c) => c.id === id) && !this.cifras.some((c) => c.id === id)) {
      this._tirarPendente(id);
      return;
    }
    await chamar("apagar", { id });
    this.cifras = this.cifras.filter((c) => c.id !== id);
    guardar(CHAVE_COPIA, this.cifras);
  },

  repertoriosPendentes() {
    return ler(CHAVE_REP_PENDENTES, []);
  },

  _colocarRep(r) {
    this.repertorios = [r, ...this.repertorios.filter((x) => x.id !== r.id)];
    guardar(CHAVE_REPERTORIOS, this.repertorios);
  },

  _tirarRepPendente(id) {
    guardar(
      CHAVE_REP_PENDENTES,
      this.repertoriosPendentes().filter((p) => p.rep.id !== id),
    );
  },

  /**
   * Salva um repertório {id?, nome, data, itens: [{id, semis}], updated?}. "antes" é o updated dele
   * quando foi aberto (null se é novo). Devolve {repertorio, como}: como = "salvo", "copia" (outra
   * pessoa tinha alterado; virou uma cópia) ou "pendente" (sem internet; fica no aparelho até enviar).
   */
  async salvarRepertorio(rep, antes) {
    const temporario = !rep.id || rep.id.startsWith("t"),
      corpo = { id: temporario ? null : rep.id, nome: rep.nome, data: rep.data, itens: rep.itens };
    let r,
      como = "salvo";
    try {
      try {
        r = await chamar("gravar_repertorio", { repertorio: corpo, antes: antes ?? null });
      } catch (erro) {
        if (erro.codigo !== "conflito") throw erro;
        this._colocarRep(erro.dados.atual);
        r = await chamar("gravar_repertorio", {
          repertorio: { ...corpo, id: null, nome: `${rep.nome} (cópia)` },
          antes: null,
        });
        como = "copia";
      }
    } catch (erro) {
      if (erro.codigo !== "offline") throw erro;
      this.conectado = false;
      const anterior = this.repertoriosPendentes().find((p) => p.rep.id === rep.id),
        base = anterior ? anterior.antes : (antes ?? null),
        local = { ...rep, id: rep.id || "t" + Date.now().toString(36), updated: base };
      guardar(CHAVE_REP_PENDENTES, [
        { rep: local, antes: base },
        ...this.repertoriosPendentes().filter((p) => p.rep.id !== local.id),
      ]);
      this._colocarRep(local);
      return { repertorio: local, como: "pendente" };
    }
    this.conectado = true;
    if (rep.id) this._tirarRepPendente(rep.id);
    if (rep.id && rep.id !== r.repertorio.id && temporario) {
      this.repertorios = this.repertorios.filter((x) => x.id !== rep.id);
    }
    this._colocarRep(r.repertorio);
    return { repertorio: r.repertorio, como };
  },

  /**
   * Envia os repertórios salvos sem internet. Para no primeiro que não conseguir.
   * Se já estiver enviando (a internet voltou e a lista atualizou ao mesmo tempo), espera o mesmo
   * envio em vez de mandar de novo: mandar duas vezes duplicaria os repertórios novos.
   */
  enviarRepertoriosPendentes() {
    return (this._enviandoReps ??= this._enviarReps().finally(() => (this._enviandoReps = null)));
  },

  async _enviarReps() {
    let enviados = 0;
    for (const p of this.repertoriosPendentes()) {
      const { como } = await this.salvarRepertorio(p.rep, p.antes);
      if (como === "pendente") break;
      enviados++;
    }
    return enviados;
  },

  async apagarRepertorio(id) {
    if (!id.startsWith("t")) await chamar("apagar_repertorio", { id });
    this._tirarRepPendente(id);
    this.repertorios = this.repertorios.filter((x) => x.id !== id);
    guardar(CHAVE_REPERTORIOS, this.repertorios);
  },

  async restaurar(id) {
    const r = await chamar("restaurar", { id });
    this._colocar(r.cifra);
    return r.cifra;
  },
};
