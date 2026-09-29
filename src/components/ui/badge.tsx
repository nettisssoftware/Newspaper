import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border border-border bg-surface-2 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-muted",
        className,
      )}
      {...props}
    />
  );
}
