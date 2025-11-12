import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Log from "@/models/Log"; // Pastikan model Log sudah dibuat

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, role, action } = body;
    
    if (!userEmail || !action) {
      return NextResponse.json(
        { error: "userEmail and action are required" }, 
        { status: 400 }
      );
    }

    await connectDB();
    
    const log = await Log.create({
      userEmail,
      role: role || "user",
      action,
      timestamp: new Date()
    });

    return NextResponse.json({ 
      ok: true, 
      log: {
        id: log._id.toString(),
        userEmail: log.userEmail,
        role: log.role,
        action: log.action,
        timestamp: log.timestamp
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating log:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '200');
    const userEmail = searchParams.get('userEmail');
    
    let query = {};
    if (userEmail) {
      query = { userEmail };
    }
    
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}