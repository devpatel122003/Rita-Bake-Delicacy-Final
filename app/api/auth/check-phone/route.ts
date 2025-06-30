import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    const client = await clientPromise;
    const db = client.db("myDatabase");

    const existingUser = await db.collection("users").findOne({ phone });
    return NextResponse.json({ isUnique: !existingUser });
  } catch (error) {
    console.error("Error checking phone uniqueness:", error);
    return NextResponse.json({ isUnique: false }, { status: 500 });
  }
}