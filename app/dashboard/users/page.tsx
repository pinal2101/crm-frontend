"use client";

import { useState, useEffect } from "react";
import { AddUserDrawer } from "@/components/add-user-drawer";
import EditUserDrawer from "@/components/EditUserDrawer";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getAll, updateOne, deleteOne } from "@/app/utils/api";
import Pagination from "@/components/Pagination";

import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
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

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive?: boolean;
  role?: string;
  phoneNumber?: string;
};


const roleColors: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-800",
  Superadmin: "bg-red-100 text-red-800",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(3); // rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const router = useRouter();

  // Fetch Users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
      limit,
      };
      if (searchTerm) params.search = searchTerm;
      if (roleFilter !== "all") params.role = roleFilter;

      const data = await getAll("auth", params);

      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err?.status === 401) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        router.push("/login");
      } else {
        toast.error("Failed to fetch users ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial & dependency fetch
  useEffect(() => {
    fetchUsers();
  }, [ searchTerm, roleFilter,currentPage]);

  // Filtering logic
  useEffect(() => {
    const filtered = users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  // Update User
  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const data = await updateOne("auth", updatedUser._id, updatedUser);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === data.user._id ? data.user : user
        )
      );
      toast.success("User updated successfully ✅");
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ❌");
    }
  };

  // Add User (local only, will refetch on drawer close)
  const handleAddUser = (newUser: any) => {
    const userToAdd = {
      _id: String(Date.now()),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role || "User",
      phoneNumber: newUser.phoneNumber || "",
    };
    setUsers((prev) => [userToAdd, ...prev]);
    setIsDrawerOpen(false);
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteOne("auth", userToDelete._id);
      const newUsers = users.filter((x) => x._id !== userToDelete._id);
      setUsers(newUsers);
      toast.success("User deleted successfully ✅");
      fetchUsers();
      setConfirmDelete(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Something went wrong ❌");
      setConfirmDelete(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setIsDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute top-2 left-3 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by firstName, lastName, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Superadmin">Superadmin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
        <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(filteredUsers || [])
            .filter((u) => u && u._id)
            .map((u) => (
              <TableRow key={u._id}>
                <TableCell>{`${u.firstName} ${u.lastName}`}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      roleColors[u.role || ""] ||
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>{u.phoneNumber}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditUser(u);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setUserToDelete(u);
                          setConfirmDelete(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
</div>
    <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
     </div>

      {/* Add User Drawer */}
      <AddUserDrawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) {
            fetchUsers();
          }
        }}
        onSaved={handleAddUser}
      />

      {/* Edit User Drawer */}
      <EditUserDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        userData={editUser}
        onSave={handleUpdateUser}
      />

      {/* Delete Confirmation */}
      {confirmDelete && userToDelete && (
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete User</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {userToDelete.firstName} {userToDelete.lastName}
                </strong>
                ?
              </p>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Yes, Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}