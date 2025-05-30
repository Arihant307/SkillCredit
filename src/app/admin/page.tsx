"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AllLoansTable } from "@/components/admin/AllLoansTable";
import { AllTasksTable } from "@/components/admin/AllTasksTable";
import { ProcessLoanForm } from "@/components/admin/ProcessLoanForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table";
import type { User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AdminPageContent() {
  const { currentUser, allSystemLoans, allSystemUsers, userTasks, isLoading, adminApproveTaskCompletion, adminRejectTaskCompletion } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loanSeekerSearchTerm, setLoanSeekerSearchTerm] = useState("");
  const [filteredLoanSeekers, setFilteredLoanSeekers] = useState<User[]>([]);
  const [workProviderSearchTerm, setWorkProviderSearchTerm] = useState("");
  const [filteredWorkProviders, setFilteredWorkProviders] = useState<User[]>([]);

  const taskStatusFilterForOtherTasks = searchParams.get('taskStatusFilter');
  const activeTabFromUrl = searchParams.get('tab');
  const [currentTab, setCurrentTab] = useState(activeTabFromUrl || "user-management");

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'Admin')) {
      router.push("/");
    }
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    const newTab = searchParams.get('tab');
    if (newTab && newTab !== currentTab) { 
      setCurrentTab(newTab);
    }
  }, [searchParams, currentTab]); 

  useEffect(() => {
    if (allSystemUsers) {
      const loanSeekers = allSystemUsers.filter(user => user.role === 'Loan Seeker');
      if (loanSeekerSearchTerm === "") {
        setFilteredLoanSeekers(loanSeekers);
      } else {
        const lowercasedFilter = loanSeekerSearchTerm.toLowerCase();
        const filtered = loanSeekers.filter(user =>
          (user.name.toLowerCase().includes(lowercasedFilter) ||
          user.email.toLowerCase().includes(lowercasedFilter))
        );
        setFilteredLoanSeekers(filtered);
      }
    }
  }, [loanSeekerSearchTerm, allSystemUsers]);

  useEffect(() => {
    if (allSystemUsers) {
      const workProviders = allSystemUsers.filter(user => user.role === 'User (Work Provider)');
      if (workProviderSearchTerm === "") {
        setFilteredWorkProviders(workProviders);
      } else {
        const lowercasedFilter = workProviderSearchTerm.toLowerCase();
        const filtered = workProviders.filter(user =>
          (user.name.toLowerCase().includes(lowercasedFilter) ||
          user.email.toLowerCase().includes(lowercasedFilter))
        );
        setFilteredWorkProviders(filtered);
      }
    }
  }, [workProviderSearchTerm, allSystemUsers]);


  if (isLoading || !currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading or unauthorized...</p>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', value);
    // When a tab is manually clicked, clear the hash to avoid confusion if the user was scrolled to a specific section.
    newUrl.hash = ''; 
    router.replace(newUrl.toString(), { scroll: false }); // Use router.replace for Next.js consistency
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
        {currentUser && (
          <div className="text-sm text-muted-foreground">
            Logged in as: {currentUser.name} ({currentUser.role})
          </div>
        )}
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="loan-management">Loan Management</TabsTrigger>
          <TabsTrigger value="task-management">Task Management</TabsTrigger>
        </TabsList>

        <TabsContent value="user-management" className="space-y-8">
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Search className="mr-2 h-5 w-5" /> Loan Seeker Search
                </CardTitle>
                <CardDescription>Search for users registered as 'Loan Seeker' by name or email address.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Search Loan Seekers by name or email..."
                  value={loanSeekerSearchTerm}
                  onChange={(e) => setLoanSeekerSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoanSeekers.length > 0 ? filteredLoanSeekers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant='outline'>
                              {user.role}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                            No Loan Seekers found matching your search criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    {filteredLoanSeekers.length > 0 && (
                      <TableCaption>Displaying matching Loan Seekers.</TableCaption>
                    )}
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Search className="mr-2 h-5 w-5" /> Work Provider Search
                </CardTitle>
                <CardDescription>Search for users registered as 'User (Work Provider)' by name or email address.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Search Work Providers by name or email..."
                  value={workProviderSearchTerm}
                  onChange={(e) => setWorkProviderSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorkProviders.length > 0 ? filteredWorkProviders.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant='outline'>
                              {user.role}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                            No Work Providers found matching your search criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    {filteredWorkProviders.length > 0 && (
                      <TableCaption>Displaying matching Work Providers.</TableCaption>
                    )}
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="loan-management" className="space-y-8">
          <section>
            <ProcessLoanForm />
          </section>

          <section id="all-loans-section">
            <AllLoansTable loans={allSystemLoans || []} />
          </section>
        </TabsContent>

        <TabsContent value="task-management" className="space-y-8">
          <section id="in-progress-tasks-section">
            <AllTasksTable 
              tasks={userTasks || []} 
              allSystemUsers={allSystemUsers || []} 
              initialFilter="InProgress" 
            />
          </section>

          <section id="pending-verification-tasks-section">
            <AllTasksTable 
              tasks={userTasks || []} 
              allSystemUsers={allSystemUsers || []} 
              initialFilter="PendingVerification" 
            />
          </section>

          <section id="other-tasks-section">
            <AllTasksTable 
              tasks={userTasks || []} 
              allSystemUsers={allSystemUsers || []} 
              initialFilter={taskStatusFilterForOtherTasks} 
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading admin panel...</p></div>}>
      <AdminPageContent />
    </Suspense>
  );
}
