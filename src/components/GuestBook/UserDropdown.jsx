// components/GuestBook/UserDropdown.jsx
import { LogOut, LogIn, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "../ui/button";
import DashboardButton from "./DashboardButton";

export default function UserDropdown({ currentUser, userInfo, loadingUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full p-3 shadow-lg" variant="default">
          {currentUser ? (
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                {loadingUser ? "..." : userInfo.name[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <LogIn className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-2">
        {currentUser ? (
          <>
            
            <div className="flex items-center px-2 py-2 gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{userInfo.name}</p>
                <p className="text-sm font-medium text-gray-500">
                  {userInfo.role}
                </p>
                <p className="text-xs text-gray-500">{userInfo.email}</p>
              </div>
            </div>
            <DashboardButton/>
            <LogoutButton />
          </>
        ) : (
          <DropdownMenuItem
            onClick={() => (window.location.href = "/login")}
            className="cursor-pointer"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
