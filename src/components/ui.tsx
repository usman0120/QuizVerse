"use client";

import { useEffect, useRef, useState } from "react";
import type { Localized } from "@/lib/types";
import { useApp } from "./provider";

export const CONTACT_URL = "https://usman-portfolio-silk.vercel.app/contact";
export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return <i aria-hidden="true" className={`fas fa-${name} ${className}`} />;
}
export function Text({ en, ur }: Localized) {
  const { settings } = useApp();
  return <>{settings.language === "ur" ? ur || en : en}</>;
}
export function PageHeading({
  title,
  description,
}: {
  title: Localized;
  description?: Localized;
}) {
  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl md:text-4xl font-bold text-brand dark:text-secondary mb-4">
        <Text {...title} />
      </h1>
      {description && (
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          <Text {...description} />
        </p>
      )}
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <p
      role={error ? "alert" : "status"}
      className={`rounded-lg p-3 my-3 text-sm ${error ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200" : "bg-brand/10 text-brand dark:text-green-200"}`}
    >
      {children}
    </p>
  );
}
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="rounded-2xl p-6 w-[min(94vw,36rem)] max-h-[90vh] overflow-auto bg-white text-textDark dark:bg-gray-800 dark:text-white backdrop:bg-black/60"
    >
      <div className="flex justify-between gap-4 items-center mb-5">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          className="icon-btn"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <Icon name="times" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Media({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || !src.startsWith("https://") || failedSrc === src)
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-r from-brand/20 to-secondary/30 flex items-center justify-center ${className}`}
      >
        <Icon name="book-open" className="text-4xl text-brand" />
      </div>
    );
  return (
    <img
      src={src}
      key={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}
export function downloadText(
  filename: string,
  text: string,
  type = "text/plain",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function shareText(
  title: string,
  text: string,
  url = window.location.href,
) {
  if (navigator.share) await navigator.share({ title, text, url });
  else if (navigator.clipboard)
    await navigator.clipboard.writeText(`${text}\n${url}`);
  else throw new Error("Sharing is unavailable. Use Download instead.");
}
export async function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const confetti = (await import("canvas-confetti")).default;
  confetti({
    particleCount: 90,
    spread: 65,
    colors: ["#2D6A4F", "#40916C", "#FFB703"],
  });
}
export async function downloadCard(
  title: string,
  lines: string[],
  filename: string,
) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 650;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image download is unavailable.");
  const gradient = context.createLinearGradient(0, 0, 1000, 650);
  gradient.addColorStop(0, "#2D6A4F");
  gradient.addColorStop(1, "#40916C");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1000, 650);
  context.textAlign = "center";
  context.fillStyle = "#FFB703";
  context.font = "bold 40px Poppins, sans-serif";
  context.fillText("QuizVerse", 500, 80);
  context.fillStyle = "#FFFFFF";
  context.font = "bold 30px Poppins, sans-serif";
  const allLines: string[] = [];
  for (const text of [title, ...lines]) {
    let line = "";
    for (const word of text.split(" ")) {
      const candidate = `${line} ${word}`.trim();
      if (context.measureText(candidate).width > 850 && line) {
        allLines.push(line);
        line = word;
      } else line = candidate;
    }
    allLines.push(line);
  }
  allLines
    .slice(0, 9)
    .forEach((text, i) => context.fillText(text, 500, 155 + i * 46));
  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}
