import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-gray-600">Investor profile not found</p>
        <Link href="/investors">
          <Button>Back to Investors</Button>
        </Link>
      </GlassCard>
    </div>
  );
}

