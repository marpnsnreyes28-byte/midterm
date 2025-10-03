# Firestore Security Rules Setup

## Important: Configure Firestore Security Rules

Your application uses Firestore to store user authentication data. You need to configure security rules to allow the app to read and write user data.

## How to Set Up Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **attendance-afbbd**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - for authentication
    match /users/{userId} {
      // Allow anyone to check if admin exists (needed for initial setup)
      allow read: if request.auth == null || request.auth.uid != null;
      
      // Allow creating new users (for admin registration and teacher creation)
      allow create: if request.auth == null || request.resource.data.role == 'admin';
      
      // Allow users to read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Allow admins to read/write all user data
      allow read, write: if request.auth != null && 
                            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Users can update their own data (except role)
      allow update: if request.auth != null && 
                       request.auth.uid == userId && 
                       request.resource.data.role == resource.data.role;
    }
  }
}
```

6. Click **Publish**

## Alternative: Development/Testing Rules (Less Secure)

If you're just testing and want to allow all access temporarily:

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

⚠️ **Warning**: Only use this for development/testing. Never use in production!

## What These Rules Do

- **Public read access to users collection**: Allows the app to check if an admin exists during initial setup
- **Admin privileges**: Admins can read/write all user data
- **Teacher self-read**: Teachers can read their own profile data
- **Secure updates**: Users cannot change their own role

## Verifying the Setup

After setting up the rules:

1. Refresh your application
2. You should no longer see the "permission-denied" error
3. You should be able to register an admin account
4. Admin can create teacher accounts
5. Teachers can log in with their credentials

## Troubleshooting

If you still see permission errors:

1. Make sure you've published the rules in Firebase Console
2. Wait a few seconds for the rules to propagate
3. Clear your browser cache and reload
4. Check the Firebase Console → Firestore → Rules tab to verify the rules are active

## Security Considerations

- The app stores only authentication credentials in Firestore
- All other data (classrooms, schedules, attendance) is stored in localStorage
- Passwords are hashed using SHA-256 before storing
- See SECURITY_NOTICE.md for more security information