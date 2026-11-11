# TupiniPlanner

**Train. Eat. Practice. Evolve. — Signed by Leandro Junior**

Aplicativo pessoal Android-first em Expo SDK 55 / React Native / TypeScript, baseado nos dois documentos desta pasta. Dados persistidos em SQLite; sem backend, conta, analytics ou chamadas de rede nas funcionalidades do aplicativo.

## Executar

Requer Node **22.18+** (testes usam remoção nativa de tipos e `node:sqlite`) e npm.

```bash
npm install
npx expo install --check
npx expo start
```

No Android, abra o projeto com Expo Go **compatível com SDK 55** ou com um development build compatível. `npm run android` abre o emulador/aparelho configurado. O ambiente de desenvolvimento precisa acessar o Metro; o aplicativo Android empacotado contém JS, fontes, reações e banco local e não exige essa conexão.

Se as dependências precisarem ser alinhadas ao SDK:

```bash
npx expo install --fix
```

### Preview web

```bash
npm run web
# Ou um bundle de produção:
npm run export:web
npm run preview
```

O preview de produção abre em `http://127.0.0.1:4173`. `metro.config.js` e `tools/serve-preview.mjs` definem os cabeçalhos COOP/COEP exigidos pelo SQLite WASM. Outro servidor deve definir `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: require-corp`, servir `.wasm` como `application/wasm` e encaminhar rotas do app para `index.html`.

A web é um preview: o banco é local ao navegador e à origem, mas não há service worker para recarregar a página sem servidor. O funcionamento offline completo ao reabrir é o alvo do aplicativo Android empacotado. Limpar dados do navegador remove o banco web; navegação privada pode limitar a persistência.

### APK

