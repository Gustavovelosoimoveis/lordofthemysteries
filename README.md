# Lord of the Mysteries — RPG Narrativo

RPG investigativo em primeira pessoa inspirado no universo de **Lord of the Mysteries**, com dois motores narrativos intercambiáveis:

- **Motor Local (padrão):** funciona sem IA, sem API key e sem chamadas externas de geração de texto.
- **Motor com IA:** preserva o motor Gemini já existente para quem quiser geração totalmente aberta.

## Motor Local

O Motor Local não é uma árvore simples de botões. O jogador continua escrevendo ações livres, por exemplo:

> "Finjo que vou embora, espero ele relaxar e sigo o homem à distância."

A frase é analisada localmente e convertida em estado de jogo considerando:

- intenção principal e intenção secundária;
- ações compostas em várias etapas;
- alvo/NPC mencionado;
- item citado;
- tom cauteloso, agressivo, empático ou enganoso;
- Vigor, Destreza, Intelecto, Percepção e Carisma;
- pressão atual da cena;
- pistas e evidências acumuladas;
- confiança dos NPCs;
- mentiras e promessas registradas;
- violência, misericórdia, legalidade e curiosidade;
- exposição gradual ao oculto e sanidade;
- memória persistente do diário.

A versão atual inclui **26 prólogos locais**, **30 finais condicionais** e **19 famílias de intenção**. Os finais são consequência do histórico da partida, e não apenas de uma escolha final. Cada turno mantém exatamente **3 ações sugeridas**, mas o campo continua aceitando ações livres e compostas.

### Exemplos de ações reconhecidas

- investigar ou examinar uma pista;
- observar alguém ou o ambiente;
- conversar, interrogar ou persuadir;
- mentir, blefar ou se disfarçar;
- ameaçar ou lutar;
- proteger uma testemunha;
- seguir alguém ou agir furtivamente;
- roubar ou recuperar um objeto;
- ler/decifrar documentos;
- usar itens do inventário;
- viajar/entrar/sair de locais;
- esperar e vigiar;
- procurar polícia, Igreja ou outra instituição;
- fugir;
- tentar uma ação sobrenatural sem conhecimento suficiente — o motor respeita a regra de ignorância mundana e aplica riscos em vez de conceder magia gratuita.

## Rodar localmente sem API key

Pré-requisito: Node.js.

```bash
npm install
npm run dev:offline
```

Esse comando inicia apenas o frontend do jogo: não sobe o servidor de IA e não exige `GEMINI_API_KEY`. Abra o jogo e deixe **Motor Local · Sem API** selecionado na criação do investigador.

Para gerar uma versão estática do frontend local:

```bash
npm run build:offline
```

O comando tradicional `npm run dev` continua disponível para quem quiser manter também as rotas do Motor com IA.

## Usar o modo com IA

Crie um arquivo `.env` ou `.env.local` e defina:

```bash
GEMINI_API_KEY="sua-chave"
```

Depois escolha **Motor com IA** na criação do investigador.

## Saves e compatibilidade

Histórico, ficha, sanidade, inventário, NPCs e diário continuam salvos no `localStorage`. O modo escolhido também é persistido. Saves anteriores à inclusão do Motor Local continuam sendo tratados como partidas do motor de IA para evitar mudança inesperada de comportamento.

## Arquitetura do Motor Local

O núcleo está em `src/utils/offlineEngine.ts`.

Ele contém quatro camadas:

1. **Interpretação:** normalização e classificação de texto livre.
2. **Resolução:** atributo + risco + contexto + variação determinística da partida.
3. **Memória:** atualização do `LedgerData` com NPCs, pistas, segredos, mentiras, sanidade e estado narrativo.
4. **Direção dramática:** fases da investigação, pressão, rotas de comportamento e seleção de finais elegíveis.

O estado do motor fica serializado dentro do próprio diário (`ledger.offlineState`), portanto recarregar a página não reinicia a lógica da campanha.
