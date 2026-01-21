"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Проверяем ТОЛЬКО sessionStorage
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");
    
    if (!token || !user) {
      // Очищаем всё на всякий случай
      sessionStorage.clear();
      localStorage.removeItem("auth-storage");
      router.replace("/login");
    } else {
      setIsAuthorized(true);
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Идёт редирект
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 pt-16 p-6 bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}