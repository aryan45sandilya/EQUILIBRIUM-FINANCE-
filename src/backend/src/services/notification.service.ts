import { supabase } from '../lib/supabase';
import { emitToUser } from '../socket';

interface NotificationPayload {
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Creates notifications for a list of DB user IDs.
 * Fetches each user's clerkId to emit the real-time socket event correctly,
 * since the socket layer maps connections by clerkId (JWT sub).
 */
export async function createNotifications(userIds: string[], payload: NotificationPayload) {
  if (!userIds.length) return;

  console.log('[notifications] creating for userIds:', userIds, '| type:', payload.type);

  // Persist notifications using DB user IDs
  const { error: insertError } = await supabase.from('notifications').insert(
    userIds.map((userId) => ({ user_id: userId, ...payload }))
  );

  if (insertError) {
    console.error('[notifications] insert error:', insertError);
  }

  // Fetch clerkIds for real-time delivery
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('id, clerk_id')
    .in('id', userIds);

  if (fetchError) console.error('[notifications] user fetch error:', fetchError);
  console.log('[notifications] users found for socket emit:', users);

  if (users) {
    for (const user of users) {
      const clerkId = user.clerk_id;
      if (clerkId) {
        console.log('[notifications] emitting to clerkId:', clerkId);
        emitToUser(clerkId, 'notification:new', payload);
      } else {
        console.warn('[notifications] user', user.id, 'has no clerk_id — skipping socket emit');
      }
    }
  }
}

export async function getUserNotifications(userId: string, unreadOnly = false) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (unreadOnly) query = query.eq('read', false);
  const { data, error } = await query;
  if (error) console.error('[notifications] getUserNotifications error:', error);

  // Map snake_case DB fields to camelCase for the frontend
  return (data ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    read: n.read,
    data: n.data,
    createdAt: n.created_at,
  }));
}

export async function markRead(id: string, userId: string) {
  await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', userId);
}

export async function markAllRead(userId: string) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
}
