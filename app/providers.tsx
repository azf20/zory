"use client";

import { type ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import ZoryAvatar from "./components/ZoryAvatar";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [base],
    transports: {
      // RPC URL for each chain
      [base.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_RPC || undefined),
    },

    // Required API Keys
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",

    // Required App Info
    appName: "Zory",

    // Optional App Info
    appDescription: "Capture moments, create your coin",
    appUrl: process.env.NEXT_PUBLIC_URL || "https://zory.app", // your app's url
    appIcon: "/zory.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
    enableFamily: false, // true by default
  }),
);

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY}
      chain={base}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider
            options={{
              customAvatar: ZoryAvatar,
            }}
          >
            {props.children}
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MiniKitProvider>
  );
}
