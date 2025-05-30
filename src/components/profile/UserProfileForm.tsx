
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { User, Loan, Task, Role } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ALL_POSSIBLE_SKILLS, USER_ROLES } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";


const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be at most 50 characters."),
  email: z.string().email("Invalid email address."),
  bio: z.string().max(300, "Bio must be at most 300 characters.").optional(),
  skills: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one skill.",
  }),
  avatarUrl: z.string().url("Invalid URL format.").optional().or(z.literal("")),
  role: z.enum(USER_ROLES as [Role, ...Role[]]).readonly(), // Role is read-only for now
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfileFormProps {
  user: User;
  loans: Loan[];
  tasks: Task[];
}

export function UserProfileForm({ user, loans, tasks }: UserProfileFormProps) {
  const { toast } = useToast();
  const { login } = useAuth(); 

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      skills: user?.skills || [],
      avatarUrl: user?.avatarUrl || "",
      role: user?.role, // Initialize role
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        skills: user.skills || [],
        avatarUrl: user.avatarUrl || "",
        role: user.role, // Reset role
      });
    }
  }, [user, form]);


  async function onSubmit(data: ProfileFormValues) {
    if (user) {
      const updatedUser: User = {
        ...user,
        name: data.name,
        email: data.email, 
        bio: data.bio,
        skills: data.skills,
        avatarUrl: data.avatarUrl,
        role: user.role, // Role is not changed via this form for now
      };
      
      // Simulate update by re-logging in with updated details (excluding role change here)
      // This will refresh AuthContext and localStorage
      await login(updatedUser.email, "password123", updatedUser.name, updatedUser.role); 
      
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    }
  }
  
  if (!user) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={form.watch("avatarUrl") || (user.avatarUrl || `https://avatar.vercel.sh/${form.watch("name") || user.name}.png`)} 
                alt={form.watch("name") || user.name} 
                data-ai-hint="user avatar"
              />
              <AvatarFallback>{(form.watch("name") || user.name)?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{form.watch("name") || user.name}</CardTitle>
              <CardDescription>{form.watch("email") || user.email}</CardDescription>
              <Badge variant="outline" className="mt-1">{user.role}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.png" {...field} />
                    </FormControl>
                    <FormDescription>Enter a URL for your profile picture. Leave blank for default.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself and your skills"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                        <Input {...field} disabled className="bg-muted/50" />
                    </FormControl>
                    <FormDescription>Your role is set during signup and cannot be changed here.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {user.role === 'Loan Seeker' && (
                <FormField
                  control={form.control}
                  name="skills"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Skills</FormLabel>
                        <FormDescription>
                          Select the skills you possess. These will be used for task matching.
                        </FormDescription>
                      </div>
                      <ScrollArea className="h-40 rounded-md border p-4">
                      {ALL_POSSIBLE_SKILLS.map((skill) => (
                        <FormField
                          key={skill}
                          control={form.control}
                          name="skills"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={skill}
                                className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(skill)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), skill])
                                        : field.onChange(
                                            (field.value || []).filter(
                                              (value) => value !== skill
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {skill}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      </ScrollArea>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Update Profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {user.role === 'Loan Seeker' && (
        <Card>
          <CardHeader>
            <CardTitle>My Loans</CardTitle>
            <CardDescription>Overview of your loan history.</CardDescription>
          </CardHeader>
          <CardContent>
            {loans && loans.length > 0 ? (
              <ul className="space-y-4">
                {loans.map(loan => (
                  <li key={loan.id} className="p-4 border rounded-md shadow-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Loan ID: {loan.id}</h3>
                      <Badge variant={loan.status === 'Active' ? "default" : "secondary"} className={loan.status === 'Active' ? 'bg-accent text-accent-foreground' : ''}>{loan.status}</Badge>
                    </div>
                    <p>Amount: ₹{loan.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p>Remaining: ₹{loan.remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p>EMI: ₹{loan.emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / month</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No loans found.</p>
            )}
          </CardContent>
        </Card>
      )}

      {user.role === 'Loan Seeker' && (
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Overview of tasks you have worked on.</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks && tasks.filter(task => task.assignedTo === user.id).length > 0 ? (
              <ul className="space-y-4">
                {tasks.filter(task => task.assignedTo === user.id).map(task => (
                  <li key={task.id} className="p-4 border rounded-md shadow-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <Badge variant={task.status === 'Completed' ? "default" : "outline"} className={task.status === 'Completed' ? 'bg-primary text-primary-foreground' : ''}>{task.status}</Badge>
                    </div>
                    <p>Credits: ₹{task.creditAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tasks assigned or completed yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
