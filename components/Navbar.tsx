"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Menu, X, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { useUser } from "@civic/auth/react";

interface NavbarProps {
  variant?: 'home' | 'investors' | 'profile' | 'account' | 'signin';
  showBackLink?: boolean;
  backLinkHref?: string;
  backLinkText?: string;
  rightContent?: 'none' | 'profile-button' | 'logout' | React.ReactNode;
  isNewUser?: boolean;
  onLogout?: () => void | Promise<void>;
}

export default function Navbar({
  variant = 'home',
  showBackLink,
  backLinkHref,
  backLinkText,
  rightContent,
  isNewUser = false,
  onLogout,
}: NavbarProps) {
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine right content based on variant if not explicitly provided
  const getRightContent = () => {
    if (rightContent !== undefined) {
      if (rightContent === 'none') return null;
      if (rightContent === 'profile-button') {
        return user ? (
          <Link 
            href="/account"
            className="group relative text-[11px] sm:text-xs font-light text-white/40 hover:text-white/70 transition-all duration-200 whitespace-nowrap"
          >
            <span className="relative">
              {isNewUser ? "Create Your Profile" : "Manage Your Profile"}
              <span className="absolute bottom-0 left-0 w-0 h-[0.5px] bg-white/50 group-hover:w-full transition-all duration-300" />
            </span>
          </Link>
        ) : (
          <Link 
            href="/signin"
            className="group relative text-[11px] sm:text-xs font-light text-white/40 hover:text-white/70 transition-all duration-200 whitespace-nowrap"
          >
            <span className="relative">
              Create Your Profile
              <span className="absolute bottom-0 left-0 w-0 h-[0.5px] bg-white/50 group-hover:w-full transition-all duration-300" />
            </span>
          </Link>
        );
      }
      if (rightContent === 'logout') {
        return user ? (
          <button
            onClick={async () => {
              if (onLogout) {
                await onLogout();
              } else {
                // Fallback logout
                window.location.href = '/';
              }
            }}
            className="group inline-flex items-center justify-center p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:rotate-12" />
          </button>
        ) : null;
      }
      return rightContent;
    }

    // Default behavior based on variant
    switch (variant) {
      case 'home':
        return null;
      case 'investors':
        return user ? (
          <Link 
            href="/account"
            className="group relative text-[11px] sm:text-xs font-light text-white/40 hover:text-white/70 transition-all duration-200 whitespace-nowrap"
          >
            <span className="relative">
              {isNewUser ? "Create Your Profile" : "Manage Your Profile"}
              <span className="absolute bottom-0 left-0 w-0 h-[0.5px] bg-white/50 group-hover:w-full transition-all duration-300" />
            </span>
          </Link>
        ) : (
          <Link 
            href="/signin"
            className="group relative text-[11px] sm:text-xs font-light text-white/40 hover:text-white/70 transition-all duration-200 whitespace-nowrap"
          >
            <span className="relative">
              Create Your Profile
              <span className="absolute bottom-0 left-0 w-0 h-[0.5px] bg-white/50 group-hover:w-full transition-all duration-300" />
            </span>
          </Link>
        );
      case 'profile':
        return user ? (
          <Link 
            href="/account"
            className="group relative text-sm font-medium text-white/70 hover:text-white transition-all duration-200 whitespace-nowrap"
          >
            <span className="relative">
              Manage Your Profile
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-200" />
            </span>
          </Link>
        ) : (
          <Link 
            href="/signin"
            className="group relative text-[11px] sm:text-xs font-light text-white/40 hover:text-white/70 transition-all duration-200 whitespace-nowrap"
          >
            <span className="relative">
              Create Your Profile
              <span className="absolute bottom-0 left-0 w-0 h-[0.5px] bg-white/50 group-hover:w-full transition-all duration-300" />
            </span>
          </Link>
        );
      case 'account':
        return user ? (
          <button
            onClick={async () => {
              if (onLogout) {
                await onLogout();
              } else {
                window.location.href = '/';
              }
            }}
            className="group inline-flex items-center justify-center p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:rotate-12" />
          </button>
        ) : null;
      case 'signin':
        return null;
      default:
        return null;
    }
  };

  // Determine back link based on variant if not explicitly provided
  const getBackLink = () => {
    if (showBackLink === false) return null;
    
    if (backLinkHref && backLinkText) {
      return {
        href: backLinkHref,
        text: backLinkText,
      };
    }

    switch (variant) {
      case 'investors':
        return null;
      case 'profile':
        return { href: '/investors', text: 'Back to Investors' };
      case 'account':
        return { href: '/', text: 'Back to Home' };
      case 'signin':
        return { href: '/', text: 'Back to Home' };
      default:
        return null;
    }
  };

  const backLink = getBackLink();
  const rightContentElement = getRightContent();

  // Mobile menu items
  const mobileMenuItems = [
    ...(backLink ? [{ href: backLink.href, text: backLink.text, icon: ArrowLeft }] : []),
    ...(variant === 'account' ? [{ href: '/investors', text: 'Browse Investors', icon: ArrowRight }] : []),
    ...(user && variant !== 'account' ? [{ href: '/account', text: isNewUser ? 'Create Your Profile' : 'Manage Your Profile', icon: ArrowRight }] : []),
    ...(!user && variant !== 'account' && variant !== 'signin' ? [{ href: '/signin', text: 'Create Your Profile', icon: ArrowRight }] : []),
    ...(variant === 'account' && user ? [{ href: '#', text: 'Logout', icon: LogOut, action: async () => {
      if (onLogout) {
        await onLogout();
      } else {
        window.location.href = '/';
      }
    } }] : []),
  ];

  return (
    <>
      <nav className="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 z-50 w-[88%] max-w-5xl">
        {/* Liquid Glass Pill Container */}
        <div className="relative rounded-full border border-white/8 bg-gradient-to-r from-white/[0.05] via-white/[0.02] to-white/[0.05] backdrop-blur-2xl shadow-[0_10px_26px_rgba(0,0,0,0.55)]">
          {/* Subtle inner glow */}
          <div className="pointer-events-none absolute inset-px rounded-full bg-gradient-to-b from-white/[0.05] via-transparent to-black/[0.32]" />
          
          <div className="relative px-4 sm:px-5 md:px-6 py-[4px] md:py-[6px]">
            <div className="flex items-center justify-between">
              {/* Left Section - Brand first, nothing else */}
              <div className="flex items-center min-w-0 flex-1">
                <div className="origin-left flex-shrink-0 scale-[0.75] sm:scale-[0.86] md:scale-95">
                  <Logo logoHeight={26} />
                </div>
              </div>

              {/* Right Section - Desktop */}
              <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                {/* Back Link - Desktop */}
                {backLink && (
                  <>
                    <Link 
                      href={backLink.href}
                      className="group flex items-center gap-1 text-[11px] sm:text-xs font-light text-white/40 hover:text-white/70 transition-all duration-200 whitespace-nowrap"
                    >
                      <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5 flex-shrink-0" />
                      <span>{backLink.text}</span>
                    </Link>
                    <div className="h-3 w-px bg-white/4" />
                  </>
                )}

                {/* Additional links for account page - Desktop */}
                {variant === 'account' && (
                  <>
                    <Link
                      href="/investors"
                      className="text-[11px] sm:text-xs font-light text-white/40 hover:text-white/70 transition-colors whitespace-nowrap"
                    >
                      Browse Investors
                    </Link>
                    <div className="h-3 w-px bg-white/4" />
                  </>
                )}

                {rightContentElement}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  <Menu className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-20 right-4 z-50 md:hidden w-[calc(100%-2rem)] max-w-sm">
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
              <div className="p-4 space-y-2">
                {mobileMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  if (item.action) {
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          item.action?.();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.text}</span>
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.text}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

