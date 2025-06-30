import Link from "next/link"
import { CakeIcon, InstagramIcon, FacebookIcon } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-pink-50 py-12">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <CakeIcon className="h-8 w-8 text-pink-600" />
              <span className="font-bold text-xl text-pink-800">Rita's Bake Delicacy</span>
            </Link>
            <p className="text-gray-600">
              Handcrafted cakes for every occasion. Made with love and the finest ingredients.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/ritasbakedelicacy/" className="text-gray-600 hover:text-pink-600">
                <InstagramIcon className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://www.facebook.com/p/Ritas-Bake-Delicacy-100092928648332/" className="text-gray-600 hover:text-pink-600">
                <FacebookIcon className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-pink-800">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-pink-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-600 hover:text-pink-600">
                  Cakes
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="text-gray-600 hover:text-pink-600">
                  Custom Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-pink-600">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-pink-800">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/returns"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-pink-800">Contact Information</h3>
            <address className="not-italic space-y-2 text-gray-600">
              <p>Office No 721 Sharan Circle Hub</p>
              <p>Zundal, Gandhinagar, Gujarat 382421</p>
              <p>Phone: +91 81284 08409</p>
              <p>Email: ritasbakedelicacy@gmail.com</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Rita's Bake Delicacy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

