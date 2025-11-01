import { createCivicAuthPlugin } from "@civic/auth/nextjs";

const nextConfig = {
  reactStrictMode: true,
};

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

const withCivicAuth = createCivicAuthPlugin({
  clientId: "d55ad109-681e-46c5-bb18-9aa1ed043695",
  baseUrl: baseUrl,
  loginSuccessUrl: "/account",
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

