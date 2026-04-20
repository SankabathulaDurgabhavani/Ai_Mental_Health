"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

type EmotionStat = {
    emotion: string
    count: number
}

export function MoodStatistics({ email }: { email: string }) {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/emotion-stats/${email}`)
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error("Failed to fetch emotion stats", error)
            } finally {
                setLoading(false)
            }
        }

        if (email) {
            fetchStats()
        }
    }, [email])

    if (loading) {
        return (
            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Mood Statistics</CardTitle>
                    <CardDescription>Loading your mood data...</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (!stats || stats.total_analyses === 0) {
        return (
            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Mood Statistics</CardTitle>
                    <CardDescription>No mood data recorded yet. Try the Emotion Analysis tool!</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    // Transform data for chart
    const chartData = Object.entries(stats.emotion_counts || {}).map(([emotion, count]) => ({
        name: emotion,
        count: count as number,
    }))

    return (
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle>Mood Analysis Overview</CardTitle>
                <CardDescription>Your recent emotional trends based on {stats.total_analyses} scans</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Recent Trend</p>
                        <p className="text-2xl font-bold">{stats.recent_trend?.split(" - ")[0] || "Neutral"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Dominant Emotion</p>
                        <p className="text-2xl font-bold capitalize">{stats.most_common_emotion || "None"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Avg. Mental Health Score</p>
                        <p className="text-2xl font-bold">{stats.average_mental_health_score}</p>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                cursor={{ fill: "transparent" }}
                            />
                            <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
