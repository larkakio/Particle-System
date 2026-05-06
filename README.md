# NeoPulse Field (monorepo)

Mobile-first **NeoPulse Field** mini-app: swipe particle game + **daily `checkIn()`** on Base mainnet with **ERC-8021 builder attribution** via `ox`. Vercel **Root Directory**: `web`.

## Layout

| Path | Purpose |
|------|---------|
| `web/` | Next.js App Router, wagmi + viem |
| `contracts/` | Foundry `CheckIn.sol` |

## Contracts

```bash
cd contracts
forge test
forge script script/DeployCheckIn.s.sol --rpc-url "$BASE_RPC" --broadcast
```

Set `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` in `web/.env.local` (see `web/.env.example`). Current deploy: `0x2408F797A535C3Da3fFdE6b0606Cc913727dd3cE`.

## Web env

Copy `web/.env.example` → `web/.env.local`. Required for production:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CHAIN_ID=8453`
- `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_BASE_APP_ID` (from [base.dev](https://www.base.dev)) — also exposed as `<meta name="base:app_id" />` in layout
- `NEXT_PUBLIC_BUILDER_CODE` (e.g. `bc_…`) — suffix via `Attribution.toDataSuffix`
- Optional: `NEXT_PUBLIC_BUILDER_CODE_SUFFIX` (raw `0x` hex), `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

## Store assets

- `web/public/app-icon.jpg` — 1024×1024, &lt; 1MB  
- `web/public/app-thumbnail.jpg` — ~1.91:1, &lt; 1MB  

Generate (needs `sharp`):

```bash
cd web && npm run generate-assets
```

See `web/scripts/README.md` for crop / `sips` verification.

## Dev

```bash
cd web && npm run dev
```
