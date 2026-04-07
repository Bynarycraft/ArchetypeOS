"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

export const SignOutButton = React.forwardRef<HTMLButtonElement, SignOutButtonProps>(
    ({ className, onClick, ...props }, ref) => {
        const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
            onClick?.(event);
            if (event.defaultPrevented) {
                return;
            }

            await signOut({ callbackUrl: "/auth" });
        };

        return (
            <Button
                ref={ref}
                variant="ghost"
                size="icon"
                className={cn(
                    "h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                    className,
                )}
                onClick={handleClick}
                {...props}
            >
                <LogOut className="h-4 w-4" />
            </Button>
        );
    },
);

SignOutButton.displayName = "SignOutButton";
