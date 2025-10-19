// User type for authentication (English - matches AuthController response)
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'aluno' | 'instrutor';
  createdAt: string;
}

// AdminUser type for user management (Portuguese - matches UserController response)
export interface AdminUser {
  id_usuario: string;
  nome: string;
  email: string;
  telefone?: string;
  documento?: string;
  data_nascimento?: string;
  papel: 'admin' | 'aluno' | 'instrutor';
  status: 'ativo' | 'inativo';
  criado_em: string;
  atualizado_em: string;
}

export interface UserFormData {
  nome: string;
  email: string;
  senha?: string;
  telefone?: string;
  documento?: string;
  data_nascimento?: string;
  papel: 'admin' | 'aluno' | 'instrutor';
  status?: 'ativo' | 'inativo';
}

export interface Court {
  id_quadra: string;
  nome: string;
  localizacao: string;
  esporte: string;
  preco_hora: number;
  caracteristicas_json: Record<string, any>;
  status: 'ativa' | 'inativa';
  criado_em: string;
  atualizado_em: string;
}

export interface CourtFormData {
  nome: string;
  localizacao?: string;
  esporte: string;
  preco_hora: number;
  caracteristicas_json?: Record<string, any>;
  status?: 'ativa' | 'inativa';
}

export interface CourtAvailability {
  date: string;
  availableSlots: string[];
}

// NOVO: Reserva de Quadra (Admin)
export interface CourtBooking {
  id_reserva_quadra: string;
  id_quadra: string;
  id_usuario: string;
  inicio: string; // ISO datetime
  fim: string; // ISO datetime
  preco_total: number;
  status: 'pendente' | 'confirmada' | 'cancelada' | 'no_show' | 'concluida';
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
  // Relationships
  quadra?: {
    id_quadra: string;
    nome: string;
    preco_hora?: number;
  };
  usuario?: {
    id_usuario: string;
    nome: string;
    email: string;
    telefone?: string;
  };
}

export interface CourtBookingFormData {
  id_quadra: string | number; // Backend espera number, frontend usa string
  id_usuario: string | number; // Backend espera number, frontend usa string
  inicio: string; // ISO datetime
  fim: string; // ISO datetime
  observacoes?: string;
}

export interface Plan {
  id_plano: string;
  nome: string;
  preco: number;
  ciclo_cobranca: 'mensal' | 'trimestral' | 'anual';
  max_reservas_futuras: number;
  beneficios_json: string[];
  status: 'ativo' | 'inativo';
  criado_em: string;
  atualizado_em: string;
}

export interface PlanFormData {
  nome: string;
  preco: number;
  ciclo_cobranca: 'mensal' | 'trimestral' | 'anual';
  max_reservas_futuras?: number;
  beneficios_json?: string[];
  status?: 'ativo' | 'inativo';
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan: Plan;
  status: 'active' | 'inactive' | 'cancelled';
  startDate: string;
  endDate: string;
  paymentStatus: 'current' | 'overdue';
}

export interface Class {
  id: string;
  name: string;
  sport: string;
  level: 'kids' | 'iniciante' | 'avancado';
  duration: number;
  capacity: number;
  price?: number;
}

export interface ClassOccurrence {
  id: string;
  classId: string;
  class: Class;
  date: string;
  startTime: string;
  endTime: string;
  enrolledCount: number;
  trainerId?: string;
}

export interface ClassEnrollment {
  id: string;
  userId: string;
  occurrenceId: string;
  occurrence: ClassOccurrence;
  status: 'enrolled' | 'cancelled';
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  pricePerSession: number;
  rating?: number;
}

// =====================================================================
// INSTRUTORES/PERSONAL TRAINERS (Fase 5)
// =====================================================================

export interface Availability {
  id_disponibilidade: string;
  dia_semana: number; // 1-7 (Segunda-Domingo)
  dia_semana_texto: string; // "Segunda", "Terça", etc
  hora_inicio: string; // "HH:MM"
  hora_fim: string; // "HH:MM"
  disponivel: boolean;
}

export interface Instructor {
  id_instrutor: string;
  id_usuario?: string;
  nome: string;
  email: string;
  telefone: string;
  cref: string;
  valor_hora: number;
  especialidades: string[];
  bio: string;
  status: 'ativo' | 'inativo';
  criado_em: string;
  atualizado_em: string;
  disponibilidades: Availability[];
}

export interface InstructorFormData {
  nome: string;
  email: string;
  telefone: string;
  cref: string;
  valor_hora: number;
  especialidades: string[];
  bio?: string;
  status?: 'ativo' | 'inativo';
  criar_usuario?: boolean;
  id_usuario?: string;
  senha?: string;
}

// =====================================================================
// LEGACY (a refatorar)
// =====================================================================

