"use client";
import { useAuth } from "@/lib/contexts/AuthContext";
import { auth } from "@/lib/firebase/firebase";
import { signOut } from "firebase/auth";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { currentUser } = useAuth();
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login')

    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    currentUser && (
      <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
        <LogOut/>
        Logout
      </DropdownMenuItem>
    )
  );
}
{
  /* <button onClick={handleLogout} className="text-red-600 cursor-pointer mt-1">Logout</button>; */
}
