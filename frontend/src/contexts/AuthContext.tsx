import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Agent } from '../types';

interface AuthContextType {
  token: string | null;
  agent: Agent | null;
  login: (token: string, agent: Agent) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedAgent = localStorage.getItem('agent');
    if (storedToken && storedAgent) {
      setToken(storedToken);
      setAgent(JSON.parse(storedAgent));
    }
  }, []);

  const login = (newToken: string, newAgent: Agent) => {
    setToken(newToken);
    setAgent(newAgent);
    localStorage.setItem('token', newToken);
    localStorage.setItem('agent', JSON.stringify(newAgent));
  };

  const logout = () => {
    setToken(null);
    setAgent(null);
    localStorage.removeItem('token');
    localStorage.removeItem('agent');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        agent,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
