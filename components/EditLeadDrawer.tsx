"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface EditLeadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadData: any;
  userId: string; //  NEW: Add this prop
  onSave: (updatedLead: any) => void;
}

export default function EditLeadDrawer({
  open,
  onOpenChange,
  leadData,
  userId,
  onSave,
}: EditLeadDrawerProps) {
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    workEmail: "",
    websiteURL: "",
    linkdinURL: "",
    industry: "",
    whatsUpNumber: "",
    status: "",
    priority: "",
    userId:"",
  });

  useEffect(() => {
    if (leadData) {
      setForm({
        firstName: leadData.firstName || "",
        email: leadData.email || "",
        workEmail: leadData.workEmail || "",
        websiteURL: leadData.websiteURL || "",
        linkdinURL: leadData.linkdinURL || "",
        industry: leadData.industry || "",
        whatsUpNumber: leadData.whatsUpNumber?.toString() || "",
        status: leadData.status || "ACTIVE",
        priority: leadData.priority || "HIGH",
        userId: leadData.userId || "",
      });
    }
  }, [leadData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave({
      ...leadData,
      ...form,
      whatsUpNumber: Number(form.whatsUpNumber),
      userId, //  Inject userId into the final payload
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label>First Name</Label>
            <Input name="firstName" value={form.firstName} onChange={handleChange} />
          </div>
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <Label>Work Email</Label>
            <Input name="workEmail" type="email" value={form.workEmail} onChange={handleChange} />
          </div>
          <div>
            <Label>Website URL</Label>
            <Input name="websiteURL" value={form.websiteURL} onChange={handleChange} />
          </div>
          <div>
            <Label>LinkedIn URL</Label>
            <Input name="linkdinURL" value={form.linkdinURL} onChange={handleChange} />
          </div>
          <div>
            <Label>Industry</Label>
            <Input name="industry" value={form.industry} onChange={handleChange} />
          </div>
          <div>
            <Label>WhatsApp Number</Label>
            <Input
              name="whatsUpNumber"
              type="number"
              value={form.whatsUpNumber}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(val) => setForm({ ...form, status: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(val) => setForm({ ...form, priority: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
              </SelectContent>
            </Select>
          </div>
                    <div>
            <Label>userId</Label>
            <Input name="userId" value={form.userId} onChange={handleChange} />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
