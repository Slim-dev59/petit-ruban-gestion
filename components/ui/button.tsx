import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva("btn-modern focus-ring disabled:pointer-events-none disabled:opacity-50 font-medium", {
  variants: {
    variant: {
      default: "btn-primary",
      destructive: "btn-error",
      outline: "btn-secondary border-2 hover:bg-accent hover:text-accent-foreground",
      secondary: "btn-secondary",
      ghost: "hover:bg-accent hover:text-accent-foreground transition-all duration-200",
      link: "text-primary underline-offset-4 hover:underline",
      success: "btn-success",
      warning: "btn-warning",
    },
    size: {
      default: "h-11 px-6 py-2",
      sm: "h-9 rounded-lg px-4 text-sm",
      lg: "h-12 rounded-xl px-8 text-base",
      xl: "h-14 rounded-xl px-10 text-lg",
      icon: "h-11 w-11",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
