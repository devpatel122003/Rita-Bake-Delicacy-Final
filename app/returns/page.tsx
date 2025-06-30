"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function ReturnsAndRefunds() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-pink-800 mb-6">Returns & Refunds Policy</h1>

                <div className="prose prose-pink max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-pink-700 mb-4">Our Return Policy</h2>
                        <p className="mb-4">
                            At Rita's Bake Delicacy, we take pride in our handmade cakes and desserts.
                            Due to the perishable nature of our products, we generally <strong>do not accept returns </strong>
                            once an order has been picked up or delivered.
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>All sales are final for perishable items</li>
                            <li>Non-perishable items may be returned within 3 days</li>
                            <li>Returns require original receipt</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-pink-700 mb-4">Quality Issues</h2>
                        <p className="mb-4">
                            If you're unsatisfied with your order due to quality issues:
                        </p>
                        <ol className="list-decimal pl-6 mb-4 space-y-2">
                            <li>Contact us within 2 hours of delivery/pickup</li>
                            <li>Provide photos of the issue</li>
                            <li>We'll offer replacement or store credit</li>
                        </ol>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-pink-700 mb-4">Refund Process</h2>
                        <div className="bg-pink-50 p-4 rounded-lg mb-4">
                            <h3 className="font-semibold text-pink-800 mb-2">Eligible Refunds:</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Wrong item delivered</li>
                                <li>Significant quality issues</li>
                                <li>Cancelled orders before preparation</li>
                            </ul>
                        </div>
                        <p>
                            Refunds are processed within 5-7 business days to the original payment method.
                        </p>
                    </section>

                    <div className="mt-8">
                        <Button asChild className="bg-pink-600 hover:bg-pink-700">
                            <Link href="/contact">Need Help? Contact Us</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}