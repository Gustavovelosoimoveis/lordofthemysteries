# Validação — Beta 0.5 Director's Cut

Executada antes da consolidação do ZIP.

## Passou

- Type-check isolado dos módulos centrais do Motor Local, mundo vivo, shared world, Dramatic Director e runtime.
- Transpilação sintática de todos os 36 arquivos `.ts/.tsx` de `src/` sem erro de sintaxe.
- 26/26 inícios continuam alcançáveis em amostragem de seeds.
- Mesma `campaignSeed` com formações terrestres diferentes escolhe o mesmo início/corpo em Loen.
- Mesma seed + mesmas ações reproduz a mesma sequência de fase/evidência/beat/urgência/eventos.
- Motor reporta 37 finais, 19 intenções, 41 eventos intermediários, 10 agendas, 24 links de crossover e 26 threads conectadas.
- Diretor dramático inicializa em saves sem estado V5 e persiste a partir do primeiro turno.

## Observação do ambiente

A instalação completa de `node_modules` no container de validação excedeu o tempo de transporte disponível; por isso o `npm run build:offline` final deve ser executado no Codespace/ambiente de destino. O código central foi compilado com TypeScript isoladamente e as simulações foram executadas a partir do JavaScript compilado.
