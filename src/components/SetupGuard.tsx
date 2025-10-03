'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, Users, Lock } from 'lucide-react';

interface SetupGuardProps {
  children: React.ReactNode;
}

export function SetupGuard({ children }: SetupGuardProps) {
  const { adminExists, isLoading, hasSupabaseConnection } = useAuth();
  
  // Debug logging
  console.log('SetupGuard - adminExists:', adminExists, 'isLoading:', isLoading, 'hasSupabase:', hasSupabaseConnection);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If Supabase is not connected, show a connection notice
  if (!hasSupabaseConnection) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Shield className="h-16 w-16 mx-auto mb-4 text-amber-500" />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Demo Mode - Notre Dame RFID System
              </h1>
              <p className="text-muted-foreground">
                Connect to Supabase for full functionality
              </p>
            </div>

            <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Shield className="h-5 w-5" />
                  Running in Demo Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-600 dark:text-amber-300 mb-4">
                  The system is currently running in demo mode. To enable full functionality with data persistence, please configure your Supabase connection.
                </p>
                <div className="space-y-2 text-sm">
                  <p>✅ User interface available</p>
                  <p>⚠️ Data will not persist</p>
                  <p>⚠️ RFID functionality limited</p>
                </div>
              </CardContent>
            </Card>

            {children}
          </div>
        </div>
      </div>
    );
  }

  // If no admin exists, show setup information
  if (!adminExists) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Notre Dame RFID System Setup
              </h1>
              <p className="text-muted-foreground">
                Initial system configuration required
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  System Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Admin Account Creation</h4>
                      <p className="text-sm text-muted-foreground">
                        Only one administrator account can be created during initial setup.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Teacher Account Management</h4>
                      <p className="text-sm text-muted-foreground">
                        After setup, only the admin can create teacher accounts from within the system.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">NDKC Email Requirements</h4>
                      <p className="text-sm text-muted-foreground">
                        Teachers must use their official NDKC email addresses to sign in.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {children}
          </div>
        </div>
      </div>
    );
  }

  // If admin exists, show normal app
  return <>{children}</>;
}