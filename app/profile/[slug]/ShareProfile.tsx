"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import Button from "@/components/Button";

interface ShareProfileProps {
  slug: string;
}

export default function ShareProfile({ slug }: ShareProfileProps) {
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  
  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/profile/${slug}`
    : `/profile/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="border-t border-white/10 pt-6 space-y-4">
      <button
        onClick={() => setShowShare(!showShare)}
        className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share this profile
      </button>
      
      {showShare && (
        <div className="rounded-lg border border-white/20 bg-white/5 p-4 space-y-3">
          <p className="text-sm text-white/70">Copy your profile link:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={profileUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-900 border border-white/20 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

