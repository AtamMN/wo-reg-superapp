"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/firebase";
import { get, ref } from "firebase/database";

const AuthContext = createContext({
  user: null,
  roleInfo: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roleInfo, setRoleInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRoleInfo = async (email) => {
    const roles = ["admins", "users"]; // Add more roles if needed
    for (const role of roles) {
      const roleRef = ref(db, `accounts/${role}`);
      const snapshot = await get(roleRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const roleId in data) {
          const details = data[roleId];
          if (details.email === email) {
            return {
              role,
              roleId,
              name: details.name,
            };
          }
        }
      }
    }
    return null;
  };

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    setUser(user);

    const roleData = await fetchRoleInfo(user.email);
    if (!roleData) throw new Error("No role assigned to this user.");
    setRoleInfo(roleData);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRoleInfo(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user?.email) {
        const roleData = await fetchRoleInfo(user.email);
        setRoleInfo(roleData);
      } else {
        setRoleInfo(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, roleInfo, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);