import { GameOrigin } from "../types";

export interface CanonicalLocation {
  city: string;
  district: string;
  region: string;
}

export const CANONICAL_LOCATIONS: CanonicalLocation[] = [
  { city: "Backlund", district: "Distrito de Cherwood", region: "Reino de Loen" },
  { city: "Backlund", district: "Distrito Leste (East District, cortiços e névoa ácida)", region: "Reino de Loen" },
  { city: "Backlund", district: "Bairro da Ponte de Backlund (Backlund Bridge)", region: "Reino de Loen" },
  { city: "Backlund", district: "Distrito das Docas do Rio Tussock", region: "Reino de Loen" },
  { city: "Backlund", district: "Distrito de Hillston (Perto da Universidade e dos Teatros)", region: "Reino de Loen" },
  { city: "Backlund", district: "Bairro Nobre / Empress Borough (Mansões de alta aristocracia)", region: "Reino de Loen" },
  { city: "Backlund", district: "Cemitério Memorial de St. George (Distrito Norte)", region: "Reino de Loen" },
  { city: "Backlund", district: "Fábricas de Fiação do Distrito Norte", region: "Reino de Loen" },
  { city: "Backlund", district: "Distrito de Joewood (Residências de classe média baixa)", region: "Reino de Loen" },
  { city: "Tingen", district: "Rua Cruz de Ferro (Iron Cross Street)", region: "Condado de Aharva, Loen" },
  { city: "Tingen", district: "Rua Daffodil e Arredores da Universidade Khoy", region: "Condado de Aharva, Loen" },
  { city: "Porto de Pritz", district: "Armazém da Companhia de Navegação de Loen", region: "Costa Sul de Loen" },
  { city: "Porto de Pritz", district: "Doca dos Contrabandistas e Marinheiros Estrangeiros", region: "Costa Sul de Loen" },
  { city: "Cidade de Conot", district: "Distrito Minerador de Carvão e Ferro", region: "Reino de Loen" },
  { city: "Bayam", district: "Cidade Velha e Beco dos Aromas (Arquipélago Rorsted)", region: "Colônia Ultramarina de Loen" },
  { city: "Trier", district: "Quartier de l'Avenue (Margem do Rio Serifim)", region: "República de Intis" },
  { city: "Trier", district: "Bairro Antigo dos Mecânicos de Vapor", region: "República de Intis" },
];

