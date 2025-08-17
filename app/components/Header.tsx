"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { ZoryCameraLogo } from "./ZoryCameraLogo";
import { useCreatedZories } from "@/lib/hooks/useCreatedZories";
import { zorbImageDataURI } from "@zoralabs/zorb";
import Link from "next/link";
import {
  InformationCircleIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export function Header() {
  const { address } = useAccount();
  const { data: createdZories, isLoading } = useCreatedZories();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Left: Logo, Burger Menu, and Recent Zories */}
          <div className="flex items-center space-x-6">
            {/* Logo and Burger Menu */}
            <div className="flex items-center space-x-2">
              {/* Logo and Home Link */}
              <Link href="/" className="flex items-center group">
                <ZoryCameraLogo
                  address={
                    address ||
                    "0xc9715a2d56111130410d7aac61748fff84f84245ad805f4eec5fb1d226032f27"
                  }
                  size={40}
                  theme="dark"
                />
                <span className="hidden md:block ml-3 text-white font-semibold text-lg group-hover:text-white/80 transition-colors">
                  Zory
                </span>
              </Link>

              {/* Mobile: Plus Button */}
              <div className="md:hidden">
                <Link href="/" title="Add to your Zory" className="group">
                  <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 border border-white/30 transition-all duration-200 group-hover:scale-110">
                    <PlusIcon className="w-5 h-5" />
                  </div>
                </Link>
              </div>

              {/* Info Icon */}
              <Link
                href="/info"
                className="p-2 text-white/60 hover:text-white transition-colors"
                title="How Zory works"
              >
                <InformationCircleIcon className="w-8 h-8" />
              </Link>

              {/* Mobile: Burger Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-white hover:text-white/80 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Desktop: Recent Zories */}
            <div className="hidden md:flex items-center">
              {!isLoading && createdZories && createdZories.length > 0 && (
                <div className="flex items-center space-x-3">
                  {/* Plus button to create/add */}
                  <Link href="/" title="Add to your Zory" className="group">
                    <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 border border-white/30 transition-all duration-200 group-hover:scale-110">
                      <PlusIcon className="w-5 h-5" />
                    </div>
                  </Link>

                  <span className="text-white/60 text-sm font-medium">
                    Recent
                  </span>
                  <div className="flex items-center space-x-1">
                    {createdZories.slice(0, 10).map((zory) => (
                      <Link
                        key={zory.coinAddress}
                        href={`/view/${zory.callerAddress}`}
                        className="group relative"
                        title={`View ${zory.callerAddress.slice(0, 6)}...${zory.callerAddress.slice(-4)}'s Zory`}
                      >
                        <Image
                          src={zorbImageDataURI(zory.callerAddress)}
                          alt={`Zory by ${zory.callerAddress.slice(0, 6)}...${zory.callerAddress.slice(-4)}`}
                          width={32}
                          height={32}
                          className="rounded-full border-2 border-white/20 hover:border-white/40 transition-all duration-200 group-hover:scale-110"
                        />
                      </Link>
                    ))}
                    {createdZories.length > 5 && (
                      <span className="text-white/40 text-xs ml-1">
                        +{createdZories.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Connect Button */}
          <div className="flex items-center ml-auto">
            <ConnectKitButton />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/40 backdrop-blur-md">
            <div className="px-4 py-4 space-y-4">
              {/* My Zory Link */}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center text-white hover:text-white/80 transition-colors"
              >
                My Zory
              </Link>

              {/* Recent Zories */}
              {!isLoading && createdZories && createdZories.length > 0 && (
                <div>
                  <div className="text-white/60 text-sm mb-2">
                    Recent Zories
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {createdZories.slice(0, 8).map((zory) => (
                      <Link
                        key={zory.coinAddress}
                        href={`/view/${zory.callerAddress}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="group"
                        title={`View ${zory.callerAddress.slice(0, 6)}...${zory.callerAddress.slice(-4)}'s Zory`}
                      >
                        <Image
                          src={zorbImageDataURI(zory.callerAddress)}
                          alt={`Zory by ${zory.callerAddress.slice(0, 6)}...${zory.callerAddress.slice(-4)}`}
                          width={48}
                          height={48}
                          className="rounded-full border-2 border-white/20 hover:border-white/40 transition-all duration-200 group-hover:scale-110"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Connect Button */}
              <div className="pt-2">
                <ConnectKitButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
