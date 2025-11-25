// src/components/ArticleDetail.tsx – ĐÃ FIX HOÀN HẢO CHO APP.TSX KHÔNG DÙNG ROUTER
import { useState, useEffect } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  UserPlus,
  Send,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Comment {
  _id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

interface ArticleDetailProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onBack: () => void;
  onWriteClick?: () => void;
  onEditClick?: () => void;        // ← THÊM PROP NÀY ĐỂ CHUYỂN SANG TRANG SỬA
  article?: any;
  currentUser?: any;
}

export function ArticleDetail({
  darkMode,
  toggleDarkMode,
  onBack,
  onWriteClick,
  onEditClick,                   // ← NHẬN TỪ APP.TSX
  article,
  currentUser,
}: ArticleDetailProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (article && currentUser) {
      setLikesCount(article.likes?.length || 0);
      setLiked(article.likes?.includes(currentUser._id));
      setComments(article.comments || []);
    }
  }, [article, currentUser]);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-2xl">
        Đang tải bài viết...
      </div>
    );
  }

  const {
    _id: articleId,
    title,
    content,
    image,
    tags = [],
    author,
    authorName,
    authorAvatar,
    createdAt,
  } = article;

  const isOwner = currentUser?._id === (author?._id || author);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, "<h3 class='text-2xl font-bold mt-8 mb-4'>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2 class='text-3xl font-bold mt-10 mb-6'>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1 class='text-4xl font-bold mt-12 mb-8'>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline font-medium">$1</a>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-6 rounded-lg my-6 overflow-x-auto font-mono text-sm"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/\n/g, "<br>");
  };

  // === XỬ LÝ LIKE, COMMENT, REPLY, XÓA ===
  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return alert("Đăng nhập để thích!");
    try {
      const res = await fetch(`http://localhost:5000/api/articles/${articleId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch (err) { console.error(err); }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập!");
    try {
      const res = await fetch(`http://localhost:5000/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment }),
      });
      const comment = await res.json();
      if (res.ok) {
        setComments(prev => [comment, ...prev]);
        setNewComment("");
      }
    } catch (err) { console.error(err); }
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập!");
    try {
      const res = await fetch(`http://localhost:5000/api/articles/${articleId}/comments/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: replyText }),
      });
      const reply = await res.json();
      if (res.ok) {
        setComments(prev => prev.map(c => c._id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c));
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteArticle = async () => {
    if (!confirm("Xóa hoàn toàn bài viết này? Không thể khôi phục!")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/articles/${articleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Đã xóa bài viết thành công!");
        onBack(); // Quay về trang chủ
      }
    } catch (err) { alert("Lỗi mạng"); }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Xóa bình luận này?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/articles/${articleId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setComments(prev => {
          let updated = prev.filter(c => c._id !== commentId);
          updated = updated.map(c => ({
            ...c,
            replies: c.replies?.filter(r => r._id !== commentId) || []
          }));
          return updated;
        });
        alert("Đã xóa!");
      }
    } catch (err) { alert("Lỗi mạng"); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          ← Quay lại
        </Button>

        <article>
          {/* Title + 3 chấm (SỬA + XÓA) */}
          <div className="flex justify-between items-start mb-6 gap-4">
            <div className="flex-1">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              <h1 className="text-5xl font-bold leading-tight">{title}</h1>
            </div>

            {/* MENU 3 CHẤM – DÙNG onEditClick TỪ APP.TSX */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted">
                    <MoreHorizontal className="h-6 w-6" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={onEditClick}   // ← CHUYỂN SANG TRANG SỬA
                    className="gap-2 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                    Sửa bài viết
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteArticle} className="text-red-600 gap-2 cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                    Xóa bài viết
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Tác giả + Theo dõi */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={authorAvatar || author?.avatar} />
                <AvatarFallback>{(authorName || author?.name)?.[0] || "A"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{authorName || author?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(createdAt)} · {Math.ceil(content.length / 300)} phút đọc
                </p>
              </div>
            </div>
            <Button
              variant={following ? "outline" : "default"}
              size="sm"
              onClick={() => setFollowing(!following)}
              className={following ? "" : "bg-blue-600 hover:bg-blue-700 text-white gap-2"}
            >
              {following ? "Đang theo dõi" : <> <UserPlus className="h-4 w-4" /> Theo dõi</>}
            </Button>
          </div>

          {image && (
            <img src={image} alt={title} className="w-full h-96 object-cover rounded-xl mb-8 shadow-lg" />
          )}

          <Separator className="my-10" />
          <div
            className="prose prose-lg dark:prose-invert max-w-none mb-12 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
          <Separator className="my-10" />

          {/* Actions: Like, Comment, Bookmark, Share */}
          <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLike}
                className={`relative ${liked ? "bg-red-500 text-white border-red-500" : "hover:bg-red-50"}`}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                <span className="ml-2 font-semibold">{likesCount}</span>
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">{comments.length}</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setBookmarked(!bookmarked)}
                className={bookmarked ? "bg-blue-500 text-white border-blue-500" : ""}
              >
                <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
              </Button>
            </div>
            <Button variant="outline" size="lg" className="gap-2">
              <Share2 className="h-5 w-5" /> Chia sẻ
            </Button>
          </div>

          <Separator className="my-10" />

          {/* BÌNH LUẬN – GIỮ NGUYÊN ĐẸP LUNG LINH */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8">Bình luận ({comments.length})</h3>

            {currentUser ? (
              <Card className="p-6 mb-8 border shadow-sm">
                <div className="flex gap-4">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Bạn nghĩ gì về bài viết này?"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-24 resize-none mb-3 text-base"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      >
                        <Send className="h-4 w-4" /> Gửi bình luận
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-lg text-muted-foreground">Đăng nhập để bình luận</p>
              </div>
            )}

            {/* Danh sách bình luận */}
            <div className="space-y-8">
              {comments.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground text-lg">
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex gap-4">
                    <Avatar className="h-11 w-11 flex-shrink-0">
                      <AvatarImage src={comment.authorAvatar} />
                      <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="bg-muted/50 rounded-2xl px-5 py-4 relative pr-12">
                        {(isOwner || currentUser?._id === comment.author?._id) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="absolute top-3 right-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                <MoreHorizontal className="h-6 w-6" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-red-600 gap-2"
                              >
                                <Trash2 className="h-4 w-4" /> Xóa bình luận
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold">{comment.authorName}</p>
                          <span className="text-xs text-muted-foreground">
                            · {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                      </div>

                      <div className="flex items-center gap-6 mt-3 ml-2">
                        <Button variant="ghost" size="sm" className="h-9 gap-1 px-3">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{comment.likes || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-3"
                          onClick={() => setReplyingTo(comment._id)}
                        >
                          Trả lời
                        </Button>
                      </div>

                      {/* Form trả lời */}
                      {replyingTo === comment._id && currentUser && (
                        <div className="mt-6 flex gap-4 ml-14">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback>{currentUser.name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              placeholder={`Trả lời ${comment.authorName}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="min-h-20 resize-none mb-3"
                            />
                            <div className="flex justify-end gap-3">
                              <Button variant="ghost" size="sm" onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                                Hủy
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReply(comment._id)}
                                disabled={!replyText.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Gửi trả lời
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies?.map((reply) => (
                        <div key={reply._id} className="mt-6 ml-14 flex gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={reply.authorAvatar} />
                            <AvatarFallback>{reply.authorName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-muted/30 rounded-2xl px-5 py-4 relative pr-12">
                            {(isOwner || currentUser?._id === reply.author?._id) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <div className="absolute top-3 right-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                    <MoreHorizontal className="h-5 w-5" />
                                  </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteComment(reply._id)}
                                    className="text-red-600 gap-2"
                                  >
                                    <Trash2 className="h-4 w-4" /> Xóa trả lời
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}

                            <p className="font-semibold text-sm">{reply.authorName}</p>
                            <p className="text-sm mt-1 text-foreground whitespace-pre-wrap">{reply.content}</p>
                            <span className="text-xs text-muted-foreground mt-2 block">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}