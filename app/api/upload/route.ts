import {
  setApiKey,
  validateMetadataJSON,
  validateMetadataURIContent,
  validateImageMimeType,
  ValidMetadataURI,
  cleanAndValidateMetadataURI,
} from "@zoralabs/coins-sdk";
import { NextResponse } from "next/server";
import { Address } from "viem";
import { uploadToIPFS } from "../../../lib/utils/upload";

// Strong types for carousel metadata
interface CarouselMediaItem {
  uri: string;
  mime: string;
  timestamp: string;
}

interface CarouselContent {
  mime: string;
  uri: string;
  type: "CAROUSEL";
  carousel: {
    version: string;
    media: CarouselMediaItem[];
  };
}

export interface CarouselMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  properties: {
    creator: string;
    timestamp: string;
    platform: string;
    mediaCount: string;
  };
  content: CarouselContent;
}

export type UploadResponse = {
  success: true;
  metadata: {
    uri: string;
    name: string;
    symbol: string;
    description: string;
    json: CarouselMetadata;
  };
};

// Set up Zora API key
if (!process.env.ZORA_API_KEY) {
  throw new Error("Missing ZORA_API_KEY environment variable");
}
setApiKey(process.env.ZORA_API_KEY);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const creatorAddress = formData.get("creatorAddress") as string;
    const coinName = formData.get("coinName") as string;
    const coinSymbol = formData.get("coinSymbol") as string;
    const coinDescription = formData.get("coinDescription") as string;
    const existingMetadata = formData.get("existingMetadata") as string;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    if (!creatorAddress) {
      return NextResponse.json(
        { error: "Creator address is required" },
        { status: 400 },
      );
    }

    // Validate image MIME type
    try {
      validateImageMimeType(image.type);
    } catch {
      return NextResponse.json(
        { error: `Invalid image MIME type: ${image.type}` },
        { status: 400 },
      );
    }

    // Upload image to Zora
    const imageResult = await uploadToIPFS(image, {
      creatorAddress: creatorAddress as Address,
    });
    const imageUri = imageResult.url;

    // Generate timestamp on server
    const timestamp = new Date().toISOString();
    const timestampDisplay =
      new Date().toLocaleString("sv-SE").replace(" ", "T") +
      " " +
      new Date()
        .toLocaleTimeString("en-US", { timeZoneName: "short" })
        .split(" ")
        .pop();

    // Create carousel metadata structure
    let carouselMedia: CarouselMediaItem[] = [
      {
        uri: imageUri,
        mime: "image/jpeg",
        timestamp: timestamp,
      },
    ];

    // If this is an update, fetch and prepend to existing carousel
    if (existingMetadata) {
      try {
        // Use Zora's cleanAndValidateMetadataURI to get the proper URL
        const cleanUri = cleanAndValidateMetadataURI(
          existingMetadata as ValidMetadataURI,
        );
        const response = await fetch(cleanUri);
        if (response.ok) {
          const existing = (await response.json()) as CarouselMetadata;
          if (existing.content?.carousel?.media) {
            // Put new image first, then existing media
            carouselMedia = [
              ...carouselMedia, // New image first
              ...existing.content.carousel.media, // Existing media after
            ];
          }
        }
      } catch (error) {
        console.error("Failed to fetch or parse existing metadata:", error);
      }
    }

    // Calculate date range for description
    const timestamps = carouselMedia
      .map((media) => media.timestamp)
      .filter(Boolean)
      .sort();

    let dateRangeDescription = "";
    if (timestamps.length > 0) {
      const earliest = new Date(timestamps[0]);
      const latest = new Date(timestamps[timestamps.length - 1]);

      const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year:
            earliest.getFullYear() === latest.getFullYear()
              ? "numeric"
              : undefined,
        });
      };

      const earliestFormatted = formatDate(earliest);
      const latestFormatted = formatDate(latest);

      if (earliestFormatted === latestFormatted) {
        dateRangeDescription = `Capturing ${carouselMedia.length} moment${carouselMedia.length > 1 ? "s" : ""} on ${earliestFormatted}`;
      } else {
        dateRangeDescription = `Capturing ${carouselMedia.length} moment${carouselMedia.length > 1 ? "s" : ""} from ${earliestFormatted} to ${latestFormatted}`;
      }
    } else {
      // Fallback when no timestamps are available
      dateRangeDescription = `Capturing ${carouselMedia.length} moment${carouselMedia.length > 1 ? "s" : ""} on Zory`;
    }

    // Create carousel metadata
    const carouselMetadata: CarouselMetadata = {
      name: coinName || "Zory Post",
      symbol: coinSymbol || "ZORY",
      description: `${
        dateRangeDescription ||
        `${coinDescription || "A moment captured on Zory"} - ${timestampDisplay}`
      }. Create yours now at zory.me`,
      image: imageUri,
      properties: {
        creator: creatorAddress,
        timestamp: timestamp,
        platform: "Zory",
        mediaCount: carouselMedia.length.toString(),
      },
      content: {
        mime: "image/jpeg",
        uri: imageUri,
        type: "CAROUSEL",
        carousel: {
          version: "1.0.0",
          media: carouselMedia,
        },
      },
    };

    // Validate metadata JSON before uploading
    try {
      validateMetadataJSON(carouselMetadata);
    } catch (error) {
      console.error("Metadata validation failed:", error);
      return NextResponse.json(
        { error: "Invalid metadata format" },
        { status: 400 },
      );
    }

    // Create metadata file
    const metadataFile = new File(
      [JSON.stringify(carouselMetadata)],
      "metadata.json",
      {
        type: "application/json",
      },
    );

    // Upload metadata to Zora
    const metadataResult = await uploadToIPFS(metadataFile, {
      creatorAddress: creatorAddress as Address,
    });
    const metadataUri = metadataResult.url;

    // Validate metadata URI content for Zora compatibility
    try {
      await validateMetadataURIContent(metadataUri as ValidMetadataURI);
    } catch (error) {
      console.error("Metadata URI content validation failed:", error);
      return NextResponse.json(
        { error: "Metadata content validation failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true as const,
      metadata: {
        uri: metadataUri,
        name: carouselMetadata.name,
        symbol: carouselMetadata.symbol,
        description: carouselMetadata.description,
        json: carouselMetadata,
      },
    } satisfies UploadResponse);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
