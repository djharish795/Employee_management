"use client";

import React, { useState } from 'react';
import { ShieldAlert, Check, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

interface DPDPAConsentModalProps {
  onConsentGiven: () => void;
}

export function DPDPAConsentModal({ onConsentGiven }: DPDPAConsentModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const queryClient = useQueryClient();

  const consentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/compliance/consents/me', {
        purpose: "ONBOARDING_PII_DATA_PROCESSING"
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dpdpa-consent-status'] });
      onConsentGiven();
    },
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 10;
    if (bottom && !hasScrolled) {
      setHasScrolled(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-indigo-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Data Privacy Consent (DPDPA)</h2>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1" onScroll={handleScroll}>
          <div className="prose prose-sm prose-slate max-w-none">
            <p className="font-semibold text-slate-800">
              Welcome to Naprocs! Before you proceed with your onboarding, we require your explicit consent to process your personal data in accordance with the Digital Personal Data Protection Act (DPDPA), 2023.
            </p>
            
            <h4 className="text-slate-900 mt-4 mb-2">1. Data We Collect</h4>
            <p>During your employment, we will collect and process Personally Identifiable Information (PII) including, but not limited to:</p>
            <ul>
              <li>Identity Documents (Aadhaar, PAN, Passport, Voter ID)</li>
              <li>Financial Information (Bank Account Details for Payroll)</li>
              <li>Contact Information (Address, Phone, Emergency Contacts)</li>
              <li>Background Verification Data</li>
            </ul>

            <h4 className="text-slate-900 mt-4 mb-2">2. Purpose of Processing</h4>
            <p>Your data will be exclusively used for:</p>
            <ul>
              <li>Employment administration and payroll processing</li>
              <li>Statutory compliance (Tax, PF, ESI)</li>
              <li>Background verification and security</li>
              <li>Providing employee benefits and insurance</li>
            </ul>

            <h4 className="text-slate-900 mt-4 mb-2">3. Data Security & Encryption</h4>
            <p>We employ AES-256-GCM encryption for all sensitive identifiers (like Aadhaar and Bank Accounts). Your data is stored securely in India (AWS Mumbai region) and is strictly access-controlled via Role-Based Access Control (RBAC).</p>

            <h4 className="text-slate-900 mt-4 mb-2">4. Your Rights</h4>
            <p>Under the DPDPA, you have the right to:</p>
            <ul>
              <li>Access and update your personal data</li>
              <li>Request erasure of your data (subject to legal retention requirements)</li>
              <li>Revoke this consent at any time (Note: Revocation may impact our ability to process payroll and employment benefits).</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-200">
          <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${accepted ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 hover:bg-slate-50'}`}>
            <div className="flex items-center h-5">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                disabled={!hasScrolled}
              />
            </div>
            <div className="text-sm">
              <span className={`font-semibold ${hasScrolled ? 'text-slate-900' : 'text-slate-400'}`}>
                I have read and understood the privacy policy.
              </span>
              <p className={`text-xs mt-1 ${hasScrolled ? 'text-slate-500' : 'text-slate-400'}`}>
                I explicitly consent to the collection, processing, and storage of my personal data for employment purposes.
              </p>
            </div>
          </label>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {!hasScrolled && "Please scroll to the bottom of the document to agree."}
            </span>
            <button
              onClick={() => consentMutation.mutate()}
              disabled={!accepted || consentMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {consentMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><Check className="w-4 h-4" /> Accept & Continue</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
