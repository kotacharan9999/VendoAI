const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vendo_token");
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch (e) {
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request<any>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    me: () => this.request<any>("/api/auth/me"),
  };

  dashboard = {
    get: () => this.request<any>("/api/dashboard"),
  };

  products = {
    list: (params?: { category?: string; search?: string; risk_level?: string }) => {
      const q = new URLSearchParams();
      if (params?.category) q.set("category", params.category);
      if (params?.search) q.set("search", params.search);
      if (params?.risk_level) q.set("risk_level", params.risk_level);
      return this.request<any[]>(`/api/products?${q.toString()}`);
    },
    get: (id: string) => this.request<any>(`/api/products/${id}`),
    create: (data: any) =>
      this.request<any>("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  inventory = {
    list: (params?: { risk_level?: string }) => {
      const q = new URLSearchParams();
      if (params?.risk_level) q.set("risk_level", params.risk_level);
      return this.request<any[]>(`/api/inventory?${q.toString()}`);
    },
    getMovements: (productId?: string) => {
      const q = new URLSearchParams();
      if (productId) q.set("product_id", productId);
      return this.request<any[]>(`/api/inventory/movements?${q.toString()}`);
    },
  };

  forecasts = {
    list: (productId?: string) => {
      const q = new URLSearchParams();
      if (productId) q.set("product_id", productId);
      return this.request<any[]>(`/api/forecasts?${q.toString()}`);
    },
    generate: (data: { product_id: string; horizon_days?: number }) =>
      this.request<any>("/api/forecasts/generate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  suppliers = {
    list: () => this.request<any[]>("/api/suppliers"),
    get: (id: string) => this.request<any>(`/api/suppliers/${id}`),
    getQuotes: (params?: { product_id?: string; supplier_id?: string }) => {
      const q = new URLSearchParams();
      if (params?.product_id) q.set("product_id", params.product_id);
      if (params?.supplier_id) q.set("supplier_id", params.supplier_id);
      return this.request<any[]>(`/api/suppliers/quotes?${q.toString()}`);
    },
  };

  negotiations = {
    list: (params?: { product_id?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.product_id) q.set("product_id", params.product_id);
      if (params?.status) q.set("status", params.status);
      return this.request<any[]>(`/api/negotiations?${q.toString()}`);
    },
    get: (id: string) => this.request<any>(`/api/negotiations/${id}`),
    counter: (id: string, data: { offer_price: number; shipping_cost?: number; payment_terms?: string; message_text: string }) =>
      this.request<any>(`/api/negotiations/${id}/counter`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  opportunities = {
    list: (params?: { urgency?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.urgency) q.set("urgency", params.urgency);
      if (params?.status) q.set("status", params.status);
      return this.request<any[]>(`/api/opportunities?${q.toString()}`);
    },
  };

  purchaseOrders = {
    list: (params?: { status?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set("status", params.status);
      return this.request<any[]>(`/api/purchase-orders?${q.toString()}`);
    },
    get: (id: string) => this.request<any>(`/api/purchase-orders/${id}`),
  };

  approvals = {
    list: (params?: { status?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set("status", params.status);
      return this.request<any[]>(`/api/approvals?${q.toString()}`);
    },
    approve: (id: string, comments?: string) =>
      this.request<any>(`/api/approvals/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ status: "APPROVED", comments }),
      }),
    reject: (id: string, comments?: string) =>
      this.request<any>(`/api/approvals/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ status: "REJECTED", comments }),
      }),
  };

  analytics = {
    get: () => this.request<any>("/api/analytics"),
  };

  agents = {
    list: () => this.request<any[]>("/api/agents"),
    run: (data: { agent_name: string; product_id?: string }) =>
      this.request<any>("/api/agents/run", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  activity = {
    list: () => this.request<any[]>("/api/activity"),
    getAudit: () => this.request<any[]>("/api/activity/audit"),
  };

  notifications = {
    list: () => this.request<any[]>("/api/notifications"),
    markRead: (id: string) =>
      this.request<any>(`/api/notifications/${id}/read`, {
        method: "POST",
      }),
  };

  settings = {
    get: () => this.request<any>("/api/settings"),
    update: (data: any) =>
      this.request<any>("/api/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  };

  demo = {
    run: () =>
      this.request<any>("/api/demo/run", {
        method: "POST",
      }),
  };

  dataHealth = {
    get: () => this.request<any>("/api/data-health"),
  };
}

export const api = new ApiClient();
