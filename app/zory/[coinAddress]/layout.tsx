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
  };
}

export default function ViewAddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
