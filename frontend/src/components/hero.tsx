"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { FileText, Sparkles } from "lucide-react"
import { FloatingPaper } from "@/components/floating-paper"
import { RoboAnimation } from "@/components/robo-animation"
import { useRouter } from "next/navigation" // Import useRouter

export default function Hero() {
  const router = useRouter() // Initialize the router

  // Function to handle the "Get Started" button click
  const handleGetStarted = () => {
    router.push("https://open-gnat-7.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F") // Redirect to the Clerk sign-up page
  }

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center">
      {/* Floating papers background */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingPaper count={6} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Transform Your Startup with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {" "}
                AI Power
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-2xl mb-8 max-w-2xl mx-auto"
          >
            "Your AI Co-Founder: From Idea to Empire"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Add onClick handler to the "Get Started" button */}
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              onClick={handleGetStarted} // Call handleGetStarted on click
            >
              <FileText className="mr-2 h-5 w-5" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="text-white border-purple-500 hover:bg-purple-500/20">
              <Sparkles className="mr-2 h-5 w-5" />
              Our Services
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Animated robot */}
      <div className="absolute bottom-0 right-0 w-96 h-96">
        <RoboAnimation />
      </div>
    </div>
  )
}