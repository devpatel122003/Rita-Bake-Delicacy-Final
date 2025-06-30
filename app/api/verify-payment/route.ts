import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, paymentId, signature, amount } = body;

        // Verify the payment signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");

        if (generatedSignature !== signature) {
            return NextResponse.json(
                { success: false, error: "Invalid signature" },
                { status: 400 }
            );
        }

        // You can optionally fetch payment details from Razorpay
        // const payment = await razorpay.payments.fetch(paymentId);

        return NextResponse.json({
            success: true,
            message: "Payment verified successfully"
        });

    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { success: false, error: "Payment verification failed" },
            { status: 500 }
        );
    }
}