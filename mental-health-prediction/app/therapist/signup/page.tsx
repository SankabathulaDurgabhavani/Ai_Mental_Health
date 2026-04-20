import { TherapistRegisterForm } from "@/components/therapist-register-form"

export default function TherapistRegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-balance">Join Network</h1>
                    <p className="mt-2 text-muted-foreground">Register as a mental health professional</p>
                </div>
                <TherapistRegisterForm />
            </div>
        </div>
    )
}
