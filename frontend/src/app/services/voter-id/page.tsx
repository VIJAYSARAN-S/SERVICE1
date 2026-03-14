'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';

export default function VoterIDPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    dob: 'Confirmed 18+', // Just to maintain the privacy logic established earlier
    gender: 'Male',
    
    // Identity Verification
    aadhaar_number: '',
    mobile_number: '',
    photo_base64: '',
    
    // Address
    residential_address: '',
    city: '',
    state: '',
    pin_code: '',
    constituency: '',
    
    // Family Details
    guardian_name: '', // Father / Mother / Spouse
    signature_base64: '',
  });

  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
        setIsAgeConfirmed((e.target as HTMLInputElement).checked);
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgeConfirmed) {
      setError('You must confirm that you are 18 or older to apply.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await apiFetch(endpoints.voterId, {
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
    <div className="mx-auto max-w-4xl pb-20">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-navy">Voter ID Registration</h1>
        <div className="mt-6 flex items-start gap-4 rounded-xl border-l-4 border-primary bg-primary/5 p-4 text-sm text-navy/80">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>
            Please provide accurate information for your Voter ID registration. You must be at least 18 years old to apply.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-xl overflow-hidden">
        <div className="p-8">
          {error && (
            <div className="mb-8 rounded-lg bg-danger/10 p-4 text-sm font-medium text-danger animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* -- Personal Information -- */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">1</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Full Name*</label>
                  <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="John Doe" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Age Confirmation*</label>
                   <div className="flex items-center gap-2 py-3">
                      <input type="checkbox" checked={isAgeConfirmed} onChange={handleChange} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                      <span className="text-sm text-navy">I confirm I am 18 or older</span>
                   </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Gender*</label>
                  <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Passport Size Image*</label>
                  <div className="mt-1 flex items-center gap-4">
                    {formData.photo_base64 && (
                      <img src={formData.photo_base64} alt="Preview" className="h-20 w-16 object-cover rounded border" />
                    )}
                    <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'photo_base64')} className="block w-full text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-extrabold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* -- Identity Verification -- */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">2</span>
                Identity Verification
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Aadhaar Number*</label>
                  <input type="text" name="aadhaar_number" required value={formData.aadhaar_number} onChange={handleChange} placeholder="1234 5678 9012" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Mobile Number*</label>
                  <input type="tel" name="mobile_number" required value={formData.mobile_number} onChange={handleChange} placeholder="+91 9876543210" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* -- Address Details -- */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">3</span>
                Address Details
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Residential Address*</label>
                  <textarea name="residential_address" required rows={3} value={formData.residential_address} onChange={handleChange} placeholder="House No, Street, Landmark" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full rounded-xl border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">PIN Code</label>
                  <input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange} className="w-full rounded-xl border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Constituency (Optional Auto-Detect)</label>
                  <input type="text" name="constituency" value={formData.constituency} onChange={handleChange} placeholder="Enter your constituency" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* -- Family Details -- */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">4</span>
                Family Details
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Father / Mother / Spouse Name*</label>
                  <input type="text" name="guardian_name" required value={formData.guardian_name} onChange={handleChange} className="w-full rounded-xl border-border bg-background px-4 py-3 text-sm text-navy focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Signature*</label>
                   <div className="mt-1 flex items-center gap-4">
                    {formData.signature_base64 && (
                      <img src={formData.signature_base64} alt="Signature Preview" className="h-10 w-32 object-contain border bg-background" />
                    )}
                    <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'signature_base64')} className="block w-full text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-extrabold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all" />
                  </div>
                </div>
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
                  Submit Voter ID Application
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
