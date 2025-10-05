import { apiClient } from '@/lib/api-client';
import { Court, CourtAvailability, CourtBooking } from '@/types';

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

class CourtsService {
  // Public endpoints
  async getPublicCourts(): Promise<Court[]> {
    return apiClient.get<Court[]>('/public/courts');
  }

  async getPublicCourtAvailability(courtId: string, date: string): Promise<CourtAvailability> {
    return apiClient.get<CourtAvailability>(`/public/courts/${courtId}/availability?date=${date}`);
  }

  async createPublicBooking(booking: CreateBookingRequest): Promise<CourtBooking> {
    return apiClient.post<CourtBooking>('/public/court-bookings', booking);
  }

  // Authenticated endpoints
  async getCourts(): Promise<Court[]> {
    return apiClient.get<Court[]>('/courts');
  }

  async getCourtAvailability(courtId: string, date: string): Promise<CourtAvailability> {
    return apiClient.get<CourtAvailability>(`/courts/${courtId}/availability?date=${date}`);
  }

  async createBooking(booking: Omit<CreateBookingRequest, 'guestName' | 'guestEmail' | 'guestPhone'>): Promise<CourtBooking> {
    return apiClient.post<CourtBooking>('/court-bookings', booking);
  }

  async getUserBookings(): Promise<CourtBooking[]> {
    return apiClient.get<CourtBooking[]>('/court-bookings/me');
  }

  async cancelBooking(bookingId: string): Promise<void> {
    return apiClient.delete(`/court-bookings/${bookingId}`);
  }

  // Admin endpoints
  async createCourt(court: Omit<Court, 'id'>): Promise<Court> {
    return apiClient.post<Court>('/courts', court);
  }

  async updateCourt(courtId: string, court: Partial<Court>): Promise<Court> {
    return apiClient.patch<Court>(`/courts/${courtId}`, court);
  }

  async getAllBookings(): Promise<CourtBooking[]> {
    return apiClient.get<CourtBooking[]>('/admin/court-bookings');
  }
}

export const courtsService = new CourtsService();