"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingCartIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  CakeIcon,
  LogOutIcon,
  LogInIcon,
} from "lucide-react";
import { useCart } from "@/components/cart-provider"; // Ensure this import is correct
import { useAuth } from "@/components/auth-provider"; // Ensure this import is correct
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart(); // Use the cart context
  const { user, logout, isAdmin } = useAuth(); // Use the auth context
  const pathname = usePathname();
  const isMobile = useMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutNotification, setShowLogoutNotification] = useState(false); // State for logout notification

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Handle scroll to add a shadow to the header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle body overflow when the mobile menu is open
  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen, isMobile]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Navigation items
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Treats" },
    { href: "/custom-order", label: "Custom Order" },
    { href: "/about", label: "About Us" },
  ];

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowLogoutNotification(true); // Show logout notification
    setTimeout(() => {
      setShowLogoutNotification(false); // Hide notification after 3 seconds
    }, 3000);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      )}
    >
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <CakeIcon className="h-8 w-8 text-pink-600" />
              </motion.div>
              <span className="font-bold text-xl text-pink-800">
                Rita's Bake Delicacy
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-pink-600 relative group",
                  pathname === item.href ? "text-pink-600" : "text-gray-600"
                )}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-600 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link href="/cart" className="relative cart-icon">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <ShoppingCartIcon className="h-6 w-6 text-gray-600 hover:text-pink-600" />
                {cartItemsCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {cartItemsCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            {/* User Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <UserIcon className="h-6 w-6 text-gray-600 hover:text-pink-600" />
                    </motion.div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <LogInIcon className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6 text-gray-600" />
              ) : (
                <MenuIcon className="h-6 w-6 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className={`fixed inset-0 z-50 bg-white pt-16 ${isMenuOpen ? "block" : "hidden"
          }`}
        initial={false}
        animate={isMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <nav className="container px-4 py-6 flex flex-col space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-lg font-medium py-2 transition-colors hover:text-pink-600 border-b border-gray-100",
                pathname === item.href ? "text-pink-600" : "text-gray-600"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                href="/profile"
                className="text-lg font-medium py-2 transition-colors hover:text-pink-600 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                My Profile
              </Link>
              <Link
                href="/orders"
                className="text-lg font-medium py-2 transition-colors hover:text-pink-600 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                My Orders
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-lg font-medium py-2 transition-colors hover:text-pink-600 border-b border-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                className="text-lg font-medium py-2 transition-colors hover:text-red-600 text-left"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-lg font-medium py-2 transition-colors hover:text-pink-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </nav>
      </motion.div>

      {/* Logout Notification with Animation */}
      <AnimatePresence>
        {showLogoutNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[9999] max-w-xs sm:max-w-md"
          >
            <LogOutIcon className="h-6 w-6" />
            <span>Logged out</span>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
