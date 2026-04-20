const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`)

export interface User {
    username: string
    email: string
}

export interface AnalysisResult {
    status: string
    polarity: number
    message: string
}

export interface Analysis {
    _id: string
    email: string
    text: string
    status: string
    polarity: number
    message: string
    created_at: string
}

export const api = {
    async signup(username: string, email: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || "Signup failed")
        }

        return response.json()
    },

    async login(email: string, password: string): Promise<{ message: string; user: User }> {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || "Login failed")
        }

        return response.json()
    },

    async getUserProfile(email: string) {
        const response = await fetch(`${API_BASE_URL}/user/${email}`)

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || "Failed to fetch user profile")
        }

        return response.json()
    },

    async updateUserProfile(email: string, username?: string, newEmail?: string) {
        const response = await fetch(`${API_BASE_URL}/user/${email}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                email: newEmail,
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || "Failed to update profile")
        }

        return response.json()
    },

    async analyzeMentalHealth(email: string, text: string): Promise<AnalysisResult> {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, text }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || "Analysis failed")
        }

        return response.json()
    },

    async getAnalysisHistory(email: string): Promise<{ analyses: Analysis[] }> {
        const response = await fetch(`${API_BASE_URL}/analyses/${email}`)

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || "Failed to fetch analysis history")
        }

        return response.json()
    },
}

