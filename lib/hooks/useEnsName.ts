import { useEnsName } from "wagmi";
import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { type Address } from "viem";

// Create a separate config for mainnet ENS queries
const mainnetConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

export function useEnsNameMainnet({
  address,
}: {
  address: Address | undefined;
}) {
  return useEnsName({
    address,
    config: mainnetConfig,
  });
}
