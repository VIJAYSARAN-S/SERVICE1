'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch, endpoints } from '@/lib/api';

export default function MarriageCertificatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    groom_name: '',
    groom_dob: '',
    groom_age: 0,
    groom_occupation: '',
    groom_aadhaar: '',
    groom_address: '',
    bride_name: '',
    bride_dob: '',
    bride_age: 0,
    bride_occupation: '',
    bride_aadhaar: '',
    bride_address: '',
    marriage_date: '',
    marriage_place: '',
    marriage_type: 'Hindu',
    registration_district: '',
    witness1_name: '',
    witness1_address: '',
    witness2_name: '',
    witness2_address: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: (name === 'groom_age' || name === 'bride_age') ? parseInt(value) || 0 : value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await apiFetch(endpoints.marriageCertificate, {
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
        <h1 className="text-4xl font-extrabold tracking-tight text-navy">Marriage Certificate Registration</h1>
        <p className="mt-2 text-muted">Register your marriage for legal status and documentation.</p>
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-xl overflow-hidden">
        <div className="p-8">
          {error && (
            <div className="mb-8 rounded-lg bg-danger/10 p-4 text-sm font-medium text-danger animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* -- Groom Details -- */}
            <section>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">1</span>
                Groom Details
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Groom Full Name*</label>
                  <input type="text" name="groom_name" required value={formData.groom_name} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Date of Birth*</label>
                    <input type="date" name="groom_dob" required value={formData.groom_dob} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Age*</label>
                    <input type="number" name="groom_age" required value={formData.groom_age} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Occupation</label>
                  <input type="text" name="groom_occupation" value={formData.groom_occupation} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Aadhaar Number*</label>
                  <input type="text" name="groom_aadhaar" required value={formData.groom_aadhaar} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Address*</label>
                  <textarea name="groom_address" required rows={2} value={formData.groom_address} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </section>

            {/* -- Bride Details -- */}
            <section>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">2</span>
                Bride Details
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Bride Full Name*</label>
                  <input type="text" name="bride_name" required value={formData.bride_name} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Date of Birth*</label>
                    <input type="date" name="bride_dob" required value={formData.bride_dob} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Age*</label>
                    <input type="number" name="bride_age" required value={formData.bride_age} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Occupation</label>
                  <input type="text" name="bride_occupation" value={formData.bride_occupation} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Aadhaar Number*</label>
                  <input type="text" name="bride_aadhaar" required value={formData.bride_aadhaar} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Address*</label>
                  <textarea name="bride_address" required rows={2} value={formData.bride_address} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </section>

            {/* -- Marriage Details -- */}
            <section>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">3</span>
                Marriage Details
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Date of Marriage*</label>
                  <input type="date" name="marriage_date" required value={formData.marriage_date} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Place of Marriage*</label>
                  <input type="text" name="marriage_place" required value={formData.marriage_place} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Marriage Type*</label>
                  <select name="marriage_type" value={formData.marriage_type} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none">
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Special Marriage Act">Special Marriage Act</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Registration District*</label>
                  <input type="text" name="registration_district" required value={formData.registration_district} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </section>

            {/* -- Witness Details -- */}
            <section>
              <h3 className="text-lg font-bold text-navy mb-6 pb-2 border-b border-border flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px]">4</span>
                Witness Details
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-4 p-4 border border-dashed border-border rounded-xl">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">Witness 1</label>
                    <input type="text" name="witness1_name" required placeholder="Full Name" value={formData.witness1_name} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                    <textarea name="witness1_address" required rows={2} placeholder="Address" value={formData.witness1_address} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="space-y-4 p-4 border border-dashed border-border rounded-xl">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted">Witness 2</label>
                    <input type="text" name="witness2_name" required placeholder="Full Name" value={formData.witness2_name} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                    <textarea name="witness2_address" required rows={2} placeholder="Address" value={formData.witness2_address} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark disabled:opacity-70"
            >
              {isLoading ? 'Processing Registration...' : 'Submit Marriage Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