export interface TrainerSlot {
  id: string;
  trainerId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface TrainerSession {
  id: string;
  userId: string;
  trainerId: string;
  trainer: Trainer;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  rating?: number;
  feedback?: string;
}

export interface Payment {
  id: string;
  type: 'court_booking' | 'subscription' | 'trainer_session';
  referenceId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  method: 'pix' | 'card' | 'cash';
  createdAt: string;
  paidAt?: string;
}

export interface KPIs {
  activeSubscriptions: number;
  overduepayments: number;
  courtOccupancy: number;
  monthlyRevenue: number;
  newMembersThisMonth: number;
}

// =====================================================================
// SESSÕES PERSONAL 1:1
// =====================================================================

export interface PersonalSession {
  id_sessao_personal: string;
  id_instrutor: string;
  id_usuario: string;
  id_quadra?: string;
  inicio: string; // ISO datetime
  fim: string; // ISO datetime
  preco_total: number;
  status: 'pendente' | 'confirmada' | 'cancelada' | 'concluida' | 'no_show';
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
  // Relationships (loaded with "with")
  instrutor?: Instructor;
  usuario?: AdminUser;
  quadra?: Court;
}

export interface PersonalSessionFormData {
  id_instrutor: string;
  id_usuario: string;
  id_quadra?: string;
  inicio: string; // ISO datetime
  fim: string; // ISO datetime
  observacoes?: string;
}

export interface AvailabilityCheckRequest {
  id_instrutor: string;
  inicio: string;
  fim: string;
  id_quadra?: string; // Opcional: validar conflito de quadra
}

export interface AvailabilityCheckResponse {
  disponivel: boolean;
  motivo?: string;
  preco_total?: number;
}

// =====================================================================
// AULAS (TURMAS EM GRUPO) - Fase 10
// =====================================================================

export interface Aula {
  id_aula: string;
  nome: string;
  esporte: string;
  nivel?: 'iniciante' | 'intermediario' | 'avancado';
  duracao_min: number;
  capacidade_max: number;
  preco_unitario?: number; // null = incluso no plano
  descricao?: string;
  requisitos?: string;
  status: 'ativa' | 'inativa';
  criado_em: string;
  atualizado_em: string;
  // Contadores (quando incluídos)
  horarios_count?: number;
  ocorrencias_count?: number;
  inscricoes_count?: number;
  // Relacionamentos (quando incluídos)
  horarios?: HorarioAula[];
  ocorrencias?: OcorrenciaAula[];
}

export interface HorarioAula {
  id_horario_aula: string;
  id_aula: string;
  id_instrutor: string;
  id_quadra: string;
  dia_semana: number; // 1-7 (Segunda-Domingo ISO 8601)
  dia_semana_texto?: string; // Helper frontend "Segunda", "Terça", etc
  hora_inicio: string; // "HH:MM"
  criado_em: string;
  atualizado_em: string;
  // Relacionamentos
  aula?: Aula;
  instrutor?: Instructor;
  quadra?: Court;
}

export interface OcorrenciaAula {
  id_ocorrencia_aula: string;
  id_aula: string;
  id_instrutor: string;
  id_quadra: string;
  inicio: string; // ISO datetime
  fim: string; // ISO datetime
  status: 'agendada' | 'cancelada' | 'realizada';
  criado_em: string;
  atualizado_em: string;
  // Contadores
  inscricoes_count?: number;
  numero_inscritos?: number;
  // Relacionamentos
  aula?: Aula;
  instrutor?: Instructor;
  quadra?: Court;
  inscricoes?: InscricaoAula[];
}

export interface InscricaoAula {
  id_inscricao_aula: string;
  id_ocorrencia_aula?: string;
  id_aula: string;
  id_usuario: string;
  status: 'inscrito' | 'cancelado' | 'presente' | 'falta';
  criado_em: string;
  atualizado_em: string;
  // Relacionamentos
  ocorrencia?: OcorrenciaAula;
  aula?: Aula;
  usuario?: User;
}

// Form Data Types
export interface AulaFormData {
  nome: string;
  esporte: string;
  nivel?: 'iniciante' | 'intermediario' | 'avancado';
  duracao_min: number;
  capacidade_max: number;
  preco_unitario?: number;
  descricao?: string;
  requisitos?: string;
  status?: 'ativa' | 'inativa';
}

export interface HorarioAulaFormData {
  id_aula: string;
  id_instrutor: string;
  id_quadra: string;
  dia_semana: number;
  hora_inicio: string;
}

export interface GerarOcorrenciasRequest {
  id_aula: string;
  data_inicio: string; // ISO date
  data_fim: string; // ISO date
}

export interface GerarOcorrenciasResponse {
  message: string;
  criadas: number;
  puladas: number;
  data: OcorrenciaAula[];
}

export interface InscricaoAulaRequest {
  id_ocorrencia_aula: string;
}

// =====================================================================
// ASSINATURAS (SUBSCRIPTIONS)
// =====================================================================
export interface Assinatura {
  id_assinatura: string;
  id_usuario: string;
  id_plano: string;
  data_inicio: string; // ISO date
  data_fim?: string; // ISO date
  renova_automatico: boolean;
  status: 'ativa' | 'pendente' | 'cancelada' | 'expirada';
  proximo_vencimento?: string; // ISO date
  criado_em: string;
  atualizado_em: string;
  // Relacionamentos (eager loaded)
  plano?: Plan;
  usuario?: AdminUser;
  eventos?: EventoAssinatura[];
}

export interface EventoAssinatura {
  id_evento_assinatura: string;
  id_assinatura: string;
  tipo: 'criada' | 'renovada' | 'cancelada' | 'pagamento_ok' | 'pagamento_erro';
  payload_json?: Record<string, any>;
  criado_em: string;
}

export interface AssinarPlanoRequest {
  id_plano: string;
  renova_automatico?: boolean;
}

export interface AssinaturaFormData {
  status?: 'ativa' | 'pendente' | 'cancelada' | 'expirada';
  data_fim?: string;
  proximo_vencimento?: string;
  renova_automatico?: boolean;
}