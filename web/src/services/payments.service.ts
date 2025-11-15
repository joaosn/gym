import { apiClient } from '../lib/api-client';
import type {
  Cobranca,
  CobrancaParcela,
  Pagamento,
  CheckoutRequest,
  CheckoutResponse,
  PaymentHistoryFilters,
  AdminPaymentFilters,
} from '../types';

export class PaymentsService {
  /**
   * STUDENT ENDPOINTS
   */

  /**
   * Obter cobranças pendentes do aluno logado
   */
  async getMyPendingCharges(): Promise<Cobranca[]> {
    const response = await apiClient.get<{ data: Cobranca[] }>('/payments/pending');
    return response.data;
  }

  /**
   * Obter detalhes de uma parcela
   */
  async getParcela(idParcela: string): Promise<CobrancaParcela> {
    const response = await apiClient.get<{ data: CobrancaParcela }>(
      `/payments/parcelas/${idParcela}`
    );
    return response.data;
  }

  /**
   * Criar cobrança manual (para teste)
   */
  async createManualCharge(data: {
    descricao: string;
    valor: number;
    vencimento: string;
    observacoes?: string;
  }): Promise<Cobranca> {
    const response = await apiClient.post<{ data: Cobranca }>(
      '/payments/create-charge',
      data
    );
    return response.data;
  }

  /**
   * Obter histórico de pagamentos do aluno logado
   */
  async getMyHistory(filters?: PaymentHistoryFilters): Promise<{
    data: Cobranca[];
    total: number;
    current_page: number;
    last_page: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') {
      params.set('status', filters.status);
    }
    if (filters?.page) {
      params.set('page', String(filters.page));
    }
    if (filters?.per_page) {
      params.set('per_page', String(filters.per_page));
    }

    const queryString = params.toString();
    const url = `/payments/history${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<{
      data: Cobranca[];
      total: number;
      current_page: number;
      last_page: number;
    }>(url);

    return response;
  }

  /**
   * Criar checkout para uma parcela
   */
  async createCheckout(
    idParcela: string,
    request?: CheckoutRequest
  ): Promise<CheckoutResponse> {
    const response = await apiClient.post<{ data: CheckoutResponse }>(
      `/payments/checkout/${idParcela}`,
      request || { provedor: 'simulacao' }
    );
    return response.data;
  }

  /**
   * Aprovar pagamento simulado (apenas para provedor 'simulacao')
   */
  async approveSimulation(idPagamento: string): Promise<Pagamento> {
    const response = await apiClient.post<{ data: Pagamento }>(
      `/payments/${idPagamento}/approve`
    );
    return response.data;
  }

  /**
   * Criar checkout Mercado Pago para uma parcela
   */
  async createCheckoutMercadoPago(idParcela: string): Promise<{ pagamento: Pagamento; url_checkout?: string }> {
    const response = await apiClient.post<{ data: { pagamento: Pagamento; url_checkout?: string } }>(
      `/payments/checkout/mp/${idParcela}`,
      {}
    );
    return response.data;
  }

  /**
   * ADMIN: criar link de pagamento para uma cobrança (usa 1ª parcela pendente)
   */
  async adminCreateCheckoutLink(idCobranca: string): Promise<{ url_checkout: string }> {
    const response = await apiClient.post<{ data: { url_checkout: string } }>(
      `/admin/payments/${idCobranca}/create-checkout`,
      {}
    );
    return response.data;
  }

  /**
   * ADMIN: marcar cobrança como paga (aprovação imediata via simulação)
   */
  async adminMarkAsPaid(idCobranca: string): Promise<Cobranca> {
    const response = await apiClient.post<{ data: Cobranca }>(
      `/admin/payments/${idCobranca}/mark-paid`,
      {}
    );
    return response.data;
  }

  /**
   * ADMIN ENDPOINTS
   */

  /**
   * Listar todas as cobranças (admin)
   */
  async listAll(filters?: AdminPaymentFilters): Promise<{
    data: Cobranca[];
    total: number;
    current_page: number;
    last_page: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') {
      params.set('status', filters.status);
    }
    if (filters?.tipo && filters.tipo !== 'all') {
      params.set('tipo', filters.tipo);
    }
    if (filters?.search) {
      params.set('search', filters.search);
    }
    if (filters?.page) {
      params.set('page', String(filters.page));
    }
    if (filters?.per_page) {
      params.set('per_page', String(filters.per_page));
    }

    const queryString = params.toString();
    const url = `/admin/payments${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<{
      data: Cobranca[];
      total: number;
      current_page: number;
      last_page: number;
    }>(url);

    return response;
  }

  /**
   * Obter detalhes de uma cobrança (admin)
   */
  async getCharge(idCobranca: string): Promise<Cobranca> {
    const response = await apiClient.get<{ data: Cobranca }>(
      `/admin/payments/${idCobranca}`
    );
    return response.data;
  }

  /**
   * Criar cobrança (admin)
   */
  async createCharge(data: {
    id_usuario: string;
    referencia_tipo: Cobranca['referencia_tipo'] | 'manual';
    referencia_id?: string | null;
    valor_total: number;
    descricao: string;
    vencimento: string; // YYYY-MM-DD
    observacoes?: string;
  }): Promise<Cobranca> {
    const payload: any = { ...data };
    if (payload.referencia_id === '' || payload.referencia_id === undefined) {
      delete payload.referencia_id;
    }
    const response = await apiClient.post<{ data: Cobranca }>(`/admin/payments`, payload);
    return response.data;
  }

  /**
   * Atualizar cobrança (admin)
   */
  async updateCharge(idCobranca: string, data: Partial<{
    descricao: string;
    valor_total: number;
    vencimento: string;
    status: Cobranca['status'];
    observacoes?: string;
  }>): Promise<Cobranca> {
    const response = await apiClient.put<{ data: Cobranca }>(`/admin/payments/${idCobranca}`, data);
    return response.data;
  }

  /**
   * Remover (cancelar) cobrança (admin)
   */
  async deleteCharge(idCobranca: string): Promise<void> {
    await apiClient.delete(`/admin/payments/${idCobranca}`);
  }
}

export const paymentsService = new PaymentsService();
