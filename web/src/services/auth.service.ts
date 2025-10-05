import { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

class AuthService {
  // Mock login - simula diferentes tipos de usuário baseado no email
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Determina o tipo de usuário baseado no email
    let role: 'aluno' | 'personal' | 'admin' = 'aluno';
    if (credentials.email.toLowerCase().includes('admin')) {
      role = 'admin';
    } else if (credentials.email.toLowerCase().includes('personal')) {
      role = 'personal';
    }

    // Simula resposta da API
    const mockResponse: AuthResponse = {
      user: {
        id: '1',
        name: credentials.email.split('@')[0],
        email: credentials.email,
        role: role,
        createdAt: new Date().toISOString()
      },
      access_token: `mock_token_${Date.now()}`
    };

    localStorage.setItem('access_token', mockResponse.access_token);
    localStorage.setItem('user_data', JSON.stringify(mockResponse.user));
    
    return mockResponse;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Novos usuários são sempre alunos por padrão
    const mockResponse: AuthResponse = {
      user: {
        id: '1',
        name: data.name,
        email: data.email,
        role: 'aluno',
        createdAt: new Date().toISOString()
      },
      access_token: `mock_token_${Date.now()}`
    };

    localStorage.setItem('access_token', mockResponse.access_token);
    localStorage.setItem('user_data', JSON.stringify(mockResponse.user));
    
    return mockResponse;
  }

  async getCurrentUser(): Promise<User> {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      throw new Error('User not found');
    }
    return JSON.parse(userData);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    window.location.href = '/';
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();