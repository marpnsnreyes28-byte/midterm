'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { SetupGuard } from './components/SetupGuard';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConnectionStatus } from './components/ConnectionStatus';
import { Toaster } from './components/ui/sonner';
// Background image - use Unsplash university campus image
const backgroundImage = 'https://images.unsplash.com/photo-1707189571354-863e46efbbcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmclMjBncmVlbnxlbnwxfHx8fDE3NTkzMjc1OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

// Lazy load terminal page for better performance
const RfidTerminalPage = lazy(() => import('./components/RfidTerminalPage').then(m => ({ default: m.RfidTerminalPage })));

const AppContent = React.memo(() => {
  const { user, isLoading, hasSupabaseConnection } = useAuth();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomCycle, setZoomCycle] = useState(0);
  const [isTerminalRoute, setIsTerminalRoute] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Debug logging for app state
  console.log('AppContent render - isLoading:', isLoading, 'user:', !!user, 'hasSupabase:', hasSupabaseConnection);

  // Check if we're on the terminal route
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      setIsTerminalRoute(path === '/terminal' || path.includes('/terminal'));
    };
    
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  // Mark as loaded when isLoading becomes false
  useEffect(() => {
    if (!isLoading && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isLoading, hasLoaded]);

  // Background zoom effect - only on the public home (logged-out) page
  useEffect(() => {
    if (!hasLoaded) return;
    // Only enable zoom when user is NOT authenticated (home/landing)
    if (user) return;

    const zoomInterval = setInterval(() => {
      setZoomLevel(prev => {
        const newZoom = prev + 0.1;
        if (newZoom >= 2) {
          setZoomCycle(cycle => cycle + 1);
          return 1;
        }
        return newZoom;
      });
    }, 10000);

    return () => clearInterval(zoomInterval);
  }, [hasLoaded, user]);

  // If on terminal route, show terminal page directly (no auth required for kiosk mode)
  if (isTerminalRoute) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      }>
        <RfidTerminalPage />
      </Suspense>
    );
  }

  // Show minimal loading UI only briefly
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="text-sm text-muted-foreground text-center">
            Loading Notre Dame RFID System...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background layer only on home (unauthenticated) */}
      {hasLoaded && !user && (
        <div className="fixed inset-0 z-0 bg-layer pointer-events-none" aria-hidden>
          <div
            className="bg-zoom bg-image absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              filter: zoomLevel > 1.5 ? 'brightness(1.1)' : 'brightness(1)'
            }}
          />
          <div
            className="bg-zoom bg-gradient absolute inset-0 opacity-5"
            style={{
              background: 'linear-gradient(135deg, var(--nd-green) 0%, var(--nd-blue) 50%, var(--nd-yellow) 100%)',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              filter: zoomLevel > 1.5 ? 'brightness(1.1)' : 'brightness(1)'
            }}
          />
        </div>
      )}
      
      {/* Zoom indicator only on home (unauthenticated) */}
      {hasLoaded && !user && zoomLevel > 1.1 && (
        <div className="fixed top-4 right-4 z-20 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-muted-foreground border">
          Zoom: {Math.round(zoomLevel * 100)}% (Cycle: {zoomCycle + 1})
        </div>
      )}
      
      {/* Demo mode indicator */}
      {hasLoaded && !hasSupabaseConnection && (
        <div className="fixed bottom-4 left-4 z-20 bg-amber-100/90 dark:bg-amber-900/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-sm">
          🔧 Demo Mode - Connect Supabase for full functionality
        </div>
      )}
      
  {/* Connection Status */}
  <ConnectionStatus />
      
  {/* Content (separate layer from background animation) */}
  <div className="relative z-10 content-layer">
        <SetupGuard>
          {user ? (
            // Dashboard has its own layout structure
            <Dashboard />
          ) : (
            <>
              <Header />
              <main className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto mt-8">
                  <div className="text-center mb-8">
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-foreground mb-2">
                        Welcome to Notre Dame
                      </h1>
                      <p className="text-muted-foreground">
                        RFID Classroom Attendance System
                      </p>
                      <p className="text-sm text-muted-foreground mt-4">
                        Please sign in to access the system
                      </p>
                    </div>
                    
                    {/* Demo credentials info */}
                    <div className="mt-6 p-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg text-sm text-muted-foreground shadow-sm">
                      <p className="font-medium mb-2 text-foreground">Setup Instructions:</p>
                      <div className="space-y-2 text-xs">
                        <p className="text-foreground">
                          <strong>1. First Admin Setup:</strong><br/>
                          Use any valid email format (e.g., admin@test.com)<br/>
                          Password: minimum 6 characters
                        </p>
                        <p className="text-foreground">
                          <strong>2. After Setup:</strong><br/>
                          Teachers must use @ndkc.edu.ph emails
                        </p>
                        <p className="text-amber-600 dark:text-amber-400 mt-2">
                          ⚠️ Database setup required for full functionality
                        </p>
                      </div>
                    </div>
                  </div>
                  <LoginForm />
                </div>
              </main>
            </>
          )}
        </SetupGuard>
      </div>
      
      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
});

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}