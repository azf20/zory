"use client";

import { useParams } from "next/navigation";
import ViewZory from "@/app/components/ViewZory";
import { useCoin } from "@/lib/hooks/useCoin";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function ViewAddressPage() {
  const params = useParams();
  const address = params.address as string;
  const account = useAccount();
  const router = useRouter();

  const { data: userCoinData, isLoading: isLoadingUserCoin } = useCoin({
    address,
  });

  // Get title from Zora data or fallback to address
  const title =
    userCoinData?.coin?.name ||
    `Zory by ${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        </div>

        <ViewZory
          address={address}
          userCoinData={userCoinData}
          isLoadingUserCoin={isLoadingUserCoin}
          showMarketData={true}
          onCreateClick={
            account.address &&
            account.address.toLowerCase() === address.toLowerCase()
              ? () => router.push(`/?create=true`)
              : undefined
          }
        />
      </div>
    </div>
  );
}