export const UNPREDICTABLE_SEEDS = [
  {
    title: "O Tipógrafo e o Manifesto Anônimo",
    occupation: "Tipógrafo Assistente de Imprensa",
    setup: "Você acabou de rodar as prensas noturnas quando percebeu que um dos carimbos de chumbo entregues por um homem encapuzado trazia símbolos estranhos que fazem seus olhos arderem e sua cabeça zumbir dolorosamente.",
    item: "Um panfleto úmido de tinta com um símbolo herético e três moedas de ouro 'pence' pesadas demais.",
  },
  {
    title: "O Assistente de Farmácia Noturna",
    occupation: "Praticante de Boticário",
    setup: "Um cliente tossindo sangue espesso bateu na porta após o toque de recolher, pagou adiantado por um frasco de láudano e desmaiou no balcão, deixando cair um dente humano incrustado de cobre.",
    item: "Uma balança de latão descalibrada, uma chave de ferro com fita de veludo e o dente de cobre.",
  },
  {
    title: "O Carpinteiro de Caixões de St. George",
    occupation: "Ajudante de Funerária Municipal",
    setup: "Enquanto pregava as tábuas de pinho de um indigente trazido do rio, você ouviu três batidas fracas vindas de dentro da madeira... e depois um arranhar de unhas.",
    item: "Um martelo de ferreiro de cabo gasto, um prego de prata fosco e um fósforo queimado pela metade.",
  },
  {
    title: "O Amauvense de Cartório Decadente",
    occupation: "Copista de Contratos Judiciais",
    setup: "Você estava transcrevendo um testamento de uma linhagem nobre extinta da Quarta Era quando uma gota de sangue seco na margem do pergaminho começou a fumegar suavemente.",
    item: "Uma pena de ganso manchada de tinta preta, um anel de sinete sem brasão e um relógio de bolso parado às 3h15.",
  },
  {
    title: "O Guarda Portuário do Turno do Silêncio",
    occupation: "Vigia Noturno de Trapiche",
    setup: "A névoa fria encobriu o rio Tussock. Uma lancha sem lanternas atracou silenciosamente e dois estivadores descarregaram uma caixa etiquetada com o selo imperial que murmura na língua dos ventos.",
    item: "Um lampião a querosene com vidro trincado, um cassetete de carvalho e um apito de latão.",
  },
  {
    title: "O Garçom do Clube de Cavalheiros",
    occupation: "Criado de Salão Privado",
    setup: "Ao recolher as xícaras de porcelana após uma reunião privada entre dois nobres e um estrangeiro de Feysac, você encontrou um guardanapo de linho com coordenadas criptografadas e o nome de um inspetor da Scotland Yard riscado de vermelho.",
    item: "Um saca-rolhas de prata, o guardanapo manchado de café e meio maço de cigarros de tabaco de Intis.",
  },
  {
    title: "O Vendedor de Livros Usados em Hillston",
    occupation: "Livreiro de Segunda Mão",
    setup: "Uma idosa de olhos esbranquiçados vendeu uma caixa de romances populares por apenas dois soles. No fundo falso da caixa há um caderno manuscrito intitulado 'Notas sobre as 22 Leis das Essências'.",
    item: "Um par de óculos redondos de aro de metal, uma navalha dobrável de barbear e o caderno cifrado.",
  },
  {
    title: "O Ajudante de Autópsia do Necrotério",
    occupation: "Auxiliar Médico Legal",
    setup: "O legista chefe foi embora às pressas após a chegada de um cadáver recolhido no esgoto que não apresenta rigidez cadavérica e cujas veias do peito pulsam em um ritmo lento.",
    item: "Um bisturi de aço cirúrgico, luvas de couro impermeabilizadas e um frasco com vinagre aromático.",
  },
];

/**
 * Generates a completely new, unpredictable origin in a random canonical location
 * so that every single new game starts in a totally unexpected setting!
 */
