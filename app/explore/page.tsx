"use client";

import { useState } from "react";
import { useCreatedZories } from "@/lib/hooks/useCreatedZories";
import { zorbImageDataURI } from "@zoralabs/zorb";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function ExplorePage() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 9;

  const { data: createdZoriesData, isLoading } = useCreatedZories({
    page: currentPage,
    pageSize,
  });

  const createdZories = createdZoriesData?.zories || [];
  const total = createdZoriesData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/10 rounded-lg aspect-square mb-4"></div>
                <div className="bg-white/10 rounded h-4 w-3/4 mb-2"></div>
                <div className="bg-white/10 rounded h-3 w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {createdZories.length === 0 ? (
          <div className="text-center text-white/60 py-12">
            <p className="text-lg">No Zories found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {createdZories.map((zory) => (
                <Link
                  key={zory.coinAddress}
                  href={`/zory/${zory.coinAddress}`}
                  className="group"
                >
                  <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-200">
                    <div className="relative mb-4 aspect-square">
                      <Image
                        src={
                          zory.zoraData?.mediaContent?.previewImage?.medium ||
                          zorbImageDataURI(zory.coinAddress)
                        }
                        alt={`Zory by ${zory.zoraData?.name || zory.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                        className="object-contain rounded-lg group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-white/80 transition-colors">
                      {zory.zoraData?.name || zory.name}
                    </h3>
                    <div className="flex items-center justify-between mt-3 text-white/40 text-xs">
                      <span>Block #{zory.blockNum}</span>
                      {zory.zoraData?.uniqueHolders && (
                        <span>{zory.zoraData.uniqueHolders} holders</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  className="flex items-center px-4 py-2 text-white/60 hover:text-white disabled:text-white/20 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-1" />
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i)}
                      className={`px-3 py-1 rounded ${
                        i === currentPage
                          ? "bg-white text-black"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      } transition-all duration-200`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                  className="flex items-center px-4 py-2 text-white/60 hover:text-white disabled:text-white/20 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRightIcon className="w-5 h-5 ml-1" />
                </button>
              </div>
            )}

            <div className="text-center text-white/40 text-sm mt-4">
              Showing {createdZories.length} of {total} Zories
            </div>
          </>
        )}
      </div>
    </div>
  );
}
