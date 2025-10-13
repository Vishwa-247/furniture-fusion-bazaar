import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signingIn: boolean;
  signingUp: boolean;
  signingOut: boolean;
}

// Clean up any auth-related localStorage items
const clearAuthStorage = () => {
  try {
    // Remove any auth-related cached data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear auth storage:', error);
  }
};

// Validate if session is still valid
const isSessionValid = (session: Session | null): boolean => {
  if (!session) return false;
  
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at || 0;
  
  // Check if session expires within the next 60 seconds
  return expiresAt > (now + 60);
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    signingIn: false,
    signingUp: false,
    signingOut: false,
  });
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const { toast } = useToast();

  // Simple, direct auth state update
  const updateAuthState = (session: Session | null, loading: boolean = false) => {
    console.log('Auth state update:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      sessionValid: isSessionValid(session),
      loading 
    });
    
    setAuthState(prev => ({
      ...prev,
      user: session?.user ?? null,
      session: session,
      loading,
    }));
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change event:', event, { hasSession: !!session });
        
        // Validate session if it exists
        if (session && !isSessionValid(session)) {
          console.warn('Invalid session detected, clearing...');
          session = null;
        }
        
        updateAuthState(session, false);

        // Show welcome toast only for new sign-ins, not page refreshes
        if (event === 'SIGNED_IN' && session && !hasShownWelcome) {
          setHasShownWelcome(true);
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        }
        
        // Reset welcome flag on sign out
        if (event === 'SIGNED_OUT') {
          setHasShownWelcome(false);
        }
        
        // Clear auth storage on sign out
        if (event === 'SIGNED_OUT') {
          clearAuthStorage();
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Failed to get initial session:', error);
          updateAuthState(null, false);
          return;
        }
        
        // Validate session
        if (session && !isSessionValid(session)) {
          console.warn('Initial session is invalid, clearing...');
          await supabase.auth.signOut();
          updateAuthState(null, false);
          return;
        }
        
        updateAuthState(session, false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        updateAuthState(null, false);
      }
    };

    getInitialSession();

    return () => {
      console.log('Cleaning up auth subscription...');
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    console.log('Starting sign in...');
    setAuthState(prev => ({ ...prev, signingIn: true }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log('Sign in successful');
    } finally {
      setAuthState(prev => ({ ...prev, signingIn: false }));
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('Starting sign up...');
    setAuthState(prev => ({ ...prev, signingUp: true }));
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      console.log('Sign up successful');
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration.",
      });
    } finally {
      setAuthState(prev => ({ ...prev, signingUp: false }));
    }
  };

  const signInWithGoogle = async () => {
    console.log('Starting Google sign in...');
    setAuthState(prev => ({ ...prev, signingIn: true }));
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log('Google sign in initiated');
    } finally {
      // Note: OAuth redirects, so this may not execute
      setAuthState(prev => ({ ...prev, signingIn: false }));
    }
  };

  const signOut = async () => {
    console.log('Starting sign out...');
    
    // Clear local state immediately to prevent UI issues
    setAuthState(prev => ({ 
      ...prev, 
      signingOut: true,
      user: null,
      session: null 
    }));
    
    // Clear storage immediately
    clearAuthStorage();
    
    try {
      const { error } = await supabase.auth.signOut();
      
      // Handle "session not found" gracefully - it's not really an error
      if (error && !error.message.includes('session_not_found') && !error.message.includes('Session not found')) {
        console.error('Sign out error:', error);
        // Don't show toast for session not found errors
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      console.log('Sign out successful');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if sign out failed, we've already cleared local state
    } finally {
      setAuthState(prev => ({ 
        ...prev, 
        signingOut: false,
        user: null,
        session: null,
        loading: false
      }));
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
};