`eas.json` já contém `preview` com `android.buildType: apk` e `production` com App Bundle. Depois de configurar sua conta/projeto EAS:

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build -p android --profile preview
```

O build EAS é remoto e requer conexão/conta. **Nenhum APK foi gerado nesta entrega.** `npm run export:android` valida e gera o bundle JS/Hermes, não um APK. O identificador configurado é `com.tupinicode.tupiniplanner`; ajuste antes de distribuir. Backup automático do Android está desativado para manter a exportação de dados explícita.

## O que está implementado

- Onboarding com consentimento local, campos pessoais opcionais, baseline e seed somente por adesão explícita.
- Cinco abas: Hoje, Missões, Evolução, Guitarra e Perfil; detalhes de Movimento, Alimentação e Motivation Center.
- Agenda por data, tarefas únicas/recorrentes, filtros, criação, edição, pausa, exclusão do plano e reordenação dentro dos agrupamentos. Histórico preservado.
- Concluir/desfazer, pular com motivo/nota, reprogramar para outra data e reflexão diária.
- XP e seis badges transacionais; reações vetoriais originais, título pixelado e confete discreto; controles de reação, redução de movimento, vibração, métricas e sequência.
- Registros reais de caminhada/calistenia (duração, esforço, séries/repetições), alimentação (status, composição, fome, observações), guitarra e medições editáveis de peso/cintura.
- Timer persistente de guitarra, iniciar/pausar/retomar, duração e blocos editáveis, registro manual, técnica/repertório/BPM e meta semanal.
- Tendência por médias semanais de medidas reais, histórico, distância relativa à meta e adesão por categoria.
- Exportação de JSON por arquivo, importação com validação e confirmação antes da substituição, apagamento mediante digitação de `APAGAR`.
- Fontes embarcadas Inter/JetBrains Mono, paleta do PRD e placeholder da marca identificado em `assets/brand/README.md`.

## Decisões de domínio

Datas de agenda são `YYYY-MM-DD` no calendário local; instantes de conclusão, consentimento e XP são ISO UTC. Mudanças de fuso/horário de verão não reescrevem snapshots existentes. Ao retornar ao app e a cada 15 segundos, a data local é verificada. Tarefas novas são materializadas por `(templateId, localDate)` único. Dias desde o último uso são preenchidos até 366 dias para limitar o trabalho de recuperação; dados antigos já existentes nunca são apagados.

Editar um plano altera apenas pendências de hoje em diante. Conclusões, pulos e registros anteriores mantêm título/horário/XP originais. Excluir um plano preserva o histórico e seus eventos de XP. A ordenação é categoria → horário → ordem manual.

XP é uma trilha histórica: desfazer ou pular não retira XP já conquistado; remarcar não repete o evento. Reagendamentos preservam a origem da recompensa. Bônus de dia: +20 uma vez por data, apenas com pelo menos uma tarefa elegível e todas concluídas. Tarefas adiadas deixam o denominador do dia; pulos permanecem como compromissos não concluídos. Registrar atividade/refeição/guitarra só conclui a missão e gera XP se o usuário selecionar explicitamente a missão correspondente.

A sequência conta dias planejados totalmente concluídos; descanso é ignorado e o dia atual em aberto não encerra a sequência antes de terminar. Badges são permanentes e não reabrem o modal automaticamente após alternância de status. É possível rever uma conquista na biblioteca. O timer usa timestamps, continua com a tela bloqueada e limita o registro automático ao tempo planejado; pause quando não estiver praticando. A sessão pertence à data em que o timer começou.

## Arquitetura

- `app/`: rotas Expo Router e telas.
- `src/components/`: componentes de interface, gráficos e reações originais.
- `src/features/`: contexto/fila de mutações, onboarding e editor de planos.
- `src/domain/`: modelos, agenda, XP, badges, validação de backup, seed e timer; sem React/Expo.
- `src/db/`: migração versionada, adapter Expo SQLite e repositório transacional testável.
- `src/theme/`, `src/utils/`: tokens, parsing numérico e arquivos de backup.

Cada entidade conceitual tem uma tabela SQLite com ID e documento JSON tipado. Índices por expressões JSON garantem unicidade de ocorrências, XP e badges; há índices por data/status. A versão do schema usa `PRAGMA user_version`. A fila serializa mutações e grava apenas documentos alterados em uma transação. A UI só publica o novo estado depois do commit; erro preserva o estado anterior. Nenhuma gravação deve contornar o provider.

## Validação

```bash
npm run check
npm run export:web
npm run export:android
```

Executados nesta entrega: TypeScript strict, ESLint, 15 testes de domínio/persistência e exportações Metro web/Android. Os testes incluem recorrência, idempotência de XP/badges, pausa, reagendamento, snapshots históricos, descanso, datas/DST, medidas, médias semanais, timer, importação inválida, migração idempotente, reabertura de um arquivo SQLite real e rollback integral por violação de unicidade.

**Limite de validação:** não houve teste visual ou execução em aparelho/emulador. A sandbox recusou portas locais (`listen EPERM`) e o processo Chromium (`setsockopt: Operation not permitted`). Bundle compilado não equivale a teste de ponta a ponta ou APK instalado.

### Roteiro de aceite em Android

1. Abrir sem fornecer dados pessoais; conferir consentimento e plano sugerido opcional.
2. Criar missão, concluir, desfazer, remarcar e conferir XP; fechar o processo e reabrir.
3. Pular com motivo/nota, adiar, consultar a nova data e editar/pausar a recorrência.
4. Registrar caminhada, refeição, sessão de guitarra e peso/cintura. Conferir histórico e evolução.
5. Pausar/retomar timer, bloquear tela e reabrir; ativar redução de movimento do sistema.
6. Exportar JSON, tentar arquivo inválido, cancelar importação e depois restaurar um backup válido.
7. Testar 320–430 px, fonte ampliada, teclado, TalkBack e modo avião no APK.
8. Apagar dados com confirmação e verificar retorno ao onboarding.

## Pendências específicas

- Sons opcionais: ainda não há reprodução de áudio; o Perfil informa a indisponibilidade, sem um controle fictício.
- MVP-2: notificações locais, backup opcional em nuvem, calendário mensal avançado, gravação de áudio, logo oficial quando fornecida e distribuição/assinatura de release Android.
- Antes de release: cumprir o roteiro visual/acessível acima em aparelhos reais e medir latência de check-in; o alvo de 150 ms ainda não foi aferido.
- Históricos de atividades/refeições/guitarra mostram os 30 registros mais recentes; todos permanecem no banco e no backup. Paginação para históricos extensos é uma melhoria futura.

Referências técnicas utilizadas: [Expo Router — instalação](https://docs.expo.dev/router/installation/) e [SQLite no Expo SDK 55](https://docs.expo.dev/versions/v55.0.0/sdk/sqlite/). Regras de produto e textos são provenientes dos documentos locais; nenhuma prescrição clínica é calculada.
