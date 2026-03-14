'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-amber selection:text-navy">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] text-white shadow-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tighter leading-none text-[#0F172A]">CyberShield</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mt-0.5">Secure Governance Platform</p>
            </div>
          </div>
          

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
               <Link 
                href="/dashboard"
                className="rounded-xl bg-[#0F172A] px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login"
                className="rounded-xl bg-[#0F172A] px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-8 min-h-[90vh]">
        {/* Left Column */}
        <div className="flex-1 space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-left duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Government Network</span>
          </div>

          <h2 className="text-5xl lg:text-7xl font-black tracking-tighter text-[#0F172A] leading-[1.05] uppercase">
            Secure Digital <br />
            Governance <br />
            <span className="text-amber-600">Platform</span>
          </h2>

          <p className="max-w-xl text-lg font-medium text-slate-500 leading-relaxed mx-auto lg:mx-0">
            A unified digital infrastructure enabling citizens and government officials to access essential public services with maximum efficiency, transparency, and top-tier security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <Link 
              href="/login"
              className="group flex items-center gap-3 rounded-xl bg-[#0F172A] px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-2xl hover:bg-[#1E293B] transition-all hover:-translate-y-1"
            >
              Explore Portals
              <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-navy transition-colors tracking-[0.2em]">
              View Documentation
            </button>
          </div>
        </div>

        {/* Right Column - Abstract Preview Card */}
        <div className="flex-1 w-full relative group animate-in fade-in slide-in-from-right duration-1000 delay-200">
           {/* Glow Effect */}
           <div className="absolute -bottom-20 -right-20 h-96 w-96 bg-amber-100/50 rounded-full blur-[100px] group-hover:bg-amber-200/50 transition-colors duration-1000"></div>
           
           <div className="relative bg-white rounded-[40px] p-10 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.12)] border border-slate-100 backdrop-blur-3xl overflow-hidden min-h-[450px] flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div className="h-40 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <div className="h-12 w-20 rounded-xl bg-slate-100/50"></div>
                   </div>
                   <div className="h-40 rounded-3xl bg-slate-50 border border-slate-100"></div>
                </div>
                <div className="space-y-4 pt-12">
                   <div className="h-40 rounded-3xl bg-slate-50 border border-slate-100"></div>
                   <div className="h-40 rounded-3xl bg-slate-50 border border-slate-100"></div>
                </div>
              </div>
              
              <div className="mt-12 space-y-3 opacity-30">
                 <div className="h-3 w-1/2 bg-slate-200 rounded-full"></div>
                 <div className="h-3 w-1/3 bg-slate-100 rounded-full"></div>
              </div>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="h-6 w-6 rounded-md bg-[#0F172A] text-white flex items-center justify-center text-[10px] font-black tracking-tighter shadow-md">CS</div>
             <p className="text-xs font-black uppercase tracking-widest text-[#0F172A]">CyberShield <span className="text-slate-400 ml-1 font-bold">Secure Governance platform</span></p>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2026 CYBERSHIELD NETWORK. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
