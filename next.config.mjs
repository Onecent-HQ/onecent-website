import { createCivicAuthPlugin } from "@civic/auth/nextjs";

const nextConfig = {
  reactStrictMode: false, // Disable to prevent double mounting in dev which causes duplicate OAuth calls
};

// Auto-detect production URL from Vercel or use BASE_URL env var
const getBaseUrl = () => {
  let url = null;
  
  // Check for BASE_URL first
  if (process.env.BASE_URL) {
    url = process.env.BASE_URL;
  }
  // Check for common alternative env var names
  else if (process.env.NEXTAUTH_URL) {
    url = process.env.NEXTAUTH_URL;
  }
  else if (process.env.NEXT_PUBLIC_APP_URL) {
    url = process.env.NEXT_PUBLIC_APP_URL;
  }
  // In Vercel, use VERCEL_URL (automatically set by Vercel)
  else if (process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  }
  // Fallback to localhost for development
  else {
    return "http://localhost:3000";
  }
  
  // Ensure URL has protocol (add https:// if missing)
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  return url;
};

const baseUrl = getBaseUrl();

const withCivicAuth = createCivicAuthPlugin({
  clientId: "d55ad109-681e-46c5-bb18-9aa1ed043695",
  baseUrl: baseUrl,
  loginSuccessUrl: "/investors",
  loginUrl: "/signin",
  logoutUrl: "/investors",
  exclude: [
    "/",
    "/investors",
    "/investors/:path*",
    "/profile",
    "/profile/:path*",
    "/signin",
    "/api/investors",
    "/api/investors/:path*",
    "/api/profile",
    "/api/profile/:path*",
    "/api/auth",
    "/api/auth/:path*",
  ],
});

export default withCivicAuth(nextConfig);

