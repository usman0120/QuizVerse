export function Brand({ className = "" }: { className?: string }) {
  return (
    <span
      dir="ltr"
      className={`inline-flex items-center gap-2.5 font-poppins font-semibold tracking-tight ${className}`}
    >
      <img
        src="/brand/quizverse-mark.svg"
        width={34}
        height={34}
        alt=""
        aria-hidden="true"
        className="h-8 w-8 sm:h-[34px] sm:w-[34px] shrink-0 rounded-[10px] ring-1 ring-white/15"
      />
      <span>
        Quiz<span className="text-accent">Verse</span>
      </span>
    </span>
  );
}
