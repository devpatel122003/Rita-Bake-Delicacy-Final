// components/product-details-client.tsx
"use client";

import { AddToCartButton } from "@/components/add-to-cart-button";
import Image from "next/image";
import { useStoreStatus } from "../app/context/store-status-context";
import { getProductById } from "@/lib/products";

interface ProductDetailsClientProps {
  product: NonNullable<Awaited<ReturnType<typeof getProductById>>>;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { isOnline } = useStoreStatus();

  return (
    <>
      {/* Desktop/Laptop Layout (Hidden on Mobile) */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product?.image || "/placeholder.svg?height=600&width=600"}
              alt={product?.name || "Product image"}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-pink-800">
              {product?.name}
            </h1>

            {/* Product Price */}
            <p className="text-xl md:text-2xl font-medium text-gray-500">
              ₹{product?.price.toFixed(2)}
            </p>

            {/* Product Description */}
            <p className="prose max-w-none text-gray-600">
              {product?.description}
            </p>

            {/* Flavors */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Flavors</h3>
              <div className="flex flex-wrap gap-2">
                {product?.flavors?.map((flavor) => (
                  <span
                    key={flavor}
                    className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-4 border-t border-gray-200">
              <AddToCartButton product={product} isStoreOnline={isOnline} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout (Hidden on Desktop/Laptop) */}
      <div className="md:hidden">
        {/* Product Image */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100 mb-4">
          <Image
            src={product?.image || "/placeholder.svg?height=600&width=600"}
            alt={product?.name || "Product image"}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Product Details */}
        <div className="space-y-3">
          {/* Product Name */}
          <h1 className="text-xl font-bold text-pink-800">{product?.name}</h1>

          {/* Product Price */}
          <p className="text-lg font-medium text-gray-500">
            ₹{product?.price.toFixed(2)}
          </p>

          {/* Product Description */}
          <p className="text-sm text-gray-600">{product?.description}</p>

          {/* Flavors */}
          <div className="space-y-2">
            <h3 className="text-base font-medium text-gray-900">Flavors</h3>
            <div className="flex flex-wrap gap-2">
              {product?.flavors?.map((flavor) => (
                <span
                  key={flavor}
                  className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs"
                >
                  {flavor}
                </span>
              ))}
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="pt-3 border-t border-gray-200">
            <AddToCartButton product={product} isStoreOnline={isOnline} />
          </div>
        </div>
      </div>
    </>
  );
}
