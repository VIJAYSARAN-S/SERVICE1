import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CyberShield | Secure E-Governance Platform",
  description: "Next-generation secure digital service platform for citizens.",
};

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white shadow-lg font-black text-xs uppercase tracking-tighter">CS</div>
                <span className="text-xl font-black text-navy uppercase tracking-tighter">CyberShield</span>
              </div>
              <p className="mt-6 max-w-xs text-sm font-medium text-slate-400 leading-relaxed">
                Empowering citizens with next-generation secure, blockchain-verified digital governance services.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-navy">Quick Links</h4>
              <ul className="mt-6 space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <li><a href="#" className="hover:text-amber transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-amber transition-colors">Emergency Status</a></li>
                <li><a href="#" className="hover:text-amber transition-colors">Network Map</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-navy">Legal</h4>
              <ul className="mt-6 space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <li><a href="#" className="hover:text-amber transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-amber transition-colors">Audit Logs</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 flex flex-col items-center justify-between border-t border-slate-50 pt-10 md:flex-row">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              © 2026 CYBERSHIELD NETWORK. SECURE DIGITAL GOVERNANCE.
            </p>
            <div className="mt-6 flex items-center gap-4 md:mt-0">
               <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.666.945V14a5 5 0 01-5 5H6.5a5 5 0 01-5-5V5.845a1 1 0 01.666-.945zM10 8a1 1 0 00-1-1v5a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  256-BIT SSL ENCRYPTION
               </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
