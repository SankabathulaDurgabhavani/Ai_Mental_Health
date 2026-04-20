"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { TherapistChatInterface } from "@/components/therapist-chat-interface"
import { VideoCallInterface } from "@/components/video-call-interface"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Video, MessageSquare, Loader2 } from "lucide-react"

interface Therapist {
  id: string
  name: string
  specialization: string
  experience: number
  bio?: string
  available: boolean
  rating: number
}

export default function TherapistInteractionPage() {
  const params = useParams()
  const router = useRouter()
  const [mode, setMode] = useState<"chat" | "video">("chat")
  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const therapistId = params.id as string

  useEffect(() => {
    if (therapistId) {
      fetchTherapist()
    }
  }, [therapistId])

  const fetchTherapist = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/therapists/${therapistId}`)
      if (response.ok) {
        const data = await response.json()
        setTherapist(data)
      } else {
        setError("Therapist not found.")
      }
    } catch (err) {
      setError("Could not connect to server.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading therapist...</span>
      </div>
    )
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-red-500">{error || "Therapist not found."}</p>
        <Button onClick={() => router.push("/therapists")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Therapists
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <header className="bg-background border-b h-16 flex items-center px-4 sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg">{therapist.name}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              {therapist.specialization} · {therapist.experience} yrs experience
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              variant={mode === "chat" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMode("chat")}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            <Button
              variant={mode === "video" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMode("video")}
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              Call
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-5xl p-4 md:p-6">
        {mode === "chat" ? (
          <div className="h-full">
            <TherapistChatInterface therapistName={therapist.name} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <VideoCallInterface
              therapistName={therapist.name}
              onEndCall={() => setMode("chat")}
            />
          </div>
        )}
      </main>
    </div>
  )
}
