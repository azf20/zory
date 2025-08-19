"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ViewZory from "./components/ViewZory";
import CreateZory from "./components/CreateZory";
import { useAccount } from "wagmi";
import { useUserCoin, UserCoinData } from "@/lib/hooks/useUserCoin";
import { useFarcaster } from "@/lib/hooks/useFarcaster";
import { ZoryCameraLogo } from "./components/ZoryCameraLogo";

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
  const [showIntroModal, setShowIntroModal] = useState(false);

  const { isMiniApp, addMiniApp } = useFarcaster();

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

  // Show intro modal only on first visit in this session
  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("zory_intro_seen");
      if (!seen) {
        setShowIntroModal(true);
      }
    } catch {}
  }, []);

  const closeIntro = () => {
    setShowIntroModal(false);
    try {
      sessionStorage.setItem("zory_intro_seen", "1");
    } catch {}
  };

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
    <>
      {showIntroModal && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center px-4"
          onClick={closeIntro}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md bg-black/90 border border-white/20 rounded-2xl p-6 text-white shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center mb-4">
              <ZoryCameraLogo
                address={
                  address ||
                  "0xc9715a2d56111130410d7aac61748fff84f84245ad805f4eec5fb1d226032f27"
                }
                size={48}
                theme="dark"
              />
            </div>
            <button
              onClick={closeIntro}
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Zory: a story on Zora</h2>
            </div>
            <p className="text-white/70 mb-6">
              Take a photo. Create a coin. Update it anytime.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={closeIntro}
                className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-white/90 transition-colors"
              >
                Get started
              </button>
              {isMiniApp && (
                <button
                  onClick={addMiniApp}
                  className="text-white/70 hover:text-white underline"
                >
                  Add Mini App
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
    </>
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
