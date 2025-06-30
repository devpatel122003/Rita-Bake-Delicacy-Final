"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CakeIcon } from "lucide-react";
import CakeAnimation from "@/components/cake-animation";
import FeaturedProducts from "@/components/featured-products";
import TestimonialSlider from "@/components/testimonial-slider";
import { StoreStatus } from "@/components/store-status";
import ScrollAnimation from "@/components/scroll-animation";
import CategoryShowcase from "@/components/category-showcase";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState, useEffect } from "react";
import { useStoreStatus } from "./context/store-status-context";

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [animationComplete, setAnimationComplete] = useState(true); // Start as true by default
  const [showContent, setShowContent] = useState(false);
  const { isOnline } = useStoreStatus();

  useEffect(() => {
    // Check if this is the first visit
    const firstVisit = localStorage.getItem('firstVisit') === null;

    if (isMobile && firstVisit) {
      setAnimationComplete(false);
      localStorage.setItem('firstVisit', 'false');

      const animationTimeout = setTimeout(() => {
        setAnimationComplete(true);
      }, 3000);

      return () => clearTimeout(animationTimeout);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && !animationComplete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobile, animationComplete]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowContent(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <main className="flex-1">
        {!isMobile && (
          <>
            <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-white py-20 md:py-32">
              <div className="container px-4 mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <ScrollAnimation direction="left">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-pink-800">
                      Delicious Cakes for Every Occasion
                    </h1>
                  </ScrollAnimation>
                  <ScrollAnimation direction="left" delay={0.2}>
                    <p className="text-lg md:text-xl text-gray-600 max-w-[600px]">
                      Handcrafted with love and the finest ingredients. Make
                      your celebrations sweeter with Rita's Bake Delicacy.
                    </p>
                  </ScrollAnimation>
                  <ScrollAnimation direction="left" delay={0.4}>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <Link
                        href="/products"
                        className="flex items-center gap-2"
                      >
                        <Button
                          size="lg"
                          className="bg-pink-600 hover:bg-pink-700"
                        >
                          <CakeIcon size={20} />
                          <span>Explore Cakes</span>
                        </Button>
                      </Link>
                      <Link
                        href="/custom-order"
                        className="flex items-center gap-2"
                      >
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-pink-600 text-pink-600 hover:bg-pink-50"
                        >
                          <span>Custom Order</span>
                        </Button>
                      </Link>
                    </div>
                  </ScrollAnimation>
                  <ScrollAnimation direction="left" delay={0.6}>
                    <StoreStatus isOnline={isOnline} />
                  </ScrollAnimation>
                </div>
                <ScrollAnimation
                  direction="right"
                  delay={0.2}
                  className="flex-1 relative h-[300px] md:h-[500px] w-full"
                >
                  <CakeAnimation />
                </ScrollAnimation>
              </div>
              <div
                className="absolute -bottom-10 left-0 w-full h-20 bg-white"
                style={{
                  clipPath:
                    "polygon(0 100%, 100% 100%, 100% 0, 75% 50%, 50% 0, 25% 50%, 0 0)",
                }}
              ></div>
            </section>

            <section className="py-16 bg-white">
              <div className="container px-4 mx-auto">
                <ScrollAnimation>
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-pink-800">
                    Explore Our Categories
                  </h2>
                </ScrollAnimation>
                <CategoryShowcase />
              </div>
            </section>

            <section className="py-16 bg-pink-50">
              <div className="container px-4 mx-auto">
                <ScrollAnimation>
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-pink-800">
                    Our Signature Treats
                  </h2>
                </ScrollAnimation>
                <FeaturedProducts isStoreOnline={isOnline} />
                <ScrollAnimation delay={0.4} className="mt-12 text-center">
                  <Button
                    asChild
                    variant="outline"
                    className="border-pink-600 text-pink-600 hover:bg-pink-50"
                  >
                    <Link href="/products">View All Treats</Link>
                  </Button>
                </ScrollAnimation>
              </div>
            </section>

            <section className="py-16 bg-white">
              <div className="container px-4 mx-auto">
                <ScrollAnimation>
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-pink-800">
                    What Our Customers Say
                  </h2>
                </ScrollAnimation>
                <TestimonialSlider />
              </div>
            </section>

            <section className="py-16 bg-pink-50">
              <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <ScrollAnimation direction="left">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-pink-800">
                        The Story of Rita's Bake Delicacy
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Hi I'm Rita <br />
                        I am a wife of an understandable husband , mom of two loving child. A hobby baker turned into a bakery owner of “Rita's Bake Delicacy”. As a post graduate by educational qualification, l always wanted to do something and wished to take part in supporting my family. But the almighty has other plans for me. My son, a challenger since birth. So,  I started struggling to manage family with all possible care to bring him up.  During that time, I always put extra efforts to do something for myself, keeping cautious look not to lessen my care and support for my son. When my son grew enough to take care of himself, I made a call for myself. To express my artistic inner-self and spread the happiness among people and to make every occasion and celebration enjoyable, memorable, I become a cake artist.<br />
                        I started my bakery journey with a stall in my residential society in the year end and new-year celebration event. Excellent, lovely, mouth-watering, yammy, exact-sweetness, baked with touch of heart and so many facial and other expressions with heart to heart conversations were the feed backs of that beautiful night which provide me the courage, confidence and paved my way to move forward. After that there was no looking back.<br />
                        Me and my team is dedicated to provide a fresh baked goods to bring sweet smile and excitement in everybody , every-time and in every occasion.<br />
                        My heartfelt gratitude to all my family members, my clients and my friends.<br />
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="border-pink-600 text-pink-600 hover:bg-pink-50"
                      >
                        <Link href="/about">Read Our Story</Link>
                      </Button>
                    </div>
                  </ScrollAnimation>
                  <ScrollAnimation
                    direction="right"
                    className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-xl"
                  >
                    <div className="absolute inset-0 bg-pink-200 flex items-center justify-center">
                      <img
                        src="/images/home_page_image.jpg?height=300&width=500"
                        alt="Rita's Bakery"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </ScrollAnimation>
                </div>
              </div>
            </section>
          </>
        )}

        {isMobile && (
          <>
            {!animationComplete && (
              <section className="fixed inset-0 h-screen w-full flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
                <ScrollAnimation
                  direction="right"
                  className="relative h-full w-full"
                >
                  <CakeAnimation />
                </ScrollAnimation>
              </section>
            )}

            {animationComplete && (
              <section className="relative h-screen w-full flex flex-col items-center justify-center">
                <div className="space-y-6 text-center">
                  <ScrollAnimation direction="left">
                    <h1 className="text-3xl font-bold tracking-tighter text-pink-800">
                      Delicious Cakes for Every Occasion
                    </h1>
                  </ScrollAnimation>
                  <ScrollAnimation direction="left" delay={0.2}>
                    <p className="text-lg text-gray-600">
                      Handcrafted with love and the finest ingredients. Make
                      your celebrations sweeter with Rita's Bake Delicacy.
                    </p>
                  </ScrollAnimation>
                  <ScrollAnimation direction="left" delay={0.4}>
                    <div className="flex flex-col gap-4 justify-center items-center">
                      <Link
                        href="/products"
                        className="flex items-center gap-2"
                      >
                        <Button
                          size="lg"
                          className="bg-pink-600 hover:bg-pink-700"
                        >
                          <CakeIcon size={20} />
                          <span>Explore Cakes</span>
                        </Button>
                      </Link>
                      <Link
                        href="/custom-order"
                        className="flex items-center gap-2"
                      >
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-pink-600 text-pink-600 hover:bg-pink-50"
                        >
                          <span>Custom Order</span>
                        </Button>
                      </Link>
                    </div>
                  </ScrollAnimation>
                  <ScrollAnimation direction="left" delay={0.6}>
                    <StoreStatus isOnline={isOnline} />
                  </ScrollAnimation>
                </div>
              </section>
            )}

            {showContent && (
              <>
                <section className="py-12 bg-white">
                  <div className="container px-4 mx-auto">
                    <ScrollAnimation>
                      <h2 className="text-2xl font-bold text-center mb-8 text-pink-800">
                        Explore Our Categories
                      </h2>
                    </ScrollAnimation>
                    <CategoryShowcase />
                  </div>
                </section>

                <section className="py-12 bg-pink-50">
                  <div className="container px-4 mx-auto">
                    <ScrollAnimation>
                      <h2 className="text-2xl font-bold text-center mb-8 text-pink-800">
                        Our Signature Treats
                      </h2>
                    </ScrollAnimation>
                    <FeaturedProducts isStoreOnline={isOnline} />
                    <ScrollAnimation delay={0.4} className="mt-8 text-center">
                      <Button
                        asChild
                        variant="outline"
                        className="border-pink-600 text-pink-600 hover:bg-pink-50"
                      >
                        <Link href="/products">View All Treats</Link>
                      </Button>
                    </ScrollAnimation>
                  </div>
                </section>

                <section className="py-12 bg-white">
                  <div className="container px-4 mx-auto">
                    <ScrollAnimation>
                      <h2 className="text-2xl font-bold text-center mb-8 text-pink-800">
                        What Our Customers Say
                      </h2>
                    </ScrollAnimation>
                    <TestimonialSlider />
                  </div>
                </section>

                <section className="py-12 bg-pink-50">
                  <div className="container px-4 mx-auto">
                    <div className="flex flex-col gap-8 items-center">
                      <ScrollAnimation direction="left">
                        <div>
                          <h2 className="text-2xl font-bold mb-4 text-pink-800">
                            The Story of Rita's Bake Delicacy
                          </h2>
                          <p className="text-gray-600 mb-4">
                            Founded with passion and a love for baking, Rita's
                            Bake Delicacy has been creating memorable sweet
                            experiences since 2010. Our journey began in a small
                            kitchen and has grown into a beloved bakery known
                            for exceptional quality and creativity.
                          </p>
                          <Button
                            asChild
                            variant="outline"
                            className="border-pink-600 text-pink-600 hover:bg-pink-50"
                          >
                            <Link href="/about">Read Our Story</Link>
                          </Button>
                        </div>
                      </ScrollAnimation>
                      <ScrollAnimation
                        direction="right"
                        className="relative h-[200px] w-full rounded-lg overflow-hidden shadow-xl"
                      >
                        <div className="absolute inset-0 bg-pink-200 flex items-center justify-center">
                          <img
                            src="/placeholder.svg?height=300&width=500"
                            alt="Rita's Bakery"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </ScrollAnimation>
                    </div>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
