import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-none glass-card rounded-3xl">
      <CardContent className="p-12 text-center">
        <div className="flex justify-center mb-4">
          <Icon className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 mb-6">{description}</p>
        )}
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
}
