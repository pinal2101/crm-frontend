"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createOne } from "@/app/utils/api";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function PhoneNumberField({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Only numbers allowed
    if (!/^\d*$/.test(newValue)) return;

    onChange(newValue);

    if (newValue.length > 0 && newValue.length < 10) {
      setError("WhatsApp number must be at least 10 digits");
    } else {
      setError("");
    }
  };

  return (
    <div className="space-y-1">
      <Input
        type="text"
        placeholder="Enter WhatsApp Number"
        value={value}
        onChange={handleChange}
        maxLength={10}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
interface AddLeadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
  currentUserId: string;
}

const LEADS_ENDPOINT = "lead";

export default function AddLeadDrawer({
  open,
  onOpenChange,
  onSaved,
  currentUserId,
}: AddLeadDrawerProps) {

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    websiteURL: "",
    linkdinURL: "",
    industry: "",
    whatsUpNumber: "",
    workEmail: "",
    status: "ACTIVE",
    priority: "HIGH",
    userId: currentUserId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {

      setFormData({
        email: "",
        firstName: "",
        websiteURL: "",
        linkdinURL: "",
        industry: "",
        whatsUpNumber: "",
        workEmail: "",
        status: "ACTIVE",
        priority: "HIGH",
        userId: currentUserId,
      });
      setErrors({});
    }
  }, [open, currentUserId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.workEmail) {
      newErrors.workEmail = "Work Email is required";
    } else if (!emailRegex.test(formData.workEmail)) {
      newErrors.workEmail = "Work Email is invalid";
    }
    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.websiteURL) newErrors.websiteURL = "Website URL is required";
    if (!formData.linkdinURL) newErrors.linkdinURL = "LinkedIn URL is required";
    if (!formData.industry) newErrors.industry = "Industry is required";
    if (!formData.whatsUpNumber) {
      newErrors.whatsUpNumber = "WhatsApp number is required";
    } else if (formData.whatsUpNumber.length < 10) {
      newErrors.whatsUpNumber = "WhatsApp number must be at least 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      await createOne(LEADS_ENDPOINT, formData);
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Lead save failed:", err?.message || err);
      setErrors((prev) => ({
        ...prev,
        form: err?.message || "Something went wrong",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Lead</SheetTitle>
          <SheetDescription>
            Fill in the information below to add a new lead to the system.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label>First Name</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData((s) => ({ ...s, firstName: e.target.value }))}
              placeholder="Enter first name"
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((s) => ({ ...s, email: value }));

                if (value === "") {
                  setErrors((prev) => ({ ...prev, email: "Email is required" }));
                } else if (!emailRegex.test(value)) {
                  setErrors((prev) => ({ ...prev, email: "Email is invalid" }));
                } else {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              placeholder="Enter personal email"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/*  Work Email */}
          <div>
            <Label>Work Email</Label>
            <Input
              type="email"
              value={formData.workEmail}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((s) => ({ ...s, workEmail: value }));

                if (value === "") {
                  setErrors((prev) => ({
                    ...prev,
                    workEmail: "Work Email is required",
                  }));
                } else if (!emailRegex.test(value)) {
                  setErrors((prev) => ({
                    ...prev,
                    workEmail: "Work Email is invalid",
                  }));
                } else {
                  setErrors((prev) => ({ ...prev, workEmail: "" }));
                }
              }}
              placeholder="Enter work email"
              className={errors.workEmail ? "border-red-500" : ""}
            />
            {errors.workEmail && (
              <p className="text-sm text-red-500">{errors.workEmail}</p>
            )}
          </div>

          <div>
            <Label>Website URL</Label>
            <Input
              value={formData.websiteURL}
              onChange={(e) => setFormData((s) => ({ ...s, websiteURL: e.target.value }))}
              placeholder="https://example.com"
            />
            {errors.websiteURL && <p className="text-sm text-red-500">{errors.websiteURL}</p>}
          </div>

          <div>
            <Label>LinkedIn URL</Label>
            <Input
              value={formData.linkdinURL}
              onChange={(e) => setFormData((s) => ({ ...s, linkdinURL: e.target.value }))}
              placeholder="https://linkedin.com/in/..."
            />
            {errors.linkdinURL && <p className="text-sm text-red-500">{errors.linkdinURL}</p>}
          </div>

          <div>
            <Label>Industry</Label>
            <Input
              value={formData.industry}
              onChange={(e) => setFormData((s) => ({ ...s, industry: e.target.value }))}
              placeholder="Enter industry"
            />
            {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
          </div>

          <div>
            <Label>WhatsApp Number</Label>
            <PhoneNumberField
              value={formData.whatsUpNumber}
              onChange={(val) => setFormData((s) => ({ ...s, whatsUpNumber: val }))}
            />
            {errors.whatsUpNumber && <p className="text-sm text-red-500">{errors.whatsUpNumber}</p>}
          </div>


          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData((s) => ({ ...s, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) => setFormData((s) => ({ ...s, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {errors.form && <p className="text-sm text-red-500">{errors.form}</p>}

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Submit"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
