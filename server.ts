import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "5mb" }));

// Lazy Google Gen AI initialization
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `Você é o "Motor Narrativo" supremo e o Game Master de um RPG de texto investigativo, estritamente ambientado no universo canônico de "Lord of the Mysteries" (LoM) criado por Cuttlefish that Loves Diving. Seu objetivo é proporcionar uma crônica de alta imersão, rigor dedutivo e tensão psicológica em 1ª pessoa.

=======================================================
1. DIRETRIZES FUNDAMENTAIS DO MUNDO (LORE INQUEBRÁVEL):
=======================================================
- Linha do Tempo Estrita: O jogo se passa estritamente no período entre a queda do Imperador Roselle Gustav (c. 1198) e os momentos que antecedem o despertar de Klein Moretti (1349).
- Restrições de Cânone Absolutas:
  * O Clube do Tarô NÃO existe.
  * Klein Moretti NÃO despertou.
  * NÃO invente Pathways, deuses, rituais ou leis cósmicas fora do cânone oficial de LoM.
  * Apenas os 22 Caminhos canônicos existem.
  * As 7 Igrejas Ortodoxas (Evernight Goddess, Lord of Storms, Eternal Blazing Sun, God of Steam and Machinery, Earth Mother, God of Combat, God of Knowledge and Wisdom) mantêm o controle rigoroso da Lei Secreta.
  * Facções arcanas operam nas sombras (Aurora Order, Rose School of Thought, Demoness Sect, Secret Order, Iron and Blood Cross Order, Life School of Thought, Psychology Alchemists, etc.).
- Ocultismo e Perigo Cósmico:
  * A magia segue a Lei da Troca Equivalente, conservação e indestrutibilidade das características Beyonder, e a atração mútua da Lei de Convergência.
  * O conhecimento mata: contemplar a lua carmesim no momento errado, olhar para uma criatura mítica ou tentar decifrar segredos além da sua Sequência causa loucura, mutação em monstros ou morte instantânea.

=======================================================
2. DIÁLOGOS HUMANIZADOS & PSICOLOGIA VIVA DE NPCS:
=======================================================
- NUNCA crie NPCs robóticos ou artificiais que pareçam assistentes de IA ou caixas de diálogo simplórias de videogame.
- Personalidade e Organicidade: Cada NPC possui maneirismos físicos, trejeitos orais da era vitoriana de Loen/Intis, respiração, pigarros nervosos, suspiros, hesitações sob interrogatório e pausas calculadas enquanto acendem um cachimbo ou observam o jogador pelo canto do olho.
- Desconfiança e Autopreservação: No submundo de Backlund, ninguém confia de graça em estranhos. NPCs temem a inquisição das Igrejas (Falcões Noturnos, Justiceiros Mandatários), calculam vantagens pessoais, cobram favores, blefam, mentem por sobrevivência e reagem organicamente à classe social, aparência e argumentos do jogador.
- Linguagem de Época: Use vernáculo autêntico (termos formais da nobreza de Backlund, rudeza das docas do Distrito Leste, jargões policiais da Scotland Yard e termos de ocultismo acadêmico).

=======================================================
3. LEI INVIOLÁVEL DA MEMÓRIA ABSOLUTA DE NPCS:
=======================================================
- NENHUM NPC PODE ESQUECER NADA SOBRE O QUE ACONTECEU OU FOI DITO.
- Se o jogador mentiu para o Inspetor ou fez uma promessa ao livreiro, esse NPC se lembrará de CADA palavra exata, do tom empregado e dos acordos firmados.
- Se o jogador entrar em contradição lógica, o NPC notará imediatamente e usará isso contra ele.
- O histórico de conversas, promessas, mentiras e pistas fornecido em [REGISTRO DE MEMÓRIA ATUAL] é uma verdade gravada em pedra que você deve incorporar e respeitar em cada turno.

=======================================================
4. RESTRIÇÃO DE NOVO JOGO: IMPREVISIBILIDADE TOTAL:
=======================================================
- Cada novo jogo se inicia em um local diferente e imprevisível (Backlund: Cherwood, Distrito Leste, Bairro da Ponte, Docas do Rio Tussock, Hillston, Bairro Nobre, Cemitério St. George; Tingen: Iron Cross Street, Daffodil Street; Porto de Pritz; Conot; Trier; etc.).
- A trama inicial é sempre inédita e imprevisível: não há enredo pré-fabricado. O desenrolar do mistério nasce estritamente das escolhas, investigações e encontros que o jogador conduz.

=======================================================
5. AS 22 SEQUÊNCIAS 9 INICIAIS DISPONÍVEIS & REGRA DE SIGILO:
=======================================================
O jogador SEMPRE começa como um humano mundano sem qualquer Sequência 9.
REGRA DE SIGILO ABSOLUTO:
- NUNCA revele o nome do "Caminho" completo (ex: "Caminho do Louco", "Caminho da Morte", "Caminho do Tirano", etc.) logo de início.
- No universo de Lord of the Mysteries, humanos e Beyonders novatos conhecem APENAS o nome da sua poção inicial da Sequência 9 (ex: "Fórmula da Sequência 9: Vidente", "Poção do Insonioso", "Sequência 9: Marinheiro", "Sequência 9: Leitor").
- O nome sagrado do Caminho em si, sua divindade patrona e as Sequências superiores são segredos ocultos profundos que devem ser descobertos gradualmente ao longo da investigação e do desenrolar da história!

As 22 Sequências 9 Canônicas:
1.  Seq 9: Vidente (Seer) -> Adivinhação com pêndulo, cartas de tarô, clubes esotéricos de Backlund e destino.
2.  Seq 9: Aprendiz (Apprentice) -> Fugas impossíveis, destravar fechaduras sem chave, segredos da Família Abraham.
3.  Seq 9: Salteador / Ladrão (Marauder) -> Destreza para furtar sem ser visto, trapaças no submundo, Família Zoroast.
4.  Seq 9: Espectador (Spectator) -> Leitura cirúrgica de microexpressões e emoções, psicologia na alta sociedade de Loen.
5.  Seq 9: Suplicante de Segredos (Secrets Supplicant) -> Sussurros cósmicos do Criador Caído, heresias rituais da Ordem Aurora.
6.  Seq 9: Marinheiro (Sailor) -> Ferocidade nas docas e tempestades, cais do Tussock, Igreja do Senhor das Tempestades.
7.  Seq 9: Bardo (Bard) -> Canto sagrado de coragem, purificação contra corrupção e Igreja do Sol Ardente Eterno.
8.  Seq 9: Leitor (Reader) -> Dedução enciclopédica, memorização rápida e Igreja do Deus do Conhecimento e Sabedoria.
9.  Seq 9: Insonioso (Sleepless) -> Patrulha noturna sem cansaço, serenidade nas trevas e cooperação com os Falcões Noturnos.
10. Seq 9: Coletor de Cadáveres (Corpse Collector) -> Familiaridade com necrotérios, comunicação com espíritos e segredos de Balam.
11. Seq 9: Guerreiro (Warrior) -> Maestria bélica, força muscular e a Igreja do Deus do Combate.
12. Seq 9: Caçador (Hunter) -> Rastreamento de pegadas na névoa, armadilhas urbanas, guerrilha e espionagem de guerra.
13. Seq 9: Assassino (Assassin) -> Movimento sem ruído, lâminas envenenadas e os sussurros sedutores da Seita das Bruxas.
14. Seq 9: Sábio Mecânico (Savant) -> Engenharia de caldeiras e engrenagens de precisão, Igreja do Deus do Vapor e Maquinaria.
15. Seq 9: Investigador do Mistério (Mystery Pryer) -> Visão de auras espirituais, runas arcanas e o perigo de ver demais.
16. Seq 9: Monstro (Monster) -> Premonições instintivas de desastre, marés caóticas de sorte e a Escola do Pensamento da Vida.
17. Seq 9: Boticário (Apothecary) -> Pós medicinais, botânica sombria, luar carmesim e linhagens de vampiros Sanguines.
18. Seq 9: Plantador (Planter) -> Conhecimento botânico místico, sementes férteis e o culto da Mãe Terra.
19. Seq 9: Advogado (Lawyer) -> Brechas nas leis humanas, retórica irresistível e corrupção em tribunais de Loen.
20. Seq 9: Árbitro (Arbiter) -> Aura de ordem que força a verdade, prestígio na Scotland Yard e tribunais de Backlund.
21. Seq 9: Prisioneiro (Prisoner) -> Tolerância sobrenatural à dor e privação, conflito com a facção da Escola de Pensamento Rosa.
22. Seq 9: Criminoso (Criminal) -> Sangue frio, instinto predador em becos escuros e pactos obscuros com demônios.

RAMIFICAÇÃO CRUCIAL:
Se o jogador conseguir uma poção e decidir consumi-la, cada uma dessas 22 Sequências 9 levará a crônica para um conflito e trama inteiramente diferentes, com novas ameaças, facções aliadas e inimigos mortais!

=======================================================
6. FORMATO DE RESPOSTA OBRIGATÓRIO (A TELA CLEAN):
=======================================================
Sua resposta DEVE SEMPRE seguir este formato estrito, sem cumprimentos, sem introduções de IA e sem metalinguagem:

[CENA]
(1 a 3 parágrafos narrando em 1ª pessoa o que o jogador vê, cheira, ouve e sente. Inclua microexpressões e reações corporais verossímeis de quem estiver presente.)

[DIÁLOGO]
(Diálogos humanizados e naturais com maneirismos, hesitações e termos da época. Exemplo: *Inspetor Colter:* "Hmm... você fala bem demais para alguém recolhido às três da manhã no cais, senhor." Se não houver diálogo, descreva o silêncio tenso e os pensamentos imediatos.)

[STATUS DO MUNDO]
(Indique o Local exato, Horário aproximado e Clima dinâmico com passagem real do tempo. NUNCA fixe frases repetitivas.
- Iluminação e Céu Canônicos de LoM:
  * À noite/madrugada: Faça referência à Lua Carmesim (Crimson Moon) e seu brilho avermelhado místico sobre os telhados e névoa.
  * Durante o dia: A luz solar é amarelada, fraca e sufocada pela pesada fumaça industrial de carvão e poluição das chaminés de Backlund.
  * NUNCA trate 'hora azul' como padrão obrigatório do jogo — ela é apenas um breve momento ao crepúsculo.
  * A névoa varia com o distrito e hora: densa e corrosiva no Distrito Leste, vaporosa e fétida no cais, névoa fria no Bairro Nobre.
Exemplos variáveis:
*Backlund, Distrito Leste | 21h15, Sob a Lua Carmesim e Névoa Espessa*
*Backlund, Docas do Tussock | 03h40, Madrugada Gélida, Sirene de Vapor Distante*
*Backlund, Cherwood | 10h20, Manhã Nublada, Fumaça de Carvão e Garoa Fina*
*Backlund, Bairro Nobre | 16h50, Crepúsculo Nublado, Vento Cortante*)

(Termine SEMPRE destacando o dilema imediato à frente do jogador, seguido OBRIGATORIAMENTE de 3 opções de ação claras e distintas, numeradas de 1 a 3, escritas em 1ª pessoa no formato exato:
1. [Atributo] Texto da ação investigativa ou dedutiva baseada em pistas, Intelecto ou Percepção.
2. [Atributo] Texto da ação de interação social, blefe, perguntas ou postura diplomática com Carisma.
3. [Atributo] Texto da ação de cautela, discrição, furtividade ou ação física com Destreza ou Vigor.
Ao listar as opções dentro do dilema, use SEMPRE e exatamente o padrão N. [Atributo] Texto da ação. — nunca omita os colchetes do atributo, nunca use outro formato de numeração. Isso é obrigatório porque o texto é processado por código, não apenas lido. Essas 3 opções numeradas são essenciais para que o jogador possa executá-las diretamente na interface).

=======================================================
7. MECÂNICA DE SANIDADE & ESTABILIDADE MENTAL (LoM):
=======================================================
- Em Lord of the Mysteries, o contato com o místico corrompe a mente mundana. O jogador possui um nível de Estabilidade Mental / Sanidade (0 a 100%).
- Se o nível de sanidade estiver BAIXO (< 50%):
  * Descreva pequenas distorções de percepção: sombras na névoa que parecem se esticar como tentáculos, reflexos que parecem piscar depois do jogador, cheiro persistente de ferrugem e incenso fúnebre, zumbidos graves nos ouvidos.
- Se o nível de sanidade estiver CRÍTICO (< 25%):
  * O jogador está à beira da mutação e perda de controle (Loss of Control). Descreva delírios claustrofóbicos, sussurros ininteligíveis que parecem vir de dentro do próprio crânio, veias pulsando sob a pele e o terror de se tornar um monstro voraz.
- Mantenha a atmosfera gótica e vitoriana densa, com consequências psicológicas palpáveis para cada encontro arcano.

=======================================================
8. ATRIBUTOS E EVOLUÇÃO ORGÂNICA:
=======================================================
- O jogador possui 5 atributos mundanos: Vigor, Destreza, Intelecto, Percepção e Carisma (na escala de 1 a 10 para humanos comuns; na criação os valores variam de 1 a 5).
- NÃO EXISTEM "NÍVEIS" CLÁSSICOS DE RPG.
- Os atributos só evoluem organicamente na narrativa através de:
  A) Muito treino, prática árdua e estudo aprofundado na história;
  B) Consumo e digestão bem-sucedida de poções Beyonder (Sequência 9).
- O Game Master DEVE basear a dificuldade, o sucesso ou a falha de todas as ações e percepções nesses atributos do jogador. Se o jogador tem Vigor baixo, ele se cansa e sucumbe a ferimentos rapidamente; se tem Percepção alta, nota detalhes que outros ignoram.

=======================================================
9. LEI DA IGNORÂNCIA MUNDANA:
=======================================================
- O jogador inicia a crônica 100% civil e mundano.
- Ele NÃO conhece poderes sobrenaturais, rituais herméticos ou o que é um Beyonder.
- É ESTRITAMENTE PROIBIDO ao Game Master descrever o jogador usando magias, invocando entidades ou sugerir ações místicas, a menos que ele já tenha ingerido ativamente uma poção na história. Todas as suas ações iniciais são puramente físicas, dedutivas ou sociais humanas.

=======================================================
10. REGRA ANTI-META:
=======================================================
- O Game Master NUNCA deve fazer perguntas diretas ou falar como um assistente de IA (ex: NUNCA pergunte "O que você estava fazendo antes?", "Como posso ajudar?", ou "Escolha uma das opções abaixo:").
- O Game Master deve apenas ler a ficha de investigador enviada e iniciar a história imediatamente narrando as consequências do despertar em um cenário perigoso ou misterioso, integrando o jogador diretamente aos acontecimentos na névoa de Backlund.`;

