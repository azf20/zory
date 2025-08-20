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
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useFarcaster } from "@/lib/hooks/useFarcaster";

// Reusable component for circular header buttons
interface HeaderButtonProps {
  href: string;
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function HeaderButton({ href, title, children, onClick }: HeaderButtonProps) {
  return (
    <Link href={href} title={title} className="group" onClick={onClick}>
      <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 border border-white/30 transition-all duration-200 group-hover:scale-110">
        {children}
      </div>
    </Link>
  );
}

// Reusable component for displaying created Zories
import type { CreatedZory } from "@/lib/hooks/useCreatedZories";

interface CreatedZoriesListProps {
  createdZories: CreatedZory[];
  limit: number;
  size: "sm" | "md";
  layout?: "flex" | "grid";
  onZoryClick?: () => void;
}

function CreatedZoriesList({
  createdZories,
  limit,
  size,
  layout = "flex",
  onZoryClick,
}: CreatedZoriesListProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
  };

  const containerClasses =
    layout === "grid"
      ? "flex flex-wrap gap-1"
      : "flex items-center space-x-0.5 sm:space-x-1 overflow-x-hidden";

  return (
    <div className={containerClasses}>
      {createdZories.slice(0, limit).map((zory) => (
        <Link
          key={zory.coinAddress}
          href={`/zory/${zory.coinAddress}`}
          onClick={onZoryClick}
          className="group relative shrink-0"
          title={`View ${zory.name}`}
        >
          <Image
            src={
              zory.zoraData?.mediaContent?.previewImage?.medium ||
              zorbImageDataURI(zory.coinAddress)
            }
            alt={`Zory by ${zory.zoraData?.name || zory.name}`}
            width={size === "sm" ? 32 : 48}
            height={size === "sm" ? 32 : 48}
            className={`rounded-full border-2 border-white/20 hover:border-white/40 transition-all duration-200 group-hover:scale-110 ${sizeClasses[size]}`}
          />
        </Link>
      ))}
      {layout === "flex" && createdZories.length > limit && (
        <span className="text-white/40 text-xs ml-1">
          +{createdZories.length - limit}
        </span>
      )}
    </div>
  );
}

export default function Header() {
  const { address } = useAccount();
  const { data: createdZoriesData, isLoading } = useCreatedZories({
    page: 0,
    pageSize: 12,
  });
  const createdZories = createdZoriesData?.zories || [];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const zoryLimit = 10;
  const { isMiniApp, isAdded, addMiniApp } = useFarcaster();

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
                <HeaderButton href="/" title="Add to your Zory">
                  <PlusIcon className="w-5 h-5" />
                </HeaderButton>
              </div>

              {/* Info Icon */}
              <HeaderButton href="/info" title="How Zory works">
                <InformationCircleIcon className="w-6 h-6" />
              </HeaderButton>

              {/* Mobile: Explore Button */}
              <div className="md:hidden">
                <HeaderButton href="/explore" title="Explore Zories">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </HeaderButton>
              </div>

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
                  <HeaderButton href="/" title="Add to your Zory">
                    <PlusIcon className="w-5 h-5" />
                  </HeaderButton>

                  <CreatedZoriesList
                    createdZories={createdZories}
                    limit={zoryLimit}
                    size="md"
                  />

                  {/* Explore Icon */}
                  <HeaderButton href="/explore" title="Explore Zories">
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </HeaderButton>
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

              {/* Explore Link */}
              <Link
                href="/explore"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center text-white hover:text-white/80 transition-colors"
              >
                Explore Zories
              </Link>

              {/* Add Mini App (Farcaster) */}
              {isMiniApp && !isAdded && (
                <button
                  onClick={() => {
                    addMiniApp();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center text-white/70 hover:text-white underline"
                >
                  Add Mini App
                </button>
              )}

              {/* Recent Zories */}
              {!isLoading && createdZories && createdZories.length > 0 && (
                <div>
                  <div className="text-white/60 text-sm mb-2">
                    Recent Zories
                  </div>
                  <CreatedZoriesList
                    createdZories={createdZories}
                    limit={8}
                    size="md"
                    layout="grid"
                    onZoryClick={() => setIsMobileMenuOpen(false)}
                  />
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
