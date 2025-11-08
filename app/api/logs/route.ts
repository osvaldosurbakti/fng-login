import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";


// POST -> add log
// GET -> list logs (optional: add query params)


export async function POST(req: NextRequest) {
const body = await req.json();
const { userEmail, role, action } = body;
if (!userEmail || !action) return NextResponse.json({ error: "userEmail/action required" }, { status: 400 });


const client = await clientPromise;
const db = client.db();
await db.collection("logs").insertOne({ userEmail, role, action, timestamp: new Date() });
return NextResponse.json({ ok: true });
}


export async function GET() {
const client = await clientPromise;
const db = client.db();
const logs = await db.collection("logs").find().sort({ timestamp: -1 }).limit(200).toArray();
return NextResponse.json(logs.map((l) => ({ ...l, _id: l._id.toString() })));
}