"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";

export function AuthForm({ mode, googleEnabled }: { mode: "login" | "signup"; googleEnabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    try {
      if (mode === "signup") {
        const response = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email, password }) });
        const data = await readJson<{ error?: string }>(response);
        if (!response.ok) throw new Error(data.error ?? "Could not create your account.");
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error(mode === "login" ? "Email or password is incorrect." : "Your account was created, but sign-in failed.");
      router.push(redirectTarget());
      router.refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Something went wrong.";
      setError(/unexpected end of json|invalid json/i.test(message)
        ? "The server returned an empty response. Check Render environment variables and logs."
        : message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" && <div className="auth-field"><label htmlFor="name">Your name</label><div className="auth-input-wrap"><UserRound size={16} aria-hidden="true" /><input id="name" name="name" autoComplete="name" required minLength={2} placeholder="Your name" /></div></div>}
      <div className="auth-field">
      <label htmlFor="email">Work email</label>
      <div className="auth-input-wrap"><Mail size={16} aria-hidden="true" /><input id="email" name="email" type="email" autoComplete="email" required placeholder="Email" /></div>
      </div>
      <div className="auth-field">
      <label htmlFor="password">Password</label>
      <div className="auth-input-wrap"><LockKeyhole size={16} aria-hidden="true" /><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} placeholder="Password" /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={pending}>{pending ? "Please wait…" : mode === "login" ? "Sign in" : "Get started"}<ArrowRight size={16} aria-hidden="true" /></button>
      {googleEnabled && <><div className="auth-social-divider"><span>Or sign in with</span></div><button className="secondary-button" type="button" onClick={() => signIn("google", { redirectTo: redirectTarget() })}>Continue with Google</button></>}
      <p className="auth-switch">{mode === "login" ? "New to Smark Connect?" : "Already have an account?"} <Link href={mode === "login" ? "/signup" : "/login"}>{mode === "login" ? "Create an account" : "Sign in"}</Link></p>
    </form>
  );
}

function redirectTarget() {
  const requested = new URLSearchParams(window.location.search).get("redirect");
  return requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/";
}

async function readJson<T extends Record<string, unknown>>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return { error: `The server returned an invalid response (HTTP ${response.status}). Check the Render logs.` } as unknown as T;
  }
}
