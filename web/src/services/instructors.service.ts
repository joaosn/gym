import { apiClient } from "@/lib/api-client";
import type { Instructor, InstructorFormData, Availability } from "@/types";

interface ListInstructorsParams {
  especialidade?: string;
  status?: string;
  search?: string;
}

interface ListInstructorsResponse {
  data: Instructor[];
  total: number;
}

class InstructorsService {
  /**
   * Listar instrutores com filtros
   */
  async listInstructors(params?: ListInstructorsParams): Promise<ListInstructorsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.especialidade) queryParams.append('especialidade', params.especialidade);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `/admin/instructors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<ListInstructorsResponse>(url);
  }

  /**
   * Buscar instrutor por ID
   */
  async getInstructor(id: string): Promise<Instructor> {
    const response = await apiClient.get<{ data: Instructor }>(`/admin/instructors/${id}`);
    return response.data;
  }

  /**
   * Criar novo instrutor
   */
  async createInstructor(data: InstructorFormData): Promise<Instructor> {
    const response = await apiClient.post<{ data: Instructor }>('/admin/instructors', data);
    return response.data;
  }

  /**
   * Atualizar instrutor
   */
  async updateInstructor(id: string, data: Partial<InstructorFormData>): Promise<Instructor> {
    const response = await apiClient.put<{ data: Instructor }>(`/admin/instructors/${id}`, data);
    return response.data;
  }

  /**
   * Excluir instrutor
   */
  async deleteInstructor(id: string): Promise<void> {
    await apiClient.delete(`/admin/instructors/${id}`);
  }

  /**
   * Alternar status (ativo/inativo)
   */
  async toggleStatus(id: string): Promise<Instructor> {
    const response = await apiClient.patch<{ data: Instructor }>(`/admin/instructors/${id}/status`, {});
    return response.data;
  }

  /**
   * Atualizar disponibilidade semanal
   */
  async updateAvailability(id: string, disponibilidades: Omit<Availability, 'id_disponibilidade' | 'dia_semana_texto'>[]): Promise<void> {
    await apiClient.put(`/admin/instructors/${id}/availability`, { disponibilidades });
  }
}

export const instructorsService = new InstructorsService();
