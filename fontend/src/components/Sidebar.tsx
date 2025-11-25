// src/components/Sidebar.tsx – BẤM AVATAR TRONG SIDEBAR → HIỆN POPUP PROFILE SIÊU ĐẸP!!!
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { FollowButton } from "./FollowButton";
import { UserPlus, Users } from "lucide-react";
import { UserProfilePopup } from "./UserProfilePopup"; // ← IMPORT POPUP

interface Author {
  _id: string;
  name: string;
  avatar?: string;
  followerCount: number;
  bio?: string;
  username?: string;
  createdAt?: string;
}

interface Tag {
  name: string;
  count: number;
}

interface SidebarProps {
  authors?: Author[];
  tags?: Tag[];
  currentUserId?: string;
  onFindFriends?: () => void;
}

export function Sidebar({ authors = [], tags = [], currentUserId = "", onFindFriends }: SidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [localAuthors, setLocalAuthors] = useState<Author[]>(authors);

  // Popup state
  const [selectedUser, setSelectedUser] = useState<Author | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  // Cập nhật follower realtime
  useEffect(() => {
    const handleFollowChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ userId: string; following: boolean }>;
      const userId = customEvent.detail?.userId;
      const following = customEvent.detail?.following;

      if (!userId) return;

      setLocalAuthors(prev =>
        prev.map(author =>
          author._id === userId
            ? {
                ...author,
                followerCount: Math.max(0, following ? author.followerCount + 1 : author.followerCount - 1)
              }
            : author
        )
      );

      // Cập nhật popup nếu đang mở
      if (selectedUser?._id === userId) {
        setSelectedUser(prev => prev ? {
          ...prev,
          followerCount: Math.max(0, following ? prev.followerCount + 1 : prev.followerCount - 1)
        } : null);
      }
    };

    window.addEventListener("followChanged", handleFollowChange as EventListener);
    return () => window.removeEventListener("followChanged", handleFollowChange as EventListener);
  }, [selectedUser]);

  useEffect(() => {
    setLocalAuthors(authors);
  }, [authors]);

  const topAuthors = [...localAuthors]
    .sort((a, b) => b.followerCount - a.followerCount)
    .slice(0, 5);

  // Auto scroll
  useEffect(() => {
    if (topAuthors.length <= 3 || !isAutoPlaying || !scrollRef.current) return;

    const interval = setInterval(() => {
      const container = scrollRef.current!;
      const cardWidth = 272;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft + cardWidth >= maxScroll - 50) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [topAuthors.length, isAutoPlaying]);

  const handleAvatarClick = (author: Author) => {
    setSelectedUser(author);
    setPopupOpen(true);
  };

  const handleFollowFromPopup = async () => {
    if (!selectedUser) return;
    // Gọi lại API follow (có thể dùng FollowButton logic nếu cần)
    // Ở đây chỉ dispatch event để các component khác cập nhật
    const isCurrentlyFollowing = currentUserId && localAuthors.find(a => a._id === selectedUser._id)?.followerCount;
    window.dispatchEvent(new CustomEvent("followChanged", {
      detail: {
        userId: selectedUser._id,
        following: !isCurrentlyFollowing
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* TÁC GIẢ NỔI BẬT */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold">Tác giả nổi bật</h4>

            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1.5"
              onClick={onFindFriends}
            >
              <UserPlus className="h-4 w-4" />
              Thêm bạn bè
            </Button>
          </div>

          {topAuthors.length > 0 ? (
            <div
              ref={scrollRef}
              onScroll={() => setIsAutoPlaying(false)}
              className="overflow-x-auto scrollbar-hide -mx-6 px-6"
            >
              <div className="flex gap-5 pb-4">
                {topAuthors.map((author) => {
                  const isFollowing = false; // Bạn có thể thêm logic kiểm tra nếu cần
                  return (
                    <div
                      key={author._id}
                      className="flex-shrink-0 w-64 bg-card border rounded-xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                    >
                      <div className="flex gap-4">
                        {/* BẤM AVATAR → MỞ POPUP */}
                        <div
                          className="cursor-pointer transition-transform hover:scale-110"
                          onClick={() => handleAvatarClick(author)}
                        >
                          <Avatar className="h-16 w-16 ring-4 ring-background shadow-lg">
                            <AvatarImage src={author.avatar} alt={author.name} />
                            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                              {author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* BẤM TÊN CŨNG MỞ POPUP */}
                          <h5
                            className="font-bold text-base truncate group-hover:text-primary transition-colors cursor-pointer"
                            onClick={() => handleAvatarClick(author)}
                          >
                            {author.name}
                          </h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            {author.followerCount.toLocaleString()} người theo dõi
                          </p>
                          <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                            {author.bio || "Chưa có tiểu sử"}
                          </p>

                          <FollowButton
                            userId={author._id}
                            currentUserId={currentUserId}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Chưa có tác giả nào</p>
          )}
        </div>
      </Card>

      {/* CHỦ ĐỀ PHỔ BIẾN */}
      <Card className="p-6 border shadow-sm">
        <h4 className="text-lg font-bold mb-4">Chủ đề phổ biến</h4>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {tags.slice(0, 5).map((tag) => (
              <Badge
                key={tag.name}
                variant="secondary"
                className="px-4 py-2 text-sm font-medium rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all"
              >
                #{tag.name} <span className="ml-2 opacity-80">({tag.count})</span>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có chủ đề nào</p>
        )}
      </Card>

      {/* VỀ BLOGHUB */}
      <Card className="p-6 bg-muted/40 border">
        <h4 className="text-lg font-bold mb-3">Về BlogHub</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Nền tảng chia sẻ kiến thức chất lượng cao dành cho cộng đồng lập trình viên Việt Nam.
        </p>
        <Button variant="outline" className="w-full" size="sm">
          Tìm hiểu thêm
        </Button>
      </Card>

      {/* POPUP PROFILE – HIỆN KHI BẤM AVATAR/TÊN */}
      {selectedUser && (
        <UserProfilePopup
          user={selectedUser}
          open={popupOpen}
          onOpenChange={setPopupOpen}
          onFollow={handleFollowFromPopup}
          isFollowing={false} // Bạn có thể thêm logic kiểm tra nếu cần
        />
      )}
    </div>
  );
}