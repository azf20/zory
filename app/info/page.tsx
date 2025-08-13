"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  CameraIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Title */}
        <div className="text-center mb-16 pt-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Zory: a story on Zora
          </h1>
          <p className="text-lg text-white/60 max-w-lg mx-auto">
            Take a photo. Create a coin. Update it anytime.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* How it Works */}
          <section className="text-center">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div>
                <div className="bg-white/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <CameraIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-2">1. Take a Photo</h3>
                <p className="text-white/60 text-sm">
                  Capture a moment with your camera
                </p>
              </div>

              {/* Step 2 */}
              <div>
                <div className="bg-white/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <CurrencyDollarIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-2">2. Create a Coin</h3>
                <p className="text-white/60 text-sm">
                  Your photo becomes a{" "}
                  <a
                    href="https://zora.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 underline"
                  >
                    Zora coin
                  </a>{" "}
                  on Base
                </p>
              </div>

              {/* Step 3 */}
              <div>
                <div className="bg-white/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <ArrowPathIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-2">3. Update Anytime</h3>
                <p className="text-white/60 text-sm">
                  Take a new photo, update your coin
                </p>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section className="text-center pt-8">
            <Link
              href="/"
              className="inline-flex items-center bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Create your Zory
              <ArrowLeftIcon className="w-5 h-5 ml-2 rotate-180" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
