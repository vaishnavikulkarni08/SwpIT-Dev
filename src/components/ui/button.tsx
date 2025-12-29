import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 swap-shadow-button hover:swap-shadow-soft active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 swap-shadow-button active:scale-95",
        ghost: 
          "hover:bg-muted hover:text-foreground active:scale-95",
        link: 
          "text-primary underline-offset-4 hover:underline",
        hero:
          "swap-gradient-hero text-primary-foreground hover:opacity-90 swap-shadow-button hover:swap-shadow-glow active:scale-95 transform hover:-translate-y-0.5",
        coral:
          "bg-swap-coral text-primary-foreground hover:bg-swap-coral/90 swap-shadow-button active:scale-95",
        gold:
          "bg-swap-gold text-accent-foreground hover:bg-swap-gold/90 swap-shadow-button active:scale-95",
        teal:
          "bg-swap-teal text-primary-foreground hover:bg-swap-teal/90 swap-shadow-button active:scale-95",
        "teal-outline":
          "border-2 border-swap-teal bg-transparent text-swap-teal hover:bg-swap-teal hover:text-primary-foreground active:scale-95",
        "coral-outline":
          "border-2 border-swap-coral bg-transparent text-swap-coral hover:bg-swap-coral hover:text-primary-foreground active:scale-95",
        soft:
          "bg-swap-teal-light text-swap-teal hover:bg-swap-teal/20 active:scale-95",
        "soft-coral":
          "bg-swap-coral-light text-swap-coral hover:bg-swap-coral/20 active:scale-95",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
