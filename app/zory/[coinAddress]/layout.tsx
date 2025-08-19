import type { Metadata } from "next";
import { getCoin } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ coinAddress: string }>;
}): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  const { coinAddress } = await params;
  const destinationUrl = `${URL}/zory/${coinAddress}`;
  const fallbackTitle = `Zory`;
  const fallbackImage = process.env.NEXT_PUBLIC_APP_OG_IMAGE || "/zory.png";

  // Fetch richer coin data from Zora
  let title = fallbackTitle;
  let imageUrl = fallbackImage;
  let description = `A story on Zora. Create yours now at zory.me`;
  try {
    const coinResponse = await getCoin({
      address: coinAddress as `0x${string}`,
      chain: base.id,
    });
    const zoraToken = coinResponse.data?.zora20Token;
    if (zoraToken) {
      const mediaUri = zoraToken?.mediaContent?.previewImage?.medium;
      if (typeof mediaUri === "string" && mediaUri.length > 0) {
        imageUrl = mediaUri;
      }
      title = zoraToken.name || title;
      description = zoraToken.description || description;
    }
  } catch {
    // Ignore; keep fallback image
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: URL,
      images: [imageUrl],
    },
    twitter: {
      title,
      description,
      images: [imageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl,
        button: {
          title: "View Zory",
          action: {
            type: "launch_frame",
            name: "Zory",
            url: destinationUrl,
            splashImageUrl:
              process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || "/zory.png",
            splashBackgroundColor:
              process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#000000",
          },
        },
      }),
    },
  };
}

export default function ViewAddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