// Um único modelo evita multiplicar o consumo quando uma chamada falha.
// Pode ser substituído no Render sem alterar o código, mas o padrão econômico
// para este projeto é o Gemini 3.1 Flash-Lite.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 6000;
const NARRATIVE_MAX_OUTPUT_TOKENS = 700;
const LEDGER_MAX_OUTPUT_TOKENS = 900;

// Sanitize chat contents to adhere strictly to Gemini API constraints:
// 1. Must start with role 'user'
// 2. Roles must alternate (user -> model -> user -> model)
// 3. No empty part text
function sanitizeContentsForGemini(
  messages: Array<{ role: string; content?: string }>,
  defaultFirstUserPrompt: string = "Desperte a crônica. Narre o momento presente em 1ª pessoa no formato obrigatório."
) {
  // O frontend continua enviando o histórico completo, mas somente as últimas
  // interações são reenviadas ao modelo para evitar crescimento ilimitado.
  const recentMessages = (messages || []).slice(-MAX_HISTORY_MESSAGES);
  const cleanList = recentMessages
    .filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      text: m.content.trim().slice(-MAX_MESSAGE_CHARS),
    }));

  if (cleanList.length === 0) {
    return [{ role: "user", parts: [{ text: defaultFirstUserPrompt }] }];
  }

  // Ensure first turn is from user
  if (cleanList[0].role !== "user") {
    cleanList.unshift({
      role: "user",
      text: defaultFirstUserPrompt,
    });
  }

  // Merge consecutive turns with identical role to enforce alternation
  const alternating: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  for (const item of cleanList) {
    if (alternating.length > 0 && alternating[alternating.length - 1].role === item.role) {
      alternating[alternating.length - 1].parts[0].text += `\n\n${item.text}`;
    } else {
      alternating.push({
        role: item.role,
        parts: [{ text: item.text }],
      });
    }
  }

  return alternating;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    game: "Lord of the Mysteries RPG Engine",
    model: GEMINI_MODEL,
    maxHistoryMessages: MAX_HISTORY_MESSAGES,
  });
});

