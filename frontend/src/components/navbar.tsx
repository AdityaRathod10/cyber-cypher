"use client"

import { Button } from "@/components/ui/button"
import { Bot, Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import type React from "react"
import { SignInButton, SignUpButton, useAuth, UserButton } from "@clerk/nextjs"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { isSignedIn } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleNavigation = (href: string) => {
    setIsMenuOpen(false)
    router.push(href)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10 relative"
    >
      <Link href="/" className="flex items-center space-x-2">
        <Bot className="w-8 h-8 text-purple-500" />
        <span className="text-white font-medium text-xl">SoloFounder.AI</span>
      </Link>

      <div className="hidden sm:flex items-center space-x-8">
        <NavLink href="/validation">Idea AI</NavLink>
        <NavLink href="/dashboard">Analytics</NavLink>
        <NavLink href="/competitors">Competitor Search</NavLink>
        <NavLink href="/investors">Find Investors</NavLink>
        <NavLink href="/planning">Market Trends</NavLink>
        <NavLink href="/pricing">Pricing</NavLink>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/90 p-4 sm:hidden">
          <NavLink href="/validation" onClick={() => handleNavigation("/validation")}>
            Idea AI
          </NavLink>
          <NavLink href="/dashboard" onClick={() => handleNavigation("/dashboard")}>
            Analytics
          </NavLink>
          <NavLink href="/competitors" onClick={() => handleNavigation("/competitors")}>
            Competitor Search
          </NavLink>
          <NavLink href="/investors" onClick={() => handleNavigation("/investors")}>
            Find Investors
          </NavLink>
          <NavLink href="/planning" onClick={() => handleNavigation("/planning")}>
            Market Trends
          </NavLink>
          <NavLink href="/pricing" onClick={() => handleNavigation("/pricing")}>
            Pricing
          </NavLink>
        </div>
      )}

      <div className="hidden sm:flex items-center space-x-4">
        {!isSignedIn ? (
          <>
            <SignInButton>
              <Button variant="ghost" className="text-white hover:text-purple-400">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Get Started</Button>
            </SignUpButton>
          </>
        ) : (
          <UserButton />
        )}
      </div>

      <Button variant="ghost" size="icon" className="sm:hidden text-white" onClick={toggleMenu}>
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>
    </motion.nav>
  )
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      className="block sm:inline-block text-gray-300 hover:text-white transition-colors relative group py-2 sm:py-0"
      onClick={onClick}
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
    </Link>
  )
}

