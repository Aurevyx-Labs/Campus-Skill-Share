import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  postId: string;
}

export function LikeButton({ postId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch initial like status and count
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch(`/api/likes/${postId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setLiked(data.liked);
          setCount(data.total);
        }
      } catch (e) {
        console.error("Failed to fetch likes", e);
      }
    };
    fetchLikes();
  }, [postId]);

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/likes/${postId}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setCount((prev) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch (e) {
      console.error("Like error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors group"
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          liked ? "fill-red-500 text-red-500" : "group-hover:text-red-400"
        }`}
      />
      <span>{count}</span>
    </button>
  );
}
