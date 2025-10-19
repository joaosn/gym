import { apiClient } from '@/lib/api-client';
import type { InscricaoAula, AdminUser } from '@/types';

interface EnrollmentsListResponse {
  data: InscricaoAula[];
  meta: {
    capacidade_atual: number;
    capacidade_maxima: number;
    vagas_disponiveis: number;
    ocorrencia: {
      id: string;
      inicio: string;
      fim: string;
      aula_nome: string;
      instrutor_nome: string;
      quadra_nome: string;
    };
  };
}

class EnrollmentsService {
  /**
   * Listar inscrições de uma ocorrência específica
   */
  async listByOccurrence(occurrenceId: string): Promise<EnrollmentsListResponse> {
    const response = await apiClient.get<EnrollmentsListResponse>(
      `/admin/class-occurrences/${occurrenceId}/enrollments`
    );
    // ✅ apiClient já retorna { data: [], meta: {} }, não precisa acessar .data novamente
    return response;
  }

  /**
   * Inscrever um aluno em uma ocorrência (admin)
   */
  async enrollStudent(occurrenceId: string, usuarioId: string): Promise<InscricaoAula> {
    const response = await apiClient.post<any>(
      `/admin/class-occurrences/${occurrenceId}/enrollments`,
      { id_usuario: usuarioId }
    );
    return response.data.data;
  }

  /**
   * Remover inscrição (admin)
   */
  async removeEnrollment(enrollmentId: string): Promise<void> {
    await apiClient.delete(`/admin/class-enrollments/${enrollmentId}`);
  }

  /**
   * Listar alunos disponíveis para inscrição
   * Se occurrenceId for fornecido: exclui já inscritos nessa ocorrência
   * Se occurrenceId não fornecido (ou '0'): retorna todos os alunos ativos
   */
  async getAvailableStudents(occurrenceId?: string): Promise<AdminUser[]> {
    let url = '/admin/available-students';
    
    // Só adiciona occurrence_id se for um ID real (não '0' ou undefined)
    if (occurrenceId && occurrenceId !== '0') {
      url += `?occurrence_id=${occurrenceId}`;
    }

    const response = await apiClient.get<{ data: AdminUser[] }>(url);
    // ✅ apiClient já extrai, backend retorna { data: [...] }, então acessamos .data
    return response.data || [];
  }

  /**
   * Listar todas as inscrições (com filtros opcionais)
   */
  async list(filters?: {
    id_aula?: string;
    id_ocorrencia_aula?: string;
    status?: string;
  }): Promise<{ data: InscricaoAula[]; meta: any }> {
    const params = new URLSearchParams();
    if (filters?.id_aula) params.append('id_aula', filters.id_aula);
    if (filters?.id_ocorrencia_aula) params.append('id_ocorrencia_aula', filters.id_ocorrencia_aula);
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get<any>(
      `/admin/class-enrollments?${params.toString()}`
    );
    return response.data;
  }
}

export const enrollmentsService = new EnrollmentsService();
