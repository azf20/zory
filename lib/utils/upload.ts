import { createZoraUploaderForCreator } from "@zoralabs/coins-sdk";
import { Address } from "viem";

interface UploadResult {
  cid: string;
  url: string;
  size: number;
  mimeType: string;
}

/**
 * Uploads a file to IPFS via Zora
 * @param file - File to upload
 * @param options - Upload options
 * @returns Promise<UploadResult> - The upload result with CID and URL
 */
export async function uploadToIPFS(
  file: File,
  options: {
    creatorAddress: Address;
  },
): Promise<UploadResult> {
  const zoraUploader = createZoraUploaderForCreator(options.creatorAddress);
  const zoraResult = await zoraUploader.upload(file);

  // Extract CID from Zora's URL (ipfs://cid)
  const cid = zoraResult.url.replace("ipfs://", "");

  return {
    cid,
    url: zoraResult.url,
    size: file.size,
    mimeType: file.type,
  };
}
