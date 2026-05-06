import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { baseAccount, injected, walletConnect } from "wagmi/connectors";

const wcId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    baseAccount({
      appName: process.env.NEXT_PUBLIC_APP_NAME ?? "NeoPulse Field",
    }),
    ...(wcId
      ? [
          walletConnect({
            projectId: wcId,
            showQrModal: true,
          }),
        ]
      : []),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
