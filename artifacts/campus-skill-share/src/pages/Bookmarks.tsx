import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { format } from "date-fns";
import { Bookmark, ArrowLeft } from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";

interface BookmarkedPost {
  id: string;
  title: string;
  description: string;
  category: string;
  availability: string | null;
  priceRate: string | null;
  university: string | null;
  imageUrl: string | null;
  createdAt: string;
  bookmarkedAt: string;
  author: {
    id: string;
    displayName: string;
    profileImageUrl: string | null;
  };
}

export default function BookmarksPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/bookmarks", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPosts(data.posts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) return null;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-12 bg-card rounded-xl"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-card rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/feed"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Feed
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Bookmark className="w-6 h-6 text-primary" />
        Saved Posts
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Posts you've bookmarked for later.
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
          <Bookmark className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <h3 className="text-lg font-bold font-display">No bookmarks yet</h3>
          <p className="text-muted-foreground mt-2">
            Start saving posts you want to come back to.
          </p>
          <Link
            href="/feed"
            className="mt-6 inline-block text-primary font-semibold hover:underline"
          >
            Browse the feed →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="block bg-card border border-border rounded-xl p-5 hover:border-primary transition-all hover:shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <CategoryBadge
                  category={post.category}
                  className="px-2 py-0.5 text-xs"
                />
                <span className="text-xs text-muted-foreground">
                  Saved {format(new Date(post.bookmarkedAt), "MMM d, yyyy")}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {post.description}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span>By {post.author.displayName}</span>
                {post.university && (
                  <>
                    <span>•</span>
                    <span>{post.university}</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
