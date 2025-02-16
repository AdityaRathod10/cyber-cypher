import { Loader2 } from "lucide-react"

export function LoadingDashboard() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-green-400" />
    </div>
  )
}

