'use client';

import React from 'react';
import { AlertTriangle, ExternalLink, CheckCircle2, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { toast } from 'sonner';
import config from '../lib/config';

export function SupabaseSetupInstructions() {
  const isConfigured = 
    config.supabase.url !== 'https://placeholder.supabase.co' &&
    !config.supabase.anonKey.includes('placeholder');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isConfigured) {
    return (
      <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          Supabase credentials configured
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
      <CardHeader>
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <CardTitle className="text-yellow-900 dark:text-yellow-100">
              Supabase Setup Required
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Configure your Supabase credentials to enable the database
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Quick Setup:</h4>
          
          <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <div className="flex items-start gap-2">
              <span className="font-bold text-yellow-600 dark:text-yellow-400 min-w-[1.5rem]">1.</span>
              <div>
                Create a Supabase project at{' '}
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  supabase.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="font-bold text-yellow-600 dark:text-yellow-400 min-w-[1.5rem]">2.</span>
              <div>
                Go to <strong>Settings → API</strong> and copy your credentials
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="font-bold text-yellow-600 dark:text-yellow-400 min-w-[1.5rem]">3.</span>
              <div>
                Open <code className="bg-yellow-100 dark:bg-yellow-900 px-1.5 py-0.5 rounded">/lib/config.ts</code> and replace:
                <div className="mt-2 space-y-2 bg-yellow-100 dark:bg-yellow-900 p-3 rounded-md font-mono text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="break-all">
                      <div className="text-gray-600 dark:text-gray-400">url:</div>
                      <div className="text-yellow-900 dark:text-yellow-100">'https://your-project.supabase.co'</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 h-6 w-6 p-0"
                      onClick={() => copyToClipboard("url: 'https://your-project.supabase.co',", 'URL template')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="break-all">
                      <div className="text-gray-600 dark:text-gray-400">anonKey:</div>
                      <div className="text-yellow-900 dark:text-yellow-100">'your-anon-key-here'</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 h-6 w-6 p-0"
                      onClick={() => copyToClipboard("anonKey: 'your-anon-key-here',", 'Key template')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="font-bold text-yellow-600 dark:text-yellow-400 min-w-[1.5rem]">4.</span>
              <div>
                Run the database initialization script from <code className="bg-yellow-100 dark:bg-yellow-900 px-1.5 py-0.5 rounded">/lib/database-init.sql</code> in the Supabase SQL Editor
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="font-bold text-yellow-600 dark:text-yellow-400 min-w-[1.5rem]">5.</span>
              <div>
                Refresh this page
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            For detailed instructions, see{' '}
            <code className="bg-yellow-100 dark:bg-yellow-900 px-1.5 py-0.5 rounded">SUPABASE_SETUP.md</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}