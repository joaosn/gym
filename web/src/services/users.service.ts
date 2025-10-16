import { apiClient } from '@/lib/api-client';
import { AdminUser, UserFormData } from '@/types';

class UsersService {
  // ========================================
  // ADMIN ENDPOINTS
  // ========================================
  
  /**
   * Listar todos os usuários (com filtros opcionais)
   */
  async listUsers(params?: {
    papel?: 'admin' | 'aluno' | 'personal' | 'instrutor';
    status?: 'ativo' | 'inativo';
    search?: string;
    page?: number;
  }): Promise<{ data: AdminUser[], total?: number }> {
    // Construir query string
    const queryParams = new URLSearchParams();
    if (params?.papel) queryParams.append('papel', params.papel);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ data: AdminUser[], total?: number }>(endpoint);
    
    return { data: response.data, total: response.total };
  }

  /**
   * Buscar um usuário por ID
   */
  async getUser(id: string): Promise<AdminUser> {
    const response = await apiClient.get<{ data: AdminUser }>(`/admin/users/${id}`);
    return response.data;
  }

  /**
   * Criar um novo usuário
   */
  async createUser(data: UserFormData): Promise<AdminUser> {
    const response = await apiClient.post<{ data: AdminUser }>('/admin/users', data);
    return response.data;
  }

  /**
   * Atualizar um usuário existente
   */
  async updateUser(id: string, data: Partial<UserFormData>): Promise<AdminUser> {
    const response = await apiClient.put<{ data: AdminUser }>(`/admin/users/${id}`, data);
    return response.data;
  }

  /**
   * Excluir um usuário
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  }

  /**
   * Alternar status (ativo/inativo)
   */
  async toggleStatus(id: string): Promise<AdminUser> {
    const response = await apiClient.patch<{ data: AdminUser }>(`/admin/users/${id}/status`, {});
    return response.data;
  }
}

export const usersService = new UsersService();
