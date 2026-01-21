import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md";
  
  const variants = {
    primary: "bg-bank-blue text-white hover:bg-primary-600 focus:ring-primary-500",
    secondary: "bg-gray-50 text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border border-gray-200",
    outline: "border-2 border-bank-blue text-bank-blue hover:bg-primary-50 focus:ring-primary-500",
    danger: "bg-bank-danger text-white hover:bg-red-700 focus:ring-red-500",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}








