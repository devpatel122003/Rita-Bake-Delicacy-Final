"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CakeIcon,
  CookieIcon,
  Coffee,
  Candy,
  IceCream,
  Croissant,
  Dessert,
  Sandwich,
  Wheat,
  Utensils,
} from "lucide-react"
import ScrollAnimation from "./scroll-animation"

const categories = [
  {
    id: "chocolate-cake",
    name: "Chocolate Cakes",
    description: "Rich and decadent chocolate cakes",
    icon: CakeIcon,
    color: "bg-pink-100 text-pink-800",
    hover: "hover:bg-pink-200",
  },
  {
    id: "cheesecake",
    name: "Cheesecakes",
    description: "Creamy and rich cheesecakes",
    icon: IceCream,
    color: "bg-yellow-100 text-yellow-800",
    hover: "hover:bg-yellow-200",
  },
  {
    id: "cookie",
    name: "Cookies",
    description: "Soft and chewy cookies",
    icon: CookieIcon,
    color: "bg-amber-100 text-amber-800",
    hover: "hover:bg-amber-200",
  },
  {
    id: "brownie",
    name: "Brownies",
    description: "Fudgy chocolate brownies",
    icon: Candy,
    color: "bg-brown-100 text-amber-800",
    hover: "hover:bg-amber-200",
  },
  {
    id: "dry-cake",
    name: "Dry Cakes",
    description: "Perfect tea-time cakes",
    icon: Sandwich,
    color: "bg-orange-100 text-orange-800",
    hover: "hover:bg-orange-200",
  },
  {
    id: "tart",
    name: "Tarts",
    description: "Buttery crusts with delicious fillings",
    icon: Utensils,
    color: "bg-red-100 text-red-800",
    hover: "hover:bg-red-200",
  },
  {
    id: "jar-cake",
    name: "Jar Cakes",
    description: "Layered cakes in convenient jars",
    icon: Coffee,
    color: "bg-blue-100 text-blue-800",
    hover: "hover:bg-blue-200",
  },
  {
    id: "mousse",
    name: "Mousse",
    description: "Light and airy desserts",
    icon: Dessert,
    color: "bg-purple-100 text-purple-800",
    hover: "hover:bg-purple-200",
  },
  {
    id: "muffin",
    name: "Muffins",
    description: "Delicious breakfast treats",
    icon: Croissant,
    color: "bg-green-100 text-green-800",
    hover: "hover:bg-green-200",
  },
  {
    id: "millet-magic",
    name: "Millet Magic",
    description: "Healthy alternative desserts",
    icon: Wheat,
    color: "bg-lime-100 text-lime-800",
    hover: "hover:bg-lime-200",
  },
]

export default function CategoryShowcase() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category, index) => (
        <ScrollAnimation key={category.id} delay={index * 0.1}>
          <Link href={`/products?category=${category.id}`}>
            <motion.div
              className={`p-6 rounded-lg ${category.color} ${category.hover} transition-colors duration-300 h-full`}
              whileHover={{ y: -5, scale: 1.02 }}
              onHoverStart={() => setHoveredCategory(category.id)}
              onHoverEnd={() => setHoveredCategory(null)}
            >
              <div className="flex items-center mb-4">
                <category.icon className="h-8 w-8 mr-3" />
                <h3 className="text-xl font-bold">{category.name}</h3>
              </div>
              <p className="mb-4">{category.description}</p>
              <motion.div className="text-sm font-medium" animate={{ x: hoveredCategory === category.id ? 5 : 0 }}>
                Explore {category.name} →
              </motion.div>
            </motion.div>
          </Link>
        </ScrollAnimation>
      ))}
    </div>
  )
}

