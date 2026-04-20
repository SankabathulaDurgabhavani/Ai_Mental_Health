import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          {/* <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <span className="text-2xl font-bold">MC</span>
          </div> */}
          <h1 className="text-3xl font-bold text-balance">Create Account</h1>
          <p className="mt-2 text-muted-foreground">Start your mental wellness journey today</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
