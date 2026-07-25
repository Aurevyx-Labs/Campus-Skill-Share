import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth";
import {
  useGetMyProfile,
  getGetMyProfileQueryKey,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  BookOpen,
  Moon,
  LogOut,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: profile, refetch } = useGetMyProfile({
    query: {
      enabled: true,
      queryKey: getGetMyProfileQueryKey(),
    },
  });
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [university, setUniversity] = useState("");
  const [bio, setBio] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setUniversity((profile as any).university || "");
      setBio((profile as any).bio || "");
    }
  }, [profile]);

  // Load dark mode from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("skillet-theme");
    setDarkMode(stored === "dark");
  }, []);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("skillet-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("skillet-theme", "light");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ displayName, university, bio }),
      });
      if (res.ok) {
        toast({
          title: "Settings saved",
          description: "Your profile has been updated.",
        });
        refetch();
      } else {
        const data = await res.json();
        toast({
          title: "Failed to save",
          description: data.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/feed"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                University
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Tell others about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-sm">Dark Mode</span>
            <button
              onClick={toggleDarkMode}
              className="relative w-12 h-6 rounded-full bg-secondary transition-colors duration-200 focus:outline-none"
              style={{ backgroundColor: darkMode ? "#6366F1" : "#CBD5E1" }}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Account
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <div className="text-sm text-muted-foreground px-4 py-2 rounded-xl bg-secondary/30">
                {user?.email || "Not set"}
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to log out?")) {
                  logout();
                }
              }}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="w-5 h-5" /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
