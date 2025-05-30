
"use client";

import type { Task, User } from "@/lib/types"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { IndianRupee, UserCheck, CheckCircle, XCircle } from "lucide-react"; 
import { useState } from "react"; 
import { AssignTaskDialog } from "./AssignTaskDialog"; 
import { useAuth } from "@/contexts/AuthContext"; 
import { useToast } from "@/hooks/use-toast";

interface AllTasksTableProps {
  tasks: Task[];
  allSystemUsers: User[]; 
  initialFilter?: string | null;
}

export function AllTasksTable({ tasks, allSystemUsers, initialFilter }: AllTasksTableProps) {
  const { adminAssignTask, adminApproveTaskCompletion, adminRejectTaskCompletion, currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState<Task | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<{[key: string]: boolean}>({});


  let displayedTasks = tasks;
  let cardTitleText = "All System Tasks";
  let cardDescriptionText = "A complete history of all tasks posted and their statuses.";
  let captionText = "Overview of all user tasks.";

  const filterLowerCase = initialFilter?.toLowerCase();

  if (filterLowerCase) {
    if (filterLowerCase === 'inprogress') {
      displayedTasks = tasks.filter(task => task.status === 'Assigned' || task.status === 'InProgress');
      cardTitleText = "In Progress Tasks";
      cardDescriptionText = "Displaying tasks that are actively assigned or currently being worked on. Excludes open, completed, or cancelled tasks.";
      captionText = "Filtered by: In Progress tasks.";
    } else if (filterLowerCase === 'open') {
      displayedTasks = tasks.filter(task => task.status === 'Open');
      cardTitleText = "Open Tasks";
      cardDescriptionText = "Displaying tasks that are 'Open' and awaiting assignment. Admins can assign these tasks.";
      captionText = "Filtered by: Open tasks.";
    } else if (filterLowerCase === 'completed') {
      displayedTasks = tasks.filter(task => task.status === 'Completed');
      cardTitleText = "Completed Tasks";
      cardDescriptionText = "Displaying tasks that have been 'Completed'.";
      captionText = "Filtered by: Completed tasks.";
    } else if (filterLowerCase === 'pendingverification') {
      displayedTasks = tasks.filter(task => task.status === 'PendingVerification');
      cardTitleText = "Tasks Pending Verification";
      cardDescriptionText = "Displaying tasks that have been marked as complete by Loan Seekers and are awaiting Admin review.";
      captionText = "Filtered by: Tasks pending verification.";
    } else { 
        cardDescriptionText = `Displaying all tasks. The filter "${initialFilter}" is not recognized for specific filtering.`;
    }
  }

  const handleOpenAssignDialog = (task: Task) => {
    setSelectedTaskForAssignment(task);
    setIsAssignDialogOpen(true);
  };

  const handleApprove = async (taskId: string, taskTitle: string) => {
    setIsProcessing(prev => ({...prev, [taskId]: true}));
    const result = await adminApproveTaskCompletion(taskId);
    if (result.success) {
      toast({ title: "Task Approved", description: `Task "${taskTitle}" has been marked as Completed.` });
    } else {
      toast({ title: "Approval Failed", description: result.message || "Could not approve task.", variant: "destructive" });
    }
    setIsProcessing(prev => ({...prev, [taskId]: false}));
  };

  const handleReject = async (taskId: string, taskTitle: string) => {
    setIsProcessing(prev => ({...prev, [taskId]: true}));
    const result = await adminRejectTaskCompletion(taskId);
    if (result.success) {
      toast({ title: "Task Rejected", description: `Task "${taskTitle}" status set back to In Progress. Please communicate with the user.` });
    } else {
      toast({ title: "Rejection Failed", description: result.message || "Could not reject task.", variant: "destructive" });
    }
    setIsProcessing(prev => ({...prev, [taskId]: false}));
  };

  const showActionsColumn = currentUser?.role === 'Admin' && (filterLowerCase === 'open' || displayedTasks.some(t => t.status === 'PendingVerification'));


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{cardTitleText}</CardTitle>
          <CardDescription>
            {cardDescriptionText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Posted By</TableHead>
                <TableHead>Assigned To (User ID)</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Skills Required</TableHead>
                {showActionsColumn && <TableHead className="text-center">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTasks.length > 0 ? displayedTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.postedBy}</TableCell>
                  <TableCell>{task.assignedTo || "N/A"}</TableCell>
                  <TableCell className="text-right flex items-center justify-end"><IndianRupee className="h-4 w-4 mr-1" />{task.creditAmount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={task.status === 'Open' ? 'default' : task.status === 'Completed' ? 'secondary' : 'outline'}
                      className={
                          task.status === 'Open' ? 'bg-accent text-accent-foreground' :
                          task.status === 'Completed' ? 'bg-green-600 text-primary-foreground hover:bg-green-700' : 
                          task.status === 'Assigned' ? 'bg-blue-500 text-primary-foreground hover:bg-blue-600' :
                          task.status === 'InProgress' ? 'bg-yellow-500 text-black' : 
                          task.status === 'PendingVerification' ? 'bg-purple-500 text-primary-foreground hover:bg-purple-600' :
                          task.status === 'Cancelled' ? 'bg-destructive text-destructive-foreground' : ''
                      }
                    >
                      {task.status}
                    </Badge>
                    {task.status === 'PendingVerification' && task.completionRequestedDate && (
                       <p className="text-xs text-muted-foreground mt-1">Requested: {new Date(task.completionRequestedDate).toLocaleDateString()}</p>
                    )}
                  </TableCell>
                  <TableCell>
                      <div className="flex flex-wrap gap-1">
                          {task.skillsRequired.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                      </div>
                  </TableCell>
                  {showActionsColumn && (
                    <TableCell className="text-center space-x-2">
                      {task.status === 'Open' && currentUser?.role === 'Admin' && (
                        <Button variant="outline" size="sm" onClick={() => handleOpenAssignDialog(task)} disabled={isProcessing[task.id]}>
                          <UserCheck className="mr-1 h-4 w-4" /> Assign
                        </Button>
                      )}
                      {task.status === 'PendingVerification' && currentUser?.role === 'Admin' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleApprove(task.id, task.title)} disabled={isProcessing[task.id]} className="bg-green-500 hover:bg-green-600 text-white">
                            <CheckCircle className="mr-1 h-4 w-4" /> Approve
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleReject(task.id, task.title)} disabled={isProcessing[task.id]} className="bg-red-500 hover:bg-red-600 text-white">
                            <XCircle className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={showActionsColumn ? 8 : 7} className="text-center h-24 text-muted-foreground">
                    {initialFilter ? `No tasks found matching filter: ${initialFilter}.` : "No tasks found in the system."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {displayedTasks.length > 0 && (
               <TableCaption>{captionText}</TableCaption>
            )}
          </Table>
        </CardContent>
      </Card>

      {selectedTaskForAssignment && (
        <AssignTaskDialog
          task={selectedTaskForAssignment}
          allUsers={allSystemUsers}
          isOpen={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          onAssignTask={adminAssignTask}
        />
      )}
    </>
  );
}
