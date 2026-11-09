import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export function firebaseServices() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };
  if (
    !config.apiKey ||
    !config.authDomain ||
    !config.projectId ||
    !config.appId
  ) {
    throw new Error(
      "Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* variables and rebuild.",
    );
  }
  const app = getApps()[0] || initializeApp(config);
  return { auth: getAuth(app), db: getFirestore(app) };
}
export function friendlyError(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
  const messages: Record<string, string> = {
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/email-already-in-use":
      "This email already has an account. Please sign in.",
    "auth/weak-password": "Choose a password of at least 8 characters.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
    "auth/popup-blocked": "Allow popups for this site to sign in with Google.",
    "auth/unauthorized-domain":
      "This domain must be added to Firebase Auth authorized domains.",
    "auth/operation-not-allowed":
      "Enable this sign-in provider in the Firebase console.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/network-request-failed": "Check your connection and try again.",
    "permission-denied":
      "Cloud sync is blocked by Firestore rules. Your progress remains saved on this device.",
    unavailable:
      "Cloud sync is unavailable. Your progress remains saved on this device.",
  };
  return (
    messages[code] ||
    (error instanceof Error && !code
      ? error.message
      : "Something went wrong. Please try again.")
  );
}
