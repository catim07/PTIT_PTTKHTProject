// src/components/admin/AdminUsers.tsx – CHẠY ĐÚNG 100% VỚI BACKEND HIỆN TẠI CỦA BẠN
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Search,
  MoreHorizontal,
  Lock,
  Unlock,
  Trash2,
  Mail,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin" | "banned";
  createdAt?: string;
  blogCount?: number;        // backend trả về số bài viết
  followerCount?: number;    // backend trả về số người theo dõi
  followingCount?: number;   // backend trả về số người đang theo dõi
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          console.log("DATA NHẬN ĐƯỢC TỪ API /users:", data); // XEM LOG NÀY ĐI!
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Lỗi tải người dùng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const msg = currentRole === "admin" ? "Gỡ quyền Admin?" :
                currentRole === "banned" ? "Mở khóa tài khoản?" : "Khóa tài khoản?";
    if (!confirm(msg)) return;

    const newRole = currentRole === "admin" ? "user" : 
                    currentRole === "banned" ? "user" : "banned";

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert("Thao tác thất bại");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("XÓA VĨNH VIỄN tài khoản này? Không thể khôi phục!")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      alert("Xóa thất bại");
    }
  };

  const getStatusBadge = (role: string) => {
    if (role === "admin") return <Badge className="bg-purple-100 text-purple-700 gap-1"><Shield className="w-3 h-3" /> Admin</Badge>;
    if (role === "banned") return <Badge className="bg-red-100 text-red-700">Đã khóa</Badge>;
    return <Badge className="bg-green-100 text-green-700">Hoạt động</Badge>;
  };

  const formatJoinDate = (createdAt?: string) => {
    if (!createdAt) return "Admin gốc";
    const date = new Date(createdAt);
    return isNaN(date.getTime()) ? "Admin gốc" : format(date, "dd/MM/yyyy");
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center text-xl">Đang tải người dùng...</div>;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold">Quản lý người dùng</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold">{users.length}</div>
          <p className="text-muted-foreground">Tổng người dùng</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-green-600">
            {users.filter(u => u.role !== "banned").length}
          </div>
          <p className="text-muted-foreground">Đang hoạt động</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-4xl font-bold text-red-600">
            {users.filter(u => u.role === "banned").length}
          </div>
          <p className="text-muted-foreground">Đã khóa</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tên hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Bài viết</TableHead>
              <TableHead className="text-center">Người theo dõi</TableHead>
              <TableHead className="text-center">Đang theo dõi</TableHead>
              <TableHead>Tham gia</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {user.role === "admin" && <p className="text-xs text-purple-600">Quản trị viên</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{user.email}</TableCell>
                <TableCell>{getStatusBadge(user.role)}</TableCell>
                <TableCell className="text-center font-bold text-blue-600">
                  {user.blogCount ?? 0}
                </TableCell>
                <TableCell className="text-center font-bold text-green-600">
                  {user.followerCount ?? 0}
                </TableCell>
                <TableCell className="text-center font-bold text-purple-600">
                  {user.followingCount ?? 0}
                </TableCell>
                <TableCell className="font-medium">
                  {formatJoinDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Mail className="h-4 w-4 mr-2" /> Gửi email</DropdownMenuItem>
                      {user.role === "admin" ? (
                        <DropdownMenuItem onClick={() => handleToggleRole(user._id, user.role)} className="text-purple-600">
                          <Shield className="h-4 w-4 mr-2" /> Gỡ quyền Admin
                        </DropdownMenuItem>
                      ) : user.role === "banned" ? (
                        <DropdownMenuItem onClick={() => handleToggleRole(user._id, user.role)}>
                          <Unlock className="h-4 w-4 mr-2" /> Mở khóa
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleToggleRole(user._id, user.role)} className="text-orange-600">
                          <Lock className="h-4 w-4 mr-2" /> Khóa tài khoản
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDeleteUser(user._id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Xóa tài khoản
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}