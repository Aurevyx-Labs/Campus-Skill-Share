import { Link, useLocation } from "wouter";
import { Home, Search, Plus, MessageSquare, User, X, BookOpen, ShoppingBag, Briefcase, MapPin, Calendar, FileText } from "lucide-react";
import { useState } from "react";

export function BottomNav() {
  const [location] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location === "/" || location === "/feed";
    return location.startsWith(path);
  };

  const createOptions = [
    { icon: BookOpen, label: "Skill", href: "/post/new?type=skill", color: "bg-blue-500" },
    { icon: ShoppingBag, label: "Product", href: "/post/new?type=product", color: "bg-green-500" },
    { icon: Briefcase, label: "Service", href: "/post/new?type=service", color: "bg-purple-500" },
    { icon: MapPin, label: "Lost & Found", href: "/post/new?type=lost", color: "bg-orange-500" },
    { icon: Calendar, label: "Event", href: "/post/new?type=event", color: "bg-pink-500" },
    { icon: FileText, label: "Job", href: "/post/new?type=job", color: "bg-red-500" },
  ];

  return (
    <>
      {/* ✅ Responsive bottom nav — full width on mobile, floating pill on desktop */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center md:bottom-4">
        <div className="w-full max-w-md mx-4 bg-background border border-border/40 rounded-2xl shadow-lg flex items-center justify-around h-14 px-2 md:max-w-sm lg:max-w-md">
          {/* Home */}
          <Link
            to="/feed"
            className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
              isActive("/feed") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="hidden md:block">Home</span>
          </Link>

          {/* Discover */}
          <Link
            to="/users"
            className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
              isActive("/users") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="hidden md:block">Discover</span>
          </Link>

          {/* Create (Floating) */}
          <button
            onClick={() => setIsCreateOpen(true)}
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
            <span className="hidden md:block">Chats</span>
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
              isActive("/profile") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="hidden md:block">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center">
          <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create New</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {createOptions.map((option) => (
                <Link
                  key={option.label}
                  to={option.href}
                  onClick={() => setIsCreateOpen(false)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary/50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full ${option.color} text-white flex items-center justify-center`}>
                    <option.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-center">{option.label}</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}