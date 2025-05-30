
import type { NavItem, User, Loan, Task, LedgerEntry, Role } from '@/lib/types';
import { LayoutDashboard, UserCircle, Landmark, ListChecks, BookText, LogIn, UserPlus, ShieldCheck, BriefcaseBusiness } from 'lucide-react';

export const APP_NAME = "SkillCredit";

export const USER_ROLES: Role[] = ['Loan Seeker', 'Admin', 'User (Work Provider)'];

export const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard, requiresAuth: true },
  { title: 'Login', href: '/login', icon: LogIn, showOnlyWhenLoggedOut: true },
  { title: 'Sign Up', href: '/signup', icon: UserPlus, showOnlyWhenLoggedOut: true },
  { title: 'My Profile', href: '/profile', icon: UserCircle, requiresAuth: true },
  { title: 'Apply for Loan', href: '/loans/apply', icon: Landmark, requiresAuth: true, roles: ['Loan Seeker'] },
  { title: 'Available Tasks', href: '/tasks', icon: ListChecks, requiresAuth: true, roles: ['Loan Seeker'] },
  { title: 'My Ledger', href: '/ledger', icon: BookText, requiresAuth: true, roles: ['Loan Seeker'] },
  { title: 'Post a Task', href: '/tasks/post', icon: BriefcaseBusiness, requiresAuth: true, roles: ['User (Work Provider)', 'Admin'] },
  { title: 'Admin Panel', href: '/admin', icon: ShieldCheck, requiresAuth: true, roles: ['Admin'] },
];

// Mock Data
export const MOCK_USER: User = {
  id: 'user123',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  role: 'Loan Seeker',
  avatarUrl: 'https://placehold.co/100x100.png',
  skills: ['Web Design', 'JavaScript', 'React', 'Graphic Design', 'Plumbing'],
  bio: 'A versatile professional skilled in both digital and manual trades, looking to leverage skills for financial growth.',
};

export const MOCK_ADMIN_USER: User = {
  id: 'admin001',
  name: 'Admin User',
  email: 'admin@skillcredit.com',
  role: 'Admin',
  avatarUrl: 'https://placehold.co/100x100.png',
  skills: [],
  bio: 'Administrator for SkillCredit platform.',
};


export const MOCK_LOANS: Loan[] = [
  {
    id: 'loan001',
    userId: 'user123',
    amount: 5000,
    interestRate: 0.08,
    tenureMonths: 12,
    emiAmount: 434.94,
    status: 'Active',
    applicationDate: '2023-05-10',
    approvedDate: '2023-05-12',
    totalRepaid: 1739.76,
    remainingBalance: 3260.24,
  },
  {
    id: 'loan002',
    userId: 'user456', // A different user for testing admin view
    amount: 10000,
    interestRate: 0.10,
    tenureMonths: 24,
    emiAmount: 461.45,
    status: 'Active',
    applicationDate: '2023-08-15',
    approvedDate: '2023-08-17',
    totalRepaid: 0,
    remainingBalance: 10000,
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'task001',
    title: 'Design a Landing Page for a Startup',
    description: 'Create a modern and responsive landing page. Figma designs will be provided. Need HTML, CSS, and basic JS.',
    skillsRequired: ['Web Design', 'HTML', 'CSS', 'JavaScript'],
    creditAmount: 300,
    status: 'Open',
    postedBy: 'Tech Solutions Inc.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'website design',
  },
  {
    id: 'task002',
    title: 'Fix Leaky Faucet in Residential Unit',
    description: 'Identify and repair a leaky faucet in a bathroom. Standard tools required.',
    skillsRequired: ['Plumbing'],
    creditAmount: 75,
    status: 'Open',
    postedBy: 'Property Management Co.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'plumbing tools',
  },
  {
    id: 'task003',
    title: 'Create Company Logo',
    description: 'Design a unique and memorable logo for a new coffee shop. Deliverables in vector format.',
    skillsRequired: ['Graphic Design', 'Branding'],
    creditAmount: 150,
    status: 'Completed',
    assignedTo: 'user123', // MOCK_USER's ID
    postedBy: 'The Daily Grind',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'logo coffee',
  },
  {
    id: 'task004',
    title: 'Electrical Wiring for New Room',
    description: 'Install electrical wiring, outlets, and light fixtures for a newly constructed room. Must adhere to local codes.',
    skillsRequired: ['Electrician'],
    creditAmount: 400,
    status: 'Open',
    postedBy: 'Home Builders Ltd.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'electrical wiring',
  },
  {
    id: 'task005',
    title: 'Content Writing for Blog',
    description: 'Write 5 blog posts (500 words each) on specified topics related to finance.',
    skillsRequired: ['Content Writing'],
    creditAmount: 250,
    status: 'Assigned', // Should show for 'InProgress' filter
    assignedTo: 'user789',
    postedBy: 'Finance Bloggers Inc.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'writing blog',
  },
  {
    id: 'task006',
    title: 'Develop New Feature Module',
    description: 'Backend and frontend work for a new reporting module. Specs available.',
    skillsRequired: ['Node.js', 'React', 'Database Management'],
    creditAmount: 600,
    status: 'InProgress', // Explicitly InProgress, should show for 'InProgress' filter
    assignedTo: 'user123',
    postedBy: 'Innovatech Ltd.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'software development',
  }
];

export const MOCK_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'entry001',
    loanId: 'loan001',
    paymentType: 'EMI',
    amount: 434.94,
    date: '2023-06-01',
    description: 'Monthly EMI Payment',
  },
  {
    id: 'entry002',
    loanId: 'loan001',
    taskId: 'task003',
    paymentType: 'TaskCredit',
    amount: 150,
    date: '2023-06-15',
    description: 'Task: Create Company Logo',
  },
  {
    id: 'entry003',
    loanId: 'loan001',
    paymentType: 'EMI',
    amount: 434.94,
    date: '2023-07-01',
    description: 'Monthly EMI Payment',
  },
];

export const ALL_POSSIBLE_SKILLS = [
  "Web Design", "JavaScript", "React", "Graphic Design", "Plumbing", "Electrician",
  "Python", "Data Analysis", "Content Writing", "SEO Optimization", "Social Media Marketing",
  "Video Editing", "Photography", "Carpentry", "Painting", "Tutoring", "HTML", "CSS",
  "Node.js", "Illustration", "Branding", "Manual Labor", "Welding", "Database Management"
];
