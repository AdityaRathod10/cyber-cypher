'use client'

import Navbar from "@/components/navbar"; // Adjust path as needed
import ValidationPage from "@/components/ValidationPage"; // Adjust path as needed

export default function Validation() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div> {/* Adjust padding to avoid overlap with navbar */}
        <ValidationPage />
      </div>
    </div>
  );
}
