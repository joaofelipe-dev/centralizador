"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface NavbarProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  position?: "top" | "bottom";
  sticky?: boolean;
  maxWidth?: string;
}

export const Navbar = ({
  children,
  className,
  containerClassName,
  position = "bottom",
  sticky = false,
  maxWidth = "max-w-[1600px]"
}: NavbarProps) => {
  const isTop = position === "top";

  return (
    <nav
      className={cn(
        "w-full z-[90] bg-background/80 backdrop-blur-xl border-border",
        sticky ? "sticky top-0" : "relative",
        isTop ? "border-b" : "bottom-0 left-0 right-0 border-t h-20",
        !isTop && "pb-safe animate-in slide-in-from-bottom duration-500",
        className
      )}
    >
      <div className={cn(
        "w-full h-full flex items-center",
        isTop ? cn("mx-auto h-16  px-6 justify-between", maxWidth) : "justify-around",
        containerClassName
      )}>
        {children}
      </div>
    </nav>
  );
};