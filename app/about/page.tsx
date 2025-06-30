"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-pink-800 text-center md:text-left">
          About Rita's Bake Delicacy
        </h1>

        <div className="relative aspect-video rounded-lg overflow-hidden mb-8 shadow-xl">
          <Image
            src="/images/home_page_image.jpg?height=400&width=800"
            alt="Rita's Bakery"
            fill
            className="object-cover"
          />
        </div>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold text-pink-800 mb-4">Our Story</h2>
          <p className="text-gray-700">
            Hi I'm Rita <br />
            I am a wife of an understandable husband , mom of two loving child. A hobby baker turned into a bakery owner of “Rita's Bake Delicacy”. As a post graduate by educational qualification, l always wanted to do something and wished to take part in supporting my family. But the almighty has other plans for me. My son, a challenger since birth. So,  I started struggling to manage family with all possible care to bring him up.  During that time, I always put extra efforts to do something for myself, keeping cautious look not to lessen my care and support for my son. When my son grew enough to take care of himself, I made a call for myself. To express my artistic inner-self and spread the happiness among people and to make every occasion and celebration enjoyable, memorable, I become a cake artist.<br />
            I started my bakery journey with a stall in my residential society in the year end and new-year celebration event. Excellent, lovely, mouth-watering, yammy, exact-sweetness, baked with touch of heart and so many facial and other expressions with heart to heart conversations were the feed backs of that beautiful night which provide me the courage, confidence and paved my way to move forward. After that there was no looking back.<br />
            Me and my team is dedicated to provide a fresh baked goods to bring sweet smile and excitement in everybody , every-time and in every occasion.<br />
            My heartfelt gratitude to all my family members, my clients and my friends.<br />
          </p>

          <h2 className="text-2xl font-bold text-pink-800 mb-4 mt-8">Our Philosophy</h2>
          <p className="text-gray-700">
            At Rita's Bake Delicacy, we believe that every cake tells a story. We pour our hearts into each creation,
            using only the finest ingredients and time-honored techniques. Our commitment to quality is unwavering, and
            we take pride in crafting cakes that not only look beautiful but taste amazing too.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="bg-pink-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-pink-800 mb-2">Quality Ingredients</h3>
              <p className="text-gray-600">
                We source the freshest, highest-quality ingredients for all our cakes and pastries.
              </p>
            </div>

            <div className="bg-pink-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-pink-800 mb-2">Handcrafted with Love</h3>
              <p className="text-gray-600">Every cake is made by hand with attention to detail and artistic flair.</p>
            </div>

            <div className="bg-pink-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-pink-800 mb-2">Customer Satisfaction</h3>
              <p className="text-gray-600">
                Your happiness is our priority. We work closely with you to create the perfect cake.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-pink-800 mb-4 mt-8">Meet the Team</h2>
          <p className="text-gray-700">
            Behind every delicious cake is our talented team of pastry chefs and cake artists. Led by our founder Rita,
            our team combines traditional baking techniques with innovative designs to create cakes that are both
            delicious and visually stunning.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 my-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 shadow-lg">
                <Image
                  src="/images/rita.jpg"
                  alt="Rita - Founder"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-pink-800">Rita</h3>
              <p className="text-gray-600">Founder & Head Chef</p>
            </div>

            {/* <div className="flex flex-col items-center text-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 shadow-lg">
                <Image
                  src="/placeholder.svg?height=160&width=160"
                  alt="Chef Amit"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-pink-800">Chef Amit</h3>
              <p className="text-gray-600">Senior Pastry Chef</p>
            </div> */}
          </div>

          <h2 className="text-2xl font-bold text-pink-800 mb-4 mt-8">Our Bakery</h2>
          <p className="text-gray-700">
            Located in the heart of the city, our bakery is a warm and inviting space where customers can browse our
            cake selections, discuss custom orders, and enjoy a slice of cake with a cup of coffee. We welcome you to
            visit us and experience the magic of Rita's Bake Delicacy firsthand.
          </p>
        </div>
      </div>
    </div>
  );
}