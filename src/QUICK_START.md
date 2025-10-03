# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: ⚠️ Configure Firestore Security Rules (REQUIRED!)

**The app will NOT work without this step!**

1. Go to [Firebase Console](https://console.firebase.google.com/project/attendance-afbbd/firestore/rules)
2. Click on the **Rules** tab
3. Copy the rules from [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md)
4. Or use these quick rules for testing:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Warning**: The above rules allow full access. Only use for testing!

5. Click **Publish**
6. **Wait 10 seconds** for the rules to propagate

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Create Admin Account

1. Open [http://localhost:3000](http://localhost:3000)
2. You'll see the initial setup screen
3. Fill in:
   - **Name**: Your full name
   - **Email**: Your admin email (any format for first admin)
   - **Password**: Secure password (min 6 characters)
   - **Confirm Password**: Same password
4. Click **Create Admin Account**
5. You'll be automatically logged in! 🎉

### Step 5: Start Using the System

#### As Admin, you can:
- ✅ Create teacher accounts
- ✅ Manage classrooms (up to 3)
- ✅ Set schedules
- ✅ Monitor attendance
- ✅ Send notifications

#### Creating Your First Teacher:
1. Click **Teachers** in the sidebar
2. Click **Add Teacher**
3. Fill in teacher details:
   - First Name & Last Name
   - Department (CBA/CTE/CECE)
   - Email will be auto-generated: `firstname.lastname@ndkc.edu.ph`
   - RFID ID will be auto-generated
4. Click **Add Teacher**
5. Default password: `ndkc2024!` (teacher should change this)

## 🎯 What Next?

### Set Up Classrooms
1. Go to **Classrooms** tab
2. Add your classrooms with:
   - Name (e.g., "Room 101")
   - Capacity
   - Location
   - Active status

### Create Schedules
1. Go to **Schedules** tab
2. Assign teachers to classrooms
3. Set days and time slots
4. Add subject names

### Monitor Attendance
1. Go to **Attendance** tab
2. View real-time attendance data
3. Filter by date, teacher, or classroom
4. Export reports (coming soon)

## 🔐 Security Notes

⚠️ **Important**: This system uses Firestore for authentication, not Firebase Auth.

**What this means**:
- Passwords are hashed with SHA-256 and stored in Firestore
- Sessions last 24 hours
- No built-in password reset (yet)
- Less secure than Firebase Auth

**For Production**:
- Read [SECURITY_NOTICE.md](./SECURITY_NOTICE.md)
- Consider implementing additional security measures
- Set up regular backups
- Monitor Firestore usage

## 📱 Default Credentials

### Admin Account
- Created during initial setup
- Only ONE admin account allowed
- Can create teacher accounts

### Teacher Accounts
- Created by admin
- Email: `firstname.lastname@ndkc.edu.ph`
- Default password: `ndkc2024!`
- ⚠️ Teachers should change password on first login (feature coming soon)

## 🎨 Theme Colors

The system uses Notre Dame's traditional colors:
- **Green**: #22c55e (Primary)
- **Gold**: #fbbf24 (Wisdom)
- **Blue**: #3b82f6 (Blessed Virgin Mary)
- **Red**: #ef4444 (Courage)
- **White**: #ffffff (Purity)
- **Black**: #000000 (Faith)

Toggle between light green and dark green themes using the moon/sun icon in the header.

## 🛠️ Troubleshooting

### "Admin account already exists"
- Only one admin can be created
- If you need to reset: Check the migration guide or contact support

### "Cannot connect to Firestore"
- Check your internet connection
- Verify Firebase project is active
- Check Firestore security rules are published

### "Session expired"
- Sessions last 24 hours
- Just log in again
- Your data is safe in localStorage

### Data not persisting
- Check browser localStorage is enabled
- Try clearing cache if issues persist
- Make sure you're not in incognito mode

### Teachers can't log in
- Verify NDKC email format: `firstname.lastname@ndkc.edu.ph`
- Check teacher account is active
- Verify Firestore has the user document

## 📚 Additional Resources

- [Full Documentation](./README.md)
- [Security Information](./SECURITY_NOTICE.md)
- [Migration Details](./MIGRATION_SUMMARY.md)
- [Development Guidelines](./guidelines/Guidelines.md)

## 🐛 Found a Bug?

1. Check the console for errors (F12 in browser)
2. Review the documentation
3. Check Firestore rules are set correctly
4. Contact your system administrator

## 💡 Pro Tips

1. **Use Chrome/Edge**: Best compatibility
2. **Enable localStorage**: Required for the app to work
3. **Keep sessions active**: Log in once per day
4. **Regular backups**: Export data regularly (feature coming)
5. **Monitor Firestore**: Check usage to avoid quota limits

## 🎓 Learn More

### Firestore
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind v4 Guide](https://tailwindcss.com/docs/v4-beta)

---

**Need Help?** Check the full [README.md](./README.md) for detailed information.

Happy attendance tracking! 🎉