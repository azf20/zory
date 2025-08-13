import { zorbImageDataURI } from "@zoralabs/zorb";

type Props = {
  address: string | null | undefined;
  size?: number; // px
};

export const OgZoryLogo: React.FC<Props> = ({ address, size = 600 }) => {
  const zorbImage = zorbImageDataURI(
    address ||
      "0xc9715a2d56111130410d7aac61748fff84f84245ad805f4eec5fb1d226032f27",
  );

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: "#000000",
        borderRadius: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Zorb lens using img tag */}
      <img
        src={zorbImage}
        width={Math.floor(size * 0.67)}
        height={Math.floor(size * 0.67)}
        style={{
          borderRadius: "50%",
        }}
      />

      {/* Original sparkle as inline SVG */}
      <svg
        width={Math.floor(size * 0.2)}
        height={Math.floor(size * 0.2)}
        viewBox="0 0 260 260"
        style={{
          position: "absolute",
          top: "0",
          right: "0",
        }}
      >
        <path
          d="m150 260c13.6-78.2 35.4-100 113.7-113.7 4.3 0 7.9-3.5 7.9-7.9s-3.5-7.9-7.9-7.9c-78.4-13.3-100.2-35.1-113.7-113.4 0-4.3-3.5-7.9-7.9-7.9s-7.9 3.5-7.9 7.9c-13.5 78.2-35.3 100-113.5 113.5-4.3 0-7.9 3.5-7.9 7.9s3.5 7.9 7.9 7.9c78.2 13.6 100 35.4 113.7 113.7.6 3.9 3.9 6.7 7.9 6.7 3.9-0 7.2-3 7.7-6.8z"
          fill="white"
        />
      </svg>
    </div>
  );
};
