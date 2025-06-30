import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, phone, email, password } = await req.json();
    const client = await clientPromise;
    const db = client.db("myDatabase");

    const existingUser = await db.collection("users").findOne({ phone });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Phone number already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, phone, email, password: hashedPassword, orders: [] };
    await db.collection("users").insertOne(newUser);

    return NextResponse.json({ success: true, message: "Account created successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
