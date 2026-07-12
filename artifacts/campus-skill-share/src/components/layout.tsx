import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import {
  useGetMyProfile,
  getGetMyProfileQueryKey,
} from "@workspace/api-client-react";
import {
  BookOpen,
  LogOut,
  User,
  PlusCircle,
  MessageSquare,
  Menu,
  X,
  ChevronDown, // ✅ NEW
} from "lucide-react";
import { ChatbotWidget } from "../ChatbotWidget";

export function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, login, logout } = useAuth();
  const { data: profile } = useGetMyProfile({
    query: { enabled: isAuthenticated, queryKey: getGetMyProfileQueryKey() },
  });
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // ✅ NEW

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/feed"
            className="flex items-center gap-2 font-display text-xl font-bold"
          >
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Skillet</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/feed"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Feed
            </Link>
            <Link
              to="/post/new"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              New Post
            </Link>
            <Link
              to="/chats"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Chats
            </Link>
            <Link
              to="/users"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Explore People
            </Link>
            <Link
              to="/bookmarks"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Saved
            </Link>
            {profile?.role === "admin" && (
              <Link
                to="/admin"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* ✅ Settings Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition focus:outline-none"
                    aria-label="Open settings menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border overflow-hidden">
                      {profile?.profileImageUrl ? (
                        <img
                          src={profile.profileImageUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="hidden md:inline-block font-medium text-sm">
                      {profile?.displayName || user?.firstName || "Student"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary/50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Edit Profile
                      </Link>
                      <div className="border-t border-border my-1"></div>
                      <button
                        onClick={() => {
                          // Dark mode toggle will go here later
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary/50 transition-colors w-full text-left"
                      >
                        <span className="text-lg">🌙</span> Dark Mode (Coming
                        soon)
                      </button>
                      <div className="border-t border-border my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-secondary/50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={login}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link
                to="/feed"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Feed
              </Link>
              <Link
                to="/post/new"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                New Post
              </Link>
              <Link
                to="/chats"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Chats
              </Link>
              <Link
                to="/users"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Explore People
              </Link>
              <Link
                to="/bookmarks"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Saved
              </Link>
              {profile?.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Profile
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      <ChatbotWidget />
    </div>
  );
}
