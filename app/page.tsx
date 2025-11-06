"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import GlassCard from "@/components/GlassCard";
import Prism from "@/components/Prism";
import { 
  Users, 
  TrendingUp, 
  Shield, 
  Award,
  ArrowRight,
  CheckCircle2,
  Search,
  Network,
  Sparkles
} from "lucide-react";
import { useUser } from "@civic/auth/react";

export default function HomePage() {
  const { user } = useUser();

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Curated Investor Network",
      description: "Connect with verified investors building the future of on-chain finance. Find partners aligned with your investment thesis."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Investment Insights",
      description: "Discover top investments, portfolio preferences, and on-chain focus percentages from leading investors in the space."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verified Profiles",
      description: "All investors are verified through X authentication, ensuring authentic connections and credible investment networks."
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: "On-Chain Focus",
      description: "See how investors allocate across on-chain and traditional opportunities. Find partners who match your investment style."
    }
  ];

  const stats = [
    { value: "100+", label: "Active Investors" },
    { value: "50+", label: "Investment Niches" },
    { value: "24/7", label: "Network Access" },
    { value: "100%", label: "Verified Profiles" }
  ];

  const benefits = [
    "Create your investor profile",
    "Showcase your top investments",
    "Connect with aligned partners",
    "Share your investment preferences",
    "Build your on-chain reputation",
    "Join the curated network"
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1a1a1a]">
      {/* Prism Background */}
      <div className="fixed inset-0 z-0">
        <Prism 
          animationType="rotate"
          transparent={true}
          scale={3.6}
          glow={0.3}
          noise={0.1}
          colorFrequency={1}
          timeScale={0.5}
        />
      </div>

      {/* Dark Overlay for Text Readability */}
      <div className="fixed inset-0 z-0 bg-[#1a1a1a]/60" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            

            {/* Hero Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white">
                <span className="block">
                  Where Capital Meets
                </span>
                <span className="block mt-2 text-orange-500">
                  Conviction
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light">
                The curated network for investors building
                <span className="text-white font-normal"> the future of on-chain finance</span>.
                Connect with verified partners aligned with your investment thesis.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {user ? (
                <Link href="/account">
                  <Button 
                    className="group relative overflow-hidden bg-orange-500 hover:bg-orange-600/90 px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Manage Your Profile
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
              ) : (
                <Link href="/signin">
                  <Button 
                    className="group relative overflow-hidden bg-orange-500 hover:bg-orange-600/90 px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Create Your Profile
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
              )}
              
              <Link href="/investors">
                <Button 
                  variant="secondary"
                  className="border-white/20 hover:border-orange-500/50 px-8 py-6 text-base font-semibold hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    Explore Investors
                  </span>
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-white/60">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>Verified X profiles</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>On-chain verified</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>Curated network</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center space-y-2 group"
                >
                  <div className="text-4xl md:text-5xl font-bold text-orange-500 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60 uppercase tracking-wider font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Why Join <span className="text-orange-500">Supershares</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to connect with the right investors and build meaningful partnerships
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <GlassCard 
                key={index}
                className="p-8 group cursor-pointer border-white/10 hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-start gap-6">
                  <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-semibold text-white group-hover:text-orange-500 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="relative py-20 px-4 z-10">
        <div className="max-w-5xl mx-auto">
          <GlassCard className="p-12 md:p-16 text-center relative overflow-hidden border-orange-500/20">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-600/10" />
            
            <div className="relative z-10 space-y-8">
              <div className="inline-flex p-3 rounded-full bg-orange-500/10">
                <Award className="w-8 h-8 text-orange-500" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                  Build Your <span className="text-orange-500">Investor Profile</span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                  Join the curated network of investors shaping the future of on-chain finance
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 text-white"
                  >
                    <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                {user ? (
                  <Link href="/account">
                    <Button 
                      className="group bg-orange-500 hover:bg-orange-600/90 px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span className="flex items-center gap-2">
                        Manage Your Profile
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/signin">
                    <Button 
                      className="group bg-orange-500 hover:bg-orange-600/90 px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span className="flex items-center gap-2">
                        Create Your Profile
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
        </section>

        
    </div>
  );
}
