"use client";

import { useState, useCallback } from "react";
import {
  useAccount,
  useWalletClient,
  usePublicClient,
  useSwitchChain,
  useSendCalls,
  useGasPrice,
  useBalance,
} from "wagmi";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import { base } from "wagmi/chains";
import { Address, TransactionReceipt } from "viem";
import toast from "react-hot-toast";
import {
  createCoin,
  updateCoinURI,
  CreateConstants,
  ValidMetadataURI,
  createCoinCall,
  getCoinCreateFromLogs,
} from "@zoralabs/coins-sdk";
import { useEnsNameMainnet } from "@/lib/hooks/useEnsName";
import { UserCoinData } from "@/lib/hooks/useUserCoin";
import CameraCapture from "./CameraCapture";
import Image from "next/image";

interface CreateZoryProps {
  onBackClick: () => void;
  onSuccess: (payload: {
    hash?: `0x${string}`;
    type: "creation" | "update";
    tokenURI: string;
    coinAddress?: `0x${string}`;
    metadata: Record<string, unknown> | null;
  }) => void; // Called when coin is created/updated
  userCoinData: UserCoinData | null;
}

type OperationStatus =
  | "idle"
  | "uploading"
  | "creating"
  | "updating"
  | "confirming";

// Strict type for our upload route response
type UploadRouteSuccess = {
  success: true;
  metadata: {
    uri: string;
    name: string;
    symbol: string;
    description: string;
    json: Record<string, unknown> | null;
  };
};

