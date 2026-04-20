"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mic, Square, Loader2, PauseCircle, PlayCircle } from "lucide-react"

interface MentalHealthAnalyzerProps {
    email: string
    mode?: "text" | "speech" | "both"
}

// Add type definition for window.webkitSpeechRecognition
declare global {
    interface Window {
        webkitSpeechRecognition: any
        SpeechRecognition: any
    }
}

export function MentalHealthAnalyzer({ email, mode = "both" }: MentalHealthAnalyzerProps) {
    const [text, setText] = useState("")
    const [result, setResult] = useState<any>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [error, setError] = useState("")
    const [isListening, setIsListening] = useState(false)
    const recognitionRef = useRef<any>(null)
    const textRef = useRef(text)

    // Audio Visualization Refs
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const dataArrayRef = useRef<Uint8Array | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const requestRef = useRef<number | undefined>(undefined)

    useEffect(() => {
        textRef.current = text
    }, [text])

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = "en-US"

                recognition.onresult = (event: any) => {
                    let finalTranscript = ""
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript
                        }
                    }
                    if (finalTranscript) {
                        setText(prev => {
                            const trimmed = prev.trim()
                            return trimmed ? `${trimmed} ${finalTranscript}` : finalTranscript
                        })
                    }
                }

                recognition.onerror = (event: any) => {
                    if (event.error !== 'no-speech') {
                        console.error("Speech recognition error", event.error)
                        stopRecording()
                        setError("Error accessing microphone or speech recognition failed.")
                    }
                }

                recognition.onend = () => {
                    // When recognition ends naturally or manually
                    if (isListening) {
                        stopRecording()
                    }
                }

                recognitionRef.current = recognition
            }
        }

        return () => {
            stopRecording()
        }
    }, [])

    // Auto-analyze when listening stops
    const prevListeningRef = useRef(false)
    useEffect(() => {
        if (prevListeningRef.current && !isListening) {
            setTimeout(() => {
                if (textRef.current.trim()) {
                    handleAnalyze()
                }
            }, 500)
        }
        prevListeningRef.current = isListening
    }, [isListening])

    const startVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const analyser = audioContext.createAnalyser()
            const source = audioContext.createMediaStreamSource(stream)

            source.connect(analyser)
            analyser.fftSize = 256
            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)

            audioContextRef.current = audioContext
            analyserRef.current = analyser
            dataArrayRef.current = dataArray
            sourceRef.current = source

            drawVisualizer()
        } catch (err) {
            console.error("Error initializing audio visualizer:", err)
        }
    }

    const drawVisualizer = () => {
        const canvas = canvasRef.current
        const analyser = analyserRef.current
        const dataArray = dataArrayRef.current

        if (!canvas || !analyser || !dataArray) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const width = canvas.width
        const height = canvas.height

        requestRef.current = requestAnimationFrame(drawVisualizer)

        analyser.getByteFrequencyData(dataArray as any)

        ctx.fillStyle = 'rgb(248 250 252)' // matching bg-slate-50
        ctx.fillRect(0, 0, width, height)

        const barWidth = (width / dataArray.length) * 2.5
        let barHeight
        let x = 0

        for (let i = 0; i < dataArray.length; i++) {
            barHeight = dataArray[i] / 2

            const r = barHeight + 25 * (i / dataArray.length)
            const g = 250 * (i / dataArray.length)
            const b = 50

            ctx.fillStyle = `rgb(99, 102, 241)` // Indigo-500
            ctx.fillRect(x, height - barHeight, barWidth, barHeight)

            x += barWidth + 1
        }
    }

    const stopRecording = () => {
        setIsListening(false)
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
        // Stop Visualizer
        if (requestRef.current) cancelAnimationFrame(requestRef.current)
        if (sourceRef.current) {
            sourceRef.current.mediaStream.getTracks().forEach(track => track.stop())
            sourceRef.current.disconnect()
        }
        if (analyserRef.current) analyserRef.current.disconnect()
        if (audioContextRef.current) audioContextRef.current.close()
    }

    const toggleListening = () => {
        if (!recognitionRef.current) {
            setError("Speech recognition is not supported in this browser.")
            return
        }

        if (isListening) {
            stopRecording()
        } else {
            setError("")
            try {
                recognitionRef.current.start()
                setIsListening(true)
                startVisualizer()
            } catch (err) {
                console.error(err)
            }
        }
    }

    const handleAnalyze = async () => {
        if (!textRef.current.trim()) { // Use Ref to get latest text if called from effect closure
            setError("Please enter some text to analyze")
            return
        }
        // ... (rest of function same as before, but using textRef.current for body?)
        // Actually, handleAnalyze uses `text` state directly in previous code. 
        // We need to keep using `text` for valid state, but inside this closure `text` might be stale 
        // if called from the startListening closure. 
        // BUT, handleAnalyze is called from `useEffect [isListening]`, so `text` is fresh there!

        const textToAnalyze = textRef.current // Safe bet

        setIsAnalyzing(true)
        setError("")

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/analyze`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, text: textToAnalyze }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "Analysis failed")
            }

            const data = await response.json()
            setResult(data)
            // Optional: Don't clear text immediately so user can see what was analyzed
            // setText("") 
        } catch (err: any) {
            setError(err.message || "An error occurred during analysis")
        } finally {
            setIsAnalyzing(false)
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

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Mental Health Text Analysis</span>
                    {isListening && (
                        <span className="text-xs font-normal text-red-500 animate-pulse flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            Recording
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="text">How are you feeling today?</Label>

                    {/* Visualizer Area */}
                    {isListening && (
                        <div className="h-16 w-full bg-slate-50 rounded-md overflow-hidden border mb-2">
                            <canvas ref={canvasRef} className="w-full h-full" width={600} height={100} />
                        </div>
                    )}

                    <Textarea
                        id="text"
                        placeholder={mode === "speech" ? "Speak to transcribe..." : "Share your thoughts..."}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={6}
                        className="resize-none"
                    />

                    {mode !== "text" && (
                        <>
                            <div className="flex justify-center py-2">
                                <Button
                                    size="lg"
                                    variant={isListening ? "destructive" : "default"}
                                    className={`rounded-full shadow-md w-16 h-16 p-0 flex items-center justify-center transition-all ${isListening ? 'hover:scale-105' : 'hover:bg-primary/90'}`}
                                    onClick={toggleListening}
                                    title={isListening ? "Pause/Stop" : "Start Listening"}
                                >
                                    {isListening ? <PauseCircle className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                                </Button>
                            </div>
                            {isListening && (
                                <p className="text-center text-xs text-muted-foreground">
                                    Tap pause to stop and analyze.
                                </p>
                            )}
                        </>
                    )}
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                {/* Manual analyze button kept for fallback/editing */}
                {(!isListening && mode !== "speech") && (
                    <Button onClick={handleAnalyze} disabled={isAnalyzing} variant="outline" className="w-full">
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            "Analyze Manually"
                        )}
                    </Button>
                )}

                {result && (
                    <div className="mt-6 space-y-4">
                        <div className={`p-4 border rounded-md ${getStatusColor(result.status)}`}>
                            <h3 className="font-semibold text-lg mb-2">Mental Health Status: {result.status}</h3>
                            <p className="text-sm mb-2">Sentiment Score: {result.polarity}</p>
                            <p className="text-sm">{result.message}</p>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                            <h4 className="font-semibold mb-2">Understanding Your Score</h4>
                            <ul className="text-sm space-y-1">
                                <li>• <strong>Positive (0.3 to 1.0):</strong> Indicates positive mental state</li>
                                <li>• <strong>Neutral (-0.3 to 0.3):</strong> Indicates balanced emotions</li>
                                <li>• <strong>Negative (-1.0 to -0.3):</strong> May indicate difficult emotions</li>
                            </ul>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
