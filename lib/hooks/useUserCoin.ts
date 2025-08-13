import { useQuery } from "@tanstack/react-query";
import { useReadContract } from "wagmi";
import {
  getCoin,
  cleanAndValidateMetadataURI,
  ValidMetadataURI,
  GetCoinResponse,
} from "@zoralabs/coins-sdk";
import { base } from "viem/chains";
import { INDEX_SUPPLY_EVENT_SIGNATURE } from "@/lib/abi/zoraFactory";

// ABI for the Zora coin contract to read tokenURI
const coinABI = [
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
] as const;

export interface UserCoinData {
  coinAddress: string;
  metadataUri: string;
  metadata?: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    properties: {
      creator: string;
      timestamp: string;
      platform: string;
      mediaCount: string;
    };
    content: {
      mime: string;
      uri: string;
      type: string;
      carousel: {
        version: string;
        media: Array<{
          uri: string;
          mime: string;
          timestamp: string;
        }>;
      };
    };
  };
  coin?: GetCoinResponse["zora20Token"];
}

type UseUserCoinParams = {
  address?: string;
  coinAddress?: `0x${string}`; // pre-fetched coin address
  tokenURI?: string; // pre-fetched tokenURI
  metadata?: UserCoinData["metadata"]; // pre-fetched metadata JSON
};

export function useUserCoin({
  address,
  coinAddress: coinAddressInput,
  tokenURI: tokenURIInput,
  metadata: metadataInput,
}: UseUserCoinParams) {
  // Resolve coin address preference: input > token supply fallback
  const tokenSupplyQuery = useQuery({
    queryKey: ["tokenSupply", address],
    queryFn: async () => {
      if (!address) return null;

      const response = await fetch(
        `https://api.indexsupply.net/query?chain=${base.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              event_signatures: [INDEX_SUPPLY_EVENT_SIGNATURE],
              query: `select caller, platformReferrer, coin, uri, name
                     from coincreatedv4
                     where platformReferrer = ${process.env.NEXT_PUBLIC_PLATFORM_REFERRER}
                     and caller = ${address}
                     order by block_num desc`,
            },
          ]),
          method: "POST",
        },
      );

      const apiResult = await response.json();
      const coinsResult = apiResult?.result?.[0].slice(1) || [];

      if (coinsResult.length > 0) {
        const userCoin = coinsResult[0]; // Take the first (most recent) coin
        return {
          coinAddress: userCoin[2], // coin address
          name: userCoin[4], // name from Index Supply
        };
      }

      return null;
    },
    enabled: !!address && !coinAddressInput, // skip if provided
  });

  const coinAddress = coinAddressInput || tokenSupplyQuery.data?.coinAddress;

  // Token URI preference: input > contract read
  const tokenURIQuery = useReadContract({
    abi: coinABI,
    address: coinAddress as `0x${string}`,
    functionName: "tokenURI",
    query: {
      enabled: !!coinAddress && !tokenURIInput, // skip if provided
    },
  });

  const tokenURI = tokenURIInput || tokenURIQuery.data;

  // Metadata JSON preference: input > fetch
  const metadataQuery = useQuery({
    queryKey: ["metadata", tokenURI],
    queryFn: async () => {
      if (!tokenURI) return null;

      try {
        const cleanedURI = cleanAndValidateMetadataURI(
          tokenURI as ValidMetadataURI,
        );
        const metadataResponse = await fetch(cleanedURI);
        if (metadataResponse.ok) {
          return await metadataResponse.json();
        }
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
      return null;
    },
    enabled: !!tokenURI && !metadataInput, // skip if provided
  });

  // Zora coin info (keep this for richer UI)
  const zoraDataQuery = useQuery({
    queryKey: ["zoraData", coinAddress],
    queryFn: async () => {
      if (!coinAddress) return null;
      try {
        const coinResponse = await getCoin({
          address: coinAddress,
          chain: base.id,
        });
        return coinResponse.data?.zora20Token || null;
      } catch (error) {
        console.error("Failed to fetch Zora coin data:", error);
        return null;
      }
    },
    enabled: !!coinAddress,
  });

  // Combine all data into the final result
  const isLoading =
    (!address && !coinAddressInput) ||
    (address && tokenSupplyQuery.isLoading && !coinAddressInput) ||
    (coinAddress && tokenURIQuery.isLoading && !tokenURIInput) ||
    (tokenURI && metadataQuery.isLoading && !metadataInput) ||
    (coinAddress && zoraDataQuery.isLoading);

  const isError =
    tokenSupplyQuery.isError ||
    tokenURIQuery.isError ||
    metadataQuery.isError ||
    zoraDataQuery.isError;

  const error =
    tokenSupplyQuery.error ||
    tokenURIQuery.error ||
    metadataQuery.error ||
    zoraDataQuery.error;

  // Construct the final data object
  let data: UserCoinData | null = null;

  if (coinAddress) {
    const effectiveTokenURI = (tokenURI || "") as string;
    const effectiveMetadata = (metadataInput ||
      metadataQuery.data ||
      undefined) as UserCoinData["metadata"] | undefined;

    data = {
      coinAddress,
      metadataUri: effectiveTokenURI,
      metadata: effectiveMetadata,
      coin: zoraDataQuery.data || undefined,
    };
  }

  return {
    data,
    isLoading,
    isError,
    error,
    refetchTokenURI: tokenURIQuery.refetch,
    refetchTokenSupply: tokenSupplyQuery.refetch,
  };
}