export function generateRandomUnpredictableOrigin(usedLocationIndex?: number): GameOrigin {
  const randomLoc = CANONICAL_LOCATIONS[Math.floor(Math.random() * CANONICAL_LOCATIONS.length)];
  const seed = UNPREDICTABLE_SEEDS[Math.floor(Math.random() * UNPREDICTABLE_SEEDS.length)];
  const years = ["1338", "1340", "1342", "1344", "1346", "1348"];
  const randomYear = years[Math.floor(Math.random() * years.length)];

  const fullLocation = `${randomLoc.city}, ${randomLoc.district} (${randomLoc.region})`;

  return {
    id: `unpredictable-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: `${seed.title}`,
    location: fullLocation,
    year: `${randomYear} do Calendário das Cinco Eras`,
    summary: `${seed.occupation} em ${randomLoc.city}: ${seed.setup}`,
    flavor: `Itens em mãos: ${seed.item}. Nenhum poder Beyonder ativo. Apenas astúcia e instinto mundano de sobrevivência.`,
    initialPrompt: `Começo como um humano comum (sem poção da Sequência 9) em ${fullLocation}, por volta do ano ${randomYear}.
Minha identidade mundana: ${seed.occupation}.
Situação imediata: ${seed.setup}
Itens comigo: ${seed.item}.

Narre meu momento presente em 1ª pessoa no formato obrigatório:
[CENA]
[DIÁLOGO]
[STATUS DO MUNDO]
E conclua SEMPRE com o dilema imediato e tenso que exige minha tomada de decisão.`,
  };
}

export const PRESET_ORIGINS: GameOrigin[] = [
  {
    id: "random-unpredictable",
    title: "🎲 Despertar Aleatório & Imprevisível (Lugar & Trama Únicos)",
    location: "Sorteado aleatoriamente entre 17 distritos canônicos",
    year: "Entre 1320 e 1348",
    summary: "Comece em um distrito, profissão e mistério completamente inédito e imprevisível a cada nova partida.",
    flavor: "Nenhum jogo será igual. Você descobrirá sua identidade e dilema no momento em que abrir os olhos na névoa.",
    initialPrompt: "",
  },
  {
    id: "amnesiac-dock",
    title: "Desperto Amnésico nas Docas do Tussock",
    location: "Backlund, Distrito das Docas do Rio Tussock",
    year: "1342 do Calendário das Cinco Eras",
    summary: "Acorda na névoa amarelada e sufocante de Backlund sem memórias de sua identidade anterior, mas com instintos aguçados.",
    flavor: "Nenhum poder místico. Apenas o frio cortante do cais de carvão, passos rápidos nas escadas de ferro e um bilhete úmido nos dedos.",
    initialPrompt: `Estou acordando agora. Não tenho memórias de quem sou. Sou um humano comum, desprovido de qualquer poção. Meus sentidos estão alertas, sentindo a névoa ácida e o chão de tábuas apodrecidas do cais de Backlund. Descreva o meu despertar, o que está nos meus bolsos, o que ouço ao redor e o dilema imediato à minha frente segundo o formato obrigatório [CENA], [DIÁLOGO] e [STATUS DO MUNDO].`,
  },
  {
    id: "university-archivist",
    title: "Assistente de Arquivos na Universidade de Backlund",
    location: "Backlund, Distrito de Hillston, Biblioteca Universitária",
    year: "1339 do Calendário das Cinco Eras",
    summary: "Um jovem arquivista mundano que tropeça em manuscritos com anotações em Hermes Antigo deixados por uma sociedade extinta.",
    flavor: "O pó de séculos, o silêncio pesado da noite vitoriana sob a névoa e a maçaneta da ala restrita girando lentamente.",
    initialPrompt: `Sou um assistente de arquivos mundano na Universidade de Backlund, sem nenhuma poção ou conhecimento Beyonder confirmado. Estou sozinho na sala de arquivos raros quando descubro algo perturbador em um lote de livros antigos doados recentemente. Descreva a cena em 1ª pessoa no formato obrigatório, com os cheiros de papel e couro sob a luz fraca de lampiões, o que acabo de encontrar e o dilema imediato que exige minha decisão lógica.`,
  },
  {
    id: "cherwood-detective",
    title: "Investigador Mundano no Distrito de Cherwood",
    location: "Backlund, Distrito de Cherwood",
    year: "1344 do Calendário das Cinco Eras",
    summary: "Um detetive particular comum acostumado a infidelidades e dívidas que aceita um caso aparentemente banal que cheira a perigo oculto.",
    flavor: "Café frio na xícara de porcelana lascada, chuva no vidro da janela e um cliente com tremores nas mãos e olhos em pânico.",
    initialPrompt: `Sou um investigador particular mundano em meu escritório modesto em Cherwood, sem qualquer habilidade sobrenatural. A garoa gélida de Backlund bate na janela enquanto atendo um cliente que acabou de entrar com um caso que parece desafiar as leis naturais. Narre em 1ª pessoa no formato [CENA], [DIÁLOGO], [STATUS DO MUNDO] e o dilema imediato que me obriga a conduzir o interrogatório com perguntas incisivas.`,
  },
  {
    id: "trier-antiquary",
    title: "Ajudante de Antiquário em Trier (República de Intis)",
    location: "Trier, Bairro Antigo da Margem Sul",
    year: "1325 do Calendário das Cinco Eras",
    summary: "Um aprendiz em uma loja empoeirada de relíquias da era de Roselle Gustav, lidando com nobres decadentes e objetos peculiares.",
    flavor: "Lampiões a gás, veludo desbotado, relógios mecânicos marcando compassos assimétricos e um relicário que não deveria emitir calor.",
    initialPrompt: `Sou um ajudante mundano na loja de antiguidades 'O Pêndulo de Bronze' em Trier, Intis, por volta de 1325 (décadas após a queda de Roselle). Não sou um Beyonder. Uma figura misteriosa acaba de entrar trazendo uma relíquia enigmática e fazendo exigências estranhas. Narre a cena em 1ª pessoa com estética gótica vitoriana no formato obrigatório [CENA], [DIÁLOGO], [STATUS DO MUNDO] e o dilema à frente.`,
  },
];
