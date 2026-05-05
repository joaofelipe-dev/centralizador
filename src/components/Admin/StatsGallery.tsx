import React from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface StatItem {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

interface StatsGalleryProps {
  stats: StatItem[];
}

export function StatsGallery({ stats }: StatsGalleryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} padding="md" className="space-y-3 bg-white/5 border-white/10">
          <div className={`p-2 w-fit rounded-lg bg-white/5 ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-white">{stat.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}