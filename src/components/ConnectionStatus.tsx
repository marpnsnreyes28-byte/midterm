'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { AlertTriangle, CheckCircle, Wifi, X } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
// Motion components with fallback for preview
let motion: any, AnimatePresence: any;
try {
  const motionModule = require('motion/react');
  motion = motionModule.motion;
  AnimatePresence = motionModule.AnimatePresence;
} catch {
  // Fallback to div for preview
  motion = { div: 'div' };
  AnimatePresence = ({ children }: { children: React.ReactNode }) => children;
}
import { SupabaseSetupInstructions } from './SupabaseSetupInstructions';
import { isSupabaseConfigured } from '../lib/config';

export function ConnectionStatus() {
  const { hasSupabaseConnection, isLoading } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const isConfigured = isSupabaseConfigured();

  if (isDismissed) {
    return null;
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50"
      >
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Wifi className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Connecting to database...
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  if (!hasSupabaseConnection && !isConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <AnimatePresence>
          {!showSetup ? (
            <Alert 
              variant="destructive" 
              className="bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-700 relative"
            >
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <div className="flex items-center justify-between gap-3">
                  <span>Supabase not configured</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSetup(true)}
                      className="h-7 text-xs border-yellow-400 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-200 dark:hover:bg-yellow-900"
                    >
                      Setup
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsDismissed(true)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSetup(false)}
                  className="absolute top-2 right-2 h-6 w-6 p-0 z-10"
                >
                  <X className="h-4 w-4" />
                </Button>
                <SupabaseSetupInstructions />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (!hasSupabaseConnection) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <Alert variant="destructive" className="bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-700">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Setup Required</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsDismissed(true)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs space-y-1">
                <p>• Deploy database schema in Supabase SQL Editor</p>
                <p>• Run RLS fix script: /lib/database-fix-rls.sql</p>
                <p>• Deploy Edge Functions</p>
                <p>• Check SUPABASE_DEPLOYMENT.md</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="h-7 text-xs border-yellow-400 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-200 dark:hover:bg-yellow-900"
                >
                  Retry
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  // Success state - auto-dismiss after 3 seconds
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50"
    >
      <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-800 dark:text-green-200 flex items-center justify-between gap-3">
          <span>Database connected</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}