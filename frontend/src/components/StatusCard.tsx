'use client';

import React from 'react';

interface StatusCardProps {
  title: string;
  status: string;
  type: 'success' | 'warning' | 'info' | 'active';
  icon: React.ReactNode;
  onClick?: () => void;
}

export default function StatusCard({ title, status, type, icon, onClick }: StatusCardProps) {
  const statusStyles = {
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    info: 'text-primary bg-primary/10',
    active: 'text-success bg-success/10',
  };

  const dotStyles = {
    success: 'bg-success',
    warning: 'bg-warning',
    info: 'bg-primary',
    active: 'bg-success',
  };

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col gap-5 rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-amber/20' : ''
      }`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${statusStyles[type]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-[#64748B]">{title}</h3>
        <div className="mt-2 flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${dotStyles[type]} ${type === 'active' ? 'animate-pulse' : ''}`}></div>
          <span className={`text-base font-black tracking-tight ${statusStyles[type].split(' ')[0]} uppercase`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
