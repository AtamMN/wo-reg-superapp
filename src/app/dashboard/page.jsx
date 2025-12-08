"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import useUserInfo from "@/hooks/useUserInfo";
import GuestsTable from "@/components/SAdminDashboard/GuestsTable";
import TrialGuestTable from "@/components/TrialDashboard/TrialGuestTable";
import UserGuestsTable from "@/components/UserDashboard/UserGuestsTable";

export default function Dashboard() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { userInfo, loadingUser } = useUserInfo(currentUser);

  useEffect(() => {
    if (!currentUser && !loadingUser) {
      router.push("/login");
    }
  }, [currentUser, loadingUser, router]);

  if (!currentUser || loadingUser) {
    return <div>Loading...</div>;
  }

  // Render based on user type
  if (userInfo.email === "trial@trial.com") {
    return <TrialGuestTable />;
  }

  if (userInfo.role === "sadmin") {
    return <GuestsTable />;
  }

  if (userInfo.role === "user") {
    return <UserGuestsTable />;
  }

  return null;
}
