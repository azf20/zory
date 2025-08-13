// ZoryLogoDemo.tsx - Demo component to showcase the ZoryCameraLogo
import React from "react";
import { ZoryCameraLogo } from "./ZoryCameraLogo";

export const ZoryLogoDemo: React.FC = () => {
  const demoAddress = "0x1234567890123456789012345678901234567890";

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Zory Logo Demo</h1>

      {/* Basic logo */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Basic Logo</h2>
        <ZoryCameraLogo address={demoAddress} size={200} />
      </div>

      {/* With wordmark */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">With Wordmark</h2>
        <ZoryCameraLogo address={demoAddress} size={200} withWordmark={true} />
      </div>

      {/* Light theme */}
      <div className="text-center bg-gray-100 p-8 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Light Theme</h2>
        <ZoryCameraLogo address={demoAddress} size={200} theme="light" />
      </div>

      {/* Outline variant */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Outline Variant</h2>
        <ZoryCameraLogo address={demoAddress} size={200} variant="outline" />
      </div>

      {/* Different addresses */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Different Addresses</h2>
        <div className="flex justify-center gap-4 flex-wrap">
          <ZoryCameraLogo
            address="0x1111111111111111111111111111111111111111"
            size={120}
          />
          <ZoryCameraLogo
            address="0x2222222222222222222222222222222222222222"
            size={120}
          />
          <ZoryCameraLogo
            address="0x3333333333333333333333333333333333333333"
            size={120}
          />
          <ZoryCameraLogo
            address="0x4444444444444444444444444444444444444444"
            size={120}
          />
        </div>
      </div>

      {/* Small sizes */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Small Sizes</h2>
        <div className="flex justify-center gap-4 flex-wrap">
          <ZoryCameraLogo address={demoAddress} size={64} />
          <ZoryCameraLogo address={demoAddress} size={48} />
          <ZoryCameraLogo address={demoAddress} size={32} />
          <ZoryCameraLogo address={demoAddress} size={24} />
        </div>
      </div>
    </div>
  );
};
