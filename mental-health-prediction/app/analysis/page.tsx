"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Loader2 } from "lucide-react"
import { generatePDFReport } from "@/lib/download-report"

export default function AnalysisHistoryPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [analyses, setAnalyses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (!userData) {
            router.push("/login")
        } else {
            setUser(JSON.parse(userData))
            fetchAnalyses(JSON.parse(userData).email)
        }
    }, [router])

    const fetchAnalyses = async (email: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/analyses/${email}`)
            if (response.ok) {
                const data = await response.json()
                setAnalyses(data.analyses)
            }
        } catch (err) {
            console.error("Failed to fetch analyses:", err)
        } finally {
            setIsLoading(false)
        }
    }

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Positive":
                return "text-green-600 bg-green-50 border-green-200"
            case "Negative":
                return "text-red-600 bg-red-50 border-red-200"
            default:
                return "text-blue-600 bg-blue-50 border-blue-200"
        }
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Analysis History</h1>
                    <div className="flex items-center gap-3">
                        <Button onClick={handleDownloadReport} variant="outline" size="sm" disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Download Report
                        </Button>
                        <Button onClick={() => router.push("/dashboard")} variant="ghost" size="sm">
                            Dashboard
                        </Button>
                        <span className="text-sm text-muted-foreground hidden sm:block">Hi, {user.username}</span>
                        <Button onClick={handleLogout} variant="outline" size="sm">
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold">Analysis History</h2>
                    <p className="mt-2 text-muted-foreground">View your past mental health assessments</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : analyses.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No analysis history yet. Start by analyzing your mental health on the dashboard.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {analyses.map((analysis) => (
                            <Card key={analysis._id}>
                                <CardHeader>
                                    <CardTitle className="text-lg flex justify-between items-center">
                                        <span>Analysis from {new Date(analysis.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                                        <span className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(analysis.status)}`}>
                                            {analysis.status}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-700">{analysis.text}</p>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Sentiment Score: {analysis.polarity}</span>
                                        <span className="text-muted-foreground">
                                            {new Date(analysis.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{analysis.message}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
