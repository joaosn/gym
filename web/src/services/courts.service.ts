import { apiClient } from '@/lib/api-client';
import { Court, CourtFormData, CourtAvailability, CourtBooking } from '@/types';

export interface CreateBookingRequest {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  sport: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
}

// Helper para normalizar dados da API
const normalizeCourt = (court: any): Court => ({
  ...court,
  id_quadra: String(court.id_quadra), // ← Converter ID para string
  preco_hora: typeof court.preco_hora === 'string' 
    ? parseFloat(court.preco_hora) 
    : court.preco_hora,
});

class CourtsService {
  // =====================================================================
  // ADMIN ENDPOINTS (CRUD)
  // =====================================================================
  
  /**
   * Listar todas as quadras (Admin)
   * GET /api/admin/courts
   */
  async getAdminCourts(params?: {
    esporte?: string;
    status?: 'ativa' | 'inativa';
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<Court>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const query = queryParams.toString();
    const response = await apiClient.get<PaginatedResponse<any>>(
      `/admin/courts${query ? `?${query}` : ''}`
    );
    
    return {
      ...response,
      data: response.data.map(normalizeCourt),
    };
  }

  /**
   * Obter uma quadra específica (Admin)
   * GET /api/admin/courts/{id}
   */
  async getAdminCourt(id: string): Promise<{ data: Court }> {
    const response = await apiClient.get<{ data: any }>(`/admin/courts/${id}`);
    return {
      data: normalizeCourt(response.data),
    };
  }

  /**
   * Criar nova quadra (Admin)
   * POST /api/admin/courts
   */
  async createCourt(data: CourtFormData): Promise<{ data: Court; message: string }> {
    const response = await apiClient.post<{ data: any; message: string }>('/admin/courts', data);
    return {
      ...response,
      data: normalizeCourt(response.data),
    };
  }

  /**
   * Atualizar quadra (Admin)
   * PUT /api/admin/courts/{id}
   */
  async updateCourt(id: string, data: Partial<CourtFormData>): Promise<{ data: Court; message: string }> {
    const response = await apiClient.put<{ data: any; message: string }>(`/admin/courts/${id}`, data);
    return {
      ...response,
      data: normalizeCourt(response.data),
    };
  }

  /**
   * Excluir quadra (Admin)
   * DELETE /api/admin/courts/{id}
   */
  async deleteCourt(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/admin/courts/${id}`);
  }

  /**
   * Atualizar status da quadra (Admin)
   * PATCH /api/admin/courts/{id}/status
   */
  async updateCourtStatus(id: string, status: 'ativa' | 'inativa'): Promise<{ data: Court; message: string }> {
    const response = await apiClient.patch<{ data: any; message: string }>(`/admin/courts/${id}/status`, { status });
    return {
      ...response,
      data: normalizeCourt(response.data),
    };
  }

  // =====================================================================
  // PUBLIC ENDPOINTS (Reservas Públicas - TODO Fase 3)
  // =====================================================================
  
  async getPublicCourts(): Promise<Court[]> {
    // TODO: Implementar na Fase 3
    return apiClient.get<Court[]>('/public/courts');
  }

  async getPublicCourtAvailability(courtId: string, date: string): Promise<CourtAvailability> {
    // TODO: Implementar na Fase 3
    return apiClient.get<CourtAvailability>(`/public/courts/${courtId}/availability?date=${date}`);
  }

  async createPublicBooking(booking: CreateBookingRequest): Promise<CourtBooking> {
    // TODO: Implementar na Fase 3
    return apiClient.post<CourtBooking>('/public/court-bookings', booking);
  }

  // =====================================================================
  // AUTHENTICATED ENDPOINTS (Aluno/Personal - TODO Fase 3)
  // =====================================================================
  
  async getCourts(): Promise<Court[]> {
    const response = await apiClient.get<{ data: Court[] }>('/admin/courts');
    return response.data;
  }

  async getCourtAvailability(courtId: string, date: string): Promise<CourtAvailability> {
    // TODO: Implementar na Fase 3
    return apiClient.get<CourtAvailability>(`/courts/${courtId}/availability?date=${date}`);
  }

  async createBooking(booking: Omit<CreateBookingRequest, 'guestName' | 'guestEmail' | 'guestPhone'>): Promise<CourtBooking> {
    // TODO: Implementar na Fase 3
    return apiClient.post<CourtBooking>('/court-bookings', booking);
  }

  async getUserBookings(): Promise<CourtBooking[]> {
    // TODO: Implementar na Fase 3
    return apiClient.get<CourtBooking[]>('/court-bookings/me');
  }

  async cancelBooking(bookingId: string): Promise<void> {
    // TODO: Implementar na Fase 3
    return apiClient.delete(`/court-bookings/${bookingId}`);
  }

  async getAllBookings(): Promise<CourtBooking[]> {
    // TODO: Implementar na Fase 3
    return apiClient.get<CourtBooking[]>('/admin/court-bookings');
  }
}

export const courtsService = new CourtsService();