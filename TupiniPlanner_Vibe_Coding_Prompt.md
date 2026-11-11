# MASTER PROMPT — TUPINIPLANNER
**Copie este prompt para Cursor, Claude Code, OpenCode ou outro agente de programação capaz de criar arquivos e executar comandos.** O PRD complementar é `TupiniPlanner_PRD_v1.md`.

Você é um engenheiro sênior React Native/Expo, designer de produto mobile e arquiteto de aplicações offline-first. **Crie de fato um aplicativo funcional**, com código executável, estrutura organizada, componentes reais, testes básicos e instruções de execução. Não entregue apenas mockups, wireframes, textos ou pseudocódigo.

## Missão
Construir **TupiniPlanner & Motivation App**, assinatura visível **Signed by Leandro Junior**, tagline **Train. Eat. Practice. Evolve.** Um planner gamificado pessoal para calistenia/caminhadas, organização alimentar, estudo de guitarra e progresso corporal. Clean, acolhedor, cinemático, com personalidade terminal/arcade anos 80, otimizado para Android e potencial APK via EAS Build.

## Fonte da verdade
Se `TupiniPlanner_PRD_v1.md` estiver disponível no workspace, leia-o e siga requisitos, dados, regras, fases e critérios de aceite. Se o guia oficial `Tupinicode_Design_Guide_v6.pdf` ou logo oficial estiver disponível, use a arte ORIGINAL, sem redesenhá-la de memória. Caso não esteja, use **logo provisória claramente marcada** (`>_` + broto minimalista) e deixe `assets/brand/README.md` explicando como substituí-la. Jamais afirmar que a logo provisória é a oficial.

## Stack obrigatória
- Expo + React Native + TypeScript (strict), Expo Router para navegação, Android-first.
- SQLite local via `expo-sqlite`, migrações idempotentes/versionadas; repositórios/serviços isolados da UI.
- React Native Reanimated (se compatível com versão de Expo instalada), `react-native-svg` para gráficos leves, `expo-haptics` opcional e `expo-linear-gradient` em ocasiões especiais.
- Biblioteca de ícones Expo/compatível, com preferência por line icons consistentes.
- Estado previsível (React hooks + Context, Zustand somente se justificado). Não exigir login, API, servidor ou acesso à internet.
- Usar versões compatíveis com o SDK instalado; checar a documentação dos pacotes reais e `npx expo install` quando cabível.
- Não gerar dependências fantasmas, imports inexistentes ou telas falsas.

## Tokens da marca — aplicar EXATAMENTE
`primary #00FF6A`, `secondary #00C653`, `forest #0D3B2E`, `background #071A14`, `accent #FFB347`, `ivory #F5F7EF`.
Fonte legível para UI: Inter/Poppins; mono JetBrains Mono/Fira Code em detalhes; display pixel/arcade somente em vitórias e títulos especiais. Não usar neon massivamente. Criar `src/theme/tokens.ts` e componentes `AppText`, `AppCard`, `MissionRow`, `ProgressRing`, `RetroBadge`, `SectionHeader`, `EmptyState`, `ReactionModal`.

## Telas e navegação
Barra inferior: **Hoje**, **Missões**, **Evolução**, **Guitarra**, **Perfil**. Tela de detalhe para Movimento e Alimentação; tela Motivation Center acessível por troféu.

### Hoje
Data local, saudação, frase original rotativa estável no dia, progresso de missões, próximo compromisso, três cards `Movimento`, `Alimentação`, `Guitarra`, botão `VER MISSÕES` e breve resumo. Tela cheia com conteúdo real, estados vazios e loading curto.

### Missões
Listar ocorrências do dia agrupadas por categoria/horário. Marcar concluída, desfazer, `Não rolou hoje`, escrever nota/motivo, adiar, criar/editar tarefa, alterar recorrência. Persistência imediata e progresso atualizado por observação de dados.

### Movimento
Iniciar com sugestões editáveis de duas sessões leves de calistenia por semana e três caminhadas de 15–20 min. Exibir flexão na parede/inclinada, agachamento até cadeira, remada com faixa segura e bird-dog, com opção de séries/repetições, timer opcional e esforço percebido. Segurança e adaptação acima de metas agressivas.

### Alimentação
Usar refeições personalizáveis. Sem contagem de calorias obrigatória, sem julgamento de alimentos, sem metas nutricionais inventadas. Registro `feito`, `adiado`, `não fiz`, horário, composição livre e nota. Horários-padrão apenas como exemplos editáveis.

### Guitarra
Timer de sessão com pause/resume, sugestão de 35 min em 5 aquecimento + 10 técnica + 15 repertório + 5 prática livre; registrar técnica, repertório, BPM opcional, notas; listar histórico e metas semanais.

### Evolução
Baseline inicial SUGERIDA (não obrigatória): 10/11/2026, 96,9 kg, 170 cm, 37% gordura estimada, 61 kg massa livre de gordura estimada; meta inicial editável 92,1 kg. Gráfico real de peso (sem pontos fictícios), cintura opcional, resumos de adesão, exercícios e guitarra. Mostrar discretamente que bioimpedância é estimativa.

