"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "outline";
  hover?: boolean;
  selected?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "glass",
      hover = false,
      selected = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "rounded-2xl p-6 transition-all duration-300";

    const variants = {
      glass: "glass",
      solid: "bg-dark-800 border border-dark-700",
      outline: "border border-dark-700 bg-transparent",
    };

    const hoverStyles = hover ? "hover:bg-white/10 cursor-pointer" : "";
    const selectedStyles = selected
      ? "border-2 border-primary-500 ring-2 ring-primary-500/30"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          hoverStyles,
          selectedStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
