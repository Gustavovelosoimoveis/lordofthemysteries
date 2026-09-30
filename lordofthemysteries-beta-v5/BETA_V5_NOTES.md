# Beta 0.5 — Director's Cut

## Novidades desta consolidação

- Projeto completo consolidado em um único pacote.
- Diretor dramático determinístico, serializável e compatível com saves antigos.
- Objetivo imediato, melhor fio e stakes apresentados pelo `StoryCompass`.
- Sistema de promessa/payoff para pistas, pessoas, objetos e crossovers.
- Detecção de estagnação e mudança de beat narrativo.
- Curva de tensão com respiro após picos importantes.
- Progressão de atos por marcos narrativos em vez de `turn / 4`.
- Orçamento visual de eventos de facção para reduzir ruído.
- Versão do projeto: `0.5.0-beta.1`.

## Compatibilidade

Saves V2/V3/V4 continuam carregando porque `dramaticDirectorState` é opcional. No primeiro turno local após carregar um save antigo, o runtime inicializa o diretor a partir do estado já existente.
