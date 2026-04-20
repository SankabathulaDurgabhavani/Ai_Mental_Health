"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Heart, Brain } from "lucide-react"

const suggestions = [
  {
    icon: Lightbulb,
    title: "Daily Tip",
    content: "Take a 5-minute walk outside. Fresh air and movement can improve your mood instantly.",
  },
  {
    icon: Heart,
    title: "Self-Care Reminder",
    content: "Remember to stay hydrated and take breaks. Small acts of self-care make a big difference.",
  },
  {
    icon: Brain,
    title: "Mindfulness",
    content: "Try a 2-minute breathing exercise: breathe in for 4 counts, hold for 4, breathe out for 4.",
  },
]

export function AISuggestions() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">AI Suggestions</h2>
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon
        return (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">{suggestion.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{suggestion.content}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
