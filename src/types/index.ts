export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'aluno' | 'personal' | 'admin';
  createdAt: string;
}

export interface Court {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
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
  id: string;
  name: string;
  description: string;
  price: number;
  benefits: string[];
  futureBookingsLimit: number;
  includedClasses: number;
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