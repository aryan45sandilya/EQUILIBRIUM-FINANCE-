import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/errorHandler';
import { emitToGroup } from '../socket';

export async function createSettlement(groupId: string, fromId: string, toId: string, amount: number, notes?: string) {
  if (fromId === toId) throw new AppError('Cannot settle with yourself', 400);

  const { data, error } = await supabase
    .from('settlements')
    .insert({ group_id: groupId, from_id: fromId, to_id: toId, amount, notes, status: 'COMPLETED' })
    .select('*, from:users!from_id(id, name, avatar), to:users!to_id(id, name, avatar)')
    .single();

  if (error) throw new AppError('Failed to create settlement', 500);

  emitToGroup(groupId, 'settlement:created', data);
  return data;
}

export async function getGroupSettlements(groupId: string, userId: string) {
  const { data } = await supabase
    .from('settlements')
    .select('*, from:users!from_id(id, name, avatar), to:users!to_id(id, name, avatar)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  return data ?? [];
}
