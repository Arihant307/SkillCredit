
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostTaskForm } from "@/components/tasks/PostTaskForm";
import { useAuth } from "@/contexts/AuthContext";
// import type { Metadata } from "next"; // Metadata for client components handled by parent

// export const metadata: Metadata = {
//   title: "Post a New Task - SkillCredit",
// };

export default function PostTaskPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.push("/login");
      } else if (currentUser.role !== 'User (Work Provider)' && currentUser.role !== 'Admin') {
        router.push("/"); // Redirect to dashboard if not authorized
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser || (currentUser.role !== 'User (Work Provider)' && currentUser.role !== 'Admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading or unauthorized...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PostTaskForm />
    </div>
  );
}
