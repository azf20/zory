// ZoryCameraLogo.tsx
import React from "react";
import { zorbImageDataURI } from "@zoralabs/zorb";

type Props = {
  address: string;
  size?: number; // px
  theme?: "dark" | "light";
  variant?: "solid" | "outline";
  withWordmark?: boolean;
};

export const ZoryCameraLogo: React.FC<Props> = ({
  address,
  size = 256,
  theme = "dark",
  withWordmark = false,
}) => {
  const zorbURI = zorbImageDataURI(address);

  const colors =
    theme === "dark"
      ? {
          body: "#000000",
          accent: "#FFFFFF",
          text: "#FFFFFF",
        }
      : {
          body: "#000000",
          accent: "#FFFFFF",
          text: "#111827",
        };

  return (
    <svg
      width={size}
      height={withWordmark ? size * 1.18 : size}
      viewBox="0 0 1024 1024"
      role="img"
      aria-label="Zory camera logo"
    >
      {/* Simple camera body */}
      <rect x="64" y="64" width="896" height="896" fill={colors.body} rx="64" />

      {/* Zora Zorb as the lens - properly centered */}
      <image href={zorbURI} x="210" y="240" width="600" height="600" />

      {/* Organic twinkle */}
      <g transform="translate(680, 120) scale(0.8)">
        <path
          d="m150 260c13.6-78.2 35.4-100 113.7-113.7 4.3 0 7.9-3.5 7.9-7.9s-3.5-7.9-7.9-7.9c-78.4-13.3-100.2-35.1-113.7-113.4 0-4.3-3.5-7.9-7.9-7.9s-7.9 3.5-7.9 7.9c-13.5 78.2-35.3 100-113.5 113.5-4.3 0-7.9 3.5-7.9 7.9s3.5 7.9 7.9 7.9c78.2 13.6 100 35.4 113.7 113.7.6 3.9 3.9 6.7 7.9 6.7 3.9-0 7.2-3 7.7-6.8z"
          fill={colors.accent}
        />
      </g>

      {/* Optional wordmark */}
      {withWordmark && (
        <g transform="translate(0, 1040)">
          <text
            x="362"
            y="90"
            textAnchor="middle"
            fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
            fontWeight={700}
            fontSize="140"
            fill={colors.text}
          >
            Zory
          </text>
        </g>
      )}
    </svg>
  );
};
