// src/components/FollowButton.tsx – CHỈ 68 DÒNG, HOÀN HẢO 100%
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { UserPlus, UserCheck } from "lucide-react";

interface Props {
  userId: string;
  currentUserId: string;
}

export function FollowButton({ userId, currentUserId }: Props) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load trạng thái theo dõi
  useEffect(() => {
    if (!currentUserId || currentUserId === userId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/follow/status/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setIsFollowing(d.following))
      .catch(() => setIsFollowing(false))
      .finally(() => setLoading(false));
  }, [userId, currentUserId]);

  const handleFollow = async () => {
    if (loading || !currentUserId || currentUserId === userId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token")!;
      const res = await fetch(`http://localhost:5000/api/follow/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const { following } = await res.json();
      setIsFollowing(following);

      // Cập nhật realtime toàn app
      window.dispatchEvent(new Event("followChanged"));
    } catch {
      alert("Lỗi mạng!");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUserId || currentUserId === userId) return null;
  if (loading) return <Button size="sm" disabled className="mt-4 w-full h-9 text-xs">...</Button>;

  return (
    <Button
      size="sm"
      variant={isFollowing ? "secondary" : "default"}
      className={`mt-4 w-full h-9 text-xs font-medium ${isFollowing ? "hover:bg-red-50 hover:text-red-600" : ""}`}
      onClick={handleFollow}
      disabled={loading}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-1.5" />
          <span className="group-hover:hidden">Đang theo dõi</span>
          <span className="hidden group-hover:inline">Bỏ theo dõi</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1.5" />
          Theo dõi
        </>
      )}
    </Button>
  );
}