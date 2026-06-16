import { Suspense } from "react";
import { Brand } from "@/components/Brand";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center py-10">
      <div className="container-app">
        <div className="card">
          <Brand subtitle="Admin sign in" />
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Booking management for dance classes.
        </p>
      </div>
    </main>
  );
}
