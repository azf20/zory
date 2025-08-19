"use client";

import { useParams } from "next/navigation";
import ViewZory from "@/app/components/ViewZory";
import { useCoin } from "@/lib/hooks/useCoin";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function ViewAddressPage() {
  const params = useParams();
  const coinAddress = params.coinAddress as string;
  const account = useAccount();
  const router = useRouter();

  const { data: userCoinData, isLoading: isLoadingUserCoin } = useCoin({
    coinAddress: coinAddress as `0x${string}`,
  });

  // Get title from Zora data or fallback to address

  const creatorAddress = userCoinData?.coin?.creatorAddress;

  const title =
    userCoinData?.coin?.name ||
    `Zory ${creatorAddress ? `by ${creatorAddress.slice(0, 6)}...${creatorAddress.slice(-4)}` : ""}`;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        </div>

        <ViewZory
          address={coinAddress}
          userCoinData={userCoinData}
          isLoadingUserCoin={isLoadingUserCoin}
          showMarketData={true}
          onCreateClick={
            account.address &&
            account.address.toLowerCase() === creatorAddress?.toLowerCase()
              ? () => router.push(`/?create=true`)
              : undefined
          }
        />
      </div>
    </div>
  );
}
