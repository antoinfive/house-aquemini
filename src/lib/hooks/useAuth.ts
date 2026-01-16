'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isOwner: boolean;
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isOwner: false,
  });

  const supabase = createClient();

  // Fetch user profile from profiles table
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isOwner: profile?.is_owner ?? false,
          });
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isOwner: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isOwner: profile?.is_owner ?? false,
          });
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isOwner: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [supabase]);

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isOwner: false,
    });
  }, [supabase]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.refreshSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      setState({
        user: session.user,
        profile,
        session,
        isLoading: false,
        isOwner: profile?.is_owner ?? false,
      });
    }
  }, [supabase, fetchProfile]);

  return {
    ...state,
    signIn,
    signOut,
    refreshSession,
  };
}
