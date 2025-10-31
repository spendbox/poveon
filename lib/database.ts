import { supabase } from './supabase';
import { User, Request, UrgencyLevel, VerificationStatus } from '../types';

// ============================================
// USER OPERATIONS
// ============================================

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    password: '', // Not stored/returned from Supabase for security
    phone: profile.phone,
    bio: profile.bio,
    location: profile.location,
    walletBalance: parseFloat(profile.wallet_balance),
    verificationStatus: profile.verification_status as VerificationStatus,
    joinedDate: profile.created_at,
  };
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const dbUpdates: any = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
  if (updates.location !== undefined) dbUpdates.location = updates.location;
  if (updates.walletBalance !== undefined) dbUpdates.wallet_balance = updates.walletBalance;
  if (updates.verificationStatus !== undefined) dbUpdates.verification_status = updates.verificationStatus;

  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWalletBalance(userId: string, newBalance: number) {
  const { data, error } = await supabase
    .from('users')
    .update({ wallet_balance: newBalance })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// REQUEST OPERATIONS
// ============================================

export async function getAllRequests(): Promise<Request[]> {
  const { data: requests, error } = await supabase
    .from('requests')
    .select(`
      *,
      user:users!requests_user_id_fkey(name, verification_status),
      applications(user_id, applied_at, user:users!applications_user_id_fkey(name))
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return requests.map((req: any) => ({
    id: req.id,
    userId: req.user_id,
    userName: req.user.name,
    userVerification: req.user.verification_status,
    title: req.title,
    description: req.description,
    category: req.category,
    budget: parseFloat(req.budget),
    urgency: req.urgency as UrgencyLevel,
    whatsapp: req.whatsapp,
    email: req.email,
    createdAt: req.created_at,
    applicants: req.applications.map((app: any) => ({
      userId: app.user_id,
      userName: app.user.name,
      appliedAt: app.applied_at,
    })),
  }));
}

export async function createRequest(userId: string, requestData: Partial<Request>) {
  const { data, error } = await supabase
    .from('requests')
    .insert({
      user_id: userId,
      title: requestData.title!,
      description: requestData.description!,
      category: requestData.category!,
      budget: requestData.budget!,
      urgency: requestData.urgency || 'GENERAL',
      whatsapp: requestData.whatsapp,
      email: requestData.email,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRequest(requestId: string, updates: Partial<Request>) {
  const dbUpdates: any = {};

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
  if (updates.urgency !== undefined) dbUpdates.urgency = updates.urgency;
  if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;
  if (updates.email !== undefined) dbUpdates.email = updates.email;

  const { data, error } = await supabase
    .from('requests')
    .update(dbUpdates)
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRequest(requestId: string) {
  const { error } = await supabase
    .from('requests')
    .delete()
    .eq('id', requestId);

  if (error) throw error;
}

// ============================================
// APPLICATION OPERATIONS
// ============================================

export async function applyToRequest(userId: string, requestId: string) {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: userId,
      request_id: requestId,
    })
    .select()
    .single();

  if (error) {
    // Check if already applied
    if (error.code === '23505') {
      throw new Error('You have already applied to this request.');
    }
    throw error;
  }
  return data;
}

// ============================================
// UNLOCKED REQUESTS OPERATIONS
// ============================================

export async function getUnlockedRequests(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('unlocked_requests')
    .select('request_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(item => item.request_id);
}

export async function unlockRequest(userId: string, requestId: string) {
  const { data, error } = await supabase
    .from('unlocked_requests')
    .insert({
      user_id: userId,
      request_id: requestId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return; // Already unlocked, that's fine
    }
    throw error;
  }
  return data;
}
