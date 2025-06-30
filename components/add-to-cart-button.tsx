"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon, CheckIcon, XCircle } from "lucide-react";
import { useCart } from "./cart-provider";
import type { Product } from "@/types/product";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth-provider";

interface AddToCartButtonProps {
  product: Product;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  isStoreOnline: boolean;
}

export function AddToCartButton({
  product,
  variant = "default",
  size = "default",
  isStoreOnline
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isAdded, setIsAdded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'success' });

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  const handleAddToCart = () => {
    if (isAdded || isAnimating) return;

    if (!isStoreOnline) {
      showNotification("The store is currently offline. Please try again later.", "error");
      return;
    }

    if (!user) {
      showNotification("Please login to add items to your cart", "info");
      return;
    }

    setIsAnimating(true);
    showNotification("Added to cart successfully!", "success");

    const button = document.getElementById(`add-to-cart-${product._id}`);
    const cart = document.querySelector(".cart-icon");

    if (button && cart) {
      const floatingIcon = document.createElement("div");
      floatingIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;
      floatingIcon.className = "fixed text-pink-600 z-50";
      document.body.appendChild(floatingIcon);

      const buttonRect = button.getBoundingClientRect();
      const cartRect = cart.getBoundingClientRect();

      floatingIcon.style.top = `${buttonRect.top + buttonRect.height / 2 - 12}px`;
      floatingIcon.style.left = `${buttonRect.left + buttonRect.width / 2 - 12}px`;

      setTimeout(() => {
        floatingIcon.style.transition = "all 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        floatingIcon.style.top = `${cartRect.top + cartRect.height / 2 - 8}px`;
        floatingIcon.style.left = `${cartRect.left + cartRect.width / 2 - 8}px`;
        floatingIcon.style.transform = "scale(0.5)";
        floatingIcon.style.opacity = "0";
      }, 10);

      setTimeout(() => {
        if (document.body.contains(floatingIcon)) {
          document.body.removeChild(floatingIcon);
        }

        addToCart(product);
        setIsAdded(true);
        setIsAnimating(false);

        setTimeout(() => {
          setIsAdded(false);
        }, 2000);
      }, 700);
    } else {
      addToCart(product);
      setIsAdded(true);
      setIsAnimating(false);

      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }
  };

  return (
    <>
      <Button
        id={`add-to-cart-${product._id}`}
        onClick={handleAddToCart}
        variant={variant}
        size={size}
        className={
          variant === "default" ? "bg-pink-600 hover:bg-pink-700 w-full overflow-hidden" : "w-full overflow-hidden"
        }
        disabled={isAdded || isAnimating || !isStoreOnline}
      >
        <AnimatePresence mode="wait">
          {isAdded ? (
            <motion.div
              key="added"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex items-center"
            >
              <CheckIcon className="mr-2 h-4 w-4" />
              Added to Cart
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="flex items-center"
            >
              <ShoppingCartIcon className="mr-2 h-4 w-4" />
              {isStoreOnline ? "Add to Cart" : "Store Offline"}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Unified Notification Component */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[9999] max-w-xs sm:max-w-md ${notification.type === 'success' ? 'bg-green-500' :
                notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}
          >
            {notification.type === 'success' ? (
              <CheckIcon className="h-6 w-6" />
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