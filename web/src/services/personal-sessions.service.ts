import { apiClient } from '@/lib/api-client';
import type { 
  PersonalSession, 
  PersonalSessionFormData, 
  AvailabilityCheckRequest,
  AvailabilityCheckResponse 
} from '@/types';

class PersonalSessionsService {
  private baseUrl = '/personal-sessions';

  /**
   * Listar sessões (com filtros opcionais)
   */
  async list(filters?: {
    id_instrutor?: string;
    id_usuario?: string;
    status?: string;
    periodo?: 'futuras' | 'passadas';
    per_page?: number;
  }): Promise<{
    data: PersonalSession[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.id_instrutor) params.append('id_instrutor', filters.id_instrutor);
    if (filters?.id_usuario) params.append('id_usuario', filters.id_usuario);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.periodo) params.append('periodo', filters.periodo);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    return await apiClient.get<{
      data: PersonalSession[];
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    }>(url);
  }

  /**
   * Buscar sessão por ID
   */
  async getById(id: string) {
    const response = await apiClient.get<{ data: PersonalSession }>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Criar nova sessão
   */
  async create(data: PersonalSessionFormData) {
    const response = await apiClient.post<{ data: PersonalSession }>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Atualizar sessão
   */
  async update(id: string, data: Partial<PersonalSessionFormData>) {
    const response = await apiClient.put<{ data: PersonalSession }>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Cancelar sessão (soft delete)
   */
  async cancel(id: string) {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Confirmar sessão
   */
  async confirm(id: string) {
    const response = await apiClient.patch<{ data: PersonalSession }>(`${this.baseUrl}/${id}/confirm`, {});
    return response.data;
  }

  /**
   * Verificar disponibilidade do instrutor
   */
  async checkAvailability(data: AvailabilityCheckRequest): Promise<AvailabilityCheckResponse> {
    const response = await apiClient.post<AvailabilityCheckResponse>(
      `${this.baseUrl}/check-availability`, 
      data
    );
    return response;
  }

  /**
   * Obter minhas sessões (como aluno)
   */
  async getMySessions(filters?: { status?: string; periodo?: 'futuras' | 'passadas' }) {
    // O backend irá filtrar automaticamente pelo id_usuario do token
    // Mas por enquanto, precisa passar o id_usuario manualmente ou implementar endpoint /me/sessions
    return this.list(filters);
  }

  /**
   * Obter sessões que ministro (como instrutor logado)
   * Novo endpoint: GET /api/personal-sessions/me
   */
  async getMyInstructorSessions(filters?: { status?: string; periodo?: 'futuras' | 'passadas'; per_page?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.periodo) params.append('periodo', filters.periodo);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/me?${queryString}` : `${this.baseUrl}/me`;

    return await apiClient.get<{
      data: PersonalSession[];
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    }>(url);
  }
}

export const personalSessionsService = new PersonalSessionsService();
export default personalSessionsService;
