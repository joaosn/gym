import { apiClient } from '@/lib/api-client';
import type {
  Assinatura,
  AssinarPlanoRequest,
  AssinaturaFormData,
} from '@/types';

class SubscriptionsService {
  /**
   * ADMIN: Listar todas as assinaturas
   */
  async list(filters?: {
    status?: string;
    id_usuario?: string;
    id_plano?: string;
    search?: string;
    page?: number;
  }): Promise<{ data: Assinatura[]; meta: any }> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.id_usuario) params.append('id_usuario', filters.id_usuario);
    if (filters?.id_plano) params.append('id_plano', filters.id_plano);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await apiClient.get(
      `/admin/subscriptions${params.toString() ? `?${params.toString()}` : ''}`
    ) as any;

    return {
      data: (response.data || []).map((item: any) => this.normalizeSubscription(item)),
      meta: {
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      },
    };
  }

  /**
   * ALUNO: Ver minha assinatura ativa
   */
  async getMySubscription(): Promise<Assinatura | null> {
    try {
      const response = await apiClient.get('/subscriptions/me') as any;
      
      // O backend retorna: { data: { ... } } quando tem assinatura
      const subscription = response.data || response;
      
      if (!subscription) {
        return null;
      }

      return this.normalizeSubscription(subscription);
    } catch (error: any) {
      // Se retornar 404, significa que não tem assinatura ativa
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * ALUNO: Assinar um plano
   */
  async subscribe(data: AssinarPlanoRequest): Promise<Assinatura> {
    const response = await apiClient.post('/subscriptions', data) as any;
    return this.normalizeSubscription(response.data.data);
  }

  /**
   * ALUNO: Cancelar minha assinatura
   */
  async cancel(): Promise<void> {
    await apiClient.delete('/subscriptions/me');
  }

  /**
   * ADMIN: Criar assinatura para qualquer usuário
   */
  async adminCreate(data: { id_usuario: string; id_plano: string; renova_automatico?: boolean }): Promise<Assinatura> {
    const response = await apiClient.post('/admin/subscriptions', data) as any;
    return this.normalizeSubscription(response.data.data);
  }

  /**
   * ADMIN: Atualizar assinatura
   */
  async update(id: string, data: AssinaturaFormData): Promise<Assinatura> {
    const response = await apiClient.put(`/admin/subscriptions/${id}`, data) as any;
    return this.normalizeSubscription(response.data.data);
  }

  /**
   * Normalizar assinatura (conversões de tipos)
   */
  private normalizeSubscription(subscription: any): Assinatura {
    if (!subscription) return subscription;
    
    return {
      ...subscription,
      id_assinatura: String(subscription.id_assinatura),
      id_usuario: String(subscription.id_usuario),
      id_plano: String(subscription.id_plano),
      // Preservar objetos aninhados (usuario, plano) vindos do backend
      usuario: subscription.usuario || null,
      plano: subscription.plano || null,
    };
  }
}

export const subscriptionsService = new SubscriptionsService();
