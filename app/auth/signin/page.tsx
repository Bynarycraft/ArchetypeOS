"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignInPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");

        if (!email || !password) {
            setError("Enter both email and password.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.ok) {
                // Redirect to root which handles role-based routing
                router.push("/");
                router.refresh();
            } else if (result?.error === "CredentialsSignin") {
                setError("Invalid email or password.");
            } else {
                setError(result?.error || "Sign in failed. Please try again.");
            }
        } catch (err) {
            console.error("[signin] Error:", err);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4">
                        <span className="text-primary-foreground font-bold text-xl">A</span>
                    </div>
                    <h1 className="text-2xl font-bold">ArchetypeOS</h1>
                    <p className="text-muted-foreground text-sm mt-1">Internal Talent Intelligence Platform</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>Enter your credentials to access the platform.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    autoComplete="username"
                                    inputMode="email"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Your password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="w-full space-y-3">
                                <Button className="w-full" type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign In
                                </Button>
                                <div className="text-center text-sm">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                                        Create Account
                                    </Link>
                                </div>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

            </div>
        </div>
    );
}
