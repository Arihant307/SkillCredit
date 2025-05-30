
"use client";

import type { Loan, Task, LoanStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Bar, ResponsiveContainer, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Library, Banknote, ListTodo, ClipboardList, CheckSquare, ShieldCheck, IndianRupee } from "lucide-react";
import Link from "next/link";

interface AdminDashboardClientProps {
  allSystemLoans: Loan[];
  allSystemTasks: Task[];
}

const loanStatusColors: Record<LoanStatus, string> = {
  Pending: "hsl(var(--chart-1))",
  Approved: "hsl(var(--chart-2))",
  Active: "hsl(var(--chart-3))",
  Rejected: "hsl(var(--chart-4))",
  Paid: "hsl(var(--chart-5))",
};

const chartConfig = {
  count: {
    label: "Number of Loans",
  },
  Pending: { label: "Pending", color: loanStatusColors.Pending },
  Approved: { label: "Approved", color: loanStatusColors.Approved },
  Active: { label: "Active", color: loanStatusColors.Active },
  Rejected: { label: "Rejected", color: loanStatusColors.Rejected },
  Paid: { label: "Paid", color: loanStatusColors.Paid },
} satisfies ChartConfig;


export default function AdminDashboardClient({ allSystemLoans, allSystemTasks }: AdminDashboardClientProps) {
  const totalLoans = allSystemLoans.length;
  const totalActiveLoanValue = allSystemLoans
    .filter(loan => loan.status === 'Active')
    .reduce((sum, loan) => sum + loan.remainingBalance, 0);

  const openTasks = allSystemTasks.filter(task => task.status === 'Open').length;
  const inProgressTasks = allSystemTasks.filter(task => task.status === 'Assigned' || task.status === 'InProgress').length;
  const completedTasks = allSystemTasks.filter(task => task.status === 'Completed').length;

  const loanStatusCounts = allSystemLoans.reduce((acc, loan) => {
    acc[loan.status] = (acc[loan.status] || 0) + 1;
    return acc;
  }, {} as Record<LoanStatus, number>);

  const loanStatusChartData = (Object.keys(loanStatusCounts) as LoanStatus[]).map(status => ({
    status: status,
    count: loanStatusCounts[status],
    fill: loanStatusColors[status],
  }));


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground">Admin Dashboard Overview</h2>
        <Button asChild variant="outline">
          <Link href="/admin">
            <ShieldCheck className="mr-2 h-5 w-5" /> Go to Full Admin Panel
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-md transition-shadow">
          <Link href="/admin?tab=loan-management#all-loans-section" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <Library className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLoans}</div>
              <p className="text-xs text-muted-foreground">Across all users</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <Link href="/admin?tab=loan-management#all-loans-section" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Value of Active Loans</CardTitle>
              <Banknote className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <IndianRupee className="h-6 w-6 mr-1"/>{totalActiveLoanValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Total outstanding balance</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <Link href="/admin?tab=task-management&taskStatusFilter=Open#other-tasks-section" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
              <ListTodo className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openTasks}</div>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <Link href="/admin?tab=task-management#in-progress-tasks-section" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress Tasks</CardTitle>
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTasks}</div>
              <p className="text-xs text-muted-foreground">Currently assigned/active</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <Link href="/admin?tab=task-management&taskStatusFilter=Completed#other-tasks-section" className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">Successfully finished</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Status Distribution</CardTitle>
          <CardDescription>Overview of current statuses for all loans in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <RechartsBarChart data={loanStatusChartData} layout="vertical" accessibilityLayer>
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="status"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <XAxis dataKey="count" type="number" tickLine={false} axisLine={false} tickFormatter={(value) => String(value)} />
              <RechartsTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="count" radius={4}>
                {loanStatusChartData.map((entry) => (
                  <Cell key={`cell-${entry.status}`} fill={entry.fill} name={entry.status}/>
                ))}
              </Bar>
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
