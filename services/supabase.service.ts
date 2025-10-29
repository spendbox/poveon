import { supabase } from '../supabase.config';
import { User, Request, UrgencyLevel, VerificationStatus } from '../types';

// ============================================
// TYPES FOR DATABASE
// ============================================

export interface DBUser {
  id: string;
  name: string;
  email: string;
  wallet_balance: number;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface DBRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  urgency: UrgencyLevel;
  raw_input?: string;
  whatsapp?: string;
  email?: string;
  created_at: string;
}

export interface DBApplication {
  id: string;
  request_id: string;
  user_id: string;
  applied_at: string;
}

export interface DBTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  reference?: string;
  created_at: string;
}

// ============================================
// AUTHENTICATION
// ============================================

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get the current user
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ============================================
// USER OPERATIONS
// ============================================

export const userService = {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      walletBalance: data.wallet_balance,
      verificationStatus: data.verification_status,
    };
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<DBUser>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update wallet balance
   */
  async updateWalletBalance(userId: string, newBalance: number) {
    const { error } = await supabase
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Start verification process
   */
  async startVerification(userId: string) {
    return this.updateUserProfile(userId, {
      verification_status: 'PENDING',
    });
  },

  /**
   * Complete verification
   */
  async completeVerification(userId: string) {
    return this.updateUserProfile(userId, {
      verification_status: 'VERIFIED',
    });
  },
};

// ============================================
// REQUEST OPERATIONS
// ============================================

export const requestService = {
  /**
   * Get all requests with user information and applicant count
   */
  async getAllRequests(): Promise<Request[]> {
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select(`
        *,
        users!requests_user_id_fkey (
          name,
          verification_status
        ),
        applications (
          id,
          user_id,
          applied_at,
          users!applications_user_id_fkey (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (requestsError) throw requestsError;

    return requests.map((req: any) => ({
      id: req.id,
      userId: req.user_id,
      userName: req.users.name,
      userVerification: req.users.verification_status,
      title: req.title,
      description: req.description,
      category: req.category,
      budget: req.budget,
      urgency: req.urgency,
      rawInput: req.raw_input,
      whatsapp: req.whatsapp,
      email: req.email,
      createdAt: req.created_at,
      applicants: req.applications.map((app: any) => ({
        userId: app.user_id,
        userName: app.users.name,
        appliedAt: app.applied_at,
      })),
    }));
  },

  /**
   * Get a single request by ID
   */
  async getRequestById(requestId: string): Promise<Request | null> {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        users!requests_user_id_fkey (
          name,
          verification_status
        ),
        applications (
          id,
          user_id,
          applied_at,
          users!applications_user_id_fkey (
            name
          )
        )
      `)
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('Error fetching request:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      userName: data.users.name,
      userVerification: data.users.verification_status,
      title: data.title,
      description: data.description,
      category: data.category,
      budget: data.budget,
      urgency: data.urgency,
      rawInput: data.raw_input,
      whatsapp: data.whatsapp,
      email: data.email,
      createdAt: data.created_at,
      applicants: data.applications.map((app: any) => ({
        userId: app.user_id,
        userName: app.users.name,
        appliedAt: app.applied_at,
      })),
    };
  },

  /**
   * Create a new request
   */
  async createRequest(requestData: {
    userId: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    urgency: UrgencyLevel;
    rawInput?: string;
    whatsapp?: string;
    email?: string;
  }) {
    const { data, error } = await supabase
      .from('requests')
      .insert([
        {
          user_id: requestData.userId,
          title: requestData.title,
          description: requestData.description,
          category: requestData.category,
          budget: requestData.budget,
          urgency: requestData.urgency,
          raw_input: requestData.rawInput,
          whatsapp: requestData.whatsapp,
          email: requestData.email,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a request
   */
  async updateRequest(requestId: string, updates: Partial<DBRequest>) {
    const { data, error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a request
   */
  async deleteRequest(requestId: string) {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', requestId);

    if (error) throw error;
  },
};

// ============================================
// APPLICATION OPERATIONS
// ============================================

export const applicationService = {
  /**
   * Apply to a request
   */
  async applyToRequest(requestId: string, userId: string) {
    const { data, error } = await supabase
      .from('applications')
      .insert([
        {
          request_id: requestId,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Check if user has applied to a request
   */
  async hasUserApplied(requestId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('request_id', requestId)
      .eq('user_id', userId)
      .single();

    return !error && data !== null;
  },

  /**
   * Get applications for a request
   */
  async getApplicationsForRequest(requestId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        users!applications_user_id_fkey (
          name
        )
      `)
      .eq('request_id', requestId);

    if (error) throw error;
    return data;
  },

  /**
   * Get user's applications
   */
  async getUserApplications(userId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        requests (
          *,
          users!requests_user_id_fkey (
            name
          )
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  /**
   * Delete an application
   */
  async deleteApplication(requestId: string, userId: string) {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('request_id', requestId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};

// ============================================
// TRANSACTION OPERATIONS
// ============================================

export const transactionService = {
  /**
   * Create a transaction (credit or debit)
   */
  async createTransaction(
    userId: string,
    amount: number,
    type: 'CREDIT' | 'DEBIT',
    description: string,
    reference?: string
  ) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          amount,
          type,
          description,
          reference,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user's transaction history
   */
  async getUserTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Add funds to wallet (creates transaction and updates balance)
   */
  async addFunds(userId: string, amount: number, reference?: string) {
    // Get current balance
    const user = await userService.getUserProfile(userId);
    if (!user) throw new Error('User not found');

    const newBalance = user.walletBalance + amount;

    // Create transaction
    await this.createTransaction(
      userId,
      amount,
      'CREDIT',
      'Wallet top-up',
      reference
    );

    // Update wallet balance
    await userService.updateWalletBalance(userId, newBalance);

    return newBalance;
  },

  /**
   * Deduct funds from wallet (creates transaction and updates balance)
   */
  async deductFunds(userId: string, amount: number, description: string) {
    // Get current balance
    const user = await userService.getUserProfile(userId);
    if (!user) throw new Error('User not found');

    if (user.walletBalance < amount) {
      throw new Error('Insufficient funds');
    }

    const newBalance = user.walletBalance - amount;

    // Create transaction
    await this.createTransaction(userId, amount, 'DEBIT', description);

    // Update wallet balance
    await userService.updateWalletBalance(userId, newBalance);

    return newBalance;
  },
};

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export const realtimeService = {
  /**
   * Subscribe to new requests
   */
  subscribeToRequests(callback: (payload: any) => void) {
    return supabase
      .channel('requests-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to applications for a specific request
   */
  subscribeToApplications(requestId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`applications-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `request_id=eq.${requestId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  },
};
