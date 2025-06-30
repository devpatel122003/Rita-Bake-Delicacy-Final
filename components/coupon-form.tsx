// components/admin/coupon-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Coupon } from "@/types/coupon";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

interface CouponFormProps {
    initialData?: Coupon;
    onSuccess?: () => void;
}

export function CouponForm({ initialData, onSuccess }: CouponFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<Coupon, '_id'>>({
        code: initialData?.code || "",
        discountType: initialData?.discountType || "percentage",
        discountValue: initialData?.discountValue || 0,
        minOrderAmount: initialData?.minOrderAmount,
        validFrom: initialData?.validFrom || new Date().toISOString().split('T')[0],
        validUntil: initialData?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: initialData?.isActive || true,
    });
    const [notification, setNotification] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({ show: false, message: '', type: 'success' });
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ ...notification, show: false });
        }, 3000);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData?._id
                ? `/api/coupons/${initialData._id}`
                : '/api/coupons';

            const method = initialData?._id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error(response.statusText);



            showNotification(
                initialData?._id
                    ? "Coupon updated successfully"
                    : "Coupon created successfully",
                "success"
            )

            onSuccess?.();
        } catch (error) {

            showNotification(
                "Failed to save coupon",
                "error"
            )
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select
                        value={formData.discountType}
                        onValueChange={(value) => setFormData({ ...formData, discountType: value as 'percentage' | 'fixed' })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="discountValue">
                        {formData.discountType === 'percentage' ? 'Percentage' : 'Amount'}
                    </Label>
                    <Input
                        id="discountValue"
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                        required
                        min={0}
                        step={formData.discountType === 'percentage' ? 1 : 0.01}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="minOrderAmount">Minimum Order Amount (optional)</Label>
                    <Input
                        id="minOrderAmount"
                        type="number"
                        value={formData.minOrderAmount || ''}
                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value ? Number(e.target.value) : undefined })}
                        min={0}
                        step={0.01}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                        id="validFrom"
                        type="date"
                        value={typeof formData.validFrom === "string" ? formData.validFrom : formData.validFrom.toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                        id="validUntil"
                        type="date"
                        value={typeof formData.validUntil === "string" ? formData.validUntil : formData.validUntil.toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        required
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                </div>
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : initialData?._id ? "Update Coupon" : "Create Coupon"}
            </Button>
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-4 right-4 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[9999] max-w-xs sm:max-w-md ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle className="h-6 w-6" />
                        ) : (
                            <XCircle className="h-6 w-6" />
                        )}
                        <span>{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </form>

    );
}