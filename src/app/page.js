"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/guestBook");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Welcome to WO Reg SuperApp</h1>
      {/* your page content */}
    </main>
  );
}

