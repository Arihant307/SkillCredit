
"use client"; // Make this a client component

import { TaskList } from "@/components/tasks/TaskList";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { Metadata } from "next";
import { useEffect, useState } from "react";
import type { Task } from "@/lib/types";

// export const metadata: Metadata = { // Metadata should be defined in layout or server component parents
//   title: "Available Tasks - SkillCredit",
// };

export default function TasksPage() {
  const { userTasks, isLoading: authLoading, currentUser } = useAuth(); // Get tasks from context
  const [isLoading, setIsLoading] = useState(true);

  // This useEffect handles the initial loading state for tasks from context
  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading, userTasks]);


  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }
  
  if (!currentUser && !authLoading) {
     return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl text-muted-foreground">Please log in to view available tasks.</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Available Tasks</h1>
      <TaskList tasks={userTasks} />
    </div>
  );
}
