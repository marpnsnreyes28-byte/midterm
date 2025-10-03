# Troubleshooting Guide

## Common Issues and Solutions

### Authentication Issues

#### ❌ "Admin account already exists"

**Problem**: Trying to create a second admin account

**Solution**:
- Only one admin account is allowed by design
- If you need to reset the admin:
  1. Open browser console (F12)
  2. Go to Application → Local Storage
  3. Delete `ndkc-admin` key
  4. Go to Firestore in Firebase Console
  5. Delete the admin user document from `users` collection
  6. Refresh the page and create new admin

**Prevention**: Keep admin credentials safe and secure

---

#### ❌ "Invalid email or password"

**Problem**: Cannot log in with correct credentials

**Solutions**:

1. **Check Firestore Connection**:
   - Open browser console (F12)
   - Look for Firestore connection errors
   - Verify internet connection

2. **Verify User Exists**:
   - Go to Firebase Console → Firestore
   - Check `users` collection for user document
   - Verify email matches exactly

3. **Check NDKC Email Format** (Teachers only):
   - Must be `firstname.lastname@ndkc.edu.ph`
   - Case-sensitive
   - No extra spaces

4. **Session Issues**:
   - Clear localStorage: Application → Local Storage → Clear All
   - Refresh page and try again

---

#### ❌ "Session expired" or Auto-logout

**Problem**: Getting logged out unexpectedly

**Cause**: Sessions expire after 24 hours

**Solution**:
- This is by design for security
- Simply log in again
- Your data is safe in localStorage

**Future**: Implement "Remember me" option

---

#### ❌ Stuck on loading screen

**Problem**: App shows loading spinner indefinitely

**Solutions**:

1. **Check Console Errors**:
   ```
   F12 → Console → Look for red errors
   ```

2. **Verify Firestore Rules**:
   - Go to Firebase Console → Firestore → Rules
   - Check rules are published (not in draft)
   - Verify rules match the guide

3. **Clear Cache**:
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Or clear browser cache completely

4. **Check localStorage**:
   - F12 → Application → Local Storage
   - Verify `ndkc-session` exists if logged in
   - Try clearing all localStorage and starting fresh

---

### Firestore Issues

#### ❌ "Permission denied" errors in console

**Problem**: Firestore operations failing with permission errors

**Solution**:

1. **Check Security Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null && request.auth.uid == userId;
         allow create: if false;
         allow update: if request.auth != null 
                       && request.auth.uid == userId
                       && !request.resource.data.diff(resource.data)
                          .affectedKeys().hasAny(['password', 'role', 'uid']);
         allow delete: if false;
       }
       
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

2. **Verify Rules Published**:
   - Firebase Console → Firestore → Rules
   - Should say "Published" with timestamp
   - If in draft, click "Publish"

3. **Check User Context**:
   - Rules require authenticated context
   - During initial setup, admin creation bypasses normal rules

---

#### ❌ "Quota exceeded" errors

**Problem**: Firestore quota limits reached

**Solution**:

1. **Check Usage**:
   - Firebase Console → Usage tab
   - Review read/write operations

2. **Optimize Queries**:
   - App caches profiles in localStorage
   - Shouldn't hit limits in normal use
   - Check for infinite loops in console

3. **Upgrade Plan**:
   - Consider Blaze (pay-as-you-go) plan
   - Free tier: 50K reads, 20K writes per day

---

### Data Issues

#### ❌ Teachers list empty after creation

**Problem**: Added teachers but list shows empty

**Solutions**:

1. **Check localStorage**:
   ```javascript
   // In console
   console.log(JSON.parse(localStorage.getItem('ndkc-teachers')));
   ```

2. **Verify Firestore**:
   - Firebase Console → Firestore
   - Check `users` collection
   - Look for teacher documents

3. **Reload Data**:
   - Refresh the page
   - Log out and log back in
   - Check browser console for errors

---

#### ❌ Changes not saving

**Problem**: Updates disappear after refresh

**Possible Causes**:

1. **localStorage Full**:
   - Browser localStorage has ~5-10MB limit
   - Clear old data if needed

