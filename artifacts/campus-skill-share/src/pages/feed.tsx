import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  useListPosts,
  getListPostsQueryKey,
  useGetPostStats,
  getGetPostStatsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "../hooks/useAuth";
import { Search, Plus, Clock, Share2, Crown } from "lucide-react"; // ✅ removed MapPin
import { CategoryBadge } from "@/components/CategoryBadge";
import { LikeButton } from "@/components/LikeButton";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useTab } from "../context/TabContext";
import type { TabKey } from "../context/TabContext"; // ✅ import type

// ✅ Define tabs
const TABS = [
  { key: "all", label: "🏠 All", type: null },
  { key: "skills", label: "📚 Skills", type: "skill" },
  { key: "marketplace", label: "🛒 Marketplace", type: "product" },
  { key: "freelance", label: "💼 Freelance", type: "service" },
  { key: "study", label: "📖 Study Materials", type: "study" },
  { key: "campus", label: "🏠 Campus", type: "campus" },
];

const BASE_CATEGORIES = [
  "Tutoring",
  "Design",
  "Music",
  "Tech",
  "Language",
  "Other",
  "Textbooks",
  "Gadgets",
  "Fashion",
  "Hostel Essentials",
  "Tutor Booking",
  "Designers",
  "Programmers",
  "Photographers",
  "Makeup Artists",
  "Tailors",
  "Barbers",
];

export default function FeedPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { activeTab, setActiveTab } = useTab();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/");
  }, [authLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const activeType = TABS.find((t) => t.key === activeTab)?.type;

  const queryParams = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(category !== "All" && { category }),
    ...(activeType && { type: activeType }),
  };

  const { data, isLoading } = useListPosts(queryParams, {
    query: {
      enabled: isAuthenticated,
      queryKey: getListPostsQueryKey(queryParams),
    },
  });

  const { data: stats } = useGetPostStats({
    query: { enabled: isAuthenticated, queryKey: getGetPostStatsQueryKey() },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", emoji: "🌅" };
    if (hour < 17) return { text: "Good afternoon", emoji: "☀️" };
    return { text: "Good evening", emoji: "🌙" };
  };
  const greeting = getGreeting();

  const handleShare = async (postId: string, title: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this post: ${title}`,
          url: url,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed", error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("✅ Link copied to clipboard!");
      } catch (error) {
        alert("Could not copy link. Please copy the URL manually.");
      }
    }
  };

  if (authLoading || !isAuthenticated) return null;

  const getCategoryCount = (catName: string) => {
    const stat = stats?.categories.find((s) => s.category === catName);
    return stat ? stat.count : 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {greeting.emoji} {greeting.text}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's what your campus is sharing today.
          </p>
        </div>
        <Link
          href="/post/new"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          Post Your Skill
        </Link>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Search skills (e.g. Calculus, Figma, Guitar)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          data-testid="input-search"
        />
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 hide-scrollbar snap-x border-b border-border/40">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)} // ✅ cast to TabKey
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-medium text-sm transition-colors snap-center ${
              activeTab === tab.key
                ? "bg-foreground text-background shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category filter (optional) */}
      <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 hide-scrollbar snap-x">
        <button
          onClick={() => setCategory("All")}
          className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-medium text-sm transition-colors snap-center flex items-center gap-2 ${
            category === "All"
              ? "bg-foreground text-background shadow-sm"
              : "bg-card border border-border text-foreground hover:bg-secondary"
          }`}
        >
          All
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              category === "All"
                ? "bg-background/20"
                : "bg-secondary-foreground/10"
            }`}
          >
            {stats?.total || 0}
          </span>
        </button>
        {BASE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-medium text-sm transition-colors snap-center flex items-center gap-2 ${
              category === c
                ? "bg-foreground text-background shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-secondary"
            }`}
          >
            {c}
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                category === c
                  ? "bg-background/20"
                  : "bg-secondary-foreground/10"
              }`}
            >
              {getCategoryCount(c)}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-card/50 border border-border rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      ) : data?.posts.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold font-display">No skills found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            We couldn't find any skills matching your search. Why not be the
            first to post one?
          </p>
          <button
            onClick={() => setLocation("/post/new")}
            className="mt-6 text-primary font-semibold hover:underline"
          >
            Post a skill →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.posts.map((post: any, index: number) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="group block bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              style={{
                animationFillMode: "both",
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Image using cast */}
              {post.imageUrl && (
                <div className="mb-4 -mt-6 -mx-6 rounded-t-2xl overflow-hidden max-h-48 bg-secondary/20">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <CategoryBadge category={post.category} />
                {post.priceRate && (
                  <span className="font-semibold text-primary text-sm bg-primary/10 px-2 py-0.5 rounded-md">
                    {post.priceRate}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-display font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                {post.description}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <LikeButton postId={post.id} />
                <BookmarkButton postId={post.id} />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShare(post.id, post.title);
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Share post"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                    {post.author.profileImageUrl ? (
                      <img
                        src={post.author.profileImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">
                        {post.author.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground truncate max-w-[120px] flex items-center gap-1">
                    {post.author.displayName}
                    {(post.author as any).role === "admin" && (
                      <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    )}
                  </span>
                </div>
                {post.availability && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[80px]">
                      {post.availability}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
