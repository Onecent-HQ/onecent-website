"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useUser } from "@civic/auth/react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";
import XLogo from "@/components/XLogo";

export default function SignInPage() {
  const { signIn } = useUser();
  
  const doSignIn = useCallback(() => {
    console.log("Starting sign-in process");
    signIn()
      .then(() => {
        console.log("Sign-in completed successfully");
      })
      .catch((error: unknown) => {
        console.error("Sign-in failed:", error);
      });
  }, [signIn]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Link href="/investors" className="absolute top-4 left-4 inline-flex items-center gap-2 text-gray-600 hover:text-accent transition-colors">
        <span className="text-lg">←</span>
        <span className="font-medium">Back</span>
      </Link>
      <GlassCard className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-accent/10">
              <XLogo className="w-8 h-8 text-accent" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600">
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
