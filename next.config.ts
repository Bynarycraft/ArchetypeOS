import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  env: {
    DATABASE_URL: "postgresql://postgres:wpczgwxsriezaubncuom@db.hocsrwsjgwuhqoncklmt.supabase.co:5432/postgres",
    DIRECT_URL: "postgresql://postgres:wpczgwxsriezaubncuom@db.hocsrwsjgwuhqoncklmt.supabase.co:5432/postgres",
    NEXTAUTH_SECRET: "archetype-os-nextauth-secret-2026-x9k2m4n7p1q8r5t3",
    NEXTAUTH_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  },
};

export default nextConfig;
