"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { base } from "wagmi/chains";
import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";

export function WalletBar() {
  const chainId = useChainId();
  const { address, isConnected, status } = useAccount();
  const { connectors, connect, isPending: isConnecting, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrongNetwork = isConnected && chainId !== base.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected) setSheetOpen(false);
  }, [isConnected]);

  useEffect(() => {
    if (!sheetOpen || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const sheet =
    mounted && sheetOpen ? (
      <div
        className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/75 p-3 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Choose wallet"
        onClick={() => setSheetOpen(false)}
      >
        <div
          className="neo-panel mx-auto mb-[env(safe-area-inset-bottom)] w-full max-w-lg p-4 shadow-[0_-8px_40px_rgba(0,0,0,0.5)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-sm tracking-widest text-[var(--neo-lime)]">
              Connect
            </h2>
            <button
              type="button"
              className="rounded p-1 text-[var(--neo-muted)] hover:text-[var(--neo-fg)]"
              onClick={() => setSheetOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {connectors.length === 0 ? (
            <p className="text-center text-xs text-[var(--neo-muted)]">
              No wallets detected. Open in a browser with an Ethereum wallet extension, or use Base App /
              Metamask in-app browser.
            </p>
          ) : (
            <ul className="flex max-h-[min(70dvh,420px)] flex-col gap-2 overflow-y-auto pr-1">
              {connectors.map((c) => (
                <li key={c.uid}>
                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={() => connect({ connector: c, chainId: base.id })}
                    className="neo-wallet-row w-full py-3 text-left text-sm"
                  >
                    <span className="font-medium text-[var(--neo-fg)]">{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    ) : null;

  return (
    <>
      <header className="neo-border-b relative z-50 shrink-0 bg-[#04060f]/95 px-3 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--font-display)] text-[10px] uppercase tracking-[0.35em] text-[var(--neo-cyan)]">
              NeoPulse Field
            </p>
            {isConnected && address ? (
              <p className="truncate font-mono text-xs text-[var(--neo-muted)]">
                {`${address.slice(0, 6)}…${address.slice(-4)}`}
              </p>
            ) : (
              <p className="text-xs text-[var(--neo-muted)]">Wallet offline</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isConnected ? (
              <button
                type="button"
                onClick={() => disconnect()}
                className="neo-btn-ghost text-xs"
              >
                Disconnect
              </button>
            ) : null}
            <button
              type="button"
              disabled={status === "connecting" || isConnecting}
              onClick={() => setSheetOpen(true)}
              className="neo-btn px-4 py-2 text-xs font-semibold"
            >
              {isConnected ? "Wallet" : "Connect wallet"}
            </button>
          </div>
        </div>

        {wrongNetwork ? (
          <div className="mx-auto mt-2 flex max-w-lg items-center justify-between gap-2 rounded-lg border border-[#ff3355]/50 bg-[#1a0510]/90 px-3 py-2">
            <span className="text-xs text-[#ff6688]">Wrong network — switch to Base.</span>
            <button
              type="button"
              disabled={isSwitching}
              onClick={() => switchChain({ chainId: base.id })}
              className="shrink-0 rounded-md bg-[#ff3355] px-3 py-1.5 text-xs font-bold text-black"
            >
              {isSwitching ? "…" : "Base"}
            </button>
          </div>
        ) : null}

        {error ? (
          <p className="mx-auto mt-1 max-w-lg text-xs text-red-400">{error.message}</p>
        ) : null}
      </header>
      {typeof document !== "undefined" && sheet ? createPortal(sheet, document.body) : null}
    </>
  );
}
