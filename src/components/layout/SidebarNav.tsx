
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Briefcase } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

interface SidebarNavProps {
  items: NavItem[];
  currentUser: User | null;
}

export function SidebarNav({ items, currentUser }: SidebarNavProps) {
  const pathname = usePathname();

  const filteredItems = items.filter(item => {
    // Rule 1: If item requires authentication and user is not logged in, hide.
    if (item.requiresAuth && !currentUser) return false;

    // Rule 2: If item is only for logged-out users and user is logged in, hide.
    if (item.showOnlyWhenLoggedOut && currentUser) return false;

    if (currentUser) { // User is logged in
      if (item.roles) { // Item has specific roles defined
        // User (including Admin) must have one of the specified roles.
        return item.roles.includes(currentUser.role);
      }
      // If item requires auth but has NO specific roles, any authenticated user (including Admin) can see it.
      if (item.requiresAuth && !item.roles) return true;
    } else { // User is NOT logged in
      // If item requires auth or has specific roles, hide.
      if (item.requiresAuth || item.roles) return false;
    }

    // Default: Show non-auth items, or items that passed previous checks.
    // This also covers public items for non-logged-in users.
    return true;
  });

  if (!filteredItems?.length) {
    return null;
  }

  return (
    <nav className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border md:hidden">
        <Briefcase className="h-6 w-6 text-primary" />
        <span className="font-bold">{APP_NAME}</span>
      </div>
      <SidebarMenu className="p-2 flex-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  variant="default"
                  size="default"
                  className={cn(
                    "w-full justify-start",
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  isActive={isActive}
                  tooltip={item.title}
                  disabled={item.disabled}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  <span className="truncate">{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </nav>
  );
}

