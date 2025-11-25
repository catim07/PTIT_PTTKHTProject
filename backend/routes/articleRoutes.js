// backend/routes/articleRoutes.js – BẢN CUỐI CÙNG, HOÀN HẢO 100% (25/11/2025)
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/Post");
const { protect } = require("../middlewares/auth");

// ==================== TẠO BÀI VIẾT ====================
router.post("/", protect, async (req, res) => {
  try {
    const { title, content, image, tags } = req.body;
    const newPost = await Post.create({
      title: title.trim(),
      content,
      image: image || "",
      tags: tags || [],
      author: req.user._id,
      authorName: req.user.name || "Người dùng",
      authorAvatar: req.user.avatar || "",
      likes: [],
      comments: [],
    });

    const populatedPost = await Post.findById(newPost._id).populate("author", "name avatar");
    res.status(201).json(populatedPost);
  } catch (err) {
    console.error("Lỗi tạo bài:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==================== LẤY BÀI VIẾT ====================
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author", "_id name avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "_id name avatar");
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==================== LIKE / UNLIKE ====================
router.post("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });

    const userId = req.user._id.toString();
    const likedIndex = post.likes.indexOf(userId);

    if (likedIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likedIndex, 1);
    }

    await post.save();

    res.json({
      liked: likedIndex === -1,
      likesCount: post.likes.length,
    });
  } catch (err) {
    console.error("Lỗi like:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==================== THÊM BÌNH LUẬN ====================
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Nội dung không được để trống" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      content: content.trim(),
      author: req.user._id,
      authorName: req.user.name || "Người dùng",
      authorAvatar: req.user.avatar || "",
      createdAt: new Date(),
      likes: 0,
      replies: [],
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    console.error("Lỗi thêm bình luận:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==================== TRẢ LỜI BÌNH LUẬN ====================
router.post("/:id/comments/:commentId/reply", protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Nội dung trả lời không được để trống" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });

    const parentComment = post.comments.id(req.params.commentId);
    if (!parentComment) return res.status(404).json({ message: "Bình luận không tồn tại" });

    const reply = {
      _id: new mongoose.Types.ObjectId(),
      content: content.trim(),
      author: req.user._id,
      authorName: req.user.name || "Người dùng",
      authorAvatar: req.user.avatar || "",
      createdAt: new Date(),
      likes: 0,
    };

    parentComment.replies.push(reply);
    await post.save();

    res.status(201).json(parentComment.replies[parentComment.replies.length - 1]);
  } catch (err) {
    console.error("Lỗi trả lời bình luận:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==================== XÓA BÀI VIẾT ====================
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa bài viết này" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa bài viết thành công" });
  } catch (err) {
    console.error("Lỗi xóa bài viết:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==================== XÓA BÌNH LUẬN CHÍNH ====================
router.delete("/:id/comments/:commentId", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Bình luận không tồn tại" });

    post.comments.pull({ _id: req.params.commentId });
    await post.save();

    res.json({ message: "Đã xóa bình luận thành công" });
  } catch (err) {
    console.error("Lỗi xóa bình luận:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==================== XÓA TRẢ LỜI (REPLY) – HOÀN HẢO 100% ====================
router.delete("/:id/comments/:parentId/replies/:replyId", protect, async (req, res) => {
  try {
    const { id, parentId, replyId } = req.params;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Bài viết không tồn tại" });

    // Chỉ chủ bài mới được xóa reply (bạn có thể mở rộng thành chủ reply sau)
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa trả lời này" });
    }

    const parentComment = post.comments.id(parentId);
    if (!parentComment) return res.status(404).json({ message: "Bình luận cha không tồn tại" });

    const replyIndex = parentComment.replies.findIndex(r => r._id.toString() === replyId);
    if (replyIndex === -1) return res.status(404).json({ message: "Trả lời không tồn tại" });

    parentComment.replies.splice(replyIndex, 1);
    await post.save();

    res.json({ message: "Đã xóa trả lời thành công" });
  } catch (err) {
    console.error("Lỗi xóa reply:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});
// ==================== CẬP NHẬT (SỬA) BÀI VIẾT – HOÀN HẢO 100% ====================
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, content, image, tags } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "Tiêu đề và nội dung không được để trống" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });

    // Chỉ chủ bài mới được sửa
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền sửa bài viết này" });
    }

    // Cập nhật các field
    post.title = title.trim();
    post.content = content;
    post.image = image || post.image; // giữ lại ảnh cũ nếu không đổi
    post.tags = tags || [];

    await post.save();

    // Trả về bài viết đã cập nhật (có populate để frontend nhận được author name/avatar)
    const updatedPost = await Post.findById(post._id).populate("author", "name avatar");
    res.json(updatedPost);
  } catch (err) {
    console.error("Lỗi cập nhật bài viết:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;