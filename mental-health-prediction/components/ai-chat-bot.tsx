"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
    role: "user" | "bot"
    content: string
}

export function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: "Hello! I'm your AI mental health companion. How are you feeling today? I'm here to listen and support you. 💚" }
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
    }, [messages, isOpen])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput("")
        setMessages((prev) => [...prev, { role: "user", content: userMessage }])
        setIsLoading(true)

        // Build history for context (last 6 messages = 3 exchanges)
        const history = messages.slice(-6).map(m => ({
            role: m.role === "user" ? "user" : "assistant",
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
                setMessages((prev) => [...prev, { role: "bot", content: data.reply }])
            } else {
                setMessages((prev) => [...prev, {
                    role: "bot",
                    content: "I'm having trouble connecting right now. Please try again in a moment. 💙"
                }])
            }
        } catch (error) {
            setMessages((prev) => [...prev, {
                role: "bot",
                content: "Sorry, I couldn't reach the server. Please check your connection and try again."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {!isOpen && (
                <Button
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 p-0 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => setIsOpen(true)}
                    title="Open AI Companion"
                >
                    <MessageSquare className="h-6 w-6" />
                </Button>
            )}

            {isOpen && (
                <Card className="fixed bottom-6 right-6 w-80 md:w-96 shadow-2xl z-50 flex flex-col h-[520px] border-0 overflow-hidden">
                    <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-base text-white">AI Companion</CardTitle>
                                <p className="text-xs text-white/70">Mental Health Support</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden bg-slate-50/50">
                        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                            <div className="space-y-3">
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {msg.role === "bot" && (
                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                                <Bot className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${msg.role === "user"
                                                ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-none"
                                                : "bg-white text-slate-800 border rounded-bl-none"
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                        {msg.role === "user" && (
                                            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                                <User className="h-3 w-3 text-slate-600" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-end gap-2 justify-start">
                                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                            <Bot className="h-3 w-3 text-white" />
                                        </div>
                                        <div className="bg-white border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                            <div className="flex gap-1 items-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-3 border-t bg-white gap-2">
                        <Input
                            placeholder="Share how you're feeling..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                            className="rounded-full bg-slate-50 border-slate-200 text-sm"
                            disabled={isLoading}
                        />
                        <Button
                            size="icon"
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-9 w-9 flex-shrink-0"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </>
    )
}
