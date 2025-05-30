
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";
import AdminDashboardClient from "@/components/AdminDashboardClient"; // Import Admin dashboard
import { useAuth } from "@/contexts/AuthContext";
// import type { Metadata } from "next"; // Metadata for client components handled by parent or root layout

// export const metadata: Metadata = { 
//   title: "Dashboard - SkillCredit",
// };

export default function DashboardPage() {
  const { currentUser, userTasks, allSystemLoans, isLoading } = useAuth(); // Get allSystemLoans for Admin, userTasks for all
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Welcome back, {currentUser.name}! 
        {currentUser.role === 'Admin' && <span className="text-base font-normal text-muted-foreground ml-2">(System Overview)</span>}
      </h1>
      
      {currentUser.role === 'Admin' ? (
        <AdminDashboardClient allSystemLoans={allSystemLoans || []} allSystemTasks={userTasks || []} />
      ) : (
        // For Loan Seeker and User (Work Provider)
        <DashboardClient userTasks={userTasks || []} />
      )}
    </div>
  );
}
