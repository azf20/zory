import { useQuery } from "@tanstack/react-query";
import { base } from "viem/chains";
import { getCoins } from "@zoralabs/coins-sdk";

export interface CreatedZory {
  coinAddress: string;
  uri: string;
  name: string;
  blockNum: number;
  // Optional Zora data
  zoraData?: {
    name: string;
    description?: string;
    symbol?: string;
    totalSupply?: string;
    marketCap?: string;
    volume24h?: string;
    uniqueHolders?: number;
    mediaContent?: {
      previewImage?: {
        medium?: string;
      };
    };
  };
}

interface UseCreatedZoriesOptions {
  page?: number;
  pageSize?: number;
}

export function useCreatedZories({
  page = 0,
  pageSize = 12,
}: UseCreatedZoriesOptions = {}) {
  return useQuery({
    queryKey: ["createdZories", page, pageSize],
    queryFn: async (): Promise<{ zories: CreatedZory[]; total: number }> => {
      const response = await fetch(
        `https://api.indexsupply.net/query?chain=${base.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              event_signatures: [
                "CoinCreatedV4 (address indexed caller, address indexed payoutRecipient, address indexed platformReferrer, address currency, string uri, string name, string symbol, address coin, (address,address,uint24,int24,address) poolKey, bytes32 poolKeyHash, string version)",
                "ContractMetadataUpdated (address indexed updater, string uri, string name)",
              ],
              query: `select address, uri, name, block_num from contractmetadataupdated where address in (select coin from coincreatedv4 where platformReferrer = ${process.env.NEXT_PUBLIC_PLATFORM_REFERRER}) order by block_num desc limit 1000`,
            },
          ]),
          method: "POST",
        },
      );

      const apiResult = await response.json();
      const coinsResult = apiResult?.result?.[0].slice(1) || [];

      // Transform the results into our interface and filter to unique addresses
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addressMap = new Map<string, any[]>();

      // Keep only the first occurrence of each address (most recent due to ORDER BY block_num DESC)
      coinsResult.forEach((row: any[]) => {
        const coinAddress = row[0];
        if (!addressMap.has(coinAddress)) {
          addressMap.set(coinAddress, row);
        }
      });

      const allZories: CreatedZory[] = Array.from(addressMap.values()).map(
        (row: any[]) => ({
          coinAddress: row[0], // coin address
          uri: row[1], // uri
          name: row[2], // name
          blockNum: row[3], // block num
        }),
      );

      // Apply pagination
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedZories = allZories.slice(startIndex, endIndex);

      // Fetch Zora data for paginated coins if available
      if (paginatedZories.length > 0) {
        try {
          const zoraResponse = await getCoins({
            coins: paginatedZories.map((zory) => ({
              chainId: base.id,
              collectionAddress: zory.coinAddress,
            })),
          });

          console.log(zoraResponse);

          // Merge Zora data with existing data by matching addresses
          const zoraTokens = zoraResponse.data?.zora20Tokens || [];
          const zoraTokenMap = new Map(
            zoraTokens
              .filter((token) => token && token.address) // Filter out null/undefined tokens
              .map((token) => [token.address.toLowerCase(), token]),
          );

          console.log(zoraTokenMap);

          paginatedZories.forEach((zory) => {
            const zoraToken = zoraTokenMap.get(zory.coinAddress.toLowerCase());
            if (zoraToken) {
              zory.zoraData = {
                name: zoraToken.name,
                description: zoraToken.description,
                symbol: zoraToken.symbol,
                totalSupply: zoraToken.totalSupply,
                marketCap: zoraToken.marketCap,
                volume24h: zoraToken.volume24h,
                uniqueHolders: zoraToken.uniqueHolders,
                mediaContent: zoraToken.mediaContent,
              };
            }
          });
        } catch (error) {
          // Silently fail - we'll use existing data with Zorb images
          console.warn("Failed to fetch Zora data:", error);
        }
      }

      return {
        zories: paginatedZories,
        total: allZories.length,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}
