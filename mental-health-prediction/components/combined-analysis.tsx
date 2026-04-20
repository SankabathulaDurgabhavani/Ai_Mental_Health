"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Camera, Mic, Square, Loader2, CheckCircle2, Brain } from "lucide-react"

interface CombinedAnalysisProps {
    email: string
    onComplete?: () => void
}

interface CombinedResult {
    emotion?: {
        predicted_emotion: string
        confidence: number
        mental_health_score: { score: number; status: string; message: string }
        recommendation: string
    }
    text?: {
        status: string
        polarity: number
        message: string
    }
}

declare global {
    interface Window {
        webkitSpeechRecognition: any
        SpeechRecognition: any
    }
}

const emotionEmojis: { [key: string]: string } = {
    Happy: "😊", Sad: "😢", Angry: "😠", Fear: "😨",
    Surprise: "😲", Disgust: "🤢", Neutral: "😐",
}

export function CombinedAnalysis({ email, onComplete }: CombinedAnalysisProps) {
    const [isRunning, setIsRunning] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [spokenText, setSpokenText] = useState("")
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [result, setResult] = useState<CombinedResult | null>(null)
    const [error, setError] = useState("")
    const [step, setStep] = useState<"idle" | "capturing" | "analyzing" | "done">("idle")

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const recognitionRef = useRef<any>(null)
    const textRef = useRef(spokenText)

    useEffect(() => { textRef.current = spokenText }, [spokenText])

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SR) {
                const recognition = new SR()
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = "en-US"
                recognition.onresult = (event: any) => {
                    let final = ""
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) final += event.results[i][0].transcript
                    }
                    if (final) setSpokenText(prev => prev ? `${prev} ${final}` : final)
                }
                recognitionRef.current = recognition
            }
        }
        return () => stopAll()
    }, [])

    useEffect(() => {
        if (isCameraActive && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current
        }
    }, [isCameraActive])

    const startAll = async () => {
        setError("")
        setResult(null)
        setSpokenText("")
        setCapturedImage(null)
        setStep("capturing")

        // Start camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
            streamRef.current = stream
            setIsCameraActive(true)
        } catch {
            setError("Camera access denied. Please grant camera permission.")
            setStep("idle")
            return
        }

        // Start speech recognition
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start()
                setIsListening(true)
            } catch { }
        }

        setIsRunning(true)
    }

    const stopAll = () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop() } catch { }
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        setIsListening(false)
        setIsCameraActive(false)
        setIsRunning(false)
    }

    const captureAndAnalyze = async () => {
        // Capture image from video
        let imageData: string | null = null
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current
            canvas.width = video.videoWidth || 640
            canvas.height = video.videoHeight || 480
            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.drawImage(video, 0, 0)
                imageData = canvas.toDataURL("image/jpeg", 0.8)
                setCapturedImage(imageData)
            }
        }

        stopAll()
        setStep("analyzing")

        const combinedResult: CombinedResult = {}
        const errors: string[] = []

        // Run both analyses in parallel
        await Promise.all([
            // Image/emotion analysis
            (async () => {
                if (!imageData) return
                try {
                    const blob = await (await fetch(imageData)).blob()
                    const formData = new FormData()
                    formData.append("file", blob, "image.jpg")
                    formData.append("email", email)
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/analyze-emotion`, { method: "POST", body: formData })
                    if (res.ok) {
                        const data = await res.json()
                        if (data.success) combinedResult.emotion = data
                    }
                } catch { errors.push("Image analysis failed") }
            })(),
            // Text/speech analysis
            (async () => {
                const text = textRef.current.trim()
                if (!text) return
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/analyze`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text, email })
                    })
                    if (res.ok) combinedResult.text = await res.json()
                } catch { errors.push("Text analysis failed") }
            })()
        ])

        if (!combinedResult.emotion && !combinedResult.text) {
            setError("Both analyses failed. " + errors.join(". "))
            setStep("idle")
            return
        }

        setResult(combinedResult)
        setStep("done")
        if (onComplete) onComplete()
    }

    const reset = () => {
        setResult(null)
        setCapturedImage(null)
        setSpokenText("")
        setError("")
        setStep("idle")
    }

    return (
        <Card className="w-full border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Brain className="h-5 w-5" />
                    Combined Analysis
                    <span className="text-xs font-normal text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Image + Speech</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Simultaneously captures your facial expression and listens to what you say for a comprehensive analysis.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {step === "idle" && (
                    <Button
                        onClick={startAll}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12"
                    >
                        <Camera className="mr-2 h-5 w-5" />
                        <Mic className="mr-2 h-5 w-5" />
                        Start Combined Analysis
                    </Button>
                )}

                {step === "capturing" && (
                    <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden bg-black" style={{ minHeight: 240 }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-auto"
                                style={{ minHeight: 240, maxHeight: 360, objectFit: "cover" }}
                            />
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    LIVE
                                </span>
                                {isListening && (
                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <Mic className="h-3 w-3" /> Listening
                                    </span>
                                )}
                            </div>
                        </div>

                        {spokenText && (
                            <div className="p-3 bg-white border rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Transcribed speech:</p>
                                <p className="text-sm">{spokenText}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button onClick={captureAndAnalyze} className="flex-1 bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Capture & Analyze
                            </Button>
                            <Button onClick={() => { stopAll(); setStep("idle") }} variant="outline">
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {step === "analyzing" && (
                    <div className="flex flex-col items-center py-8 gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                        <p className="text-muted-foreground">Running combined analysis...</p>
                        <p className="text-xs text-muted-foreground">Analyzing facial expression and speech simultaneously</p>
                    </div>
                )}

                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
                )}

                {step === "done" && result && (
                    <div className="space-y-4">
                        {capturedImage && (
                            <img src={capturedImage} alt="Captured" className="w-full rounded-lg border max-h-48 object-cover" />
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Emotion Result */}
                            {result.emotion && (
                                <div className="p-4 bg-white border rounded-lg space-y-2">
                                    <h4 className="font-semibold text-sm text-purple-900 flex items-center gap-1">
                                        <Camera className="h-4 w-4" /> Facial Emotion
                                    </h4>
                                    <div className="text-center py-2">
                                        <div className="text-4xl">{emotionEmojis[result.emotion.predicted_emotion] || "😊"}</div>
                                        <p className="font-bold text-lg">{result.emotion.predicted_emotion}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(result.emotion.confidence * 100).toFixed(1)}% confidence
                                        </p>
                                    </div>
                                    <div className="p-2 bg-purple-50 rounded text-xs">
                                        MH Score: <strong>{result.emotion.mental_health_score.score.toFixed(0)}/100</strong>
                                        {" · "}{result.emotion.mental_health_score.status}
                                    </div>
                                </div>
                            )}

                            {/* Text Result */}
                            {result.text && (
                                <div className="p-4 bg-white border rounded-lg space-y-2">
                                    <h4 className="font-semibold text-sm text-blue-900 flex items-center gap-1">
                                        <Mic className="h-4 w-4" /> Speech Analysis
                                    </h4>
                                    <div className="text-center py-2">
                                        <div className="text-4xl">
                                            {result.text.status === "Positive" ? "😊" : result.text.status === "Negative" ? "😔" : "😐"}
                                        </div>
                                        <p className="font-bold text-lg">{result.text.status}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Polarity: {result.text.polarity}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-blue-50 rounded text-xs">
                                        {result.text.message}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Combined Recommendation */}
                        {result.emotion && (
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">💡 Combined Recommendation</h4>
                                <p className="text-sm text-slate-700">{result.emotion.recommendation}</p>
                            </div>
                        )}

                        <Button onClick={reset} variant="outline" className="w-full">
                            Start New Analysis
                        </Button>
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </CardContent>
        </Card>
    )
}
