"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function ContactUs() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-pink-800 mb-8">Contact Rita's Bake Delicacy</h1>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-pink-50 p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold text-pink-700 mb-4">Visit Us</h2>
                        <address className="not-italic space-y-2 text-gray-600">
                            <p>Office No 721 Sharan Circle Hub</p>
                            <p>Zundal, Gandhinagar, Gujarat 382422</p>
                            <p className="mt-4">
                                <strong>Hours:</strong><br />
                                Monday-Saturday: 9:00 AM - 8:00 PM<br />
                                Sunday: Closed
                            </p>
                        </address>
                    </div>

                    <div className="bg-pink-50 p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold text-pink-700 mb-4">Get In Touch</h2>
                        <ul className="space-y-3 text-gray-600">
                            <li>
                                <strong>Phone:</strong>{" "}
                                <a href="tel:+918128408409" className="hover:text-pink-600">+91 81284 08409</a>
                            </li>
                            <li>
                                <strong>Email:</strong>{" "}
                                <a href="mailto:ritasbakedelicacy@gmail.com" className="hover:text-pink-600">ritasbakedelicacy@gmail.com</a>
                            </li>
                            <li>
                                <strong>WhatsApp:</strong>{" "}
                                <a href="https://wa.me/918128408409" className="hover:text-pink-600">Message Us</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-semibold text-pink-700 mb-6">Send Us a Message</h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                Message
                            </label>
                            <textarea
                                id="message"
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                                placeholder="Your message here..."
                            ></textarea>
                        </div>

                        <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                            Send Message
                        </Button>
                    </form>
                </div> */}

                <div className="mt-8 text-center">
                    <Button asChild variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50">
                        <Link href="/returns">View Returns Policy</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}