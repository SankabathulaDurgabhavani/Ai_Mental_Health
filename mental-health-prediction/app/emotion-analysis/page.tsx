"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EmotionAnalyzer } from "@/components/emotion-analyzer"
import { EmotionHistory } from "@/components/emotion-history"
import { MentalHealthAnalyzer } from "@/components/mental-health-analyzer"
import { CombinedAnalysis } from "@/components/combined-analysis"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import { generatePDFReport } from "@/lib/download-report"

export default function EmotionAnalysisPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [activeTab, setActiveTab] = useState<"image" | "speech" | "combined">("combined")
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

    const handleAnalysisComplete = () => {
        setRefreshKey(prev => prev + 1)
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

    const tabs = [
        { id: "combined", label: "🧠 Combined" },
        { id: "image", label: "📷 Facial" },
        { id: "speech", label: "🎤 Speech" },
    ] as const

    return (
        <div className="min-h-screen bg-slate-50/50">
            <nav className="border-b bg-background sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => router.push("/dashboard")}
                            variant="ghost"
                            size="sm"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                        <h1 className="text-xl font-bold">Emotion Analysis</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleDownloadReport}
                            variant="outline"
                            size="sm"
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Download Report
                        </Button>
                        <span className="text-sm text-muted-foreground hidden sm:block">{user.username}</span>
                        <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold">Facial & Voice Analysis</h2>
                        <p className="mt-2 text-muted-foreground">
                            Analyze your emotional state through facial expressions and speech
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-6 border-b">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? "border-purple-600 text-purple-600"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Combined Tab */}
                    {activeTab === "combined" && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            <CombinedAnalysis email={user.email} onComplete={handleAnalysisComplete} />
                            <EmotionHistory key={refreshKey} email={user.email} />
                        </div>
                    )}

                    {/* Image/Facial Tab */}
                    {activeTab === "image" && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            <EmotionAnalyzer email={user.email} onAnalysisComplete={handleAnalysisComplete} />
                            <EmotionHistory key={refreshKey} email={user.email} />
                        </div>
                    )}

                    {/* Speech Tab */}
                    {activeTab === "speech" && (
                        <div className="max-w-2xl mx-auto">
                            <MentalHealthAnalyzer email={user.email} mode="speech" />
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
