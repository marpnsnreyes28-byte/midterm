# Getting Started with NDKC RFID Attendance System

## Quick Start Guide

Welcome! This guide will help you get the NDKC RFID Attendance System up and running.

## Current Status: Backend Configuration Required

The app is currently running in **frontend-only mode** because Supabase credentials are not configured. You'll see a yellow warning banner at the top right that says "Supabase not configured".

### What This Means

- ✅ The frontend interface is fully functional
- ✅ You can explore the UI and components
- ❌ No data will be saved (everything is temporary)
- ❌ Login functionality won't work
- ❌ RFID scanning won't persist attendance

## Option 1: Configure Supabase Backend (Recommended)

To enable full functionality with data persistence:

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the details:
   - **Name**: `ndkc-rfid-attendance` (or any name you prefer)
   - **Database Password**: Create a strong password
   - **Region**: Singapore (closest to Philippines)
4. Click "Create new project" and wait 2-3 minutes

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **Anon public key** (long string starting with `eyJhbGciOi...`)

### Step 3: Configure the App

#### Method A: Edit the Config File

1. Open `/lib/config.ts` in your code editor
2. Replace the placeholder values:

```typescript
export const config = {
  supabase: {
    url: 'https://your-actual-project.supabase.co',    // Paste your URL here
    anonKey: 'your-actual-anon-key-here',              // Paste your key here
  },
  // ... rest remains the same
}
```

3. Save the file
4. Refresh your browser

#### Method B: Use Environment Variables (For Production)

Add this script to your `index.html` before other scripts:

```html
<script>
  window.ENV = {
    SUPABASE_URL: 'https://your-actual-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-actual-anon-key-here'
  };
</script>
```

### Step 4: Database Initialization

The app will automatically:
- ✅ Create all required database tables
- ✅ Set up security policies
- ✅ Initialize the database schema

You'll see a green "Database connected" message when ready!

### Step 5: Create Admin Account

Once connected, you'll be prompted to create the first admin account:

1. Enter admin email (e.g., `admin@ndkc.edu.ph`)
2. Choose a strong password
3. Enter admin name
4. Click "Register Admin"

**Important**: Only ONE admin account can be created during initial setup.

## Option 2: Continue Without Backend (Demo Mode)

You can continue exploring the interface without configuring Supabase:

- All features will work temporarily
- Data will be lost when you refresh the page
- Good for testing and demo purposes
- Click the "X" on the warning banner to dismiss it

## What's Next?

Once you have Supabase configured and admin account created:

1. **Login as Admin** using the credentials you created
2. **Add Classrooms** - Define your school's classrooms
3. **Create Teacher Profiles** - Add teachers with NDKC emails and assign RFID tags
4. **Set Up Schedules** - Define class schedules for each teacher
5. **Test RFID Terminal** - Access at `/terminal` route (admin-only access)

## Need Help?

### Common Issues

**"Database connection failed"**
- Check if your Supabase URL and key are correct
- Verify your Supabase project is active
- Check browser console for detailed error messages

**"Loading preview stuck"**
- This issue has been FIXED! The app now loads immediately even without credentials
- If still stuck, try clearing browser cache and refreshing

**"Can't create admin"**
- Make sure Supabase is properly configured
- Check browser console for errors
- Verify your database tables were created

### Documentation

- **Setup Guide**: See `SUPABASE_SETUP.md` for detailed Supabase setup
- **Security**: Read `SECURITY_NOTICE.md` for important security information
- **Terminal Guide**: See `RFID_TERMINAL_GUIDE.md` for RFID terminal setup
- **Deployment**: Check `DEPLOYMENT.md` for production deployment steps

## System Features

### For Administrators
- 👥 Manage teacher profiles across CBA, CTE, CECE departments
- 🏢 Manage classrooms and assign RFID terminals
- 📅 Create and manage class schedules
- 📊 View real-time attendance analytics
- 🔔 Send notifications to teachers
- 💳 Register and manage RFID cards
- 🖥️ Access RFID terminal for attendance scanning

### For Teachers
- 📋 View personal attendance logs
- 📅 Check assigned class schedules
- 🔔 Receive admin notifications
- 👤 View profile information
- ✅ See tap-in/tap-out history

### RFID Terminal Features
- 🎯 Automatic tap-in/tap-out detection
- ⏰ Schedule validation with grace periods
- 🏢 Room-specific scanning restrictions
- ✨ Real-time 3D animations
- 🔊 Audio feedback for scans
- 📊 Live attendance status display

## School Colors & Theme

The system uses Notre Dame of Kidapawan College's traditional colors:

- 🟢 **Green**: Life and growth
- 🟡 **Yellow/Gold**: Wisdom
- ⚪ **White**: Purity
- 🔵 **Blue**: Blessed Virgin Mary
- 🔴 **Red**: Courage
- ⚫ **Black**: Faith

Toggle between light green and dark green themes using the theme switcher in the header.

## Support

For technical issues or questions:
1. Check the console for error messages (F12 → Console tab)
2. Review the documentation files
3. Verify all setup steps were completed correctly

---

**Ready to start?** Click the "Setup" button in the yellow warning banner to begin Supabase configuration!