"use client"

import { Analytics } from "@/components/analytics"
import Navbar from "@/components/navbar"

export default function DashboardPage() {
  return (
    
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
        <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-3xl font-bold text-transparent">
              Sales Analytics Dashboard
            </h1>
            <p className="mt-1 text-gray-400">Track your business performance and insights</p>
          </div>
        </div>
        <Analytics />
      </div>
    </div>
  )
}

