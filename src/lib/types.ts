
export type Role = 'Loan Seeker' | 'Admin' | 'User (Work Provider)';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for client-side auth simulation
  role: Role;
  avatarUrl?: string;
  skills: string[];
  bio?: string;
}

export type LoanStatus = 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Paid';

export interface Loan {
  id: string;
  userId: string;
  amount: number;
  interestRate: number; // Annual interest rate (e.g., 0.08 for 8%)
  tenureMonths: number;
  emiAmount: number;
  status: LoanStatus;
  applicationDate: string; // YYYY-MM-DD
  approvedDate?: string; // YYYY-MM-DD
  totalRepaid: number;
  remainingBalance: number;
  bankDetails?: string; // Added for Admin processing
}

export type TaskStatus = 'Open' | 'Assigned' | 'InProgress' | 'PendingVerification' | 'Completed' | 'Cancelled';

export interface Task {
  id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  creditAmount: number;
  status: TaskStatus;
  postedBy: string; // User's name
  assignedTo?: string; // User ID
  deadline?: string;
  imageUrl?: string;
  dataAiHint?: string;
  completionRequestedDate?: string; // YYYY-MM-DD
  fundingMethod?: string; // e.g., 'card1', 'upi', 'cod'
  loanSeekerPaymentDetailsForCOD?: { // Details if loan seeker "paid" for a COD task
    paymentMethod: string; // e.g., 'SimulatedPlatformPayment'
    paidDate: string; // YYYY-MM-DD
  };
  address?: string; // New field for service address
  preferredTimeSlot?: string; // New field for preferred time slot
}

export interface LedgerEntry {
  id: string;
  loanId: string;
  taskId?: string; // if repayment via task
  paymentType: 'EMI' | 'TaskCredit';
  amount: number;
  date: string;
  description: string; // e.g., "Monthly EMI" or "Task: Web Design Project"
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  requiresAuth?: boolean; // True if item should only be shown to authenticated users
  showOnlyWhenLoggedOut?: boolean; // True if item should only be shown to unauthenticated users
  roles?: Role[]; // Roles that can see this item. If undefined, all authenticated users can see it (if requiresAuth is true). Admins typically see all.
}

// Payload for admin creating a loan
export interface AdminLoanCreationPayload {
  userId: string;
  amount: number;
  tenureMonths: number;
  status: LoanStatus;
  bankDetails?: string;
}

