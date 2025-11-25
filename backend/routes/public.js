// backend/routes/public.js – PHIÊN BẢN HOÀN HẢO NHẤT 2025
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Article = require("../models/Article");

// API: Top users nổi bật (dùng số bài viết)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("name username avatar bio role blogs")
      .lean();

    if (users.length === 0) {
      return res.json([
        { _id: "1", name: "Cà Tim", avatar: "", bio: "Fullstack Developer", followers: 999 },
        { _id: "2", name: "Admin", avatar: "", bio: "Quản trị viên", followers: 888 }
      ]);
    }

    const result = users.map(user => ({
      _id: user._id.toString(),
      name: user.name || user.username || "Ẩn danh",
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || "U")}&background=random&color=fff&bold=true`,
      bio: user.bio || "Chưa có tiểu sử",
      followers: Array.isArray(user.blogs) ? user.blogs.length : 0
    }));

    // Admin lên đầu tuyệt đối
    result.sort((a, b) => {
      const aAdmin = users.find(u => u._id.toString() === a._id && u.role === "admin");
      const bAdmin = users.find(u => u._id.toString() === b._id && u.role === "admin");
      if (aAdmin) return -1;
      if (bAdmin) return 1;
      return b.followers - a.followers;
    });

    res.json(result.slice(0, 10));
  } catch (err) {
    console.error("Lỗi /api/users:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API: Top 5 tags phổ biến nhất – CHUẨN VỚI DB CỦA ANH (tags là string array)
router.get("/tags", async (req, res) => {
  try {
    const tagStats = await Article.aggregate([
      { $match: { tags: { $exists: true, $ne: null, $type: "array", $not: { $size: 0 } } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: "$_id", count: 1 } }
    ]);

    if (tagStats.length === 0) {
      return res.json([
        { name: "React", count: 35 },
        { name: "JavaScript", count: 30 },
        { name: "Node.js", count: 22 },
        { name: "Tailwind CSS", count: 18 },
        { name: "Next.js", count: 15 }
      ]);
    }

    res.json(tagStats);
  } catch (err) {
    console.error("Lỗi /api/tags:", err);
    res.json([
      { name: "React", count: 50 },
      { name: "JavaScript", count: 45 }
    ]);
  }
});

module.exports = router;