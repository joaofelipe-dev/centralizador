import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/Button/ButtonVariants";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "ghost"
    | "outline"
    | "glass"
    | "glass-outline"
    | "destructive"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = "default", size = "default", fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
