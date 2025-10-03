'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Wifi, X } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

let motion: any, AnimatePresence: any;
try {
  const motionModule = require('motion/react');
  motion = motionModule.motion;
  AnimatePresence = motionModule.AnimatePresence;
} catch {
  motion = { div: 'div' };
  AnimatePresence = ({ children }: { children: React.ReactNode }) => children;
}

export function ConnectionStatus() {
  const { hasSupabaseConnection, isLoading } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

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
            Connecting to Firebase...
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

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
          <span>Firebase connected</span>
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
