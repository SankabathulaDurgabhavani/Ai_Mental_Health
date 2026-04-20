"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { MoodHistoryList } from "@/components/mood-history-list"
import { MoodChart } from "@/components/mood-chart"
import { Button } from "@/components/ui/button"

export default function MoodHistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mood History</h1>
            <p className="mt-2 text-muted-foreground">Track your emotional patterns over time</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MoodChart />
          </div>
          <div>
            <MoodHistoryList />
          </div>
        </div>
      </main>
    </div>
  )
}
