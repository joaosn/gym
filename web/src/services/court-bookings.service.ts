import { apiClient } from '@/lib/api-client';
import { CourtBooking, CourtBookingFormData } from '@/types';

interface CourtBookingFilters {
  id_quadra?: string;
  id_usuario?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
}

interface AvailabilityCheckRequest {
  id_quadra: string | number; // Backend espera number
  inicio: string;
  fim: string;
}

interface AvailabilityCheckResponse {
  disponivel: boolean;
  preco_total?: number;
  motivo?: string;
}

/**
 * Normaliza dados de reserva vindos da API
 * Converte IDs numéricos para strings
 */
function normalizeBooking(booking: any): CourtBooking {
  return {
    ...booking,
    id_reserva_quadra: String(booking.id_reserva_quadra),
    id_quadra: String(booking.id_quadra),
    id_usuario: String(booking.id_usuario),
    quadra: booking.quadra ? {
      id_quadra: String(booking.quadra.id_quadra),
      nome: booking.quadra.nome,
      preco_hora: booking.quadra.preco_hora,
    } : undefined,
    usuario: booking.usuario ? {
      id_usuario: String(booking.usuario.id_usuario),
      nome: booking.usuario.nome,
      email: booking.usuario.email,
      telefone: booking.usuario.telefone,
    } : undefined,
  };
}

class CourtBookingsService {
  private basePath = '/admin/court-bookings';

  /**
   * Listar reservas com filtros
   */
  async list(filters?: CourtBookingFilters): Promise<{ data: CourtBooking[]; total: number }> {
    const params = new URLSearchParams();
    
    if (filters?.id_quadra) params.append('id_quadra', filters.id_quadra);
    if (filters?.id_usuario) params.append('id_usuario', filters.id_usuario);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.data_inicio) params.append('data_inicio', filters.data_inicio);
    if (filters?.data_fim) params.append('data_fim', filters.data_fim);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    const response = await apiClient.get<{ data: any[]; total: number }>(url);
    
    return {
      data: response.data.map(normalizeBooking),
      total: response.total,
    };
  }

  /**
   * Buscar reserva por ID
   */
  async getById(id: string): Promise<{ data: CourtBooking }> {
    const response = await apiClient.get<{ data: any }>(`${this.basePath}/${id}`);
    return {
      data: normalizeBooking(response.data),
    };
  }

  /**
   * Criar nova reserva
   */
  async create(data: CourtBookingFormData): Promise<{ data: CourtBooking; message: string }> {
    const response = await apiClient.post<{ data: any; message: string }>(
      this.basePath,
      data
    );
    return {
      data: normalizeBooking(response.data),
      message: response.message,
    };
  }

  /**
   * Atualizar reserva
   */
  async update(id: string, data: Partial<CourtBookingFormData>): Promise<{ data: CourtBooking; message: string }> {
    const response = await apiClient.put<{ data: any; message: string }>(
      `${this.basePath}/${id}`,
      data
    );
    return {
      data: normalizeBooking(response.data),
      message: response.message,
    };
  }

  /**
   * Cancelar reserva (soft delete)
   */
  async cancel(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Confirmar reserva
   */
  async confirm(id: string): Promise<{ data: CourtBooking; message: string }> {
    const response = await apiClient.patch<{ data: any; message: string }>(
      `${this.basePath}/${id}/confirm`,
      {} // Body vazio
    );
    return {
      data: normalizeBooking(response.data),
      message: response.message,
    };
  }

  /**
   * Verificar disponibilidade
   */
  async checkAvailability(data: AvailabilityCheckRequest): Promise<{ data: AvailabilityCheckResponse }> {
    return await apiClient.post<{ data: AvailabilityCheckResponse }>(
      `${this.basePath}/check-availability`,
      data
    );
  }
}

export const courtBookingsService = new CourtBookingsService();
