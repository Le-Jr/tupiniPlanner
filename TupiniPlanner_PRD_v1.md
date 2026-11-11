# TUPINIPLANNER & MOTIVATION APP
## PRD v1.0 — Signed by Leandro Junior
**Data:** 10/11/2026  
**Produto:** aplicativo pessoal mobile-first, local-first, preparado para Android/APK  
**Tagline:** Train. Eat. Practice. Evolve.

## 1. Visão
Um planejador pessoal que conecta emagrecimento sustentável, calistenia, caminhadas, organização alimentar e estudo de guitarra. A interface deve ser útil em menos de 30 segundos por acesso, recompensando a constância sem punir dias difíceis. O tom mistura disciplina de cinema de ação dos anos 1980, humor leve e visual de terminal/arcade da identidade Tupinicode.

### Problema
O usuário trabalha em home office, ainda não possui horários consistentes de refeições, quer começar exercícios progressivamente e formalizar um estudo de guitarra já existente. Ferramentas genéricas separam essas frentes e podem induzir ao excesso de cobrança.

### Objetivos
1. Mostrar a missão do dia e permitir registrar sua conclusão com poucos toques.
2. Criar rotina alimentar antes de prescrever restrição.
3. Apoiar atividade física gradual com registro simples e orientações conservadoras.
4. Registrar estudo musical e continuidade.
5. Acompanhar peso, cintura, consistência e evolução sem transformar peso em placar moral.
6. Funcionar offline com persistência real; permitir futuro empacotamento APK.

### Não objetivos do MVP
Não é contador clínico de calorias, prescrição nutricional, sistema diagnóstico, rede social, rastreador automático de smartwatch nem substituto de acompanhamento profissional. Nenhum backend ou autenticação obrigatória no MVP.

## 2. Público e ponto de partida
**Perfil inicial local:** adulto de 24 anos, altura 170 cm; bioimpedância de 10/11/2026: peso 96,9 kg, gordura estimada 37%, massa livre de gordura estimada 61 kg, IMC 33,5, gordura visceral 15 segundo escala do equipamento. Primeira meta de referência: 92,1 kg (~5% do peso inicial), **editável e nunca obrigatória**. Dados da balança são estimativas, não diagnósticos. Horários de sono, atividade atual, restrições físicas e ingestão não informados: o onboarding DEVE solicitar ou permitir pular, sem inventar valores. Evitar qualquer meta calórica automática sem avaliação das necessidades.

## 3. Princípios de produto
- **Clareza acima de efeitos:** tarefas, horários e ações legíveis.
- **Progressão, não punição:** dias pulados não subtraem XP nem geram vergonha.
- **Privacidade por padrão:** dados de saúde locais; exportação e apagamento explícitos.
- **Flexibilidade:** toda missão e frequência são editáveis e pausáveis.
- **Mobile primeiro:** uma mão, telas estreitas, botões acessíveis e feedback imediato.
- **Um projeto, três disciplinas:** movimento, alimentação, guitarra.

## 4. Direção de identidade visual (fonte: Tupinicode Design Guide v6)
**Origem da marca:** estética terminal + regador/broto, tecnologia e educação, com toque retro-digital. Usar o arquivo original da logo se disponibilizado; NÃO recriar a marca oficial como se fosse exata. Se não houver asset, usar símbolo provisório simples `>_` + broto, claramente indicado no código como placeholder substituível.

**Paleta documentada (códigos ainda sugeridos no próprio manual):**
- Verde principal `#00FF6A` — ação e destaques; cuidado com grandes áreas luminosas.
- Verde secundário `#00C653` — ícones/folhas.
- Floresta `#0D3B2E` — cartões e superfícies.
- Fundo `#071A14` — canvas principal.
- Laranja `#FFB347` — recompensas e elementos Signature.
- Marfim `#F5F7EF` — textos claros/fundo alternativo.

**Fontes:** Inter ou Poppins para navegação/textos; JetBrains Mono/Fira Code para microtexto; fonte display pixel/arcade APENAS em títulos especiais e `CONGRATULATIONS`. Não tornar toda a UI pixelada. Elementos de terminal, borda fina e microdetalhes 8-bit, nunca poluição visual. Suporte a fonte ampliada.

**Sublinguagem própria TupiniPlanner:** cartões arredondados modernos com cantos discretos pixelados, linhas de progresso tipo console, cards de missão, selo `MISSION COMPLETE`, microanimação de avanço, grafismos minimalistas. Rodapé/splash: `Signed by Leandro Junior`.

