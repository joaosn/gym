import { apiClient } from '@/lib/api-client';

export interface AdminDashboardData {
  usuarios: {
    total: number;
    alunos: number;
    instrutores: number;
  };
  reservas: {
    hoje: number;
    mes: number;
    total: number;
  };
  sessoes_personal: {
    hoje: number;
    mes: number;
  };
  aulas: {
    total: number;
    inscricoes_ativas: number;
  };
  financeiro: {
    receita_mes: number;
    assinaturas_ativas: number;
  };
  quadras: {
    ativas: number;
  };
  proximas_reservas: Array<{
    id_reserva_quadra: number;
    quadra_nome: string;
    usuario_nome: string;
    inicio: string;
    fim: string;
    status: string;
  }>;
}

export interface StudentDashboardData {
  reservas: {
    total: number;
    hoje: number;
    mes: number;
  };
  sessoes_personal: {
    total: number;
    mes: number;
  };
  aulas: {
    inscricoes_ativas: number;
  };
  assinatura: {
    nome: string;
    data_inicio: string;
    proximo_vencimento: string;
  } | null;
  pagamentos: {
    pendentes: number;
    valor_pendente: number;
  };
  proximas_atividades: Array<{
    tipo: 'reserva' | 'sessao';
    id: number;
    titulo: string;
    inicio: string;
    fim: string;
    status: string;
  }>;
}

export interface InstructorDashboardData {
  sessoes_personal: {
    hoje: number;
    mes: number;
    total: number;
  };
  aulas: {
    turmas: number;
    aulas_mes: number;
  };
  alunos: {
    total_atendidos: number;
  };
  financeiro: {
    receita_mes: number;
    valor_hora: number;
  };
  disponibilidade: {
    horarios_configurados: number;
  };
  proximas_sessoes: Array<{
    id_sessao_personal: number;
    aluno_nome: string;
    inicio: string;
    fim: string;
    status: string;
  }>;
}

class DashboardService {
  /**
   * Obter dados do dashboard do admin
   */
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await apiClient.get<{ data: AdminDashboardData }>('/admin/dashboard');
    return response.data;
  }

  /**
   * Obter dados do dashboard do aluno
   */
  async getStudentDashboard(): Promise<StudentDashboardData> {
    const response = await apiClient.get<{ data: StudentDashboardData }>('/student/dashboard');
    return response.data;
  }

  /**
   * Obter dados do dashboard do instrutor
   */
  async getInstructorDashboard(): Promise<InstructorDashboardData> {
    const response = await apiClient.get<{ data: InstructorDashboardData }>('/instructor/dashboard');
    return response.data;
  }
}

export const dashboardService = new DashboardService();
