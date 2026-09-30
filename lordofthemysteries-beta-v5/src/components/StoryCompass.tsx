import React from "react";
import { Compass, Flame, KeyRound, TriangleAlert } from "lucide-react";
import type { DramaticDirectorState } from "../game/dramaticDirector";

interface StoryCompassProps {
  director?: DramaticDirectorState;
}

const urgencyLabel: Record<DramaticDirectorState["urgency"], string> = {
  baixa: "Há tempo para pensar",
  crescente: "O caso está ganhando velocidade",
  alta: "A janela está estreitando",
  crítica: "Uma decisão não pode esperar muito",
};

export function StoryCompass({ director }: StoryCompassProps) {
  if (!director) return null;

  const openPromises = director.promises.filter((promise) => promise.status === "open");
  const nearestPromise = [...openPromises].sort((a, b) => a.dueTurn - b.dueTurn)[0];

  return (
    <section className="story-compass" aria-label="Fio atual da crônica">
      <div className="story-compass__header">
        <div className="story-compass__title">
          <Compass className="w-4 h-4" />
          <span>Fio da Crônica</span>
        </div>
        <span className={`story-compass__urgency story-compass__urgency--${director.urgency}`}>
          {urgencyLabel[director.urgency]}
        </span>
      </div>

      <div className="story-compass__grid">
        <div className="story-compass__cell story-compass__cell--goal">
          <div className="story-compass__eyebrow"><Flame className="w-3.5 h-3.5" /> Agora</div>
          <p>{director.currentGoal}</p>
        </div>
        <div className="story-compass__cell">
          <div className="story-compass__eyebrow"><KeyRound className="w-3.5 h-3.5" /> Melhor fio</div>
          <p>{director.currentLead}</p>
        </div>
        <div className="story-compass__cell">
          <div className="story-compass__eyebrow"><TriangleAlert className="w-3.5 h-3.5" /> Em risco</div>
          <p>{director.stakes}</p>
        </div>
      </div>

      {(director.lastChangeSummary.length > 0 || nearestPromise) && (
        <div className="story-compass__footer">
          <div className="story-compass__echoes">
            {director.lastChangeSummary.slice(0, 2).map((change) => (
              <span key={change}>{change}</span>
            ))}
          </div>
          {nearestPromise && (
            <div className="story-compass__thread" title="Um detalhe apresentado antes ainda não recebeu resposta narrativa.">
              fio pendente: {nearestPromise.label}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
