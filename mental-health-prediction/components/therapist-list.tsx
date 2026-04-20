"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Star, MessageCircle, Loader2 } from "lucide-react"

interface Therapist {
  id: string
  name: string
  specialization: string
  rating: number
  experience: number
  bio?: string
  available: boolean
}

export function TherapistList() {
  const router = useRouter()
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTherapists()
  }, [])

  const fetchTherapists = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/therapists`)
      if (response.ok) {
        const data = await response.json()
        setTherapists(data.therapists || [])
      } else {
        setError("Failed to load therapists. Please try again.")
      }
    } catch (err) {
      setError("Could not connect to server. Please ensure the backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestChat = (therapistId: string) => {
    router.push(`/therapists/${therapistId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading therapists...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchTherapists} variant="outline">Try Again</Button>
      </div>
    )
  }

  if (therapists.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-5xl mb-4">👨‍⚕️</div>
        <h3 className="text-lg font-semibold mb-2">No therapists registered yet</h3>
        <p className="text-sm">Therapists can register at <strong>/therapist/signup</strong> to appear here.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {therapists.map((therapist) => (
        <Card key={therapist.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-lg text-white">
                  {therapist.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-balance">{therapist.name}</h3>
                <p className="text-sm text-muted-foreground">{therapist.specialization}</p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{therapist.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">{therapist.experience} yrs experience</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {therapist.bio && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{therapist.bio}</p>
            )}
            <div className="flex gap-2">
              {therapist.available ? (
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                  Available
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-500/10 text-gray-700 dark:text-gray-400">
                  Unavailable
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full gap-2"
              onClick={() => handleRequestChat(therapist.id)}
              disabled={!therapist.available}
            >
              <MessageCircle className="h-4 w-4" />
              Request Chat
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
