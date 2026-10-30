# Revisão de conteúdo — itens a confirmar antes da publicação

O site foi construído **somente** com as informações do histórico institucional fornecido. Nada foi inventado: onde
faltavam dados, há espaços reservados ou itens marcados com **"a confirmar"** (visíveis enquanto `reviewMode = true`).

Marque cada item ao validar com a liderança e atualize o arquivo indicado.

## 1. Divergências encontradas no histórico fornecido

- [x] **Neemias Tertuliano Martins** — mesma pessoa no Conselho e na diretoria; grafia unificada → `src/content/historia.ts`
- [ ] **José Norbeto / José Roberto dos Santos** — confirmado que é a mesma pessoa; falta saber a grafia correta para
      unificar → `src/content/historia.ts`
- [ ] **Eliézer Zulianelle de Andrade** — confirmar a grafia do sobrenome. → `src/content/historia.ts`
- [ ] **Relação de pastores** — o registro tem uma lacuna na numeração. Há nomes faltando? Deseja incluir períodos dos
      pastorados (somente se documentados)? → `src/content/historia.ts`

## 2. Dados institucionais e de contato

Os dados abaixo vieram de uma versão anterior do site e **não foram verificados**:

- [x] Endereço confirmado: Rua Afro Bandeira, 265 — Nova Vida, Pombal — PB, 58840-000
- [x] Telefone: a igreja ainda não tem um número oficial; o telefone foi retirado do site → `src/content/site.ts`
- [x] E-mail: sec.iec.2017@gmail.com (confirmado)
- [x] Instagram: @iecdepombal (confirmado)
- [x] YouTube e Facebook: @iecdepombal (conforme o convite oficial). Conferir se os endereços
      youtube.com/@iecdepombal e facebook.com/iecdepombal abrem os perfis corretos → `src/content/site.ts`
- [x] Mensagens: retiradas do site por enquanto (página e seção da homepage), por decisão da igreja
- [x] Domínio oficial: www.igrejacongregacionalpombal.com.br (hospedagem Hostinger, publicação automática pelo
      workflow `publicar-hostinger.yml`) → variável `NEXT_PUBLIC_SITE_URL`
- [x] Logotipo oficial — aplicado no cabeçalho e no rodapé (versão azul em fundos claros, versão branca em fundos
      escuros) e no ícone do site → `public/brand/`, `src/components/layout/BrandLogo.tsx`, `src/app/icon.png`
- [x] Liderança atual: Pr. Felipe Oliveira, pastor eleito, posse em 14/10/2026 (convite oficial). Exibido em
      "Quem somos", na lista de pastores e no destaque da página inicial → `src/content/historia.ts`
- [x] Após a posse, status atualizado para "Pastor" (desde 14/10/2026)

## 3. Horários e programação

- [x] Domingo 9h — culto da manhã e Escola Bíblica Dominical; domingo 18h — culto solene; terça 19h30 — culto de
      oração; quinta 19h30 — culto de doutrina → `src/content/agenda.json`
- [x] Eventos: retirados até sair o calendário anual da igreja. Ao incluir eventos em `agenda.json`, a seção
      "Eventos e celebrações" volta a aparecer na Agenda
- [x] Perguntas frequentes e dicas para visitantes mantidas

## 4. Missões e ação social

- [x] Catolé do Rocha, Sousa e Cajazeiras: a IEC Pombal contribuiu para a fundação; hoje são igrejas independentes
- [x] Condado: congregação com certa autonomia, ainda filiada à IEC Pombal
- [x] Santa Maria, São João e Carvalhadas: trabalhos continuam
- [x] Rio Purus (Eduardo e Donária) e Caicó (Alberto e Istênia) são os campos missionários atuais; Caicó já é igreja
      independente e emancipada
- [x] Descrição das atividades do CEDIBS confirmada

## 5. Identidade e fé

- [x] Textos bíblicos mantidos (1 Coríntios 3.11; Romanos 11.36; 1 Pedro 4.10 — ARA)
- [ ] Textos de "Quem Somos", cinco solas e convicções: revisão teológica → `src/content/fe.ts`
- [x] Confissão de fé: Confissão de Fé Congregacional — Declaração de Fé da Aliança das Igrejas Evangélicas
      Congregacionais do Brasil (Editora AGEP). Texto e capa aplicados em "Quem Somos" → `src/content/fe.ts`
