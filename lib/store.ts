/**
 * Zustand store для управления состоянием приложения
 */

import { create } from "zustand";
import { User, Account, Transaction, Category, AnalyticsData } from "@/types";
import { api } from "./api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (cardNumber: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

interface DataState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  
  fetchAccounts: () => Promise<void>;
  fetchTransactions: (params?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  createAccount: (data: any) => Promise<void>;
  createTransaction: (data: any) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Auth Store — БЕЗ persist, используем только sessionStorage
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (cardNumber: string, password: string) => {
    try {
      const response = await api.login({ cardNumber, password });
      
      // Сохраняем ТОЛЬКО в sessionStorage (очищается при закрытии браузера)
      sessionStorage.setItem("token", response.token);
      sessionStorage.setItem("user", JSON.stringify(response.user));
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Ошибка входа");
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      const response = await api.register({ email, password, name });
      
      sessionStorage.setItem("token", response.token);
      sessionStorage.setItem("user", JSON.stringify(response.user));
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Ошибка регистрации");
    }
  },

  logout: () => {
    // Очищаем ВСЁ
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth-storage"); // Zustand persist
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Проверка авторизации при загрузке
  checkAuth: () => {
    const token = sessionStorage.getItem("token");
    const userStr = sessionStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
        });
        return true;
      } catch (e) {
        // Невалидные данные
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      }
    }
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    return false;
  },
}));

// Data Store
export const useDataStore = create<DataState>((set, get) => ({
  accounts: [],
  transactions: [],
  categories: [],
  analytics: null,
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.getAccounts();
      set({ accounts: response.accounts, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Ошибка загрузки счетов",
        loading: false,
      });
    }
  },

  fetchTransactions: async (params?: any) => {
    set({ loading: true, error: null });
    try {
      const response = await api.getTransactions(params);
      set({ transactions: response.transactions, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Ошибка загрузки транзакций",
        loading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await api.getCategories();
      set({ categories: response.categories });
    } catch (error: any) {
      set({ error: error.response?.data?.error || "Ошибка загрузки категорий" });
    }
  },

  fetchAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.getAnalytics();
      set({ analytics: response, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || "Ошибка загрузки аналитики",
        loading: false,
      });
    }
  },

  createAccount: async (data: any) => {
    try {
      await api.createAccount(data);
      await get().fetchAccounts();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Ошибка создания счета");
    }
  },

  createTransaction: async (data: any) => {
    try {
      await api.createTransaction(data);
      await get().fetchTransactions();
      await get().fetchAccounts();
      await get().fetchAnalytics();
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Ошибка создания транзакции"
      );
    }
  },

  refreshData: async () => {
    await Promise.all([
      get().fetchAccounts(),
      get().fetchTransactions(),
      get().fetchCategories(),
      get().fetchAnalytics(),
    ]);
  },
}));