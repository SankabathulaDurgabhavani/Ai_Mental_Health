"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const moods = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😢", label: "Sad", value: "sad" },
  { emoji: "😠", label: "Angry", value: "angry" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "😌", label: "Calm", value: "calm" },
]

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [journal, setJournal] = useState("")
  const [todayStatus, setTodayStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedMood) return

    setIsSubmitting(true)

    // Dummy submission - simulate API call
    setTimeout(() => {
      // Sample API integration point:
      // await axios.post('/api/mood/submit', { mood: selectedMood, journal, date: new Date() })

      const moodLabel = moods.find((m) => m.value === selectedMood)?.label
      setTodayStatus(`Today's mood: ${moodLabel}`)
      setIsSubmitting(false)
      setSelectedMood(null)
      setJournal("")
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Select your mood</Label>
          <div className="flex flex-wrap gap-3">
            {moods.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:scale-105",
                  selectedMood === mood.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                <span className="text-4xl">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="journal">Mood Journal</Label>
          <Textarea
            id="journal"
            placeholder="Write about how you're feeling today..."
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            rows={5}
            className="resize-none"
          />
        </div>

        <Button onClick={handleSubmit} disabled={!selectedMood || isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Mood"}
        </Button>

        {todayStatus && (
          <div className="rounded-lg bg-primary/10 p-4 text-center">
            <p className="font-medium text-primary">{todayStatus}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
