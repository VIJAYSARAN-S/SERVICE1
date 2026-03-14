'use client';

import React from 'react';
import Link from 'next/link';

interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  statusText?: string;
  isComingSoon?: boolean;
}

export default function ServiceCard({
  title,
  description,
  href,
  icon,
  isActive = false,
  statusText,
  isComingSoon = false,
}: ServiceCardProps) {
  const CardContent = (
    <div className={`group relative flex flex-col gap-6 rounded-[32px] border bg-white p-8 transition-all duration-500 ${
      isActive 
        ? 'border-amber shadow-[0_30px_60px_-15px_rgba(217,119,6,0.12)] -translate-y-2' 
        : 'border-slate-100 shadow-soft hover:shadow-2xl hover:-translate-y-2 hover:border-amber/20'
    }`}>
      {isActive && (
        <div className="absolute top-6 right-6 text-amber animate-pulse">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 shadow-lg ${
        isActive ? 'bg-amber text-white' : 'bg-navy text-white group-hover:bg-amber'
      }`}>
        {icon}
      </div>

      <div>
        <h3 className="text-xl font-bold text-navy">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {description}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {statusText && (
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted'}`}>
            {isActive && <span className="mr-1.5">⚡</span>}
            {statusText}
          </span>
        )}
        {isComingSoon && (
          <span className="rounded-full bg-muted/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            COMING SOON
          </span>
        )}
      </div>
    </div>
  );

  if (isComingSoon) {
    return CardContent;
  }

  return (
    <Link href={href} className="block">
      {CardContent}
    </Link>
  );
}
