import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

type TabHelperCardProps = {
  summary: string;
  points: string[];
};

export function TabHelperCard({ summary, points }: TabHelperCardProps) {
  return (
    <Card className="border border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Info className="h-4 w-4 text-primary" />
          What This Tab Does
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{summary}</p>
        <ul className="space-y-1 text-sm">
          {points.map((point) => (
            <li key={point} className="text-foreground/90">
              - {point}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
