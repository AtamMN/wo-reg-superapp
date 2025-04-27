"use client";

import AdminOnly from "@/components/AdminDashboard/AdminOnly";
import SAdminOnly from "@/components/SAdminDashboard/SAdminOnly";
import UserDashboard from "@/components/UserDashboard/UserDashboard";
import useUserInfo from "@/hooks/useUserInfo";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Dashboard = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { userInfo, loadingUser } = useUserInfo(currentUser);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!currentUser && !loadingUser) {
      router.push("/login");
    }
  }, [currentUser, loadingUser, router]);

  // Show loading state while checking auth
  if (!currentUser || loadingUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      WELCOME TO DASHBOARD, {userInfo.name} as {userInfo.role}
      {userInfo.role === 'SADMIN' && <SAdminOnly/>}
      {userInfo.role === 'ADMIN' && <AdminOnly/>}
      {userInfo.role === 'USER' && <UserDashboard/>}
    </div>
  )
};

export default Dashboard;