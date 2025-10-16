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

export interface CourtBooking {
  id: string;
  courtId: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  date: string;
  startTime: string;
  endTime: string;
  sport: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
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