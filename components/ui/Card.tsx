import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export default function Card({ children, className = "", title, action }: CardProps) {
  // Определяем, используется ли темная тема по className
  const isDark = className.includes('bg-gray-800') || className.includes('bg-gray-700') || className.includes('bg-gray-900');
  const defaultBg = isDark ? 'bg-gray-800' : 'bg-white';
  const defaultBorder = isDark ? 'border-gray-700' : 'border-gray-100';
  const defaultTitleColor = isDark ? 'text-white' : 'text-gray-900';
  const defaultBorderColor = isDark ? 'border-gray-700' : 'border-gray-100';
  
  return (
    <div className={`${defaultBg} rounded-xl shadow-md border ${defaultBorder} p-6 ${className}`}>
      {(title || action) && (
        <div className={`flex items-center justify-between mb-6 pb-4 border-b ${defaultBorderColor}`}>
          {title && <h3 className={`text-lg font-bold ${defaultTitleColor}`}>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}








