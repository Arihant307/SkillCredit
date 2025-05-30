
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
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea"; // Added for purpose
import { FileText, Landmark, Banknote } from "lucide-react";

const idProofTypes = ["Aadhaar Card", "PAN Card", "Voter ID", "Passport", "Driving License"] as const;

const loanApplicationSchema = z.object({
  loanAmount: z.number().min(5000, "Minimum loan amount is ₹5,000.").max(50000, "Maximum loan amount is ₹50,000."),
  loanTenure: z.enum(["6", "12", "18", "24", "36"], {
    required_error: "You need to select a loan tenure.",
  }),
  repaymentMethod: z.enum(["EMI", "SkillBased"], {
    required_error: "Please select a preferred repayment method.",
  }),
  purpose: z.string().min(10, "Please briefly describe the purpose of the loan.").max(200, "Purpose description is too long."),
  bankAccountName: z.string().min(2, "Bank account holder name is required."),
  bankAccountNumber: z.string().regex(/^[0-9]{9,18}$/, "Enter a valid bank account number (9-18 digits)."),
  bankIfscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code (e.g., SBIN0001234)."),
  idProofType: z.enum(idProofTypes, {
    required_error: "Please select an ID proof type.",
  }),
  idProofFile: z
    .any()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .refine((files: any) => files?.length == 1, "ID proof document is required.")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .refine((files: any) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`) // 5MB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .refine(
      (files: any) => ["image/jpeg", "image/png", "application/pdf"].includes(files?.[0]?.type),
      "Only .jpg, .png, or .pdf files are accepted."
    ).optional(), // Making it optional if file input is tricky for Turbopack
});

type LoanApplicationFormValues = z.infer<typeof loanApplicationSchema>;

const INTEREST_RATE = 0.08; // 8% annual interest rate, kept constant for demo

export function LoanApplicationForm() {
  const [calculatedEmi, setCalculatedEmi] = useState<number | null>(null);
  const { currentUser, userLoans, addLoan } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoanApplicationFormValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      loanAmount: 25000,
      loanTenure: "12",
      repaymentMethod: "EMI",
      purpose: "",
      bankAccountName: "",
      bankAccountNumber: "",
      bankIfscCode: "",
      idProofType: undefined,
      idProofFile: undefined,
    },
  });

  const loanAmount = form.watch("loanAmount");
  const loanTenure = form.watch("loanTenure");

  useEffect(() => {
    if (loanAmount && loanTenure) {
      const P = loanAmount;
      const r = INTEREST_RATE / 12; // Monthly interest rate
      const n = parseInt(loanTenure, 10); 

      if (P > 0 && r > 0 && n > 0) {
        const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setCalculatedEmi(emi);
      } else {
        setCalculatedEmi(null);
      }
    }
  }, [loanAmount, loanTenure]);

  async function onSubmit(data: LoanApplicationFormValues) {
    setIsSubmitting(true);
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to apply for a loan.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
     if (currentUser.role !== 'Loan Seeker') {
      toast({ title: "Access Denied", description: "Only Loan Seekers can apply for loans.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const activeLoans = userLoans.filter(loan => loan.userId === currentUser.id && loan.status === 'Active');
    if (activeLoans.length >= 2) {
      toast({
        title: "Loan Limit Reached",
        description: "You already have 2 active loans. Please complete an existing loan before applying for a new one.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    const loanDetailsToSubmit = {
        amount: data.loanAmount,
        interestRate: INTEREST_RATE, 
        tenureMonths: parseInt(data.loanTenure, 10),
    };

    // Simulate submission of bank and ID details
    console.log("Bank Details Submitted:", {
        name: data.bankAccountName,
        accountNumber: data.bankAccountNumber,
        ifsc: data.bankIfscCode,
    });
    console.log("ID Proof Submitted:", {
        type: data.idProofType,
        fileName: data.idProofFile?.[0]?.name || "No file selected (dev)",
    });
    
    toast({
        title: "Details Acknowledged",
        description: "Bank and ID proof information noted for processing.",
        duration: 3000,
    });


    const result = await addLoan(loanDetailsToSubmit);

    if (result.success) {
      toast({ title: "Application Submitted", description: result.message || "Your loan application has been received and is now active." });
      form.reset();
      setCalculatedEmi(null);
    } else {
      toast({ title: "Application Failed", description: result.message || "Could not process your loan application.", variant: "destructive" });
    }
    setIsSubmitting(false);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Apply for a Loan</CardTitle>
        <CardDescription>Fill out the form below to apply for a new loan. Maximum loan amount is ₹50,000. You can have up to 2 active loans.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <Card className="p-6 shadow-sm">
              <CardHeader className="p-0 pb-4 mb-4 border-b">
                <CardTitle className="text-lg flex items-center"><Banknote className="mr-2 h-5 w-5 text-primary" />Loan Details</CardTitle>
              </CardHeader>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount: ₹{field.value?.toLocaleString('en-IN')}</FormLabel>
                      <FormControl>
                        <Slider
                          defaultValue={[field.value || 25000]}
                          min={5000} 
                          max={50000}
                          step={1000} 
                          onValueChange={(value) => field.onChange(value[0])}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Select the amount you wish to borrow (between ₹5,000 and ₹50,000).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loanTenure"
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
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {calculatedEmi !== null && (
                  <div className="p-3 bg-secondary rounded-md">
                    <p className="text-sm text-secondary-foreground">Estimated Monthly EMI: <span className="font-semibold text-base text-primary">₹{calculatedEmi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> (at {INTEREST_RATE*100}% p.a.)</p>
                    <p className="text-xs text-muted-foreground">This is an estimate. Actual EMI may vary.</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="repaymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Preferred Repayment Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                          disabled={isSubmitting}
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="EMI" />
                            </FormControl>
                            <Label className="font-normal">Traditional EMI</Label>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="SkillBased" />
                            </FormControl>
                            <Label className="font-normal">Skill-Based Tasks (Partial or Full)</Label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of Loan</FormLabel>
                      <FormControl>
                        <Textarea placeholder="E.g., Upskilling course, Purchase of tools, Emergency medical expense" {...field} disabled={isSubmitting} className="resize-none"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Card className="p-6 shadow-sm">
              <CardHeader className="p-0 pb-4 mb-4 border-b">
                <CardTitle className="text-lg flex items-center"><Landmark className="mr-2 h-5 w-5 text-primary"/>Bank Account Details</CardTitle>
              </CardHeader>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="bankAccountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="As per your bank records" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your bank account number" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankIfscCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., SBIN0001234" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
            
            <Card className="p-6 shadow-sm">
              <CardHeader className="p-0 pb-4 mb-4 border-b">
                <CardTitle className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>ID Proof Submission</CardTitle>
              </CardHeader>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="idProofType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Proof Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ID proof type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {idProofTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idProofFile"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Upload ID Proof Document</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          {...fieldProps} 
                          onChange={(event) => onChange(event.target.files)}
                          disabled={isSubmitting} 
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                      </FormControl>
                      <FormDescription>Max 5MB. Accepted formats: JPG, PNG, PDF.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
            
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base" disabled={isSubmitting}>
              {isSubmitting ? "Submitting Application..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

