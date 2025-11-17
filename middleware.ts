import { authMiddleware } from "@civic/auth/nextjs/middleware";

export default authMiddleware();

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next directory (Next.js static files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - image files
     * - public routes (investors, profile, signin)
     * - ALL auth API routes (critical for OAuth callback)
     * - public API routes
     */
    "/((?!_next|favicon.ico|sitemap.xml|robots.txt|opengraph-image|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.gif|investors|profile|signin|api/auth|api/investors|api/profile).*)",
  ],
};
