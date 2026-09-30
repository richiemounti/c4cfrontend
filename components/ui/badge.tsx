import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// The homepage/App Mockup "tag" — pale 20% tint, black type always (accent
// colours are never used for type, p.8), square. Each brand-guideline
// status colour gets its own named variant; `default`/`secondary` alias to
// the closest one so existing unlabelled <Badge>s stay sensible.
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border border-transparent font-title text-[10.5px] font-semibold uppercase tracking-[0.09em] whitespace-nowrap px-2.5 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-c4c-cobalt focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-c4c-tint-cyan text-black",
        phase: "bg-c4c-tint-cyan text-black",
        done: "bg-c4c-tint-sage text-black",
        attention: "bg-c4c-tint-gold text-black",
        now: "bg-c4c-tint-coral text-black",
        quiet: "bg-c4c-grey-bg text-black",
        secondary: "bg-c4c-grey-bg text-black",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "text-black border-c4c-rule",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
