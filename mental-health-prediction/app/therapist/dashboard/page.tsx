"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TherapistDashboardPage() {
    const router = useRouter()
    const [therapist, setTherapist] = useState<any>(null)

    useEffect(() => {
        const therapistData = localStorage.getItem("therapist")
        if (!therapistData) {
            router.push("/therapist/login")
        } else {
            setTherapist(JSON.parse(therapistData))
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("therapist")
        router.push("/therapist/login")
    }

    if (!therapist) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Therapist Portal</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Dr. {therapist.name}</span>
                        <Button onClick={handleLogout} variant="outline">
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold">Dashboard</h2>
                    <p className="mt-2 text-muted-foreground">Welcome back, Dr. {therapist.name}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p><span className="font-semibold">Specialization:</span> {therapist.specialization}</p>
                                <p><span className="font-semibold">Email:</span> {therapist.email}</p>
                                <div className="mt-4">
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500 text-white hover:bg-green-600">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">No upcoming appointments scheduled.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">No pending patient requests.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
