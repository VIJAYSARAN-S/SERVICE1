'use client';

import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
    setRole(auth.getRole());
  }, []);

  const handleLogout = () => {
    auth.logout();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white shadow-lg">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <Link href="/" className="text-xl font-black tracking-tighter text-navy uppercase">
            CyberShield
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {role === 'admin' && (
                <div className="hidden md:flex items-center gap-6 mr-4">
                  <Link href="/admin" className="text-sm font-medium text-muted hover:text-navy transition-colors">Dashboard</Link>
                  <Link href="/admin" className="text-sm font-medium text-muted hover:text-navy transition-colors">Applications</Link>
                  <Link href="/admin" className="text-sm font-medium text-muted hover:text-navy transition-colors">Login Logs</Link>
                  <Link href="/admin" className="text-sm font-medium text-muted hover:text-navy transition-colors">Audit Logs</Link>
                </div>
              )}
              {role === 'citizen' && (
                 <div className="hidden md:flex items-center gap-6 mr-4">
                  <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-navy transition-colors">Home</Link>
                  <Link href="/dashboard#citizen-services" className="text-sm font-medium text-muted hover:text-navy transition-colors">Services</Link>
                  <Link href="/dashboard#application-status" className="text-sm font-medium text-muted hover:text-navy transition-colors">Status</Link>
                </div>
              )}
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                 <div className="h-1.5 w-1.5 rounded-full bg-success"></div>
                 SESSION ACTIVE
              </div>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/pds/login"
                className="text-xs font-bold text-navy hover:text-primary transition-colors"
              >
                PDS Admin
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-all"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
