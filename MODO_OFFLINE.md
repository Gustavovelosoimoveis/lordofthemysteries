# Motor Local — resumo da implementação

## O que foi adicionado

- Seleção entre **Motor Local** e **Motor com IA** na criação do investigador.
- Motor Local sem chamadas de geração, sem API key e sem dependência de resposta externa durante a partida.
- **26 prólogos locais** com cenários, objetos, NPCs, ameaças, pistas e locais de progressão próprios.
- **30 finais condicionais**, definidos pelo histórico acumulado da partida.
- **19 famílias de intenção** para interpretar texto livre.
- Interpretação de ação principal + ação secundária, alvo, objeto, fala direta, promessa, cautela, agressividade, empatia e engano.
- Ações compostas alteram o estado de jogo de forma concreta; a segunda intenção não é apenas texto narrativo.
- Resolução baseada nos cinco atributos da ficha, dificuldade da cena, pressão, especificidade da ação e variação determinística por partida.
- Memória local persistente de NPCs, promessas, mentiras, pistas, segredos, itens, sanidade e progresso.
- Progressão em quatro fases investigativas, com novos NPCs, revelações e escalada de pressão.
- Exatamente **3 sugestões de ação por turno**, preservando o padrão original da interface.
- Passagem de horário com **Lua Carmesim à noite/madrugada** e iluminação industrial/neblina durante o dia.
- Fim de partida bloqueia novas ações e registra o desfecho atingido.
- Save do Motor Local armazenado junto ao diário (`ledger.offlineState`).

## Execução totalmente local do frontend

```bash
npm install
npm run dev:offline
```

Para gerar apenas a versão estática do frontend:

```bash
npm run build:offline
```

O modo tradicional com servidor/IA permanece disponível em `npm run dev`.

## Validação feita nesta versão

- Checagem sintática de todos os arquivos TypeScript/TSX do projeto: 28 arquivos, sem erro de sintaxe.
- Checagem de tipos isolada do `offlineEngine.ts` e `types.ts`: aprovada.
- Simulação do motor local confirmando 26 prólogos alcançáveis na amostragem.
- Simulação de ação composta confirmando intenção principal + secundária e seus efeitos persistentes.
- Simulação de campanha até um final condicional.
- Verificação de três sugestões por turno no prólogo e durante a campanha.

> Observação: a instalação completa das dependências via `npm ci` não terminou dentro do limite do ambiente usado para empacotamento; por isso o `npm run build` completo não foi usado como critério final aqui. O núcleo local foi compilado e executado isoladamente nos testes acima.
