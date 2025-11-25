// src/components/admin/AdminComments.tsx
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
import { Search, MoreHorizontal, Trash2, Check, Flag } from "lucide-react";
import { format } from "date-fns";

interface CommentType {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  postId: string;
  postTitle?: string;
  reports?: number; // tạm thời giả lập
}

export function AdminComments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const postsRes = await fetch("http://localhost:5000/api/articles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!postsRes.ok) throw new Error("Không tải được bài viết");

      const posts = await postsRes.json();
      const allComments: CommentType[] = [];

      posts.forEach((post: any) => {
        const extractComments = (comment: any, level = 0) => {
          allComments.push({
            _id: comment._id || Math.random().toString(),
            content: comment.content,
            author: {
              _id: comment.author?._id || comment.author,
              name: comment.authorName,
              avatar: comment.authorAvatar,
            },
            authorName: comment.authorName,
            authorAvatar: comment.authorAvatar,
            createdAt: comment.createdAt,
            postId: post._id,
            postTitle: post.title,
            reports: Math.random() > 0.9 ? Math.floor(Math.random() * 8) + 1 : 0, // giả lập báo cáo
          });

          // Nếu có reply thì đệ quy
          if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach((reply: any) => extractComments(reply));
          }
        };

        post.comments?.forEach((c: any) => extractComments(c));
      });

      // Sắp xếp mới nhất trước
      allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setComments(allComments);
    } catch (err) {
      console.error("Lỗi tải bình luận:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComments();
  }, []);

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!confirm("Xóa bình luận này vĩnh viễn?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/articles/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setComments(comments.filter(c => c._id !== commentId));
      } else {
        alert("Xóa thất bại (chưa có API thật)");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  const getStatusBadge = (comment: CommentType) => {
    if (comment.reports && comment.reports > 0) {
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 gap-1">
          <Flag className="h-3 w-3" />
          {comment.reports} báo cáo
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
        Đã duyệt
      </Badge>
    );
  };

  const filteredComments = comments.filter(c =>
    c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.postTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: comments.length,
    pending: comments.filter(c => !c.reports || c.reports === 0).length,
    reported: comments.filter(c => c.reports && c.reports > 0).length,
  };

  if (loading) {
    return <div className="text-center py-20 text-xl">Đang tải bình luận...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Quản lý bình luận</h2>
        <p className="text-muted-foreground">
          Kiểm duyệt và quản lý tất cả bình luận trên BlogHub
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Tổng bình luận</p>
          <h3 className="text-3xl font-bold">{stats.total.toLocaleString()}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Đã duyệt</p>
          <h3 className="text-3xl font-bold text-green-600">{stats.pending.toLocaleString()}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Bị báo cáo</p>
          <h3 className="text-3xl font-bold text-red-600">{stats.reported}</h3>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bình luận, người dùng, bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead className="w-[300px]">Nội dung</TableHead>
              <TableHead>Bài viết</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Không có bình luận nào
                </TableCell>
              </TableRow>
            ) : (
              filteredComments.map((comment) => (
                <TableRow key={comment._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.authorAvatar} />
                        <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{comment.authorName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <p className="text-sm line-clamp-2">{comment.content}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {comment.postTitle || "Không rõ"}
                    </p>
                  </TableCell>
                  <TableCell>{getStatusBadge(comment)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(comment.createdAt), "dd/MM HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-green-600">
                          <Check className="h-4 w-4 mr-2" />
                          Duyệt bình luận
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteComment(comment._id, comment.postId)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa bình luận
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