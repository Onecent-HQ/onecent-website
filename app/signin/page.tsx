"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@civic/auth/react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";
import XLogo from "@/components/XLogo";
import Logo from "@/components/Logo";
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="animate-pulse text-sm text-white/60">Initializing authentication...</div>
      </div>
    );
  }
  
  // Guard against signIn not being available
  if (!signIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="text-center space-y-4">
          <p className="text-sm text-white mb-2">Authentication provider not available</p>
          <p className="text-xs text-white/50">Please refresh the page or check your browser console.</p>
          <Link href="/" className="text-sm text-white underline block">Go back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-black">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
        {/* Subtle gradient overlay for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              <Logo logoHeight={36} />
              <div className="h-6 w-px bg-white/10" />
              <Link 
                href="/"
                className="group flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-all duration-200"
              >
                <span className="text-lg transition-transform group-hover:-translate-x-0.5">←</span>
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <GlassCard className="max-w-md w-full mt-20">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-white/10">
              <XLogo className="w-8 h-8 text-white" />
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
