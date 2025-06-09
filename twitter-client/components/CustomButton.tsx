import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function CustomButton({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-24 rounded-full transition-colors"
    >
      {children}
    </button>
  );
}
