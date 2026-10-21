# Escala do Louvor — IEC Pombal

Ferramenta para montar, com antecedência, escalas **quinzenais ou mensais** do ministério de louvor: quem serve em cada
função, quais oficiais fazem cada parte da liturgia e quais salmos, hinos e louvores entram em cada culto.

Abra `index.html` no navegador (funciona direto do arquivo, sem instalar nada). Os dados ficam salvos no próprio
navegador; quando a página roda como Artifact no Claude, eles ficam na nuvem e aparecem iguais no celular e no
computador. Use **Backup** para guardar uma cópia.

## Como funciona

1. **Cultos e regras**: cultos da semana (dia, hora, liturgia, equipe necessária e se é solene) e a orientação pastoral
   para os cultos solenes.
2. **Liturgias**: a ordem de cada culto. Cada parte pode ser uma **música** (salmo, hino ou louvor, com quantidade e
   etiquetas exigidas), um **oficial** (com os cargos que podem fazê-la) ou um **texto fixo** (ex.: "Dirigente · em pé").
3. **Repertório**: Salmos e Hinos (com número) e louvores, com etiquetas (trinitário, cristocêntrico, doutrinário e
   temas), link do YouTube e a última vez que foram cantados. **Importar lista** aceita texto colado do Word, Excel ou
   WhatsApp.
4. **Equipe do louvor** e **Oficiais**: funções de cada pessoa (titular ou só apoio), cultos em que serve e datas em
   que não pode. Um oficial que também está no louvor fica ligado ao cadastro dele.
5. **Escalas**: escolha Quinzenal, Mensal ou Outro período e toque em **Gerar escala**. Depois, toque em qualquer campo
   para trocar, use ↻ para sortear outro e o cadeado para travar. **Sortear de novo** refaz tudo o que não está travado.
   **Texto para o WhatsApp** copia a escala formatada.

### Regras da geração

- **Culto solene**: salmos e hinos precisam ter as etiquetas definidas para o hinário (padrão: *trinitário*) e os
  louvores, as do louvor (padrão: *cristocêntrico* e *doutrinário*). Se faltar música apta, o campo fica vazio e a
  escala mostra a pendência; a ferramenta não coloca uma música fora da orientação.
- Uma música não se repete antes do intervalo configurado (padrão: 3 semanas). Se o repertório apto for curto demais,
  ela repete a que foi cantada há mais tempo e mostra um alerta. Os cultos solenes escolhem as músicas primeiro.
- Quem serviu menos é escalado primeiro; a ferramenta evita a mesma pessoa em cultos seguidos e em duas funções no mesmo
  culto, e nunca escala ninguém em data marcada como indisponível.
- Quem só apoia numa função (ex.: bateria de apoio) só entra nela quando nenhum titular pode, e a escala avisa.
- Um oficial que está tocando ou cantando não recebe parte da liturgia naquele culto.
- **Domingo**: o culto das 18h repete a equipe e as músicas do culto das 9h (configurável em "Mesma equipe e músicas
  do culto"). Nele só se muda a ordem das músicas; os oficiais de cada culto são escolhidos à parte.

## Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Página e estilos |
| `app.js` | Interface e armazenamento |
| `engine.js` | Regras da escala (funções puras) |
| `dados-iniciais.js` | Liturgias, repertório, equipe, oficiais e cultos da igreja; regras padrão |
| `engine.test.js` | Testes: `node --test web/escala-louvor/engine.test.js` |

## De onde vieram os dados iniciais

- **Liturgias**: "Modelos de liturgia IEC Pombal" (culto solene, culto matinal, reunião de oração e reunião de
  doutrina).
- **Cultos**: domingo 9h (culto matinal e EBD) e 18h (culto solene), terça 19h30 (oração) e quinta 19h30 (doutrina
  ou estudo bíblico). Os dois de domingo são solenes. A equipe de cada culto é uma sugestão inicial.
- **Louvores**: "Repertório – Grupo de louvor IEC de Pombal/PB" (100 itens). Títulos repetidos viraram uma música só;
  quando o vídeo era outro, o segundo link ficou nas observações.
- **Salmos e Hinos**: nº 29 (cantado em 18/10/2026), 30, 31, 245, 247 e "Ao Deus de Abraão" (número a confirmar).
- **Etiquetas**: primeira sugestão, para revisar com o pastor na aba Repertório (filtro "Só aptas ao solene").
- **Equipe e oficiais**: lista do ministério de louvor (out/2026). Não existe a função de ministro de louvor: o grupo
  canta e conduz a igreja à adoração. O Pb. Inácio Marinho está inativo por motivo de saúde.