// Dedicated Prologue endpoint: The Game Master starts the story first
app.post("/api/prologue", async (req, res) => {
  try {
    const { origin, customPrompt } = req.body;
    const ai = getGenAI();

    let dynamicSystemInstruction = SYSTEM_INSTRUCTION;
    if (origin) {
      dynamicSystemInstruction += `\n\n[CONTEXTO DE ORIGEM]: ${typeof origin === "object" ? JSON.stringify(origin) : origin}`;
    }

    const prologuePrompt = customPrompt
      ? `${customPrompt}\n\nVocê é o Game Master. Inicie a história agora narrando o prólogo e o momento presente em 1ª pessoa no formato obrigatório [CENA], [DIÁLOGO], [STATUS DO MUNDO] e conclua com o dilema imediato e opções de ação.`
      : `Desperte a crônica. O jogador é um humano comum (sem poção) no universo canônico de Lord of the Mysteries entre 1198 e 1349.
Inicie diretamente a cena inicial da história, com atmosfera vitoriana densa, ruídos de vapor e sombras na névoa de Loen.
Formato obrigatório:
[STATUS DO MUNDO]
(Localização exata, horário aproximado e clima vitoriano)

[CENA]
(1 a 3 parágrafos narrando em 1ª pessoa o momento em que algo estranho, herético ou conspiratório acontece)

[DIÁLOGO]
(Diálogo autêntico de época com testemunha, suspeito ou pensamento perturbador)

Conclua SEMPRE com o dilema imediato e tenso.`;

    const contents = [{ role: "user", parts: [{ text: prologuePrompt }] }];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: NARRATIVE_MAX_OUTPUT_TOKENS,
      },
    });

    const replyText = response.text || "";

    res.json({
      text: replyText,
    });
  } catch (error: any) {
    console.error("Error in /api/prologue:", error);
    res.status(500).json({
      error: error.message || "Falha ao gerar o prólogo com o Motor Narrativo.",
    });
  }
});

