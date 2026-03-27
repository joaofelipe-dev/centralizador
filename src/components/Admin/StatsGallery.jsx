import React from "react";

export function StatsGallery({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="glass-card p-5 space-y-3">
          <div className={`p-2 w-fit rounded-lg bg-white/5 ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-white">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
