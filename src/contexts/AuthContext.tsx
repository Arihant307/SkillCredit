
"use client";

import type { User, Loan, Task, Role, LoanStatus, AdminLoanCreationPayload, TaskStatus } from "@/lib/types";
import { MOCK_USER, MOCK_LOANS, MOCK_TASKS, MOCK_ADMIN_USER } from "@/lib/constants";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

const FIXED_INTEREST_RATE = 0.08; // 8% annual interest rate

interface AuthContextType {
  currentUser: User | null;
  userLoans: Loan[]; 
  allSystemLoans: Loan[]; 
  allSystemUsers: User[]; 
  userTasks: Task[]; 
  login: (email?: string, password?: string, name?: string, role?: Role) => Promise<{ success: boolean; isFirstLoginAfterSignup?: boolean; user?: User | null; message?: string }>;
  logout: () => void;
  addLoan: (loanData: Omit<Loan, 'id' | 'userId' | 'status' | 'totalRepaid' | 'remainingBalance' | 'emiAmount' | 'applicationDate' | 'bankDetails'> & { tenureMonths: number }) => Promise<{ success: boolean; message?: string }>;
  adminCreateLoan: (payload: AdminLoanCreationPayload) => Promise<{ success: boolean; message?: string; newLoan?: Loan }>;
  applyForTask: (taskId: string) => Promise<{ success: boolean; message?: string; updatedTask?: Task }>;
  postNewTask: (taskData: Omit<Task, 'id' | 'status' | 'postedBy' | 'assignedTo' | 'completionRequestedDate' | 'loanSeekerPaymentDetailsForCOD'>) => Promise<{ success: boolean; message?: string; newTask?: Task }>;
  adminAssignTask: (taskId: string, userId: string) => Promise<{ success: boolean; message?: string; updatedTask?: Task }>;
  requestTaskVerification: (taskId: string) => Promise<{ success: boolean; message?: string; updatedTask?: Task }>;
  adminApproveTaskCompletion: (taskId: string) => Promise<{ success: boolean; message?: string; updatedTask?: Task }>;
  adminRejectTaskCompletion: (taskId: string) => Promise<{ success: boolean; message?: string; updatedTask?: Task }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [allSystemLoans, setAllSystemLoans] = useState<Loan[]>([]);
  const [allSystemUsers, setAllSystemUsers] = useState<User[]>([]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const storedUser = localStorage.getItem("currentUser");

    let initialAllUsers = [MOCK_USER, MOCK_ADMIN_USER];
    const allUsersRaw = localStorage.getItem("allUsers");
    if (allUsersRaw) {
      try {
        const parsedUsers = JSON.parse(allUsersRaw);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          initialAllUsers = parsedUsers;
        }
      } catch (e) {
        console.error("Failed to parse all users from localStorage:", e);
      }
    }
    setAllSystemUsers(initialAllUsers);
    if (!allUsersRaw || initialAllUsers.length <= 2) { 
        localStorage.setItem("allUsers", JSON.stringify(initialAllUsers));
    }


    let initialSystemLoans = MOCK_LOANS;
    const storedAllSystemLoansRaw = localStorage.getItem("allSystemLoans");
    if (storedAllSystemLoansRaw) {
        try {
            const parsedLoans = JSON.parse(storedAllSystemLoansRaw);
            if (Array.isArray(parsedLoans)) initialSystemLoans = parsedLoans;
        } catch (e) {
            console.error("Failed to parse all system loans:", e);
        }
    }
    setAllSystemLoans(initialSystemLoans);
    if (!storedAllSystemLoansRaw) {
        localStorage.setItem("allSystemLoans", JSON.stringify(initialSystemLoans));
    }

