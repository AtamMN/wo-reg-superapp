'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth'; 
import { ref, get } from 'firebase/database';
import { db } from '../firebase/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUserRole = async (email) => {
    try {
      const roles = ['sadmins', 'admins', 'users'];
      
      for (const role of roles) {
        const roleRef = ref(db, `accounts/${role}`);
        const snapshot = await get(roleRef);
        
        if (snapshot.exists()) {
          const roleData = snapshot.val();
          const userEntry = Object.values(roleData).find(
            user => user.email === email
          );
          
          if (userEntry) {
            return { 
              role: role.slice(0, -1), // Remove 's' (sadmin, admin, user)
              roleData: userEntry
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Role check error:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const roleInfo = await checkUserRole(user.email);
        setUserRole(roleInfo);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userRole,
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}