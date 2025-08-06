"use client"
import type React from "react"
import { Toaster, toast } from "sonner"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"


interface AddUserDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (user: any) => void
}

export function AddUserDrawer({ open, onOpenChange, onSubmit }: AddUserDrawerProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: "",
    phoneNumber: '',
    password: '',
    role: "Admin",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"


    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required"
    if (!formData.password.trim()) newErrors.password = "Password is required"


    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      
      const res = await fetch("http://localhost:8081/api/v1/auth/register", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    
      })
      console.log(formData,"ytyt")

     const data = await res.json()

      if (!res.ok) {
      const backendErrors: Record<string, string> = {}

      if (Array.isArray(data.errors)) {
        data.errors.forEach((msg: string) => {
          if (msg.toLowerCase().includes("first name")) {
            backendErrors.firstName = msg
          } else if (msg.toLowerCase().includes("last name")) {
            backendErrors.lastName = msg
          } else if (msg.toLowerCase().includes("email")) {
            backendErrors.email = msg
          } else if (msg.toLowerCase().includes("phone")) {
            backendErrors.phoneNumber = msg
          } else if (msg.toLowerCase().includes("password")) {
            backendErrors.password = msg
          }
        })
      }

      setErrors(backendErrors)

      if (Object.keys(backendErrors).length === 0) {
         toast.error(data.message || "Something went wrong ❌")
      }
      return
    }
       toast.success("User registered successfully! ✅"), {
              duration: 3000,
              position: "top-center",
              dismissible: true,
            }
 
      onSubmit(data.user)
      setFormData({
        firstName: '',
        lastName: '',
        email: "",
        phoneNumber: '',
        password: '',
        role: "Admin",
      })
      setErrors({})
      onOpenChange(false)
     } catch (error: any) {
       console.error("Error during registration:", error.message)
      toast.error(error.message || "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: "",
      phoneNumber: '',
      password: '',
      role: "Admin",
    })
    setErrors({})
    onOpenChange(false)
  }

  return (
  <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add New User</SheetTitle>
          <SheetDescription>Fill in the information below to add a new user to the system.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
             <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="Enter phone number"
              className={errors.phoneNumber ? "border-red-500" : ""}
            />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
  </>
  )
}
