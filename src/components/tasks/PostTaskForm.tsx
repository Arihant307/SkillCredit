
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { ALL_POSSIBLE_SKILLS } from "@/lib/constants";
import { BriefcaseBusiness, Image as ImageIcon, Sparkles, Edit3, Send, CheckCircle, CreditCard, Landmark, SmartphoneNfc, HandCoins, Home, Clock } from "lucide-react";
import type { Task } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MAX_ESTIMATE_CAP = 100000;

const TIME_SLOT_OPTIONS = [
  "Morning (9 AM - 12 PM)",
  "Afternoon (1 PM - 5 PM)",
  "Evening (6 PM - 9 PM)",
  "Anytime",
] as const;

const postTaskFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title must be at most 100 characters."),
  description: z.string().min(20, "Description must be at least 20 characters.").max(1000, "Description must be at most 1000 characters."),
  address: z.string().min(10, "Service address must be at least 10 characters.").max(200, "Address must be at most 200 characters."),
  preferredTimeSlot: z.enum(TIME_SLOT_OPTIONS, {
    required_error: "You need to select a preferred time slot.",
  }),
  skillsRequired: z.array(z.string()).refine(value => value.length > 0, {
    message: "You must select at least one skill.",
  }),
  imageUrl: z.string().url("Please enter a valid URL for the image.").optional().or(z.literal("")),
  dataAiHint: z.string().max(50, "AI hint should be concise (max 50 chars).").optional(),
});

type PostTaskFormValues = z.infer<typeof postTaskFormSchema>;

const SKILL_PRICING: { [key: string]: number } = {
  "Web Design": 6400,
  "JavaScript": 5600,
  "React": 7200,
  "Graphic Design": 4800,
  "Plumbing": 500,
  "Electrician": 500,
  "Python": 6400,
  "Data Analysis": 7200,
  "Content Writing": 3200,
  "SEO Optimization": 4800,
  "Social Media Marketing": 5600,
  "Video Editing": 25000,
  "Photography": 25000,
  "Carpentry": 4000,
  "Painting": 4000,
  "Tutoring": 2400,
  "HTML": 4800,
  "CSS": 4800,
  "Node.js": 6400,
  "Illustration": 5600,
  "Branding": 7200,
  "Manual Labor": 400,
  "Welding": 400,
  "Database Management": 6400,
};

const skillsForSpecificServiceDisclaimer = ["Electrician", "Plumbing", "Welding"];
const technicalSkillsForDailyRateDisclaimer = [
  "Web Design", "JavaScript", "React", "Graphic Design", "Python", "Data Analysis",
  "SEO Optimization", "Social Media Marketing", "HTML", "CSS", "Node.js",
  "Illustration", "Database Management"
];
const photographyVideographySkills = ["Photography", "Video Editing"];

const MOCK_PAYMENT_OPTIONS = [
  { id: "card1", label: "Visa ending **** 1234", icon: CreditCard },
  { id: "card2", label: "Mastercard ending **** 5678", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "upi", label: "UPI", icon: SmartphoneNfc },
  { id: "cod", label: "Cash on Delivery", icon: HandCoins },
];

function calculateEstimatedCost(skills: string[]): number {
  let cost = 0;
  if (skills.length === 0) {
    return 0;
  }
  skills.forEach(skill => {
    cost += SKILL_PRICING[skill] || 0;
  });
  return Math.min(cost, MAX_ESTIMATE_CAP);
}

