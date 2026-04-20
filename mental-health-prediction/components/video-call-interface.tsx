"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Video, Mic, MicOff, VideoOff, PhoneOff, Settings } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function VideoCallInterface({ therapistName, onEndCall }: { therapistName: string, onEndCall: () => void }) {
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [callDuration, setCallDuration] = useState(0)
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [cameraError, setCameraError] = useState("")

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Start webcam
        startLocalCamera()
        // Start call timer
        timerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1)
        }, 1000)

        return () => {
            // Cleanup on unmount
            if (timerRef.current) clearInterval(timerRef.current)
            stopLocalCamera()
        }
    }, [])

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream])

    const startLocalCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setLocalStream(stream)
        } catch (err) {
            setCameraError("Camera access denied")
            console.error("Camera error:", err)
        }
    }

    const stopLocalCamera = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
        }
    }

    const handleEndCall = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        stopLocalCamera()
        onEndCall()
    }

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = isMuted // toggle
            })
        }
        setIsMuted(!isMuted)
    }

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = isVideoOff // toggle
            })
        }
        setIsVideoOff(!isVideoOff)
    }

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    return (
        <div className="relative h-[600px] w-full bg-slate-900 rounded-lg overflow-hidden flex flex-col shadow-2xl">
            {/* Remote Video (Simulated - therapist side) */}
            <div className="flex-1 relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="text-center">
                        <Avatar className="h-32 w-32 border-4 border-slate-700 mx-auto mb-4">
                            <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                                {therapistName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <p className="text-slate-300 text-lg font-medium">{therapistName}</p>
                        <p className="text-slate-400 text-sm mt-1 animate-pulse">Connecting to secure video...</p>
                    </div>
                </div>

                {/* Overlay Info */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start text-white">
                    <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-sm font-medium">{formatDuration(callDuration)}</span>
                    </div>
                    <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                        <span className="text-sm font-medium flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span> Encrypted
                        </span>
                    </div>
                </div>
            </div>

            {/* Local Video (PiP) - real webcam */}
            <div className="absolute bottom-24 right-4 h-36 w-28 bg-slate-700 rounded-lg border border-slate-600 shadow-lg overflow-hidden">
                {localStream && !isVideoOff ? (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                ) : (
                    <div className="h-full w-full bg-slate-800 flex items-center justify-center">
                        {cameraError ? (
                            <p className="text-xs text-slate-400 text-center px-1">{cameraError}</p>
                        ) : (
                            <VideoOff className="h-6 w-6 text-slate-500" />
                        )}
                    </div>
                )}
                <div className="absolute bottom-1 left-0 right-0 text-center">
                    <span className="text-[10px] text-white/70 bg-black/40 px-1 rounded">You</span>
                </div>
            </div>

            {/* Controls */}
            <div className="h-20 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center gap-4 px-4 pb-4">
                <Button
                    variant="secondary"
                    size="icon"
                    className={`h-12 w-12 rounded-full ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <Button
                    variant="secondary"
                    size="icon"
                    className={`h-12 w-12 rounded-full ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                    onClick={toggleVideo}
                    title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                >
                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>

                <Button
                    variant="destructive"
                    size="icon"
                    className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
                    onClick={handleEndCall}
                    title="End call"
                >
                    <PhoneOff className="h-6 w-6" />
                </Button>

                <Button
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-slate-700 text-white hover:bg-slate-600"
                    title="Settings"
                >
                    <Settings className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
