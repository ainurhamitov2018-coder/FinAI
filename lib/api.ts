/**
 * API клиент для работы с Backend
 */

import axios, { AxiosInstance, AxiosError } from "axios";

const API_URL = (typeof window !== 'undefined' && window.location?.origin) || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor для добавления токена
    this.client.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        // ТОЛЬКО sessionStorage
        const token = sessionStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Interceptor для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ error: string }>) => {
        if (error.response?.status === 401) {
          if (typeof window !== "undefined") {
            sessionStorage.clear();
            localStorage.removeItem("auth-storage");
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: { email: string; password: string; name: string }) {
    const response = await this.client.post("/auth/register", data);
    return response.data;
  }

  async login(data: { email?: string; cardNumber?: string; password: string }) {
    const response = await this.client.post("/auth/login", data);
    return response.data;
  }

  // Accounts endpoints
  async getAccounts() {
    const response = await this.client.get("/accounts");
    return response.data;
  }

  async getAccount(id: string) {
    const response = await this.client.get(`/accounts/${id}`);
    return response.data;
  }

  async createAccount(data: {
    name: string;
    balance?: number;
    currency?: string;
    type: "checking" | "savings" | "credit";
  }) {
    const response = await this.client.post("/accounts", data);
    return response.data;
  }

  async deleteAccount(id: string) {
    const response = await this.client.delete(`/accounts/${id}`);
    return response.data;
  }

  // Transactions endpoints
  async getTransactions(params?: {
    accountId?: string;
    type?: "income" | "expense";
    limit?: number;
    offset?: number;
  }) {
    const response = await this.client.get("/transactions", { params });
    return response.data;
  }

  async createTransaction(data: {
    accountId: string;
    amount: number;
    type: "income" | "expense";
    categoryId: string;
    description: string;
    date: string;
  }) {
    const response = await this.client.post("/transactions", data);
    return response.data;
  }

  // Analytics endpoints
  async getAnalytics(params?: { startDate?: string; endDate?: string }) {
    const response = await this.client.get("/analytics", { params });
    return response.data;
  }

  // AI Analysis endpoints
  async analyzeFinancialData(params?: { accountId?: string; period?: string }) {
    const response = await this.client.post("/assistant/analyze", params);
    return response.data;
  }

  async getSavingsAdvice(params?: { accountId?: string }) {
    const response = await this.client.post("/assistant/savings", params);
    return response.data;
  }

  async getForecast(params?: { 
    accountId?: string; 
    months?: number;
  }) {
    const response = await this.client.post("/assistant/forecast", params);
    return response.data;
  }

  async getInvestmentAdvice(params?: {
    availableMoney: number;
    savingsRate: number;
    riskTolerance: "low" | "medium" | "high";
  }) {
    const response = await this.client.post("/assistant/investment", params);
    return response.data;
  }

  // Categories endpoints
  async getCategories(type?: "income" | "expense") {
    const response = await this.client.get("/categories", {
      params: type ? { type } : {},
    });
    return response.data;
  }
}

export const api = new ApiClient();