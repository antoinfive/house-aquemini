'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
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

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Create a singleton supabase client for the auth context
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isOwner: false,
  });

  // Use singleton supabase client
  const supabase = useMemo(() => getSupabaseClient(), []);

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
    let isMounted = true;
    let initialLoadDone = false;

    const updateAuthState = async (session: Session | null) => {
      if (!isMounted) return;

      if (session?.user) {
        // Set user immediately to show email faster
        setState(prev => ({
          ...prev,
          user: session.user,
          session,
        }));

        try {
          const profile = await fetchProfile(session.user.id);
          if (!isMounted) return;

          setState({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isOwner: profile?.is_owner ?? false,
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
          if (!isMounted) return;
          // Still show user even if profile fetch fails
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          isOwner: false,
        });
      }
    };

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await updateAuthState(session);
        initialLoadDone = true;
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
        initialLoadDone = true;
      }
    };

    initializeAuth();

    // Listen for auth state changes (skip initial event since we handle it above)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip INITIAL_SESSION since we handle it with getSession()
        if (event === 'INITIAL_SESSION') return;

        // Wait for initial load to complete to avoid race conditions
        if (!initialLoadDone) return;

        await updateAuthState(session);
      }
    );

    return () => {
      isMounted = false;
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

  const value = useMemo(() => ({
    ...state,
    signIn,
    signOut,
    refreshSession,
  }), [state, signIn, signOut, refreshSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
