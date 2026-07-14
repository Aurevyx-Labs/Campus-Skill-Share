import { Link, useLocation } from "wouter";
import { Home, Search, Plus, MessageSquare, User } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location === "/" || location === "/feed";
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/40 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Home */}
        <Link
          to="/feed"
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
            isActive("/feed") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        {/* Discover */}
        <Link
          to="/users"
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
            isActive("/users") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Discover</span>
        </Link>

        {/* Create (Floating) */}
        <button
          onClick={() => {
            // We'll implement the create modal later
            alert("Create modal coming soon!");
          }}
          className="flex items-center justify-center w-12 h-12 -mt-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Chats */}
        <Link
          to="/chats"
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
            isActive("/chats") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chats</span>
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
            isActive("/profile") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
