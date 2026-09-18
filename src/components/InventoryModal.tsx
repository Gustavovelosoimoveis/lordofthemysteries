import React, { useState } from "react";
import {
  X,
  Briefcase,
  Search,
  Sparkles,
  Info,
  Clock,
  Layers,
} from "lucide-react";
import { ItemRecord } from "../types";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ItemRecord[];
}

type CategoryFilter = "Todos" | ItemRecord["category"];

const CATEGORIES: CategoryFilter[] = [
  "Todos",
  "Documento",
  "Poção/Fórmula",
  "Artefato Oculto",
  "Pertence Pessoal",
  "Arma",
  "Outro",
];

// Custom Victorian Occult SVG Icons (Replacing generic SaaS icons)
const DocumentParchmentIcon = ({ className = "w-5 h-5 text-[#dfb87f]" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Rolled parchment with wax seal & handwritten lines */}
    <path d="M19 4H8.5C6.567 4 5 5.567 5 7.5V17c0 1.933 1.567 3.5 3.5 3.5H19a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
    <path d="M5 7.5C5 5.567 6.567 4 8.5 4H10v13H8.5C6.567 17 5 15.433 5 13.5" />
    <path d="M10 8h7" />
    <path d="M10 11.5h6" />
    <path d="M10 15h4" />
    {/* Wax seal */}
    <circle cx="17" cy="15.5" r="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const PotionFlaskIcon = ({ className = "w-5 h-5 text-[#7ec79c]" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Alchemical potion vial with cork stopper and bubbling essence */}
    <path d="M9 3h6" />
    <path d="M10 3v2.5l-4.5 8A4.5 4.5 0 0 0 9.4 20.5h5.2a4.5 4.5 0 0 0 3.9-7L14 5.5V3" />
    <path d="M7.5 15c2-1 4.5 1 8.5 0" />
    <path d="M7 17.5c2-1 5 1 9.5 0" />
    <circle cx="10" cy="18" r="0.9" fill="currentColor" />
    <circle cx="14" cy="16.5" r="0.75" fill="currentColor" />
  </svg>
);

const OccultArtifactIcon = ({ className = "w-5 h-5 text-[#e06d53]" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Forbidden talisman with all-seeing radiant eye */}
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.8 4.8l1.4 1.4" />
    <path d="M17.8 17.8l1.4 1.4" />
    <path d="M19.2 4.8l-1.4 1.4" />
    <path d="M6.2 17.8l-1.4 1.4" />
  </svg>
);

const PersonalRelicIcon = ({ className = "w-5 h-5 text-[#dfb87f]" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Victorian antique pocket watch with winding stem */}
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 6V2.5" />
    <path d="M9 2.5h6" />
    <path d="M12 9.5v4l2.5 1.5" />
    <circle cx="12" cy="13.5" r="1" fill="currentColor" />
    <path d="M12 7.5v0.8" />
    <path d="M18 13.5h-0.8" />
    <path d="M12 19.5v-0.8" />
    <path d="M6 13.5h0.8" />
  </svg>
);

const VictorianWeaponIcon = ({ className = "w-5 h-5 text-[#e5b567]" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Victorian Derringer / Revolver with brass barrel */}
    <path d="M3 11h11l2-3.5h5v4h-3l-2.2 3.2H8l-3 6.3H2l2.6-6.8L3 11Z" />
    <path d="M14 7.5v3.5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" fillOpacity="0.25" />
    <path d="M8 14.5h3" />
    <path d="M18 11.5v1" />
  </svg>
);

const AncientKeyIcon = ({ className = "w-5 h-5 text-[#c4b69d]" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Antique brass skeleton key */}
    <circle cx="7.5" cy="8" r="4" />
    <circle cx="7.5" cy="8" r="1.5" fill="currentColor" fillOpacity="0.3" />
    <path d="M10.8 10.8L20 20" />
    <path d="M16 16l2-2" />
    <path d="M18 18l2.5-2.5" />
  </svg>
);

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  items = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [inspectedItem, setInspectedItem] = useState<ItemRecord | null>(null);

  if (!isOpen) return null;

  // Filter items by category and search
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "Todos" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCustomCategoryIcon = (cat: ItemRecord["category"]) => {
    switch (cat) {
      case "Documento":
        return <DocumentParchmentIcon className="w-5 h-5 text-[#dfb87f]" />;
      case "Poção/Fórmula":
        return <PotionFlaskIcon className="w-5 h-5 text-[#7ec79c]" />;
      case "Artefato Oculto":
        return <OccultArtifactIcon className="w-5 h-5 text-[#f28e83]" />;
      case "Pertence Pessoal":
        return <PersonalRelicIcon className="w-5 h-5 text-[#dfb87f]" />;
      case "Arma":
        return <VictorianWeaponIcon className="w-5 h-5 text-[#e5b567]" />;
      default:
        return <AncientKeyIcon className="w-5 h-5 text-[#c4b69d]" />;
    }
  };

  const getParchmentBadgeClass = (cat: ItemRecord["category"]) => {
    switch (cat) {
      case "Documento":
        return "bg-[#211a12] text-[#dfb87f] border-[#8a6d3b]/50 shadow-[0_1px_4px_rgba(0,0,0,0.5)]";
      case "Poção/Fórmula":
        return "bg-[#142118] text-[#86d4a5] border-[#2f5e3d]/70 shadow-[0_1px_4px_rgba(0,0,0,0.5)]";
      case "Artefato Oculto":
        return "bg-[#291313] text-[#f28e83] border-[#7d2424]/70 shadow-[0_1px_4px_rgba(0,0,0,0.5)]";
      case "Pertence Pessoal":
        return "bg-[#241a10] text-[#e0b579] border-[#8a6d3b]/60 shadow-[0_1px_4px_rgba(0,0,0,0.5)]";
      case "Arma":
        return "bg-[#261e11] text-[#e5b567] border-[#80612c]/70 shadow-[0_1px_4px_rgba(0,0,0,0.5)]";
      default:
        return "bg-[#1c1813] text-[#c4b69d] border-[#6b583f]/60 shadow-[0_1px_4px_rgba(0,0,0,0.5)]";
    }
  };

  const countForCategory = (cat: CategoryFilter) => {
    if (cat === "Todos") return items.length;
    return items.filter((i) => i.category === cat).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fadeIn">
      {/* Target Container with CSS Selector .inventory-modal-container */}
      <div className="inventory-modal-container w-full max-w-5xl max-h-[92vh] bg-[#0c0e14] border-2 border-[#8a6d3b]/60 rounded-xl flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden relative">
        {/* Subtle vintage brass radial glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,_rgba(168,130,79,0.15)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(138,109,59,0.1)_0%,_transparent_70%)] pointer-events-none" />

        {/* Header: Victorian Specimen Cabinet Plaque */}
        <div className="p-4 sm:p-5 border-b-2 border-[#8a6d3b]/40 bg-gradient-to-r from-[#17130c] via-[#1c160f] to-[#120f0a] flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Antique brass seal emblem */}
            <div className="w-10 h-10 rounded-lg border-2 border-[#8a6d3b] bg-gradient-to-b from-[#2e2315] to-[#161109] flex items-center justify-center text-[#dfb87f] shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.8)]">
              <Briefcase className="w-5 h-5 text-[#dfb87f]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-['Cinzel'] text-sm sm:text-base text-[#ebdcc6] font-bold tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Gabinete de Pertences & Relíquias
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded border border-[#8a6d3b]/70 bg-gradient-to-b from-[#2b2114] to-[#171109] text-[#e5b567] shadow-inner font-bold">
                  {items.length} {items.length === 1 ? "Registro" : "Registros"}
                </span>
              </div>
              <p className="text-xs text-[#a69680] font-serif tracking-wide mt-0.5">
                Acervo de objetos, cartas e relíquias gerenciado estritamente pelo Motor Narrativo
              </p>
            </div>
          </div>

          <button
            id="btn-close-inventory"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded border border-[#8a6d3b]/40 text-[#a89882] hover:text-[#ebdcc6] hover:bg-[#251e14] hover:border-[#dfb87f] transition-all"
            title="Fechar acervo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar with Brass Filigree Separators */}
        <div className="p-3 bg-[#110e0a] border-b border-[#8a6d3b]/30 flex flex-col sm:flex-row gap-2.5 items-center justify-between relative z-10">
          {/* Category Tabs styled as Aged Brass Labels */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => {
              const count = countForCategory(cat);
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded text-xs font-serif whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-gradient-to-b from-[#2e2315] to-[#1b140b] border-[#dfb87f] text-[#ebdcc6] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]"
                      : "bg-[#16120c] border-[#8a6d3b]/30 text-[#9c8c76] hover:text-[#ebdcc6] hover:border-[#8a6d3b]/60"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      isActive
                        ? "bg-[#3d2f1c] border-[#8a6d3b] text-[#f5ecd8]"
                        : "bg-[#0f0c08] border-[#8a6d3b]/20 text-[#82735f]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box in Aged Brass Inlay */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#dfb87f]/70" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou manuscrito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded bg-[#16120c] border border-[#8a6d3b]/40 text-xs font-serif text-[#ebdcc6] placeholder-[#7d6f5c] focus:outline-none focus:border-[#dfb87f] focus:ring-1 focus:ring-[#dfb87f]/30"
            />
          </div>
        </div>

        {/* Modal Body: Dynamic Item Grid + Parchment Inspection Desk */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col lg:flex-row gap-5">
          {/* Main Area: Dynamic Grid with Aged Brass Borders & Parchment Textures */}
          <div className="flex-1 space-y-3">
            {filteredItems.length === 0 ? (
              <div className="p-10 sm:p-14 text-center rounded-xl border-2 border-dashed border-[#8a6d3b]/35 bg-[radial-gradient(ellipse_at_center,_#1c160f_0%,_#110d08_100%)] space-y-3 shadow-inner">
                <div className="w-14 h-14 rounded-full bg-[#1e170e] border-2 border-[#8a6d3b]/60 mx-auto flex items-center justify-center text-[#dfb87f] shadow-lg">
                  <Briefcase className="w-7 h-7 opacity-75" />
                </div>
                <h3 className="font-['Cinzel'] text-sm sm:text-base uppercase tracking-widest text-[#ebdcc6] font-bold">
                  Acervo Desprovido de Registros
                </h3>
                <p className="text-xs sm:text-sm font-serif text-[#a69680] max-w-md mx-auto leading-relaxed">
                  {searchTerm || selectedCategory !== "Todos"
                    ? "Nenhum item ou manuscrito corresponde ao filtro selecionado nas gavetas deste gabinete."
                    : "O investigador carrega apenas seus sentidos mundanos e seu sobretudo. Conforme você explorar Backlund, interrogar testemunhas ou vasculhar recintos, o Motor Narrativo registrará automaticamente cartas, poções, fórmulas e armas aqui."}
                </p>
              </div>
            ) : (
              /* DYNAMIC GRID: Adapts cleanly from 1 to 3 columns with aged brass borders */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredItems.map((item) => {
                  const isSelected = inspectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setInspectedItem(item)}
                      className={`group relative p-3.5 rounded-lg border-2 transition-all cursor-pointer text-left flex flex-col justify-between overflow-hidden ${
                        isSelected
                          ? "border-[#dfb87f] bg-[radial-gradient(ellipse_at_top,_#2c2214_0%,_#1c160e_60%,_#110d08_100%)] shadow-[0_6px_20px_rgba(0,0,0,0.9),inset_0_0_15px_rgba(223,184,127,0.15)] ring-1 ring-[#dfb87f]/60"
                          : "border-[#8a6d3b]/45 bg-[radial-gradient(ellipse_at_top,_#1f1810_0%,_#15110a_60%,_#0e0b07_100%)] hover:border-[#dfb87f]/80 hover:bg-[radial-gradient(ellipse_at_top,_#261d12_0%,_#18120b_60%,_#110d08_100%)] shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
                      }`}
                    >
                      {/* Brass Corner Filigree Accents */}
                      <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#dfb87f]/50 pointer-events-none" />
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#dfb87f]/50 pointer-events-none" />
                      <span className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-[#dfb87f]/50 pointer-events-none" />
                      <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#dfb87f]/50 pointer-events-none" />

                      {/* Card Content Top: Icon, Label & Brass Quantity Plate */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            {/* Aged Brass Icon Medallion */}
                            <div className="w-8 h-8 rounded border border-[#8a6d3b] bg-gradient-to-b from-[#291f13] to-[#151009] flex items-center justify-center flex-shrink-0 shadow-sm">
                              {getCustomCategoryIcon(item.category)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-['Cinzel'] text-xs sm:text-sm font-bold text-[#ebdcc6] group-hover:text-[#fff6e6] tracking-wide line-clamp-1">
                                {item.name}
                              </h4>
                              <span
                                className={`inline-block text-[9px] font-mono uppercase px-2 py-0.2 rounded border ${getParchmentBadgeClass(
                                  item.category
                                )}`}
                              >
                                {item.category}
                              </span>
                            </div>
                          </div>

                          {/* Brass Quantity Plate */}
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded border border-[#8a6d3b] bg-gradient-to-b from-[#332515] to-[#1c140a] text-[#dfb87f] shadow-inner flex-shrink-0">
                            x{item.quantity}
                          </span>
                        </div>

                        {/* Parchment Text Excerpt */}
                        <div className="p-2 rounded border border-[#8a6d3b]/20 bg-[#120e09]/60 mt-1">
                          <p className="text-xs font-serif text-[#c4b59d] line-clamp-2 leading-relaxed italic">
                            “{item.description}”
                          </p>
                        </div>
                      </div>

                      {/* Card Footer: Vintage Clock & Inspection Arrow */}
                      <div className="mt-3 pt-2 border-t border-[#8a6d3b]/25 flex items-center justify-between text-[10px] font-mono text-[#9e8f7a]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#dfb87f]" />
                          {item.acquiredAt ? `Anotado às ${item.acquiredAt}` : "No acervo"}
                        </span>
                        <span className="text-[#dfb87f] group-hover:text-[#fff6e6] font-serif transition-colors flex items-center gap-0.5">
                          Examinar <span className="font-sans text-xs">→</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inspection Desk / Mesa de Exame de Objetos (Parchment Texture Style) */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l-2 border-[#8a6d3b]/30 pt-4 lg:pt-0 lg:pl-5 flex flex-col">
            <div className="flex items-center gap-2 border-b-2 border-[#8a6d3b]/30 pb-2 mb-3">
              <Info className="w-4 h-4 text-[#dfb87f]" />
              <h3 className="font-['Cinzel'] text-xs uppercase tracking-widest text-[#ebdcc6] font-bold">
                Mesa de Exame do Investigador
              </h3>
            </div>

            {inspectedItem ? (
              <div className="space-y-4 text-xs font-serif leading-relaxed animate-fadeIn">
                {/* Parchment Document Frame */}
                <div className="p-4 rounded-lg border-2 border-[#8a6d3b] bg-[radial-gradient(ellipse_at_top,_#241b10_0%,_#171109_70%,_#100c07_100%)] shadow-[0_4px_16px_rgba(0,0,0,0.8)] space-y-3 relative">
                  {/* Ornate corner pins */}
                  <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#dfb87f]/60 shadow" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#dfb87f]/60 shadow" />
                  <span className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#dfb87f]/60 shadow" />
                  <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#dfb87f]/60 shadow" />

                  <div className="flex items-center justify-between gap-2 border-b border-[#8a6d3b]/30 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded border border-[#8a6d3b] bg-[#1a130a] flex items-center justify-center">
                        {getCustomCategoryIcon(inspectedItem.category)}
                      </div>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${getParchmentBadgeClass(
                          inspectedItem.category
                        )}`}
                      >
                        {inspectedItem.category}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-bold text-[#dfb87f] px-2 py-0.5 rounded border border-[#8a6d3b]/50 bg-[#161008]">
                      Qtd: {inspectedItem.quantity}
                    </span>
                  </div>

                  <h4 className="font-['Cinzel'] text-sm sm:text-base font-bold text-[#ebdcc6] tracking-wide">
                    {inspectedItem.name}
                  </h4>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-mono uppercase text-[#dfb87f] tracking-wider block font-bold">
                      Registro de Propriedades & Manuscrito:
                    </span>
                    <div className="p-3 rounded border border-[#8a6d3b]/30 bg-[#0e0b07]/80 text-[#d4c6b0] whitespace-pre-line leading-relaxed italic shadow-inner">
                      “{inspectedItem.description}”
                    </div>
                  </div>

                  {inspectedItem.acquiredAt && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9e8f7a] pt-1">
                      <Clock className="w-3.5 h-3.5 text-[#dfb87f]" />
                      <span>Adquirido em registro oficial: {inspectedItem.acquiredAt}</span>
                    </div>
                  )}
                </div>

                {/* Narrative Integration Callout */}
                <div className="p-3.5 rounded-lg bg-gradient-to-b from-[#1b140b] to-[#120d07] border border-[#8a6d3b]/40 space-y-1.5 text-[11px] text-[#a69680]">
                  <div className="flex items-center gap-1.5 text-[#dfb87f] font-['Cinzel'] text-xs uppercase font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Uso na Narrativa Viva</span>
                  </div>
                  <p>
                    Para usar este item, mencione-o diretamente na sua ação ou diálogo (ex: <em>"Pego a {inspectedItem.name} e..."</em>). O Motor Narrativo calculará as consequências no cânone de LoM.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-[#140f09]/60 border-2 border-dashed border-[#8a6d3b]/30 text-center text-xs font-serif text-[#9e8f7a] space-y-2.5">
                <Layers className="w-6 h-6 text-[#dfb87f]/60 mx-auto" />
                <p className="leading-relaxed">
                  Selecione qualquer item ou relíquia da grade ao lado para inspecionar entalhes, selos lacrados, segredos ocultos e manuscritos associados.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t-2 border-[#8a6d3b]/30 bg-[#110d08] flex items-center justify-between text-[11px] font-mono text-[#9e8f7a] relative z-10">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#dfb87f] animate-pulse" />
            <span className="tracking-wide">Acervo Canônico do Reino de Loen — Calendário das Cinco Eras</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-[#8a6d3b] bg-gradient-to-b from-[#2b2114] to-[#181109] text-[#ebdcc6] hover:text-[#fff6e6] hover:border-[#dfb87f] transition-all text-xs font-serif shadow"
          >
            Fechar Gabinete
          </button>
        </div>
      </div>
    </div>
  );
};
