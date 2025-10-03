import { supabase } from './supabase';
import config from './config';

export interface SetupStatus {
  credentials: boolean;
  database: boolean;
  edgeFunctions: boolean;
  auth: boolean;
  overall: boolean;
  messages: string[];
}

export const checkSetupStatus = async (): Promise<SetupStatus> => {
  const status: SetupStatus = {
    credentials: false,
    database: false,
    edgeFunctions: false,
    auth: false,
    overall: false,
    messages: []
  };

  try {
    // Check 1: Credentials configured
    if (!config.supabase.url.includes('placeholder') && !config.supabase.anonKey.includes('placeholder')) {
      status.credentials = true;
      status.messages.push('✅ Supabase credentials configured');
    } else {
      status.messages.push('❌ Supabase credentials not configured');
      return status;
    }

    // Check 2: Database tables exist
    try {
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (!error) {
        status.database = true;
        status.messages.push('✅ Database tables exist');
      } else if (error.code === 'PGRST116') {
        status.messages.push('❌ Database tables not created. Run SQL script in Supabase dashboard.');
      } else {
        status.messages.push(`❌ Database error: ${error.message}`);
      }
    } catch (dbError: any) {
      status.messages.push(`❌ Database connection failed: ${dbError?.message ?? String(dbError)}`);
    }

    // Check 3: Edge Functions deployed
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const projectId = config.supabase.url.split('https://')[1].split('.supabase.co')[0];
      const functionName = 'server';
      const servicePrefix = 'make-server-12535d4a';
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/${functionName}/${servicePrefix}/health`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${config.supabase.anonKey}` },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        status.edgeFunctions = true;
        status.messages.push('✅ Edge Functions deployed');
      } else {
        status.messages.push(`❌ Edge Functions not responding: ${response.status}`);
      }
    } catch (funcError: any) {
      if (funcError && funcError.name === 'AbortError') {
        status.messages.push('❌ Edge Functions timeout (not deployed?)');
      } else {
        status.messages.push('❌ Edge Functions not deployed. Run: supabase functions deploy server');
      }
    }

    // Check 4: Auth service
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        status.auth = true;
        status.messages.push('✅ Authentication service working');
      } else {
        status.messages.push(`❌ Auth service error: ${error.message}`);
      }
    } catch (authError: any) {
      status.messages.push(`❌ Auth service failed: ${authError?.message ?? String(authError)}`);
    }

    // Overall status
    status.overall = status.credentials && status.database && status.auth;
    
    if (status.overall) {
      status.messages.push('🎉 Notre Dame RFID System ready!');
    } else {
      status.messages.push('⚠️ Setup incomplete. Check SUPABASE_DEPLOYMENT.md');
    }

  } catch (error: any) {
    status.messages.push(`❌ Setup check failed: ${error?.message ?? String(error)}`);
  }

  return status;
};

export const getSetupInstructions = (): string[] => {
  return [
    '1. Copy /lib/database-init.sql and run in Supabase SQL Editor',
    '2. Deploy Edge Functions: supabase functions deploy server',
    '3. Configure authentication in Supabase dashboard',
    '4. Test connection by refreshing the app',
    '',
    'See SUPABASE_DEPLOYMENT.md for detailed instructions'
  ];
};