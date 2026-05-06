"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LS_MAX = "neopulse-max-level";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
};

type LevelConfig = {
  id: number;
  title: string;
  blurb: string;
  count: number;
  ringFrac: number;
  holdSec: number;
  needInside: number;
  hazards: number;
  hazardFrac: number;
  damping: number;
  impulseCap: number;
};

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "Containment",
    blurb: "Swipe to herd ions into the core ring. Hold the charge above the threshold.",
    count: 140,
    ringFrac: 0.34,
    holdSec: 4.5,
    needInside: 0.66,
    hazards: 0,
    hazardFrac: 0,
    damping: 0.988,
    impulseCap: 2.1,
  },
  {
    id: 2,
    title: "Overload",
    blurb: "Hotter plasma, tighter lattice. Avoid crimson null-zones.",
    count: 195,
    ringFrac: 0.29,
    holdSec: 4.2,
    needInside: 0.7,
    hazards: 3,
    hazardFrac: 0.11,
    damping: 0.986,
    impulseCap: 2.35,
  },
  {
    id: 3,
    title: "Helix shear",
    blurb: "Drift is stronger. Pin the swarm to the torus.",
    count: 230,
    ringFrac: 0.27,
    holdSec: 4,
    needInside: 0.72,
    hazards: 4,
    hazardFrac: 0.1,
    damping: 0.984,
    impulseCap: 2.5,
  },
  {
    id: 4,
    title: "Singularity sweep",
    blurb: "Fast decay — decisive swipes only.",
    count: 260,
    ringFrac: 0.24,
    holdSec: 3.6,
    needInside: 0.74,
    hazards: 5,
    hazardFrac: 0.09,
    damping: 0.982,
    impulseCap: 2.65,
  },
  {
    id: 5,
    title: "Aurora terminal",
    blurb: "Final relay. Own the field.",
    count: 300,
    ringFrac: 0.22,
    holdSec: 3.4,
    needInside: 0.76,
    hazards: 6,
    hazardFrac: 0.085,
    damping: 0.98,
    impulseCap: 2.85,
  },
];

function readMaxUnlocked(): number {
  if (typeof window === "undefined") return 1;
  const v = parseInt(localStorage.getItem(LS_MAX) ?? "1", 10);
  if (Number.isNaN(v) || v < 1) return 1;
  return Math.min(v, LEVELS.length);
}

function writeMaxUnlocked(n: number) {
  localStorage.setItem(LS_MAX, String(Math.max(1, Math.min(n, LEVELS.length))));
}

function distPointSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-6) {
    const ax = px - x1;
    const ay = py - y1;
    return Math.sqrt(ax * ax + ay * ay);
  }
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = x1 + t * dx;
  const qy = y1 + t * dy;
  const ax = px - qx;
  const ay = py - qy;
  return Math.sqrt(ax * ax + ay * ay);
}

