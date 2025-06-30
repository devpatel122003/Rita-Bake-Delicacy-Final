// app/api/coupons/route.ts
import { NextResponse } from "next/server";
import { getCoupons, createCoupon } from "@/lib/coupons";
import { Coupon } from "@/types/coupon";

export async function GET() {
    try {
        const coupons = await getCoupons();
        return NextResponse.json(coupons);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch coupons" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const coupon: Coupon = await request.json();
        const createdCoupon = await createCoupon(coupon);
        return NextResponse.json(createdCoupon, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create coupon" },
            { status: 400 }
        );
    }
}