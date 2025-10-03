# Notre Dame RFID System - Supabase Deployment Guide

## ✅ Configuration Complete

Your Supabase instance has been successfully configured:

- **Project URL**: `https://foibpwuqcjtasarqwamx.supabase.co`
- **Project ID**: `foibpwuqcjtasarqwamx`
- **Status**: Ready for deployment

## Required Steps

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to Your Project

```bash
supabase link --project-ref foibpwuqcjtasarqwamx
```

### 4. Initialize Database

Run the SQL script in your Supabase dashboard:
1. Go to https://foibpwuqcjtasarqwamx.supabase.co/project/foibpwuqcjtasarqwamx/sql
2. Copy and paste the contents of `/lib/database-init.sql`
3. Click "Run" to create all tables and policies

### 5. Deploy Edge Functions

```bash
# Deploy the server function
supabase functions deploy server --project-ref foibpwuqcjtasarqwamx
```

### 6. Set Environment Variables

In your Supabase dashboard (Settings > Edge Functions), add:

```
SUPABASE_URL=https://foibpwuqcjtasarqwamx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaWJwd3VxY2p0YXNhcnF3YW14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI5Nzk3OCwiZXhwIjoyMDc0ODczOTc4fQ.IrVsFzkegTzoGnyX0uQBnQqEkNjmcNECfWM6DR3fIZI
```

## Database Schema

The system will automatically create these tables:
- `users` - Admin and teacher accounts
- `classrooms` - Physical classroom locations
- `schedules` - Class schedules linking teachers to classrooms
- `attendance_records` - RFID tap-in/tap-out records
- `notifications` - System notifications

## Authentication Setup

### Enable Email Authentication
1. Go to Authentication > Settings in your Supabase dashboard
2. Enable Email provider
3. Disable "Confirm email" for easier testing (optional)

### First Admin Account
After deployment, create the first admin account:
- Email: `admin@ndkc.edu.ph`
- Password: `admin123` (change after first login)

## Testing the Connection

After deployment, the system will:
1. ✅ Show "Database connected" instead of demo mode
2. ✅ Enable all RFID functionality
3. ✅ Allow real data storage and retrieval
4. ✅ Enable teacher registration with @ndkc.edu.ph emails

## API Endpoints

Your deployed functions will be available at:
```
https://foibpwuqcjtasarqwamx.supabase.co/functions/v1/make-server-12535d4a/health
https://foibpwuqcjtasarqwamx.supabase.co/functions/v1/make-server-12535d4a/init-database
https://foibpwuqcjtasarqwamx.supabase.co/functions/v1/make-server-12535d4a/rfid/tap-in
https://foibpwuqcjtasarqwamx.supabase.co/functions/v1/make-server-12535d4a/rfid/tap-out
```

## Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Email domain validation (@ndkc.edu.ph only)
- ✅ Role-based access control (admin/teacher)
- ✅ RFID ID validation and assignment
- ✅ Schedule-based attendance validation

## Next Steps

1. Deploy the database schema
2. Deploy the Edge Functions
3. Test the connection
4. Create your first admin account
5. Start adding teachers and classrooms
6. Begin RFID attendance tracking!

---

**Need Help?** Check the console logs in your browser's developer tools for detailed connection status and error messages.