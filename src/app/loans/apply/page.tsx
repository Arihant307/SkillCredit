
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoanApplicationForm } from "@/components/loans/LoanApplicationForm";
import { useAuth } from "@/contexts/AuthContext";
// import { Metadata } from "next"; // Metadata for client components handled by parent

// export const metadata: Metadata = {
//   title: "Apply for Loan - SkillCredit",
// };

export default function LoanApplicationPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.push("/login"); // Redirect to login if not authenticated
      } else if (currentUser.role !== 'Loan Seeker') {
        router.push("/"); // Redirect to dashboard if not a Loan Seeker
      }
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser || currentUser.role !== 'Loan Seeker') {
    // Show loading or a blank page while redirecting
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading or unauthorized...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* <h1 className="text-3xl font-bold mb-8 text-foreground">Loan Application</h1> */}
      <LoanApplicationForm />
    </div>
  );
}
