import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type PageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ icon: Icon, title, description, action }: PageHeaderProps) {
  return (
    <div className="pb-4 border-b border-border/10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient flex items-center gap-3">
            <Icon className="h-7 w-7" /> {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-2 text-sm font-medium">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
