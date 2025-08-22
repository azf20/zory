import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import toast from "react-hot-toast";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

interface UseFarcasterReturn {
  isMiniApp: boolean;
  isAdded: boolean;
  isBaseApp: boolean;
  addMiniApp: () => Promise<void>;
}

export function useFarcaster(): UseFarcasterReturn {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { context } = useMiniKit();

  // Check if we're in a Farcaster Mini App
  useEffect(() => {
    const checkMiniApp = async () => {
      try {
        const miniAppCheck = await sdk.isInMiniApp();
        setIsMiniApp(miniAppCheck);
        if (miniAppCheck) {
          try {
            const miniContext = await sdk.context;
            setIsAdded(Boolean(miniContext?.client?.added));
          } catch {
            setIsAdded(false);
          }
        } else {
          setIsAdded(false);
        }
      } catch {
        setIsMiniApp(false);
        setIsAdded(false);
      }
    };

    checkMiniApp();
  }, []);

  const addMiniApp = async () => {
    try {
      await sdk.actions.addMiniApp();
      toast.success("Added to Farcaster successfully ✨");
      setIsAdded(true);
    } catch (error) {
      console.error("Failed to add mini app:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to add mini app: ${message}`);
    }
  };

  const isBaseApp = Boolean(context?.client?.clientFid === 309857);

  return {
    isMiniApp,
    isAdded,
    isBaseApp,
    addMiniApp,
  };
}
