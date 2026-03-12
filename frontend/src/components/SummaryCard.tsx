'use client';

import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  status?: string;
}

export default function SummaryCard({ title, value, change, icon, status }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-soft transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-navy">{value}</h3>
          
          <div className="mt-2 flex items-center gap-2">
            {change && (
              <span className={`text-xs font-bold ${change.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                {change}
              </span>
            )}
            {status && (
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                {status}
              </span>
            )}
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/5 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
