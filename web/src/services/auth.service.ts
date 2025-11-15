import { User } from '@/types';
import { apiClient } from '@/lib/api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

class AuthService {
  /**
   * Login com API real
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Limpar dados antigos ANTES de salvar novos
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    
    // Salvar novos dados
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user_data', JSON.stringify(response.user));
    
    // Disparar evento para atualizar em tempo real
    window.dispatchEvent(new CustomEvent('auth:login', { detail: response.user }));
    
    return response;
  }

  /**
   * Registro de novo usuário
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    // Limpar dados antigos ANTES de salvar novos
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    
    // Salvar novos dados
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user_data', JSON.stringify(response.user));
    
    // Disparar evento para atualizar em tempo real
    window.dispatchEvent(new CustomEvent('auth:login', { detail: response.user }));
    
    return response;
  }

  /**
   * Obter dados do usuário autenticado
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    localStorage.setItem('user_data', JSON.stringify(response.user));
    return response.user;
  }

  async getCurrentUserPersonal(): Promise<User> {
    const response = await apiClient.get<{ user: User }>('/personal-sessions/instructor/me');
    localStorage.setItem('user_data', JSON.stringify(response.user));
    return response.user;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      window.location.href = '/';
    }
  }

  /**
   * Obter token do localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Obter usuário do localStorage
   */
  getUserFromStorage(): User | null {
    const userData = localStorage.getItem('user_data');
    
    // Lidar com caso onde 'undefined' foi salvo como string
    if (!userData || userData === 'undefined' || userData === 'null') {
      localStorage.removeItem('user_data');
      return null;
    }
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.warn('❌ Erro ao parsear user_data:', error);
      localStorage.removeItem('user_data');
      return null;
    }
  }
}

export const authService = new AuthService();