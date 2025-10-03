# Supabase Edge Functions

This folder contains the Edge Functions used by the NDKC RFID system.

Deploy steps

1. Install Supabase CLI (if not already installed):

```powershell
npm install -g supabase
```

2. Login to Supabase:

```powershell
supabase login
```

3. Link the project (use the project ref from SUPABASE_DEPLOYMENT.md):

```powershell
supabase link --project-ref foibpwuqcjtasarqwamx
```

4. Ensure environment variables are set (Dashboard → Edge Functions → Environment variables):

- SUPABASE_URL=https://foibpwuqcjtasarqwamx.supabase.co
- SUPABASE_SERVICE_ROLE_KEY=<your service role key>

5. Deploy the function(s):

```powershell
supabase functions deploy server --project-ref foibpwuqcjtasarqwamx
```

6. Verify endpoints (health/init/tap-in/tap-out) via HTTP requests; use the service role key for init and other privileged endpoints.

Notes

- These files are intended to run in Deno on Supabase Edge Functions. The TypeScript language service in your editor may report unresolved imports or missing `Deno` types; this is expected and harmless for deployment.
- Do NOT commit any service role keys to version control. Use the Supabase dashboard or secrets manager.
