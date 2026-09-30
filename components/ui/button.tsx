import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-c4c-cobalt focus-visible:ring-offset-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // "Anchor" is the default — the safe, brand-consistent look for any
        // button that doesn't specify a variant. Coral ("spotlight") is
        // opt-in only: the one brand rule is it appears once per screen, so
        // it must never be what an unlabelled <Button> falls back to.
        default:
          "border-2 border-c4c-petrol bg-white font-title font-semibold text-[0.8125rem] uppercase tracking-[0.06em] text-c4c-petrol hover:bg-c4c-petrol hover:text-white",
        anchor:
          "border-2 border-c4c-petrol bg-white font-title font-semibold text-[0.8125rem] uppercase tracking-[0.06em] text-c4c-petrol hover:bg-c4c-petrol hover:text-white",
        spotlight:
          "border-2 border-transparent bg-c4c-coral font-title font-semibold text-[0.8125rem] uppercase tracking-[0.06em] text-black hover:bg-c4c-petrol hover:text-white",
        quiet:
          "border-2 border-c4c-rule bg-white font-title font-semibold text-[0.8125rem] uppercase tracking-[0.06em] text-black hover:border-black",
        muted:
          "border-2 border-c4c-rule bg-white font-title font-semibold text-[0.8125rem] uppercase tracking-[0.06em] text-c4c-petrol",
        destructive:
          "border-2 border-transparent bg-destructive font-title font-semibold text-[0.8125rem] uppercase tracking-[0.06em] text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-c4c-rule bg-white font-title font-semibold text-[0.8125rem] uppercase tracking-[0.06em] text-black hover:border-black",
        secondary:
          "border-2 border-c4c-petrol bg-white font-title font-semibold text-[0.8125rem] uppercase tracking-[0.06em] text-c4c-petrol hover:bg-c4c-petrol hover:text-white",
        // Ghost/link keep their existing (non-uppercase) typography — they
        // cover icon buttons, menu items and inline actions elsewhere in
        // the app that the mockup's CTA-button treatment was never meant
        // for. They still inherit brand colours via the tokens above.
        ghost: "text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        link: "text-sm font-medium text-c4c-petrol underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-6 py-3",
        sm: "min-h-9 px-4 text-[0.6875rem]",
        lg: "min-h-11 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
