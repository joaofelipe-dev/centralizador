import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ButtonVariants";

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
    return (
        <button
            className={`cursor-pointer ${cn(buttonVariants({ variant, size, className }))}`}
            ref={ref}
            {...props}
        />
    );
});

Button.displayName = "Button";

export { Button };
