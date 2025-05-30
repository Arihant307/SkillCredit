
"use client";

import type { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_POSSIBLE_SKILLS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { useToast } from "@/hooks/use-toast"; // Import useToast

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | "all">("all");
  const { applyForTask, currentUser } = useAuth(); // Get applyForTask and currentUser from context
  const { toast } = useToast(); // Get toast function

  const handleApply = async (taskId: string) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to apply for tasks.",
        variant: "destructive",
      });
      return;
    }

    const result = await applyForTask(taskId);
    if (result.success) {
      toast({
        title: "Applied Successfully!",
        description: result.message,
      });
    } else {
      toast({
        title: "Application Failed",
        description: result.message || "Could not apply for the task.",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearchTerm = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = selectedSkill === "all" || task.skillsRequired.includes(selectedSkill);
    return matchesSearchTerm && matchesSkill;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input 
          type="text"
          placeholder="Search tasks by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedSkill} onValueChange={setSelectedSkill}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {ALL_POSSIBLE_SKILLS.map(skill => (
              <SelectItem key={skill} value={skill}>{skill}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} onApply={handleApply} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No tasks found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
