import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(ms: number): string {
  const date = new Date(ms);
  // console.log(ms);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(ms: number): string {
  const date = new Date(ms);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // for AM/PM format; set to false for 24-hour format
  });
}

export async function uploadImageToIPFS(imageFile: File, name: string) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("name", name);

  try {
    const response = await fetch("/api/ipfs-upload/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload image");
    }

    const data = await response.json();
    // console.log("File CID:", data.fileCID);
    return data.fileCID;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function uploadNftMetadata(data: {
  fileCID: string;
  name: string;
  description: string;
  charityLink: string;
  charityId: string;
  externalUrl: string;
}): Promise<{ tokenUri?: string; error?: string }> {
  try {
    const response = await fetch("/api/ipfs-upload/nft-metadata", {
      method: "POST",
      body: (() => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value);
        });
        return formData;
      })(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "Failed to upload metadata" };
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading NFT metadata:", error);
    return { error: "An unexpected error occurred" };
  }
}
