import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";

export async function POST(request: Request) {
    try {
        const { code, amount } = await request.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json(
                { message: "Valid coupon code is required" },
                { status: 400 }
            );
        }

        if (typeof amount !== 'number' || amount < 0) {
            return NextResponse.json(
                { message: "Valid order amount is required" },
                { status: 400 }
            );
        }

        const coupon = await validateCoupon(code.trim(), amount);
        return NextResponse.json(coupon);

    } catch (error) {
        console.error('Coupon validation error:', error);

        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : 'Coupon validation failed',
                code: 'COUPON_VALIDATION_ERROR'
            },
            { status: 400 }
        );
    }
}