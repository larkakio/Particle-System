"use client";

import { base } from "wagmi/chains";
import { useAccount, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import { getCheckInAddress, checkInAbi } from "@/lib/checkIn";
import { getCheckInDataSuffix } from "@/lib/builderSuffix";

export function CheckInPanel() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const contractAddress = getCheckInAddress();
  const wrongNetwork = isConnected && chainId !== base.id;
  const busy = isWriting || isSwitching;
  const suffix = getCheckInDataSuffix();

  async function onCheckIn() {
    if (!contractAddress) return;
    const baseId = base.id;
    if (chainId !== baseId) {
      await switchChainAsync({ chainId: baseId });
    }
    await writeContractAsync({
      address: contractAddress,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: baseId,
      ...(suffix ? { dataSuffix: suffix } : {}),
    });
  }

  if (!isConnected) {
    return (
      <section className="neo-panel p-4">
        <p className="text-xs text-[var(--neo-muted)]">Connect your wallet to submit a daily check-in on Base (gas only).</p>
      </section>
    );
  }

  if (!contractAddress) {
    return (
      <section className="neo-panel border-[#886600]/40 p-4">
        <p className="text-xs text-[#ccb04a]">
          Set <code className="font-mono">NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS</code> after deploying the Foundry contract.
        </p>
      </section>
    );
  }

  return (
    <section className="neo-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xs tracking-[0.25em] text-[var(--neo-magenta)]">
            Daily check-in
          </h3>
          <p className="mt-1 text-[11px] text-[var(--neo-muted)]">
            Once per UTC day · Streak tracked on-chain · Builder attribution suffix{" "}
            {suffix ? "enabled" : "optional (set NEXT_PUBLIC_BUILDER_CODE)"}
          </p>
        </div>
        <button
          type="button"
          disabled={wrongNetwork || busy}
          onClick={onCheckIn}
          className="neo-btn px-5 py-2.5 text-xs font-bold disabled:opacity-40"
        >
          {busy ? "Signing…" : "Check in"}
        </button>
      </div>
    </section>
  );
}