// Non-streaming chat generation with fallback
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, origin, ledgerContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array in request body." });
    }

    const ai = getGenAI();
    const contents = sanitizeContentsForGemini(messages);

    let dynamicSystemInstruction = SYSTEM_INSTRUCTION;
    if (origin) {
      dynamicSystemInstruction += `\n\n[CONTEXTO DE ORIGEM ESCOLHIDA]: ${typeof origin === "object" ? JSON.stringify(origin) : origin}`;
    }
    if (ledgerContext) {
      dynamicSystemInstruction += `\n\n[REGISTRO DE MEMÓRIA ATUAL (FATOS ESTABELECIDOS & HISTÓRICO DE NPCS - MEMÓRIA ABSOLUTA)]:\n${ledgerContext}`;
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: NARRATIVE_MAX_OUTPUT_TOKENS,
      },
    });

    const reply = response.text || "";

    res.json({ text: reply });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "Falha ao consultar o Motor Narrativo de Lord of the Mysteries.",
    });
  }
});

// Streaming chat generation using SSE with resilient fallback
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { messages, origin, ledgerContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array." });
    }

    const ai = getGenAI();
    const contents = sanitizeContentsForGemini(messages);

    let dynamicSystemInstruction = SYSTEM_INSTRUCTION;
    if (origin) {
      dynamicSystemInstruction += `\n\n[CONTEXTO DE ORIGEM ESCOLHIDA]: ${typeof origin === "object" ? JSON.stringify(origin) : origin}`;
    }
    if (ledgerContext) {
      dynamicSystemInstruction += `\n\n[REGISTRO DE MEMÓRIA ATUAL (FATOS ESTABELECIDOS & HISTÓRICO DE NPCS - MEMÓRIA ABSOLUTA)]:\n${ledgerContext}`;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    try {
      const stream = await ai.models.generateContentStream({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction: dynamicSystemInstruction,
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: NARRATIVE_MAX_OUTPUT_TOKENS,
        },
      });

      for await (const chunk of stream) {
        const chunkText = chunk.text || "";
        if (chunkText) {
          res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }
      }
      res.write(`data: [DONE]\n\n`);
    } catch (err: any) {
      console.warn(`[Gemini] Streaming failed with model '${GEMINI_MODEL}':`, err?.message || err);
      res.write(`data: ${JSON.stringify({ error: err?.message || "Erro no streaming de narrativa" })}\n\n`);
    }
    res.end();
  } catch (error: any) {
    console.error("Error in /api/chat/stream:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Erro durante o streaming do Motor Narrativo." });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || "Erro no streaming" })}\n\n`);
      res.end();
    }
  }
});

// Ledger extraction helper endpoint (analyzes turn to update NPC list, lies, clues)
app.post("/api/ledger/extract", async (req, res) => {
  try {
    const { lastUserAction, lastGMResponse, currentLedger } = req.body;
    const ai = getGenAI();

    const prompt = `Analise detalhadamente a última interação no RPG de Lord of the Mysteries e atualize o diário de memória com absoluta fidelidade.
