
import Navbar from "@/components/navbar"
import PricingPage from "@/components/pricing-page"
import { SparklesCore } from "@/components/sparkles"


export default function Home() {
  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">

      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar/>
        <div>
        <PricingPage/>
        </div>
        </div>
    </main>
  )
}

