"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Loader2 } from "lucide-react"

export function MoodHistoryList() {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const emotionEmojis: { [key: string]: string } = {
    Happy: "😊",
    Sad: "😢",
    Angry: "😠",
    Fear: "😨",
    Surprise: "😲",
    Disgust: "🤢",
    Neutral: "😐",
  }

  useEffect(() => {
    const fetchHistory = async () => {
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/emotion-analyses/${user.email}?limit=10`)
          if (response.ok) {
            const data = await response.json()
            setHistory(data.analyses || [])
          }
        } catch (error) {
          console.error("Failed to fetch history:", error)
        }
      }
      setIsLoading(false)
    }

    fetchHistory()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Entries
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No entries found. Try recording your mood!
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry, index) => {
              const date = new Date(entry.created_at).toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
                month: "short",
                day: "numeric",
              })
              const mood = entry.predicted_emotion || "Neutral"
              const emoji = emotionEmojis[mood] || "😐"

              return (
                <div
                  key={entry._id || index}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="font-medium">{mood.charAt(0).toUpperCase() + mood.slice(1)}</p>
                      <p className="text-xs text-muted-foreground">{date}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
