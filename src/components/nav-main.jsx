"use client";

import {
  IconBadge4k,
  IconBook,
  IconBrandSuperhuman,
  IconCheck,
  IconCirclePlusFilled,
  IconDashboard,
  IconLayersLinked,
  IconLockAccess,
  IconMail,
  IconQrcode,
  IconScan,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Separator } from "@radix-ui/react-select";
import Link from "next/link";

export function NavMain({ items }) {
  const [active, setActive] = useState(null);
  const pathname = usePathname();

  const navItems = [
    {
      pathname: "/dashboard",
      name: "Dashboard",
      icon: IconDashboard,
    },
    {
      pathname: "/dashboard/accounts",
      name: "Accounts",
      icon: IconUsers,
    },
    {
      name: "Page Permissions",
      pathname: "/dashboard/permissions",
      icon: IconLockAccess,
    },
    {
      name: 'Share Invitation',
      pathname:'/dashboard/invitation',
      icon: IconMail
    }
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {/* {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))} */}
          <SidebarHeader></SidebarHeader>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <Link href={pathname === item.pathname ? '' : item.pathname}>
                <SidebarMenuButton
                  tooltip={item.name}
                  className={
                    pathname === item.pathname &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear-primary "
                  }
                >
                  {item.icon && <item.icon />}
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {/* <SidebarSeparator/>
        <SidebarMenu>
        {coreFeature.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton tooltip={item.name}>
                {item.icon && <item.icon />}
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu> */}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
