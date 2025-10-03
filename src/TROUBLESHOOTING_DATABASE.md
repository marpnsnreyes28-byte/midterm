# Database Connection Troubleshooting

## Issue: RLS Policy Infinite Recursion Error

**Error Message:** `infinite recursion detected in policy for relation "users"`

### Quick Fix:
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the contents of `/lib/database-fix-rls.sql`
4. This will temporarily disable RLS policies to allow the app to function

### What this fixes:
- Teachers loading error
- Classrooms loading error  
- Schedules loading error
- Attendance loading error
- Notifications loading error

---

## Issue: Email Address Invalid Errors

**Error Messages:** 
- `Email address "admin@ndkc.edu.ph" is invalid`
- `Email address "superadmin@ndkc.edu.ph" is invalid`

### Solution:
1. **For Initial Admin Setup:** Use a standard email format like `admin@test.com` or `admin@example.com`
2. **For Teachers:** NDKC emails (@ndkc.edu.ph) can be added after the initial admin setup
3. The system will convert emails internally for demo purposes

### Working Email Formats:
- ✅ `admin@test.com`
- ✅ `admin@example.com` 
- ✅ `superadmin@demo.com`
- ❌ `admin@ndkc.edu.ph` (for initial setup only)

---

## Issue: Database Connection Problems

### Steps to resolve:
1. **Check Supabase Configuration:**
   - Verify SUPABASE_URL and SUPABASE_ANON_KEY are set correctly
   - Check if your Supabase project is active

2. **Run Database Setup:**
   ```sql
   -- In Supabase SQL Editor, run:
   -- 1. Contents of /lib/database-init.sql
   -- 2. Contents of /lib/database-fix-rls.sql
   ```

3. **Verify Tables Created:**
   - Check that tables exist: users, classrooms, schedules, attendance_records, notifications

4. **Test Connection:**
   - App should show "Database connected" status
   - Connection status indicator should turn green

---

## Emergency Demo Mode

If database issues persist:
1. The app will run in demo mode with limited functionality
2. You can still test the UI and basic features
3. No data will be persisted until database connection is restored

---

## Production Deployment

For production use:
1. Re-enable RLS with proper policies
2. Use actual NDKC email domain
3. Configure proper authentication settings
4. Set up Edge Functions for RFID terminal

---

## Getting Help

If issues persist:
1. Check browser console for detailed error messages
2. Verify Supabase project status
3. Ensure all environment variables are correctly set
4. Check network connectivity to Supabase