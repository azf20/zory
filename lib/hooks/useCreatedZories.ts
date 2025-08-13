import { useQuery } from "@tanstack/react-query";
import { base } from "viem/chains";

interface CreatedZory {
  coinAddress: string;
  callerAddress: string;
}

export function useCreatedZories() {
  return useQuery({
    queryKey: ["createdZories"],
    queryFn: async (): Promise<CreatedZory[]> => {
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
              ],
              query: `select coin, caller
                     from coincreatedv4
                     where platformReferrer = ${process.env.NEXT_PUBLIC_PLATFORM_REFERRER}
                     order by block_num desc`,
            },
          ]),
          method: "POST",
        },
      );

      const apiResult = await response.json();
      const coinsResult = apiResult?.result?.[0].slice(1) || [];

      // Transform the results into our interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdZories: CreatedZory[] = coinsResult.map((row: any[]) => ({
        coinAddress: row[0], // coin address
        callerAddress: row[1], // caller address
      }));

      return createdZories;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}
