
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfileForm } from "@/components/profile/UserProfileForm";
import type { Metadata } from "next";
import { useAuth } from "@/contexts/AuthContext";
import type { Task } from "@/lib/types"; // Import Task type

// export const metadata: Metadata = { // Metadata for client components handled by parent or root layout
//   title: "My Profile - SkillCredit",
// };

export default function ProfilePage() {
  const { currentUser, userLoans, userTasks, isLoading } = useAuth(); // Get userTasks from context
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  // Filter tasks from context that are assigned to the current user
  const assignedUserTasks: Task[] = userTasks.filter(task => task.assignedTo === currentUser.id);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">My Profile</h1>
      <UserProfileForm user={currentUser} loans={userLoans} tasks={assignedUserTasks} />
    </div>
  );
}
