import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function CustomButton({ children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={twMerge("bg-white hover:bg-gray-200 text-black font-bold py-3 px-24 rounded-full transition-colors", className)}
    >
      {children}
    </button>
  );
}
