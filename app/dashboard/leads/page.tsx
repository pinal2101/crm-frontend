"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddLeadDrawer from "@/components/add-lead-drawer";
import { getAll, deleteOne } from "@/app/utils/api";
import toast, { Toaster } from "react-hot-toast";
import Pagination from "@/components/Pagination";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
interface Lead {
  _id: string;
  firstName: string;
  websiteURL: string;
  linkdinURL: string;
  workEmail: string;
  industry: string;
  whatsUpNumber: string;
  status: string;
  priority: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageLimit = 10;

  const currentUserId = "64f8b5c2d1234abcd567ef90";

  // Fetch leads from backend with pagination
  const fetchLeads = async (
    page = 1,
    search: string = "",
    status: string = "all"
  ) => {
    try {
      setLoading(true);

      const statusQuery = status !== "all" ? `&status=${status.toUpperCase()}` : "";
      const response = await getAll(
        `lead?page=${page}&limit=${pageLimit}&search=${encodeURIComponent(search)}${statusQuery}`
      );

      const leadsArray = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : [];

      setLeads(leadsArray);

      const totalCount = response.total ?? 50;
      setTotalPages(Math.ceil(totalCount / pageLimit));
      setCurrentPage(page);
    } catch (error) {
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: string) => {
    try {
      await deleteOne("lead", id);
      toast.success("Lead deleted successfully");
      fetchLeads(currentPage);
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditLead(lead);
    setOpenDrawer(true);
    setOpenDropdownId(null);
  };

  useEffect(() => {
    fetchLeads();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openDropdownId) return;
      const ref = dropdownRefs.current[openDropdownId];
      if (ref && !ref.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  const filteredLeads = Array.isArray(leads)
    ? leads.filter((lead) => {
      const matchesSearch =
        lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.workEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        lead.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    : [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <Button
          onClick={() => {
            setEditLead(null);
            setOpenDrawer(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchLeads(1, e.target.value, statusFilter);
            }}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">ACTIVE</SelectItem>
            <SelectItem value="inactive">INACTIVE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table + Pagination Wrapper */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>First Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell>{lead.firstName}</TableCell>
                    <TableCell>{lead.workEmail}</TableCell>
                    <TableCell>{lead.whatsUpNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant={lead.status === "ACTIVE" ? "secondary" : "destructive"}
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="relative inline-block text-left"
                        ref={(el) => {
                          dropdownRefs.current[lead._id] = el
                        }}

                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center"
                          onClick={() =>
                            setOpenDropdownId(
                              openDropdownId === lead._id ? null : lead._id
                            )
                          }
                        >
                          <MoreHorizontal />
                        </Button>

                        {openDropdownId === lead._id && (
                          <div
                            className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-md rounded-md z-50
                                       transition-all duration-150 ease-out overflow-hidden"
                          >
                            <button
                              className="w-full flex items-center gap-2 text-left px-3 py-2 hover:bg-gray-100"
                              onClick={() => handleEdit(lead)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              className="w-full flex items-center gap-2 text-left px-3 py-2 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(lead._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                            <button
                              className="w-full flex items-center gap-2 text-left px-3 py-2 hover:bg-gray-100"
                              onClick={() => {
                                alert(
                                  `Website: ${lead.websiteURL}\nLinkedIn: ${lead.linkdinURL}\nIndustry: ${lead.industry}\nPriority: ${lead.priority}`
                                );
                                setOpenDropdownId(null);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
      
      </div>

      {/* Add/Edit Lead Drawer */}
      <AddLeadDrawer
        open={openDrawer}
        onOpenChange={setOpenDrawer}
        currentUserId={currentUserId}
        onSaved={() => {
          fetchLeads(currentPage);
          toast.success("Lead created successfully");
        }}
      />

    </div>
  );
}
