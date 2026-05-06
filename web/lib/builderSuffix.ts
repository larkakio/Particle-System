import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

/**
 * ERC-8021 data suffix for Base builder codes on `checkIn` transactions.
 */
export function getCheckInDataSuffix(): Hex | undefined {
  const override = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (override?.startsWith("0x") && override.length > 2) {
    return override as Hex;
  }
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE;
  if (!code?.trim()) return undefined;
  return Attribution.toDataSuffix({
    codes: [code.trim()],
  }) as Hex;
}
