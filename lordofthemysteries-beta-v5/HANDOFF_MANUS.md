# Lord of the Mysteries — Beta 0.5 Director's Cut

Este ZIP é **o projeto consolidado completo**, não um patch incremental. Ele já incorpora as evoluções que antes estavam divididas em V2, V3, V3.1, V3.2, V3.3, V4.0 e V4.1, mais a camada V5 de direção dramática.

## Princípio central

O jogo deve funcionar de duas formas:

1. **Motor Local** — 100% offline, sem API key e sem IA externa.
2. **Motor IA** — opcional, preservado para quem quiser usar o backend existente.

A formação do jogador antes da transmigração **não determina sua profissão/corpo em Loen**. A `campaignSeed` define a crônica/corpo inicial; a formação anterior altera conhecimentos, leituras, bônus e possibilidades de abordagem.

## O que já existe

- 26 inícios locais distintos.
- 37 finais, incluindo finais de morte contextual.
- Parser local de ações livres e compostas.
- 19 famílias de intenção.
- Relações por NPC, sem barra global de "bom/mau".
- Ferimentos, imprudência, risco, exposição oculta, pressão e consequências persistentes.
- Ramificações que abrem e fecham capítulos.
- NPCs com agendas próprias e ações fora de cena.
- Eventos intermediários determinísticos por seed.
- `campaignSeed` separada de `worldSeed` para preparar multiplayer/online.
- 26 linhas de história vivendo no mesmo universo com sinais de crossover.
- Mundo persistente com relógio, clima, autoridades, igreja, imprensa, submundo e rede oculta.
- Scene Director visual e cenário cinematográfico React.
- Fundos fotográficos com fallback fotográfico, nunca os antigos quadrados SVG.

## V5 — a otimização que faltava

O problema percebido não era ausência de sistemas, e sim ausência de **direção dramática**. Muitos sistemas bons sem ritmo podem parecer um protótipo sofisticado.

A V5 adiciona `src/game/dramaticDirector.ts`.

O diretor acompanha:

- tensão;
- momentum;
- estagnação;
- mudança de ato;
- pistas e segredos descobertos;
- mudanças de NPC fora de cena;
- ferimentos e pressão;
- cruzamentos com outras histórias;
- promessas narrativas ainda sem payoff.

Ele produz uma curva de cena com beats como:

- descoberta;
- payoff;
- reversão;
- pressão;
- relacionamento;
- perseguição;
- silêncio;
- encruzilhada.

O objetivo não é escrever a história no lugar do jogador. É impedir que o jogo fique dramaticamente plano.

### Promessa e payoff

Quando uma pista, pessoa, objeto ou pergunta é apresentada como importante, o diretor registra uma `NarrativePromise`. A campanha tenta fazer esse elemento voltar de forma significativa. Se a oportunidade é ignorada por tempo demais, a promessa pode ser marcada como perdida, permitindo consequências em vez de simplesmente esquecer o detalhe.

### Ritmo por conquista, não por contador

Antes, o ato narrativo avançava essencialmente a cada quatro turnos.

Agora `offlineEngine.ts` usa marcos:

- evidência;
- confiança/ruptura;
- eventos;
- ramificações;
- pressão;
- exposição ao oculto;
- e apenas um fallback temporal para o mundo não congelar se o jogador procrastinar.

Ou seja: investigar bem pode acelerar uma revelação. Enrolar demais também faz o mundo avançar, mas contra o jogador.

### Fio da Crônica

`src/components/StoryCompass.tsx` mostra de maneira diegética:

- o objetivo imediato;
- o melhor fio conhecido;
- o que está em risco;
- o que mudou no último turno;
- um fio narrativo ainda sem resposta.

Ele não mostra solução nem "quest marker" literal.

### Menos ruído de eventos

O mundo ainda simula todas as facções, mas a V5 limita quantos movimentos de facção chegam à superfície por turno. Assim o jogo não vira um feed de notificações concorrentes. Em pressão extrema, mais de um eco pode aparecer.

## Arquitetura atual

### Motor narrativo

- `src/utils/offlineEngine.ts`
- `src/data/offlineNarrative.ts`
- `src/data/offlineBranches.ts`

### Runtime

- `src/game/gameRuntime.ts`

Coordena todos os subsistemas sem acoplar regras ao React.

### Mundo vivo

- `src/game/worldSimulation.ts`
- `src/game/sharedStoryWorld.ts`

### Direção dramática

- `src/game/dramaticDirector.ts`

### Direção visual

- `src/game/sceneDirector.ts`
- `src/components/CinematicStage.tsx`
- `src/components/StoryCompass.tsx`

### Interface

- React/TypeScript em `src/`.

## Preparação para online

Já há distinção entre:

- `campaignSeed`: história do personagem;
- `worldSeed`: mundo compartilhado;
- `characterId`: identidade persistente;
- `SharedStorySignal`: acontecimento que pode vir de outra crônica/personagem.

Um futuro servidor pode persistir sinais por `worldSeed`, enviar via WebSocket/SSE e o runtime consegue fazer merge sem reescrever o motor local.

## Onde mexer a seguir sem quebrar a base

Prioridades recomendadas:

1. Renderer Phaser/Pixi sobre o `SceneDirector`, sem mover regras para o canvas.
2. Quadro investigativo manual com hipóteses certas e erradas.
3. NPCs visuais por estado emocional, sem expor stats ocultos.
4. Persistência online de `SharedStorySignal` e eventos do mundo.
5. Expansão de assets específicos para docas, biblioteca, taverna, hospital, tribunal, mina, Trier, Bayam e Pritz.
6. Testes automatizados de campanhas longas e invariantes narrativas.

## Regra de ouro

Nunca transformar a formação da Terra em destino social em Loen. Nunca transformar moralidade em uma barra global. Nunca salvar o jogador de uma decisão evidentemente fatal depois de o mundo ter dado informação suficiente para ele compreender o risco.
