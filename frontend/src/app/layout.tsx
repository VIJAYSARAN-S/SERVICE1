import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CyberShield | Secure E-Governance Platform",
  description: "Next-generation secure digital service platform for citizens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-border bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm font-bold text-xs">CS</div>
                  <span className="text-lg font-bold text-navy">CyberShield</span>
                </div>
                <p className="mt-4 max-w-xs text-sm text-muted">
                  Empowering citizens with secure, blockchain-verified digital governance services.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-navy">Support</h4>
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">System Status</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-navy">Legal</h4>
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Accessibility</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-8 md:flex-row">
              <p className="text-xs text-muted">
                © 2024 CyberShield Inc. All rights reserved.
              </p>
              <div className="mt-4 flex items-center gap-4 md:mt-0">
                 <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.666.945V14a5 5 0 01-5 5H6.5a5 5 0 01-5-5V5.845a1 1 0 01.666-.945zM10 8a1 1 0 00-1 1v5a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    CyberShield 256-bit Encrypted
                 </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
