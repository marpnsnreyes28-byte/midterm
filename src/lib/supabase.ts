import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import config from './config'

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey
)

// Helper function to get project ID from Supabase URL
const getProjectId = () => {
  if (config.supabase.url.includes('placeholder')) {
    return null;
  }
  return config.supabase.url.split('https://')[1]?.split('.supabase.co')[0];
}

// RFID tap-in function
export const tapInRFID = async (rfidId: string, classroomId: string) => {
  try {
    const projectId = getProjectId();
    if (!projectId) {
      throw new Error('Supabase not configured');
    }

    const functionName = 'server';
    const servicePrefix = `make-server-12535d4a`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    // Note: our Edge Function is deployed with the name `server` and hosts internal routes
    // under /make-server-12535d4a/... so the full path is /functions/v1/server/make-server-12535d4a/...
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/${functionName}/${servicePrefix}/rfid/tap-in`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.supabase.anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rfidId, classroomId }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('RFID service not available. Edge Functions need to be deployed.');
      }
      throw new Error(`RFID tap-in failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error: any) {
    if (error && error.name === 'AbortError') {
      console.error('RFID tap-in timed out');
      return { success: false, error: 'RFID service timed out' };
    }
    console.error('RFID tap-in error:', error);
    return { success: false, error: error?.message ?? String(error) };
  }
}

// Admin create teacher via Edge Function (uses service role on server)
export const createTeacherServer = async (payload: {
  email: string;
  password: string;
  name: string;
  department?: string;
  rfidId?: string;
  isActive?: boolean;
}) => {
  const projectId = getProjectId();
  if (!projectId) throw new Error('Supabase not configured');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const functionName = 'server';
  const servicePrefix = `make-server-12535d4a`;

  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/${functionName}/${servicePrefix}/admin/create-teacher`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.supabase.anonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Create teacher failed: ${response.status} ${response.statusText} ${text}`);
  }
  return response.json();
}

// RFID tap-out function
export const tapOutRFID = async (rfidId: string) => {
  try {
    const projectId = getProjectId();
    if (!projectId) {
      throw new Error('Supabase not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const functionName = 'server';
    const servicePrefix = `make-server-12535d4a`;

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/${functionName}/${servicePrefix}/rfid/tap-out`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.supabase.anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rfidId }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('RFID service not available. Edge Functions need to be deployed.');
      }
      throw new Error(`RFID tap-out failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error: any) {
    if (error && error.name === 'AbortError') {
      console.error('RFID tap-out timed out');
      return { success: false, error: 'RFID service timed out' };
    }
    console.error('RFID tap-out error:', error);
    return { success: false, error: error?.message ?? String(error) };
  }
}

// Initialize database tables and policies
export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing NDKC RFID database...');
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Call our server endpoint to initialize the database
    const functionName = 'server';
    const servicePrefix = `make-server-12535d4a`;

    const response = await fetch(`https://${config.supabase.url.split('https://')[1].split('.supabase.co')[0]}.supabase.co/functions/v1/${functionName}/${servicePrefix}/init-database`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.supabase.anonKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Edge Functions not deployed. Please deploy using: supabase functions deploy server');
      }
      throw new Error(`Database initialization failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ NDKC RFID database initialized successfully');
    } else {
      console.error('❌ Database initialization failed:', result.error);
    }
    
    return result;
    
  } catch (error: any) {
    if (error && error.name === 'AbortError') {
      console.error('❌ Database initialization timed out');
      throw new Error('Database initialization timed out. Edge Functions may not be deployed.');
    }
    console.error('❌ Error initializing database:', error);
    
    // Fallback: Try to check if tables exist by querying them
    try {
      console.log('🔄 Fallback: Checking if database tables exist...');
      const { data: users, error: usersError } = await supabase.from('users').select('count', { count: 'exact', head: true });
      
      if (!usersError) {
        console.log('📊 Database tables appear to exist and are accessible');
        return { success: true, message: 'Database tables already exist' };
      } else if (usersError.code === 'PGRST116') {
        console.log('📋 Database tables do not exist yet. Please run the SQL initialization script.');
        return { success: false, error: 'Database tables not initialized. Please run the SQL script in your Supabase dashboard.' };
      } else {
        throw usersError;
      }
    } catch (fallbackError: any) {
      console.error('⚠️ Database connection issues:', fallbackError);
      return { success: false, error: `Database connection failed: ${fallbackError?.message ?? String(fallbackError)}` };
    }
  }
}