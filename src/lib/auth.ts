import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { supabase, getOrCreateUser } from "@/lib/supabase";
import bcrypt from "bcryptjs";

function getRequiredEnv(name: "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET" | "NEXTAUTH_SECRET") {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user } = await supabase
          .from("users")
          .select("id, email, name, password_hash")
          .eq("email", credentials.email)
          .single();

        if (!user || !user.password_hash) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  events: {
    async signIn({ user, account }) {
      try {
        if (!user.email) return;
        const userId = await getOrCreateUser(user.email, user.name);
        await supabase.from("login_events").insert({
          user_id: userId,
          provider: account?.provider ?? "unknown",
        });
      } catch (e) {
        // Visibility logging must never block a login
        console.error("login event log error:", e);
      }
    },
  },
  secret: getRequiredEnv("NEXTAUTH_SECRET"),
};