## 5. Navegação
Bottom navigation com 5 destinos: **Hoje | Missões | Evolução | Guitarra | Perfil**. Alimentação e Treino acessíveis por cards na tela Hoje e filtros em Missões. Motivation Center pode ser uma tela/modal acessível pelo ícone de troféu, sem aumentar a barra inferior.

### Tela A — Splash/onboarding
Marca, tagline, assinatura. Cadastro opcional, sem login; configurar ou pular nome, peso, altura, objetivo, frequência de exercícios, rotina de alimentação, dias de guitarra, horários. Consentimento explícito para salvar informações pessoais no aparelho. Importação da baseline como sugestão inicial editável. Abrir o app rapidamente após primeiro uso.

### Tela B — Hoje (principal)
Saudação, data local, frase original aleatória, anel de progresso (tarefas elegíveis concluídas/tarefas elegíveis totais), próximo compromisso, cards compactos `Movimento`, `Alimentação`, `Guitarra`, `Resumo do dia`; CTA `VER MISSÕES`; vitórias sem esconder pendências. Estados vazio, em andamento e concluído.

### Tela C — Missões / planner
Checklist agrupado por categoria e horário, filtros, reordenação, editar horário, concluir, desmarcar, adiar para data e marcar `Não rolou hoje` com motivo opcional e anotação. Check-in rápido sem caixa de diálogo para tarefa simples. Categorias: movimento, refeição, hidratação opcional, guitarra, sono opcional, personalizado. Tarefas recorrentes por dia da semana e tarefas únicas. Nenhuma tarefa alimentar pede que a pessoa coma se não estiver com fome.

### Tela D — Movimento
Plano inicial **sugerido**, não imposto: primeiras duas semanas, duas sessões leves de calistenia e três caminhadas de 15–20 min, progredindo sob controle do usuário. Exemplos de treino: flexão na parede/inclinada, agachamento na cadeira, remada com faixa firmemente ancorada, bird-dog; 1–2 séries adaptáveis. Exibir exercícios com instrução breve, progressão e alternativa mais fácil. Registro de duração, séries/reps, esforço percebido opcional, notas. Alertar para interromper diante de sintomas preocupantes e buscar avaliação adequada. Evitar exercícios sem apoio seguro e progressão automática.

### Tela E — Alimentação
Objetivo da fase 1: regularidade e observação, não calorias. Defaults opcionais de café da manhã/almoço/lanche/jantar, com horários editáveis (exemplos 08:30/12:30/16:30/19:30). Registrar `feito`, `adiado`, `não fiz`, observação, composição da refeição e fome opcional. Não rotular alimentos como `bons/ruins` nem penalizar refeição pulada. Permitir adaptar quantidade de refeições. No futuro: sugestões educativas e ferramentas de planejamento, sem prescrições clínicas.

### Tela F — Guitarra
Sessão-padrão editável de 35 min: aquecimento 5, técnica 10, riffs/repertório 15, prática livre 5. Timer com iniciar/pausar/finalizar, técnica/repertório praticado, BPM opcional, nota e áudio local somente em expansão futura. Meta semanal configurável, não compulsória. Gamificação própria `Cordas em Chamas`.

### Tela G — Evolução
Linha temporal de peso, gráfico de tendência por semanas, cintura opcional, percentual da meta (distância relativa), treinos/caminhadas, refeições registradas, sessões de guitarra, aderência semanal por categoria. Registrar nova medição com data e comentário. Mostrar incerteza da bioimpedância, não inferir gordura corporal a partir de peso apenas. A meta é editável; oferecer esconder métricas corporais.

### Tela H — Motivation Center / Reações
Biblioteca de reações originais de personagens-arquétipos `O Campeão`, `O Comando`, `O Veterano`, `O Rival` (sem usar nomes/rostos/áudios de atores ou filmes reais). Cada badge desbloqueia uma reação diferente; animação local em loop pequeno (WebP/Lottie ou GIF otimizado), sem dependência de rede. Frases originais e aleatórias, nunca atribuir citações fabricadas a filmes. Reação séria ao `Não rolou hoje` deve ser opcional e brincalhona, seguida de suporte e CTA `AJUSTAR PLANO`, não vergonha.

### Tela I — Perfil / ajustes
Tema, reduzir movimento, sons e vibração on/off, notificações futuramente, metas, dias de descanso, privacidade, exportar/importar JSON, apagar dados com confirmação, about/credits, versão.

## 6. Interações-chave
**Concluir tarefa** → persistir status e horário → atualizar resumo, XP e badges → se for marco novo mostrar overlay `CONGRATULATIONS`, confete retro discreto e animação original; botão fechar e opção desligar efeitos. Não repetir pop-up se usuário alternar status.

