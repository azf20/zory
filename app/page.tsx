"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ViewZory from "./components/ViewZory";
import CreateZory from "./components/CreateZory";
import { useAccount } from "wagmi";
import { useUserCoin, UserCoinData } from "@/lib/hooks/useUserCoin";

function ZoryContent() {
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [coinAddressOverride, setCoinAddressOverride] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [tokenURIOverride, setTokenURIOverride] = useState<string | undefined>(
    undefined,
  );
  const [metadataOverride, setMetadataOverride] = useState<
    UserCoinData["metadata"] | undefined
  >(undefined);

  const { address } = useAccount();

  // Check URL params to start in creation mode
  useEffect(() => {
    const shouldCreate = searchParams.get("create") === "true";
    if (shouldCreate) {
      setIsCreating(true);
    }
  }, [searchParams]);

  // Reset overrides when connected address changes
  useEffect(() => {
    setCoinAddressOverride(undefined);
    setTokenURIOverride(undefined);
    setMetadataOverride(undefined);
  }, [address]);

  // Lift coin data fetching to the page for shared state
  const { data: userCoinData, isLoading: isLoadingUserCoin } = useUserCoin({
    address,
    coinAddress: coinAddressOverride,
    tokenURI: tokenURIOverride,
    metadata: metadataOverride,
  });

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleBackClick = () => {
    setIsCreating(false);
  };

  const handleSuccess = (payload: {
    hash?: `0x${string}`;
    type: "creation" | "update";
    tokenURI: string;
    coinAddress?: `0x${string}`;
    metadata: Record<string, unknown> | null;
  }) => {
    if (payload.tokenURI) setTokenURIOverride(payload.tokenURI);
    if (payload.coinAddress) setCoinAddressOverride(payload.coinAddress);
    if (payload.metadata) {
      setMetadataOverride(payload.metadata as UserCoinData["metadata"]);
    }
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md">
        {isCreating ? (
          <CreateZory
            onBackClick={handleBackClick}
            onSuccess={handleSuccess}
            userCoinData={userCoinData}
          />
        ) : (
          <ViewZory
            onCreateClick={handleCreateClick}
            userCoinData={userCoinData}
            isLoadingUserCoin={isLoadingUserCoin}
            showMarketData={true}
          />
        )}
      </div>
    </div>
  );
}

export default function Zory() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center p-4 pt-20">
          <div className="w-full max-w-md text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ZoryContent />
    </Suspense>
  );
}
