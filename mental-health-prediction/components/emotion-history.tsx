"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface EmotionHistoryProps {
    email: string
}

interface EmotionAnalysis {
    _id: string
    predicted_emotion: string
    confidence: number
    mental_health_score: {
        score: number
        status: string
        message: string
    }
    recommendation: string
    created_at: string
}

interface EmotionStats {
    total_analyses: number
    emotion_counts: { [key: string]: number }
    average_confidence: number
    average_mental_health_score: number
    recent_trend: string
    most_common_emotion: string
}

export function EmotionHistory({ email }: EmotionHistoryProps) {
    const [history, setHistory] = useState<EmotionAnalysis[]>([])
    const [stats, setStats] = useState<EmotionStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

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
        fetchData()
    }, [email])

    const fetchData = async () => {
        setIsLoading(true)
        setError("")

        try {
            // Fetch history
            const historyResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/emotion-analyses/${email}?limit=10`
            )
            if (historyResponse.ok) {
                const historyData = await historyResponse.json()
                setHistory(historyData.analyses || [])
            }

            // Fetch statistics
            const statsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/emotion-stats/${email}`
            )
            if (statsResponse.ok) {
                const statsData = await statsResponse.json()
                setStats(statsData)
            }
        } catch (err: any) {
            // Silently fail - user might not have any analyses yet
            console.log("No emotion data yet:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="space-y-6">
            {/* Statistics Card */}
            {stats && stats.total_analyses > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle> Emotion Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {stats.total_analyses}
                                </div>
                                <div className="text-sm text-gray-600">Total Analyses</div>
                            </div>

                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.average_mental_health_score.toFixed(0)}
                                </div>
                                <div className="text-sm text-gray-600">Avg MH Score</div>
                            </div>

                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {(stats.average_confidence * 100).toFixed(0)}%
                                </div>
                                <div className="text-sm text-gray-600">Avg Confidence</div>
                            </div>

                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl">
                                    {emotionEmojis[stats.most_common_emotion] || "😊"}
                                </div>
                                <div className="text-sm text-gray-600">Most Common</div>
                            </div>
                        </div>

                        {/* Emotion Distribution */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold mb-3">Emotion Distribution</h4>
                            <div className="space-y-2">
                                {Object.entries(stats.emotion_counts)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([emotion, count]) => {
                                        const percentage = (count / stats.total_analyses) * 100
                                        return (
                                            <div key={emotion}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>
                                                        {emotionEmojis[emotion]} {emotion}
                                                    </span>
                                                    <span className="font-medium">
                                                        {count} ({percentage.toFixed(0)}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>

                        {/* Trend */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2"> Recent Trend</h4>
                            <p className="text-sm text-blue-800">{stats.recent_trend}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* History Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle> Recent Analyses</CardTitle>
                        <Button onClick={fetchData} variant="outline" size="sm">
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {history.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-4xl mb-4"></div>
                            <p>No emotion analyses yet</p>
                            <p className="text-sm mt-2">
                                Start by capturing or uploading a photo above
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((analysis) => (
                                <div
                                    key={analysis._id}
                                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl">
                                                {emotionEmojis[analysis.predicted_emotion] || "😊"}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">
                                                    {analysis.predicted_emotion}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(analysis.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600">Confidence</div>
                                            <div className="font-semibold">
                                                {(analysis.confidence * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="p-2 bg-gray-50 rounded">
                                            <div className="text-xs text-gray-600">MH Score</div>
                                            <div className="font-semibold">
                                                {analysis.mental_health_score.score.toFixed(0)}/100
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                            <div className="text-xs text-gray-600">Status</div>
                                            <div className="font-semibold">
                                                {analysis.mental_health_score.status}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-blue-50 rounded text-sm">
                                        <strong>💡 Recommendation:</strong>{" "}
                                        {analysis.recommendation}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
