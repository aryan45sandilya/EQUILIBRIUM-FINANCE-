import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/errorHandler';
import { getSimplifiedDebts } from './debtSimplification.service';

export async function createGroup(name: string, description: string | undefined, currency: string, creatorId: string) {
  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, description, currency })
    .select()
    .single();

  if (error) throw new AppError('Failed to create group', 500);

  await supabase.from('group_members').insert({ group_id: group.id, user_id: creatorId, role: 'ADMIN' });

  return getGroupById(group.id, creatorId);
}

export async function getUserGroups(userId: string) {
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId);

  if (!memberships?.length) return [];

  const groupIds = memberships.map((m) => m.group_id);

  const { data: groups } = await supabase
    .from('groups')
    .select('*, group_members(id, role, user:users(id, name, avatar))')
    .in('id', groupIds);

  return groups ?? [];
}

export async function getGroupById(groupId: string, userId: string) {
  const { data: group } = await supabase
    .from('groups')
    .select('*, group_members(id, role, user:users(id, name, avatar, email))')
    .eq('id', groupId)
    .single();

  if (!group) throw new AppError('Group not found', 404);

  const isMember = group.group_members?.some((m: any) => m.user?.id === userId);
  if (!isMember) throw new AppError('Access denied', 403);

  return group;
}

export async function addMember(groupId: string, inviteeEmail: string, adminId: string) {
  // Check admin
  const { data: adminMembership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', adminId)
    .single();

  if (!adminMembership || adminMembership.role !== 'ADMIN') throw new AppError('Admin required', 403);

  const { data: invitee } = await supabase.from('users').select('*').eq('email', inviteeEmail).single();
  if (!invitee) throw new AppError('User not found', 404);

  const { error } = await supabase.from('group_members').insert({ group_id: groupId, user_id: invitee.id });
  if (error?.code === '23505') throw new AppError('Already a member', 409);

  return invitee;
}

export async function getGroupDebts(groupId: string, userId: string) {
  await assertMember(groupId, userId);

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, expense_splits(*)')
    .eq('group_id', groupId);

  console.log('Expenses for debt calc:', JSON.stringify(expenses, null, 2));

  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, user:users(id, name)')
    .eq('group_id', groupId);

  // Fetch completed settlements so they offset the balances
  const { data: settlements } = await supabase
    .from('settlements')
    .select('from_id, to_id, amount')
    .eq('group_id', groupId)
    .eq('status', 'COMPLETED');

  const expensesForAlgo = (expenses ?? []).map((e: any) => ({
    paidById: e.paid_by_id,
    amount: e.amount,
    splits: (e.expense_splits ?? []).map((s: any) => ({ userId: s.user_id, amount: s.amount })),
  }));

  // Model each settlement as a synthetic expense to offset the original debt.
  // The person who paid (from_id) is credited, and the receiver (to_id) is debited.
  // This mirrors the real money flow: B paid A → B's balance goes up, A's goes down.
  const settlementExpenses = (settlements ?? []).map((s: any) => ({
    paidById: s.from_id,   // the payer is credited
    amount: s.amount,
    splits: [{ userId: s.to_id, amount: s.amount }], // the receiver is debited
  }));

  const membersForAlgo = (members ?? []).map((m: any) => ({
    id: m.user_id,
    name: m.user?.name ?? m.user_id,
  }));

  return getSimplifiedDebts([...expensesForAlgo, ...settlementExpenses], membersForAlgo);
}

async function assertMember(groupId: string, userId: string) {
  const { data } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();
  if (!data) throw new AppError('Not a group member', 403);
}
