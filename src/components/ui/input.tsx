import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  prefix,
  ...props
}: React.ComponentProps<"input"> & { prefix?: React.ReactNode }) {
  if (prefix) {
    return (
      <div
        className={cn(
          "flex h-9 w-full min-w-0 items-center gap-2 rounded-4xl border border-input bg-input/30 px-3 text-base transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-[input:disabled]:pointer-events-none has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 has-[input:aria-invalid]:border-destructive has-[input:aria-invalid]:ring-[3px] has-[input:aria-invalid]:ring-destructive/20 dark:has-[input:aria-invalid]:border-destructive/50 dark:has-[input:aria-invalid]:ring-destructive/40",
          className
        )}
      >
        <span className="shrink-0 text-sm text-muted-foreground">{prefix}</span>
        <input
          type={type}
          data-slot="input"
          className="h-full min-w-0 flex-1 bg-transparent py-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm"
          {...props}
        />
      </div>
    )
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
