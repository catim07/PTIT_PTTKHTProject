// src/components/NewArticle.tsx – BẢN HOÀN HẢO TUYỆT ĐỐI 100% (17/11/2025)
import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Eye,
  Send,
  X,
  Plus,
  Bold,
  Italic,
  Link as LinkIcon,
  Code,
  Upload,
  Trash2,
} from "lucide-react";

interface NewArticleProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onBack: () => void;
  onArticleAdded?: (article: any) => void;
}

export function NewArticle({
  darkMode,
  toggleDarkMode,
  onBack,
  onArticleAdded,
}: NewArticleProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [coverImage, setCoverImage] = useState("");
  const [uploading, setUploading] = useState(false);

  // === TAG HANDLERS ===
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // === UPLOAD ẢNH BÌA – CHẠY NGON 100% VỚI CLOUDINARY CỦA EM ===
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ảnh quá lớn! Chỉ nhận dưới 10MB thôi nha em!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "bloghub"); // PRESET CỦA EM

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dop5gaihw/image/upload",
        { method: "POST", body: formData }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload thất bại");

      setCoverImage(data.secure_url);
      alert("Upload thành công! Ảnh bìa đã hiện đẹp lung linh rồi nè");
    } catch (err: any) {
      console.error("Lỗi upload:", err);
      alert("Lỗi: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // === XÓA ẢNH BÌA ===
  const removeCoverImage = () => {
    setCoverImage("");
  };

  // === ĐĂNG BÀI ===
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Nhập tiêu đề và nội dung nha em!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Đăng nhập trước nha!");
      onBack();
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content,
          tags,
          image: coverImage || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi đăng bài");

      alert("Đăng bài thành công!");
      onArticleAdded?.(data);

      // Reset form
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
      setCoverImage("");

      setTimeout(() => onBack?.(), 100);
    } catch (err: any) {
      alert(err.message || "Không thể đăng bài!");
    }
  };

  // === MARKDOWN RENDER ===
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded my-4 overflow-x-auto"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded">$1</code>')
      .replace(/\n/g, "<br>");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={onBack}>← Quay lại</Button>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2"><Save className="h-4 w-4" />Lưu nháp</Button>
            <Button variant={showPreview ? "default" : "outline"} onClick={() => setShowPreview(!showPreview)} className="gap-2">
              <Eye className="h-4 w-4" />{showPreview ? "Ẩn" : "Xem"} trước
            </Button>
            <Button onClick={handleSubmit} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4" />Đăng bài
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Editor */}
          <div className={showPreview ? "lg:col-span-6" : "lg:col-span-12"}>
            <Card className="p-6 space-y-8">
              {/* Ảnh bìa + nút xóa siêu đẹp */}
              <div>
                <label className="text-sm font-medium mb-3 block">Ảnh bìa bài viết</label>
                {coverImage ? (
                  <div className="relative group rounded-xl overflow-hidden border">
                    <img src={coverImage} alt="Cover" className="w-full h-80 object-cover" />
                    <button
                      onClick={removeCoverImage}
                      className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                ) : (
                  <label className="block border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition bg-muted/30">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Click hoặc kéo thả ảnh vào đây</p>
                    {uploading && <p className="text-blue-600 mt-2">Đang upload...</p>}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <Separator />
              <Input placeholder="Tiêu đề thật cuốn..." value={title} onChange={(e) => setTitle(e.target.value)} className="text-4xl font-bold border-0 focus-visible:ring-0" />
              <Separator />

              {/* Tags */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full pr-1">
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-2 hover:bg-destructive/20 rounded-full p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Thêm tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleKeyPress} />
                  <Button onClick={handleAddTag}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>

              <Separator />
              <Textarea placeholder="Viết nội dung tuyệt vời của em đi nào..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-96 resize-none border-0 focus-visible:ring-0 p-0" />
            </Card>
          </div>

          {/* Preview */}
          <AnimatePresence>
            {showPreview && (
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="lg:col-span-6">
                <Card className="p-8 sticky top-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-muted-foreground">Xem trước</h4>
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} className="lg:hidden">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {coverImage && (
                    <div className="mb-8 -mx-8 relative group">
                      <img src={coverImage} alt="Preview" className="w-full h-96 object-cover rounded-b-xl" />
                      <button
                        onClick={removeCoverImage}
                        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  {title && <h1 className="text-5xl font-bold mb-6 leading-tight">{title}</h1>}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-8">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-lg py-1 px-4 rounded-full">#{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} className="prose prose-lg dark:prose-invert max-w-none" />
                  ) : (
                    <p className="text-muted-foreground italic text-center py-20">Nội dung sẽ hiện ở đây...</p>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}