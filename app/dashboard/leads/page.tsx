"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import EditLeadDrawer from '@/components/EditLeadDrawer'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast, { Toaster } from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import axios, { CancelTokenSource } from "axios";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-blue-100 text-blue-800",
  INACTIVE: "bg-yellow-100 text-yellow-800",
};

const priorityOptions = ["HIGH", "MEDIUM", "LOW"];

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid JWT:", error);
    return null;
  }
}

interface Lead {
  _id: string;
  email: string;
  firstName: string;
  whatsUpNumber: number;
  status: string;
  priority: string;
  createdDate: string;
  websiteURL: string;
  linkdinURL: string;
  workEmail: string;
  userId?: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editLead, setEditLead] = useState<Lead | null>(null)
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    websiteURL: "",
    linkdinURL: "",
    industry: "",
    whatsUpNumber: "",
    status: "ACTIVE",
    workEmail: "",
    userId: "",
    priority: "HIGH",
  });
  const [error, setError] = useState<string | null>(null);
  const leadsPerPage = 10;
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  // ---- Fetch Leads ----
  const fetchLeads = async (page = 1) => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("superseded");
    }
    const source = axios.CancelToken.source();
    cancelTokenRef.current = source;

    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page,
        limit: leadsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const client = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081",
        headers: {
          Authorization: token ? ` ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      const resp = await client.get("/api/v1/lead", {
        params,
        cancelToken: source.token,
      });

      setLeads(resp.data.data || []);
      setTotalPages(resp.data.meta?.totalPages || 1);
      setTotalLeads(resp.data.meta?.total || 0);
      setCurrentPage(resp.data.meta?.currentPage || page);
    } catch (e: any) {
      if (!axios.isCancel(e)) {
        console.error("Fetch error", e);
        if (e.response?.status === 401) {
          router.push("/login");
        } else {
          setError("Failed to load leads");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage]);

  // ---- Add Lead ----
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const token = localStorage.getItem("token");
    let userId = "";

    if (token) {
      const decoded = parseJwt(token);
      userId = decoded?.userId || decoded?._id || "";
    }

    if (!userId) {
      toast.error("User ID missing. Please log in again");
      setCreating(false);
      router.push("/login");
      return;
    }

    if (
      !form.email ||
      !form.firstName ||
      !form.websiteURL ||
      !form.linkdinURL ||
      !form.industry ||
      !form.whatsUpNumber ||
      !form.workEmail
    ) {
      toast.error("Please fill all required fields");
      setCreating(false);
      return;
    }

    const payload = {
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      websiteURL: form.websiteURL.trim(),
      linkdinURL: form.linkdinURL.trim(),
      industry: form.industry.trim(),
      whatsUpNumber: Number(form.whatsUpNumber),
      status: form.status,
      workEmail: form.workEmail.trim(),
      userId,
      priority: form.priority,
    };

    try {
      const client = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081",
        headers: {
          Authorization: token ? ` ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      const res = await client.post("/api/v1/lead", payload);

      setLeads((prev) => [res.data.data, ...prev]);
      setTotalLeads((prev) => prev + 1);
      setIsDrawerOpen(false);
      setForm({
        email: "",
        firstName: "",
        websiteURL: "",
        linkdinURL: "",
        industry: "",
        whatsUpNumber: "",
        status: "ACTIVE",
        workEmail: "",
        userId: "",
        priority: "HIGH",
      });

      toast.success("Lead created successfully!");
    } catch (err: any) {
      console.error("Create lead error", err);
      if (err.response) {
        toast.error(
          err.response.data.message ||
          JSON.stringify(err.response.data) ||
          "Lead creation failed"
        );
        if (err.response.status === 401) {
          router.push("/login");
        }
      } else {
        toast.error("No response from server. Check network or backend");
      }
    } finally {
      setCreating(false);
    }
  };
 const handleUpdateLead = async (updatedLead: Lead) => {
  try {
    const token = localStorage.getItem("token") || "";
    let userId = "";

    if (token) {
      const decoded = parseJwt(token);
      userId = decoded?.userId || decoded?._id || "";
    }

    if (!userId) {
      toast.error("User ID missing. Please log in again");
      router.push("/login");
      return;
    }

    if (!updatedLead._id) {
      toast.error("Lead ID is missing");
      return;
    }

    // Required field check
    if (
      !updatedLead.email ||
      !updatedLead.firstName ||
      !updatedLead.websiteURL ||
      !updatedLead.linkdinURL ||
      !updatedLead.industry ||
      !updatedLead.whatsUpNumber ||
      !updatedLead.workEmail
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // First name validation — allow spaces, hyphens, apostrophes
    if (!/^[A-Za-z\s'-]+$/.test(updatedLead.firstName.trim())) {
      toast.error("First name must contain only letters, spaces, hyphens, or apostrophes");
      return;
    }

    // Prepare payload
    const payload = {
      email: updatedLead.email.trim(),
      firstName: updatedLead.firstName.trim(),
      websiteURL: updatedLead.websiteURL.trim(),
      linkdinURL: updatedLead.linkdinURL.trim(),
      industry: updatedLead.industry.trim(),
      whatsUpNumber: Number(updatedLead.whatsUpNumber),
      status: updatedLead.status,
      workEmail: updatedLead.workEmail.trim(),
      userId,
      priority: updatedLead.priority,
    };

    const res = await fetch(
      `http://localhost:8081/api/v1/lead/${updatedLead._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    // Update local state instantly
    setLeads((prevLeads) =>
      prevLeads.map((l) => (l._id === data.data._id ? data.data : l))
    );

    toast.success("Lead updated successfully!", {
      duration: 3000,
      position: "top-center",
      dismissible: true,
    });

    setIsEditOpen(false);
  } catch (err) {
    console.error("Update failed:", err);
    toast.error("Something went wrong");
  }
};


  const startIndex = (currentPage - 1) * leadsPerPage + 1;
  const endIndex = Math.min(currentPage * leadsPerPage, totalLeads);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <Button onClick={() => setIsDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div>Loading...</div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow >
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsUpNumber</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead._id}>
                <TableCell className="font-medium">{lead.firstName}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.whatsUpNumber}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      statusColors[lead.status] || "bg-gray-100 text-gray-800"
                    }
                  >
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost"><MoreHorizontal /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditLead(lead)
                          setIsEditOpen(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={async () => {
                          const alert = window.confirm("Are you sure you want to delete this lead?");
                          if (!alert) return;
                          try {
                            const token = localStorage.getItem("token") || ""
                            const res = await fetch(`http://localhost:8081/api/v1/lead/${lead._id}`, {
                              method: "DELETE",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: token,
                              },
                            })
                            if (!res.ok) {
                              const errText = await res.text()
                              throw new Error(errText)
                            }
                            setLeads(leads.filter(x => x._id !== lead._id))
                            toast.success("Your lead is Deleted  "), {
                              duration: 3000,
                              position: "top-center",
                              dismissible: true,
                            }
                            const newLeads = leads.filter(x => x._id !== lead._id);
                            setLeads(newLeads);
                            const remainingLeads = newLeads.length;
                            const lastPage = Math.ceil(remainingLeads / 3);

                            if (currentPage > lastPage) {
                              setCurrentPage(lastPage || 1);
                            } else {
                              setCurrentPage(currentPage);
                            }
                            fetchLeads();

                          } catch (err) {
                            console.error("Delete failed:", err)
                            toast.error("Something went wrong ")
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!loading && leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalLeads > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {startIndex} to {endIndex} of {totalLeads} results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Lead Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-end z-10">
          <div className="w-full max-w-md bg-white p-6 overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Add Lead</h2>
            <form onSubmit={handleAddLead} className="space-y-3">
              <div>
                <label className="block text-sm">First Name</label>
                <Input
                  required
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm">WhatsApp Number</label>
                <Input
                  required
                  type="tel"
                  value={form.whatsUpNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, whatsUpNumber: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm">Website URL</label>
                <Input
                  required
                  value={form.websiteURL}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, websiteURL: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm">LinkedIn URL</label>
                <Input
                  required
                  value={form.linkdinURL}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, linkdinURL: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm">Industry</label>
                <Input
                  required
                  value={form.industry}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, industry: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm">Work Email</label>
                <Input
                  required
                  type="email"
                  value={form.workEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, workEmail: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm">Priority</label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, priority: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Lead"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Cancel
                </Button>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </form>
          </div>
        </div>
      )}
      <EditLeadDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        leadData={editLead}
        onSave={handleUpdateLead}
      />
    </div>
  );
}

