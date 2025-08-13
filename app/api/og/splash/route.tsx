import { ImageResponse } from "@vercel/og";
import { OgZoryLogo } from "../../../components/OgZoryLogo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          borderRadius: "24px",
        }}
      >
        {/* Logo using reusable component */}
        <OgZoryLogo address={address} size={160} />
      </div>
    ),
    {
      width: 200,
      height: 200,
    },
  );
}
