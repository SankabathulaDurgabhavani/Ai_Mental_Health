"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MoodTracker } from "@/components/mood-tracker"
import { AISuggestions } from "@/components/ai-suggestions"
import { UserProfile } from "@/components/user-profile"
import { MentalHealthAnalyzer } from "@/components/mental-health-analyzer"
import { Button } from "@/components/ui/button"
import { MoodStatistics } from "@/components/mood-statistics"
import { AIChatBot } from "@/components/ai-chat-bot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Brain, History, BarChart3, Mic, Download, Loader2 } from "lucide-react"
import { generatePDFReport } from "@/lib/download-report"

type Tab = "overview" | "analysis" | "history"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleDownloadReport = async () => {
    if (!user?.email) return
    setIsDownloading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/report/${user.email}`)
      if (response.ok) {
        const data = await response.json()
        generatePDFReport(data, user.email)
      }
    } catch (err) {
      console.error("Failed to download report:", err)
    } finally {
      setIsDownloading(false)
    }
  }

  if (!user) {
    return null
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "analysis", label: "Analysis", icon: Brain },
    { id: "history", label: "History", icon: History },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Navbar */}
      <nav className="border-b bg-background sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="font-bold text-white text-sm">M</span>
            </div>
            <h1 className="text-lg font-bold">Mental Health</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownloadReport}
              variant="outline"
              size="sm"
              disabled={isDownloading}
              className="hidden sm:flex"
            >
              {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Report
            </Button>
            <Button onClick={() => router.push("/therapists")} size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hidden sm:flex">
              <Users className="mr-2 h-4 w-4" /> Therapists
            </Button>
            <span className="text-sm text-muted-foreground hidden md:block">Hi, {user.username}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="container mx-auto px-4 flex gap-1 border-t">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 max-w-7xl">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <UserProfile email={user.email} />

              {/* Quick Actions */}
              <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
                <div
                  onClick={() => router.push("/emotion-analysis")}
                  className="cursor-pointer group relative overflow-hidden rounded-xl border bg-background p-5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg w-fit mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Brain className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold">Emotion Analysis</h3>
                    <p className="text-sm text-muted-foreground mt-1">Facial expression & speech AI</p>
                  </div>
                </div>

                <div
                  onClick={() => router.push("/analysis")}
                  className="cursor-pointer group relative overflow-hidden rounded-xl border bg-background p-5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg w-fit mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <History className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold">Analysis History</h3>
                    <p className="text-sm text-muted-foreground mt-1">View past assessments</p>
                  </div>
                </div>

                <div
                  onClick={() => router.push("/therapists")}
                  className="cursor-pointer group relative overflow-hidden rounded-xl border bg-background p-5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg w-fit mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                      <Users className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold">Find Therapist</h3>
                    <p className="text-sm text-muted-foreground mt-1">Connect with professionals</p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("analysis")}
                  className="cursor-pointer group relative overflow-hidden rounded-xl border bg-background p-5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg w-fit mb-3 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <Mic className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold">Text & Speech Analysis</h3>
                    <p className="text-sm text-muted-foreground mt-1">Analyze your thoughts</p>
                  </div>
                </div>
              </div>
            </div>

            <MoodStatistics email={user.email || ""} />

            <div className="grid gap-6 md:grid-cols-2">
              <MoodTracker />
              <AISuggestions />
            </div>
          </div>
        )}

        {/* ANALYSIS TAB */}
        {activeTab === "analysis" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Mental Health Analysis</h2>
                <p className="text-muted-foreground mt-1">Speak or type to analyze your mental state</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/emotion-analysis")}>
                <Brain className="mr-2 h-4 w-4" /> Full Analysis
              </Button>
            </div>
            <MentalHealthAnalyzer email={user.email} mode="both" />
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Analysis History</h2>
                <p className="text-muted-foreground mt-1">Your past mental health assessments</p>
              </div>
              <Button onClick={() => router.push("/analysis")} variant="outline" size="sm">
                View Full History
              </Button>
            </div>
            <MoodStatistics email={user.email || ""} />
          </div>
        )}
      </main>

      <AIChatBot />
    </div>
  )
}
