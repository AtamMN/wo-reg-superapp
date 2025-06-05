"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, LogIn, User as UserIcon } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default function UserDropdown({ currentUser, content }) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-full p-3 shadow-lg" variant="default">
          <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                    {currentUser.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2">
          {/* ... existing user dropdown content ... */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}