import React, { useEffect, useRef } from "react";

interface ParticleSigilProps {
  /** Texto curto a ser formado pelas partículas (ex.: "82%", "LOM", um símbolo) */
  text: string;
  /** 0 = mente estável (partículas quietas e firmes) · 1 = à beira do colapso (tremem sozinhas, custam a se reformar) */
  instability?: number;
  fontSizeRatio?: number;
  height?: number;
  className?: string;
}

/**
 * Sigilo formado por partículas — usado como retrato do estado mental do investigador.
 * Reage ao mouse numa área do tamanho da própria ponta do cursor (não uma "bola" grande),
 * e sua instabilidade de repouso reflete a sanidade atual do personagem.
 */
export const ParticleSigil: React.FC<ParticleSigilProps> = ({
  text,
  instability = 0,
  fontSizeRatio = 0.4,
  height = 90,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instabilityRef = useRef(instability);
  instabilityRef.current = instability;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    const H = height;
    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    let animationId: number;
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999 };

    class Particle {
      tx: number;
      ty: number;
      x: number;
      y: number;
      vx = 0;
      vy = 0;
      size: number;
      ease: number;
      jitterSeed: number;
      color: string;
      alpha: number;

      constructor(tx: number, ty: number) {
        this.tx = tx;
        this.ty = ty;
        this.x = tx;
        this.y = ty;
        this.size = 1 + Math.random() * 1.4;
        this.ease = 0.1 + Math.random() * 0.05;
        this.jitterSeed = Math.random() * 1000;
        this.color = Math.random() < 0.1 ? "139, 28, 28" : "218, 178, 120";
        this.alpha = 0.55 + Math.random() * 0.45;
      }
      update(t: number) {
        // Raio do tamanho da ponta do cursor — só dissolve o que o mouse realmente toca
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const radius = 16;
        if (dist < radius) {
          const force = (radius - dist) / radius;
          this.vx += (dx / dist) * force * 2.4;
          this.vy += (dy / dist) * force * 2.4;
        }

        // Instabilidade de repouso: quanto menor a sanidade, mais a partícula treme sozinha
        const inst = instabilityRef.current;
        if (inst > 0) {
          this.vx += Math.sin(t * 0.004 + this.jitterSeed) * inst * 0.5;
          this.vy += Math.cos(t * 0.005 + this.jitterSeed) * inst * 0.5;
        }

        // Atração de volta ao ponto-alvo — mais lenta quanto maior a instabilidade (custa mais a se recompor)
        const returnStrength = this.ease * (1 - inst * 0.6);
        this.vx += (this.tx - this.x) * returnStrength;
        this.vy += (this.ty - this.y) * returnStrength;
        this.vx *= 0.88;
        this.vy *= 0.88;
        this.x += this.vx;
        this.y += this.vy;
      }
      draw() {
        ctx!.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function buildTargets(): { x: number; y: number }[] {
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const octx = off.getContext("2d")!;
      octx.fillStyle = "#fff";
      octx.font = `bold ${H * fontSizeRatio}px Georgia, serif`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillText(text, W / 2, H / 2);

      const data = octx.getImageData(0, 0, W, H).data;
      const pts: { x: number; y: number }[] = [];
      const step = 3;
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (data[(y * W + x) * 4 + 3] > 120) pts.push({ x, y });
        }
      }
      return pts;
    }

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas!.parentElement?.clientWidth || 200;
      canvas!.width = W * DPR;
      canvas!.height = H * DPR;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      particles = buildTargets().map((p) => new Particle(p.x, p.y));
    }

    function handleMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function handleLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function loop(t: number) {
      ctx!.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.update(t);
        p.draw();
      }
      animationId = requestAnimationFrame(loop);
    }

    resize();
    loop(0);
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, [text, fontSizeRatio, height]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height }}
      aria-hidden="true"
    />
  );
};
