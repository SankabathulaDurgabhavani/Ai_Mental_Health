import { TherapistLoginForm } from "@/components/therapist-login-form"

export default function TherapistLoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-balance">Therapist Portal</h1>
                    <p className="mt-2 text-muted-foreground">Sign in to manage your practice</p>
                </div>
                <TherapistLoginForm />
            </div>
        </div>
    )
}
