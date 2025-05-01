"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bitcoin,
  Calendar,
  Clock,
  ExternalLink,
  ImageIcon,
  Info,
  Upload,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useActiveAccount } from "thirdweb/react";
import ConnectBtn from "./connect-btn";
import useCreateCampaign from "@/hooks/use-create-campaign";
import { toast } from 'sonner';

export default function CreateCampaignForm() {
  const router = useRouter();
  // Update the formData state to include impacts array
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    story: "",
    goal: 0,
    duration: "30",
    image: null as File | null,
    imagePreview: "",
    featured: false,
    impacts: [""], // Add this new field for impact statements
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const account = useActiveAccount();
  const { createCampaign, isLoading, error } = useCreateCampaign();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // Add a function to handle impact field changes
  const handleImpactChange = (index: number, value: string) => {
    const newImpacts = [...formData.impacts];
    newImpacts[index] = value;
    setFormData((prev) => ({ ...prev, impacts: newImpacts }));
  };

  // Add a function to add a new impact field
  const addImpactField = () => {
    setFormData((prev) => ({ ...prev, impacts: [...prev.impacts, ""] }));
  };

  // Add a function to remove an impact field
  const removeImpactField = (index: number) => {
    const newImpacts = [...formData.impacts];
    newImpacts.splice(index, 1);
    setFormData((prev) => ({ ...prev, impacts: newImpacts }));
  };

  const handleSubmit = async () => {
    const loadingToast = toast.loading("Creating campaign...");

    try {
      await createCampaign({
        name: formData.name,
        description: formData.description,
        story: formData.story,
        image: formData.image!,
        goal: formData.goal,
        duration: Number(formData.duration),
        impacts: formData.impacts,
      });
  
      if(!error && !isLoading) {
        setIsSuccess(true);
        toast.success("Campaign created successfully!");
      } else {
        throw error
      }
    } catch (error: any) {
      toast.error(error?.message || "Error creating campaign. Please try again.");
    } finally {
      toast.dismiss(loadingToast);
    }
    
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const isStepComplete = (step: number) => {
    if (step === 1) {
      return formData.name && formData.description;
    }
    if (step === 2) {
      return formData.goal && formData.duration && formData.story;
    }
    return true;
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6FCF97] to-[#27AE60] text-white shadow-glow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl sm:text-2xl font-bold">
                Campaign Created Successfully!
              </h2>
              <p className="mb-6 text-muted-foreground">
                Your charity campaign has been submitted and is now pending
                approval.
              </p>
              <div className="flex sm:flex-row flex-col gap-4">
                <Button
                  variant="outline"
                  className="border-border/40 hover:border-[#F5A623]/60 hover:bg-gradient-to-br hover:from-[#F7931A]/10 hover:to-[#F5A623]/10"
                  onClick={() => router.push("/charities")}
                >
                  View All Charities
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#F7931A] to-[#F5A623] text-white hover:from-[#F5A623] hover:to-[#F7931A] shadow-glow-sm"
                  onClick={() => router.push("/")}
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div>
          <div className="w-full py-4">
            <div className="relative flex items-center justify-between">
              {[1, 2, 3].map((step, index) => (
                <>
                  {/* Step Circle */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium
              ${
                currentStep === step
                  ? "border-[#F5A623] bg-gradient-to-br from-[#F7931A]/20 to-[#F5A623]/20 text-[#F5A623]"
                  : currentStep > step
                  ? "border-green-500 bg-green-500/20 text-green-500"
                  : "border-border/40 bg-card text-muted-foreground"
              }`}
                    >
                      {currentStep > step ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                  </div>

                  {/* Line to next step (except after last step) */}
                  {step < 3 && (
                    <div className="flex-1 h-1 bg-border/40 mx-2 relative top-0.5">
                      <div
                        className={`h-full ${
                          currentStep > step ? "bg-green-500/50 w-full" : "w-0"
                        }`}
                      ></div>
                    </div>
                  )}
                </>
              ))}
            </div>

            {/* Step Labels */}
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Basic Information</span>
              <span>Campaign Details</span>
              <span>Review & Submit</span>
            </div>
          </div>

          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Clean Water Initiative"
                  className="border-border/40 bg-background/50"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Briefly describe your campaign (100-150 characters)"
                  className="border-border/40 bg-background/50 resize-none"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  This will appear in campaign cards and search results
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="image">Campaign Image</Label>
                <div className="mt-1 flex items-center gap-4">
                  <div
                    className={`relative flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-border/40 bg-background/50 ${
                      formData.imagePreview
                        ? "border-solid border-[#F5A623]/60"
                        : ""
                    }`}
                  >
                    {formData.imagePreview ? (
                      <Image
                        src={formData.imagePreview || "/placeholder.svg"}
                        alt="Campaign preview"
                        fill
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                      className="border-border/40 hover:border-[#F5A623]/60 hover:bg-gradient-to-br hover:from-[#F7931A]/10 hover:to-[#F5A623]/10"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Recommended size: 1200x600px. Max size: 5MB
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* In the second step (currentStep === 2), add the impact fields section after the story field */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <Label htmlFor="goal">Fundraising Goal (RBTC)</Label>
                <Input
                  id="goal"
                  name="goal"
                  type="number"
                  value={formData.goal}
                  onChange={handleInputChange}
                  placeholder="e.g., 1.5"
                  step="0.01"
                  min="0.001"
                  className="border-border/40 bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum goal: 0.001 RBTC
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="duration">Campaign Duration (Days)</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) =>
                    handleSelectChange("duration", value)
                  }
                >
                  <SelectTrigger
                    id="duration"
                    className="border-border/40 bg-background/50"
                  >
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="story">Your Story</Label>
                <Textarea
                  id="story"
                  name="story"
                  value={formData.story}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of your campaign, its goals, and how the funds will be used"
                  className="border-border/40 bg-background/50 resize-none"
                  rows={6}
                />
              </div>

              {/* Add the Impact Fields section here */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Campaign Impact</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  List the specific impacts your campaign will achieve
                </p>

                {formData.impacts.map((impact, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input
                      value={impact}
                      onChange={(e) =>
                        handleImpactChange(index, e.target.value)
                      }
                      placeholder={`e.g., "Provide clean water to 100 families"`}
                      className="border-border/40 bg-background/50 flex-1"
                    />
                    {formData.impacts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImpactField(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                ))}
                <div className="mt-3 flex items-center justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImpactField}
                    className="border-border/40 hover:border-[#F5A623]/60 hover:bg-gradient-to-br hover:from-[#F7931A]/10 hover:to-[#F5A623]/10"
                  >
                    Add Impact
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 text-[#F5A623]" />
                  <div>
                    <h4 className="font-medium">Campaign Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      All campaigns are reviewed by our team before being
                      published. This process typically takes 24-48 hours.
                      You'll be notified once your campaign is approved.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>
                {/* Update the preview tab in step 3 to show impact statements */}
                <TabsContent value="preview" className="mt-4 space-y-4">
                  <Card className="overflow-hidden border-border/40">
                    <div className="relative h-48 w-full">
                      {formData.imagePreview ? (
                        <Image
                          src={formData.imagePreview || "/placeholder.svg"}
                          alt={formData.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-card/80 to-card/40">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {formData.name || "Campaign Name"}
                        <div className="flex items-center rounded-full bg-green-100/10 px-2 py-0.5 text-xs font-medium text-green-500">
                          <Bitcoin className="mr-1 h-3 w-3" />
                          Pending
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {formData.description ||
                          "Campaign description will appear here"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-2 w-0 rounded-full bg-gradient-to-r from-[#F7931A] to-[#F5A623]"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          Raised: <span className="font-medium">0 RBTC</span>
                        </span>
                        <span>
                          Goal:{" "}
                          <span className="font-medium">
                            {formData.goal || "0"} RBTC
                          </span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="rounded-lg border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Duration
                        </h4>
                        <div className="mt-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#F5A623]" />
                          <span>{formData.duration || "30"} days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Impact Preview */}
                  {formData.impacts.filter((impact) => impact.trim() !== "")
                    .length > 0 && (
                    <div className="rounded-lg border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-4">
                      <h4 className="text-sm font-medium mb-2">
                        Campaign Impact
                      </h4>
                      <ul className="space-y-2">
                        {formData.impacts.map(
                          (impact, index) =>
                            impact.trim() !== "" && (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <CheckCircle className="mt-0.5 h-4 w-4 text-[#F5A623]" />
                                <span className="text-sm">{impact}</span>
                              </li>
                            )
                        )}
                      </ul>
                    </div>
                  )}
                </TabsContent>
                {/* Update the summary tab in step 3 to include impacts */}
                <TabsContent value="summary" className="mt-4 space-y-4">
                  <div className="rounded-lg border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-4">
                    <h3 className="mb-4 font-medium">Campaign Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-border/40 pb-2">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">
                          {formData.name || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 pb-2">
                        <span className="text-muted-foreground">Goal</span>
                        <span className="font-medium">
                          {formData.goal || "0"} RBTC
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 pb-2">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">
                          {formData.duration || "30"} days
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-border/40 pb-2">
                        <span className="text-muted-foreground">Image</span>
                        <span className="font-medium">
                          {formData.image ? "Uploaded" : "Not uploaded"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Impact Points
                        </span>
                        <span className="font-medium">
                          {
                            formData.impacts.filter((i) => i.trim() !== "")
                              .length
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fix the timeline component to be more responsive */}
                  <div className="rounded-lg border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-4 w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#F5A623]" />
                        <span className="font-medium">Campaign Timeline</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Estimated
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#F7931A]/20 to-[#F5A623]/20 text-[#F5A623]">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium">Submission</h4>
                          <p className="text-xs text-muted-foreground">Today</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium">Review & Verification</h4>
                          <p className="text-xs text-muted-foreground">
                            1-2 days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium">Campaign Live</h4>
                          <p className="text-xs text-muted-foreground">
                            After approval
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("featured", checked)
                  }
                />
                <Label htmlFor="featured" className="text-sm">
                  Request to be featured on the homepage (subject to approval)
                </Label>
              </div>

              {/* <div className="mt-4 rounded-lg border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-4">
                <div className="flex items-start gap-3">
                  <Bitcoin className="mt-0.5 h-5 w-5 text-[#F5A623]" />
                  <div>
                    <h4 className="font-medium">Transaction Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Creating a campaign requires a small transaction fee of
                      0.001 RBTC to prevent spam and cover blockchain costs.
                      This fee helps maintain the integrity of the BitGive
                      platform.
                    </p>
                    <a
                      href="https://explorer.rootstock.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-[#F5A623] hover:text-[#F7931A] transition-colors"
                    >
                      Learn more about Rootstock fees
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div> */}
            </motion.div>
          )}
        <div className="flex justify-between mt-5">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="border-border/40 hover:border-[#F5A623]/60 hover:bg-gradient-to-br hover:from-[#F7931A]/10 hover:to-[#F5A623]/10"
            >
              Previous
            </Button>
          ) : (
            <div></div>
          )}
          {currentStep <= 2 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!isStepComplete(currentStep)}
              className="bg-gradient-to-r from-[#F7931A] to-[#F5A623] text-white hover:from-[#F5A623] hover:to-[#F7931A] shadow-glow-sm disabled:opacity-50"
            >
              Continue
            </Button>
          ) : account ? (
            <Button
              disabled={isLoading}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-[#F7931A] to-[#F5A623] text-white hover:from-[#F5A623] hover:to-[#F7931A] shadow-glow-sm disabled:opacity-50"
            >
              {isLoading ? "Creating Campaign..." : "Create Campaign"}
            </Button>
          ) : (
            <ConnectBtn />
          )}
        </div>
    </div>
  );
}
