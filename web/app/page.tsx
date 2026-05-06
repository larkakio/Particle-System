import { WalletBar } from "@/components/WalletBar";
import { CheckInPanel } from "@/components/CheckInPanel";
import { ParticleGame } from "@/components/game/ParticleGame";

export default function Home() {
  return (
    <div className="mx-auto flex h-dvh max-h-dvh max-w-lg flex-col overflow-x-hidden px-3 pb-3 pt-1">
      <WalletBar />
      <main className="mt-3 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain py-2">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-black tracking-tight text-[var(--neo-cyan)] drop-shadow-[0_0_18px_rgba(0,255,229,0.35)]">
            NEOPULSE FIELD
          </h1>
          <p className="mt-1 text-xs text-[var(--neo-muted)]">
            Kinetic containment · Base mainnet rituals
          </p>
        </div>
        <ParticleGame />
        <CheckInPanel />
      </main>
    </div>
  );
}