export function PostTaskForm() {
  const { postNewTask } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [showReviewStep, setShowReviewStep] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(MOCK_PAYMENT_OPTIONS[0]?.id);

  const form = useForm<PostTaskFormValues>({
    resolver: zodResolver(postTaskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      preferredTimeSlot: undefined,
      skillsRequired: [],
      imageUrl: "",
      dataAiHint: "",
    },
    mode: "onChange",
  });

  const watchedImageUrl = form.watch("imageUrl");
  const watchedSkills = form.watch("skillsRequired");
  const watchedTitle = form.watch("title");
  const watchedDescription = form.watch("description");
  const watchedAddress = form.watch("address");
  const watchedTimeSlot = form.watch("preferredTimeSlot");

  useEffect(() => {
    const newEstimatedCost = calculateEstimatedCost(watchedSkills);
    setEstimatedCost(newEstimatedCost > 0 ? newEstimatedCost : null);
  }, [watchedSkills]);

  async function handleFinalSubmit(data: PostTaskFormValues) {
    setIsSubmitting(true);
    if (estimatedCost === null || estimatedCost <= 0) {
      toast({
        title: "Skills Required",
        description: "Please select at least one skill to determine the task credit amount.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    if (!selectedPaymentMethod && showReviewStep) {
      toast({
        title: "Payment Method Required",
        description: "Please select a funding method.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const taskPayload: Omit<Task, 'id' | 'status' | 'postedBy' | 'assignedTo' | 'completionRequestedDate' | 'loanSeekerPaymentDetailsForCOD'> = {
      title: data.title,
      description: data.description,
      address: data.address,
      preferredTimeSlot: data.preferredTimeSlot,
      skillsRequired: data.skillsRequired,
      creditAmount: estimatedCost, // Use estimatedCost as the creditAmount
      imageUrl: data.imageUrl || undefined,
      dataAiHint: data.imageUrl ? data.dataAiHint : undefined,
      fundingMethod: selectedPaymentMethod,
    };

    const result = await postNewTask(taskPayload);

    if (result.success && result.newTask) {
      toast({
        title: "Task Posted Successfully!",
        description: `Task "${result.newTask.title}" is now open for applications. Credit: ₹${(estimatedCost).toLocaleString('en-IN')}`,
      });
      form.reset();
      setEstimatedCost(null);
      setShowReviewStep(false);
      setSelectedPaymentMethod(MOCK_PAYMENT_OPTIONS[0]?.id);
    } else {
      toast({
        title: "Task Posting Failed",
        description: result.message || "Could not post the task. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

  const handleReviewDetailsClick = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      if (estimatedCost === null || estimatedCost <= 0) {
         toast({
            title: "Skills Required",
            description: "Please select at least one skill to calculate the credit amount before reviewing.",
            variant: "destructive",
          });
          return;
      }
      setShowReviewStep(true);
    } else {
      toast({
        title: "Incomplete Form",
        description: "Please fill out all required fields accurately before reviewing.",
        variant: "destructive",
      });
    }
  };

  const showPhotographyVideographyDisclaimer = watchedSkills.some(skill => photographyVideographySkills.includes(skill));
  const showSpecificServiceDisclaimer = watchedSkills.some(skill => skillsForSpecificServiceDisclaimer.includes(skill));
  const showTechnicalDailyRateDisclaimer = watchedSkills.some(skill => technicalSkillsForDailyRateDisclaimer.includes(skill));

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <BriefcaseBusiness className="mr-2 h-6 w-6 text-primary" /> 
          {showReviewStep ? "Review & Confirm Task" : "Post a New Task"}
        </CardTitle>
        <CardDescription>
          {showReviewStep 
            ? "Please review all task details, the auto-calculated credit amount, and select your funding method before final submission."
            : "Describe the work you need done, including service address and preferred time. The credit amount will be automatically determined based on the skills selected."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-8">
            {!showReviewStep ? (
              <>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Build a responsive website homepage" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of the task, deliverables, and any specific requirements."
                          className="resize-none min-h-[120px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Home className="mr-2 h-4 w-4" /> Service Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the full address where the service is required."
                          className="resize-none min-h-[80px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredTimeSlot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Clock className="mr-2 h-4 w-4" /> Preferred Time Slot</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a preferred time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIME_SLOT_OPTIONS.map(slot => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skillsRequired"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Skills Required</FormLabel>
                        <FormDescription>
                          Select all skills relevant to this task. The credit amount will be based on these.
                        </FormDescription>
                      </div>
                      <ScrollArea className="h-40 rounded-md border p-4">
                        {ALL_POSSIBLE_SKILLS.map((skill) => (
                          <FormField
                            key={skill}
                            control={form.control}
                            name="skillsRequired"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={skill}
                                  className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(skill)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), skill])
                                          : field.onChange(
                                            (field.value || []).filter(
                                              (value) => value !== skill
                                            )
                                          );
                                      }}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {skill}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </ScrollArea>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {estimatedCost !== null && estimatedCost > 0 && (
                  <div className="p-3 bg-muted rounded-md border border-dashed space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Sparkles className="mr-2 h-4 w-4 text-accent" />
                      Task Credit Amount (Auto-Calculated):
                      <span className="font-semibold text-base text-accent ml-1">
                        ₹{estimatedCost.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        {estimatedCost >= MAX_ESTIMATE_CAP && '+'}
                      </span>
                    </p>
                    {showPhotographyVideographyDisclaimer ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        This estimate is based on typical per-event or per-show rates.
                      </p>
                    ) : showSpecificServiceDisclaimer ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        For Electrician, Plumbing, and Welding: These rates are for 3-4 hours of service and represent the service charge only. Additional charges will apply if any parts need to be replaced.
                      </p>
                    ) : showTechnicalDailyRateDisclaimer ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        This estimate is based on typical daily rates for most technical skills.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">
                          The displayed amount is an estimate based on standard service charges or daily rates.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Any additional costs for parts or materials, if applicable, are typically handled separately.
                        </p>
                      </>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <ImageIcon className="mr-2 h-4 w-4" /> Image URL (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://placehold.co/600x400.png" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormDescription>A direct link to an image representing the task.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedImageUrl && (
                    <FormField
                    control={form.control}
                    name="dataAiHint"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Image AI Hint (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., 'website design' or 'plumbing tools'" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormDescription>Provide 1-2 keywords for the image if you'd like AI to potentially replace it later.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                <Button 
                  type="button" 
                  onClick={handleReviewDetailsClick} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base" 
                  disabled={isSubmitting || !form.formState.isValid || estimatedCost === null || estimatedCost <= 0}
                >
                  <CheckCircle className="mr-2 h-5 w-5" /> Review Task Details
                </Button>
              </>
            ) : (
              // Review Step UI
              <Card className="p-6 bg-muted/30 border-dashed shadow-none">
                <CardContent className="p-0 space-y-6">
                  <div>
                    <h4 className="font-semibold text-md">Task Title:</h4>
                    <p className="text-sm text-foreground">{watchedTitle}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-md">Description:</h4>
                    <p className="text-sm text-foreground whitespace-pre-line">{watchedDescription}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-md">Service Address:</h4>
                    <p className="text-sm text-foreground whitespace-pre-line">{watchedAddress}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-md">Preferred Time Slot:</h4>
                    <p className="text-sm text-foreground">{watchedTimeSlot}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-md">Skills Required:</h4>
                    <p className="text-sm text-foreground">{watchedSkills.join(', ') || 'None'}</p>
                  </div>
                  
                  {estimatedCost !== null && (
                    <div className="pt-2">
                      <h4 className="font-semibold text-md">Task Credit Amount (Auto-Calculated):</h4>
                      <p className="text-xl font-bold text-accent">
                        ₹{estimatedCost.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        {estimatedCost >= MAX_ESTIMATE_CAP && '+'}
                      </p>
                      {showPhotographyVideographyDisclaimer ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          This estimate is based on typical per-event or per-show rates.
                        </p>
                      ) : showSpecificServiceDisclaimer ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          For Electrician, Plumbing, and Welding: These rates are for 3-4 hours of service and represent the service charge only. Additional charges will apply if any parts need to be replaced.
                        </p>
                      ) : showTechnicalDailyRateDisclaimer ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          This estimate is based on typical daily rates for most technical skills.
                        </p>
                      ) : (
                        <>
                          <p className="text-xs text-muted-foreground">
                            The displayed amount is an estimate based on standard service charges or daily rates.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Any additional costs for parts or materials, if applicable, are typically handled separately.
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <h4 className="font-semibold text-md mb-3">Select Funding Method</h4>
                    <RadioGroup 
                        value={selectedPaymentMethod} 
                        onValueChange={setSelectedPaymentMethod}
                        className="space-y-2"
                        disabled={isSubmitting}
                    >
                      {MOCK_PAYMENT_OPTIONS.map(option => {
                        const IconComponent = option.icon;
                        return (
                            <Label 
                                key={option.id} 
                                htmlFor={`payment-${option.id}`}
                                className={`flex items-center p-3 border rounded-md hover:bg-muted/80 cursor-pointer transition-colors ${selectedPaymentMethod === option.id ? 'border-primary ring-1 ring-primary bg-muted/50' : ''}`}
                            >
                                <RadioGroupItem value={option.id} id={`payment-${option.id}`} className="mr-3" />
                                <IconComponent className="mr-2 h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">{option.label}</span>
                            </Label>
                        );
                      })}
                    </RadioGroup>
                     <p className="text-xs text-muted-foreground mt-2">
                        This is for demonstration. Actual payment processing would be handled securely.
                     </p>
                  </div>
                </CardContent>
                <CardFooter className="p-0 pt-6 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button variant="outline" onClick={() => setShowReviewStep(false)} className="w-full sm:w-auto" disabled={isSubmitting}>
                    <Edit3 className="mr-2 h-4 w-4" /> Back to Edit
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-3 text-base"
                    disabled={isSubmitting || estimatedCost === null || estimatedCost <= 0 || !selectedPaymentMethod}
                  >
                    {isSubmitting ? "Posting Task..." : <><Send className="mr-2 h-4 w-4" /> Confirm & Post Task</>}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
    

    