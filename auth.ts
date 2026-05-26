import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import authConfig from "./auth.config";
import { connectDB } from "./lib/mongodb";
import User from "./lib/models/User";
import { defaultAvatar } from "./lib/dicebear";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(raw) {
        const parsed = CredentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.hashedPassword) return null;

        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          plan: user.plan,
        };
      },
    }),
  ],
  events: {
    // Auto-create User document for Google sign-ins
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return;

      await connectDB();
      const existing = await User.findOne({ email: user.email.toLowerCase() });
      if (existing) {
        user.id = existing._id.toString();
        return;
      }

      const created = await User.create({
        email: user.email.toLowerCase(),
        name: user.name,
        image: user.image ?? defaultAvatar(user.email),
        emailVerified: new Date(),
      });
      user.id = created._id.toString();
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, account }) {
      if (user) {
        // For Google OAuth, user.id is the provider's UUID sub, not MongoDB _id.
        // For Credentials, user.id is already the MongoDB _id (set in authorize()).
        // Always resolve via email to get the correct MongoDB _id.
        if (account?.provider === "google" || !user.id?.match(/^[0-9a-f]{24}$/)) {
          try {
            await connectDB();
            const dbUser = await User.findOne({ email: (user.email ?? token.email) as string });
            if (dbUser) {
              token.id = dbUser._id.toString();
              token.plan = dbUser.plan;
            }
          } catch {
            // fallback — will likely fail downstream, but don't crash here
          }
        } else {
          token.id = user.id;
          token.plan = (user as { plan?: string }).plan ?? "free";
        }
      }
      // Refresh plan from DB on trigger (e.g. after plan upgrade)
      if (trigger === "update" && token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email as string });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.plan = dbUser.plan;
          }
        } catch {
          // ignore
        }
      }
      return token;
    },
  },
});
