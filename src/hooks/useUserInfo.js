// hooks/useUserInfo.js
import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase/firebase';

export default function useUserInfo(currentUser) {
  const [userInfo, setUserInfo] = useState({
    name: "Loading...",
    role: "Loading...",
    email: "Loading...",
  });
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoadingUser(true);
      
      if (!currentUser?.email) {
        setLoadingUser(false);
        return;
      }

      try {
        const roles = ["sadmins", "admins", "users"];
        let userData = null;

        for (const role of roles) {
          const roleRef = ref(db, `accounts/${role}`);
          const snapshot = await get(roleRef);
          
          if (snapshot.exists()) {
            const users = snapshot.val();
            const userEntry = Object.entries(users).find(
              ([_, user]) => user.email === currentUser.email
            );

            if (userEntry) {
              userData = {
                role: role.slice(0, -1),
                roleId: userEntry[0],
                ...userEntry[1]
              };
              break;
            }
          }
        }

        setUserInfo({
          name: userData?.name || "Guest",
          role: userData?.role?.toUpperCase() || "Unknown",
          email: userData?.email || currentUser.email,
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserInfo({
          name: "Error Loading",
          role: "Error",
          email: currentUser.email
        });
      } finally {
        setLoadingUser(false);
      }
    };

    currentUser ? fetchUserDetails() : setLoadingUser(false);
  }, [currentUser]);

  return { userInfo, loadingUser };
}