export function ParticleGame() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const hazardsRef = useRef<{ x: number; y: number }[]>([]);
  const rafRef = useRef(0);
  const accRef = useRef(0);
  const lastTsRef = useRef(0);
  const levelRef = useRef(1);
  const progressRef = useRef(0);
  const parallaxRef = useRef({ x: 0, y: 0 });
  const flashRef = useRef(0);
  const wonGateRef = useRef(false);
  const lastHudRef = useRef({ inside: 0, prog: 0 });

  const [levelIndex, setLevelIndex] = useState(1);
  const [hudProgress, setHudProgress] = useState(0);
  const [hudInside, setHudInside] = useState(0);
  const [modal, setModal] = useState<"synced" | "done" | null>(null);
  const maxUnlockedRef = useRef(1);

  const cfg = LEVELS[levelIndex - 1] ?? LEVELS[0];

  const resetLevel = useCallback((idx: number) => {
    const c = LEVELS[idx - 1];
    if (!c) return;
    const wrap = wrapRef.current;
    const w = wrap ? wrap.getBoundingClientRect().width : 400;
    const h = wrap ? wrap.getBoundingClientRect().height : 520;
    const cx = w / 2;
    const cy = h / 2;
    const pad = 24;
    const rng = (s: number) => {
      const x0 = Math.sin(s * 12.9898) * 43758.5453;
      return x0 - Math.floor(x0);
    };
    const pts: Particle[] = [];
    for (let i = 0; i < c.count; i++) {
      const u = rng(i + idx * 17);
      const v = rng(i * 3.1 + 4.2);
      pts.push({
        x: pad + u * (w - pad * 2),
        y: pad + v * (h - pad * 2),
        vx: (rng(i + 99) - 0.5) * 0.8,
        vy: (rng(i + 17) - 0.5) * 0.8,
        hue: 175 + rng(i * 7) * 120,
      });
    }
    particlesRef.current = pts;
    const hz: { x: number; y: number }[] = [];
    for (let i = 0; i < c.hazards; i++) {
      const angle = (i / Math.max(1, c.hazards)) * Math.PI * 2 + rng(idx * 31 + i);
      const rad = Math.min(w, h) * (0.18 + rng(i * 13) * 0.28);
      hz.push({
        x: cx + Math.cos(angle) * rad,
        y: cy + Math.sin(angle) * rad,
      });
    }
    hazardsRef.current = hz;
    progressRef.current = 0;
    levelRef.current = idx;
    wonGateRef.current = false;
    lastHudRef.current = { inside: 0, prog: 0 };
    setHudProgress(0);
    setHudInside(0);
  }, []);

  useEffect(() => {
    maxUnlockedRef.current = readMaxUnlocked();
    setLevelIndex(maxUnlockedRef.current);
  }, []);

  useEffect(() => {
    resetLevel(levelIndex);
  }, [levelIndex, resetLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const drawing = ctx;

    let swipeActive = false;
    let sx = 0,
      sy = 0,
      ex = 0,
      ey = 0;

    function resize() {
      const root = wrapRef.current;
      const cv = canvasRef.current;
      if (!root || !cv) return;
      const r = root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2.5);
      cv.width = Math.floor(r.width * dpr);
      cv.height = Math.floor(r.height * dpr);
      cv.style.width = `${r.width}px`;
      cv.style.height = `${r.height}px`;
      drawing.setTransform(dpr, 0, 0, dpr, 0, 0);
      resetLevel(levelRef.current);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    function applySwipe() {
      const cv = canvasRef.current;
      if (!cv) return;
      const dx = ex - sx;
      const dy = ey - sy;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 8) return;
      const nx = dx / len;
      const ny = dy / len;
      const lc = LEVELS[levelRef.current - 1];
      const cap = lc?.impulseCap ?? 2.2;
      const swipeStrength = Math.min(len * 0.05, cap * 8);
      parallaxRef.current.x += nx * 3;
      parallaxRef.current.y += ny * 3;

      const parts = particlesRef.current;
      const b = cv.getBoundingClientRect();
      const w = b.width;
      const h = b.height;
      const influence = Math.min(w, h) * 0.22;
      for (const p of parts) {
        const d = distPointSegment(p.x, p.y, sx, sy, ex, ey);
        if (d > influence) continue;
        const fall = 1 - d / influence;
        const mag = swipeStrength * fall * 0.04;
        p.vx += nx * mag;
        p.vy += ny * mag;
      }
    }

    function onPointerDown(e: PointerEvent) {
      const cv = canvasRef.current;
      if (!cv || wonGateRef.current) return;
      cv.setPointerCapture(e.pointerId);
      swipeActive = true;
      const b = cv.getBoundingClientRect();
      sx = e.clientX - b.left;
      sy = e.clientY - b.top;
      ex = sx;
      ey = sy;
    }

    function onPointerMove(e: PointerEvent) {
      if (!swipeActive || wonGateRef.current) return;
      const cv = canvasRef.current;
      if (!cv) return;
      const b = cv.getBoundingClientRect();
      ex = e.clientX - b.left;
      ey = e.clientY - b.top;
    }

    function onPointerUp(e: PointerEvent) {
      if (!swipeActive) return;
      swipeActive = false;
      const cv = canvasRef.current;
      if (!cv) return;
      const b = cv.getBoundingClientRect();
      ex = e.clientX - b.left;
      ey = e.clientY - b.top;
      if (!wonGateRef.current) applySwipe();
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    const FIXED = 1000 / 120;
    lastTsRef.current = performance.now();

    function tick(now: number) {
      const c2 = LEVELS[levelRef.current - 1];
      if (!c2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const el = canvasRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const b = el.getBoundingClientRect();
      const wPhys = b.width;
      const hPhys = b.height;
      const cx = wPhys / 2;
      const cy = hPhys / 2;

      const dtMs = now - lastTsRef.current;
      lastTsRef.current = now;
      accRef.current += dtMs;

      let stepped = false;

      if (!wonGateRef.current) {
        while (accRef.current >= FIXED) {
          accRef.current -= FIXED;
          stepped = true;
          const tsec = now * 0.001;
          const ringR =
            Math.min(wPhys, hPhys) *
            c2.ringFrac *
            (1 + 0.045 * Math.sin(tsec * 2.1));

          const parts = particlesRef.current;
          const pad = 20;
          const damp = c2.damping;

          for (const p of parts) {
            p.vx *= damp;
            p.vy *= damp;
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < pad) {
              p.x = pad;
              p.vx *= -0.35;
            }
            if (p.x > wPhys - pad) {
              p.x = wPhys - pad;
              p.vx *= -0.35;
            }
            if (p.y < pad) {
              p.y = pad;
              p.vy *= -0.35;
            }
            if (p.y > hPhys - pad) {
              p.y = hPhys - pad;
              p.vy *= -0.35;
            }
          }

          let inside = 0;
          let hazardHit = false;
          const hzR = Math.min(wPhys, hPhys) * c2.hazardFrac * 1.1;
          for (const p of parts) {
            const d = Math.hypot(p.x - cx, p.y - cy);
            if (d < ringR) inside++;

            for (const h of hazardsRef.current) {
              if (hzR > 0 && Math.hypot(p.x - h.x, p.y - h.y) < hzR) {
                hazardHit = true;
                break;
              }
            }
          }
          const frac = inside / Math.max(1, parts.length);

          if (hazardHit) {
            progressRef.current = Math.max(0, progressRef.current - FIXED * 0.004);
          } else if (frac >= c2.needInside) {
            progressRef.current += FIXED;
          } else {
            progressRef.current = Math.max(0, progressRef.current - FIXED * 0.0025);
          }

          const needMs = c2.holdSec * 1000;
          lastHudRef.current = {
            inside: frac,
            prog: Math.min(1, progressRef.current / needMs),
          };

          if (progressRef.current >= needMs && !wonGateRef.current) {
            wonGateRef.current = true;
            flashRef.current = 1;
            const cur = levelRef.current;
            const next = cur + 1;
            maxUnlockedRef.current = Math.max(maxUnlockedRef.current, Math.min(next, LEVELS.length));
            writeMaxUnlocked(maxUnlockedRef.current);
            progressRef.current = 0;
            lastHudRef.current = { inside: frac, prog: 1 };
            setModal(cur >= LEVELS.length ? "done" : "synced");
            break;
          }
        }
      }

      if (stepped) {
        setHudInside(lastHudRef.current.inside);
        setHudProgress(lastHudRef.current.prog);
      }

      const dpr = Math.min(window.devicePixelRatio ?? 1, 2.5);
      drawing.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawing.fillStyle = "#03050a";
      drawing.fillRect(0, 0, wPhys, hPhys);

      const px = parallaxRef.current.x;
      const py = parallaxRef.current.y;
      parallaxRef.current.x *= 0.92;
      parallaxRef.current.y *= 0.92;

      const hexS = 26;
      drawing.strokeStyle = "rgba(0,255,213,0.04)";
      drawing.lineWidth = 1;
      for (let y = -hexS; y < hPhys + hexS; y += hexS * 1.5) {
        for (let x = -hexS; x < wPhys + hexS; x += hexS * 1.732) {
          const ox = (x + px) % (hexS * 3.464);
          const oy = (y + py + (x % 2) * hexS * 0.75) % (hexS * 3);
          drawing.beginPath();
          for (let i = 0; i < 6; i++) {
            const ang = (Math.PI / 3) * i;
            const hx = ox + Math.cos(ang) * hexS * 0.45;
            const hy = oy + Math.sin(ang) * hexS * 0.45;
            if (i === 0) drawing.moveTo(hx, hy);
            else drawing.lineTo(hx, hy);
          }
          drawing.closePath();
          drawing.stroke();
        }
      }

      const pulse = (Math.sin(now * 0.003) + 1) * 0.5;
      const ringR =
        Math.min(wPhys, hPhys) *
        c2.ringFrac *
        (1 + 0.045 * Math.sin(now * 0.0021));

      drawing.save();
      drawing.shadowColor = `rgba(0, 255, 230, ${0.35 + pulse * 0.35})`;
      drawing.shadowBlur = 28;
      drawing.strokeStyle = `rgba(0,255,230,${0.45 + pulse * 0.25})`;
      drawing.lineWidth = 2.5;
      drawing.beginPath();
      drawing.arc(cx, cy, ringR, 0, Math.PI * 2);
      drawing.stroke();
      drawing.restore();

      drawing.strokeStyle = "rgba(255,0,170,0.25)";
      drawing.lineWidth = 1;
      drawing.beginPath();
      drawing.arc(cx, cy, ringR * 0.98, 0, Math.PI * 2);
      drawing.stroke();

      const hzR = Math.min(wPhys, hPhys) * c2.hazardFrac * 1.1;
      for (const h of hazardsRef.current) {
        if (hzR <= 0) break;
        const g = drawing.createRadialGradient(h.x, h.y, 0, h.x, h.y, hzR * 1.4);
        g.addColorStop(0, "rgba(255,40,80,0.45)");
        g.addColorStop(1, "rgba(255,0,60,0)");
        drawing.fillStyle = g;
        drawing.beginPath();
        drawing.arc(h.x, h.y, hzR * 1.4, 0, Math.PI * 2);
        drawing.fill();
      }

      drawing.save();
      drawing.globalCompositeOperation = "lighter";
      for (const p of particlesRef.current) {
        const spd = Math.hypot(p.vx, p.vy);
        const alpha = 0.35 + Math.min(0.45, spd * 0.6);
        drawing.fillStyle = `hsla(${p.hue}, 95%, 62%, ${alpha})`;
        drawing.shadowColor = `hsl(${p.hue}, 100%, 55%)`;
        drawing.shadowBlur = 10;
        drawing.beginPath();
        drawing.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        drawing.fill();
      }
      drawing.restore();

      if (flashRef.current > 0.02) {
        drawing.fillStyle = `rgba(220, 255, 255, ${flashRef.current * 0.15})`;
        drawing.fillRect(0, 0, wPhys, hPhys);
        flashRef.current *= 0.85;
      } else flashRef.current = 0;

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [resetLevel]);

  useEffect(() => {
    if (!modal) return;
    const id = window.setTimeout(() => {
      const cur = levelRef.current;
      setModal(null);
      if (modal === "synced" && cur < LEVELS.length) {
        setLevelIndex(cur + 1);
      } else if (modal === "done" || cur >= LEVELS.length) {
        setLevelIndex(LEVELS.length);
        resetLevel(LEVELS.length);
      }
    }, 1400);
    return () => clearTimeout(id);
  }, [modal, resetLevel]);

  return (
    <div className="flex min-h-0 shrink-0 flex-col gap-2">
      <div className="neo-panel flex flex-col gap-2 p-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-[family-name:var(--font-display)] text-[10px] tracking-[0.4em] text-[var(--neo-lime)]">
              Sector {cfg.id} / {LEVELS.length}
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--neo-cyan)]">
              {cfg.title}
            </h2>
            <p className="mt-1 max-w-md text-[11px] leading-relaxed text-[var(--neo-muted)]">
              {cfg.blurb}
            </p>
          </div>
          <div className="text-right font-mono text-[10px] text-[var(--neo-magenta)]">
            <div>Core fill {(hudInside * 100).toFixed(0)}%</div>
            <div>Target {(cfg.needInside * 100).toFixed(0)}%+</div>
          </div>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/60 ring-1 ring-[var(--neo-cyan)]/25">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--neo-magenta)] via-[var(--neo-cyan)] to-[var(--neo-lime)] transition-[width] duration-100"
            style={{ width: `${Math.round(hudProgress * 100)}%` }}
          />
        </div>
      </div>

      <div
        ref={wrapRef}
        className="neo-scanlines relative isolate h-[min(26rem,52dvh)] w-full max-h-[520px] shrink-0 overflow-hidden rounded-xl border-2 border-[var(--neo-cyan)]/40 bg-[#020308] shadow-[0_0_40px_rgba(0,255,230,0.08)] touch-none"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full cursor-crosshair touch-none active:cursor-grabbing"
        />
        <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-center font-mono text-[10px] text-[var(--neo-muted)]">
          Swipe across the field to push ions · charge the containment ring
        </p>
      </div>

      {modal === "synced" ? (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-6">
          <div className="neo-panel max-w-sm border-[var(--neo-lime)]/50 p-8 text-center shadow-[0_0_60px_rgba(185,255,0,0.15)]">
            <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.5em] text-[var(--neo-lime)]">
              Relay stable
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--neo-cyan)]">
              Sector cleared
            </p>
          </div>
        </div>
      ) : null}
      {modal === "done" ? (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-6">
          <div className="neo-panel max-w-sm border-[var(--neo-magenta)]/40 p-8 text-center">
            <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.4em] text-[var(--neo-magenta)]">
              Lattice synchronized
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--neo-cyan)]">
              All sectors online
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
