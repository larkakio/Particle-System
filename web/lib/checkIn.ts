import type { Address } from "viem";

export const checkInAbi = [
  {
    type: "function",
    name: "checkIn",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "event",
    name: "CheckedIn",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "dayIndex", type: "uint256", indexed: false },
      { name: "newStreak", type: "uint256", indexed: false },
    ],
  },
] as const;

export function getCheckInAddress(): Address | undefined {
  const raw = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return undefined;
  return raw as Address;
}
