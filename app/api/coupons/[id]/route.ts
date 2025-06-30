// app/api/coupons/[id]/route.ts
import { NextResponse } from "next/server";
import { deleteCoupon } from "@/lib/coupons";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await deleteCoupon(params.id);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete coupon" },
            { status: 400 }
        );
    }
}