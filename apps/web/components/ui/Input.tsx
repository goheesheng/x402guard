"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-dark-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full p-4 bg-dark-800 rounded-xl border border-dark-700",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            "transition-all duration-200 placeholder:text-dark-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-dark-500 text-xs mt-2">{hint}</p>
        )}
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-dark-200">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full p-4 bg-dark-800 rounded-xl border border-dark-700",
            "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            "transition-all duration-200 placeholder:text-dark-500 resize-none",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-dark-500 text-xs mt-2">{hint}</p>
        )}
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
