
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { LoanStatus, AdminLoanCreationPayload } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

const loanStatusValues: [LoanStatus, ...LoanStatus[]] = ['Pending', 'Active', 'Approved', 'Rejected', 'Paid']; // 'Paid' might be for later

const processLoanFormSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  amount: z.coerce.number().min(1000, "Minimum loan amount is ₹1,000.").max(1000000, "Maximum loan amount is ₹1,000,000."), // Adjusted max for admin
  tenureMonths: z.enum(["6", "12", "18", "24", "36", "48", "60"], {
    required_error: "You need to select a loan tenure.",
  }),
  status: z.enum(loanStatusValues, {
    required_error: "Loan status is required.",
  }),
  bankDetails: z.string().optional(),
});

type ProcessLoanFormValues = z.infer<typeof processLoanFormSchema>;

export function ProcessLoanForm() {
  const { adminCreateLoan } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProcessLoanFormValues>({
    resolver: zodResolver(processLoanFormSchema),
    defaultValues: {
      userId: "",
      amount: 25000,
      tenureMonths: "12",
      status: "Pending",
      bankDetails: "",
    },
  });

  async function onSubmit(data: ProcessLoanFormValues) {
    setIsSubmitting(true);
    
    const payload: AdminLoanCreationPayload = {
      userId: data.userId,
      amount: data.amount,
      tenureMonths: parseInt(data.tenureMonths, 10),
      status: data.status,
      bankDetails: data.bankDetails,
    };

    const result = await adminCreateLoan(payload);

    if (result.success) {
      toast({
        title: "Loan Processed",
        description: result.message || "The loan has been processed successfully.",
      });
      form.reset(); // Reset form on success
    } else {
      toast({
        title: "Processing Failed",
        description: result.message || "Could not process the loan.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Process/Create Loan for User</CardTitle>
        <CardDescription>Manually create or update a loan status for a user.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter User ID (e.g., user123)" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tenureMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Tenure (Months)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan tenure" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="18">18 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                      <SelectItem value="36">36 Months</SelectItem>
                      <SelectItem value="48">48 Months</SelectItem>
                      <SelectItem value="60">60 Months</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loanStatusValues.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bankDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Account Holder Name, Account Number, IFSC Code" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormDescription>Enter bank details for loan disbursement. For demo purposes only.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Process Loan"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
