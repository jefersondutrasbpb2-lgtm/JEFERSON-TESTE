# nam-tools — Cabeçote (.nam) + IR de caixa → modelo A1 treinado

Ferramenta completa para pegar um modelo `.nam` de **cabeçote** (só
amplificador, sem caixa), combinar com a **IR** (`.wav`) de uma caixa à sua
escolha, e treinar localmente um modelo NAM **A1 "Full Rig"** (cabeçote +
caixa combinados), sem precisar do Google Colab nem do hardware físico
ligado. Compatível com pedais como a Sonicake Pocket Master, que só rodam
modelos A1.

## Por que isso existe

O Tone3000 parou de gerar modelos Arquitetura 1 (A1) — hoje só gera A2, que
pedais como a Pocket Master não rodam. O jeito de treinar um A1 é
reamplificar o sweep de referência através do rig desejado (gravando a
saída) e treinar esse par `input.wav`/`output.wav`. Essa ferramenta faz as
duas etapas:

1. **Gera o `output.wav`** rodando o sweep pelo `.nam` do cabeçote e
   convoluindo com a IR da caixa (substitui o reamp físico).
2. **Treina o modelo A1** localmente, do mesmo jeito que o
   [NAMTrainerColab](https://colab.research.google.com/github/sdatkinson/NAMTrainerColab/blob/main/notebook.ipynb)
   faz — sem precisar subir nada no Colab.

## Como usar (interface web — recomendado)

A forma mais fácil é pela interface web, que guia você pelas etapas na
ordem certa: enviar os arquivos → gerar o wet signal → configurar e treinar
→ baixar o `model.nam` final.

```bash
cd nam-tools
bash run_webapp.sh
```

Na primeira vez isso cria dois ambientes virtuais Python e instala tudo
automaticamente (pode demorar alguns minutos — puxa `torch` duas vezes,
numa versão para cada etapa). Depois é só abrir no navegador:

**http://localhost:5050**

> A ferramenta processa tudo localmente no seu computador — nada é enviado
> para servidores externos. O servidor é de desenvolvimento (Flask), pensado
> para uso pessoal na sua máquina; não exponha essa porta na internet sem
> adicionar autenticação.

### Passo a passo na interface

1. **Envie os 3 arquivos**: o `.nam` do cabeçote, a IR (`.wav`) da caixa, e
   o `input.wav` (sweep de referência — o mesmo que gerou seu `.nam` do
   cabeçote, ex: o `T3K-sweep-v3.wav`).
2. **Gere o wet signal**: a ferramenta roda o sweep pelo cabeçote e convolui
   com a IR. Você pode ouvir o resultado antes de continuar.
3. **Configure e treine**: preencha nome/fabricante/tipo de equipamento e o
   número de épocas (padrão 100). Sem GPU, cada época leva uns 50s — para
   100 épocas espere cerca de 1h30. A barra de progresso mostra a época
   atual e o log completo do treino.
4. **Baixe o `model.nam`**: pronto, arquitetura A1 ("standard"), já pode
   importar no seu pedal (ex: via SonicLink ou Sonicake Manager).

## Por que dois ambientes virtuais?

- `.venv` (etapa 1 — gerar wet signal): usa `neural-amp-modeler==0.13`,
  a versão atual, só para **ler** modelos `.nam` (inclusive os mais novos,
  formato A2/`SlimmableContainer` do Tone3000) e rodar a inferência.
- `.venv-train` (etapa 2 — treinar): usa `neural-amp-modeler==0.12.3`,
  porque é a última versão cuja rotina de treino **exporta** no formato
  A1/"standard" antigo. A versão 0.13 só exporta no formato A2 novo.

O `run_webapp.sh` cuida de criar e instalar as duas automaticamente.

## Como usar (linha de comando)

Se preferir rodar cada etapa manualmente:

```bash
pip install -r requirements.txt

python blend.py \
  --nam caminho/para/cabecote.nam \
  --ir caminho/para/caixa.wav \
  --input caminho/para/input.wav \
  --output output.wav
```

- `--nam`: o modelo `.nam` do cabeçote (só amplificador).
- `--ir`: a impulse response (`.wav`) da caixa escolhida.
- `--input`: o sweep de referência.
- `--output`: nome do arquivo gerado (padrão `output.wav`).
- `--no-normalize`: desativa a normalização automática de pico.

Depois, treine (num ambiente separado com `requirements-train.txt`
instalado, `neural-amp-modeler==0.12.3`):

```bash
python3 -m venv .venv-train
.venv-train/bin/pip install -r requirements-train.txt

.venv-train/bin/python3 train_full_rig.py \
  --input caminho/para/input.wav \
  --output output.wav \
  --epochs 100 \
  --name "Meu Rig" \
  --gear-make "Bogner" \
  --gear-model "Red Boost" \
  --gear-type amp_cab \
  --ignore-checks
```

O `model.nam` final fica em `exported_model/model.nam`.

## Observações

- Se a IR ou o `.nam` estiverem numa taxa de amostragem diferente do
  `input.wav`, a ferramenta reamostra automaticamente.
- Modelos `.nam` no formato A2 (`SlimmableContainer`, ex: exportados pelo
  Tone3000) são suportados na etapa de geração do wet signal — a ferramenta
  extrai automaticamente o submodelo de melhor qualidade.
- O treino roda em CPU neste ambiente (sem GPU). É mais lento que o Colab,
  mas viável: o modelo "standard"/A1 é pequeno (~14K parâmetros), então 100
  épocas levam cerca de 1h30 em vez de minutos.
