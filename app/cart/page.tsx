"use client";

import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2Icon, MinusIcon, PlusIcon, ShoppingBagIcon, ChevronLeftIcon, CheckCircle, XCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Coupon } from "@/types/coupon";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [notification, setNotification] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? cartSubtotal * (appliedCoupon.discountValue / 100)
      : appliedCoupon.discountValue
    : 0;
  const finalTotal = Math.max(1, cartSubtotal - discountAmount);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      showNotification("Please enter a coupon code", "error");
      return;
    }

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          amount: cartSubtotal
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid coupon code');
      }

      setAppliedCoupon(data);
      setCouponError("");

      showNotification(
        `Coupon applied! You've saved ₹${(
          data.discountType === 'percentage'
            ? cartSubtotal * (data.discountValue / 100)
            : data.discountValue
        ).toFixed(2)}`,
        "success"
      );
    } catch (error) {
      setAppliedCoupon(null);
      const errorMessage = error instanceof Error ? error.message : "Invalid coupon code";
      setCouponError(errorMessage);
      showNotification(errorMessage, "error");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    showNotification("Coupon removed", "success");
  };

  const handleClearCart = () => {
    clearCart();
    showNotification("Cart cleared", "success");
  };

  const handleProceedToCheckout = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    const orderData = {
      type: "simple",
      customer: {
        name: user.name || "Customer",
        email: user.email || "customer@example.com",
        phone: user.phone || "9999999999",
      },
      items: cart.map((item) => ({
        ...item,
        image: item.image || "/placeholder.svg?height=96&width=96",
      })),
      total: cartSubtotal,
      price: finalTotal,
      finalAmount: finalTotal,
      discountAmount: discountAmount,
      coupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue,
        discountAmount: discountAmount
      } : undefined,
      requiredDate: new Date(),
    };

    // Generate a temporary order ID
    const tempOrderId = `temp_${Date.now()}`;
    router.push(`/checkout?orderId=${tempOrderId}&orderData=${encodeURIComponent(JSON.stringify(orderData))}`);
  };

  // Not logged in view
  if (!user) {
    return (
      <div className="container px-4 md:px-6 mx-auto py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBagIcon className="h-24 w-24 text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Please log in to view your cart</h1>
            <Button asChild className="bg-pink-600 hover:bg-pink-700">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart view
  if (cart.length === 0) {
    return (
      <div className="container px-4 md:px-6 mx-auto py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBagIcon className="h-24 w-24 text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any cakes to your cart yet.</p>
            <Button asChild className="bg-pink-600 hover:bg-pink-700">
              <Link href="/products">Browse Cakes</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Zomato-inspired view
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center px-4 py-3">
            <Link href="/products" className="mr-3">
              <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
            </Link>
            <h1 className="text-xl font-medium">Your Cart ({cart.length})</h1>
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 px-4 py-3 space-y-4 mb-24">
          {cart.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex gap-3">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.image || "/placeholder.svg?height=80&width=80"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center h-8 border border-pink-600 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        className="w-8 flex items-center justify-center text-pink-600"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 flex items-center justify-center text-pink-600"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500"
                      >
                        <Trash2Icon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky footer with checkout */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
          <div className="p-4">
            {/* Coupon section */}
            <div className="mb-3">
              {appliedCoupon ? (
                <div className="flex justify-between items-center bg-green-50 p-2 rounded-md mb-2">
                  <div className="text-green-700 text-sm">
                    Coupon: {appliedCoupon.code} (-₹{discountAmount.toFixed(2)})
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 text-sm h-9"
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode}
                    className="h-9"
                  >
                    Apply
                  </Button>
                </div>
              )}
              {couponError && (
                <p className="text-red-500 text-xs mb-2">{couponError}</p>
              )}
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="text-gray-900">₹{cartSubtotal.toFixed(2)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-700 font-medium">Discount</span>
                <span className="text-green-600">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">Total</span>
              <span className="text-lg font-bold text-gray-900">₹{finalTotal.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-red-500 border-red-500 hover:bg-red-50"
              >
                Clear Cart
              </Button>

              <Button
                className="bg-pink-600 hover:bg-pink-700 text-white"
                onClick={handleProceedToCheckout}
              >
                Checkout
              </Button>
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
              className={`fixed bottom-20 right-4 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[9999] max-w-xs sm:max-w-md ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
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

  // Desktop view (original with some improvements)
  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-pink-800">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-200 last:border-0"
                  >
                    <div className="relative w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg?height=96&width=96"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>

                      <p className="text-sm text-gray-500 mt-1">₹{item.price.toFixed(2)} each</p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center h-9 border border-pink-600 rounded-md overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                            className="px-3 text-pink-600 hover:bg-pink-50"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="px-3 text-pink-600 hover:bg-pink-50"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Remove item"
                        >
                          <Trash2Icon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="text-red-500 border-red-500 hover:bg-red-50 w-full sm:w-auto"
                >
                  Clear Cart
                </Button>

                <Button asChild variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50 w-full sm:w-auto">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4 shadow-md">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-white border-b pb-4">
              <CardTitle className="flex items-center text-pink-700">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">



                {/* Coupon section - cart-specific */}
                <div className="mb-4">
                  {appliedCoupon ? (
                    <div className="flex justify-between items-center bg-green-50 p-3 rounded-md mb-3">
                      <div className="text-green-700 text-sm">
                        Coupon Applied: {appliedCoupon.code} (-₹{discountAmount.toFixed(2)})
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-red-500 text-xs mb-2">{couponError}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{cartSubtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-green-600">Free</span>
                  </div>

                  <div className="flex justify-between py-2 font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 bg-pink-600 hover:bg-pink-700"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}