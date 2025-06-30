import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();
    const client = await clientPromise;
    const db = client.db("myDatabase");

    const user = await db.collection("users").findOne({ phone });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 400 });
    }
    
    const orders = await db.collection("orders").find({ userId: user._id }).toArray();
    return NextResponse.json({ success: true, user: { ...user, orders } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
