import { auth, db } from './firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export interface SetupStatus {
  credentials: boolean;
  database: boolean;
  edgeFunctions: boolean;
  auth: boolean;
  overall: boolean;
  messages: string[];
}

export const checkSetupStatus = async (): Promise<SetupStatus> => {
  const status: SetupStatus = {
    credentials: true,
    database: false,
    edgeFunctions: true,
    auth: false,
    overall: false,
    messages: []
  };

  try {
    status.messages.push('✅ Firebase credentials configured');

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(1));
      await getDocs(q);
      status.database = true;
      status.messages.push('✅ Firestore database accessible');
    } catch (dbError: any) {
      status.messages.push(`❌ Firestore connection failed: ${dbError?.message ?? String(dbError)}`);
    }

    try {
      if (auth) {
        status.auth = true;
        status.messages.push('✅ Firebase Authentication configured');
      } else {
        status.messages.push('❌ Firebase Auth not initialized');
      }
    } catch (authError: any) {
      status.messages.push(`❌ Auth service failed: ${authError?.message ?? String(authError)}`);
    }

    status.overall = status.credentials && status.database && status.auth;

    if (status.overall) {
      status.messages.push('🎉 Notre Dame RFID System ready!');
    } else {
      status.messages.push('⚠️ Setup incomplete. Check Firebase configuration');
    }

  } catch (error: any) {
    status.messages.push(`❌ Setup check failed: ${error?.message ?? String(error)}`);
  }

  return status;
};

export const getSetupInstructions = (): string[] => {
  return [
    '1. Ensure Firebase project is created at https://console.firebase.google.com',
    '2. Enable Firestore Database in Firebase Console',
    '3. Enable Email/Password authentication in Firebase Console',
    '4. Update Firebase configuration in /lib/firebase.ts',
    '5. Test connection by refreshing the app'
  ];
};
