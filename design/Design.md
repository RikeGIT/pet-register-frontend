# Design — Resumo das telas e componentes

Este documento resume o design implementado até o momento no projeto **Adotapatos**. Contém visão geral das telas, componentes reutilizáveis, paleta de cores, diretrizes de espaçamento e observações de interação e acessibilidade.

**Visão Geral**

- Projeto: Adotapatos
- Pasta de referência: `src/` (componentes e páginas)

**Páginas / Telas**

- Home: tela inicial com listagem/visão geral de animais.
- Dashboard: painel com informações do usuário e atalhos.
- Login: formulário de autenticação (email/senha).
- Register: formulário de cadastro de usuário.
- MeusAnimais: listagem dos animais do usuário.
- MeusAnimalDetail: detalhe de um animal pertencente ao usuário.
- AnimalDetail: detalhe público do animal (visualização individual).
- RegisterAnimal: formulário para cadastro de novo animal.
- SolicitacaoAtendimento: fluxo de solicitação de atendimento para um animal.

**Componentes Reutilizáveis**

- `Navbar.jsx`: barra de navegação principal com links e ações de usuário.
- `AnimalCard.jsx`: cartão que representa um animal em listagens (imagem, nome, informações resumidas).
- `PawLoader.jsx`: indicador de carregamento personalizado com ícone de pata.
- `ProtectedRoute.jsx`: wrapper de rota que protege rotas privadas.

**Paleta de cores**
Baseada em `design/palette.json` (gerado a partir de arquivos CSS em `src`):

- Primária
  - Accent: #1f5d4d
  - Accent Hover: #18483d
  - Accent Soft: rgba(31,93,77,0.14)
- Background
  - App Background: #f6efe3
  - Surface (semi-transparente): rgba(255,255,255,0.9)
  - Surface Solid: #ffffff
- Textos
  - Primary: #18241d
  - Secondary: #607164
- Danger
  - Default: #b42318
  - Soft: #fff1f1
- Borders
  - Default: #d8ccb8
- Suporte / Tons adicionais
  - Cream: #fbf8f1, CreamAlt: #fbf7ef, CreamLight: #fbfcfe
  - Gold: #8c6a32, PaleGold: #f5dfbc
  - Pastel1: #d8cce7, Pastel2: #c7d7e1
  - Gray1: #7c8896, Gray2: #93a1af
  - PinkLight: #ffd2d2
  - GreenLightBg: #ecfdf3
  - GreenDark1: #027a48, GreenDark2: #0f7a36
  - GreenBorder1: #abefc6, GreenBorder2: #bfeacb
  - White: #ffffff

**Tipografia**

- As fontes não estão explicitamente especificadas no repositório explorado; o CSS padrão do projeto (`src/index.css`) controla tamanho, peso e escala. Recomenda-se usar uma família de sans-serif legível (ex.: Inter, system-ui) para títulos e texto.

**Diretrizes de Layout & Espaçamento**

- Grid: as listagens de animais usam cartões (`AnimalCard`) em uma grade responsiva.
- Espaçamento: use múltiplos de 8px para margens e paddings (ex.: 8, 16, 24).
- Containers: superfícies (cards, modais) usam `surface` (#ffffff / rgba para leve translucidez) sobre `appBg` (#f6efe3).

**Interações e Estados**

- Botões primários: fundo `accent` (#1f5d4d) e hover `accentHover` (#18483d). Texto em branco.
- Estados de erro: usar `danger.default` (#b42318) para mensagens e bordas de validação.
- Carregamento: usar `PawLoader` para feedback visual durante requisições assíncronas.

**Acessibilidade**

- Contraste: garantir contraste suficiente entre `text.primary` (#18241d) e `appBg`/`surface` para legibilidade.
- Foco: elementos interativos devem ter indicador de foco visível (borda com `borders.default` ou outline acessível).
- Texto alternativo: imagens de animais em `AnimalCard` e detalhes devem ter `alt` descritivo.

**Ativos e Imagens**

- Todas as imagens usadas por componentes estão na pasta `src/assets/`.

**Notas de implementação**

- Rotas e proteção: `routes/AppRoutes.jsx` e `routes/ProtectedRoute.jsx` controlam acesso às telas privadas.
- API: integrações em `src/api/` (`petApi.js`, `portalApi.js`, `axios.js`). Considere incluir exemplos de chamadas no guia de design dev.

**Próximos passos sugeridos**

- Revisar e padronizar tipografia no `index.css` e documentar aqui (familia, pesos, tamanhos).
- Adicionar exemplos visuais (capturas de tela ou componentes Storybook) para cada `AnimalCard` e telas principais.
- Incluir tokens de espaçamento e componentes de sistema (botões, inputs, formulários) com classes/variáveis.

---

Gerado em 2026-05-27 a partir dos arquivos de componente e da paleta atual.
