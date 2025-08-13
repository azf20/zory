"use client";

import { useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

export function MiniKitInitializer() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  // Signal MiniKit frame readiness when app is loaded
  useEffect(() => {
    if (!isFrameReady) {
      console.log("setting frame ready");
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  // This component doesn't render anything
  return null;
}
