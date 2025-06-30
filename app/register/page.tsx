"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function SignupPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [isPhoneUnique, setIsPhoneUnique] = useState(true);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  const router = useRouter();
  const { login } = useAuth();

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  // Check if phone number is unique
  useEffect(() => {
    const checkPhoneUniqueness = async () => {
      if (phone.length === 10) {
        setIsCheckingPhone(true);
        try {
          const res = await fetch("/api/auth/check-phone", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
          });
          const result = await res.json();
          setIsPhoneUnique(result.isUnique);
        } catch (error) {
          console.error("Error checking phone uniqueness:", error);
        } finally {
          setIsCheckingPhone(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (phone.length === 10) {
        checkPhoneUniqueness();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [phone]);

  // Password validation rules
  const isPasswordValid = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      showNotification("Please enter a valid 10-digit phone number", "error");
      setIsPhoneValid(false);
      return;
    } else {
      setIsPhoneValid(true);
    }

    // Check if phone number is unique
    if (!isPhoneUnique) {
      showNotification("This phone number is already registered", "error");
      return;
    }

    // Validate password strength
    if (!isPasswordValid(password)) {
      showNotification(
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.",
        "error"
      );
      return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    if (!name || !phone || !email || !password || !confirmPassword) {
      showNotification("Please fill all fields", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password }),
      });

      const result = await res.json();
      if (result.success) {
        showNotification("Account created successfully!", "success");

        // Automatically log in the user after successful registration
        const loginResult = await login(phone, password);
        if (!loginResult.success) {
          showNotification("Failed to log in after registration", "error");
        } else {
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }
      } else {
        showNotification(result.message || "Registration failed", "error");
      }
    } catch (error) {
      showNotification("Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 sm:px-6 flex items-center justify-center min-h-[80vh] py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-pink-100 shadow-lg">
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-pink-800">Create an Account</CardTitle>
            <CardDescription className="text-sm sm:text-base">Sign up to start ordering delicious treats</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 sm:h-10"
                  required
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 sm:h-10"
                  required
                />
                {phone && !isPhoneValid && (
                  <div className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Please enter a valid 10-digit phone number.</span>
                  </div>
                )}
                {phone && isPhoneValid && isCheckingPhone && (
                  <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
                    <span>Checking phone number...</span>
                  </div>
                )}
                {phone && isPhoneValid && !isCheckingPhone && !isPhoneUnique && (
                  <div className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>This phone number is already registered.</span>
                  </div>
                )}
                {phone && isPhoneValid && !isCheckingPhone && isPhoneUnique && (
                  <div className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Phone number is available!</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 sm:h-10"
                  required
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 sm:h-10"
                  required
                />
                {password && !isPasswordValid(password) && (
                  <div className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Password must be at least 8 characters with uppercase, lowercase, number, and special character.</span>
                  </div>
                )}
                {password && isPasswordValid(password) && (
                  <div className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Strong password!</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 sm:h-10"
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <div className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Passwords do not match.</span>
                  </div>
                )}
                {confirmPassword && password === confirmPassword && (
                  <div className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Passwords match!</span>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 h-9 sm:h-10 mt-2 sm:mt-3"
                disabled={isLoading || !isPhoneUnique}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Up...
                  </>
                ) : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-xs sm:text-sm p-4">
            <span className="text-gray-500">Already have an account? </span>
            <Link href="/login" className="text-pink-600 hover:underline">Sign in</Link>
          </CardFooter>
        </Card>
      </motion.div>

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
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}