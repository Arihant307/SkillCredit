
import Image from "next/image";
import type { Task } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, IndianRupee, Info, Home, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onApply?: (taskId: string) => void;
}

export function TaskCard({ task, onApply }: TaskCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        {task.imageUrl && (
          <div className="relative w-full h-48 mb-4 rounded-t-lg overflow-hidden">
            <Image 
              src={task.imageUrl} 
              alt={task.title} 
              layout="fill" 
              objectFit="cover" 
              data-ai-hint={task.dataAiHint || "task image"}
            />
          </div>
        )}
        <CardTitle className="text-xl">{task.title}</CardTitle>
        <CardDescription>Posted by: {task.postedBy}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{task.description}</p>
        
        {task.address && (
          <div className="text-sm text-muted-foreground flex items-start">
            <Home className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
            <span className="break-words">Address: {task.address}</span>
          </div>
        )}

        {task.preferredTimeSlot && (
          <div className="text-sm text-muted-foreground flex items-center">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
            <span>Preferred Time: {task.preferredTimeSlot}</span>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold mb-1">Skills Required:</h4>
          <div className="flex flex-wrap gap-2">
            {task.skillsRequired.map(skill => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center text-primary font-semibold">
          <IndianRupee className="h-5 w-5 mr-1" />
          <span>Credits: {task.creditAmount.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant={task.status === 'Open' ? "default" : "outline"} className={task.status === 'Open' ? "bg-accent text-accent-foreground" : ""}>{task.status}</Badge>
        {task.status === 'Open' && onApply && (
          <Button onClick={() => onApply(task.id)} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Briefcase className="mr-2 h-4 w-4" /> Apply
          </Button>
        )}
        {task.status !== 'Open' && (
           <Button variant="outline" size="sm" disabled>
            <Info className="mr-2 h-4 w-4" /> Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
