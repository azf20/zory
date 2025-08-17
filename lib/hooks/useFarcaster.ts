import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface UseFarcasterReturn {
  isMiniApp: boolean;
  addMiniApp: () => Promise<void>;
}

export function useFarcaster(): UseFarcasterReturn {
  const [isMiniApp, setIsMiniApp] = useState(false);

  // Check if we're in a Farcaster Mini App
  useEffect(() => {
    const checkMiniApp = async () => {
      try {
        const miniAppCheck = await sdk.isInMiniApp();
        setIsMiniApp(miniAppCheck);
      } catch {
        setIsMiniApp(false);
      }
    };

    checkMiniApp();
  }, []);

  const addMiniApp = async () => {
    try {
      await sdk.actions.addMiniApp();
    } catch (error) {
      console.error("Failed to add mini app:", error);
    }
  };

  return {
    isMiniApp,
    addMiniApp,
  };
}
