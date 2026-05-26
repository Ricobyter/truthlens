import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  // The `authorized` callback in auth.config.ts handles route protection.
  // This file just wires the middleware into Next.js.
  return undefined;
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and auth API
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)).*)",
  ],
};
