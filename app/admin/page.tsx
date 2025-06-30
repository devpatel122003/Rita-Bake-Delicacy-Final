"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminOrderList } from "@/components/admin-order-list";
import { useAuth } from "@/components/auth-provider";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminProductList } from "@/components/admin-product-list";
import { getStoreStatus, setStoreStatus } from "@/lib/store";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import dynamic from 'next/dynamic';
import { Coupon } from "@/types/coupon";
import { CouponList } from "@/components/admin-coupon-list";
import { motion, AnimatePresence } from "framer-motion";

const AdminCouponList = dynamic(
  () => import('@/components/admin-coupon-list').then(mod => mod.CouponList),
  {
    ssr: false,
    loading: () => <div>Loading coupons...</div>
  }
);

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export default function AdminPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [isStoreOnline, setIsStoreOnline] = useState(true);
  const [isLoadingStoreStatus, setIsLoadingStoreStatus] = useState(true);
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  // Function to generate signed URLs for product images
  const getSignedImageUrl = async (imageUrl: string) => {
    if (!imageUrl?.startsWith("s3://")) return imageUrl;

    try {
      const params = {
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
        Key: imageUrl.replace("s3://", ""),
      };
      const command = new GetObjectCommand(params);
      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return imageUrl; // Fallback to original URL if signing fails
    }
  };

  useEffect(() => {
    const fetchStoreStatus = async () => {
      try {
        const status = await getStoreStatus();
        setIsStoreOnline(status.isOnline);
      } catch (error) {
        console.error("Failed to fetch store status:", error);
        showNotification("Failed to fetch store status", "error");
      } finally {
        setIsLoadingStoreStatus(false);
      }
    };

    fetchStoreStatus();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      showNotification("You don't have permission to access the admin dashboard", "error");
      router.push("/");
    }
  }, [isAdmin, isLoading, router]);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons');
      const data = await response.json();
      setCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      showNotification("Failed to fetch coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStore = async () => {
    const newStatus = !isStoreOnline;
    try {
      const result = await setStoreStatus(newStatus);
      if (result.success) {
        setIsStoreOnline(newStatus);
        showNotification(
          newStatus ? "Store is now online" : "Store is now offline",
          "success"
        );
      } else {
        showNotification("Failed to update store status", "error");
      }
    } catch (error) {
      console.error("Failed to update store status:", error);
      showNotification(
        error instanceof Error ? error.message : "Failed to update store status",
        "error"
      );
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  if (isLoading || isLoadingStoreStatus) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-600 mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container px-4 md:px-6 mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-pink-800">Admin Dashboard</h1>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isStoreOnline}
              onCheckedChange={handleToggleStore}
              id="store-status"
              disabled={isLoadingStoreStatus}
            />
            <Label htmlFor="store-status" className={isStoreOnline ? "text-green-600" : "text-red-600"}>
              Store is {isStoreOnline ? "Online" : "Offline"}
            </Label>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-8">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <AdminProductList getSignedImageUrl={getSignedImageUrl} />
        </TabsContent>

        <TabsContent value="orders">
          <AdminOrderList />
        </TabsContent>

        <TabsContent value="coupons">
          <CouponList coupons={coupons} onUpdate={fetchCoupons} />
        </TabsContent>
      </Tabs>

      {/* Notification */}
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