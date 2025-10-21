import { apiClient } from '@/lib/api-client';
import type { Notificacao, NotificacaoFormData, NotificacaoFilters } from '@/types';

class NotificationsService {
  private baseUrl = '/notifications';

  /**
   * Listar notificações do usuário logado
   */
  async list(filters?: NotificacaoFilters): Promise<{ data: Notificacao[] }> {
    const params = new URLSearchParams();
    if (filters?.lida) params.append('lida', filters.lida);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    return await apiClient.get<{ data: Notificacao[] }>(url);
  }

  /**
   * Obter contagem de notificações não lidas
   */
  async getUnreadCount(): Promise<{ count: number }> {
    return await apiClient.get<{ count: number }>(`${this.baseUrl}/unread-count`);
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/${id}/read`, {});
  }

  /**
   * Marcar todas como lidas
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.post(`${this.baseUrl}/mark-all-read`, {});
  }

  /**
   * Deletar notificação
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * ADMIN: Criar notificação manual
   */
  async createManual(data: NotificacaoFormData): Promise<{ data: Notificacao }> {
    // Endpoint admin dedicado
    return await apiClient.post<{ data: Notificacao }>(`/admin/notifications`, data);
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
