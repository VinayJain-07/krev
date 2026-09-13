import { LogIn, UserRoundPlus } from "lucide-react";
import { Brand } from "./brand";
import { AuthForm } from "./auth-form";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  return (
    <main className={`auth-shell auth-cosmic auth-cosmic-${mode}`}>
      <header className="auth-cosmic-header"><Brand inverse /></header>
      <section className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-card-symbol" aria-hidden="true">{mode === "login" ? <LogIn size={22} strokeWidth={1.8} /> : <UserRoundPlus size={22} strokeWidth={1.8} />}</div>
          <h1>{mode === "login" ? "Sign in with email" : "Create your account"}</h1>
          <p className="form-intro">{mode === "login" ? "Pick up where your AI CMO and team left off." : "Bring your company, data, and team into one workspace."}</p>
          <AuthForm mode={mode} googleEnabled={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)} />
        </div>
      </section>
    </main>
  );
}
