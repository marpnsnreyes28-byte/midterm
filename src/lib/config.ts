/**
 * Application Configuration
 * 
 * ✅ CONFIGURED: Notre Dame of Kidapawan College Supabase Instance
 * Project: foibpwuqcjtasarqwamx.supabase.co
 * 
 * Environment variables will override these fallback values.
 * See .env.local for current configuration.
 * 
 * Alternative setup via window.ENV in your index.html:
 * <script>
 *   window.ENV = {
 *     SUPABASE_URL: 'https://your-project.supabase.co',
 *     SUPABASE_ANON_KEY: 'your-anon-key-here'
 *   };
 * </script>
 */

// Safe environment variable access for both server and client
const getEnvVar = (key: string, fallback: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  return fallback;
};

export const config = {
  supabase: {
    // Notre Dame of Kidapawan College Supabase credentials
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://foibpwuqcjtasarqwamx.supabase.co'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaWJwd3VxY2p0YXNhcnF3YW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTc5NzgsImV4cCI6MjA3NDg3Mzk3OH0.V9hIgBL0aOswZTXSDT8UR6YzajCQcb_ElA4cQFcGV1s'),
  },
  app: {
    name: 'NDKC RFID Attendance System',
    schoolName: 'Notre Dame of Kidapawan College',
    emailDomain: '@ndkc.edu.ph',
    gracePeriodMinutes: 15,
  }
}

// Check if running in browser and if ENV is set via window (fallback method)
if (typeof window !== 'undefined' && (window as any).ENV) {
  const env = (window as any).ENV
  if (env.SUPABASE_URL && config.supabase.url.includes('placeholder')) {
    config.supabase.url = env.SUPABASE_URL
  }
  if (env.SUPABASE_ANON_KEY && config.supabase.anonKey.includes('placeholder')) {
    config.supabase.anonKey = env.SUPABASE_ANON_KEY
  }
}

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !config.supabase.url.includes('placeholder') && 
         !config.supabase.anonKey.includes('placeholder');
}

export default config