- [x] Filiação confirmada: a igreja é filiada à Aliança das Igrejas Evangélicas Congregacionais do Brasil (citada em
      "A tradição congregacional" e na seção da Confissão) → `src/content/fe.ts`
- [x] A Confissão não tem link nem PDF: o acesso é pelo livro impresso, vendido pela Aliança (informado na legenda)
- [ ] Estatuto da igreja: deseja publicar no site? → `src/content/fe.ts`
- [ ] Ministérios: por enquanto sem líderes e horários. A igreja se organiza em **departamentos**: renomear a página e
      cadastrar os departamentos quando a lista vier → `src/content/ministerios.ts`

## 6. Formulários, privacidade e LGPD

- [x] Pedidos de oração: recebidos pelo secretário da igreja, Valdeci Junior → `src/app/contato/page.tsx`
- [ ] Serviço de envio dos formulários (Formspree, Getform ou próprio) → variáveis `NEXT_PUBLIC_CONTACT_ENDPOINT` e
      `NEXT_PUBLIC_PRAYER_ENDPOINT`
- [x] Texto de privacidade (LGPD) mantido pela liderança
- [ ] Autorizações de uso de imagem, especialmente de crianças e adolescentes. O site já publica fotos de pessoas
      identificáveis, inclusive crianças (leitura, oração e "as crianças na vida da igreja", na homepage); confirme
      que os responsáveis autorizaram o uso no site → `src/content/media.ts`

## 7. Instagram do O Bom Samaritano

- [x] Perfil: @obom.samaritano — carrossel na página de Missões e link na página inicial
- [x] Por decisão da igreja, o carrossel exibe apenas as fotos enviadas, sem feed automático. Se um dia quiserem
      conectar, veja "Feed do Instagram" no README

## 8. Fotografias e acervo

Espaços reservados aguardando imagens reais e autorizadas (`src/content/media.ts`):

- [x] Fachada do templo — aplicada na abertura da homepage, na seção de visita, na página "Planeje sua visita", no
      contato e na imagem de compartilhamento (Open Graph)
- [x] Congregação em culto, pregação, louvor, leitura, oração e crianças — aplicadas em "Nossa essência",
      "Quem somos" e "Nossa comunidade"
- [ ] Registros da fundação (fotografias ou documentos de 1970): em catalogação. O espaço da foto foi retirado e volta
      ao preencher `arquivo1970` em `src/content/media.ts`
- [x] Documento histórico digitalizado: não será publicado (espaço retirado)
- [ ] Campos missionários: Rio Purus e Caicó — fotos a enviar. Sem foto, os cartões aparecem só com texto; preencher
      `missoesAmazonia` e `missoesCaico` em `src/content/media.ts`
- [x] O Bom Samaritano — fotos aplicadas na página inicial e em Missões (atendimento, equipe, acolhimento e
      acompanhamento de bebês). **Confirmar a autorização dos responsáveis** para as imagens com bebês e crianças
- [x] Nome oficial: CEDIBS – Centro de Desenvolvimento Integral O Bom Samaritano
- [x] Unidade 01 (Pombal): 330 atendidos de 0 a 22 anos; cerca de 25 voluntários (Congregacional, Assembleia de Deus
      Missão, Primeira Igreja Batista de Pombal e Presbiteriana)
- [x] Unidade 02 (Paulista): 110 crianças atendidas; cerca de 15 voluntários, ~90% da Igreja Presbiteriana em Paulista
- [ ] Confirmar: Paulista é o município da Paraíba (ao norte de Pombal)? Os nomes oficiais das igrejas parceiras estão
      corretos? A unidade de Pombal funciona na comunidade de Carvalhadas? → `src/content/missoes.ts`
- [x] Descrição das atividades do CEDIBS confirmada
- [ ] Enviar o logotipo do CEDIBS em arquivo (PNG ou SVG), se quiserem exibi-lo na seção do projeto
- [x] Entrada do templo

## Para publicar

O modo de revisão está **desligado** (`reviewMode = false` em `src/content/site.ts`) desde a revisão de 30/10/2026:
os selos "a confirmar" não aparecem mais. Para voltar a vê-los durante uma nova revisão, ligue-o novamente.
