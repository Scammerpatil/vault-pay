import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    let name = formData.get("name") as string;
    const folderName = formData.get("folderName") as string;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "Invalid file" },
        { status: 400 },
      );
    }

    name = name.split(" ").join("_");

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folderName,
            public_id: name,
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    return NextResponse.json({
      success: true,
      path: uploadResult.secure_url,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Unknown error occurred during upload." },
      { status: 500 },
    );
  }
}
