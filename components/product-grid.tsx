
"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { AddToCartButton } from "@/components/add-to-cart-button"
import type { Product } from "@/types/product"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
// import { HeartIcon } from "lucide-react"

interface ProductGridProps {
  products: Product[];
  isStoreOnline: boolean;
}

export function ProductGrid({ products, isStoreOnline }: ProductGridProps) {
  const [likedProducts, setLikedProducts] = useState<string[]>([])

  const toggleLike = (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setLikedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-pink-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
        <p className="mt-2 text-gray-500">Try adjusting your filters or search criteria.</p>
      </div>
    )
  }

  return (
    <>
      <div className="md:hidden space-y-3">
        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {products.map((product) => (
            <motion.div
              key={product._id}
              variants={item}
              className="w-full"
            >
              <div className="border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:mb-0">
                <Link href={`/products/${product._id}`} className="flex flex-col">
                  <div className="relative w-full h-40 mb-2 rounded-lg overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2">
                      {product.featured && <Badge className="bg-pink-600 hover:bg-pink-700 text-xs">Featured</Badge>}
                    </div>
                    {/* <button
                      onClick={(e) => toggleLike(product._id, e)}
                      className="absolute top-2 left-2 bg-white p-1.5 rounded-full shadow-md"
                    >
                      <HeartIcon
                        className={`h-4 w-4 ${likedProducts.includes(product._id) ? "fill-pink-600 text-pink-600" : "text-gray-400"}`}
                      />
                    </button> */}
                  </div>

                  <div className="px-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm text-gray-900 truncate max-w-[80%]">
                        {product.name}
                      </h3>
                      <Badge className="bg-pink-100 text-pink-800 border-pink-200 text-xs">
                        {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                      </Badge>
                    </div>

                    <p className="text-gray-500 text-xs mt-1">₹{product.price.toFixed(2)}</p>

                    <div className="flex flex-wrap gap-1 mt-2 mb-2">
                      {product.flavors?.slice(0, 2).map((flavor) => (
                        <span key={flavor} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {flavor}
                        </span>
                      ))}
                      {product.flavors && product.flavors.length > 2 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          +{product.flavors.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="flex justify-end mt-2">
                  <AddToCartButton product={product} isStoreOnline={isStoreOnline} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {products.map((product) => (
          <motion.div key={product._id} variants={item}>
            <Card className="overflow-hidden group h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
              <Link href={`/products/${product._id}`} className="block relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg?height=300&width=300"}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {product.featured && (
                    <Badge className="bg-pink-600 hover:bg-pink-700 text-xs">Featured</Badge>
                  )}
                  <Badge className="bg-pink-100 text-pink-800 border-pink-200 text-xs">
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </Badge>
                </div>
                {/* <button
                  onClick={(e) => toggleLike(product._id, e)}
                  className="absolute top-2 left-2 bg-white p-1 rounded-full shadow-md transition-transform duration-300 hover:scale-110"
                >
                  <HeartIcon
                    className={`h-4 w-4 ${likedProducts.includes(product._id) ? "fill-pink-600 text-pink-600" : "text-gray-400"}`}
                  />
                </button> */}
              </Link>

              <CardContent className="p-3 flex-grow flex flex-col">
                <Link href={`/products/${product._id}`} className="block flex-grow">
                  <h3 className="font-medium text-base mb-1 text-gray-900 group-hover:text-pink-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">₹{product.price.toFixed(2)}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.flavors?.map((flavor) => (
                      <span key={flavor} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {flavor}
                      </span>
                    ))}
                  </div>
                </Link>
                <AddToCartButton product={product} isStoreOnline={isStoreOnline} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </>
  )
}