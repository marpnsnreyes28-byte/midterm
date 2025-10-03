'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  currentRoute: string;
  navigate: (route: string, params?: Record<string, any>) => void;
  params: Record<string, any>;
  history: string[];
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

interface RouterProviderProps {
  children: React.ReactNode;
  initialRoute?: string;
}

export function RouterProvider({ children, initialRoute = 'dashboard' }: RouterProviderProps) {
  const [currentRoute, setCurrentRoute] = useState(initialRoute);
  const [params, setParams] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<string[]>([initialRoute]);

  const navigate = (route: string, newParams?: Record<string, any>) => {
    setCurrentRoute(route);
    setParams(newParams || {});
    setHistory(prev => [...prev, route]);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current route
      const previousRoute = newHistory[newHistory.length - 1];
      setCurrentRoute(previousRoute);
      setHistory(newHistory);
      setParams({});
    }
  };

  // Listen for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      // Handle browser navigation if needed
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{
      currentRoute,
      navigate,
      params,
      history,
      goBack
    }}>
      {children}
    </RouterContext.Provider>
  );
}