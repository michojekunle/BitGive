import { NextResponse } from "next/server";
import pinataSDK from "@pinata/sdk";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_API_SECRET;

const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const fileCID = formData.get("fileCID") as string;
		const name = formData.get("name") as string;
		const description = formData.get("description") as string;
		const charityLink = formData.get("charityLink") as string;
		const charityId = formData.get("charityId") as string;
		const externalUrl = formData.get("externalUrl") as string;

		if (!fileCID || !name || !description || !charityLink || !externalUrl) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Create NFT metadata
		const metadata = {
			name,
			description,
			external_url: externalUrl,
			image: fileCID,
			attributes: [
				{ trait_type: "Donated To", value: charityLink },
				{ trait_type: "Charity Id", value: charityId },
			],
		};

		// Upload metadata to Pinata
		const metadataUploadResult = await pinata.pinJSONToIPFS(metadata, {
			pinataMetadata: {
				name: `${name}-metadata`,
			},
			pinataOptions: {
				cidVersion: 0,
			},
		});

		const tokenUri = `https://gateway.pinata.cloud/ipfs/${metadataUploadResult.IpfsHash}`;
		return NextResponse.json({ tokenUri });
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "An error occurred while processing the request" },
			{ status: 500 }
		);
	}
}