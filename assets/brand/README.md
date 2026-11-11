# Marca provisória
O componente Brand usa `>_` e um broto vetorial ORIGINAL como placeholder substituível; não é a logo oficial da Tupinicode. Nenhum arquivo do manual ou logo oficial foi fornecido. Para substituir: adicione o asset autorizado nesta pasta e altere Brand em src/components/ui.tsx preservando acessibilidade e proporções.

## Ícone, splash e notificação
`assets/images/` contém o ícone do app, as camadas do ícone adaptativo Android (fundo, frente e monocromático para ícones temáticos), o splash e o ícone de notificação. Todos são gerados a partir do mesmo desenho original (prompt `>_` com broto) por `node tools/make-brand-assets.mjs`, que exige `rsvg-convert`. Edite o script e rode de novo para atualizar; os SVGs ficam ao lado dos PNGs como fonte.

As quatro reações vetoriais em src/components/ReactionModal.tsx são desenhos originais por código para este projeto, sem mídia de terceiros ou referência a atores. Fontes Inter e JetBrains Mono são distribuídas pelos respectivos pacotes @expo-google-fonts (SIL Open Font License); ícones Ionicons, MIT. Nenhum asset remoto é carregado em execução.
