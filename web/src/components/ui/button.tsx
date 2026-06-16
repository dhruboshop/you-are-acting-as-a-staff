import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm active:scale-[0.99] rounded-[12px] font-semibold text-[16px]",
        secondary: "bg-transparent text-[#6B7280] border-none hover:bg-muted/50 rounded-[12px]",
        ghost: "bg-transparent text-[#6B7280] border-none hover:bg-muted/50",
        whatsapp: "bg-[#25D366] text-white rounded-[12px]",
        destructive: "bg-destructive text-destructive-foreground rounded-[12px]"
      },
      size: {
        default: "h-[52px] px-6",
        sm: "h-11 px-4 text-[13px] rounded-[12px]",
        lg: "h-14 px-8 text-[16px] rounded-[12px]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
