"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { useState } from "react";
import GlassCard from "./GlassCard";
import Button from "./Button";
import XLogo from "./XLogo";
import { Verified } from "lucide-react";

interface ProfileCardProps {
  name: string;
  title?: string;
  handle?: string;
  status?: "Online" | "Offline" | "Verified" | "Unverified";
  contactText?: string;
  avatarUrl?: string;
  showUserInfo?: boolean;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  onContactClick?: () => void;
  bio?: string;
  niches?: string[];
  verified?: boolean;
}

export default function ProfileCard({
  name,
  title,
  handle,
  status,
  contactText = "Contact Me",
  avatarUrl,
  showUserInfo = true,
  enableTilt = true,
  enableMobileTilt = false,
  onContactClick,
  bio,
  niches,
  verified,
}: ProfileCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || (typeof window !== "undefined" && window.innerWidth < 768 && !enableMobileTilt)) {
      return;
    }

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const getStatusColor = () => {
    switch (status) {
      case "Online":
        return "bg-green-500";
      case "Verified":
        return "bg-green-500";
      case "Offline":
        return "bg-gray-400";
      case "Unverified":
        return "bg-gray-400";
      default:
        return verified ? "bg-green-500" : "bg-gray-400";
    }
  };

  const getStatusLabel = () => {
    if (status) return status;
    return verified ? "Verified" : "Unverified";
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: enableTilt
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
          : undefined,
        transition: "transform 0.1s ease-out",
      }}
      className="w-full"
    >
      <GlassCard className="p-8 text-center">
        {/* Avatar */}
        <div className="relative inline-block mb-4">
          {avatarUrl ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/50 shadow-lg">
              <Image
                src={avatarUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/40 flex items-center justify-center text-3xl font-bold text-orange-500 ring-4 ring-white/10 shadow-lg">
              {name && name.length > 0 ? name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          {status && (
            <div
              className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white ${getStatusColor()}`}
            />
          )}
        </div>

        {/* Name and Title */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h3 className="text-2xl font-bold text-white">{name || "Unknown"}</h3>
            {verified && (
              <Verified className="w-5 h-5 text-green-400" />
            )}
          </div>
          {title && (
            <p className="text-lg text-white/70 font-medium">{title}</p>
          )}
          {handle && (
            <div className="flex items-center justify-center gap-1 mt-2 text-white/60">
              <XLogo className="w-4 h-4" />
              <span className="text-sm">@{handle}</span>
            </div>
          )}
          {showUserInfo && status && (
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  status === "Verified" || verified
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : status === "Online"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-white/10 text-white/60 border border-white/20"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor()}`}
                />
                {getStatusLabel()}
              </span>
            </div>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-white/70 mb-4 line-clamp-3">{bio}</p>
        )}

        {/* Niches */}
        {niches && niches.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {niches.slice(0, 4).map((niche, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-500 text-xs font-medium border border-orange-500/30"
              >
                {niche}
              </span>
            ))}
          </div>
        )}

        {/* Contact Button */}
        {onContactClick && (
          <Button
            onClick={onContactClick}
            className="w-full mt-4"
            variant="primary"
          >
            {contactText}
          </Button>
        )}
      </GlassCard>
    </div>
  );
}

