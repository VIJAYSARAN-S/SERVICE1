'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';
import StatusCard from '@/components/StatusCard';
import ServiceCard from '@/components/ServiceCard';
import ApplicationTracker from '@/components/ApplicationTracker';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [qrData, setQrData] = useState<any>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isFetchingQr, setIsFetchingQr] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(auth.getUser());

    // Fetch full profile including photo
    apiFetch(endpoints.profile)
      .then(setProfile)
      .catch(err => {
        console.error('Profile fetch failed:', err);
        // If the token is invalid or expired, log the user out and redirect to login
        if (err.message.includes('token')) {
          auth.logout();
        }
      });

    apiFetch(endpoints.myRequests)
      .then((data) => setRequests(data.requests || []))
      .catch((err) => {
        console.error('Requests fetch failed:', err);
        setRequests([]);
        if (err.message.includes('token')) {
          auth.logout();
        }
      })
      .finally(() => setIsLoadingRequests(false));
  }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Manual fetch for FormData as apiFetch currently expects JSON
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/upload-profile-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setProfile({ ...profile, profile_photo: data.photo_url });
    } catch (err: any) {
      alert(err.message || 'Error uploading photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleQrClick = async () => {
    setIsQrModalOpen(true);
    setIsFetchingQr(true);
    try {
      const data = await apiFetch(endpoints.qrAccess);
      setQrData(data);
    } catch (err: any) {
      console.error('Failed to fetch QR data:', err);
      setQrData({ error: err.message || 'QR not available for this application yet.' });
    } finally {
      setIsFetchingQr(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-12 pb-20">
      {/* Welcome Section */}
      <section className="flex items-center gap-6 rounded-2xl bg-white p-6 shadow-soft border border-border">
        <div
          className="relative h-24 w-24 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="h-full w-full overflow-hidden rounded-full border-4 border-primary/20 p-1 transition-all group-hover:border-primary/40 bg-white">
            {profile?.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt="Profile"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-muted/10 flex items-center justify-center text-muted">
                <svg className="h-12 w-12 text-muted/40" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-navy/40 opacity-0 transition-opacity group-hover:opacity-100">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          {/* Loading Indicator */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/60">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            className="hidden"
            accept="image/*"
          />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy">
            Welcome back, {profile?.full_name || user.full_name || user.email.split('@')[0]}
          </h1>
          <p className="mt-1 text-base text-muted/80">Your digital identity is secure and blockchain-verified.</p>
        </div>
      </section>

      {/* Security Status Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy">Security Status</h2>
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary border border-primary/10">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary font-bold"></div>
            LIVE MONITORING
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            title="OTP Authentication"
            status="Active"
            type="active"
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
          />
          <StatusCard
            title="Blockchain Integrity"
            status="Verified"
            type="success"
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
          />
          <StatusCard
            title="Threat Detection"
            status="Monitoring"
            type="info"
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
          <StatusCard
            title="Offline QR Access"
            status="Ready for use"
            type="info"
            onClick={handleQrClick}
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
          />
        </div>
      </section>

      {/* My Requests — Application Tracker */}
      <section id="application-status">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy">My Requests</h2>
            <p className="mt-0.5 text-sm text-muted/70">Track the status of your submitted service applications.</p>
          </div>
          {requests.length > 0 && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {requests.length} Application{requests.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {isLoadingRequests ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-border bg-white shadow-soft">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-white py-14 shadow-soft text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-navy">No applications yet</p>
              <p className="mt-1 text-xs text-muted/70">Submit a service request below to track it here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <ApplicationTracker
                key={req.application_id}
                application={req}
              />
            ))}
          </div>
        )}
      </section>

      {/* Citizen Services Section */}
      <section id="citizen-services">
        <h2 className="mb-6 text-xl font-bold text-navy">Citizen Services</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ServiceCard
            title="Birth Certificate"
            description="Official birth record application."
            href="/services/birth-certificate"
            isActive={true}

            icon={<svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />

          <ServiceCard
            title="Marriage Certificate"
            description="Legal marriage registration service."
            href="/services/marriage-certificate"
            isActive={true}
            icon={<svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
          />
          <ServiceCard
            title="Income Certificate"
            description="Verify annual household income."
            href="/services/income-certificate"
            isActive={true}
            icon={<svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <ServiceCard
            title="Community Certificate"
            description="Official caste or community verification."
            href="/services/community-certificate"
            isActive={true}
            icon={<svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          />

          <ServiceCard
            title="Passport Application"
            description="Apply for new passport or renewal."
            href="/services/passport-application"
            isActive={true}
            icon={<svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <ServiceCard
            title="Driving License"
            description="New learner or permanent license registration."
            href="/services/driving-license"
            isActive={true}
            icon={<svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
          />
          <ServiceCard
            title="Voter ID"
            description="Register for your National Voter Identity Card."
            href="/services/voter-id"
            isActive={true}
            icon={<svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <ServiceCard
            title="Building Permit"
            description="New construction and renovation approval."
            href="/services/building-permit"
            isActive={true}
            icon={<svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          />
        </div>
      </section>

      {/* QR Access Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4" onClick={() => setIsQrModalOpen(false)}>
          <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-border p-8 text-center animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsQrModalOpen(false)} className="absolute top-5 right-5 text-muted hover:text-navy transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="mb-6 flex flex-col items-center gap-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm mb-2">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-navy">Offline QR Access</h2>
              <p className="text-sm font-medium text-muted/70 italic">Digital Kiosk Pass</p>
            </div>

            {isFetchingQr ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary mb-4" />
                <p className="text-xs font-bold text-navy animate-pulse">Retrieving Secure Pass...</p>
              </div>
            ) : qrData?.error ? (
              <div className="py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger mb-4">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-sm font-bold text-navy">{qrData.error}</p>
                <p className="mt-2 text-xs text-muted/70 leading-relaxed px-4">Submit an application first to generate your unique access pass.</p>
              </div>
            ) : qrData ? (
              <div className="space-y-6">
                <div className="relative mx-auto w-48 h-48 p-3 rounded-2xl bg-white border border-border bg-gradient-to-br from-primary/5 to-transparent shadow-sm overflow-hidden group">
                  <img src={qrData.qr_code_url} alt="Verification QR" className="h-full w-full rounded-lg mix-blend-multiply" />
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20" />
                </div>

                <div className="grid gap-2">
                  <div className="rounded-xl bg-background p-3 text-center border border-border">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted/60 mb-0.5">Verification Code</p>
                    <p className="font-mono text-base font-extrabold text-navy tracking-wider">{qrData.verification_code}</p>
                  </div>
                  <div className="rounded-xl bg-success/5 p-3 text-center border border-success/10">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-success/60 mb-0.5">Application Reference</p>
                    <p className="text-xs font-bold text-navy">{qrData.application_id} · {qrData.status.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4 text-left border border-primary/10">
                  <svg className="h-5 w-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-[11px] leading-relaxed text-navy/80">
                    Scan this QR at any <strong>CyberShield Government Kiosk</strong> for instant offline verification and certificate lookup.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-8">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-soft transition-all hover:bg-primary-dark hover:shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
