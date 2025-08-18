import type { Metadata } from "next";
import { INDEX_SUPPLY_EVENT_SIGNATURE } from "@/lib/abi/zoraFactory";
import { getCoin } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

export async function generateMetadata({
  params,
}: {
  params: { address: string };
}): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  const fallbackTitle = `Zory by ${params.address.slice(0, 6)}...${params.address.slice(-4)}`;
  const fallbackImage = process.env.NEXT_PUBLIC_APP_OG_IMAGE || "/zory.png";
  const platformReferrer = process.env.NEXT_PUBLIC_PLATFORM_REFERRER;

  try {
    if (!platformReferrer) {
      return {
        title: fallbackTitle,
        openGraph: {
          images: [fallbackImage],
          url: URL,
        },
        twitter: {
          images: [fallbackImage],
        },
      };
    }

    // Look up most recent coin for this creator via Index Supply (same as the hook)
    const indexResponse = await fetch(
      `https://api.indexsupply.net/query?chain=${base.id}`,
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify([
          {
            event_signatures: [INDEX_SUPPLY_EVENT_SIGNATURE],
            query: `select caller, platformReferrer, coin, uri, name
                 from coincreatedv4
                 where platformReferrer = ${platformReferrer}
                 and caller = ${params.address}
                 order by block_num desc`,
          },
        ]),
        // Avoid caching to reflect latest state
        cache: "no-store",
      },
    );

    const apiResult = await indexResponse.json();
    const coinsResult: any[] = apiResult?.result?.[0]?.slice(1) || [];

    if (coinsResult.length === 0) {
      return {
        title: fallbackTitle,
        description:
          "A Zory is a story on Zora. Create yours now and share it with your friends.",
        openGraph: {
          images: [fallbackImage],
          url: URL,
        },
        twitter: {
          images: [fallbackImage],
        },
      };
    }

    const userCoin = coinsResult[0];
    const coinAddress: string = userCoin[2];
    const coinName: string | undefined = userCoin[4];

    console.log("coinAddress", userCoin, params.address);

    // Fetch richer coin data from Zora
    let imageUrl = fallbackImage;
    try {
      const coinResponse = await getCoin({
        address: coinAddress as `0x${string}`,
        chain: base.id,
      });
      const zoraToken = coinResponse.data?.zora20Token;
      const mediaUri = zoraToken?.mediaContent?.previewImage?.medium;
      if (typeof mediaUri === "string" && mediaUri.length > 0) {
        imageUrl = mediaUri;
      }
    } catch {
      // Ignore; keep fallback image
    }

    const title = coinName || fallbackTitle;
    const description = `See the latest from ${title}. Create yours now at zory.me`;

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
  } catch {
    return {
      title: fallbackTitle,
      openGraph: {
        images: [fallbackImage],
        url: URL,
      },
      twitter: {
        images: [fallbackImage],
      },
    };
  }
}

export default function ViewAddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
