"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  cleanAndValidateMetadataURI,
  ValidMetadataURI,
} from "@zoralabs/coins-sdk";
import { zorbImageDataURI } from "@zoralabs/zorb";
import { UserCoinData } from "@/lib/hooks/useUserCoin";
import Image from "next/image";
import {
  CurrencyDollarIcon,
  UsersIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface ViewZoryProps {
  onCreateClick?: () => void; // If provided, show create button
  address?: string; // Optional address to use for zorb icon
  userCoinData: UserCoinData | null;
  isLoadingUserCoin: boolean;
  showMarketData?: boolean; // Optional: show market data overlay
}

export default function ViewZory({
  onCreateClick,
  address: propAddress,
  userCoinData,
  isLoadingUserCoin,
  showMarketData = false,
}: ViewZoryProps) {
  const { address: connectedAddress } = useAccount();
  const address = propAddress || connectedAddress;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Show loading state only when we have an address but data is still loading
  if (isLoadingUserCoin && address) {
    return (
      <div className="w-full max-w-[480px] aspect-square bg-black rounded-lg overflow-hidden mx-auto flex items-center justify-center">
        <div className="text-center text-white">
          <p>Loading Zory...</p>
        </div>
      </div>
    );
  }

  // Show empty state (no wallet connected or no Zory found)
  if (!userCoinData) {
    return (
      <div className="relative w-full max-w-[480px] aspect-square bg-gray-800 rounded-lg overflow-hidden mx-auto flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg font-medium">
            {!address
              ? "Create your Zory"
              : onCreateClick
                ? "Create your Zory"
                : "No Zory found"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {!address
              ? "Start capturing moments"
              : onCreateClick
                ? "Capture moments"
                : "Connect your wallet to view your Zory"}
          </p>
        </div>

        {/* Create Button - centered at bottom */}
        {onCreateClick && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
            <button
              onClick={onCreateClick}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 shadow-lg border border-white/30 transition-all duration-200"
              title={
                !address ? "Connect wallet to create" : "Create your first Zory"
              }
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    );
  }

  console.log("userCoinData", userCoinData);

  // Show coin with carousel
  return (
    <div className="relative w-full max-w-[480px] aspect-square bg-black rounded-lg overflow-hidden mx-auto">
      <Image
        src={(() => {
          const carouselMedia = userCoinData.metadata?.content?.carousel?.media;
          const imageUri =
            carouselMedia?.[currentImageIndex]?.uri ||
            userCoinData.metadata?.image ||
            (userCoinData.coin?.mediaContent?.originalUri
              ? cleanAndValidateMetadataURI(
                  userCoinData.coin?.mediaContent
                    ?.originalUri as ValidMetadataURI,
                )
              : undefined) ||
            "/zory.png";

          if (imageUri) {
            try {
              return cleanAndValidateMetadataURI(imageUri as ValidMetadataURI);
            } catch {
              return imageUri;
            }
          }
          return "/zory.png";
        })()}
        alt="Your Zory"
        fill
        sizes="(max-width: 480px) 100vw, 480px"
        className="object-cover"
        priority
      />

      {/* Market Data Overlay - Bottom Left */}
      {showMarketData &&
        userCoinData.coin &&
        userCoinData.coin.marketCap &&
        Number(userCoinData.coin.marketCap) > 0 && (
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg border border-white/20 z-20 min-w-[120px] whitespace-nowrap">
            <div className="text-xs">
              {/* Market Cap */}
              <div className="flex items-center gap-1.5">
                <CurrencyDollarIcon className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-xs">Market Cap:</span>
                <span className="font-medium">
                  ${Number(userCoinData.coin.marketCap).toLocaleString()}
                </span>
              </div>

              {/* Unique Holders - only show if > 0 */}
              {userCoinData.coin.uniqueHolders != null &&
                userCoinData.coin.uniqueHolders !== 0 &&
                Number(userCoinData.coin.uniqueHolders) > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <UsersIcon className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span className="text-gray-300 text-xs">Holders:</span>
                    <span className="font-medium">
                      {userCoinData.coin.uniqueHolders.toLocaleString()}
                    </span>
                  </div>
                )}
            </div>
          </div>
        )}

      {/* Carousel Navigation */}
      {userCoinData.metadata?.content?.carousel?.media &&
        userCoinData.metadata.content.carousel.media.length > 1 && (
          <>
            {/* Previous Button */}
            {currentImageIndex > 0 && (
              <button
                onClick={() => setCurrentImageIndex((prev) => prev - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full p-2 shadow-lg border border-white/30 transition-all duration-200 z-20"
                title="Previous photo"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {currentImageIndex <
              userCoinData.metadata.content.carousel.media.length - 1 && (
              <button
                onClick={() => setCurrentImageIndex((prev) => prev + 1)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full p-2 shadow-lg border border-white/30 transition-all duration-200 z-20"
                title="Next photo"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </>
        )}

      {/* Top overlay: date, counter (if any), and Zora link */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-20">
        {/* Date Display */}
        {userCoinData.metadata?.content?.carousel?.media?.[currentImageIndex]
          ?.timestamp && (
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/30">
            {new Date(
              userCoinData.metadata.content.carousel.media[
                currentImageIndex
              ].timestamp,
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )}

        {/* Image Counter (only if multiple images) */}
        {userCoinData.metadata?.content?.carousel?.media &&
          userCoinData.metadata.content.carousel.media.length > 1 && (
            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/30">
              {currentImageIndex + 1} /{" "}
              {userCoinData.metadata.content.carousel.media.length}
            </div>
          )}

        {/* Zora Link */}
        <a
          href={`https://zora.co/coin/base:${userCoinData.coinAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/30 transition-all duration-200"
          title="View on Zora"
        >
          <Image
            src={zorbImageDataURI(address as `0x${string}`)}
            alt="Zora"
            width={16}
            height={16}
            className="rounded-full"
          />
          <span>View on Zora</span>
        </a>
      </div>

      {/* Create Button - centered at bottom */}
      {onCreateClick && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={onCreateClick}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 shadow-lg border border-white/30 transition-all duration-200"
            title="Add new photo"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
