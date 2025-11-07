"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@civic/auth/react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";
import XLogo from "@/components/XLogo";
import { isAuthInProgress, setAuthInProgress } from "@/lib/authLock";

export default function SignInPage() {
  const signingInRef = useRef(false);
  const hasInitRef = useRef(false);
  
  // Get user hook - MUST be called unconditionally before any returns
  const { signIn, isLoading: authLoading, user } = useUser();
  
  // Initialize once on mount - prevent repeated calls
  useEffect(() => {
    if (!hasInitRef.current) {
      hasInitRef.current = true;
      // Clear any stuck auth locks when page loads (if expired)
      // This helps if user navigates back to signin page
    }
  }, []);
  
  // Define callback BEFORE any conditional returns (hooks must be called in same order)
  const doSignIn = useCallback(() => {
    // Prevent multiple simultaneous sign-in attempts
    if (signingInRef.current || isAuthInProgress()) {
      console.log("Sign-in already in progress, skipping...");
      return;
    }
    
    if (!signIn) {
      console.error("signIn function not available");
      return;
    }
    
    signingInRef.current = true;
    setAuthInProgress(true);
    
    console.log("Starting sign-in process");
    // Use redirect mode instead of iframe to avoid blocking issues
    signIn({ displayMode: "redirect" })
      .then(() => {
        console.log("Sign-in completed successfully");
        // Don't reset here - let redirect happen
      })
      .catch((error: unknown) => {
        console.error("Sign-in failed:", error);
        signingInRef.current = false;
        setAuthInProgress(false);
      });
      // Removed finally - let the redirect handle cleanup
  }, [signIn]);
  
  // If user is already signed in, redirect to investors page
  useEffect(() => {
    if (user && !authLoading) {
      // User is signed in - redirect to investors page
      window.location.href = "/investors";
    }
  }, [user, authLoading]);
  
  // Show loading state only if auth is actively loading (not undefined/null check)
  if (authLoading === true) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#1a1a1a]">
        <div className="animate-pulse text-sm text-white/60">Initializing authentication...</div>
      </div>
    );
  }
  
  // Guard against signIn not being available
  if (!signIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#1a1a1a]">
        <div className="text-center space-y-4">
          <p className="text-sm text-red-400 mb-2">Authentication provider not available</p>
          <p className="text-xs text-white/50">Please refresh the page or check your browser console.</p>
          <Link href="/" className="text-sm text-orange-500 underline block">Go back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#1a1a1a]">
      <Link href="/" className="absolute top-4 left-4 inline-flex items-center gap-2 text-white/80 hover:text-orange-500 transition-colors">
        <span className="text-lg">←</span>
        <span className="font-medium">Back</span>
      </Link>
      <GlassCard className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-orange-500/20">
              <XLogo className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Sign In</h1>
          <p className="text-white/70">
            Sign in with X to create and manage your investor profile
          </p>

          <Button onClick={doSignIn} className="w-full">
            Sign in with X
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
