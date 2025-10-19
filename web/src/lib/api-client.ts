const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 🎯 Classe de erro customizada para preservar errors de validação
class ApiError extends Error {
  public errors?: Record<string, string[]>;
  public statusCode?: number;

  constructor(message: string, errors?: Record<string, string[]>, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
    this.statusCode = statusCode;
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      
      if (response.status === 501) {
        throw new Error('Feature not implemented yet');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 🎯 Lançar erro customizado com errors preservados
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          errorData.errors, // ← Preservar errors de validação
          response.status
        );
      }

      // Se for 204 No Content, não tentar parsear JSON
      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error; // ← Re-throw ApiError preservando dados
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
      const queryString = query.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Exportar classe de erro para uso externo
export { ApiError };
export const apiClient = new ApiClient();