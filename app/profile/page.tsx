"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { Loader2, UserIcon, LogOutIcon } from "lucide-react"
import { motion } from "framer-motion"

export default function ProfilePage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-600 mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will be redirected by the useEffect
  }

  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <Card className="border-pink-100 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-pink-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-pink-800">{user.name}</CardTitle>
            <CardDescription>{user.isAdmin ? "Administrator" : "Customer"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p>{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p>{user.phone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Account Type</p>
              <p>{user.isAdmin ? "Admin Account" : "Customer Account"}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/orders")}>
              View Orders
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                logout()
                router.push("/")
              }}
              className="flex items-center gap-2"
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

