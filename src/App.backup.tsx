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
import backgroundImage from 'figma:asset/c6409f5bfbac30511d9a6d08c29aa576014a5be7.png';

// Lazy load terminal page for better performance
const RfidTerminalPage = lazy(() => import('./components/RfidTerminalPage').then(m => ({ default: m.RfidTerminalPage })));

function AppContent() {
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

  // Background zoom effect - zooms in every 30 seconds, resets after reaching 2x zoom
  useEffect(() => {
    // Only start zoom effect after app has fully loaded
    if (!hasLoaded) return;
    
    const zoomInterval = setInterval(() => {
      setZoomLevel(prev => {
        const newZoom = prev + 0.1; // Increase zoom by 10% every 30 seconds
        
        // Reset zoom when it reaches 2x (200%)
        if (newZoom >= 2) {
          setZoomCycle(cycle => cycle + 1);
          return 1; // Reset to original size
        }
        
        return newZoom;
      });
    }, 30000); // 30 seconds

    return () => clearInterval(zoomInterval);
  }, [hasLoaded]);

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="text-sm text-muted-foreground">
            Loading Notre Dame RFID System...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Image with Zoom Effect - Only render after loaded */}
      {hasLoaded && (
        <div 
          className="fixed inset-0 z-0 opacity-10 transition-transform duration-[3000ms] ease-in-out will-change-transform"
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
      )}
      
      {/* Zoom indicator */}
      {hasLoaded && zoomLevel > 1.1 && (
        <div className="fixed top-4 right-4 z-20 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-muted-foreground border">
          Zoom: {Math.round(zoomLevel * 100)}% (Cycle: {zoomCycle + 1})
        </div>
      )}
      
      {/* Connection Status */}
      <ConnectionStatus />
      
      {/* Content */}
      <div className="relative z-10">
        <SetupGuard>
          {user ? (
            // Dashboard has its own layout structure
            <Dashboard />
          ) : (
            <>
              <Header />
              <main className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto mt-16">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      Welcome to Notre Dame
                    </h1>
                    <p className="text-muted-foreground">
                      RFID Classroom Attendance System
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      Please sign in to access the system
                    </p>
                    <div className="mt-6 p-4 bg-card border rounded-lg text-sm text-muted-foreground">
                      <p className="font-medium mb-2">Default Credentials:</p>
                      <p><strong>Admin:</strong> admin@ndkc.edu.ph / admin123</p>
                      <p className="text-xs mt-2 text-yellow-600 dark:text-yellow-400">
                        Change default password after first login
                      </p>
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
}

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