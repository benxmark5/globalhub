import { createContext, useContext, type ReactNode } from 'react';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string | null }>;
  signInWithGoogle: () => Promise<void>;
}

const defaultContextValue: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => undefined,
};

const AuthContext = createContext<AuthContextValue>(defaultContextValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={defaultContextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
