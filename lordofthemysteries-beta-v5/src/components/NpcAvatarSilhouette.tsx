import React from "react";
import {
  Shield,
  BookOpen,
  Anchor,
  Crown,
  Eye,
  Scale,
  Feather,
  Moon,
  Flame,
  User,
} from "lucide-react";

interface NpcAvatarSilhouetteProps {
  name: string;
  role?: string;
  attitude?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const NpcAvatarSilhouette: React.FC<NpcAvatarSilhouetteProps> = ({
  name,
  role = "",
  attitude = "",
  size = "sm",
  className = "",
}) => {
  // Deterministic avatar archetype based on role and name
  const text = `${name} ${role} ${attitude}`.toLowerCase();

  let Icon = User;
  let accentColor = "#dfb87f"; // Loen Antique Gold

  if (/polícia|inspetor|guarda|soldado|capitão|tribunal|ordem/i.test(text)) {
    Icon = Shield;
    accentColor = "#93c5fd"; // Scotland Yard steel blue
  } else if (/livreiro|acadêmico|estudante|doutor|pesquisador|médico|professor|história/i.test(text)) {
    Icon = BookOpen;
    accentColor = "#c4b5fd"; // Scholar violet
  } else if (/marinheiro|cais|docas|rio|pescador|capataz|tussock/i.test(text)) {
    Icon = Anchor;
    accentColor = "#67e8f9"; // Maritime cyan
  } else if (/nobre|conde|lorde|dama|visconde|aristocrata|mansão/i.test(text)) {
    Icon = Crown;
    accentColor = "#fcd34d"; // High court gold
  } else if (/comerciante|vendedor|joalheiro|penhor|banco|moedas/i.test(text)) {
    Icon = Scale;
    accentColor = "#86efac"; // Merchant jade
  } else if (/mendigo|vagabundo|informante|espião|ladrão|beco|distrito leste/i.test(text)) {
    Icon = Eye;
    accentColor = "#fca5a5"; // Street informant red
  } else if (/culto|aurora|herege|místico|oráculo|feiticeiro|bruxa|sussurro/i.test(text)) {
    Icon = Moon;
    accentColor = "#f472b6"; // Arcane crimson-pink
  } else if (/oficina|vapor|mecânico|máquina|engrenagem|fábrica/i.test(text)) {
    Icon = Flame;
    accentColor = "#fdba74"; // Industrial amber
  } else {
    Icon = Feather;
    accentColor = "#dfb87f";
  }

  const initial = (name.trim()[0] || "N").toUpperCase();

  const sizeClasses = {
    xs: "w-5 h-5",
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const iconSizes = {
    xs: "w-2.5 h-2.5",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full flex-shrink-0 border border-[#8a6d3b]/60 bg-gradient-to-br from-[#1b2230] via-[#10141d] to-[#0a0d12] shadow-inner shadow-black select-none ${sizeClasses[size]} ${className}`}
      title={`${name}${role ? ` (${role})` : ""}`}
    >
      {/* Victorian Cameo Brooch Rim */}
      <div className="absolute inset-0.5 rounded-full border border-[#8a6d3b]/30 pointer-events-none" />

      {/* Symbolic Silhouette Icon */}
      <Icon className={`${iconSizes[size]} opacity-80`} style={{ color: accentColor }} />

      {/* Subtle monogram watermark on larger sizes */}
      {(size === "md" || size === "lg") && (
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1b150e] border border-[#8a6d3b]/70 flex items-center justify-center text-[9px] font-['Cinzel'] font-bold text-[#dfb87f] shadow-sm">
          {initial}
        </span>
      )}
    </div>
  );
};
