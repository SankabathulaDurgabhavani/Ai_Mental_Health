import { Navbar } from "@/components/navbar"
import { TherapistList } from "@/components/therapist-list"

export default function TherapistsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Connect with Therapists</h1>
          <p className="mt-2 text-muted-foreground">Find a professional to support your mental health journey</p>
        </div>

        <TherapistList />
      </main>
    </div>
  )
}
