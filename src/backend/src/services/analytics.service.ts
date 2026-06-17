import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/errorHandler';

export async function getGroupAnalytics(groupId: string, userId: string) {
  const { data: membership } = await supabase
    .from('group_members').select('id').eq('group_id', groupId).eq('user_id', userId).single();
  if (!membership) throw new AppError('Access denied', 403);

  const { data: expenses } = await supabase.from('expenses').select('*').eq('group_id', groupId);
  const list = expenses ?? [];

  const byCategory: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  const byMember: Record<string, number> = {};

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);

  for (const e of list) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
    byMember[e.paid_by_id] = (byMember[e.paid_by_id] ?? 0) + e.amount;
    if (new Date(e.date) >= cutoff) {
      const key = e.date.slice(0, 7);
      byMonth[key] = (byMonth[key] ?? 0) + e.amount;
    }
  }

  return {
    totalSpend: list.reduce((s, e) => s + e.amount, 0),
    totalTransactions: list.length,
    byCategory,
    byMonth,
    byMember,
  };
}
