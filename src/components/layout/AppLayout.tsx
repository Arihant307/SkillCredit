
"use client";

import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { SidebarNav } from "./SidebarNav";
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // Import AuthProvider
import { NAV_ITEMS } from "@/lib/constants";

interface AppLayoutProps {
  children: ReactNode;
}

// InnerLayout component to access AuthContext after it's provided
function InnerLayout({ children }: AppLayoutProps) {
  const { currentUser, isLoading } = useAuth();

  // Potentially show a loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p> {/* Replace with a proper spinner/loader component */}
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarContent className="p-0">
          <SidebarNav items={NAV_ITEMS} currentUser={currentUser} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}


export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthProvider>
      <InnerLayout>{children}</InnerLayout>
    </AuthProvider>
  );
}
