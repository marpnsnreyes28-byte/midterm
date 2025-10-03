# Quick Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Issue: "Loading preview" stuck / App won't load

**Status**: ✅ **FIXED!**

**Solution**: This issue has been resolved. The app now loads immediately even without Supabase credentials configured.

**If still experiencing issues:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+Shift+R)
3. Check browser console (F12) for errors
4. Ensure JavaScript is enabled

---

### 🟡 Issue: Yellow "Supabase not configured" banner appears

**This is EXPECTED** when running for the first time.

**What it means:**
- Backend database credentials are not set up
- App is running in frontend-only mode
- No data will be saved

**Solution:**
1. Click the "Setup" button in the warning banner
2. Follow the instructions to create a Supabase project
3. Get your Project URL and Anon Key
4. Configure them in `/lib/config.ts`
5. Refresh the browser

**Alternative**: Dismiss the banner if you just want to explore the UI

---

### 🔴 Issue: Red "Database connection failed" message

**What it means:**
- Supabase credentials are configured but invalid/incorrect
- Or your Supabase project is not accessible

**Solution:**
1. Verify your credentials in `/lib/config.ts`:
   - Check Project URL is correct (format: `https://xxxxx.supabase.co`)
   - Check Anon Key is complete and correct
2. Verify your Supabase project is active:
   - Go to [supabase.com](https://supabase.com/dashboard)
   - Check if project is running (not paused)
3. Check your internet connection
4. Click "Retry" button after fixing issues

---

### 🔴 Issue: "Cannot login: Database connection required"

**What it means:**
- Trying to login without Supabase configured
- Backend is not available

**Solution:**
1. Configure Supabase credentials (see yellow banner)
2. Wait for green "Database connected" message
3. Then try logging in again

---

### 🔴 Issue: "Invalid email or password" during login

**Possible causes:**
1. Wrong email or password entered
2. Admin account not created yet
3. Teacher account not created by admin

**Solution:**
- **First time?** Create admin account first (will be prompted)
- **Admin login?** Use email/password you created during setup
- **Teacher login?** Contact admin to create your account
- Teachers must use `@ndkc.edu.ph` email addresses

---

### 🔴 Issue: Can't create admin account

**Possible causes:**
1. Admin account already exists
2. Database connection not working
3. Form validation errors

**Solution:**
1. Check if "Sign In" tab is showing instead of registration form
   - If yes, admin already exists - just login
2. Verify green "Database connected" message is showing
3. Check all form fields are filled correctly:
   - Valid email format
   - Password at least 6 characters
   - Passwords match
4. Check browser console (F12) for specific errors

---

### 🔴 Issue: RFID Terminal won't open

**What it means:**
- Terminal is admin-only feature
- Or browser popup blocker is active

**Solution:**
1. **Must be logged in as Admin** (teachers can't access terminal)
2. Allow popups for this site:
   - Chrome: Click popup icon in address bar
   - Firefox: Click preferences icon in address bar
   - Edge: Click popup icon in address bar
3. Try using keyboard shortcut: Ctrl+Click on "Open Terminal"
4. Or navigate directly to `/terminal` URL

---

### 🔴 Issue: RFID scans not working

**Possible causes:**
1. Hoba reader not connected
2. Reader not configured correctly
3. RFID ID not registered in system

**Solution:**
1. **Check Reader Connection**:
   - Ensure Hoba reader is plugged in via USB
   - Check device is recognized by computer
   - Try different USB port if needed

2. **Test Reader**:
   - Open Notepad or any text editor
   - Scan an RFID card
   - Numbers should appear → Reader working
   - Nothing appears → Reader issue

3. **Check RFID Registration**:
   - Admin must register RFID IDs for teachers
   - Go to Teachers section → Edit teacher → Enter RFID ID
   - Scan card in terminal to get ID

4. **Check Schedule**:
   - Teacher must have active schedule for current time
   - Schedule must match the classroom terminal
   - Check grace period settings (default 15 minutes)

---

### 🟡 Issue: Data is not persisting / lost after refresh

**This is EXPECTED** if Supabase is not configured.

**Solution:**
Configure Supabase backend to enable data persistence. See "Supabase not configured" section above.

---

### 🟡 Issue: Background image not showing

**Possible causes:**
1. Image not loaded yet
2. Opacity set too low
3. Using slow internet connection

**This is usually not a problem** - the background is intentionally subtle (10% opacity).

**To verify:**
1. Check if you see subtle campus image in background
2. Open browser DevTools (F12) → Network tab
3. Look for image file loading
4. If 404 error, image file may be missing

---

### 🔴 Issue: Console shows errors

**Common errors and solutions:**

**"Supabase credentials not configured"**
- ✅ This is informational, not an error
- Configure Supabase if you need backend

**"Connection timeout"**
- Check internet connection
- Verify Supabase credentials
- Check if Supabase project is active

**"Failed to fetch"**
- Network issue or CORS problem
- Check internet connection
- Verify Supabase URL is correct

**"Process is not defined"**
- ✅ This has been fixed
- If still seeing it, ensure `/lib/config.ts` is being used

---

### 🟢 Issue: Want to reset everything and start fresh

**Solution:**
1. **Reset Database**:
   - Go to Supabase dashboard
   - Database → Tables → Delete all data
   - Or delete entire project and create new one

2. **Reset Local State**:
   - Clear browser cache and cookies
   - Or use incognito/private browsing mode

3. **Create New Admin**:
   - After reset, you'll be prompted to create admin again
   - Use new credentials

---

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Check browser console for specific error messages (F12)
3. ✅ Try the solutions listed above
4. ✅ Clear cache and refresh
5. ✅ Try a different browser

### Information to Provide

When reporting issues, include:
- What you were trying to do
- What actually happened
- Error messages from console (F12 → Console)
- Browser name and version
- Whether Supabase is configured
- Whether you can login or not

### Useful Console Commands

Open browser console (F12) and try:

```javascript
// Check if Supabase is configured
console.log('Config:', window.ENV || 'Using /lib/config.ts');

// Check current user
console.log('User:', localStorage.getItem('user'));

// Check connection status
console.log('Has connection:', /* will show in UI */);
```

---

## Quick Reference

### Configuration Files
- `/lib/config.ts` - Main configuration file
- `/lib/supabase.ts` - Supabase client setup
- `/lib/database.types.ts` - Database schema types

### Key Components
- `/components/AuthProvider.tsx` - Authentication & data management
- `/components/ConnectionStatus.tsx` - Shows connection status
- `/components/LoginForm.tsx` - Login and registration
- `/components/RfidTerminalPage.tsx` - RFID scanning terminal

### Documentation
- `/GETTING_STARTED.md` - First-time setup guide
- `/SUPABASE_SETUP.md` - Detailed Supabase setup
- `/LOADING_FIX_SUMMARY.md` - Technical details of loading fix
- `/RFID_TERMINAL_GUIDE.md` - RFID terminal setup
- `/SECURITY_NOTICE.md` - Important security information

---

**Last Updated**: October 1, 2025  
**Status**: All major issues resolved ✅