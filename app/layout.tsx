import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { CartProvider } from "@/components/cart-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import ClientWrapper from "@/components/client-wrapper";
import Script from "next/script";
import { StoreStatusProvider } from "./context/store-status-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rita's Bake Delicacy",
  description: "Premium custom cakes, cupcakes & desserts in Ahmedabad & Gandhinagar. Specializing in wedding cakes, birthday cakes & Indian fusion desserts. Order online with free delivery in Gujarat.",
  keywords: [
    "best cake shop Ahmedabad",
    "cake delivery Gandhinagar",
    "wedding cakes Gujarat",
    "birthday cake Ahmedabad",
    "custom cakes near me",
    "designer cakes Gandhinagar",
    "premium bakery Ahmedabad",
    "fondant cakes Gujarat",
    "buttercream cakes Ahmedabad",
    "cupcake delivery Gandhinagar",
    "anniversary cakes Ahmedabad",
    "baby shower cakes Gujarat",
    "Indian fusion desserts",
    "mithai cakes Ahmedabad",
    "eggless cakes Gandhinagar",
    "gluten free cakes Ahmedabad",
    "vegan cakes Gujarat",
    "cake designer Ahmedabad",
    "same day cake delivery",
    "fresh baked goods Gandhinagar",
    "online cake order Ahmedabad",
    "personalized birthday cakes",
    "cake decorator Gujarat",
    "bakery near GIFT City",
    "cake shop near Thaltej",
    "best desserts in Ahmedabad",
    "cake home delivery Gandhinagar",
    "luxury cakes Gujarat",
    "Rita's Bake Delicacy",
  ],
  openGraph: {
    title: "Rita's Bake Delicacy",
    description: "Gujarat's finest custom cakes & desserts. Same-day delivery in Ahmedabad & Gandhinagar. Wedding cakes, birthday cakes & Indian fusion specialties.",
    url: "https://ritasbakedelicacy.com",
    siteName: "Rita's Bake Delicacy",
    locale: "en_IN",
    type: "website",
  },
  alternates: {
    canonical: "https://ritasbakedelicacy.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en">
        <body className={inter.className}>
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="beforeInteractive"
          />

          <ClientWrapper>
            <AuthProvider>
              <CartProvider>
                <StoreStatusProvider>
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                  <Toaster />
                </StoreStatusProvider>
              </CartProvider>
            </AuthProvider>
          </ClientWrapper>
        </body>
      </html>
    </>
  );
}
