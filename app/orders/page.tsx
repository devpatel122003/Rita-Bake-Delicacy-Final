"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { getUserOrders } from "@/lib/orders"; // Removed confirmPayment import
import { Loader2, PackageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Order, OrderItem } from "@/types/order";


export default function OrdersPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.phone) {
      getUserOrders(user.phone)
        .then((data: Order[]) => {
          const sortedOrders = (data || []).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sortedOrders);
        })
        .catch((error) => {
          console.error("Error fetching orders:", error);
          setOrders([]);
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  // page.tsx
  const handleConfirmPayment = async (order: Order) => {
    try {
      if (order.type === "custom" && order.status === "not confirmed") {
        // For custom orders that haven't been confirmed by admin yet
        // Just redirect to orders page without payment option
        router.push(`/orders?orderId=${order._id}`);
        return;
      }

      // For payment pending orders (both custom with price set and simple orders)
      const orderData = encodeURIComponent(JSON.stringify(order));
      router.push(`/checkout?orderId=${order._id}&fromOrders=true&orderData=${orderData}`);
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };


  if (isLoading || loadingOrders) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-600 mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "not confirmed":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Not Confirmed</Badge>;
      case "payment pending":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Payment Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
      case "preparing":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Preparing</Badge>;
      case "out for delivery":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Out for Delivery</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A"; // Handle missing or null dates
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return isNaN(dateObj.getTime()) ? "N/A" : dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container px-4 md:px-6 mx-auto py-8">
      <div className="max-w-xl mx-auto"> {/* Adjusted width */}
        <h1 className="text-2xl font-bold mb-6 text-pink-800">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <PackageIcon className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-gray-500">Once you place an order, it will appear here.</p>
            <Button className="mt-4 bg-pink-600 hover:bg-pink-700" onClick={() => router.push("/products")}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 flex justify-between items-start">
                    <div className="flex justify-between items-center w-full mt-2">
                      <strong>Order Status:</strong>
                      <div className="flex items-center">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    <p>
                      <strong>Order ID:</strong> #{order._id}
                    </p>{/* Right side: Status Badge */}

                    <p>
                      <strong>Order Date:</strong> {formatDate(order.createdAt)}
                    </p>
                  </CardHeader>

                  <CardContent>
                    {order.items && order.items.length > 0 ? (
                      // Display for normal orders
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Items</h3>
                        <ul className="divide-y divide-gray-100">
                          {order.items.map((item: OrderItem, idx: number) => (
                            <li key={idx} className="py-1 flex justify-between">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                <span className="text-gray-500 ml-2">x{item.quantity}</span>
                              </div>
                              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex justify-between pt-2 border-t border-gray-100">
                          <span className="font-bold">Total</span>
                          <span className="font-bold">₹{order.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      // Display for custom cake orders
                      <div className="space-y-2">
                        {order.occasion && <p><strong>Occasion:</strong> {order.occasion}</p>}
                        {order.cakeSize && <p><strong>Cake Size:</strong> {order.cakeSize}</p>}
                        {order.flavor && <p><strong>Flavor:</strong> {order.flavor}</p>}
                        {order.description && <p><strong>Description:</strong> {order.description}</p>}
                        {order.image && (
                          <div className="flex justify-center">
                            <img
                              src={order.image}
                              alt="Custom Cake"
                              className="w-48 h-auto rounded-md"
                            />
                          </div>
                        )}
                        {order.requiredDate && (
                          <p><strong>Required Date:</strong> {formatDate(order.requiredDate)}</p>
                        )}
                        {order.price && (
                          <div className="flex justify-between pt-2 border-t border-gray-100">
                            <span className="font-bold">Price</span>
                            <span className="font-bold">₹{order.price.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {order.status === "payment pending" && (
                      <>
                        {order.type === "simple" || (order.type === "custom" && order.price) ? (
                          <Button
                            className="w-full mt-3 bg-pink-600 hover:bg-pink-700"
                            onClick={() => handleConfirmPayment(order)}
                          >
                            Confirm Payment
                          </Button>
                        ) : (
                          <div className="mt-3 text-sm text-yellow-600 p-3 bg-yellow-50 rounded-md">
                            Waiting for price confirmation from admin
                          </div>
                        )}
                      </>
                    )}

                    {order.status === "not confirmed" && order.type === "custom" && (
                      <div className="mt-3 text-sm text-yellow-600 p-3 bg-yellow-50 rounded-md">
                        Your custom order is being reviewed. We'll contact you soon with the final price.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}