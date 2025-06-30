"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { useMobile } from "@/hooks/use-mobile"

export default function CakeAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const cakeElements: HTMLElement[] = []

    // Adjust number of cake elements based on screen size
    const numCakes = isMobile ? 8 : 15

    // Create cake elements
    for (let i = 0; i < numCakes; i++) {
      const cake = document.createElement("div")
      cake.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-cake"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v2"/><path d="M12 8v2"/><path d="M17 8v2"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>`
      cake.className = "absolute cake-icon text-pink-600"
      cake.style.opacity = "0"
      cake.style.transform = "scale(0)"
      cake.style.top = `${Math.random() * 100}%`
      cake.style.left = `${Math.random() * 100}%`

      container.appendChild(cake)
      cakeElements.push(cake)
    }

    // Create a large cake in the center - adjust size based on screen
    const mainCake = document.createElement("div")
    mainCake.className = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pink-600 cake-main"

    // Scale the cake based on screen size
    const scale = isMobile ? 0.7 : 1

    mainCake.innerHTML = `
      <div class="relative" style="transform: scale(${scale})">
        <div class="cake-plate w-64 h-12 bg-gray-200 rounded-full"></div>
        <div class="cake-bottom w-56 h-24 bg-pink-300 rounded-2xl absolute left-1/2 transform -translate-x-1/2 -top-20"></div>
        <div class="cake-middle w-48 h-20 bg-pink-400 rounded-2xl absolute left-1/2 transform -translate-x-1/2 -top-36"></div>
        <div class="cake-top w-40 h-16 bg-pink-500 rounded-2xl absolute left-1/2 transform -translate-x-1/2 -top-48"></div>
        <div class="candle w-2 h-12 bg-yellow-200 absolute left-1/2 transform -translate-x-1/2 -top-60"></div>
        <div class="flame w-4 h-6 bg-orange-500 rounded-full absolute left-1/2 transform -translate-x-1/2 -top-66"></div>
        
        <!-- Add decorative elements -->
        <div class="sprinkles absolute w-full h-full top-0 left-0 pointer-events-none"></div>
        <div class="cherry w-6 h-6 bg-red-500 rounded-full absolute left-1/4 transform -translate-x-1/2 -top-50"></div>
        <div class="cherry w-6 h-6 bg-red-500 rounded-full absolute left-3/4 transform -translate-x-1/2 -top-50"></div>
      </div>
    `
    container.appendChild(mainCake)

    // Create sprinkles
    const sprinklesContainer = mainCake.querySelector(".sprinkles")
    if (sprinklesContainer) {
      for (let i = 0; i < 50; i++) {
        const sprinkle = document.createElement("div")
        sprinkle.className = `absolute w-2 h-1 rounded-full sprinkle-${i % 5}`

        // Random positions on the cake
        const top = -20 - Math.random() * 30
        const left = 20 + Math.random() * 60

        sprinkle.style.top = `${top}%`
        sprinkle.style.left = `${left}%`
        sprinkle.style.transform = `rotate(${Math.random() * 360}deg)`

        // Random colors
        const colors = ["bg-yellow-400", "bg-blue-400", "bg-green-400", "bg-purple-400", "bg-red-400"]
        sprinkle.classList.add(colors[i % colors.length])

        sprinklesContainer.appendChild(sprinkle)
      }
    }

    // Animate small cakes
    gsap.to(cakeElements, {
      opacity: 0.7,
      scale: () => 0.5 + Math.random() * 1.5,
      duration: 1,
      stagger: 0.1,
      ease: "back.out(1.7)",
    })

    // Create floating animation
    cakeElements.forEach((cake) => {
      gsap.to(cake, {
        y: `${-50 + Math.random() * 100}`,
        x: `${-50 + Math.random() * 100}`,
        rotation: Math.random() * 360,
        duration: 5 + Math.random() * 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    })

    // Animate main cake
    gsap.from(".cake-plate, .cake-bottom, .cake-middle, .cake-top, .candle, .flame, .cherry", {
      y: 100,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: "back.out(1.7)",
    })

    // Animate flame
    gsap.to(".flame", {
      scaleY: 1.2,
      scaleX: 0.8,
      duration: 0.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    })

    // Animate sprinkles
    const sprinkles = document.querySelectorAll('[class*="sprinkle-"]')
    gsap.from(sprinkles, {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      stagger: 0.02,
      ease: "back.out(2)",
      delay: 2,
    })

    // Add some bounce to the cherries
    gsap.to(".cherry", {
      y: -5,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.2,
    })

    // Add a slight rotation to the whole cake for a playful effect
    gsap.to(".cake-main", {
      rotation: 3,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    })

    return () => {
      // Cleanup
      cakeElements.forEach((cake) => {
        if (cake.parentNode === container) {
          container.removeChild(cake)
        }
      })
      if (mainCake.parentNode === container) {
        container.removeChild(mainCake)
      }
    }
  }, [isMobile])

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Animation will be injected here */}
    </div>
  )
}