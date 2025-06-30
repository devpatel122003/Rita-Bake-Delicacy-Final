import clientPromise from "./mongodb";


const COLLECTION_NAME = "coupons";

export async function getCoupons(): Promise<Coupon[]> {
    const client = await clientPromise;
    const db = client.db("myDatabase");

    // Create collection if it doesn't exist
    const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
    if (collections.length === 0) {
        await db.createCollection(COLLECTION_NAME);
        await db.collection(COLLECTION_NAME).createIndex({ code: 1 }, { unique: true });
    }

    const docs = await db.collection(COLLECTION_NAME).find().toArray();
    return docs.map(doc => ({
        ...doc,
        _id: doc._id?.toString(),
        validFrom: new Date(doc.validFrom).toISOString(),
        validUntil: new Date(doc.validUntil).toISOString()
    })) as Coupon[];
}

export async function createCoupon(coupon: Coupon): Promise<Coupon> {
    const client = await clientPromise;
    const db = client.db("myDatabase");
    const now = new Date();

    // Ensure dates are stored as Date objects and remove string _id if present
    const { _id, ...couponWithoutId } = coupon;
    const couponData = {
        ...couponWithoutId,
        validFrom: new Date(coupon.validFrom),
        validUntil: new Date(coupon.validUntil),
        createdAt: now,
        updatedAt: now
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(couponData);
    return { ...coupon, _id: result.insertedId.toString() };
}

export async function deleteCoupon(id: string): Promise<void> {
    const client = await clientPromise;
    const db = client.db("myDatabase");
    await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
}

import { getDatabase } from "./mongodb";
import { Coupon } from "../types/coupon";
import { ObjectId } from "mongodb";

export async function validateCoupon(code: string, orderAmount: number): Promise<Coupon> {
    try {
        // 1. Get the correct database connection
        const db = await getDatabase();

        console.log(`[Coupon Validation] Starting validation for code: ${code}`);
        console.log(`[Database] Connected to: ${db.databaseName}`);

        // 2. Verify the coupons collection exists
        const collections = await db.listCollections({ name: 'coupons' }).toArray();
        if (collections.length === 0) {
            throw new Error('Coupons collection does not exist');
        }

        // 3. Search for coupon (case-insensitive)
        const coupon = await db.collection('coupons').findOne({
            code: { $regex: new RegExp(`^${code}$`, 'i') },
            isActive: true
        });

        if (!coupon) {
            // Log all active coupons for debugging
            const activeCoupons = await db.collection('coupons')
                .find({ isActive: true })
                .project({ code: 1, _id: 0 })
                .toArray();

            console.log('[Debug] Active coupons:', activeCoupons.map(c => c.code));
            throw new Error(`No active coupon found with code: ${code}`);
        }

        // 4. Convert and validate dates
        const now = new Date();
        const validFrom = coupon.validFrom instanceof Date ? coupon.validFrom : new Date(coupon.validFrom);
        const validUntil = coupon.validUntil instanceof Date ? coupon.validUntil : new Date(coupon.validUntil);

        console.log('[Date Validation]', {
            now: now.toISOString(),
            validFrom: validFrom.toISOString(),
            validUntil: validUntil.toISOString()
        });

        if (now < validFrom) {
            throw new Error(`Coupon "${code}" valid from ${validFrom.toLocaleDateString()}`);
        }

        if (now > validUntil) {
            throw new Error(`Coupon "${code}" expired on ${validUntil.toLocaleDateString()}`);
        }

        // 5. Validate minimum order amount
        const minAmount = Number(coupon.minOrderAmount || 0);
        if (minAmount > 0 && orderAmount < minAmount) {
            throw new Error(`Requires minimum order of ₹${minAmount} (current: ₹${orderAmount})`);
        }

        // 6. Return formatted coupon
        return {
            _id: coupon._id instanceof ObjectId ? coupon._id.toString() : coupon._id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderAmount: coupon.minOrderAmount,
            validFrom: validFrom.toISOString(),
            validUntil: validUntil.toISOString(),
            isActive: coupon.isActive
        };

    } catch (error) {
        console.error('[Coupon Validation Failed]', error);
        throw error; // Re-throw for the API route to handle
    }
}