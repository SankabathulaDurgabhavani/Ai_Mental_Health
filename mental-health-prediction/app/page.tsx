import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, Shield, Heart } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 h-16 flex items-center justify-between border-b bg-card/50 backdrop-blur-sm fixed w-full z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Mental Health
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
          <Link href="/therapist/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            For Therapists
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              Your Personal Mental Health <span className="text-primary">Companion</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Track your mood, get AI-powered insights, and connect with professional therapists directly from your device.
            </p>
            <div className="flex items-center justify-center gap-4 flex-col sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-lg rounded-full">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/therapist/signup">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full">
                  Join as Therapist
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-card/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose Mental Health?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Comprehensive tools and support for your mental wellness journey.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-card border hover:shadow-lg transition-all">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Analysis</h3>
                <p className="text-muted-foreground">Advanced AI algorithms analyze your mood patterns and provide personalized insights.</p>
              </div>
              <div className="p-8 rounded-2xl bg-card border hover:shadow-lg transition-all">
                <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Therapist Connection</h3>
                <p className="text-muted-foreground">Directly connect with certified therapists for chat and video consultations.</p>
              </div>
              <div className="p-8 rounded-2xl bg-card border hover:shadow-lg transition-all">
                <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
                <p className="text-muted-foreground">Your data is encrypted and secure. We prioritize your privacy above all.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-bold">Mental Health</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
