"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export interface PageNavProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageNav = ({
  title,
  description,
  icon,
  backHref,
  onBack,
  actions,
  children,
}: PageNavProps) => {
  const router = useRouter();
  const showBack = Boolean(backHref || onBack);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    }
  };

  return (
    <Navbar
      position="top"
      sticky
      className="z-[80]"
      containerClassName="flex-col h-auto items-stretch px-0"
    >
      <div className="flex items-center justify-between min-h-14 px-4 md:px-6 py-2">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              className="h-11 w-11 rounded-md border border-border bg-card flex items-center justify-center hover:bg-surface-hover transition-colors shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          {icon && (
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-bold tracking-tight text-foreground truncate">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-muted-foreground leading-tight truncate">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
      {children}
    </Navbar>
  );
};
