# Supabase Setup Guide for NDKC RFID Attendance System

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **Git**: For version control

## Step 1: Create a Supabase Project

1. Log in to your Supabase dashboard
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `ndkc-rfid-attendance`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to Philippines (Singapore recommended)
5. Click "Create new project"
6. Wait for the project to be ready (usually 2-3 minutes)

## Step 2: Get Your Project Credentials

1. Go to your project dashboard
2. Click on "Settings" → "API"
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

## Step 3: Configure Your Supabase Credentials

### Method 1: Edit Config File (Recommended for Development)

1. Open `/lib/config.ts` in your code editor
2. Replace the placeholder values with your Supabase credentials:

```typescript
export const config = {
  supabase: {
    url: 'https://your-project-ref.supabase.co',  // Your actual URL
    anonKey: 'your-anon-key-here',                 // Your actual key
  },
  // ... rest of config
}
```

### Method 2: Use window.ENV (Recommended for Production)

If you're deploying to a web server, add this to your `index.html` before other scripts:

```html
<script>
  window.ENV = {
    SUPABASE_URL: 'https://your-project-ref.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here'
  };
</script>
```

This method allows you to keep sensitive credentials out of your source code.

## Step 4: Initialize the Database

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Click "New Query"
4. Copy the entire contents of `/lib/database-init.sql` from this project
5. Paste it into the SQL editor
6. Click "Run" to execute the script

This will create:
- All necessary tables (users, classrooms, schedules, attendance_records, notifications)
- Row Level Security (RLS) policies
- Database functions
- Indexes for performance
- Sample data (default admin and classrooms)

## Step 5: Configure Authentication

1. Go to "Authentication" → "Settings" in your Supabase dashboard
2. Under "User Signups", set:
   - **Allow new users to sign up**: `Disabled` (we'll handle this through admin)
3. Under "Auth Providers", ensure "Email" is enabled
4. Set up email templates (optional but recommended):
   - Go to "Authentication" → "Email Templates"
   - Customize the confirmation and recovery emails with NDKC branding

## Step 6: Set Up Row Level Security (Optional Review)

The SQL script automatically sets up RLS policies, but you can review them:

1. Go to "Authentication" → "Policies"
2. You should see policies for each table:
   - **Users**: Admins can manage all, teachers can view all and update themselves
   - **Classrooms**: Everyone can view, only admins can modify
   - **Schedules**: Everyone can view, only admins can modify  
   - **Attendance Records**: Users can view their own, admins can view/modify all
   - **Notifications**: Users see relevant notifications, admins can create

## Step 7: Test the Connection

1. Start your development server: `npm run dev`
2. Open your browser to `http://localhost:3000`
3. You should see a green "Database connected" notification
4. Try logging in with the default admin:
   - **Email**: `admin@ndkc.edu.ph`
   - **Password**: `admin123` (change this after first login!)

## Step 8: Create Your First Admin (Production)

For production, you'll want to create your own admin account:

1. Go to "Authentication" → "Users" in Supabase dashboard
2. Click "Add user" → "Create new user"
3. Fill in:
   - **Email**: Your admin email (must end with @ndkc.edu.ph)
   - **Password**: Strong password
   - **Email Confirm**: Check this box
4. Click "Create user"
5. The user will be created in the auth.users table
6. Now you need to add them to your users table with admin role
7. Go to "Table Editor" → "users"
8. Click "Insert" → "Insert row"
9. Fill in:
   - **id**: Copy the user ID from auth.users
   - **email**: Same email as above
   - **role**: `admin`
   - **name**: Full name
   - **is_active**: `true`
10. Click "Save"

## Step 9: Install Dependencies

Make sure you have the required packages:

```bash
npm install @supabase/supabase-js
```

## Step 10: Deploy to Production

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Other Hosting Platforms

For other platforms, ensure you:
1. Set the environment variables
2. Build the project: `npm run build`
3. Serve the built files

## Security Best Practices

### 1. Change Default Passwords
- Change the default admin password immediately
- Use strong, unique passwords for all accounts

### 2. Email Domain Restrictions
The system is configured to only allow @ndkc.edu.ph email addresses. To modify this:
1. Update the validation in your components
2. Consider adding domain validation in Supabase Auth hooks

### 3. RFID Security
- Use unique, randomly generated RFID IDs
- Consider encryption for sensitive data
- Regularly audit RFID assignments

### 4. Database Security
- Regularly backup your database
- Monitor unusual access patterns
- Keep Supabase project updated

## Troubleshooting

### Connection Issues

**Error**: "Database connection failed"
- Check your environment variables are correct
- Verify your Supabase project is active
- Check network connectivity

**Error**: "Invalid JWT token"
- Your anon key might be wrong
- Check for extra spaces in .env.local
- Restart your development server

### RLS Policy Issues

**Error**: "Row Level Security policy violation"
- Check that your policies are set up correctly
- Verify user roles are assigned properly
- Check the SQL script ran completely

### Authentication Issues

**Error**: "User not found"
- Ensure the user exists in both auth.users and public.users tables
- Check that is_active is set to true
- Verify email addresses match exactly

## Support

For technical issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the console logs in your browser
3. Check the Supabase dashboard for error logs
4. Contact your system administrator

## Database Schema Reference

### Tables Created

1. **users** - User accounts (admins and teachers)
2. **classrooms** - Physical classroom locations
3. **schedules** - Class schedules by teacher/classroom/day
4. **attendance_records** - RFID tap in/out records
5. **notifications** - System notifications

### Key Relationships

- Users (teachers) have many schedules
- Schedules belong to one user and one classroom
- Attendance records belong to one user and one classroom
- Notifications can target specific users or roles

---

**Last Updated**: October 2025  
**Version**: 1.0  
**System**: NDKC RFID Classroom Attendance System