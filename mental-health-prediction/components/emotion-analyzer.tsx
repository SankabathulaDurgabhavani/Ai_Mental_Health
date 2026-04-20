"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Camera, Upload, X, Loader2 } from "lucide-react"

interface EmotionAnalyzerProps {
    email: string
    onAnalysisComplete?: () => void
}

interface EmotionResult {
    success: boolean
    predicted_emotion: string
    confidence: number
    emotion_distribution: {
        [key: string]: number
    }
    mental_health_score: {
        score: number
        status: string
        message: string
    }
    recommendation: string
}

export function EmotionAnalyzer({ email, onAnalysisComplete }: EmotionAnalyzerProps) {
    const [result, setResult] = useState<EmotionResult | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [error, setError] = useState("")
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Emotion emojis
    const emotionEmojis: { [key: string]: string } = {
        Happy: "😊",
        Sad: "😢",
        Angry: "😠",
        Fear: "😨",
        Surprise: "😲",
        Disgust: "🤢",
        Neutral: "😐",
    }

    // Use useEffect to set srcObject when camera becomes active and video element is rendered
    useEffect(() => {
        if (isCameraActive && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current
        }
    }, [isCameraActive])

    // Start camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 480 },
            })

            streamRef.current = stream
            setIsCameraActive(true)
            setCapturedImage(null)
            setError("")
        } catch (err: any) {
            setError("Failed to access camera. Please ensure camera permissions are granted.")
            console.error("Camera error:", err)
        }
    }

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setIsCameraActive(false)
    }

    // Capture photo from camera
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.drawImage(video, 0, 0)
                const imageData = canvas.toDataURL("image/jpeg", 0.8)
                setCapturedImage(imageData)
                stopCamera()
            }
        }
    }

    // Handle file upload
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setCapturedImage(e.target?.result as string)
                setError("")
            }
            reader.readAsDataURL(file)
        }
    }

    // Analyze emotion
    const analyzeEmotion = async () => {
        if (!capturedImage) {
            setError("Please capture or upload an image first")
            return
        }

        setIsAnalyzing(true)
        setError("")

        try {
            // Convert base64 to blob
            const response = await fetch(capturedImage)
            const blob = await response.blob()

            // Create form data
            const formData = new FormData()
            formData.append("file", blob, "image.jpg")
            formData.append("email", email)

            // Send to backend
            const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/analyze-emotion`, {
                method: "POST",
                body: formData,
            })

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json()
                throw new Error(errorData.detail || "Analysis failed")
            }

            const data = await apiResponse.json()
            setResult(data)
            if (onAnalysisComplete) {
                onAnalysisComplete()
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during analysis")
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Clear captured image
    const clearImage = () => {
        setCapturedImage(null)
        setResult(null)
        setError("")
    }

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Positive":
                return "text-green-600 bg-green-50 border-green-200"
            case "Concerning":
                return "text-red-600 bg-red-50 border-red-200"
            default:
                return "text-blue-600 bg-blue-50 border-blue-200"
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Facial Emotion Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Camera/Upload Controls */}
                {!capturedImage && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                onClick={isCameraActive ? stopCamera : startCamera}
                                variant={isCameraActive ? "destructive" : "default"}
                                className="w-full"
                            >
                                <Camera className="mr-2 h-4 w-4" />
                                {isCameraActive ? "Stop Camera" : "Start Camera"}
                            </Button>

                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="w-full"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Image
                            </Button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Camera View */}
                {isCameraActive && (
                    <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden bg-black" style={{ minHeight: '300px' }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-auto"
                                style={{
                                    display: 'block',
                                    minHeight: '300px',
                                    maxHeight: '480px',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                        <Button onClick={capturePhoto} className="w-full">
                            <Camera className="mr-2 h-4 w-4" />
                            Capture Photo
                        </Button>
                    </div>
                )}

                {/* Hidden canvas for capturing */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Captured Image Preview */}
                {capturedImage && !result && (
                    <div className="space-y-4">
                        <div className="relative">
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="w-full rounded-lg border"
                            />
                            <Button
                                onClick={clearImage}
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            onClick={analyzeEmotion}
                            disabled={isAnalyzing}
                            className="w-full"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                "Analyze Emotion"
                            )}
                        </Button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-4">
                        {/* Captured Image Thumbnail */}
                        <div className="relative">
                            <img
                                src={capturedImage!}
                                alt="Analyzed"
                                className="w-full rounded-lg border"
                            />
                            <Button
                                onClick={clearImage}
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2"
                            >
                                <X className="mr-2 h-3 w-3" />
                                New Analysis
                            </Button>
                        </div>

                        {/* Emotion Result */}
                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border">
                            <div className="text-6xl mb-3">
                                {emotionEmojis[result.predicted_emotion] || "😊"}
                            </div>
                            <h3 className="text-2xl font-bold text-purple-900 mb-2">
                                {result.predicted_emotion}
                            </h3>
                            <p className="text-sm text-gray-600">
                                Confidence: {(result.confidence * 100).toFixed(1)}%
                            </p>
                        </div>

                        {/* Mental Health Score */}
                        <div className={`p-4 border rounded-md ${getStatusColor(result.mental_health_score.status)}`}>
                            <h3 className="font-semibold text-lg mb-2">
                                Mental Health Score: {result.mental_health_score.score.toFixed(0)}/100
                            </h3>
                            <p className="text-sm mb-2">
                                Status: {result.mental_health_score.status}
                            </p>
                            <p className="text-sm">{result.mental_health_score.message}</p>
                        </div>

                        {/* Recommendation */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <h4 className="font-semibold mb-2 text-blue-900">💡 Recommendation</h4>
                            <p className="text-sm text-blue-800">{result.recommendation}</p>
                        </div>

                        {/* Emotion Distribution */}
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                            <h4 className="font-semibold mb-3">Emotion Distribution</h4>
                            <div className="space-y-2">
                                {Object.entries(result.emotion_distribution)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([emotion, probability]) => (
                                        <div key={emotion}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>
                                                    {emotionEmojis[emotion]} {emotion}
                                                </span>
                                                <span className="font-medium">
                                                    {(probability * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${probability * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
