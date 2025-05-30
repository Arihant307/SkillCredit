
"use client";

import type { Task } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, CheckCircle2, Info, Briefcase, FileText, type LucideIcon, Send, CreditCard } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";

interface DashboardClientProps {
  userTasks: Task[];
}

export default function DashboardClient({ userTasks }: DashboardClientProps) {
  const { currentUser, requestTaskVerification } = useAuth();
  const { toast } = useToast();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  const handleRequestReview = async (task: Task) => { 
    const result = await requestTaskVerification(task.id);
    if (result.success) {
      let toastDescription = result.message || `Review successfully requested for "${task.title}".`;
      toast({
        title: task.fundingMethod === 'cod' ? "Payment Confirmed & Review Requested" : "Review Requested",
        description: toastDescription,
      });
    } else {
      toast({
        title: "Request Failed",
        description: result.message || "Could not request review for this task.",
        variant: "destructive",
      });
    }
  };

  let section1Title = "";
  let section1Description = "";
  let section1Tasks: Task[] = [];
  let Section1Icon: LucideIcon = ListChecks;

  let section2Title = "";
  let section2Description = "";
  let section2Tasks: Task[] = [];
  let Section2Icon: LucideIcon = CheckCircle2;

  if (currentUser.role === 'Loan Seeker') {
    section1Title = "My Current Service Request";
    section1Description = "Service requests you’ve been assigned that are currently active or awaiting your action.";
    section1Tasks = userTasks.filter(
      (task) =>
        task.assignedTo === currentUser.id &&
        (task.status === "Assigned" || task.status === "InProgress")
    ).sort((a, b) => new Date(b.id.replace('task-', '')).getTime() - new Date(a.id.replace('task-', '')).getTime());
    Section1Icon = ListChecks;

    section2Title = "My Completed Service Request";
    section2Description = "A history of service requests that you have successfully completed.";
    section2Tasks = userTasks.filter(
      (task) => task.assignedTo === currentUser.id && task.status === "Completed"
    ).sort((a, b) => new Date(b.id.replace('task-', '')).getTime() - new Date(a.id.replace('task-', '')).getTime());
    Section2Icon = CheckCircle2;

  } else if (currentUser.role === 'User (Work Provider)') {
    section1Title = "My Posted - Open/Active Requests";
    section1Description = "Service requests you've posted that are currently open for applications, assigned, or in progress.";
    section1Tasks = userTasks.filter(
      (task) =>
        task.postedBy === currentUser.name &&
        (task.status === "Open" || task.status === "Assigned" || task.status === "InProgress")
    ).sort((a, b) => new Date(b.id.replace('task-', '')).getTime() - new Date(a.id.replace('task-', '')).getTime());
    Section1Icon = Briefcase;

    section2Title = "My Posted - Completed Requests";
    section2Description = "A history of service requests you've posted that have been completed.";
    section2Tasks = userTasks.filter(
      (task) => task.postedBy === currentUser.name && task.status === "Completed"
    ).sort((a, b) => new Date(b.id.replace('task-', '')).getTime() - new Date(a.id.replace('task-', '')).getTime());
    Section2Icon = FileText;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Section1Icon className="mr-3 h-6 w-6 text-primary" />
            {section1Title}
          </CardTitle>
          <CardDescription>
            {section1Description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {section1Tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section1Tasks.map((task) => {
                const isCODTask = task.fundingMethod === 'cod';
                const buttonText = isCODTask ? "Confirm Payment & Request Review" : "Mark as Complete & Request Review";
                const ButtonIcon = isCODTask ? CreditCard : Send;

                return (
                  <div key={task.id} className="flex flex-col">
                    <TaskCard task={task} />
                    {currentUser.role === 'Loan Seeker' &&
                     task.assignedTo === currentUser.id && 
                     (task.status === 'Assigned' || task.status === 'InProgress') && (
                      <Button 
                        onClick={() => handleRequestReview(task)} 
                        className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="sm"
                      >
                        <ButtonIcon className="mr-2 h-4 w-4" /> {buttonText}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Info className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg">
                {currentUser.role === 'Loan Seeker' 
                  ? "You have no active service requests assigned." 
                  : "You have no open or active service requests posted."}
              </p>
              <p className="text-sm">
                {currentUser.role === 'Loan Seeker' 
                  ? 'Check the "Available Tasks" page for new opportunities!' 
                  : 'Consider posting a new service request if you need work done.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Section2Icon className="mr-3 h-6 w-6 text-green-600" />
            {section2Title}
          </CardTitle>
          <CardDescription>
            {section2Description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {section2Tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section2Tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Info className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg">
                 {currentUser.role === 'Loan Seeker' 
                  ? "You haven't completed any service requests yet." 
                  : "No service requests you posted have been completed yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
