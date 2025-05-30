
import { LedgerTable } from "@/components/ledger/LedgerTable";
import { MOCK_LEDGER_ENTRIES, MOCK_LOANS } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Repayment Ledger - SkillCredit",
};

export default function LedgerPage() {
  // In a real app, entries and active loan would be fetched
  const entries = MOCK_LEDGER_ENTRIES;
  const activeLoan = MOCK_LOANS.find(loan => loan.status === 'Active'); // Assuming one active loan for simplicity

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">My Repayment Ledger</h1>
      {activeLoan ? (
        <LedgerTable entries={entries} loanId={activeLoan.id} />
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No active loan found. Ledger details will appear here when you have an active loan.</p>
        </div>
      )}
    </div>
  );
}
