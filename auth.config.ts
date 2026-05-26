import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe configuration (no database adapter, no bcrypt).
// Providers requiring Node APIs (Credentials) are added in auth.ts.
export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      const protectedPaths = ["/dashboard", "/history", "/profile"];
      // /api/payment/webhook is intentionally NOT gated — it uses signature verification
      const protectedApi = [
        "/api/check",
        "/api/history",
        "/api/profile",
        "/api/payment/create-checkout-session",
        "/api/upload-avatar",
      ];

      const isProtected =
        protectedPaths.some((p) => pathname.startsWith(p)) ||
        protectedApi.some((p) => pathname.startsWith(p));

      if (isProtected) return isLoggedIn;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as { plan?: string }).plan ?? "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.plan = token.plan as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
