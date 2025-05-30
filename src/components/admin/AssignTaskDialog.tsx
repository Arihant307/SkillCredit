
"use client";

import { useState, useMemo } from "react";
import type { Task, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, AlertTriangle } from "lucide-react";

interface AssignTaskDialogProps {
  task: Task | null;
  allUsers: User[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignTask: (taskId: string, userId: string) => Promise<{ success: boolean; message?: string }>;
}

export function AssignTaskDialog({ task, allUsers, isOpen, onOpenChange, onAssignTask }: AssignTaskDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const eligibleLoanSeekers = useMemo(() => {
    if (!task) return [];
    return allUsers.filter(user =>
      user.role === 'Loan Seeker' &&
      task.skillsRequired.some(requiredSkill => user.skills.includes(requiredSkill))
    );
  }, [task, allUsers]);

  const handleSubmit = async () => {
    if (!task || !selectedUserId) {
      toast({
        title: "Selection Required",
        description: "Please select a Loan Seeker to assign the task.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await onAssignTask(task.id, selectedUserId);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Task Assigned",
        description: result.message || `Task "${task.title}" has been assigned.`,
      });
      onOpenChange(false); // Close dialog on success
      setSelectedUserId(undefined); // Reset selection
    } else {
      toast({
        title: "Assignment Failed",
        description: result.message || "Could not assign the task.",
        variant: "destructive",
      });
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setSelectedUserId(undefined); // Reset selection when closing
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5 text-primary" /> Assign Task: {task.title}
          </DialogTitle>
          <DialogDescription>
            Select an eligible Loan Seeker to assign this task to. A Loan Seeker is eligible if they possess at least one of the required skills: {task.skillsRequired.join(", ")}.
          </DialogDescription>
        </DialogHeader>

        {eligibleLoanSeekers.length > 0 ? (
          <ScrollArea className="max-h-[300px] my-4 pr-4">
            <RadioGroup value={selectedUserId} onValueChange={setSelectedUserId} className="space-y-3">
              {eligibleLoanSeekers.map(user => (
                <Label
                  key={user.id}
                  htmlFor={`user-${user.id}`}
                  className={`flex flex-col items-start space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors ${selectedUserId === user.id ? 'border-primary ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center w-full">
                    <RadioGroupItem value={user.id} id={`user-${user.id}`} className="mr-3" />
                    <div className="flex-grow">
                      <span className="font-semibold">{user.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({user.email})</span>
                    </div>
                  </div>
                  <div className="ml-7 mt-1">
                    <span className="text-xs font-medium">Skills: </span>
                    {user.skills.length > 0 ? user.skills.map(skill => (
                      <Badge
                        key={skill}
                        variant={task.skillsRequired.includes(skill) ? "default" : "secondary"}
                        className={`mr-1 mb-1 text-xs ${task.skillsRequired.includes(skill) ? 'bg-accent text-accent-foreground' : ''}`}
                      >
                        {skill}
                      </Badge>
                    )) : <span className="text-xs text-muted-foreground">No skills listed</span>}
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </ScrollArea>
        ) : (
          <div className="my-6 flex flex-col items-center justify-center text-center text-muted-foreground p-4 border border-dashed rounded-md">
            <AlertTriangle className="h-10 w-10 mb-2 text-yellow-500" />
            <p className="font-semibold">No Eligible Loan Seekers Found</p>
            <p className="text-sm">There are no Loan Seekers with the required skills for this task currently.</p>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setSelectedUserId(undefined)}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!selectedUserId || isSubmitting || eligibleLoanSeekers.length === 0}>
            {isSubmitting ? "Assigning..." : "Confirm Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    