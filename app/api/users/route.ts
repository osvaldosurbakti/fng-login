import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
const body = await req.json();
const { name, email, password, role } = body;
if (!email || !password) return NextResponse.json({ error: "email/password required" }, { status: 400 });


const client = await clientPromise;
const db = client.db();


const existing = await db.collection("users").findOne({ email });
if (existing) return NextResponse.json({ error: "email exists" }, { status: 400 });


const hash = await bcrypt.hash(password, 10);
const res = await db.collection("users").insertOne({
name: name || "",
email,
password: hash,
role: role === "superadmin" ? "superadmin" : "admin",
createdAt: new Date(),
});


return NextResponse.json({ ok: true, id: res.insertedId.toString() });
}