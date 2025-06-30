"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShoppingBag, MapPin, CreditCard, CheckCircle2, CheckCircle, XCircle } from "lucide-react";
import { Order, OrderItem, CouponApplied } from "@/types/order";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart-provider";
import { useAuth } from "@/components/auth-provider";
import { Coupon } from "@/types/coupon";
import { confirmPayment } from "@/lib/orders";

const processPayment = async (amount: number) => {
  const res = await fetch("/api/razorpay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error || "Payment failed");
  }

  return result;
};

function isValidOrder(data: any): data is Order {
  return data &&
    data._id &&
    data.customer &&
    (data.type === "simple" || data.type === "custom");
}

export default function CheckoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const couponParam = searchParams.get("coupon");
  const fromOrders = searchParams.get("fromOrders");
  const orderDataParam = searchParams.get("orderData");
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });
  const [notification, setNotification] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const initialCoupon = useMemo(() => {
    if (couponParam) {
      try {
        return JSON.parse(couponParam);
      } catch (e) {
        console.error('Failed to parse coupon', e);
        return null;
      }
    }
    return null;
  }, [couponParam]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  useEffect(() => {
    if (orderId) {
      if (orderId.startsWith('temp_')) {
        // Handle temp order from cart (simple order)
        try {
          setIsLoading(true);
          const orderData = JSON.parse(decodeURIComponent(orderDataParam || ''));

          // Set the order state with the temporary data
          setOrder({
            ...orderData,
            _id: orderId, // Use the temp ID
            status: "payment pending",
            paymentStatus: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          // Pre-fill form with user data
          setFormData({
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            notes: ""
          });
        } catch (error) {
          console.error('Error parsing order data:', error);
          showNotification("Failed to load order details", "error");
          router.push("/cart");
        } finally {
          setIsLoading(false);
        }
      } else if (fromOrders && orderDataParam) {
        // Handle order coming from orders page (custom order)
        try {
          setIsLoading(true);
          const decodedOrderData = decodeURIComponent(orderDataParam);
          const parsedOrder = JSON.parse(decodedOrderData);

          if (!isValidOrder(parsedOrder)) {
            throw new Error("Invalid order data");
          }

          const completeOrder: Order = {
            ...parsedOrder,
            items: parsedOrder.items || [],
            total: parsedOrder.total || parsedOrder.price || 0,
            finalAmount: parsedOrder.finalAmount || parsedOrder.price || 0,
            discountAmount: parsedOrder.discountAmount || 0,
            coupon: parsedOrder.coupon || undefined,
            type: parsedOrder.type || "custom"
          };

          setOrder(completeOrder);

          // Pre-fill form with existing order data
          setFormData({
            name: parsedOrder.customer?.name || user?.name || "",
            email: parsedOrder.customer?.email || user?.email || "",
            phone: parsedOrder.customer?.phone || user?.phone || "",
            address: parsedOrder.address || "",
            city: parsedOrder.city || "",
            state: parsedOrder.state || "",
            pincode: parsedOrder.pincode || "",
            notes: parsedOrder.notes || ""
          });
        } catch (e) {
          console.error('Failed to parse order data', e);
          showNotification("Failed to load order details", "error");
          router.push("/orders");
        } finally {
          setIsLoading(false);
        }
      } else {
        // Fetch order from API (either simple or custom order)
        setIsLoading(true);
        fetch(`/api/orders?orderId=${orderId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch order");
            return res.json();
          })
          .then((data) => {
            if (data.success && data.order) {
              setOrder(data.order);
              if (data.order.customer) {
                setFormData(prev => ({
                  ...prev,
                  name: data.order.customer.name,
                  email: data.order.customer.email,
                  phone: data.order.customer.phone,
                  address: data.order.address || "",
                  city: data.order.city || "",
                  state: data.order.state || "",
                  pincode: data.order.pincode || "",
                  notes: data.order.notes || ""
                }));
              }
            } else {
              throw new Error("Could not load order");
            }
          })
          .catch((error) => {
            showNotification(error.message, "error");
            router.push("/orders");
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [orderId, cart, user, couponParam, appliedCoupon, fromOrders, orderDataParam, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateShippingForm = () => {
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      showNotification(`Please fill in all required fields: ${missingFields.join(', ')}`, "error");
      return false;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      showNotification("Please enter a valid 6-digit PIN code", "error");
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      showNotification("Please enter a valid 10-digit phone number", "error");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showNotification("Please enter a valid email address", "error");
      return false;
    }

    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitPayment = async () => {
    if (!order) return;

    setIsProcessing(true);

    try {
      // For custom orders that aren't confirmed yet (shouldn't reach here normally)
      if (order.type === "custom" && order.status === "not confirmed") {
        throw new Error("Order price not confirmed yet");
      }

      const amountToPay = order.finalAmount || order.price || order.total || 0;
      console.log('Initiating payment for amount:', amountToPay);

      const result = await processPayment(amountToPay);
      console.log('Payment processed, opening Razorpay:', result);

      const paymentHandler = async (razorpayResponse: {
        razorpay_payment_id: string;
        razorpay_signature?: string;
      }) => {
        console.log('Razorpay payment success:', razorpayResponse);

        try {
          if (order._id.startsWith('temp_')) {
            // Handle simple orders from cart
            console.log('Creating permanent order from temp order...');
            const orderPayload = {
              ...order,
              status: "confirmed",
              paymentStatus: "paid",
              paymentId: razorpayResponse.razorpay_payment_id,
              paymentMethod: "online",
              paymentAmount: amountToPay,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              notes: formData.notes,
              ...(razorpayResponse.razorpay_signature && {
                paymentSignature: razorpayResponse.razorpay_signature
              })
            };

            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderPayload),
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
              throw new Error(result.error || "Order creation failed");
            }

            clearCart();
            showNotification("Order placed successfully!", "success");
            router.push(`/orders?orderId=${result.order._id}`);
          } else {
            // Handle both custom and simple existing orders
            console.log('Confirming payment for existing order...');
            const confirmation = await confirmPayment(
              order._id,
              razorpayResponse.razorpay_payment_id,
              amountToPay,
              razorpayResponse.razorpay_signature
            );

            if (order.type === "simple") clearCart();
            showNotification("Payment confirmed successfully!", "success");
            router.push(`/orders?orderId=${order._id}`);
          }
        } catch (error) {
          console.error('Order update error:', error);
          showNotification(
            `Payment succeeded but order update failed. Please contact support with payment ID: ${razorpayResponse.razorpay_payment_id}`,
            "error"
          );
        }
      };

      const options = {
        key: result.key,
        amount: result.order.amount,
        currency: result.order.currency,
        name: "Your Store",
        description: `Order #${order._id}`,
        order_id: result.order.id,
        handler: paymentHandler,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#DB2777",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response);
        showNotification(response.error.description || "Payment failed", "error");
      });

      rzp.open();
    } catch (error) {
      console.error('Payment processing error:', error);
      showNotification(
        error instanceof Error ? error.message : "Payment failed",
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="mb-6">Order ID is missing. Please go back and try again.</p>
        <Button onClick={() => router.push("/cart")}>Return to Cart</Button>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <p>Loading your order...</p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-pink-600' : 'text-gray-400'}`}>
              <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${step >= 1 ? 'border-pink-600 bg-pink-50' : 'border-gray-300'}`}>
                {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
              </div>
              <span className="mt-2 text-sm hidden sm:block">Shipping</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-pink-600' : 'bg-gray-300'}`}></div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-pink-600' : 'text-gray-400'}`}>
              <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${step >= 2 ? 'border-pink-600 bg-pink-50' : 'border-gray-300'}`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="mt-2 text-sm hidden sm:block">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {step === 1 && (
                <Card className="shadow-md">
                  <CardHeader className="bg-gradient-to-r from-pink-50 to-white border-b pb-4">
                    <CardTitle className="flex items-center text-pink-700">
                      <MapPin className="mr-2 h-5 w-5" />
                      Shipping Information
                    </CardTitle>
                    <CardDescription>Enter your delivery details</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleNextStep} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="example@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="10-digit mobile number"
                          required
                        />
                        <p className="text-xs text-gray-500">We'll send order updates on this number</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium">Delivery Address *</Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="House/Flat no., Building, Street, Area"
                          className="min-h-24"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="City"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-sm font-medium">State *</Label>
                          <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="State"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode" className="text-sm font-medium">PIN Code *</Label>
                          <Input
                            id="pincode"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            placeholder="6-digit PIN"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium">Order Notes</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Any special instructions for your order..."
                          className="min-h-24"
                        />
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-6"
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card className="shadow-md">
                  <CardHeader className="bg-gradient-to-r from-pink-50 to-white border-b pb-4">
                    <CardTitle className="flex items-center text-pink-700">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Review & Payment
                    </CardTitle>
                    <CardDescription>Confirm your details and complete payment</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-5">
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium mb-3 text-sm text-gray-700">Delivery Address</h4>
                        <div className="text-sm space-y-1">
                          <p className="font-medium">{formData.name}</p>
                          <p>{formData.address}</p>
                          <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                          <p>Phone: {formData.phone}</p>
                          <p>Email: {formData.email}</p>
                          {formData.notes && (
                            <>
                              <p className="mt-2 font-medium">Special Instructions:</p>
                              <p>{formData.notes}</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePreviousStep}
                          className="text-pink-600 border-pink-200 hover:bg-pink-50"
                        >
                          Edit Details
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSubmitPayment}
                          disabled={isProcessing}
                          className="bg-pink-600 hover:bg-pink-700 text-white"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `Pay ₹${(order.finalAmount || order.price || order.total || 0).toFixed(2)}`
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-md sticky top-6">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-white border-b pb-4">
                <CardTitle className="flex items-center text-pink-700">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {order.type === "custom" ? (
                    <div className="space-y-2">
                      {order.occasion && <p><strong>Occasion:</strong> {order.occasion}</p>}
                      {order.cakeSize && <p><strong>Cake Size:</strong> {order.cakeSize}</p>}
                      {order.flavor && <p><strong>Flavor:</strong> {order.flavor}</p>}
                      {order.description && <p><strong>Description:</strong> {order.description}</p>}
                      {order.requiredDate && (
                        <p><strong>Required Date:</strong> {new Date(order.requiredDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  ) : (
                    order.items && order.items.length > 0 && (
                      <div className="max-h-80 overflow-y-auto pr-2 space-y-4">
                        {order.items.map((item: OrderItem, index: number) => (
                          <div key={index} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="object-cover w-full h-full"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-xs text-gray-500">₹{item.price.toFixed(2)} × {item.quantity}</p>
                            </div>
                            <div className="font-medium text-sm">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm pt-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{(order.total || order.price || 0).toFixed(2)}</span>
                    </div>
                    {order.discountAmount && order.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{order.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-base pt-3">
                      <span>Total</span>
                      <span className="text-pink-700">
                        ₹{(order.finalAmount || order.price || order.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
    </>
  );
}