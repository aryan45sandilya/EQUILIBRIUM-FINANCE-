const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Token getter — set by auth store after Clerk loads
let tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  tokenGetter = fn;
}

async function getToken(): Promise<string | null> {
  if (tokenGetter) return tokenGetter();
  return null;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  const token = await getToken();

  const response = await fetch(url.toString(), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data.data as T;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

export const api = {
  getGroups: () => apiRequest<Group[]>('/groups'),
  createGroup: (data: { name: string; description?: string; currency?: string }) =>
    apiRequest<Group>('/groups', { method: 'POST', body: JSON.stringify(data) }),
  getGroup: (id: string) => apiRequest<Group>(`/groups/${id}`),
  addMember: (groupId: string, email: string) =>
    apiRequest(`/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ email }) }),
  getGroupDebts: (groupId: string) =>
    apiRequest<SimplifiedTransaction[]>(`/groups/${groupId}/debts`),

  getExpenses: (groupId: string, page = 1) =>
    apiRequest<PaginatedExpenses>('/expenses', { params: { groupId, page } }),
  createExpense: (data: CreateExpensePayload) =>
    apiRequest<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id: string, data: Partial<CreateExpensePayload>) =>
    apiRequest<Expense>(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteExpense: (id: string) => apiRequest(`/expenses/${id}`, { method: 'DELETE' }),

  getSettlements: (groupId: string) =>
    apiRequest<Settlement[]>('/settlements', { params: { groupId } }),
  createSettlement: (data: { groupId: string; toId: string; amount: number; notes?: string }) =>
    apiRequest<Settlement>('/settlements', { method: 'POST', body: JSON.stringify(data) }),

  getNotifications: (unreadOnly = false) =>
    apiRequest<Notification[]>('/notifications', { params: { unread: unreadOnly } }),
  markRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' }),

  getAnalytics: (groupId: string) =>
    apiRequest<Analytics>('/analytics', { params: { groupId } }),

  getMe: () => apiRequest<User>('/users/me'),
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string; name: string; email: string; avatar?: string; currency: string; createdAt: string;
}
export interface Group {
  id: string; name: string; description?: string; currency: string;
  members: GroupMember[]; _count?: { expenses: number; settlements: number };
}
export interface GroupMember {
  id: string; role: 'ADMIN' | 'MEMBER';
  user: { id: string; name: string; avatar?: string; email?: string };
}
export interface Expense {
  id: string; groupId: string; title: string; amount: number; currency: string;
  category: string; splitType: string; date: string; notes?: string;
  paidBy: { id: string; name: string; avatar?: string };
  splits: ExpenseSplit[]; receipt?: { url: string };
}
export interface ExpenseSplit { userId: string; amount: number; user: { id: string; name: string }; }
export interface Settlement {
  id: string; groupId: string; amount: number; currency: string; status: string; createdAt: string;
  from: { id: string; name: string; avatar?: string };
  to: { id: string; name: string; avatar?: string };
}
export interface SimplifiedTransaction {
  fromUserId: string; toUserId: string; amount: number; fromName: string; toName: string;
}
export interface Notification { id: string; type: string; title: string; body: string; read: boolean; createdAt: string; }
export interface Analytics {
  totalSpend: number; totalTransactions: number;
  byCategory: Record<string, number>; byMonth: Record<string, number>; byMember: Record<string, number>;
}
export interface PaginatedExpenses { expenses: Expense[]; total: number; page: number; pages: number; }
export interface CreateExpensePayload {
  groupId: string; title: string; amount: number; currency?: string; category?: string;
  splitType: 'EQUAL' | 'PERCENTAGE' | 'EXACT' | 'SHARES'; paidById: string; date?: string; notes?: string;
  splits: Array<{ userId: string; amount?: number; percent?: number; shares?: number }>;
}
