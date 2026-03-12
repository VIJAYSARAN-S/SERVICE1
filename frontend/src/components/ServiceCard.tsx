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
    <div className={`group relative flex flex-col gap-4 rounded-2xl border bg-white p-6 transition-all duration-300 ${
      isActive 
        ? 'border-primary ring-1 ring-primary/20 shadow-lg' 
        : 'border-border hover:border-primary/40 hover:shadow-md'
    }`}>
      {isActive && (
        <div className="absolute top-4 right-4 text-primary">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      )}
      
      <div className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
        isActive ? 'bg-primary text-white' : 'bg-muted/10 text-muted'
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
