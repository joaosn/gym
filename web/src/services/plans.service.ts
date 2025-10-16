import { apiClient } from '@/lib/api-client';
import { Plan, PlanFormData } from '@/types';

class PlansService {
  // ========================================
  // ADMIN ENDPOINTS
  // ========================================
  
  /**
   * Listar todos os planos (com filtros opcionais)
   */
  async listPlans(params?: {
    ciclo?: 'mensal' | 'trimestral' | 'anual';
    status?: 'ativo' | 'inativo';
    search?: string;
    page?: number;
  }): Promise<{ data: Plan[], total?: number }> {
    // Construir query string
    const queryParams = new URLSearchParams();
    if (params?.ciclo) queryParams.append('ciclo', params.ciclo);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/plans${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ data: Plan[], total?: number }>(endpoint);
    
    // Normalizar beneficios_json para array
    const normalized = response.data.map(plan => ({
      ...plan,
      beneficios_json: typeof plan.beneficios_json === 'string' 
        ? JSON.parse(plan.beneficios_json) 
        : plan.beneficios_json
    }));
    
    return { data: normalized, total: response.total };
  }

  /**
   * Buscar um plano por ID
   */
  async getPlano(id: string): Promise<Plan> {
    const response = await apiClient.get<{ data: Plan }>(`/admin/plans/${id}`);
    const plan = response.data;
    
    return {
      ...plan,
      beneficios_json: typeof plan.beneficios_json === 'string' 
        ? JSON.parse(plan.beneficios_json) 
        : plan.beneficios_json
    };
  }

  /**
   * Criar um novo plano
   */
  async createPlano(data: PlanFormData): Promise<Plan> {
    const payload = {
      ...data,
      beneficios_json: data.beneficios_json || []
    };
    
    const response = await apiClient.post<{ data: Plan }>('/admin/plans', payload);
    return response.data;
  }

  /**
   * Atualizar um plano existente
   */
  async updatePlano(id: string, data: Partial<PlanFormData>): Promise<Plan> {
    const response = await apiClient.put<{ data: Plan }>(`/admin/plans/${id}`, data);
    return response.data;
  }

  /**
   * Excluir um plano
   */
  async deletePlano(id: string): Promise<void> {
    await apiClient.delete(`/admin/plans/${id}`);
  }

  /**
   * Alternar status (ativo/inativo)
   */
  async toggleStatus(id: string): Promise<Plan> {
    const response = await apiClient.patch<{ data: Plan }>(`/admin/plans/${id}/status`, {});
    return response.data;
  }
}

export const plansService = new PlansService();