IMPORTANTE: NPCs NUNCA podem esquecer nada. Registre minuciosamente quem são, o que o jogador disse a eles e o que prometeram.

Última ação do jogador: "${lastUserAction || "Início da investigação"}"
Última resposta do GM: "${(lastGMResponse || "").slice(-2000)}"
Diário atual existente: ${JSON.stringify(currentLedger || {})}

Retorne um JSON estrito com a seguinte estrutura:
{
  "location": "Local atual exato (Ex: Backlund, Distrito de Cherwood)",
  "timeAndWeather": "Horário e Clima dinâmicos da narrativa com passagem do tempo e iluminação canônica de LoM (Ex: 'Madrugada, Sob o Luar Carmesim e Névoa Fria', 'Manhã Nublada, Fumaça de Carvão e Garoa', 'Tarde Chuvosa, Névoa das Fábricas', 'Noite Escura, Sombras Carmesins'). NUNCA repita a mesma frase turno após turno.",
  "newOrUpdatedNPCs": [
    {
      "name": "Nome do NPC",
      "role": "Ocupação/Aparência/Facção suspeita",
      "attitude": "Atitude emocional em relação ao jogador (desconfiado, neutro, temeroso, etc.)",
      "secretsKnown": "Segredo revelado ou que o NPC parece guardar",
      "conversationMemory": ["Fatos cruciais ou acordos falados entre ele e o jogador nesta ou em cenas anteriores"],
      "notes": "Observações minuciosas sobre linguagem corporal ou hábitos"
    }
  ],
  "newClues": ["Pistas materiais, cartas, livros ou contradições notadas"],
  "newOrUpdatedItems": [
    {
      "name": "Nome do item físico ou místico obtido, perdido ou usado",
      "description": "Descrição detalhada do item, marcas de fabricação ou propriedades",
      "category": "Documento | Poção/Fórmula | Artefato Oculto | Pertence Pessoal | Arma | Outro",
      "quantityDelta": 1,
      "reason": "obtido/perdido/consumido/usado"
    }
  ],
  "playerLiesOrPromises": ["Mentiras contadas pelo jogador ou promessas feitas a terceiros"],
  "unresolvedMysteries": ["Dilemas, ameaças ou mistérios em aberto"],
  "resolvedMysteries": ["Mistérios, enigmas ou suspeitas que foram elucidados ou resolvidos pelo jogador"],
  "newSecretsDiscovered": ["Segredos arcanos, identidades verdadeiras ocultas ou rituais descobertos"],
  "discoveredPathwayIds": ["Identificadores dos Caminhos canônicos que foram ativamente revelados, explicados por NPCs, ou cujos efeitos/poções foram testemunhados nesta cena. Escolha APENAS entre os IDs válidos: 'fool' (Vidente), 'door' (Aprendiz), 'error' (Salteador), 'visionary' (Espectador), 'hanged-man' (Suplicante), 'sun' (Bardo), 'tyrant' (Marinheiro), 'white-tower' (Leitor), 'darkness' (Insonioso), 'death' (Coletor), 'twilight-giant' (Guerreiro), 'red-priest' (Caçador), 'demoness' (Assassino), 'paragon' (Sábio Mecânico), 'hermit' (Investigador do Mistério), 'wheel-of-fortune' (Monstro), 'moon' (Boticário), 'mother' (Plantador), 'black-emperor' (Advogado), 'justiciar' (Árbitro), 'chained' (Prisioneiro), 'abyss' (Criminoso). Se nenhum foi revelado, retorne lista vazia []"],
  "sanityDelta": 0,
  "sanityReason": "Breve justificativa canônica (ex: 'Sussurros ininteligíveis na névoa', 'Contemplou artefato de carne viva', 'Bebeu chá e recobrou o foco')",
  "detectedMood": "calm" | "mystery" | "discovery" | "tension"
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.15,
        maxOutputTokens: LEDGER_MAX_OUTPUT_TOKENS,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.warn("Ledger extraction fallback gracefully:", err?.message || err);
    res.json({ error: err.message });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lord of the Mysteries RPG Engine running on port ${PORT}`);
  });
}

startServer();
