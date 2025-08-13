import { ImageResponse } from "@vercel/og";
import { OgZoryLogo } from "../../components/OgZoryLogo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const title = searchParams.get("title") || "Zory";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%)",
        }}
      >
        {/* Logo using reusable component */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          <OgZoryLogo address={address} size={300} />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "#FFFFFF",
            textAlign: "center",
            marginBottom: "20px",
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
          }}
        >
          {title}
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "40px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            opacity: "0.3",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "40px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #EC4899, #F59E0B)",
            opacity: "0.3",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
