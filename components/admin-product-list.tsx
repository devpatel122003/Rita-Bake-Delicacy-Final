"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusIcon, PencilIcon, TrashIcon, UploadIcon, CheckCircle, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AnimatePresence, motion } from "framer-motion";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  flavors: string[];
  featured: boolean;
}
interface AdminProductListProps {
  getSignedImageUrl: (imageUrl: string) => Promise<string>;
}
export function AdminProductList({ getSignedImageUrl }: AdminProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
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
  }
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleOpenDialog = (product: Product | null = null) => {
    setEditingProduct(
      product || { _id: "", name: "", description: "", price: 0, image: "", flavors: [], category: "cookie", featured: false }
    );
    setImagePreview(product?.image || null);
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToS3 = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      // Get a presigned URL from your API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          filetype: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { url, key } = await response.json();

      // Upload the file to S3 using the presigned URL
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Return the public URL
      return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      let imageUrl = editingProduct.image;
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const imageFile = formData.get('image') as File;

      // Upload new image if file was selected
      if (imageFile?.size > 0) {
        imageUrl = await uploadImageToS3(imageFile);
      }

      // Prepare product data with S3 URL
      const productData = {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        image: imageUrl, // This will be the S3 URL
        category: editingProduct.category,
        flavors: editingProduct.flavors,
        featured: editingProduct.featured,
      };

      const method = editingProduct._id ? "PUT" : "POST";
      const url = editingProduct._id ? `/api/products/${editingProduct._id}` : "/api/products";

      // Save to MongoDB
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      showNotification(`Product ${editingProduct._id ? "updated" : "added"} successfully!`, "success");
      setIsDialogOpen(false);

      // Refresh product list
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      showNotification(
        error instanceof Error ? error.message : "An unknown error occurred",
        "error"
      );
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p._id !== productId));
        showNotification("Product removed successfully", "success");
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || "Failed to delete product.", "error");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showNotification("Failed to delete product.", "error");
    }
  };

  if (loading) return <div className="text-center py-8">Loading products...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
        <Button onClick={() => handleOpenDialog()} className="bg-pink-600 hover:bg-pink-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {isDesktop ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>₹{product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.featured ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(product)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">₹{product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <p className="text-sm text-gray-500">{product.featured ? "Featured" : "Not Featured"}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(product)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setImagePreview(null);
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct?._id ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })
                    }
                    required
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  required
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
                  >
                    <div className="flex flex-col items-center justify-center pt-3 pb-4">
                      <UploadIcon className="w-6 h-6 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                    </div>
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {imagePreview && (
                  <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="object-contain w-full h-full"
                    />
                  </div>
                )}
                {editingProduct.image && !imagePreview && (
                  <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={editingProduct.image}
                      alt="Current product"
                      className="object-contain w-full h-full"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editingProduct.category}
                    onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cookie">Cookie</SelectItem>
                      <SelectItem value="brownie">Brownie</SelectItem>
                      <SelectItem value="dry-cake">Dry Cake</SelectItem>
                      <SelectItem value="chocolate-cake">Chocolate Cake</SelectItem>
                      <SelectItem value="cheesecake">Cheesecake</SelectItem>
                      <SelectItem value="tart">Tart</SelectItem>
                      <SelectItem value="jar-cake">Jar Cake</SelectItem>
                      <SelectItem value="mousse">Mousse</SelectItem>
                      <SelectItem value="muffin">Muffin</SelectItem>
                      <SelectItem value="millet-magic">Millet Magic</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Flavors (comma separated)</Label>
                  <Input
                    value={editingProduct.flavors?.join(", ")}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, flavors: e.target.value.split(", ") })
                    }
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingProduct.featured}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, featured: e.target.checked })
                  }
                />
                <Label>Featured Product</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                  Save Product
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
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