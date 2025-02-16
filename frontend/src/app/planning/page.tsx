'use client'

import Navbar from "@/components/navbar"; // Adjust path as needed
import MarketAnalysis from "@/components/MarketAnalysis";
const page = () => {
  return (
      <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div> {/* Adjust padding to avoid overlap with navbar */}
              <MarketAnalysis />
            </div>
          </div>
    
  )
}

export default page
