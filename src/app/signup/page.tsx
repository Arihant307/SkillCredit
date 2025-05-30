
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignupForm } from "@/components/auth/SignupForm";
import { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";

// export const metadata: Metadata = { // Metadata should be defined in layout or server component parents
//   title: `Sign Up - ${APP_NAME}`,
//   description: "Create an account on SkillCredit.",
// };

export default function SignupPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.push("/"); // Redirect to dashboard if already logged in
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || (!isLoading && currentUser)) {
    // Show loading or null while checking auth or if redirecting
     return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <SignupForm />
    </div>
  );
}
