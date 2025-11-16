"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
import { useUser } from "@civic/auth/react";

export default function ProfileNav() {
  const { user } = useUser();

  return (
    <nav className="relative border-b border-white/10 bg-black/95 backdrop-blur-md sticky top-0 z-50">
      {/* Subtle gradient overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            <Logo logoHeight={36} />
            <div className="h-6 w-px bg-white/10" />
            <Link 
              href="/investors"
              className="group flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Investors</span>
            </Link>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center">
            {user ? (
              <Link href="/account">
                <button className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm">
                  <span>Manage Your Profile</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
            ) : (
              <Link href="/signin">
                <button className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm">
                  <span>Create Your Profile</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

