// src/components/admin/AdminPosts.tsx
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
import { Search, MoreHorizontal, Eye, EyeOff, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

export function AdminPosts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/articles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Lỗi tải bài viết:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // XÓA BÀI VIẾT
  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bài viết này? Không thể khôi phục!")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPosts(posts.filter(p => p._id !== id));
      } else {
        alert("Xóa thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  // ẨN / HIỆN BÀI VIẾT (thêm field isHidden vào backend sau này, tạm dùng status)
  const handleToggleHide = async (id: string, currentHidden: boolean) => {
    // Tạm thời chỉ thay đổi frontend (sau này thêm API thật)
    setPosts(posts.map(p => 
      p._id === id ? { ...p, isHidden: !currentHidden } : p
    ));
  };

  const getStatusBadge = (post: any) => {
    if (post.isHidden) {
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Đã ẩn</Badge>;
    }
    // Giả sử bài mới tạo chưa được duyệt (tạm thời tất cả đều published)
    return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Đã đăng</Badge>;
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-20 text-xl">Đang tải bài viết...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Quản lý bài viết</h2>
          <p className="text-muted-foreground">
            Quản lý tất cả bài viết trên BlogHub
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Thêm bài viết mới
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài viết, tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Tiêu đề</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Lượt xem</TableHead>
              <TableHead>Bình luận</TableHead>
              <TableHead>Ngày đăng</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Không tìm thấy bài viết nào
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post._id}>
                  <TableCell className="max-w-md">
                    <p className="font-medium line-clamp-2">{post.title}</p>
                  </TableCell>
                  <TableCell>{post.authorName || "Ẩn danh"}</TableCell>
                  <TableCell>{getStatusBadge(post)}</TableCell>
                  <TableCell>
                    {((post.likes?.length || 0) * 10 + (post.comments?.length || 0) * 5).toLocaleString()}
                  </TableCell>
                  <TableCell>{post.comments?.length || 0}</TableCell>
                  <TableCell>{format(new Date(post.createdAt), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleHide(post._id, post.isHidden)}
                        >
                          {post.isHidden ? (
                            <>Hiện bài</>
                          ) : (
                            <>Ẩn bài</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(post._id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa vĩnh viễn
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}