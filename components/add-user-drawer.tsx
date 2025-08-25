"use client"
import type React from "react"
import { toast } from "react-hot-toast"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createOne, updateOne } from "@/app/utils/api";

interface AddUserDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: (user?: any) => void;
  userData?: any | null
}

const AUTH_ENDPOINT = "auth";
 
export function AddUserDrawer({ open, onOpenChange,onSaved, userData }: AddUserDrawerProps) {
  const [formData, setFormData] = useState({
    _id: undefined as string | undefined,
    firstName: '',
    lastName: '',
    email: "",
    phoneNumber: '',
    password: '',
    role: "Admin",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/

  const isEdit = Boolean(userData && (userData as any)._id)

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setFormData({
          _id: String((userData as any)._id),
          firstName: String((userData as any).firstName ?? ''),
          lastName: String((userData as any).lastName ?? ''),
          email: String((userData as any).email ?? ''),
          phoneNumber: String((userData as any).phoneNumber ?? ''),
          password: '',
          role: String((userData as any).role ?? 'Admin'),
        })
        setErrors({})
      } else {
        setFormData({
          _id: undefined,
          firstName: '',
          lastName: '',
          email: "",
          phoneNumber: '',
          password: '',
          role: "Admin",
        })
        setErrors({})
      }
    } else {
      // reset closed
      setFormData({
        _id: undefined,
        firstName: '',
        lastName: '',
        email: "",
        phoneNumber: '',
        password: '',
        role: "Admin",
      })
      setErrors({})
    }
  }, [open, userData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const firstName = String(formData.firstName ?? '').trim()
    const lastName = String(formData.lastName ?? '').trim()
    const emailVal = String(formData.email ?? '').trim()
    const phone = String(formData.phoneNumber ?? '').trim()
    const passwordVal = String(formData.password ?? '').trim()

    if (!firstName) newErrors.firstName = "First name is required"
    if (!lastName) newErrors.lastName = "Last name is required"
    if (!emailVal) newErrors.email = "Email is required"
    if (!phone) newErrors.phoneNumber = "Phone number is required"
    if (!isEdit) {
      if (!passwordVal) {
        newErrors.password = "Password is required"
      } else if (!strongPasswordRegex.test(passwordVal)) {
        newErrors.password = "Password must be at least 6 characters and include uppercase, lowercase, number and symbol"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
   try {
      if ((formData as any)._id) {
        const { _id } = formData as any
        const payload = {
          firstName: String(formData.firstName ?? '').trim(),
          lastName: String(formData.lastName ?? '').trim(),
          email: String(formData.email ?? '').trim(),
          phoneNumber: String(formData.phoneNumber ?? '').trim(),
          role: String(formData.role ?? 'Admin') === 'SuperAdmin' ? 'SuperAdmin' : String(formData.role ?? 'Admin'),
        }
        await updateOne(AUTH_ENDPOINT, _id, payload);
        toast.success("User updated successfully ")
      } else {
        const create = {
          firstName: String(formData.firstName ?? '').trim(),
          lastName: String(formData.lastName ?? '').trim(),
          email: String(formData.email ?? '').trim(),
          phoneNumber: String(formData.phoneNumber ?? '').trim(),
          password: String(formData.password ?? ''),
          role: String(formData.role ?? 'Admin') === 'SuperAdmin' ? 'SuperAdmin' : String(formData.role ?? 'Admin'),
        }
        await createOne("auth/register", create);
        toast.success("User created successfully ")
      }
      onSaved?.(formData) ;
      onOpenChange(false);
    }
    catch (error: any) {
      console.error("Error during registration:", error.message)
      toast.error(error.message || "Please try again")
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleCancel = () => {
    setFormData({
      _id: undefined,
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
      <Sheet open={open} onOpenChange={onOpenChange} >
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto max-h-screen">
          <SheetHeader>
            <SheetTitle>{isEdit ? "Edit User" : "Add New User"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update the user details." : "Fill in the information below to add a new user to the system."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">

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

            <div className="space-y-2">
              <Label htmlFor="email">Email Address </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, email: value })
                  setEmail(value)
                  if (value === "") {
                    setErrors((prev) => ({ ...prev, email: "Email is required" }))
                  } else if (!/\S+@\S+\.\S+/.test(value)) {
                    setErrors((prev) => ({ ...prev, email: "Email is invalid" }))
                  } else {
                    setErrors((prev) => ({ ...prev, email: "" }))
                  }
                }}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number </Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, phoneNumber: value })
                  if (value === "") {
                    setErrors((prev) => ({ ...prev, phoneNumber: "Phone number is required" }))
                  } else if (!/^\d{10}$/.test(value)) {
                    setErrors((prev) => ({
                      ...prev,
                      phoneNumber: "Phone number must be 10 digits only",
                    }))
                  } else {
                    setErrors((prev) => ({ ...prev, phoneNumber: "" }))
                  }

                }}
                placeholder="Enter phone number"
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
            </div>
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="password">Password </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    const value = e.target.value
                    setPassword(value)
                    setFormData({ ...formData, password: e.target.value })
                    if (value === "") {
                      setErrors((prev) => ({ ...prev, password: "Password is required" }))
                    } else if (!strongPasswordRegex.test(value)) {
                      setErrors((prev) => ({
                        ...prev,
                        password:
                          "Password must be at least 6 characters and include uppercase, lowercase, number and symbol",
                      }))
                    } else {
                      setErrors((prev) => ({ ...prev, password: "" }))
                    }
                  }}
                  placeholder="Enter password"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
            )}
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

            <div className="flex justify-end space-x-3 pt-6">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save" : "Submit")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
