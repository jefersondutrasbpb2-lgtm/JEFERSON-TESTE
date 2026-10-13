# Revisão de conteúdo — itens a confirmar antes da publicação

O site foi construído **somente** com as informações do histórico institucional fornecido. Nada foi inventado: onde
faltavam dados, há espaços reservados ou itens marcados com **"a confirmar"** (visíveis enquanto `reviewMode = true`).

Marque cada item ao validar com a liderança e atualize o arquivo indicado.

## 1. Divergências encontradas no histórico fornecido

- [ ] **Neemias Tertuliano** — aparece como "Neemias Tertuliano **de Sousa**" (presbítero, primeiro Conselho) e
      "Neemias Tertuliano **Martins**" (presidente da primeira diretoria). É a mesma pessoa? Qual a grafia correta?
      → `src/content/historia.ts`
- [ ] **José Norbeto / José Roberto dos Santos** — "José **Norbeto** dos Santos" (diácono) e "José **Roberto** dos Santos"
      (tesoureiro). Mesma pessoa? Qual a grafia correta? → `src/content/historia.ts`
- [ ] **Eliézer Zulianelle de Andrade** — confirmar a grafia do sobrenome. → `src/content/historia.ts`
- [ ] **Relação de pastores** — o registro tem uma lacuna na numeração. Há nomes faltando? Deseja incluir períodos dos
      pastorados (somente se documentados)? → `src/content/historia.ts`

## 2. Dados institucionais e de contato

Os dados abaixo vieram de uma versão anterior do site e **não foram verificados**:

- [ ] **Endereço — divergência:** o convite da posse pastoral traz "Rua Afro Bandeira, nº **264**, **Nova Vida**",
      enquanto a placa na fachada mostra **265** e a versão antiga do site dizia "Centro". O site usa hoje
      "Rua Afro Bandeira, 265 — Nova Vida, Pombal — PB, 58840-000". Confirmar número e bairro → `src/content/site.ts`
- [ ] Telefone: (83) 3431-3165 → `src/content/site.ts`
- [ ] E-mail: sec.iec.2017@gmail.com → `src/content/site.ts`
- [x] Instagram: @iecdepombal (confirmado)
- [x] YouTube e Facebook: @iecdepombal (conforme o convite oficial). Conferir se os endereços
      youtube.com/@iecdepombal e facebook.com/iecdepombal abrem os perfis corretos → `src/content/site.ts`
- [ ] Endereço do canal para a biblioteca de mensagens → `src/content/mensagens.json` (`channelUrl`)
- [ ] Domínio oficial do site → variável `NEXT_PUBLIC_SITE_URL`
- [x] Logotipo oficial — aplicado no cabeçalho e no rodapé (versão azul em fundos claros, versão branca em fundos
      escuros) e no ícone do site → `public/brand/`, `src/components/layout/BrandLogo.tsx`, `src/app/icon.png`
- [x] Liderança atual: Pr. Felipe Oliveira, pastor eleito, posse em 14/10/2026 (convite oficial). Exibido em
      "Quem somos", na lista de pastores e no destaque da página inicial → `src/content/historia.ts`
- [ ] Após a posse, atualizar o status de "Pastor eleito" para "Pastor" → `src/content/historia.ts`

## 3. Horários e programação

- [ ] Domingo 9h — culto dominical (manhã) → `src/content/agenda.json`
- [ ] Domingo 19h — culto dominical (noite) → `src/content/agenda.json`
- [ ] Quarta-feira 19h30 — estudo bíblico e oração → `src/content/agenda.json`
- [ ] Outras programações regulares (escola bíblica, jovens, crianças, oração…)
- [ ] Eventos reais (os dois eventos atuais são **exemplos** e somem quando `reviewMode = false`)
- [ ] Respostas das perguntas frequentes e dicas para visitantes → `src/app/visite/page.tsx` e
      `src/components/home/Cultos.tsx`

## 4. Missões e ação social

- [ ] Catolé do Rocha, Sousa e Cajazeiras: confirmar a forma de descrever a contribuição da IEC Pombal e se existe
      vínculo atual. Há datas documentadas para a organização dessas igrejas? → `src/content/missoes.ts`
