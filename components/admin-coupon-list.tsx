"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coupon } from "@/types/coupon";
import { CouponForm } from "./coupon-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, PencilIcon, TrashIcon, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface CouponListProps {
    coupons: Coupon[];
    onUpdate: () => void;
}

export function CouponList({ coupons, onUpdate }: CouponListProps) {
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [notification, setNotification] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({ show: false, message: '', type: 'success' });
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ ...notification, show: false });
        }, 3000);
    };

    const filteredCoupons = coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        setDeleteLoading(id);
        try {
            const response = await fetch(`/api/coupons/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error("Failed to delete coupon");

            showNotification("Coupon deleted successfully", "success");
            onUpdate();
        } catch (error) {
            showNotification("Failed to delete coupon", "error");
        } finally {
            setDeleteLoading(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Manage Coupons</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search coupons..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => setEditingCoupon(null)}
                                className="bg-pink-600 hover:bg-pink-700"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Create Coupon
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
                            </DialogHeader>
                            <CouponForm
                                initialData={editingCoupon || undefined}
                                onSuccess={() => {
                                    setOpenDialog(false);
                                    onUpdate();
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {filteredCoupons.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No coupons found</p>
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            className="text-pink-600 mt-2"
                            onClick={() => setSearchQuery("")}
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            ) : isDesktop ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Min. Order</TableHead>
                                <TableHead>Validity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCoupons.map((coupon) => (
                                <TableRow key={coupon._id}>
                                    <TableCell className="font-medium">{coupon.code}</TableCell>
                                    <TableCell>
                                        {coupon.discountType === 'percentage'
                                            ? `${coupon.discountValue}%`
                                            : `₹${coupon.discountValue.toFixed(2)}`}
                                    </TableCell>
                                    <TableCell>
                                        {coupon.minOrderAmount ? `₹${coupon.minOrderAmount.toFixed(2)}` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{format(new Date(coupon.validFrom), 'MMM dd, yyyy')}</span>
                                            <span className="text-xs text-gray-500">to</span>
                                            <span>{format(new Date(coupon.validUntil), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={coupon.isActive ? "default" : "secondary"}>
                                            {coupon.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingCoupon(coupon);
                                                    setOpenDialog(true);
                                                }}
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(coupon._id!)}
                                                disabled={deleteLoading === coupon._id}
                                            >
                                                {deleteLoading === coupon._id ? (
                                                    <span className="animate-pulse">...</span>
                                                ) : (
                                                    <TrashIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredCoupons.map((coupon) => (
                        <Card key={coupon._id}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">{coupon.code}</h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Badge variant={coupon.isActive ? "default" : "secondary"}>
                                                {coupon.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                                                {coupon.discountType === 'percentage'
                                                    ? `${coupon.discountValue}%`
                                                    : `₹${coupon.discountValue.toFixed(2)}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditingCoupon(coupon);
                                                setOpenDialog(true);
                                            }}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(coupon._id!)}
                                            disabled={deleteLoading === coupon._id}
                                        >
                                            {deleteLoading === coupon._id ? (
                                                <span className="animate-pulse">...</span>
                                            ) : (
                                                <TrashIcon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-gray-500">Min. Order</p>
                                        <p>{coupon.minOrderAmount ? `₹${coupon.minOrderAmount.toFixed(2)}` : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Validity</p>
                                        <p className="text-sm">
                                            {format(new Date(coupon.validFrom), 'MMM dd')} - {format(new Date(coupon.validUntil), 'MMM dd')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Notification Component */}
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
        </div>
    );
}