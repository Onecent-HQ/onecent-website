"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/Button";
import { useUser } from "@civic/auth/react";

export default function ProfileNav() {
  const { user } = useUser();

  return (
    <div className="border-b border-white/10 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/investors"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Investors</span>
          </Link>
          
          {user ? (
            <Link href="/account">
              <Button className="group bg-black hover:bg-gray-900 px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                <span className="flex items-center gap-2">
                  Manage Your Profile
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          ) : (
            <Link href="/signin">
              <Button className="group bg-black hover:bg-gray-900 px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                <span className="flex items-center gap-2">
                  Create Your Profile
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