**Não rolou hoje** → status `skipped`, motivo opcional (`sem tempo`, `cansaço`, `imprevisto`, `não estava bem`, `outro`) + texto livre → uma reação opcional e frase de retomada → oferecer `reprogramar` ou `encerrar dia`; nenhum XP negativo. Exemplo: `Perdeu um round, não a campanha. Qual o próximo movimento?`.

**Peso** → input validado com data, guardar histórico; não projetar prazo rígido nem sugerir que a pessoa coma menos automaticamente.

**Streak** → contar apenas dias planejados/elegíveis para a categoria; descanso não quebra streak. Mostrar `dias de compromisso cumpridos` e `retomadas`, evitando incentivos a treinar lesionado/doente.

## 7. Gamificação
XP apenas para conclusão efetiva de tarefas personalizadas. Defaults configuráveis: calistenia +30, caminhada +20, registro de rotina alimentar +15, guitarra +20, review semanal +15. Evitar multiplicar XP por abrir/fechar tarefas e não somar duas vezes. Bônus de dia concluído +20 uma vez, se todas as tarefas elegíveis planejadas estiverem concluídas; só se houver pelo menos uma tarefa elegível. `skipped` não gera XP e não tira XP. Badges: `Primeiro Passo`, `3 Caminhadas`, `Primeira Semana`, `Cordas em Chamas`, `Voltou ao Jogo`, `Quatro Semanas`. Nunca atrelar recompensa exclusivamente a restrição alimentar, pesagem compulsiva ou emagrecimento acelerado.

## 8. Modelo de dados (conceitual)
- `UserProfile {id, displayName, heightCm?, birthYear?, onboardingCompleted, createdAt}`
- `HealthBaseline {id, measuredAt, weightKg, bodyFatPercent?, leanMassKg?, visceralIndex?, source, notes?}`
- `Goal {id, category, title, targetValue?, unit?, targetDate?, active, createdAt}`
- `TaskTemplate {id, category, title, recurrenceDays[], localTime?, active, xpValue, order, workoutRef?}`
- `TaskOccurrence {id, templateId?, localDate, titleSnapshot, category, status: pending|completed|skipped|postponed, completedAt?, notes?, reason?}`
- `WorkoutSession {id, localDate, workoutType, minutes?, effort?, exercises[], notes?}`
- `MealLog {id, localDate, mealType, at?, description?, hunger?, notes?}`
- `GuitarSession {id, localDate, durationMinutes, technique?, repertoire?, bpm?, notes?}`
- `BodyMeasurement {id, date, weightKg?, waistCm?, bodyFatPercent?, measurementMethod?, notes?}`
- `XPEvent {id, sourceType, sourceId, points, createdAt}` [unique sourceType/sourceId]
- `BadgeUnlock {id, badgeId, unlockedAt}` [unique badgeId]
- `DailyReflection {id, localDate, notes?, mood?, createdAt}`
- `AppSettings {theme, animationsEnabled, reducedMotion, soundEnabled, notificationsEnabled, locale}`

Tudo persistido em SQLite local, migrações versionadas e operações transacionais para tarefa+XP+badge. Datas da agenda em `YYYY-MM-DD` no fuso local; timestamps em UTC. Definir comportamento para mudança de fuso, DST e dia já iniciado. Nunca duplicar ocorrência ao reiniciar.

## 9. Conteúdo inicial (seed editável)
**Semana 1:** calistenia seg/qui; caminhada ter/sex/sáb; refeições como lembretes ajustáveis, guitarra quatro dias de 25 min. Dias e horários são sugestões, NÃO dados confirmados do usuário. **Semana 2:** caminhadas podem ir a 20 min e guitarra a 30 min, somente com consentimento. **Semana 3:** opção de 3 sessões de calistenia após autoavaliação; **sem progressão compulsória**. **Semana 4:** manter e rever esforço/aderência. Não criar metas de calorias, água ou sono por conta própria.

## 10. Requisitos não funcionais
- Android-first; viewport 320–430 px, também tablet e web preview.
- Alvos de toque mínimos ~44–48 px, contraste adequado, leitor de tela, fonte escalável, sem cor como único indicador.
- Offline para todas as funções principais; inicialização rápida, persistência após fechar.
- Feedback em menos de ~150 ms na UI para ação simples; transações sem duplicação.
- `Reduce motion` respeitado; animações opcionais, sem flash estroboscópico.
- Sem imagens de Stallone, cenas, logotipos de filmes, falas protegidas ou hotlinks a GIFs de terceiros por padrão. Assets originais ou licenciados e créditos por asset.
- Não enviar dados médicos a analytics; sem trackers no MVP.

