// backend/models/Post.js – HOÀN CHỈNH 100% (17/11/2025)
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  tags: [{ type: String }],

  // Thông tin tác giả – giữ nguyên như anh đang dùng
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  authorName: { type: String, required: true },     // để hiển thị tên nhanh, không cần populate
  authorAvatar: { type: String },                   // ảnh đại diện

  // LIKE – lưu danh sách userId (String) đã like
  likes: {
    type: [String],     // lưu user._id.toString()
    default: [],
  },

  // BÌNH LUẬN + TRẢ LỜI
  comments: [
    {
      content: { type: String, required: true },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      authorName: { type: String, required: true },
      authorAvatar: { type: String },
      createdAt: { type: Date, default: Date.now },
      likes: { type: Number, default: 0 },

      // Trả lời bình luận (nested)
      replies: [
        {
          content: { type: String, required: true },
          author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          authorName: { type: String, required: true },
          authorAvatar: { type: String },
          createdAt: { type: Date, default: Date.now },
          likes: { type: Number, default: 0 },
        },
      ],
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

// Index để tìm bài nhanh
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ author: 1 });

module.exports = mongoose.model("Post", postSchema);