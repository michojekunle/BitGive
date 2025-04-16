import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Example frontend code to call the API route
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
      console.log("File CID:", data.fileCID);
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
