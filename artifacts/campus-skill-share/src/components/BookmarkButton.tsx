import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  postId: string;
}

export function BookmarkButton({ postId }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch initial bookmark status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/bookmarks/${postId}/status`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setBookmarked(data.bookmarked);
        }
      } catch (e) {
        console.error("Failed to fetch bookmark status", e);
      }
    };
    fetchStatus();
  }, [postId]);

  const toggleBookmark = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookmarks/${postId}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } catch (e) {
      console.error("Bookmark error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors group"
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark
        className={`w-4 h-4 transition-colors ${
          bookmarked ? "fill-primary text-primary" : "group-hover:text-primary"
        }`}
      />
    </button>
  );
}
