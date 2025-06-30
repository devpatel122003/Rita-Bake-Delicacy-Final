"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { UploadIcon, CheckCircle, XCircle } from "lucide-react";
import { createOrder } from "@/lib/orders";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomOrderPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { user } = useAuth();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [notification, setNotification] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get form data
      const formData = new FormData(e.target as HTMLFormElement);
      const name = user?.name || formData.get("name") as string;
      const email = user?.email || formData.get("email") as string;
      const phone = user?.phone || formData.get("phone") as string;
      const occasion = formData.get("occasion") as string;
      const cakeSize = selectedSize === "custom" ? formData.get("customSize") as string : selectedSize;
      const flavor = selectedFlavor === "custom" ? formData.get("customFlavor") as string : selectedFlavor;
      const description = formData.get("description") as string;
      const requiredDate = formData.get("date") as string;

      // Validation checks
      const validations = [
        { condition: !name, message: "Please enter your name." },
        { condition: !email, message: "Please enter your email." },
        { condition: !phone, message: "Please enter your phone number." },
        { condition: !occasion, message: "Please select an occasion." },
        { condition: !cakeSize, message: "Please select or enter a cake size." },
        { condition: !flavor, message: "Please select or enter a flavor." },
        { condition: !description, message: "Please enter a cake description." },
        { condition: !requiredDate, message: "Please select a required date." },
      ];

      for (const validation of validations) {
        if (validation.condition) {
          showNotification(validation.message, "error");
          setIsSubmitting(false);
          return;
        }
      }

      // Date validation
      const selectedDate = new Date(requiredDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const maxDate = new Date();
      maxDate.setFullYear(currentDate.getFullYear() + 2);

      if (selectedDate < currentDate) {
        showNotification("Please select a date in the future.", "error");
        setIsSubmitting(false);
        return;
      }

      if (selectedDate > maxDate) {
        showNotification("Please select a date within the next 2 years.", "error");
        setIsSubmitting(false);
        return;
      }

      // Upload image to S3 if present
      let imageUrl = "";
      if (imageFile) {
        try {
          // Get presigned URL
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: JSON.stringify({
              filename: imageFile.name,
              filetype: imageFile.type
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Failed to get upload URL');
          }

          const { url, key } = await response.json();

          // Upload the file using the presigned URL
          const uploadResponse = await fetch(url, {
            method: 'PUT',
            body: imageFile,
            headers: {
              'Content-Type': imageFile.type
            }
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
          }

          imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
        } catch (error) {
          console.error("Error uploading image:", error);
          showNotification("Failed to upload image. Please try again or proceed without an image.", "error");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare order data
      const orderData = {
        type: "custom",
        customer: { name, email, phone },
        occasion,
        cakeSize,
        flavor,
        description,
        image: imageUrl,
        requiredDate,
        status: "pending",
        price: price,
      };

      // Submit order
      await createOrder(orderData);
      showNotification("Custom order submitted successfully!", "success");
      router.push(`/orders`);
    } catch (error) {
      console.error("Error submitting order:", error);
      showNotification(
        error instanceof Error ? error.message : "Failed to submit order. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 md:px-6 mx-auto py-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-pink-800">Custom Cake Order</h1>
        <p className="text-sm text-gray-600 mb-4">
          Want a unique cake for your special occasion? Fill out the form below with your requirements, and we'll create
          a custom cake just for you!
        </p>

        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm">Your Name</Label>
                  <Input id="name" required defaultValue={user?.name} className="h-9" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input id="email" type="email" required defaultValue={user?.email} className="h-9" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <Input id="phone" required defaultValue={user?.phone} className="h-9" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="occasion" className="text-sm">Occasion</Label>
                  <Select name="occasion">
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="graduation">Graduation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="size" className="text-sm">Cake Size</Label>
                  <Select name="size" onValueChange={setSelectedSize}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5kg">0.5 kg</SelectItem>
                      <SelectItem value="1kg">1 kg</SelectItem>
                      <SelectItem value="1.5kg">1.5 kg</SelectItem>
                      <SelectItem value="2kg">2 kg</SelectItem>
                      <SelectItem value="custom">Custom Size</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedSize === "custom" && (
                    <Input
                      id="customSize"
                      name="customSize"
                      placeholder="Enter custom size"
                      className="h-9 mt-2"
                      required
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="flavor" className="text-sm">Flavor</Label>
                  <Select name="flavor" onValueChange={setSelectedFlavor}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select flavor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chocolate">Chocolate</SelectItem>
                      <SelectItem value="vanilla">Vanilla</SelectItem>
                      <SelectItem value="strawberry">Strawberry</SelectItem>
                      <SelectItem value="butterscotch">Butterscotch</SelectItem>
                      <SelectItem value="redvelvet">Red Velvet</SelectItem>
                      <SelectItem value="custom">Custom Flavor</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedFlavor === "custom" && (
                    <Input
                      id="customFlavor"
                      name="customFlavor"
                      placeholder="Enter custom flavor"
                      className="h-9 mt-2"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-sm">Cake Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your cake requirements, including design, colors, and any special requests"
                  className="min-h-[80px]"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="image" className="text-sm">Reference Image (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <div>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
                      >
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                          <UploadIcon className="w-5 h-5 mb-1 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                        </div>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Reference cake"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="date" className="text-sm">Required Date</Label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  required
                  className="h-9"
                  min={new Date().toISOString().split("T")[0]}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0]}
                />
              </div>

              {/* Payment Summary */}
              {price && (
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">Payment Summary</h2>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold">₹{price.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 h-9"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Proceed to Request "}
              </Button>
            </form>
          </CardContent>
        </Card>
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