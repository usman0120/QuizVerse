"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { firebaseServices, friendlyError } from "@/lib/firebase";
import { useApp } from "./provider";
import { Icon, Notice, PageHeading } from "./ui";

export function AuthForm() {
  const app = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function authenticate(google = false) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { auth } = firebaseServices();
      await setPersistence(auth, browserLocalPersistence);
      if (google) {
        await signInWithPopup(auth, new GoogleAuthProvider());
        router.replace("/account");
      } else if (mode === "reset") {
        await sendPasswordResetEmail(auth, email);
        setMessage(
          "If this email is registered, a reset link has been sent. Check your inbox and spam folder.",
        );
      } else if (mode === "register") {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(result.user, { displayName: name.trim() });
        try {
          await sendEmailVerification(result.user);
        } catch {
          /* Account exists even if verification email delivery fails; allow resend from profile. */
        }
        router.replace("/account");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.replace("/account");
      }
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
      setPassword("");
    }
  }
  return (
    <div className="page max-w-xl">
      <PageHeading
        title={
          mode === "register"
            ? "Create Your Account"
            : mode === "reset"
              ? "Reset Your Password"
              : "Welcome Back"
        }
        description="Sign in to sync your quiz results, favorites, and preferences across devices."
      />
      <section className="panel">
        {app.user ? (
          <Notice>
            You’re signed in.{" "}
            <Link className="underline" href="/account">
              View your profile
            </Link>
            .
          </Notice>
        ) : (
          <>
            <button
              className="btn-secondary w-full mb-6"
              disabled={busy || !app.ready}
              onClick={() => {
                void authenticate(true);
              }}
            >
              Continue with Google
            </button>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              or use your email
            </p>
            <form
              className="grid gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                void authenticate();
              }}
            >
              {mode === "register" && (
                <label>
                  Display name
                  <input
                    className="field"
                    required
                    minLength={2}
                    maxLength={60}
                    autoComplete="nickname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}
              <label>
                Email
                <input
                  className="field"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              {mode !== "reset" && (
                <label>
                  Password
                  <input
                    className="field"
                    type="password"
                    required
                    minLength={mode === "register" ? 8 : 1}
                    autoComplete={
                      mode === "register" ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              )}
              <button className="btn w-full" disabled={busy || !app.ready}>
                <Icon name="lock" />
                {busy
                  ? "Please wait…"
                  : mode === "register"
                    ? "Create Account"
                    : mode === "reset"
                      ? "Send Reset Link"
                      : "Sign In"}
              </button>
            </form>
            <div className="flex flex-wrap justify-between gap-3 text-sm mt-6">
              <button
                onClick={() => {
                  setMode(mode === "register" ? "login" : "register");
                  setError("");
                  setMessage("");
                }}
              >
                {mode === "register"
                  ? "Already have an account?"
                  : "Create an account"}
              </button>
              <button
                onClick={() => {
                  setMode(mode === "reset" ? "login" : "reset");
                  setError("");
                  setMessage("");
                }}
              >
                {mode === "reset" ? "Back to sign in" : "Forgot password?"}
              </button>
            </div>
          </>
        )}
        {error && <Notice error>{error}</Notice>}
        {message && <Notice>{message}</Notice>}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Firebase securely handles authentication. Your password is never
          stored in your QuizVerse profile. On shared devices, clear your local
          account cache after signing out.
        </p>
        <Link href="/quizzes" className="btn-secondary w-full mt-5">
          Continue as Guest
        </Link>
      </section>
    </div>
  );
}
