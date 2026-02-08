import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

// Extend the built-in session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string;
            archetype?: string;
        }
    }
    interface User {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
        archetype?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role?: string;
        archetype?: string;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
        // error: '/auth/error',
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user) {
                    return null;
                }

                // For MVP, simplistic password check (In production, use bcrypt)
                // const isValid = await bcrypt.compare(credentials.password, user.password);
                const isValid = credentials.password === user.password; // TEMPORARY for MVP

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    archetype: user.archetype,
                };
            }
        }),
        // EmailProvider would go here (requires SMTP)
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.archetype = user.archetype;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.archetype = token.archetype as string;
            }
            return session;
        }
    }
};
