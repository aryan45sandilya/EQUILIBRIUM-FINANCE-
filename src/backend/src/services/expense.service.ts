import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/errorHandler';
import { emitToGroup } from '../socket';
import { createNotifications } from './notification.service';

type SplitType = 'EQUAL' | 'PERCENTAGE' | 'EXACT' | 'SHARES';

export interface CreateExpenseDto {
  groupId: string;
  title: string;
  amount: number;
  currency?: string;
  category?: string;
  splitType: SplitType;
  paidById: string;
  date?: string;
  notes?: string;
  splits: Array<{ userId: string; amount?: number; percent?: number; shares?: number }>;
}

export async function createExpense(dto: CreateExpenseDto, actorId: string) {
  await assertMember(dto.groupId, actorId);

  const computedSplits = computeSplits(dto.splitType, dto.amount, dto.splits);

  // If paidById not provided or empty, use the actor's own DB id
  const paidById = dto.paidById || actorId;

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      group_id: dto.groupId,
      title: dto.title,
      amount: dto.amount,
      currency: dto.currency ?? 'INR',
      category: dto.category ?? 'Other',
      split_type: dto.splitType,
      paid_by_id: paidById,
      date: dto.date ?? new Date().toISOString(),
      notes: dto.notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase expense insert error:', error);
    throw new AppError('Failed to create expense', 500);
  }

  await supabase.from('expense_splits').insert(
    computedSplits.map((s) => ({
      expense_id: expense.id,
      user_id: s.userId || actorId,
      amount: s.amount,
    }))
  );

  const full = await getExpenseById(expense.id);
  emitToGroup(dto.groupId, 'expense:created', full);

  // Notify all split participants except the payer
  const notifyUserIds = computedSplits
    .map((s) => s.userId)
    .filter((uid) => uid && uid !== paidById);

  console.log('[expense] paidById:', paidById, '| notifyUserIds:', notifyUserIds);

  if (notifyUserIds.length) {
    // Fetch payer name for the notification message
    const { data: payer } = await supabase
      .from('users')
      .select('name')
      .eq('id', paidById)
      .single();

    const payerName = payer?.name ?? 'Someone';

    // Send personalised notification per user with their own split amount
    for (const uid of notifyUserIds) {
      const split = computedSplits.find((s) => s.userId === uid);
      const owedAmount = split?.amount ?? 0;

      console.log('[expense] sending notification to userId:', uid, 'owedAmount:', owedAmount);

      await createNotifications([uid], {
        type: 'EXPENSE_ADDED',
        title: 'New expense added',
        body: `${payerName} added "${dto.title}" — you owe ₹${owedAmount.toFixed(2)}`,
        data: { expenseId: expense.id, groupId: dto.groupId },
      });
    }
  }

  return full;
}

export async function getGroupExpenses(groupId: string, userId: string, page = 1, limit = 20) {
  await assertMember(groupId, userId);

  const from = (page - 1) * limit;
  const { data: expenses, count } = await supabase
    .from('expenses')
    .select('*, paid_by:users!paid_by_id(id, name, avatar), expense_splits(*, user:users(id, name))', { count: 'exact' })
    .eq('group_id', groupId)
    .order('date', { ascending: false })
    .range(from, from + limit - 1);

  return { expenses: expenses ?? [], total: count ?? 0, page, pages: Math.ceil((count ?? 0) / limit) };
}

export async function deleteExpense(expenseId: string, actorId: string) {
  const { data: expense } = await supabase.from('expenses').select('group_id').eq('id', expenseId).single();
  if (!expense) throw new AppError('Expense not found', 404);
  await assertMember(expense.group_id, actorId);

  await supabase.from('expenses').delete().eq('id', expenseId);
  emitToGroup(expense.group_id, 'expense:deleted', { expenseId, groupId: expense.group_id });
}

async function getExpenseById(id: string) {
  const { data } = await supabase
    .from('expenses')
    .select('*, paid_by:users!paid_by_id(id, name, avatar), expense_splits(*, user:users(id, name))')
    .eq('id', id)
    .single();
  return data;
}

function computeSplits(splitType: SplitType, total: number, splits: CreateExpenseDto['splits']) {
  switch (splitType) {
    case 'EQUAL': {
      const share = Math.round((total / splits.length) * 100) / 100;
      return splits.map((s) => ({ userId: s.userId, amount: share }));
    }
    case 'PERCENTAGE': {
      return splits.map((s) => ({
        userId: s.userId,
        amount: Math.round((total * (s.percent ?? 0)) / 100 * 100) / 100,
      }));
    }
    case 'EXACT':
      return splits.map((s) => ({ userId: s.userId, amount: s.amount ?? 0 }));
    case 'SHARES': {
      const total_shares = splits.reduce((sum, s) => sum + (s.shares ?? 1), 0);
      return splits.map((s) => ({
        userId: s.userId,
        amount: Math.round((total * (s.shares ?? 1)) / total_shares * 100) / 100,
      }));
    }
    default:
      throw new AppError('Invalid split type', 400);
  }
}

async function assertMember(groupId: string, userId: string) {
  const { data } = await supabase
    .from('group_members').select('id').eq('group_id', groupId).eq('user_id', userId).single();
  if (!data) throw new AppError('Not a group member', 403);
}