export default function CreateZory({
  onBackClick,
  onSuccess,
  userCoinData,
}: CreateZoryProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [restartCamera, setRestartCamera] = useState(false);
  const [isInCameraMode, setIsInCameraMode] = useState(false);
  const { address, status, chainId, connector } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [operationStatus, setOperationStatus] =
    useState<OperationStatus>("idle");
  const { switchChain } = useSwitchChain();
  const { sendCallsAsync: sendCalls } = useSendCalls();
  const { data: gasPrice } = useGasPrice();
  const { data: balance } = useBalance({
    address: address as `0x${string}`,
  });

  // Different gas requirements for create vs update
  const createGasAmount = BigInt(3_000_000);
  const updateGasAmount = BigInt(75_000);

  const requiredBalanceForCreate = gasPrice
    ? gasPrice * createGasAmount
    : BigInt(0);
  const requiredBalanceForUpdate = gasPrice
    ? gasPrice * updateGasAmount
    : BigInt(0);

  const isBase = chainId === base.id;
  const isFarcasterWallet = connector?.id === "xyz.farcaster.MiniAppWallet";

  // Use custom hook for ENS resolution on mainnet
  const { data: ensName } = useEnsNameMainnet({
    address: address as `0x${string}`,
  });

  const handlePhotoCapture = useCallback((photoDataUrl: string) => {
    setPhoto(photoDataUrl);
    setIsInCameraMode(false);
    setRestartCamera(false);
  }, []);

  // Handle successful operations
  const handleOperationSuccess = useCallback(
    (payload: {
      hash?: `0x${string}`;
      type: "creation" | "update";
      tokenURI: string;
      coinAddress?: `0x${string}`;
      metadata: Record<string, unknown> | null;
    }) => {
      setPhoto(null);
      setIsInCameraMode(false);
      onSuccess(payload);
    },
    [onSuccess],
  );

  // Utility function to generate form data for debugging
  const generateFormData = useCallback(
    (existingMetadata?: string) => {
      if (!photo || !address) return null;

      const displayName =
        ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;
      const coinName = `Zory by ${displayName}`;
      const description = `Zory by ${displayName}`;

      return {
        image: "File: zory.jpg (image/jpeg)",
        creatorAddress: address,
        coinName: coinName,
        coinSymbol: coinName,
        coinDescription: description,
        ...(existingMetadata && { existingMetadata }),
      } as const;
    },
    [photo, address, ensName],
  );

  // Shared function to upload image and create metadata
  const uploadImageAndCreateMetadata = useCallback(
    async (
      existingMetadata?: string,
    ): Promise<UploadRouteSuccess["metadata"] | null> => {
      if (!photo || !address) return null;

      // Convert data URL to File
      const imageBlob = await fetch(photo).then((res) => res.blob());
      const imageFile = new File([imageBlob], "zory.jpg", {
        type: "image/jpeg",
      });

      // Generate form data using the utility function
      const formDataObj = generateFormData(existingMetadata);
      if (!formDataObj) return null;

      // Create FormData object for upload
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("creatorAddress", formDataObj.creatorAddress);
      formData.append("coinName", formDataObj.coinName);
      formData.append("coinSymbol", formDataObj.coinSymbol);
      formData.append("coinDescription", formDataObj.coinDescription);
      if (formDataObj.existingMetadata) {
        formData.append("existingMetadata", formDataObj.existingMetadata);
      }

      // Upload image and create metadata on server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload and create metadata");
      }

      const result = (await response.json()) as UploadRouteSuccess;
      return result.metadata;
    },
    [photo, address, generateFormData],
  );

  const handleCreateZory = useCallback(async () => {
    if (!walletClient || !publicClient || !address) return;

    setOperationStatus("uploading");
    try {
      // Upload image and create metadata using shared function
      const metadata = await uploadImageAndCreateMetadata();
      if (!metadata) return;

      // Create coin using Zora's metadata parameters
      setOperationStatus("creating");

      const coinParams = {
        creator: address as `0x${string}`,
        name: metadata.name,
        symbol: metadata.symbol,
        metadata: {
          type: "RAW_URI" as const,
          uri: metadata.uri,
        },
        description: metadata.description,
        payoutRecipient: address as `0x${string}`,
        startingMarketCap: CreateConstants.StartingMarketCaps.LOW,
        platformReferrer: process.env
          .NEXT_PUBLIC_PLATFORM_REFERRER as `0x${string}`,
        currency: CreateConstants.ContentCoinCurrencies.ZORA,
        chainId: base.id,
      };

      if (isFarcasterWallet) {
        const coinCall = await createCoinCall(coinParams);
        await publicClient.call({
          ...coinCall,
          account: walletClient.account,
        });

        const sendCallsResult = await sendCalls({
          calls: coinCall,
        });
        console.log("Coin created:", sendCallsResult);
        setOperationStatus("confirming");
        const callsStatus = await walletClient.waitForCallsStatus({
          id: sendCallsResult.id,
        });
        console.log("Calls status:", callsStatus);
        if (
          callsStatus.receipts &&
          callsStatus.receipts[0].status === "success"
        ) {
          const receipt = callsStatus.receipts[0] as TransactionReceipt;
          const coinCreate = getCoinCreateFromLogs(receipt);
          console.log("Coin create:", coinCreate);
          if (!coinCreate) {
            throw new Error("Coin creation failed");
          }
          handleOperationSuccess({
            hash: receipt.transactionHash,
            type: "creation",
            tokenURI: metadata.uri,
            coinAddress: coinCreate.coin,
            metadata: metadata.json,
          });
        } else {
          throw new Error("Coin creation failed");
        }
      } else {
        const coinResult = await createCoin({
          call: coinParams,
          walletClient,
          publicClient,
        });
        console.log("Coin created:", coinResult);

        setOperationStatus("confirming");
        await publicClient.waitForTransactionReceipt({
          hash: coinResult.hash,
        });

        const coinAddressFromResult = coinResult.deployment?.coin;

        handleOperationSuccess({
          hash: coinResult.hash,
          type: "creation",
          tokenURI: metadata.uri,
          coinAddress: coinAddressFromResult,
          metadata: metadata.json,
        });
      }
      toast.success("Zory created successfully! 🎉");
    } catch (error) {
      console.error("Error creating Zory:", error);

      // Show error toast with more details
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create Zory: ${errorMessage}`, {
        duration: 6000, // Show longer for users to read
      });
    } finally {
      setOperationStatus("idle");
    }
  }, [
    walletClient,
    publicClient,
    uploadImageAndCreateMetadata,
    address,
    handleOperationSuccess,
  ]);

  const handleUpdateZory = useCallback(async () => {
    if (!walletClient || !publicClient || !userCoinData) return;

    setOperationStatus("uploading");
    try {
      // Get existing metadata from the coin
      const existingMetadata = userCoinData.metadataUri;

      // Upload image and create metadata using shared function
      const metadata = await uploadImageAndCreateMetadata(existingMetadata);
      if (!metadata) return;

      // Update coin URI
      setOperationStatus("updating");

      const updateParams = {
        coin: userCoinData.coinAddress as Address,
        newURI: metadata.uri as ValidMetadataURI,
      };

      const updateResult = await updateCoinURI(
        updateParams,
        walletClient,
        publicClient,
      );

      console.log("Coin updated:", updateResult);

      // Wait for transaction to be confirmed
      if (updateResult.hash) {
        setOperationStatus("confirming");
        await publicClient.waitForTransactionReceipt({
          hash: updateResult.hash,
        });
        console.log("Transaction confirmed");
      }

      handleOperationSuccess({
        hash: updateResult.hash,
        type: "update",
        tokenURI: metadata.uri,
        coinAddress: userCoinData.coinAddress as `0x${string}`,
        metadata: metadata.json,
      });

      // Show success toast
      toast.success("Zory updated successfully! ✨");
    } catch (error) {
      console.error("Error updating Zory:", error);

      // Show error toast with more details
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update Zory: ${errorMessage}`, {
        duration: 6000, // Show longer for users to read
      });
    } finally {
      setOperationStatus("idle");
    }
  }, [
    walletClient,
    publicClient,
    userCoinData,
    uploadImageAndCreateMetadata,
    handleOperationSuccess,
  ]);

  const getButtonState = useCallback(() => {
    if (!status || status === "disconnected") {
      return {
        text: "Connect Wallet in Header",
        disabled: true,
        action: null,
        isConnect: true,
        className: "bg-gray-400 text-white cursor-not-allowed opacity-60",
      };
    }

    if (!isBase) {
      return {
        text: "Switch to Base",
        disabled: false,
        action: () => switchChain({ chainId: 8453 }),
        isConnect: false,
        className: "bg-[#0052FF] text-white hover:bg-[#0052FF]/90",
      };
    }

    // Check balance for create vs update operations
    const isCreate = !userCoinData;
    const requiredBalance = isCreate
      ? requiredBalanceForCreate
      : requiredBalanceForUpdate;
    const hasInsufficientBalance =
      balance && requiredBalance > 0 && balance.value < requiredBalance;

    if (hasInsufficientBalance) {
      return {
        text: "Insufficient balance",
        disabled: true,
        action: null,
        isConnect: false,
        className: "bg-red-500 text-white cursor-not-allowed opacity-60",
      };
    }

    if (operationStatus === "uploading") {
      return {
        text: "Uploading...",
        disabled: true,
        action: () => {},
        isConnect: false,
        className: "bg-gray-400 text-gray-200 cursor-not-allowed",
      };
    }

    if (operationStatus === "creating") {
      return {
        text: "Creating Coin...",
        disabled: true,
        action: () => {},
        isConnect: false,
        className: "bg-gray-400 text-gray-200 cursor-not-allowed",
      };
    }

    if (operationStatus === "updating") {
      return {
        text: "Updating Coin...",
        disabled: true,
        action: () => {},
        isConnect: false,
        className: "bg-gray-400 text-gray-200 cursor-not-allowed",
      };
    }

    if (operationStatus === "confirming") {
      return {
        text: "Confirming Transaction...",
        disabled: true,
        action: () => {},
        isConnect: false,
        className: "bg-gray-400 text-gray-200 cursor-not-allowed",
      };
    }

    return {
      text: userCoinData ? "Add to Zory" : "Create Zory",
      disabled: false,
      action: userCoinData ? handleUpdateZory : handleCreateZory,
      isConnect: false,
      className: "bg-[#0052FF] text-white hover:bg-[#0052FF]/90",
    };
  }, [
    status,
    isBase,
    operationStatus,
    userCoinData,
    switchChain,
    handleCreateZory,
    handleUpdateZory,
  ]);

  // Show camera mode
  if (isInCameraMode) {
    return (
      <div className="relative">
        <CameraCapture
          onPhotoCapture={handlePhotoCapture}
          restart={restartCamera}
        />

        {/* Back Button */}
        <button
          onClick={onBackClick}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full p-2 shadow-lg border border-white/30 transition-all duration-200 z-10"
          title="Back to your Zory"
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
      </div>
    );
  }

  // Show photo review mode
  if (photo) {
    return (
      <div className="relative w-full max-w-[480px] aspect-square bg-black rounded-lg overflow-hidden">
        <Image
          src={photo}
          alt="Captured photo"
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
          priority
        />

        {/* Mirror Button - Top Middle */}
        <button
          onClick={() => {
            // Create a canvas to mirror the image
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            if (!ctx) return;

            const img = new window.Image();
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;

              // Mirror the image horizontally
              ctx.scale(-1, 1);
              ctx.translate(-img.width, 0);
              ctx.drawImage(img, 0, 0);

              // Convert back to data URL and update state
              const mirroredPhoto = canvas.toDataURL("image/jpeg", 0.9);
              setPhoto(mirroredPhoto);
            };
            img.src = photo;
          }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full px-3 py-2 shadow-lg font-medium border border-white/30 z-20"
          title="Mirror image horizontally"
        >
          <ArrowsRightLeftIcon className="w-4 h-4 inline" />
        </button>

        {/* Back Button */}
        <button
          onClick={onBackClick}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full p-2 shadow-lg border border-white/30 transition-all duration-200 z-10"
          title="Back to your Zory"
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

        {/* Overlay Buttons */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
          <div className="flex gap-4 items-center justify-center">
            <button
              onClick={() => {
                setIsInCameraMode(true);
                setRestartCamera(true);
              }}
              className="bg-black/20 hover:bg-black/30 backdrop-blur-sm text-white rounded-full px-4 py-2 shadow-lg font-medium border border-white/30 transition-all duration-200"
            >
              Take Another
            </button>
            <button
              onClick={getButtonState().action ?? undefined}
              disabled={getButtonState().disabled}
              className={`rounded-full px-4 py-2 shadow-lg font-medium backdrop-blur-sm transition-all duration-200 ${getButtonState().className}`}
            >
              {getButtonState().text}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show camera for new users or when no photo is captured
  return (
    <>
      <div className="relative">
        <CameraCapture
          onPhotoCapture={handlePhotoCapture}
          restart={restartCamera}
        />

        {/* Back Button */}
        <button
          onClick={onBackClick}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full p-2 shadow-lg border border-white/30 transition-all duration-200 z-10"
          title="Back to your Zory"
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
      </div>
    </>
  );
}
