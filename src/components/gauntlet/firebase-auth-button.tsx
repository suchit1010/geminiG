import React, { useState } from "react";
import { LogIn, LogOut, User, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, logOut } from "@/lib/firebase";
import { useAuthUser } from "@/lib/auth/use-firebase-auth";
import { UnauthorizedDomainModal } from "./unauthorized-domain-modal";
import { toast } from "sonner";

export function FirebaseAuthButton() {
  const { user, loading, isGuest, setGuestMode, clearGuestMode } = useAuthUser();
  const [domainModalOpen, setDomainModalOpen] = useState(false);

  const handleSignIn = async () => {
    try {
      const u = await signInWithGoogle();
      clearGuestMode();
      toast.success("Signed in with Google", {
        description: `Welcome, ${u.displayName || u.email}! Your missions and memories are now synced with Cloud Firestore.`,
      });
    } catch (err: unknown) {
      console.error("Firebase Sign-in error:", err);
      const code = (err as { code?: string })?.code || "";
      const msg = err instanceof Error ? err.message : String(err);

      if (code === "auth/unauthorized-domain" || msg.includes("unauthorized-domain")) {
        setDomainModalOpen(true);
        toast.error("Firebase Domain Authorization Required", {
          description: "This domain must be added to Firebase Authorized Domains.",
        });
      } else if (code === "auth/popup-closed-by-user") {
        toast.info("Google Sign-In popup was closed.");
      } else if (code === "auth/popup-blocked") {
        toast.error("Sign-in popup blocked by browser", {
          description: "Please allow popups for this site to sign in with Google.",
        });
      } else {
        toast.error("Google Sign-In failed", {
          description: msg,
        });
      }
    }
  };

  const handleSignOut = async () => {
    try {
      if (isGuest) {
        clearGuestMode();
      } else {
        await logOut();
      }
      toast.info("Signed out", {
        description: "Local mission data is preserved safely in your browser.",
      });
    } catch (err: unknown) {
      console.error(err);
      toast.error("Sign-out error");
    }
  };

  const handleContinueGuest = () => {
    setGuestMode(true);
    setDomainModalOpen(false);
    toast.success("Guest Mode Active", {
      description: "You can create and run autonomous agent missions in local browser storage.",
    });
  };

  return (
    <>
      {domainModalOpen && (
        <UnauthorizedDomainModal
          onClose={() => setDomainModalOpen(false)}
          onContinueGuest={handleContinueGuest}
        />
      )}

      {loading ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-xs text-muted">
          <span className="size-2 rounded-full bg-accent animate-ping" />
          <span>Authenticating...</span>
        </div>
      ) : !user && !isGuest ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSignIn}
          className="flex items-center gap-2 border-border bg-surface-2 hover:bg-surface text-fg font-medium"
        >
          <LogIn className="size-3.5 text-accent" />
          <span className="font-mono text-xs">Sign in with Google</span>
        </Button>
      ) : isGuest ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs">
            <UserCheck className="size-4 text-accent" />
            <span className="font-medium text-fg">Guest User</span>
            <span className="inline-flex items-center gap-0.5 rounded bg-surface px-1 py-0.2 text-[9px] font-mono uppercase text-muted border border-border">
              Local Mode
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSignIn}
            title="Switch to Google Cloud Sync"
            className="h-8 px-2 text-xs text-accent hover:bg-accent/10"
          >
            <LogIn className="size-3.5 mr-1" />
            Sync Cloud
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSignOut}
            title="Reset Guest"
            className="h-8 px-2 text-muted hover:text-fg"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      ) : (
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
      )}
    </>
  );
}
