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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import AddLeadDrawer from "@/components/add-lead-drawer";
import EditLeadDrawer from "@/components/EditLeadDrawer";
import { getAll, deleteOne } from "@/app/utils/api";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [editLead, setEditLead] = useState<any | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<any | null>(null);
  const currentUserId = "64f8b5c2d1234abcd567ef90";

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await getAll("lead");
      const leadsArray = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : [];
      setLeads(leadsArray);
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
      fetchLeads();
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };
  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    await handleDelete(leadToDelete._id);
    setConfirmDelete(false);
    setLeadToDelete(null);
  };


  const handleEdit = (lead: any) => {
    setEditLead(lead);
    setOpenEditDrawer(true);
    setOpenDropdownId(null);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

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
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Table */}
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
                    <TableCell>{lead.Email}</TableCell>
                    <TableCell>{lead.whatsUpNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          lead.status === "ACTIVE" ? "secondary" : "destructive"
                        }
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {/* View Option */}
                          <DropdownMenuItem
                            onClick={() => {
                              alert(
                                `Website: ${lead.websiteURL || "N/A"}\nLinkedIn: ${lead.linkdinURL || "N/A"
                                }\nIndustry: ${lead.industry || "N/A"}\nPriority: ${lead.priority || "N/A"
                                }`
                              );
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>

                          {/* Edit Option */}
                          <DropdownMenuItem
                            onClick={() => {
                              setEditLead(lead);
                              setOpenEditDrawer(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>

                          {/*  Delete Option (confirmation) */}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setLeadToDelete(lead);
                              setConfirmDelete(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Drawers */}
      <AddLeadDrawer
        open={openDrawer}
        onOpenChange={setOpenDrawer}
        currentUserId={currentUserId}
        onSaved={() => {
          fetchLeads();
          toast.success("Lead created successfully");
        }}
      />
      <EditLeadDrawer
        open={openEditDrawer}
        onOpenChange={setOpenEditDrawer}
        currentUserId={currentUserId}
        leadData={editLead}
        onSaved={() => {
          fetchLeads();
          toast.success("Lead updated successfully");
        }}
      />
      {/* 🔴 Delete Confirmation Dialog */}
      {confirmDelete && leadToDelete && (
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Lead</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete{" "}
                <strong>{leadToDelete.firstName}</strong>?
              </p>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Yes, Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>

  );
}
