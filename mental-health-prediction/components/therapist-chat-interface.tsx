"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, User, Check, CheckCheck } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Message = {
    id: string
    sender: "user" | "therapist"
    content: string
    timestamp: Date
    status: "sent" | "delivered" | "read"
}

export function TherapistChatInterface({ therapistName }: { therapistName: string }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            sender: "therapist",
            content: `Hi there! I'm Dr. ${therapistName.split(" ")[1] || therapistName}. How can I assist you today?`,
            timestamp: new Date(),
            status: "delivered",
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: "user",
            content: userMessage,
            timestamp: new Date(),
            status: "sent",
        }

        setMessages((prev) => [...prev, newMessage])
        setInput("")
        setIsLoading(true)

        // Simulate delivered status
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: "delivered" } : m))
        }, 500)

        // Build history for context (last 6 messages)
        const history = messages.slice(-6).map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content
        }))

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history
                }),
            })

            if (response.ok) {
                const data = await response.json()
                const reply: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: "therapist",
                    content: data.reply,
                    timestamp: new Date(),
                    status: 'sent'
                }
                setMessages((prev) => [...prev, reply])
            } else {
                const reply: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: "therapist",
                    content: "I'm having trouble connecting right now. Please try again in a moment. 💙",
                    timestamp: new Date(),
                    status: 'sent'
                }
                setMessages((prev) => [...prev, reply])
            }
        } catch (error) {
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                sender: "therapist",
                content: "Sorry, I couldn't reach the server. Please check your connection and try again.",
                timestamp: new Date(),
                status: 'sent'
            }
            setMessages((prev) => [...prev, reply])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="flex flex-col h-[600px] shadow-sm">
            <CardHeader className="border-b p-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback>{therapistName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base">{therapistName}</CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50/50">
                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.sender === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white text-slate-800 border rounded-tl-none"
                                        }`}
                                >
                                    <p>{msg.content}</p>
                                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.sender === "user" ? "text-blue-100" : "text-muted-foreground"}`}>
                                        <span>
                                            {msg.timestamp.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {msg.sender === "user" && (
                                            <span>
                                                {msg.status === "sent" && <Check className="h-3 w-3" />}
                                                {msg.status === "delivered" && <CheckCheck className="h-3 w-3" />}
                                                {msg.status === "read" && <CheckCheck className="h-3 w-3 text-blue-200" />}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t bg-background">
                <form
                    className="flex w-full items-center gap-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                >
                    <Input
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="rounded-full bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 h-10 w-10 shrink-0" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
