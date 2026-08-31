import React from "react";
import { LogIn, LogOut, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, logOut } from "@/lib/firebase";
import { useAuthUser } from "@/lib/auth/use-firebase-auth";
import { toast } from "sonner";

export function FirebaseAuthButton() {
  const { user, loading } = useAuthUser();

  const handleSignIn = async () => {
    try {
      const u = await signInWithGoogle();
      toast.success("Signed in with Google", {
        description: `Welcome, ${u.displayName || u.email}! Your missions and memories are now synced with Cloud Firestore.`,
      });
    } catch (err: unknown) {
      console.error(err);
      toast.error("Google Sign-In failed", {
        description: err instanceof Error ? err.message : "Authentication error",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      toast.info("Signed out", {
        description: "Local data is kept safely in your browser.",
      });
    } catch (err: unknown) {
      console.error(err);
      toast.error("Sign-out error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-xs text-muted">
        <span className="size-2 rounded-full bg-accent animate-ping" />
        <span>Authenticating...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={handleSignIn}
        className="flex items-center gap-2 border-border bg-surface-2 hover:bg-surface text-fg font-medium"
      >
        <LogIn className="size-3.5 text-accent" />
        <span className="font-mono text-xs">Sign in with Google</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="size-5 rounded-full object-cover border border-white/20"
            referrerPolicy="no-referrer"
          />
        ) : (
          <User className="size-4 text-muted" />
        )}
        <span className="max-w-[110px] truncate font-medium text-fg">
          {user.displayName || user.email?.split("@")[0]}
        </span>
        <span className="inline-flex items-center gap-0.5 rounded bg-pass/10 px-1 py-0.2 text-[9px] font-mono uppercase text-pass border border-pass/20">
          <Sparkles className="size-2" />
          Cloud Sync
        </span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleSignOut}
        title="Sign Out"
        className="h-8 px-2 text-muted hover:text-fg"
      >
        <LogOut className="size-3.5" />
      </Button>
    </div>
  );
}
