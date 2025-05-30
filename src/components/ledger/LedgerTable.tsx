
"use client";

import type { LedgerEntry } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, Landmark, Briefcase, IndianRupee } from "lucide-react";

interface LedgerTableProps {
  entries: LedgerEntry[];
  loanId: string; // To filter entries for a specific loan
}

export function LedgerTable({ entries, loanId }: LedgerTableProps) {
  const loanEntries = entries.filter(entry => entry.loanId === loanId);

  const totalCredited = loanEntries
    .filter(entry => entry.paymentType === 'TaskCredit')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalPaidByEMI = loanEntries
    .filter(entry => entry.paymentType === 'EMI')
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  const totalRepaid = totalCredited + totalPaidByEMI;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Repayment Ledger (Loan ID: {loanId})</CardTitle>
        <CardDescription>Track your monetary (EMI) and work-based (Task Credit) repayments.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-secondary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-secondary-foreground">
                <Landmark className="h-4 w-4 mr-2 text-primary" /> Total Paid via EMI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">₹{totalPaidByEMI.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-secondary-foreground">
                <Briefcase className="h-4 w-4 mr-2 text-accent" /> Total Credits Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">₹{totalCredited.toFixed(2)}</p>
            </CardContent>
          </Card>
           <Card className="bg-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-primary-foreground">
                <ArrowUpCircle className="h-4 w-4 mr-2" /> Total Repaid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary-foreground">₹{totalRepaid.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[150px]">Type</TableHead>
              <TableHead className="text-right w-[120px]">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loanEntries.length > 0 ? loanEntries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{entry.description}</TableCell>
                <TableCell>
                  <Badge variant={entry.paymentType === 'TaskCredit' ? 'default' : 'secondary'} 
                         className={entry.paymentType === 'TaskCredit' ? 'bg-accent text-accent-foreground' : 'bg-primary/20 text-primary'}>
                    {entry.paymentType === 'TaskCredit' ? 
                      <Briefcase className="mr-1 h-3 w-3"/> : 
                      <Landmark className="mr-1 h-3 w-3"/> }
                    {entry.paymentType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={entry.paymentType === 'TaskCredit' ? 'text-accent' : 'text-primary'}>
                    ₹{entry.amount.toFixed(2)}
                  </span>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  No repayment entries found for this loan yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {loanEntries.length > 0 && (
             <TableCaption>A summary of all repayments made towards loan {loanId}.</TableCaption>
          )}
        </Table>
      </CardContent>
    </Card>
  );
}
