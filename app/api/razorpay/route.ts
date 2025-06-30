import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const options = {
      amount: body.amount * 100, // Amount in paise
      currency: "INR",
      receipt: `order_${new Date().getTime()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID // ← Add this line
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}