import { ImageResponse } from "@vercel/og";
import { OgZoryLogo } from "../../../components/OgZoryLogo";

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
            "linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%)",
        }}
      >
        {/* Logo using reusable component */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "50px",
          }}
        >
          <OgZoryLogo address={address} size={320} />
        </div>

        {/* Enhanced title with gradient */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #FFFFFF 0%, #A3A3A3 100%)",
            backgroundClip: "text",
            color: "transparent",
            textAlign: "center",
            marginBottom: "25px",
            textShadow: "0 6px 12px rgba(0, 0, 0, 0.6)",
          }}
        >
          {title}
        </div>

        {/* Enhanced decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "50px",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            opacity: "0.4",
            filter: "blur(1px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "50px",
            left: "50px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #EC4899, #F59E0B)",
            opacity: "0.4",
            filter: "blur(1px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "200px",
            left: "100px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10B981, #3B82F6)",
            opacity: "0.3",
            filter: "blur(1px)",
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
