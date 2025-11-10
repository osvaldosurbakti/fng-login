// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["superadmin", "admin"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'fng-products',
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto:good' },
            { format: 'webp' }
          ],
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ 
      success: true, 
      imageUrl: (result as any).secure_url,
      publicId: (result as any).public_id
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

// app/api/admin/upload/route.ts - DELETE method
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["superadmin", "admin"].includes(session.user?.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: "Public ID is required" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ 
      success: true, 
      result 
    });

  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}