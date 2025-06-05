"use client"

import { useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

const LastActiveTracker = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        updateLastActive(currentUser.email); // Update lastActive before page unload
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentUser]);

  return null;
};

export default LastActiveTracker;