2. **Browser Issues**:
   - Try different browser
   - Disable extensions
   - Check incognito mode (won't persist data)

3. **Code Errors**:
   - Check console for errors
   - Verify save operations complete

---

### Browser Issues

#### ❌ "localStorage is not available"

**Problem**: localStorage disabled or unavailable

**Solutions**:

1. **Enable localStorage**:
   - Check browser settings
   - Disable "Block third-party cookies"
   - Allow local data

2. **Try Different Browser**:
   - Chrome (recommended)
   - Edge
   - Firefox
   - Safari

3. **Check Incognito Mode**:
   - Don't use incognito for regular use
   - Data won't persist in incognito

---

#### ❌ Theme not persisting

**Problem**: Theme resets after page refresh

**Solution**:
- Check localStorage is enabled
- Verify no browser extensions interfering
- Theme stored in `theme` key in localStorage

---

### Network Issues

#### ❌ "Failed to fetch" or network errors

**Problem**: Cannot connect to Firestore

**Solutions**:

1. **Check Internet Connection**:
   - Verify internet is working
   - Try loading other websites

2. **Firewall/Proxy**:
   - Check if firewall blocks Firebase
   - Try different network
   - Check proxy settings

3. **Firebase Status**:
   - Check [Firebase Status Dashboard](https://status.firebase.google.com)
   - Wait if Firebase is having issues

4. **CORS Issues**:
   - Should not occur with properly configured Firebase
   - Check browser console for CORS errors
   - Verify Firebase project configuration

---

### Performance Issues

#### ❌ App running slow

**Solutions**:

1. **Check Browser**:
   - Close unnecessary tabs
   - Clear browser cache
   - Update browser to latest version

2. **Check Data Size**:
   - Large localStorage data can slow app
   - Consider archiving old attendance records

3. **Optimize**:
   - Disable browser extensions
   - Use Chrome/Edge for best performance

---

### Teacher-Specific Issues

#### ❌ Teacher cannot log in

**Checklist**:
- [ ] Account created by admin?
- [ ] Email format correct: `firstname.lastname@ndkc.edu.ph`
- [ ] Account is active (check admin dashboard)
- [ ] Using correct password (`ndkc2024!` if new)
- [ ] User document exists in Firestore

**Common Mistakes**:
- Wrong email format
- Extra spaces in email
- Account not activated by admin
- Using personal email instead of NDKC email

---

#### ❌ Teacher sees admin features

**Problem**: UI showing admin-only options to teacher

**Solution**:
- This should not happen
- Check user role in localStorage: `ndkc-session`
- Log out and log back in
- Clear localStorage and start fresh
- Report as bug

---

### Development Issues

#### ❌ "Module not found" errors

**Problem**: Build errors about missing modules

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or force clean install
npm ci
```

---

#### ❌ TypeScript errors

**Problem**: Type errors in IDE or build

**Solution**:
```bash
# Restart TypeScript server (VS Code)
Ctrl+Shift+P → TypeScript: Restart TS Server

# Check for missing types
npm install --save-dev @types/node @types/react @types/react-dom
```

---

#### ❌ Tailwind classes not working

**Problem**: Styles not applying

**Solutions**:

1. **Check globals.css**:
   - Verify `/styles/globals.css` exists
   - Check no syntax errors

2. **Restart Dev Server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Clear Next.js Cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## Debug Mode

### Enable Detailed Logging

Add to browser console:
```javascript
localStorage.setItem('debug', 'true');
location.reload();
```

The app already has console.log statements for debugging auth flow.

### Check Current State

```javascript
// Check session
console.log(JSON.parse(localStorage.getItem('ndkc-session')));

// Check admin
console.log(JSON.parse(localStorage.getItem('ndkc-admin')));

// Check teachers
console.log(JSON.parse(localStorage.getItem('ndkc-teachers')));

// Check all localStorage keys
console.log(Object.keys(localStorage));
```

---

## Reset Everything

### Nuclear Option 🔴

If nothing works, reset completely:

1. **Clear Firestore Data**:
   - Firebase Console → Firestore
   - Delete all documents in `users` collection

2. **Clear localStorage**:
   ```javascript
   localStorage.clear();
   ```

3. **Clear Cache**:
   - Browser settings → Clear browsing data
   - Or: Ctrl+Shift+Delete

4. **Restart**:
   - Close all tabs
   - Close browser completely
   - Reopen and go to app
   - Start fresh with admin creation

---

## Still Having Issues?

### Before Asking for Help

Gather this information:

1. **Browser & Version**: Chrome 116, Firefox 118, etc.
2. **Operating System**: Windows 11, macOS 14, etc.
3. **Console Errors**: Screenshot or copy from F12 → Console
4. **Steps to Reproduce**: Exact steps that cause the issue
5. **Screenshots**: What you see vs what you expect

### Where to Get Help

1. Check [README.md](./README.md) for general info
2. Review [SECURITY_NOTICE.md](./SECURITY_NOTICE.md) for security questions
3. Check [QUICK_START.md](./QUICK_START.md) for setup steps
4. Contact your system administrator

---

## Preventive Measures

### Best Practices

1. **Regular Backups**:
   - Export data regularly
   - Save to external storage
   - Keep offline copies

2. **Monitor Firestore**:
   - Check usage weekly
   - Watch for unusual activity
   - Review security logs

3. **Keep Updated**:
   - Update browsers regularly
   - Check for app updates
   - Review security notices

4. **Security**:
   - Use strong passwords
   - Don't share credentials
   - Log out on shared computers
   - Regular password changes

5. **Data Management**:
   - Archive old records
   - Clean up inactive accounts
   - Monitor localStorage size

---

## Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Can't log in | Clear localStorage, refresh |
| Stuck loading | Check console, verify Firestore rules |
| Session expired | Log in again (24hr limit) |
| Data not saving | Check localStorage enabled |
| Permission errors | Verify Firestore rules published |
| Slow performance | Clear cache, close tabs |
| Build errors | Delete node_modules, reinstall |
| Styles not working | Restart dev server |

---

**Last Updated**: Tuesday, September 30, 2025  
**Version**: 1.0.0

For additional help, refer to the main [README.md](./README.md) or contact support.