"use client"

import { Button } from "@/components/ui/button"
import { Bot, Menu } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import type React from "react"
import { SignInButton, SignUpButton, useAuth, UserButton } from "@clerk/nextjs"

export default function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10"
    >
      <Link href="/" className="flex items-center space-x-2">
        <Bot className="w-8 h-8 text-purple-500" />
        <span className="text-white font-medium text-xl">SoloFounder.AI</span>
      </Link>

      <div className="hidden md:flex items-center space-x-8">
      <NavLink href="/validation">Idea AI</NavLink>
        <NavLink href="/dashboard">Analytics</NavLink>
        <NavLink href="/competitors">Competitor Search</NavLink>
        <NavLink href="/investors">Find Investors</NavLink>
        <NavLink href="/planning">Market Trends</NavLink>
        <NavLink href="/pricing">Pricing</NavLink>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        {!isSignedIn ? (
          <>
            <SignInButton>
              <Button variant="ghost" className="text-white hover:text-purple-400">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Get Started
              </Button>
            </SignUpButton>
          </>
        ) : (
          <UserButton />
        )}
      </div>

      <Button variant="ghost" size="icon" className="md:hidden text-white">
        <Menu className="w-6 h-6" />
      </Button>
    </motion.nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-gray-300 hover:text-white transition-colors relative group">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
    </Link>
  )
}