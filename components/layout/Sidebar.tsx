"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navigation: NavItem[] = [
  { name: "Дашборд", href: "/dashboard", icon: "📊" },
  { name: "Счета", href: "/accounts", icon: "💳" },
  { name: "Транзакции", href: "/transactions", icon: "📋" },
  { name: "Аналитика", href: "/analytics", icon: "📈" },
  { name: "Ассистент", href: "/assistant", icon: "💼" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen fixed left-0 top-0 pt-16">
      {/* User Profile Card */}
      <div className="p-4 mb-4">
        <div className="bg-gray-700 rounded-xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-bank-blue rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">А</span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">Айнур Русланович</p>
            <p className="text-gray-400 text-xs">Основной счет</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-bank-blue text-white font-medium shadow-lg"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Open New Product Button */}
      <div className="p-4 mt-auto">
        <button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-xl px-4 py-3 flex items-center justify-center space-x-2 transition-all">
          <span className="text-xl">+</span>
          <span className="text-sm font-medium">Открыть новый продукт</span>
        </button>
      </div>
    </aside>
  );
}



