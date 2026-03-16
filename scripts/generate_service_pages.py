import os

services = [
    ("marriage-certificate", "Marriage Certificate", "marriageCertificate"),
    ("income-certificate", "Income Certificate", "incomeCertificate"),
    ("community-certificate", "Community Certificate", "communityCertificate"),
    ("building-permit", "Building Permit", "buildingPermit"),
]

template = """'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';

export default function {ComponentName}Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    applicant_name: '',
    phone: '',
    parent_name: '',
    dob: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await apiFetch(endpoints.{EndpointName}, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      localStorage.setItem('last_application', JSON.stringify(data));
      router.push('/services/success');
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-20">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-navy">Apply for {Title}</h1>
        <div className="mt-6 flex items-start gap-4 rounded-xl border-l-4 border-primary bg-primary/5 p-4 text-sm text-navy/80">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>
            Please ensure all details match your legal documents exactly. Inaccurate information may lead to delays or rejection of your application. All fields are mandatory unless marked otherwise.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-xl overflow-hidden">
        <div className="p-8">
          {error && (
            <div className="mb-8 rounded-lg bg-danger/10 p-4 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Applicant Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-muted/40 font-bold">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <input
                    type="text"
                    name="applicant_name"
                    required
                    value={formData.applicant_name}
                    onChange={handleChange}
                    placeholder="Full legal name"
                    className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all placeholder:text-muted/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-muted/40 font-bold">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all placeholder:text-muted/30"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Guardian/Reference Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-muted/40 font-bold">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </span>
                <input
                  type="text"
                  name="parent_name"
                  required
                  value={formData.parent_name}
                  onChange={handleChange}
                  placeholder="Legal name for records"
                  className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all placeholder:text-muted/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Effective Date</label>
              <input
                type="date"
                name="dob"
                required
                value={formData.dob}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Service Address</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-muted/40 font-bold">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </span>
                <textarea
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full address related to this application"
                  className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all placeholder:text-muted/30 min-h-[100px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg disabled:opacity-70"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  Submit Application
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted/60">
            By submitting, you agree to our <a href="#" className="font-bold underline">Terms of Service</a> and <a href="#" className="font-bold underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
"""

base_path = r'd:\C1\frontend\src\app\services'

for slug, title, endpoint in services:
    dir_path = os.path.join(base_path, slug)
    os.makedirs(dir_path, exist_ok=True)
    comp_name = title.replace(" ", "")
    content = template.replace("{ComponentName}", comp_name).replace("{EndpointName}", endpoint).replace("{Title}", title)
    with open(os.path.join(dir_path, 'page.tsx'), 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created page for {title}")
