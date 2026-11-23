import type { DashboardData, InventoryItem, InventoryPayload } from '../types/inventory';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request gagal (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore non-JSON error
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const inventoryApi = {
  health: () =>
    request<{ status: string; database: string; timestamp: string }>('/health'),

  getDashboard: () => request<DashboardData>('/inventory/dashboard'),

  list: (params?: { search?: string; category?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    const qs = query.toString();
    return request<InventoryItem[]>(`/inventory${qs ? `?${qs}` : ''}`);
  },

  create: (payload: InventoryPayload) =>
    request<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: InventoryPayload) =>
    request<InventoryItem>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  adjustStock: (id: number, delta: number) =>
    request<InventoryItem>(`/inventory/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    }),

  remove: (id: number) =>
    request<{ deleted: boolean; item: { id: number; name: string } }>(`/inventory/${id}`, {
      method: 'DELETE',
    }),
};
