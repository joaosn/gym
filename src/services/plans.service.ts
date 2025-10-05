import { apiClient } from '@/lib/api-client';
import { Plan, Subscription } from '@/types';

class PlansService {
  async getPlans(): Promise<Plan[]> {
    return apiClient.get<Plan[]>('/plans');
  }

  async createSubscription(planId: string): Promise<Subscription> {
    return apiClient.post<Subscription>('/subscriptions', { planId });
  }

  async getMySubscription(): Promise<Subscription | null> {
    try {
      return await apiClient.get<Subscription>('/subscriptions/me');
    } catch (error) {
      return null;
    }
  }

  async cancelSubscription(): Promise<void> {
    return apiClient.delete('/subscriptions/me');
  }

  // Admin endpoints
  async createPlan(plan: Omit<Plan, 'id'>): Promise<Plan> {
    return apiClient.post<Plan>('/plans', plan);
  }

  async updatePlan(planId: string, plan: Partial<Plan>): Promise<Plan> {
    return apiClient.patch<Plan>(`/plans/${planId}`, plan);
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return apiClient.get<Subscription[]>('/admin/subscriptions');
  }
}

export const plansService = new PlansService();