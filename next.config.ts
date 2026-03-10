import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: `postgresql://postgres.hocsrwsjgwuhqoncklmt:${process.env.SUPABASE_DB_PASSWORD || "wpczgwxsriezaubncuom"}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
    DIRECT_URL: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD || "wpczgwxsriezaubncuom"}@db.hocsrwsjgwuhqoncklmt.supabase.co:5432/postgres`,
    NEXTAUTH_SECRET: "archetype-os-nextauth-secret-2026-x9k2m4n7p1q8r5t3",
    NEXTAUTH_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  },
};

export default nextConfig;
