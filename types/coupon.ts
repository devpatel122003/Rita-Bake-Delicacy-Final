// types/coupon.ts
export interface Coupon {
    _id?: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount?: number;
    validFrom: string | Date;
    validUntil: string | Date;
    isActive: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

// This matches the CouponApplied interface in order.ts
export interface CouponToApply {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
}