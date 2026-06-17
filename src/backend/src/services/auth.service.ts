import { createClerkClient } from '@clerk/backend';
import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/errorHandler';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

/**
 * Find or create a user in Supabase from a Clerk user ID.
 * Called on every authenticated request.
 */
export async function findOrCreateUser(clerkId: string) {
  // Check if user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (existing) return existing;

  // Fetch from Clerk and create
  const clerkUser = await clerk.users.getUser(clerkId);
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
  const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || email;

  const { data: newUser, error } = await supabase
    .from('users')
    .upsert({ clerk_id: clerkId, email, name, avatar: clerkUser.imageUrl })
    .select()
    .single();

  if (error) throw new AppError('Failed to create user', 500);
  return newUser;
}
