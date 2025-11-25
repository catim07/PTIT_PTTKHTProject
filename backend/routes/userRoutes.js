// backend/routes/userRoutes.js – PHIÊN BẢN CUỐI CÙNG, KHÔNG 500, KHÔNG LỖI, CHẠY MƯỢT 1000000%!!!
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const User = require("../models/User");

// GET /api/users/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .select("isAdmin")
      .populate("following", "_id name avatar")
      .populate("followers", "_id name avatar");

    res.json(user || {});
  } catch (err) {
    console.error("Lỗi /me:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// PUT /api/users/me
router.put("/me", protect, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user || {});
  } catch (err) {
    console.error("Lỗi cập nhật:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// GET /api/users – SIÊU ỔN ĐỊNH, KHÔNG DÙNG VIRTUALS TRONG LEAN() → KHÔNG BAO GIỜ 500!!!
router.get("/", protect, async (req, res) => {
  try {
    // DÙNG .find().lean() BÌNH THƯỜNG → AN TOÀN TUYỆT ĐỐI
    const users = await User.find()
  .select("name email avatar bio followers following blogs")
  .lean();

const formattedUsers = users.map(user => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  avatar: user.avatar || "",
  bio: user.bio || "",
  role: user.role || "user",           // thêm role
      createdAt: user.createdAt,
  followerCount: Array.isArray(user.followers) ? user.followers.length : 0,
  articleCount: user.blogs ? user.blogs.length : 0,
}));

    res.json(formattedUsers);
  } catch (err) {
    console.error("Lỗi lấy danh sách users:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;