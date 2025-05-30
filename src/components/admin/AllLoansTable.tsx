
"use client";

import type { Loan } from "@/lib/types";
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
import { IndianRupee } from "lucide-react";

interface AllLoansTableProps {
  loans: Loan[];
}

export function AllLoansTable({ loans }: AllLoansTableProps) {
  const sortedLoans = [...loans].sort((a,b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">All User Loans</CardTitle>
        <CardDescription>A complete history of all loans in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">EMI</TableHead>
              <TableHead className="text-center">Tenure (M)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Application Date</TableHead>
              <TableHead className="text-right">Remaining Bal.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLoans.length > 0 ? sortedLoans.map(loan => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">{loan.id}</TableCell>
                <TableCell>{loan.userId}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <IndianRupee className="h-4 w-4 mr-1" />{loan.amount.toLocaleString('en-IN')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <IndianRupee className="h-4 w-4 mr-1" />{loan.emiAmount.toLocaleString('en-IN')}
                  </div>
                </TableCell>
                <TableCell className="text-center">{loan.tenureMonths}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      loan.status === 'Active' ? 'default' :
                      loan.status === 'Paid' ? 'secondary' :
                      loan.status === 'Approved' ? 'default' : 
                      'outline'
                    }
                    className={
                        loan.status === 'Active' ? 'bg-accent text-accent-foreground' :
                        loan.status === 'Paid' ? 'bg-green-600 text-primary-foreground hover:bg-green-700' :
                        loan.status === 'Pending' ? 'bg-yellow-500 text-black' :
                        loan.status === 'Rejected' ? 'bg-destructive text-destructive-foreground' :
                        loan.status === 'Approved' ? 'bg-blue-500 text-white hover:bg-blue-600' : 
                        ''
                    }
                  >
                    {loan.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(loan.applicationDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <IndianRupee className="h-4 w-4 mr-1" />{loan.remainingBalance.toLocaleString('en-IN')}
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                  No loans found in the system.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {sortedLoans.length > 0 && (
             <TableCaption>Overview of all user loans.</TableCaption>
          )}
        </Table>
      </CardContent>
    </Card>
  );
}
