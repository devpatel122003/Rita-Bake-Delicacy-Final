"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { AddToCartButton } from "@/components/add-to-cart-button"
import type { Product } from "@/types/product"
import { getFeaturedProducts } from "@/lib/products"
import { motion } from "framer-motion"
// import { HeartIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge";

interface FeaturedProductsProps {
  isStoreOnline: boolean;
}

export default function FeaturedProducts({
  isStoreOnline,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const featuredProducts = await getFeaturedProducts();
        setProducts(featuredProducts);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleLike = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLikedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-5 bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2 mb-3" />
              <div className="h-9 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map((product, index) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden group h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
            <Link
              href={`/products/${product._id}`}
              className="block relative aspect-[4/3] bg-gray-100 overflow-hidden"
            >
              <img
                src={product.image || "/placeholder.svg?height=200&width=250"}
                alt={product.name}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {product.featured && (
                  <Badge className="bg-pink-600 hover:bg-pink-700 text-xs">
                    Featured
                  </Badge>
                )}
                <Badge className="bg-pink-100 text-pink-800 border-pink-200 text-xs">
                  {product.category.charAt(0).toUpperCase() +
                    product.category.slice(1)}
                </Badge>
              </div>
              {/* <button
                onClick={(e) => toggleLike(product._id, e)}
                className="absolute top-2 left-2 bg-white p-1.5 rounded-full shadow-md transition-transform duration-300 hover:scale-110"
              >
                <HeartIcon
                  className={`h-4 w-4 ${likedProducts.includes(product._id)
                    ? "fill-pink-600 text-pink-600"
                    : "text-gray-400"
                    }`}
                />
              </button> */}
            </Link>
            <CardContent className="p-4 flex-grow flex flex-col">
              <Link
                href={`/products/${product._id}`}
                className="block flex-grow"
              >
                <h3 className="font-medium text-base mb-1 text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-500 mb-2">
                  ₹{product.price.toFixed(2)}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.flavors?.slice(0, 3).map((flavor) => (
                    <span
                      key={flavor}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {flavor}
                    </span>
                  ))}
                  {product.flavors && product.flavors.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      +{product.flavors.length - 3}
                    </span>
                  )}
                </div>
              </Link>
              <AddToCartButton
                product={product}
                isStoreOnline={isStoreOnline}
              />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}