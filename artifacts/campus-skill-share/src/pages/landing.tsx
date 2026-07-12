import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth";
import {
  BookOpen,
  Users,
  MessageCircle,
  Sparkles,
  ArrowRight,
  GraduationCap,
  PenTool,
  Music,
  Laptop,
  Globe,
  Star,
  UserPlus,
  FileText,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== HERO ===== */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-primary/20">
          <Sparkles className="w-4 h-4" />
          University students only
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold leading-tight tracking-tight">
          Trade Skills. <span className="text-primary">Build Your</span>
          <br />
          Campus Network.
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-6 leading-relaxed">
          Connect with peers on your campus to exchange knowledge, learn new
          skills, and grow together — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
          {isAuthenticated ? (
            <Link
              href="/feed"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25"
            >
              Go to Feed <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <button
              onClick={login}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <Link
            href="/users"
            className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:bg-secondary/80 transition-all border border-border"
          >
            Explore People <Users className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="px-6 py-20 bg-secondary/30 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Get started in 3 simple steps and unlock the power of your campus
            community.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <UserPlus className="w-8 h-8 text-primary" />,
                title: "Create Your Profile",
                desc: "Sign up with Google and tell the community what skills you have to offer.",
              },
              {
                icon: <FileText className="w-8 h-8 text-primary" />,
                title: "Post or Find Skills",
                desc: "Share your expertise or browse posts from students who need your help.",
              },
              {
                icon: <MessageCircle className="w-8 h-8 text-primary" />,
                title: "Connect & Chat",
                desc: "Message each other directly and make campus collaborations happen.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-8 text-center hover:border-primary/30 transition-all hover:shadow-md"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POPULAR CATEGORIES ===== */}
      <section className="px-6 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            What You Can Learn or Teach
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Browse the most popular skill categories on Skillet.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: <GraduationCap className="w-5 h-5" />, name: "Tutoring" },
              { icon: <PenTool className="w-5 h-5" />, name: "Design" },
              { icon: <Music className="w-5 h-5" />, name: "Music" },
              { icon: <Laptop className="w-5 h-5" />, name: "Tech" },
              { icon: <Globe className="w-5 h-5" />, name: "Languages" },
              { icon: <BookOpen className="w-5 h-5" />, name: "Textbooks" },
              { icon: <Star className="w-5 h-5" />, name: "Fashion" },
            ].map((cat) => (
              <div
                key={cat.name}
                className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="text-primary flex justify-center mb-2">
                  {cat.icon}
                </div>
                <span className="text-sm font-medium">{cat.name}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/feed"
              className="text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              View all categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="px-6 py-20 bg-primary/5 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to <span className="text-primary">share your skills</span>?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join the campus community that's trading talents and building
            connections.
          </p>

          {isAuthenticated ? (
            <Link
              href="/post/new"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25"
            >
              Post Your Skill <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <button
              onClick={login}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25"
            >
              Sign Up Free <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border bg-background/80 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-medium">Skillet</span>
            <span>• Campus Skill Share</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/feed"
              className="hover:text-foreground transition-colors"
            >
              Feed
            </Link>
            <Link
              href="/post/new"
              className="hover:text-foreground transition-colors"
            >
              Post
            </Link>
            <Link
              href="/users"
              className="hover:text-foreground transition-colors"
            >
              People
            </Link>
          </div>
          <span>© 2026 Skillet. Made for students.</span>
        </div>
      </footer>
    </div>
  );
}
