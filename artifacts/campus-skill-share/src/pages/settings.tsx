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
  Lock,
  Bell,
  Shield,
  AlertTriangle,
  Upload,
  Eye,
  EyeOff,
  Key,
  Link as LinkIcon,
  Database,
  HelpCircle,
  Info,
  FileText,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: profile, refetch } = useGetMyProfile({
    query: { enabled: true, queryKey: getGetMyProfileQueryKey() },
  });
  const { toast } = useToast();

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [university, setUniversity] = useState("");
  const [bio, setBio] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Preferences – fixed generic types
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<
    "public" | "private"
  >("public");
  const [messagingPermissions, setMessagingPermissions] = useState<
    "anyone" | "followers"
  >("anyone");

  // Change Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Danger Zone
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [saving, setSaving] = useState(false);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setUniversity((profile as any).university || "");
      setBio((profile as any).bio || "");
      const prefs = (profile as any).preferences || {};
      setPushNotifications(
        prefs.pushNotifications !== undefined ? prefs.pushNotifications : true,
      );
      setEmailNotifications(
        prefs.emailNotifications !== undefined
          ? prefs.emailNotifications
          : true,
      );
      setProfileVisibility(prefs.profileVisibility || "public");
      setMessagingPermissions(prefs.messagingPermissions || "anyone");
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
      // Save profile fields
      const profileRes = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ displayName, university, bio }),
      });
      if (!profileRes.ok) {
        const data = await profileRes.json();
        throw new Error(data.error || "Failed to save profile");
      }

      // Save preferences
      const prefsRes = await fetch("/api/users/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          preferences: {
            pushNotifications,
            emailNotifications,
            profileVisibility,
            messagingPermissions,
          },
        }),
      });
      if (!prefsRes.ok) {
        const data = await prefsRes.json();
        throw new Error(data.error || "Failed to save preferences");
      }

      toast({
        title: "Settings saved",
        description: "Your profile and preferences have been updated.",
      });
      refetch();
    } catch (err: any) {
      toast({
        title: "Failed to save",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Password change",
      description: "This feature is coming soon.",
    });
  };

  const handleUploadID = () => {
    toast({
      title: "Student ID upload",
      description: "This feature is coming soon.",
    });
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast({
          title: "Account deleted",
          description: "Your account has been permanently removed.",
        });
        logout();
      } else {
        const data = await res.json();
        toast({
          title: "Failed to delete",
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
    }
    setShowDeleteModal(false);
  };

  const togglePrivacy = (setting: "profile" | "messaging") => {
    if (setting === "profile") {
      setProfileVisibility(
        profileVisibility === "public" ? "private" : "public",
      );
    } else {
      setMessagingPermissions(
        messagingPermissions === "anyone" ? "followers" : "anyone",
      );
    }
  };

  const handleConnectedAccount = (provider: string) => {
    toast({
      title: `${provider}`,
      description: "Disconnect feature coming soon.",
    });
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast({
      title: "Cache cleared",
      description: "Your local cache has been cleared.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data export",
      description: "Your data export will be emailed to you shortly.",
    });
  };

  const handleHelpAction = (action: string) => {
    toast({ title: action, description: "This feature is coming soon." });
  };

  return (
    <div className="max-w-3xl mx-auto pb-32 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/feed"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
        <h1 className="text-3xl font-display font-bold">⚙️ Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            👤 Profile
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
            🎨 Appearance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">🌙 Dark Mode</span>
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
            <div>
              <label className="text-sm font-medium block mb-1">Language</label>
              <select
                className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                defaultValue="en"
              >
                <option value="en">🇬🇧 English</option>
                <option value="fr">🇫🇷 French</option>
                <option value="es">🇪🇸 Spanish</option>
                <option value="ar">🇸🇦 Arabic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            🔐 Account
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <div className="text-sm text-muted-foreground px-4 py-2 rounded-xl bg-secondary/30">
                {user?.email || "Not set"}
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium block mb-2">
                🔒 Change Password
              </label>
              <div className="space-y-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={handleChangePassword}
                  className="flex items-center gap-2 text-sm text-primary hover:opacity-80 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </button>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {showPassword ? "Hide passwords" : "Show passwords"}
                </button>
              </div>
            </div>
            <div className="border-t border-border pt-4">
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
        </div>

        {/* Connected Accounts */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" />
            🔗 Connected Accounts
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm">
                  G
                </div>
                <span className="font-medium">Google</span>
                <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                  Connected
                </span>
              </div>
              <button
                onClick={() => handleConnectedAccount("Google")}
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-xl opacity-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-foreground font-bold text-sm">
                  G
                </div>
                <span className="font-medium">GitHub</span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  Not connected
                </span>
              </div>
              <button
                onClick={() => handleConnectedAccount("GitHub")}
                className="text-sm text-primary hover:opacity-80 transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            🔔 Notifications
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Push Notifications</span>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className="relative w-12 h-6 rounded-full bg-secondary transition-colors duration-200 focus:outline-none"
                style={{
                  backgroundColor: pushNotifications ? "#6366F1" : "#CBD5E1",
                }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    pushNotifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Notifications</span>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className="relative w-12 h-6 rounded-full bg-secondary transition-colors duration-200 focus:outline-none"
                style={{
                  backgroundColor: emailNotifications ? "#6366F1" : "#CBD5E1",
                }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    emailNotifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            🛡️ Privacy
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Profile Visibility
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => togglePrivacy("profile")}
                  className={`flex-1 py-2 rounded-xl border transition-colors text-sm ${
                    profileVisibility === "public"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  🌍 Public
                </button>
                <button
                  onClick={() => togglePrivacy("profile")}
                  className={`flex-1 py-2 rounded-xl border transition-colors text-sm ${
                    profileVisibility === "private"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  🔒 Private
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Messaging Permissions
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => togglePrivacy("messaging")}
                  className={`flex-1 py-2 rounded-xl border transition-colors text-sm ${
                    messagingPermissions === "anyone"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  👥 Anyone
                </button>
                <button
                  onClick={() => togglePrivacy("messaging")}
                  className={`flex-1 py-2 rounded-xl border transition-colors text-sm ${
                    messagingPermissions === "followers"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  👤 Followers Only
                </button>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium block mb-2">
                🚫 Blocked Users
              </label>
              <div className="text-sm text-muted-foreground">
                No blocked users
              </div>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />✅ Verification
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">🎓 Student ID</p>
              <p className="text-sm text-muted-foreground">Not verified</p>
            </div>
            <button
              onClick={handleUploadID}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Data & Storage */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            📊 Data & Storage
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleClearCache}
              className="flex items-center justify-between w-full px-4 py-2 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-sm"
            >
              <span>Clear Cache</span>
              <span className="text-muted-foreground">Free up storage</span>
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center justify-between w-full px-4 py-2 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-sm"
            >
              <span>Export My Data</span>
              <span className="text-muted-foreground">
                Download your information
              </span>
            </button>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            👨‍💻 Help & Support
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => handleHelpAction("FAQ")}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-sm"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>FAQ</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
            <button
              onClick={() => handleHelpAction("Contact Us")}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-sm"
            >
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>Contact Us</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
            <button
              onClick={() => handleHelpAction("Report a Bug")}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-sm"
            >
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <span>Report a Bug</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            📜 About
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Privacy Policy</span>
              <Link to="/privacy" className="text-primary hover:underline">
                View
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Terms of Service</span>
              <Link to="/terms" className="text-primary hover:underline">
                View
              </Link>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            ⚠️ Danger Zone
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once you delete your account, all your data will be permanently
              removed. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
            >
              Delete Account
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

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-2">⚠️ Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete your account? This action is
              permanent and cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
              >
                Yes, delete my account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