### Perfil
Editar dados, metas e frequência; controles de animação/reduzir movimento, som, vibração; exportar/importar JSON de backup com validação; limpar dados com confirmação; créditos da marca e assinatura.

## Gamificação e reação cinematográfica
- XP configuráveis: calistenia 30, caminhada 20, rotina de refeições 15, guitarra 20, revisão semanal 15; bônus de dia completado 20 (uma única vez). Registrar `XPEvent` com chave única por origem; sem duplicação em rechecks. `skipped` nunca subtrai XP.
- Streaks calculados por dias planejados; dias de descanso não quebram sequência. Adicionar `retomada` como conquista.
- Badges desbloqueáveis (Primeiro Passo, 3 Caminhadas, Primeira Semana, Cordas em Chamas, Voltou ao Jogo, Quatro Semanas).
- **Ao concluir marco:** modal/reaction overlay com `CONGRATULATIONS`, tratamento typográfico arcade 80s, mini confete retrô não estroboscópico, animação curta, uma frase original, botão `CONTINUAR`.
- **Ao marcar falha:** expressão séria leve de um personagem original, frase motivacional não humilhante, input `O que aconteceu?`, CTA `AJUSTAR MISSÃO` ou `ENCERRAR POR HOJE`.
- Criar 4 personagens/arquétipos originais de ação 80s sem semelhança específica a pessoas famosas, vozes ou cenas de cinema. Para o protótipo, implementar animações vetoriais ou placeholder de reação ilustrada SEM importar GIFs Stallone da internet. Usar assets GIF/WebP somente se disponíveis no projeto e licenciados. Cada badge deve selecionar reação diferente deterministicamente.
- Frases originais, sem atribuição falsa a Rocky ou filmes. Ex.: `O próximo passo não precisa ser épico. Precisa ser possível.`
- Reações acessíveis e desativáveis.

## Modelagem/persistência
Implementar tabelas e tipos equivalentes a `UserProfile`, `HealthBaseline`, `Goal`, `TaskTemplate`, `TaskOccurrence`, `WorkoutSession`, `MealLog`, `GuitarSession`, `BodyMeasurement`, `XPEvent`, `BadgeUnlock`, `DailyReflection`, `AppSettings`. Usar UUIDs, índices em data/status/template, chaves únicas para desbloqueio/XP, transações, migração de esquema, separação de datas locais e timestamps UTC. Não duplicar tasks ao relançar app ou atravessar meia-noite. Dados iniciais editáveis, sem horários/rotinas fingidos como fato.

## UX obrigatório
- Mobile-first 320–430 px, safe area, bottom tab sem sobreposição de teclado, boa rolagem.
- Touch targets >= 44 px; leitor de tela; contraste; fontes escaláveis.
- Redução de movimento respeitada (sem confete obrigatório), sem flashing rápido.
- Empty states com CTA útil e linguagem leve.
- Offline real, formulário validado e feedback de erro compreensível.
- Nenhum dado de saúde enviado à rede; exportação manual.

## Plano de execução — VOCÊ DEVE IMPLEMENTAR, NÃO SÓ DESCREVER
1. Inspecione o diretório e identifique se existe projeto. Se vazio, crie Expo TS + Router.
2. Configure tema, fontes substituíveis, assets e layout shell. Crie telas com navegação real.
3. Implemente SQLite, migrações, seed e hooks de consultas/mutações.
4. Implemente planner diário e CRUD completo, conclusão, pulo com nota, adiamento, recorrência e XP transacional.
5. Implemente alimentação, movimento, guitarra e acompanhamento corporal com registros persistentes.
6. Implemente badges, reações originais e modal de vitória. Crie estados vazios e reduções de movimento.
7. Implemente export/import JSON, tratamento de erro e settings.
8. Escreva testes para recorrência, XP idempotente, descanso/streak, peso e importação (ou ao menos teste isolado das funções de domínio).
9. Rode typecheck, lint e testes. Corrija erros. Dê instruções `npm install`, `npx expo start`, execução Android, e configuração `eas build -p android --profile preview` para APK (se configurada). Não afirme ter gerado APK sem de fato gerar.

## Qualidade do projeto
Arquitetura clara: `app/` rotas, `src/components/`, `src/features/`, `src/db/`, `src/domain/`, `src/theme/`, `src/assets/`, `src/utils/`. Evite componentes gigantes. Componentes reutilizáveis e funções testáveis. Código de produção, não um mock que reinicia estado. Priorize finalização funcional de MVP-0/MVP-1 sobre acrescentar features vazias. Se faltar tempo/contexto, implemente o núcleo completamente e registre TODOs específicos no README.

## Definição de pronto
- Posso abrir no Expo e navegar pelas 5 tabs.
- Posso concluir uma tarefa, matar/reabrir o app e vê-la concluída.
- Posso marcar falha, registrar por quê, reprogramar e ver a nota.
- XP não duplica; streak não pune descanso.
- Posso registrar treino, refeição, guitarra e peso, e vê-los na evolução.
- Recompensas mostram `CONGRATULATIONS` estilizado e reações originais variadas.
- Uso do verde/terminal/broto claramente remete à Tupinicode; assinatura presente.
- Funciona offline e cabe numa tela Android pequena.

**Comece agora criando e executando o projeto. Não me devolva apenas uma descrição do que faria.**
