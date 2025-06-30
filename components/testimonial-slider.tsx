"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeftIcon, ChevronRightIcon, StarIcon, QuoteIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

type Testimonial = {
  id: number
  name: string
  image?: string
  rating: number
  text: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    rating: 5,
    text: "The birthday cake Rita made for my daughter was absolutely stunning! Not only did it look beautiful, but it tasted amazing too. Everyone at the party was impressed.",
  },
  {
    id: 2,
    name: "Rahul Patel",
    rating: 5,
    text: "We ordered our wedding cake from Rita's Bake Delicacy and it exceeded all our expectations. The design was exactly what we wanted and the taste was divine. Highly recommend!",
  },
  {
    id: 3,
    name: "Ananya Gupta",
    rating: 4,
    text: "The custom cake I ordered for my mom's retirement party was perfect. Rita was very attentive to my requirements and delivered a cake that was both beautiful and delicious.",
  },
  {
    id: 4,
    name: "Vikram Singh",
    rating: 5,
    text: "Best cakes in town! I've tried many bakeries but Rita's Bakes are on another level. Fresh ingredients, perfect sweetness, and beautiful designs. My go-to for all celebrations.",
  },
  {
    id: 5,
    name: "Neha Kapoor",
    rating: 5,
    text: "The cheesecakes here are to die for! Creamy, rich, and not too sweet. I've tried the blueberry and chocolate swirl, and both were exceptional. Can't wait to try more flavors!",
  },
]

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [direction, setDirection] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const nextSlide = () => {
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide()
    } else if (touchEndX.current - touchStartX.current > 50) {
      prevSlide()
    }
  }

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay, currentIndex])

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  }

  return (
    <div className="relative">
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            <Card className="bg-white shadow-md mx-auto max-w-4xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold relative overflow-hidden">
                      {testimonials[currentIndex].image ? (
                        <img
                          src={testimonials[currentIndex].image || "/placeholder.svg"}
                          alt={testimonials[currentIndex].name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{testimonials[currentIndex].name.charAt(0)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <QuoteIcon className="h-8 w-8 text-pink-200 mb-2 mx-auto md:mx-0" />
                    <p className="text-gray-600 italic mb-4 text-lg">"{testimonials[currentIndex].text}"</p>
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">{testimonials[currentIndex].name}</h3>
                      <div className="flex text-yellow-400 mt-1 justify-center md:justify-start">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${i < testimonials[currentIndex].rating ? "fill-current" : "stroke-current fill-none"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentIndex ? "bg-pink-600 scale-125" : "bg-gray-300"}`}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1)
              setCurrentIndex(i)
            }}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 border-gray-200 hover:bg-white rounded-full h-10 w-10"
        onClick={prevSlide}
        aria-label="Previous testimonial"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 border-gray-200 hover:bg-white rounded-full h-10 w-10"
        onClick={nextSlide}
        aria-label="Next testimonial"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </Button>
    </div>
  )
}

