import React, { ReactNode } from "react";
import { cn } from "../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-prokip-yellow hover:bg-prokip-yellow-hover text-prokip-dark shadow-lg shadow-prokip-yellow/20 focus:ring-prokip-yellow",
    outline: "border-2 border-prokip-yellow text-prokip-yellow hover:bg-prokip-dark focus:ring-prokip-yellow",
    ghost: "text-prokip-yellow hover:bg-slate-800 focus:ring-slate-700",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg font-semibold",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
