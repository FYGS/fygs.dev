import { cn } from "@/lib/utils";

export function LoadingDots() {
  return (
    <span className="inline-flex items-center space-x-1">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "w-1.5 h-1.5 rounded-full bg-current",
            "animate-[loading_1.4s_ease-in-out_infinite]",
            "opacity-60"
          )}
          style={{
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </span>
  );
}
