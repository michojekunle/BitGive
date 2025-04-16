import { NextResponse } from "next/server";
import { Readable } from "stream";
import pinataSDK from "@pinata/sdk";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_API_SECRET;

const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("image") as File;
        const name = formData.get("name") as string;

        if (!file) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);
        const stream = Readable.from(buffer);

        // Upload the file to Pinata
        const fileUploadResult = await pinata.pinFileToIPFS(stream, {
            pinataMetadata: {
                name: `${name}-image`,
            },
            pinataOptions: {
                cidVersion: 0,
            },
        });

        const fileCID = `https://gateway.pinata.cloud/ipfs/${fileUploadResult.IpfsHash}`;

        return NextResponse.json({ fileCID });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "An error occurred while processing the request" },
            { status: 500 }
        );
    }
}