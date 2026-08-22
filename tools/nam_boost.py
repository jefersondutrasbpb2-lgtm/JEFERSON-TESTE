#!/usr/bin/env python3
"""
Sobe (ou desce) o volume de saida de uma captura .nam (Neural Amp Modeler),
alterando SOMENTE o escalar "head_scale" (o ganho de saida final da rede,
aplicado depois de todo o processamento de tom: head_input = head_scale * head_input).

Nao altera pesos internos, arquitetura, tom ou qualquer outro dado do modelo.

Suporta:
  - arquivos WaveNet "simples" (architecture == "WaveNet")
  - arquivos "SlimmableContainer" (architecture == "SlimmableContainer"),
    usados nas capturas A2 novas, que contem varios sub-modelos WaveNet
    em config["submodels"][i]["model"] -- todos sao ajustados igualmente.

Uso:
    python3 nam_boost.py entrada.nam saida.nam --db 6
"""
import argparse
import json
import sys


def db_to_linear(db: float) -> float:
    return 10 ** (db / 20)


def boost_wavenet_node(node: dict, gain: float) -> int:
    """Aplica o ganho a um dicionario com architecture == 'WaveNet'. Retorna quantos escalares foram ajustados."""
    cfg = node.get("config")
    if cfg is None or "head_scale" not in cfg:
        raise ValueError("Config WaveNet sem 'head_scale' -- formato inesperado.")

    cfg["head_scale"] = cfg["head_scale"] * gain

    weights = node.get("weights")
    if weights:
        # O ultimo elemento do array de pesos exportado e sempre o head_scale
        # (ver nam/models/wavenet/_wavenet.py: export_weights/import_weights).
        weights[-1] = weights[-1] * gain

    return 1


def boost_node(node: dict, gain: float) -> int:
    arch = node.get("architecture")
    if arch == "WaveNet":
        return boost_wavenet_node(node, gain)
    if arch == "SlimmableContainer":
        submodels = node.get("config", {}).get("submodels")
        if not submodels:
            raise ValueError("SlimmableContainer sem 'submodels' -- formato inesperado.")
        count = 0
        for sub in submodels:
            count += boost_node(sub["model"], gain)
        return count
    raise ValueError(
        f"Arquitetura '{arch}' nao suportada por esta ferramenta. "
        "Apenas WaveNet e SlimmableContainer(WaveNet) foram validados."
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("entrada", help="arquivo .nam de entrada")
    parser.add_argument("saida", help="arquivo .nam de saida")
    parser.add_argument("--db", type=float, default=6.0, help="dB a somar ao volume de saida (padrao: 6)")
    args = parser.parse_args()

    with open(args.entrada, "r", encoding="utf-8") as f:
        data = json.load(f)

    gain = db_to_linear(args.db)
    n = boost_node(data, gain)

    with open(args.saida, "w", encoding="utf-8") as f:
        json.dump(data, f)

    print(f"OK: {n} sub-modelo(s) ajustado(s) em +{args.db} dB (fator {gain:.6f}).")
    print(f"Arquivo salvo em: {args.saida}")


if __name__ == "__main__":
    sys.exit(main())
