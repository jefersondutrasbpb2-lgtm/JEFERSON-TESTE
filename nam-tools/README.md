# nam-tools — Combinar cabeçote (.nam) com IR de caixa

Ferramenta para gerar o `wet_signal.wav` (o `output.wav` que o
[NAMTrainerColab](https://colab.research.google.com/github/sdatkinson/NAMTrainerColab/blob/main/notebook.ipynb)
pede) a partir de:

- um modelo `.nam` de **cabeçote** (amplificador só, sem caixa)
- uma **IR** (`.wav`) da caixa que você quer usar

O script roda o sweep de referência (`input.wav`) pelo modelo do cabeçote e
depois convolui o resultado com a IR da caixa. O `output.wav` gerado já é a
resposta do **rig completo** (cabeçote + caixa) — é isso que, ao ser
treinado no NAMTrainerColab junto com o `input.wav` original, gera um
modelo A1 "Full Rig" compatível com pedais como a Sonicake Pocket Master.

## Por que isso existe

O Tone3000 parou de gerar modelos Arquitetura 1 (A1) — só gera A2, que
pedais como a Pocket Master não rodam. O jeito de treinar um A1 é reamplificar
o sweep de referência através do rig desejado (gravando a saída) e treinar
esse par `input.wav`/`output.wav` no NAMTrainerColab. Essa ferramenta gera
esse `output.wav` combinando um `.nam` de cabeçote com a IR da caixa,
sem precisar do hardware físico ligado.

## Instalação

```bash
cd nam-tools
pip install -r requirements.txt
```

> A instalação puxa `torch` e a lib `neural-amp-modeler`, então pode demorar
> alguns minutos e ocupar bastante espaço em disco.

## Uso

```bash
python blend.py \
  --nam caminho/para/cabecote.nam \
  --ir caminho/para/caixa.wav \
  --input caminho/para/input.wav \
  --output output.wav
```

- `--nam`: o modelo `.nam` do cabeçote (só amplificador).
- `--ir`: a impulse response (`.wav`) da caixa escolhida.
- `--input`: o sweep de referência (ex: o `T3K-sweep-v3.wav`/`input.wav`
  baixado da Pocket Master, o mesmo que será enviado ao Colab).
- `--output`: nome do arquivo gerado (padrão `output.wav`).
- `--no-normalize`: desativa a normalização automática de pico (por padrão
  o áudio final é normalizado a 0.9 para evitar clipping).

## Próximos passos (fora desta ferramenta)

1. Suba o `input.wav` original e o `output.wav` gerado aqui no
   [NAMTrainerColab](https://colab.research.google.com/github/sdatkinson/NAMTrainerColab/blob/main/notebook.ipynb).
2. Rode o treinamento (Runtime → GPU) e baixe o `model.nam` da pasta
   `exported_model`.
3. Importe o `model.nam` no seu pedal (ex: via SonicLink ou Sonicake Manager).

## Observações

- Se a IR estiver numa taxa de amostragem diferente do `input.wav`, ela é
  reamostrada automaticamente para bater.
- Se o modelo `.nam` tiver sido treinado numa taxa diferente da do
  `input.wav`, o script avisa mas processa mesmo assim — o ideal é manter
  tudo na mesma taxa de amostragem (normalmente 48 kHz).
