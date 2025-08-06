"use client"

import { useState, useEffect } from 'react'
import { AddUserDrawer } from '@/components/add-user-drawer'
import EditUserDrawer from '@/components/EditUserDrawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { toast } from "sonner"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token") || ""
      const params = new URLSearchParams();
      params.append("page", currentPage.toString())
      params.append("limit", "3")
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter !== "all") params.append("role", roleFilter);
      const res = await fetch(`http://localhost:8081/api/v1/auth/listUsers?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Error ${res.status}: ${errorText}`)
      }
      const data = await res.json()
      setUsers(data.users || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error("Fetch error:", err)
    }
  };



  const filterUsers = () => {
    const filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
    setFilteredUsers(filtered);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(
        `http://localhost:8081/api/v1/auth/updateProfile/${updatedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(updatedUser),
        });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === data.user._id ? data.user : user
        ));
      toast.success("User updated successfully! ✅"), {
        duration: 3000,
        position: "top-center",
        dismissible: true,
      }
      setIsEditOpen(false);
    } catch (err) {
      toast.error("Something went wrong ❌")
    }
  };

  const handleAddUser = (newUser: any) => {
    const name = `${newUser.firstName} ${newUser.lastName}`.trim()
    const userToAdd = {
      id: users.length + 1,
      name,
      ...newUser,
      status: 'active',
      department: newUser.department || 'General',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [userToAdd, ...prev]);
    setIsDrawerOpen(false);
  }
  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, roleFilter])

  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch =
        user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        roleFilter === 'all' || user?.role?.toLowerCase() === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setIsDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute top-2 left-3 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by firstName, lastName, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
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
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow >
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(filteredUsers || [])
            .filter((u: any) => u && u._id)
            .map((u: any) => (
              <TableRow key={u._id}>
                <TableCell>{`${u.firstName} ${u.lastName}`}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge className={roleColors[u.role] || "bg-gray-100 text-gray-800"}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>{u.phoneNumber}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost"><MoreHorizontal /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditUser(u)
                          setIsEditOpen(true)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("token") || ""
                            const res = await fetch(`http://localhost:8081/api/v1/auth/delete/${u._id}`, {
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
                            setUsers(users.filter(x => x._id !== u._id))
                            toast.success("Your Profile is Deleted  ✅"), {
                              duration: 3000,
                              position: "top-center",
                              dismissible: true,
                            }
                            const newUsers = users.filter(x => x._id !== u._id);
                            setUsers(newUsers);
                            const remainingUsers = newUsers.length;
                            const lastPage = Math.ceil(remainingUsers / 3);

                            if(currentPage>lastPage){
                              setCurrentPage(lastPage||1);
                            }else{
                              setCurrentPage(currentPage);
                            }
                            fetchUsers();

                          } catch (err) {
                            console.error("Delete failed:", err)
                            toast.error("Something went wrong ❌")
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
        </TableBody>

      </Table>
      <div className="flex justify-between items-center mt-4 px-2">
        <p>Showing {users.length > 0 ? `${(currentPage - 1) * 3 + 1} to ${(currentPage - 1) * 3 + users.length}` : 0} of {totalPages * 3} results</p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >Previous
          </Button>
          <p>Page {currentPage} of {totalPages}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >  Nextn</Button>
        </div>
      </div>

      <AddUserDrawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) {
            fetchUsers();
          }
        }}
        onSubmit={handleAddUser}
      />

      <EditUserDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        userData={editUser}
        onSave={handleUpdateUser}
      />
    </div>
  )
}