- [ ] Congregação em Condado: ainda mantida? → `src/content/missoes.ts`
- [ ] Comunidades rurais (Santa Maria, São João, Carvalhadas): trabalhos atuais? → `src/content/missoes.ts`
- [ ] Rio Purus — missionários Eduardo e Donária: campo atual? Grafia dos nomes? Autorizam a publicação? Município de
      referência (o mapa usa posição aproximada no trecho médio do rio) → `src/content/missoes.ts`
- [ ] Caicó (RN) — missionários Alberto e Istênia: campo atual? Grafia dos nomes? Autorizam a publicação?
- [ ] O Bom Samaritano: número de crianças atendidas ("mais de 200" — histórico ou atual?), situação atual do projeto,
      responsáveis e forma de apoio → `src/content/missoes.ts`

## 5. Identidade e fé

- [ ] Textos bíblicos sugeridos (1 Coríntios 3.11; Romanos 11.36; 1 Pedro 4.10 — versão ARA). A liderança pode
      escolher outros → `src/content/fe.ts` e `src/app/ministerios/page.tsx`
- [ ] Textos de "Quem Somos", cinco solas e convicções: revisão teológica → `src/content/fe.ts`
- [ ] Vínculo denominacional (ex.: convenção ou união de igrejas congregacionais), documento confessional e estatuto —
      **não foram atribuídos** à igreja; inclua apenas se oficialmente confirmados → `src/content/fe.ts`
- [ ] Ministérios: nomes oficiais, coordenadores, faixas etárias e horários → `src/content/ministerios.ts`

## 6. Formulários, privacidade e LGPD

- [ ] Quem recebe os **pedidos de oração** (equipe pastoral? quem exatamente?) — o texto da página de contato deve
      refletir isso → `src/app/contato/page.tsx`
- [ ] Serviço de envio dos formulários (Formspree, Getform ou próprio) → variáveis `NEXT_PUBLIC_CONTACT_ENDPOINT` e
      `NEXT_PUBLIC_PRAYER_ENDPOINT`
- [ ] Texto de privacidade validado pela liderança (e, se possível, por assessoria jurídica) → `src/app/contato/page.tsx`
- [ ] Autorizações de uso de imagem, especialmente de crianças e adolescentes. O site já publica fotos de pessoas
      identificáveis, inclusive crianças (leitura, oração e "as crianças na vida da igreja", na homepage); confirme
      que os responsáveis autorizaram o uso no site → `src/content/media.ts`

## 7. Instagram do O Bom Samaritano

- [x] Perfil: @obom.samaritano — carrossel na página de Missões e link na página inicial
- [ ] Conectar o feed (Behold ou token da Meta) para exibir as publicações automaticamente → veja "Feed do
      Instagram" no README

## 8. Fotografias e acervo

Espaços reservados aguardando imagens reais e autorizadas (`src/content/media.ts`):

- [x] Fachada do templo — aplicada na abertura da homepage, na seção de visita, na página "Planeje sua visita", no
      contato e na imagem de compartilhamento (Open Graph)
- [x] Congregação em culto, pregação, louvor, leitura, oração e crianças — aplicadas em "Nossa essência",
      "Quem somos" e "Nossa comunidade"
- [ ] Registros da fundação (fotografias ou documentos de 1970)
- [ ] Documento histórico digitalizado (ata ou registro)
- [ ] Campos missionários: Rio Purus e Caicó
- [x] O Bom Samaritano — fotos aplicadas na página inicial e em Missões (atendimento, equipe, acolhimento e
      acompanhamento de bebês). **Confirmar a autorização dos responsáveis** para as imagens com bebês e crianças
- [ ] Confirmar o nome oficial "CEDIBS — Centro de Desenvolvimento Integral “O Bom Samaritano” de Pombal-PB" (lido
      na camiseta da equipe) e a descrição das atividades → `src/content/missoes.ts`
- [x] Entrada do templo

## Para publicar

1. Atualize os dados acima e remova `pending: true` dos itens confirmados.
2. Em `src/content/site.ts`, defina `reviewMode = false`.
3. Configure as variáveis de ambiente e rode `npm run build`.
