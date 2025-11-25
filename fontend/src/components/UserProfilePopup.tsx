// src/components/UserProfilePopup.tsx
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Users, Calendar } from "lucide-react";

interface UserProfilePopupProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFollow: () => void;
  isFollowing: boolean;
}

// ĐỔI TỪ export default → export const UserProfilePopup
export const UserProfilePopup = ({
  user,
  open,
  onOpenChange,
  onFollow,
  isFollowing,
}: UserProfilePopupProps) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white dark:bg-neutral-900">
        {/* Banner */}
        <div className="h-40 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x" />

        <div className="relative px-8 pb-8">
          {/* Avatar căn giữa */}
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
            <Avatar className="h-40 w-40 ring-8 ring-white shadow-2xl rounded-3xl">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-7xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                {user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="mt-28 text-center space-y-3">
            <h2 className="text-4xl font-bold">{user.name}</h2>
            <p className="text-2xl text-muted-foreground">
              @{user.username || user.name?.toLowerCase().replace(/\s/g, "")}
            </p>

            {user.bio ? (
              <p className="text-foreground leading-relaxed text-xl opacity-90 mt-4 max-w-md mx-auto">
                {user.bio}
              </p>
            ) : (
              <p className="italic text-muted-foreground mt-4 text-xl">Chưa có tiểu sử</p>
            )}

            <div className="flex justify-center gap-12 mt-6 text-lg">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-2xl">
                  {user.followerCount?.toLocaleString() || 0}
                </span>
                <span className="text-muted-foreground">người theo dõi</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-green-600" />
                <span className="text-muted-foreground text-2xl">
                  Tham gia {new Date(user.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            <Button
              onClick={onFollow}
              className={`w-full mt-8 py-7 text-2xl font-bold rounded-xl transition-all duration-300 shadow-md
                ${isFollowing
                  ? "bg-neutral-200 dark:bg-neutral-700 hover:bg-red-100 hover:text-red-600"
                  : "bg-blue-600 hover:bg-blue-700"}
              `}
            >
              {isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};