    let initialTasks = MOCK_TASKS;
    const storedTasksRaw = localStorage.getItem("userTasks");
    if (storedTasksRaw) {
        try {
            const parsedTasks = JSON.parse(storedTasksRaw);
            if (Array.isArray(parsedTasks)) initialTasks = parsedTasks;
        } catch (e) {
            console.error("Failed to parse tasks from localStorage on init:", e);
        }
    }
    setUserTasks(initialTasks);
    if(!storedTasksRaw){
        localStorage.setItem("userTasks", JSON.stringify(initialTasks));
    }


    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);

        if (parsedUser.role === 'Loan Seeker') {
           const userSpecificLoansKey = `userLoans-${parsedUser.id}`;
           const storedUserSpecificLoansRaw = localStorage.getItem(userSpecificLoansKey);
           if (storedUserSpecificLoansRaw) {
                try {
                    setUserLoans(JSON.parse(storedUserSpecificLoansRaw));
                } catch (e) {
                     console.error(`Failed to parse loans for user ${parsedUser.id} from localStorage`, e);
                     if (parsedUser.id === MOCK_USER.id) { 
                         const mockUserLoans = MOCK_LOANS.filter(loan => loan.userId === MOCK_USER.id);
                         setUserLoans(mockUserLoans);
                         localStorage.setItem(userSpecificLoansKey, JSON.stringify(mockUserLoans));
                     } else { 
                         setUserLoans([]);
                         localStorage.setItem(userSpecificLoansKey, JSON.stringify([]));
                     }
                }
           } else {
               if (parsedUser.id === MOCK_USER.id) {
                   const mockUserLoans = MOCK_LOANS.filter(loan => loan.userId === MOCK_USER.id);
                   setUserLoans(mockUserLoans);
                   localStorage.setItem(userSpecificLoansKey, JSON.stringify(mockUserLoans));
               } else { 
                  setUserLoans([]);
                  localStorage.setItem(userSpecificLoansKey, JSON.stringify([]));
               }
           }
        } else {
           setUserLoans([]); 
        }
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email?: string, password?: string, name?: string, role?: Role): Promise<{ success: boolean; isFirstLoginAfterSignup?: boolean; user?: User | null; message?: string }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 

    let userToLogin: User | undefined;
    
    if (name && email && password && role) { // Signup Path
      const existingUser = allSystemUsers.find(u => u.email === email);
      if (existingUser) {
        setIsLoading(false);
        return { success: false, user: null, message: "Email already exists." };
      }
      const newUserId = `user-${Date.now()}`;
      userToLogin = {
        id: newUserId,
        name,
        email,
        password: password, 
        role,
        avatarUrl: `https://avatar.vercel.sh/${name}.png`,
        skills: role === 'Loan Seeker' ? [] : [],
        bio: `Newly registered ${role}.`
      };
      const updatedAllUsers = [...allSystemUsers, userToLogin];
      setAllSystemUsers(updatedAllUsers);
      localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));
      
      if (userToLogin.role === 'Loan Seeker') {
        localStorage.setItem(`userLoans-${newUserId}`, JSON.stringify([]));
      }
      
      setIsLoading(false);
      return { success: true, user: userToLogin, message: "Signup successful. Please login." }; 

    } else if (email && password) { // Login Path
      let isFirstLoginAfterSignup = false; 

      if (email === MOCK_USER.email && password === MOCK_USER.password) {
        userToLogin = MOCK_USER;
      } else if (email === MOCK_ADMIN_USER.email && password === MOCK_ADMIN_USER.password) {
        userToLogin = MOCK_ADMIN_USER;
      } else {
        userToLogin = allSystemUsers.find(u => u.email === email && u.password === password);
      }

      if (!userToLogin) {
        setIsLoading(false);
        return { success: false, user: null, message: "Invalid email or password." };
      }

      setCurrentUser(userToLogin);
      localStorage.setItem("currentUser", JSON.stringify(userToLogin));
      
      const firstLoginFlagKey = `firstLoginComplete-${userToLogin.id}`;
      if (!localStorage.getItem(firstLoginFlagKey)) {
        isFirstLoginAfterSignup = true;
        localStorage.setItem(firstLoginFlagKey, 'true');
      }
      
      if (userToLogin.role === 'Loan Seeker') {
         const userSpecificLoansKey = `userLoans-${userToLogin.id}`;
         const storedUserSpecificLoansRaw = localStorage.getItem(userSpecificLoansKey);
         if (storedUserSpecificLoansRaw) {
             try {
                 setUserLoans(JSON.parse(storedUserSpecificLoansRaw));
             } catch (e) {
                 console.error(`Failed to parse loans for user ${userToLogin.id} from localStorage`, e);
                  if (userToLogin.id === MOCK_USER.id) { 
                     const mockUserLoans = MOCK_LOANS.filter(loan => loan.userId === MOCK_USER.id);
                     setUserLoans(mockUserLoans);
                     localStorage.setItem(userSpecificLoansKey, JSON.stringify(mockUserLoans));
                 } else { 
                     setUserLoans([]);
                     localStorage.setItem(userSpecificLoansKey, JSON.stringify([]));
                 }
             }
         } else { 
              if (userToLogin.id === MOCK_USER.id) { 
                  const mockUserLoans = MOCK_LOANS.filter(loan => loan.userId === MOCK_USER.id);
                  setUserLoans(mockUserLoans);
                  localStorage.setItem(userSpecificLoansKey, JSON.stringify(mockUserLoans));
              } else { 
                  setUserLoans([]);
                  localStorage.setItem(userSpecificLoansKey, JSON.stringify([]));
              }
         }
     } else {
         setUserLoans([]); 
     }

      setIsLoading(false);
      return { success: true, isFirstLoginAfterSignup, user: userToLogin };
    } else {
        setIsLoading(false);
        return { success: false, user: null, message: "Invalid login attempt." };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserLoans([]);
    localStorage.removeItem("currentUser");
  };

  const addLoan = async (
    loanData: Omit<Loan, 'id' | 'userId' | 'status' | 'totalRepaid' | 'remainingBalance' | 'emiAmount' | 'applicationDate' | 'bankDetails'> & { tenureMonths: number }
  ): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: "User not logged in." };
    }
    if (currentUser.role !== 'Loan Seeker') {
        return { success: false, message: "Only Loan Seekers can apply for loans." };
    }

    const activeUserLoans = userLoans.filter(loan => loan.userId === currentUser.id && loan.status === 'Active');
    if (activeUserLoans.length >= 2) {
      return { success: false, message: "You already have the maximum number of active loans (2)." };
    }

    const P = loanData.amount;
    const r = FIXED_INTEREST_RATE / 12;
    const n = loanData.tenureMonths;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) || 0;

    const newLoan: Loan = {
      ...loanData,
      id: `loan-${Date.now()}`,
      userId: currentUser.id,
      status: 'Active',
      interestRate: FIXED_INTEREST_RATE,
      totalRepaid: 0,
      remainingBalance: loanData.amount,
      emiAmount: parseFloat(emi.toFixed(2)),
      applicationDate: new Date().toISOString().split('T')[0],
    };

    const updatedUserSpecificLoans = [...userLoans, newLoan];
    setUserLoans(updatedUserSpecificLoans);
    localStorage.setItem(`userLoans-${currentUser.id}`, JSON.stringify(updatedUserSpecificLoans));

    const updatedAllSystemLoans = [...allSystemLoans, newLoan];
    setAllSystemLoans(updatedAllSystemLoans);
    localStorage.setItem("allSystemLoans", JSON.stringify(updatedAllSystemLoans));

    return { success: true, message: "Loan application successful and is now active." };
  };

  const adminCreateLoan = async (payload: AdminLoanCreationPayload): Promise<{ success: boolean; message?: string; newLoan?: Loan }> => {
    if (!currentUser || currentUser.role !== 'Admin') {
      return { success: false, message: "Unauthorized action. Only Admins can create loans this way." };
    }

    const P = payload.amount;
    const r = FIXED_INTEREST_RATE / 12;
    const n = payload.tenureMonths;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) || 0;

    const newLoanForUser: Loan = {
      id: `loan-admin-${Date.now()}`,
      userId: payload.userId,
      amount: payload.amount,
      interestRate: FIXED_INTEREST_RATE,
      tenureMonths: payload.tenureMonths,
      emiAmount: parseFloat(emi.toFixed(2)),
      status: payload.status,
      applicationDate: new Date().toISOString().split('T')[0],
      approvedDate: (payload.status === 'Approved' || payload.status === 'Active') ? new Date().toISOString().split('T')[0] : undefined,
      totalRepaid: 0,
      remainingBalance: payload.amount,
      bankDetails: payload.bankDetails,
    };

    const updatedAllSystemLoans = [...allSystemLoans, newLoanForUser];
    setAllSystemLoans(updatedAllSystemLoans);
    localStorage.setItem("allSystemLoans", JSON.stringify(updatedAllSystemLoans));

    const targetUserLoansKey = `userLoans-${payload.userId}`;
    let targetUserLoansStored: Loan[] = [];
    const storedTargetUserLoansRaw = localStorage.getItem(targetUserLoansKey);
    if (storedTargetUserLoansRaw) {
      try {
        targetUserLoansStored = JSON.parse(storedTargetUserLoansRaw);
      } catch (e) {
        console.error(`Failed to parse loans for user ${payload.userId} from localStorage`, e);
      }
    }
    
    if (!targetUserLoansStored.find(loan => loan.id === newLoanForUser.id)) {
        targetUserLoansStored.push(newLoanForUser);
        localStorage.setItem(targetUserLoansKey, JSON.stringify(targetUserLoansStored));
    }
    
    if (currentUser.id === payload.userId && currentUser.role === 'Loan Seeker') {
      setUserLoans(prevUserLoans => [...prevUserLoans, newLoanForUser]);
    }

    return { success: true, message: `Loan for user ${payload.userId} (${payload.status}) created successfully.`, newLoan: newLoanForUser };
  };


  const applyForTask = async (taskId: string): Promise<{ success: boolean; message?: string; updatedTask?: Task }> => {
    if (!currentUser) {
      return { success: false, message: "You must be logged in to apply for tasks." };
    }
    if (currentUser.role !== 'Loan Seeker') {
        return { success: false, message: "Only Loan Seekers can apply for/assign tasks." };
    }

    let taskUpdated = false;
    let foundTask: Task | undefined;

    const updatedTasks = userTasks.map(task => {
      if (task.id === taskId) {
        if (task.status === 'Open') {
          foundTask = { ...task, status: 'Assigned', assignedTo: currentUser.id };
          taskUpdated = true;
          return foundTask;
        } else {
          foundTask = task; 
          return task;
        }
      }
      return task;
    });

    if (taskUpdated && foundTask) {
      setUserTasks(updatedTasks);
      localStorage.setItem("userTasks", JSON.stringify(updatedTasks));
      return { success: true, message: `Successfully applied for task: ${foundTask.title}`, updatedTask: foundTask };
    } else if (foundTask) { 
      return { success: false, message: `Task "${foundTask.title}" is no longer open for applications. Its status is ${foundTask.status}.`, updatedTask: foundTask };
    }

    return { success: false, message: "Task not found or could not be applied for." };
  };

  const postNewTask = async (taskData: Omit<Task, 'id' | 'status' | 'postedBy' | 'assignedTo' | 'completionRequestedDate' | 'loanSeekerPaymentDetailsForCOD'>): Promise<{ success: boolean; message?: string; newTask?: Task }> => {
    if (!currentUser) {
      return { success: false, message: "You must be logged in to post tasks." };
    }
    if (currentUser.role !== 'User (Work Provider)' && currentUser.role !== 'Admin') {
      return { success: false, message: "Only Work Providers or Admins can post tasks." };
    }

    const newTask: Task = {
      title: taskData.title,
      description: taskData.description,
      address: taskData.address,
      preferredTimeSlot: taskData.preferredTimeSlot,
      skillsRequired: taskData.skillsRequired,
      creditAmount: taskData.creditAmount,
      imageUrl: taskData.imageUrl,
      dataAiHint: taskData.dataAiHint,
      fundingMethod: taskData.fundingMethod,
      id: `task-${Date.now()}`,
      status: 'Open',
      postedBy: currentUser.name, 
    };

    const updatedUserTasks = [newTask, ...userTasks]; 
    setUserTasks(updatedUserTasks);
    localStorage.setItem("userTasks", JSON.stringify(updatedUserTasks));

    return { success: true, message: `Task "${newTask.title}" posted successfully.`, newTask };
  };

  const adminAssignTask = async (taskId: string, userIdToAssign: string): Promise<{ success: boolean; message?: string; updatedTask?: Task }> => {
    if (!currentUser || currentUser.role !== 'Admin') {
      return { success: false, message: "Unauthorized. Only Admins can assign tasks." };
    }

    let taskToUpdate = userTasks.find(task => task.id === taskId);
    if (!taskToUpdate) {
      return { success: false, message: "Task not found." };
    }
    if (taskToUpdate.status !== 'Open') {
      return { success: false, message: `Task "${taskToUpdate.title}" is not Open. Current status: ${taskToUpdate.status}.` };
    }

    const userToAssignExists = allSystemUsers.find(u => u.id === userIdToAssign && u.role === 'Loan Seeker');
    if (!userToAssignExists) {
        return { success: false, message: "Selected user is not a valid Loan Seeker or does not exist." };
    }

    const updatedTaskData: Task = { ...taskToUpdate, status: 'Assigned', assignedTo: userIdToAssign };
    
    const updatedTasksList = userTasks.map(task =>
      task.id === taskId ? updatedTaskData : task
    );
    setUserTasks(updatedTasksList);
    localStorage.setItem("userTasks", JSON.stringify(updatedTasksList));

    return { success: true, message: `Task "${updatedTaskData.title}" assigned to ${userToAssignExists.name}.`, updatedTask: updatedTaskData };
  };

  const requestTaskVerification = async (taskId: string): Promise<{ success: boolean; message?: string; updatedTask?: Task }> => {
    if (!currentUser || currentUser.role !== 'Loan Seeker') {
      return { success: false, message: "Only Loan Seekers can request task verification." };
    }
    
    let updatedTaskData: Task | undefined;
    const taskToVerify = userTasks.find(task => task.id === taskId && task.assignedTo === currentUser.id);

    if (!taskToVerify) {
      return { success: false, message: "Task not found or not assigned to you." };
    }
    if (taskToVerify.status !== 'Assigned' && taskToVerify.status !== 'InProgress') {
      return { success: false, message: `Task is not in a valid state for verification request. Current status: ${taskToVerify.status}` };
    }
    
    const taskIndex = userTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) { 
        return { success: false, message: "Task not found for update." };
    }

    updatedTaskData = {
        ...taskToVerify,
        status: 'PendingVerification',
        completionRequestedDate: new Date().toISOString().split('T')[0]
    };

    if (taskToVerify.fundingMethod === 'cod') {
        updatedTaskData.loanSeekerPaymentDetailsForCOD = {
            paymentMethod: 'SimulatedPlatformPayment', 
            paidDate: new Date().toISOString().split('T')[0]
        };
    }
    
    const updatedTasksList = [...userTasks];
    updatedTasksList[taskIndex] = updatedTaskData;

    setUserTasks(updatedTasksList);
    localStorage.setItem("userTasks", JSON.stringify(updatedTasksList));

    let successMessage = `Review successfully requested for task: "${updatedTaskData.title}".`;
    if (updatedTaskData.loanSeekerPaymentDetailsForCOD) {
        successMessage = `Payment confirmed. Task "${updatedTaskData.title}" submitted for review.`
    }

    return { success: true, message: successMessage, updatedTask: updatedTaskData };
  };

  const adminApproveTaskCompletion = async (taskId: string): Promise<{ success: boolean; message?: string; updatedTask?: Task }> => {
    if (!currentUser || currentUser.role !== 'Admin') {
      return { success: false, message: "Only Admins can approve task completion." };
    }

    let updatedTaskData: Task | undefined;
    const updatedTasks = userTasks.map(task => {
      if (task.id === taskId && task.status === 'PendingVerification') {
        updatedTaskData = { ...task, status: 'Completed' };
        return updatedTaskData;
      }
      return task;
    });

    if (updatedTaskData) {
      setUserTasks(updatedTasks);
      localStorage.setItem("userTasks", JSON.stringify(updatedTasks));
      return { success: true, message: `Task "${updatedTaskData.title}" approved and marked as Completed.`, updatedTask: updatedTaskData };
    }
    return { success: false, message: "Task not found or not pending verification." };
  };

  const adminRejectTaskCompletion = async (taskId: string): Promise<{ success: boolean; message?: string; updatedTask?: Task }> => {
    if (!currentUser || currentUser.role !== 'Admin') {
      return { success: false, message: "Only Admins can reject task completion." };
    }

    let updatedTaskData: Task | undefined;
    const updatedTasks = userTasks.map(task => {
      if (task.id === taskId && task.status === 'PendingVerification') {
        updatedTaskData = { ...task, status: 'InProgress' }; 
        return updatedTaskData;
      }
      return task;
    });

    if (updatedTaskData) {
      setUserTasks(updatedTasks);
      localStorage.setItem("userTasks", JSON.stringify(updatedTasks));
      return { success: true, message: `Task "${updatedTaskData.title}" completion rejected. Status set back to In Progress.`, updatedTask: updatedTaskData };
    }
    return { success: false, message: "Task not found or not pending verification." };
  };


  return (
    <AuthContext.Provider value={{
        currentUser,
        userLoans,
        allSystemLoans,
        allSystemUsers,
        userTasks,
        login,
        logout,
        addLoan,
        adminCreateLoan,
        applyForTask,
        postNewTask,
        adminAssignTask,
        requestTaskVerification,
        adminApproveTaskCompletion,
        adminRejectTaskCompletion,
        isLoading
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

