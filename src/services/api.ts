
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth
  async login(username: string, password: string) {
    return this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // Shipments
  async getAllShipments(pageSize = 10, bookmark = '') {
    return this.request<any>(`/api/shipments/all?pageSize=${pageSize}&bookmark=${bookmark}`);
  }

  async getMyShipments(pageSize = 10, bookmark = '') {
    return this.request<any>(`/api/shipments/my?pageSize=${pageSize}&bookmark=${bookmark}`);
  }

  async getShipmentDetails(id: string) {
    return this.request<any>(`/api/shipments/${id}`);
  }

  async createShipment(data: any) {
    return this.request<any>('/api/shipments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitForCertification(shipmentId: string) {
    return this.request<any>(`/api/shipments/${shipmentId}/certification/submit`, {
      method: 'POST',
    });
  }

  async recordCertification(shipmentId: string, data: any) {
    return this.request<any>(`/api/shipments/${shipmentId}/certification/record`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async processShipment(shipmentId: string, processorData: any) {
    return this.request<any>(`/api/shipments/${shipmentId}/process`, {
      method: 'POST',
      body: JSON.stringify({ processorData }),
    });
  }

  async distributeShipment(shipmentId: string, distributorData: any) {
    return this.request<any>(`/api/shipments/${shipmentId}/distribute`, {
      method: 'POST',
      body: JSON.stringify({ distributorData }),
    });
  }

  async receiveShipment(shipmentId: string, retailerData: any) {
    return this.request<any>(`/api/shipments/${shipmentId}/receive`, {
      method: 'POST',
      body: JSON.stringify({ retailerData }),
    });
  }

  // Admin
  async getAllIdentities() {
    return this.request<any>('/api/identities');
  }

  async registerUser(userData: any) {
    return this.request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async assignRole(alias: string, role: string) {
    return this.request<any>(`/api/identities/${alias}/roles`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async makeAdmin(alias: string) {
    return this.request<any>(`/api/identities/${alias}/admin`, {
      method: 'POST',
    });
  }

  // Recalls
  async initiateRecall(shipmentId: string, recallId: string, reason: string) {
    return this.request<any>('/api/recalls/initiate', {
      method: 'POST',
      body: JSON.stringify({ shipmentId, recallId, reason }),
    });
  }
}

export const apiClient = new ApiClient();
