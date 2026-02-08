"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        >
            <LogOut className="h-4 w-4" />
        </Button>
    );
}
