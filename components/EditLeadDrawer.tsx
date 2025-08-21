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
import { updateOne } from "@/app/utils/api";

interface EditLeadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  leadData: any | null;
  onSaved?: () => void;
}

const LEADS_ENDPOINT = "lead";

export default function EditLeadDrawer({
  open,
  onOpenChange,
  currentUserId,
  leadData,
  onSaved,
}: EditLeadDrawerProps) {
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

  //  preload form data when drawer opens
  useEffect(() => {
    if (open && leadData) {
      setFormData({
        email: leadData.email || "",
        firstName: leadData.firstName || "",
        websiteURL: leadData.websiteURL || "",
        linkdinURL: leadData.linkdinURL || "",
        industry: leadData.industry || "",
        whatsUpNumber: leadData.whatsUpNumber?.toString() || "",
        workEmail: leadData.workEmail || "",
        status: leadData.status || "ACTIVE",
        priority: leadData.priority || "HIGH",
        userId: leadData.userId || currentUserId,
      });
      setErrors({});
    }
  }, [open, leadData, currentUserId]);

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Save changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData?._id) return;

    setIsSubmitting(true);
    try {
      await updateOne(LEADS_ENDPOINT, leadData._id, formData); // full formData bhejna
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Lead update failed:", err?.message || err);
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
          <SheetTitle>Edit Lead</SheetTitle>
          <SheetDescription>
            Update the information below to edit the lead.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* First Name */}
          <div>
            <Label>First Name</Label>
            <Input
              value={formData.firstName}
              onChange={(e) =>
                setFormData((s) => ({ ...s, firstName: e.target.value }))
              }
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          {/* Personal Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((s) => ({ ...s, email: e.target.value }))
              }
              placeholder="Enter personal email"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Work Email */}
          <div>
            <Label>Work Email</Label>
            <Input
              type="email"
              value={formData.workEmail}
              onChange={(e) =>
                setFormData((s) => ({ ...s, workEmail: e.target.value }))
              }
              placeholder="Enter work email"
            />
            {errors.workEmail && (
              <p className="text-sm text-red-500">{errors.workEmail}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <Label>Website URL</Label>
            <Input
              value={formData.websiteURL}
              onChange={(e) =>
                setFormData((s) => ({ ...s, websiteURL: e.target.value }))
              }
              placeholder="https://example.com"
            />
            {errors.websiteURL && (
              <p className="text-sm text-red-500">{errors.websiteURL}</p>
            )}
          </div>

          {/* LinkedIn */}
          <div>
            <Label>LinkedIn URL</Label>
            <Input
              value={formData.linkdinURL}
              onChange={(e) =>
                setFormData((s) => ({ ...s, linkdinURL: e.target.value }))
              }
              placeholder="https://linkedin.com/in/..."
            />
            {errors.linkdinURL && (
              <p className="text-sm text-red-500">{errors.linkdinURL}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <Label>Industry</Label>
            <Input
              value={formData.industry}
              onChange={(e) =>
                setFormData((s) => ({ ...s, industry: e.target.value }))
              }
              placeholder="Enter industry"
            />
            {errors.industry && (
              <p className="text-sm text-red-500">{errors.industry}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <Label>WhatsApp Number</Label>
            <Input
              value={formData.whatsUpNumber}
              onChange={(e) =>
                setFormData((s) => ({ ...s, whatsUpNumber: e.target.value }))
              }
              placeholder="Enter WhatsApp number"
            />
            {errors.whatsUpNumber && (
              <p className="text-sm text-red-500">{errors.whatsUpNumber}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) =>
                setFormData((s) => ({ ...s, status: value }))
              }
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

          {/* Priority */}
          <div>
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) =>
                setFormData((s) => ({ ...s, priority: value }))
              }
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

          {errors.form && (
            <p className="text-sm text-red-500">{errors.form}</p>
          )}

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
