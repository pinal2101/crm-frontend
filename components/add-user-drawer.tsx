"use client"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createOne, updateOne } from "@/app/utils/api"


interface AddUserDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: (user?: any) => void
  userData?: any | null
}

const AUTH_ENDPOINT = "auth"

export function AddUserDrawer({ open, onOpenChange, onSaved, userData }: AddUserDrawerProps) {
  const [formData, setFormData] = useState({
    _id: undefined as string | undefined,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "Admin",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/
  const isEdit = Boolean(userData && (userData as any)._id)

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setFormData({
          _id: String(userData?._id ?? ""),
          firstName: String(userData?.firstName ?? ""),
          lastName: String(userData?.lastName ?? ""),
          email: String(userData?.email ?? ""),
          phoneNumber: String(userData?.phoneNumber ?? ""),
          password: "",
          role: String(userData?.role ?? "Admin"),
        })
      } else {
        resetForm()
      }
      setErrors({})
    } else {
      resetForm()
      setErrors({})
    }
  }, [open, userData])

  const resetForm = useCallback(() => {
    setFormData({
      _id: undefined,
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "Admin",
    })
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required"

    if (!isEdit) {
      if (!formData.password.trim()) {
        newErrors.password = "Password is required"
      } else if (!strongPasswordRegex.test(formData.password)) {
        newErrors.password =
          "Password must be at least 6 characters and include uppercase, lowercase, number and symbol"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateForm()) return

      setIsSubmitting(true)
      try {
        if (formData._id) {
          const { _id, ...rest } = formData
          await updateOne(AUTH_ENDPOINT, _id, rest)
          toast.success("User updated successfully")
        } else {
          await createOne("auth/register", formData)
          toast.success("User created successfully")
        }

        onSaved?.(formData)
        onOpenChange(false)
      } catch (error: any) {
        console.error("Error during user save:", error)

        if (error.response) {
          const status = error.response.status
          const msg = String(error.response.data?.message ?? "")

          if (status === 409) {
            let toastMsg = "Duplicate entry"
            const fieldErrors: Record<string, string> = {}

            if (msg.toLowerCase().includes("email")) {
              fieldErrors.email = "Email already exists"
              toastMsg = "Email already exists"
            }
            if (msg.toLowerCase().includes("phone")) {
              fieldErrors.phoneNumber = "Phone number already exists"
              toastMsg = fieldErrors.email
                ? "Email and phone number already exist"
                : "Phone number already exists"
            }

            setErrors((prev) => ({ ...prev, ...fieldErrors }))
            toast.error(toastMsg)
          } else if (status === 400) {
            toast.error(msg || "Bad Request")
          } else if (status === 404) {
            toast.error("User not found")
          } else if (status === 500) {
            toast.error("Internal Server Error")
          } else {
            toast.error(msg || "Something went wrong")
          }
        } else if (error.request) {
          toast.error("No response from server. Please check your network.")
        } else {
          toast.error(error.message || "Unexpected error occurred")
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, onOpenChange, onSaved, isEdit]
  )

  const handleCancel = useCallback(() => {
    resetForm()
    setErrors({})
    onOpenChange(false)
  }, [resetForm, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit User" : "Add New User"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the user details."
              : "Fill in the information below to add a new user to the system."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6" noValidate>
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Enter first name"
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Enter last name"
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
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

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={formData.phoneNumber}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10)
                setFormData({ ...formData, phoneNumber: digitsOnly })
              }}
              placeholder="Enter phone number"
              className={errors.phoneNumber ? "border-red-500" : ""}
            />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>

          {/* Password (only on create) */}
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
          )}

          {/* Role */}
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

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
           <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save" : "Submit")}
              </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