## 11. MVP e entregas
**MVP-0:** design tokens, navegação, SQLite, onboarding, seed editável, Home, Missões, conclusão/pulo/notas, dados de exemplo substituíveis.
**MVP-1:** Movimento, Alimentação, Guitarra com registros reais, peso, gráficos, XP/badges e reações originais simples, exportação/importação.
**MVP-2:** notificações locais, visualizações avançadas, backup opcional, customização, biblioteca de assets e distribuição Android.

## 12. Critérios de aceite
1. Instalação limpa cria o perfil sem obrigar dados sensíveis.
2. Marcar uma tarefa atualiza card, XP, progresso e histórico imediatamente; persistente após reiniciar.
3. Não marcar duas vezes / desmarcar e remarcar não duplica XP.
4. `Skipped` registra motivo e nota, não reduz pontuação nem dispara linguagem humilhante.
5. Dia de descanso não quebra streak; cronograma não gera tarefas em duplicidade.
6. Editar horário, recorrência e plano não corrompe ocorrências antigas.
7. Peso e cintura são editáveis; gráficos refletem dados reais e têm estados vazios.
8. App navega offline sem erro ou telas vazias indevidas.
9. Telas de 320 px sem overflow horizontal; texto escalado não é cortado.
10. Parâmetro `reduce motion` desliga confete e GIFs repetitivos.
11. Exportação gera JSON válido; importação valida esquema e oferece confirmação.
12. Impossível apresentar GIFs não licenciados como assets oficiais do produto.

## 13. Métricas de qualidade
- **North star:** % de dias planejados em que o usuário realizou ao menos uma ação significativa.
- Taxa de conclusão por categoria e por semana; dias de retomada após ausência.
- Tempo para concluir check-in; sessões de guitarra/semana; minutos caminhados; treino realizado.
- Evolução de peso/cintura apenas como informação e sem leaderboard.
- Métricas calculadas LOCALMENTE.

## 14. Riscos e decisões
- **Direitos autorais/persona:** trocar Stallone/filmes por personagens 80s originais. Se o usuário possuir direitos/licenças, habilitar importação manual de mídias licenciadas e registrar fonte.
- **Segurança física:** progressão adaptativa e informação educativa; sem aconselhamento médico individual automático.
- **Pressão psicológica:** gamificação gentil, opção de ocultar streak/peso, linguagem de recuperação.
- **Escopo:** começar com experiência robusta de um único usuário offline, não plataforma social.
- **Marca:** substituir placeholder pela logo oficial somente quando arquivo real estiver disponível; preservar cores originais.

### Decisão 11/11/2026 — GIFs e citações dos anos 70/80
Por decisão do dono do produto, as reações de conquista e o Motivation Center passam a usar GIFs de heróis de ação dos anos 80 via **API oficial do GIPHY** (canal licenciado, com atribuição `Powered by GIPHY`), e citações **reais, curtas e corretamente atribuídas** de filmes, séries e livros dos anos 70/80 (Videolocadora). Isso substitui, para esses dois pontos, as restrições de §5-H, §10 e §14 sobre GIFs de terceiros e frases apenas originais. Permanecem: nenhum GIF empacotado no app; nenhuma frase inventada atribuída a obra; fallback offline com personagens originais; `reduce motion` exibe GIF estático; recurso desligável em Perfil; nenhum dado pessoal enviado ao provedor.

## 15. Backlog sugerido
P0: tokens da marca; shell; onboarding; agenda recorrente; conclusão/pulo/notas; SQLite; dashboard.  
P1: treino e caminhada; refeições; timer de guitarra; progresso e peso; XP e badges; reações originais; exportação.  
P2: notificações; calendário completo; customização; gráficos adicionais; componentes de mídia; APK release.

## 16. Textos originais (copywriting)
**Vitória:** `CONGRATULATIONS // MISSION COMPLETE` — `Mais um round vencido. O progresso ficou registrado.`  
**Retomada:** `O plano não acabou. Ajuste a rota e volte quando puder.`  
**Treino:** `O próximo passo não precisa ser épico. Precisa ser possível.`  
**Guitarra:** `Um riff por vez. Precisão antes de velocidade.`  
**Refeições:** `Organização primeiro. Consistência depois.`  
**Slogan secundário:** `Missões pequenas. Mudanças gigantes.`

---
**TupiniPlanner & Motivation App — Signed by Leandro Junior.**
