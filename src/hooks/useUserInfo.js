import { useEffect, useState } from "react";
import { ref, onValue, set, get, update } from "firebase/database";
import { db } from "@/lib/firebase/firebase";

export default function useUserInfo(currentUser) {
  const [userInfo, setUserInfo] = useState({
    name: "Loading...",
    role: "Loading...",
    email: "Loading...",
  });
  const [allAccounts, setAllAccounts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const usersRef = ref(db, "accounts/users");
    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        const users = Object.entries(data).map(([id, user]) => ({
          ...user,
          role: user.role || "user",
          id,
        }));
        setAllAccounts(users);

        if (currentUser?.email) {
          const found = users.find(
            (u) => u.email.toLowerCase() === currentUser.email.toLowerCase()
          );
          setUserInfo({
            name: found?.name || "Guest",
            role: (found?.role || "user").toLowerCase(),
            email: found?.email || currentUser.email,
          });
        }

        setLoadingUser(false);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setLoadingUser(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const updateRole = async (accountId, newRole) => {
    const userRef = ref(db, `/accounts/users/${accountId}`);

    // Fetch the current user data
    const snapshot = await get(userRef);
    const currentUserData = snapshot.val();

    if (currentUserData) {
      // Update the role and set it back to Firebase
      const updatedUserData = {
        ...currentUserData,
        role: newRole,
      };

      // Set the updated user data back to Firebase
      await set(userRef, updatedUserData);
    } else {
      console.error("User not found");
    }
  };

  const updateAccount = async (userId, updatedData) => {
    try {
      await update(ref(db, `/accounts/users/${userId}`), updatedData);
      alert("Account updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update account");
    }
  };
  return { allAccounts, userInfo, loadingUser, updateRole, updateAccount };
}
