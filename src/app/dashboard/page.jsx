"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";
import data from "./data.json";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import useUserInfo from "@/hooks/useUserInfo";
import GuestsTable from "@/components/SAdminDashboard/GuestsTable";

export default function Dashboard() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { userInfo, loadingUser } = useUserInfo(currentUser);

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
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      {/* <DataTable data={data} /> */}

      <GuestsTable />
    </>
  );
}
