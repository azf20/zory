"use client";

import { useFarcaster } from "@/lib/hooks/useFarcaster";

export function Footer() {
  const { isMiniApp, addMiniApp } = useFarcaster();

  return (
    <footer className="fixed bottom-0 left-0 right-0 text-center py-4 bg-black/20 backdrop-blur-md border-t border-white/10 z-40">
      <div className="flex items-center justify-center space-x-4">
        {/* Add Mini App Button - only visible in Farcaster Mini App */}
        {isMiniApp && (
          <button
            onClick={addMiniApp}
            className="text-white/60 hover:text-white transition-colors underline cursor-pointer"
          >
            Add Mini App
          </button>
        )}

        {/* Links */}
        <span className="text-white/40 text-sm">
          <a
            href="https://x.com/azacharyf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors underline"
          >
            @azacharyf
          </a>
          {" • "}
          <a
            href="https://github.com/azf20/zory"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors underline"
          >
            code
          </a>
          {" • "}
          <a
            href="https://buidlguidl.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors underline"
          >
            BuidlGuidl
          </a>
        </span>
      </div>
    </footer>
  );
}
