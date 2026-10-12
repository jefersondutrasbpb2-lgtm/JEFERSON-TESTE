"use client";

import { useMemo, useState } from "react";
import type { Message } from "@/content/data";
import { MessageCard } from "./MessageCard";
import { Icon } from "./Icon";

const unique = (values: (string | undefined)[]) =>
  Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "pt-BR"));

const normalize = (s: string) =>
  s
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function MessagesLibrary({ items }: { items: Message[] }) {
  const [query, setQuery] = useState("");
  const [series, setSeries] = useState("");
  const [preacher, setPreacher] = useState("");

  const seriesOptions = useMemo(() => unique(items.map((i) => i.series)), [items]);
  const preacherOptions = useMemo(() => unique(items.map((i) => i.preacher)), [items]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return items.filter((m) => {
      if (series && m.series !== series) return false;
      if (preacher && m.preacher !== preacher) return false;
      if (!q) return true;
      return normalize([m.title, m.passage, m.series, m.preacher].join(" ")).includes(q);
    });
  }, [items, query, series, preacher]);

  if (items.length === 0) {
    return (
      <div className="library-empty">
        <p className="h3 font-display">A biblioteca está sendo preparada.</p>
        <p className="muted">Em breve, pregações e estudos bíblicos estarão disponíveis aqui.</p>
      </div>
    );
  }

  return (
    <div className="library">
      <h2 className="sr-only">Biblioteca de mensagens</h2>
      <form className="library__filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="field library__search">
          <span className="field__label">Buscar</span>
          <span className="library__search-wrap">
            <Icon name="search" size={18} />
            <input
              className="field__input"
              type="search"
              placeholder="Título, referência bíblica, série…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </span>
        </label>
        <label className="field">
          <span className="field__label">Série</span>
          <select className="field__input" value={series} onChange={(e) => setSeries(e.target.value)}>
            <option value="">Todas</option>
            {seriesOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Pregador</span>
          <select className="field__input" value={preacher} onChange={(e) => setPreacher(e.target.value)}>
            <option value="">Todos</option>
            {preacherOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </form>

      <p className="library__count small muted" aria-live="polite">
        {filtered.length === 1 ? "1 mensagem" : `${filtered.length} mensagens`}
      </p>

      {filtered.length > 0 ? (
        <div className="msg-grid">
          {filtered.map((m, i) => (
            <MessageCard key={m.id} message={m} index={i} />
          ))}
        </div>
      ) : (
        <div className="library-empty">
          <p className="muted">Nenhuma mensagem encontrada com esses filtros.</p>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => {
              setQuery("");
              setSeries("");
              setPreacher("");
            }}
          >
            <span className="btn__label">Limpar filtros</span>
          </button>
        </div>
      )}
    </div>
  );
}
