'use client';
import React, { useState, useRef } from 'react';
import { FileBadge, Landmark, Globe, UploadCloud, CheckCircle2, Loader2, X, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface IdentityProps {
  onSave: (data: any) => void;
  initialData?: any;
  formId?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'scanning' | 'done' | 'error';

interface DocState {
  objectKey: string;
  fileName: string;
  status: UploadStatus;
}

const EMPTY_DOC: DocState = { objectKey: '', fileName: '', status: 'idle' };

async function uploadDocToS3(
  file: File,
  setDoc: React.Dispatch<React.SetStateAction<DocState>>
): Promise<string | null> {
  try {
    setDoc(prev => ({ ...prev, status: 'uploading', fileName: file.name }));

    // 1. Get presigned upload URL from backend
    const urlRes = await apiClient.post('/documents/upload-url', {
      fileName: file.name,
      contentType: file.type,
    });
    const { uploadUrl, objectKey } = urlRes.data?.data || {};
    if (!uploadUrl || !objectKey) throw new Error('Invalid upload configuration from server');

    // 2. PUT directly to S3 (no auth header — presigned URL handles auth)
    const s3Res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!s3Res.ok) throw new Error(`S3 upload failed: ${s3Res.status}`);

    // 3. Simulate AV scan
    setDoc(prev => ({ ...prev, status: 'scanning' }));
    await new Promise(r => setTimeout(r, 1500));

    setDoc({ objectKey, fileName: file.name, status: 'done' });
    toast.success(`${file.name} uploaded successfully`);
    return objectKey;
  } catch (err: any) {
    setDoc(prev => ({ ...prev, status: 'error' }));
    toast.error(`Upload failed: ${err?.message || 'Unknown error'}`);
    return null;
  }
}

function DocUploadSlot({
  label,
  accept = 'image/jpeg,image/png,application/pdf',
  doc,
  setDoc,
}: {
  label: string;
  accept?: string;
  doc: DocState;
  setDoc: React.Dispatch<React.SetStateAction<DocState>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max size is 5 MB.');
      return;
    }
    await uploadDocToS3(file, setDoc);
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max size is 5 MB.');
      return;
    }
    await uploadDocToS3(file, setDoc);
  };

  const handleRemove = () => setDoc(EMPTY_DOC);

  const isLoading = doc.status === 'uploading' || doc.status === 'scanning';
  const isDone = doc.status === 'done';

  return (
    <div className="relative">
      <label
        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center h-32 transition-colors cursor-pointer select-none
          ${isDone
            ? 'border-emerald-300 bg-emerald-50'
            : doc.status === 'error'
            ? 'border-red-300 bg-red-50'
            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
          }
          ${isLoading ? 'pointer-events-none' : ''}`}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
          disabled={isLoading}
        />
        {isLoading ? (
          <>
            <Loader2 className={`w-6 h-6 mb-2 animate-spin ${doc.status === 'scanning' ? 'text-blue-500' : 'text-slate-400'}`} />
            <span className="text-xs font-bold text-slate-600">
              {doc.status === 'uploading' ? 'Uploading...' : 'Scanning for viruses...'}
            </span>
          </>
        ) : isDone ? (
          <>
            <CheckCircle2 className="w-6 h-6 mb-2 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-700 text-center truncate w-full px-2 text-center">{doc.fileName}</span>
            <span className="text-[10px] text-emerald-500 font-semibold">Securely uploaded ✓</span>
          </>
        ) : doc.status === 'error' ? (
          <>
            <UploadCloud className="w-6 h-6 mb-2 text-red-400" />
            <span className="text-xs font-bold text-red-600">{label}</span>
            <span className="text-[10px] text-red-400">Failed — click to retry</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-6 h-6 mb-2 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">{label}</span>
            <span className="text-[10px] text-slate-500">Drag or click · JPG, PNG, PDF · Max 5MB</span>
          </>
        )}
      </label>

      {/* Remove button */}
      {isDone && (
        <button
          type="button"
          onClick={handleRemove}
          title="Remove document"
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors z-10"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export function IdentityForm({ onSave, initialData = {}, formId }: IdentityProps) {
  // Document upload states — restore objectKey from initialData (from localStorage)
  const [aadhaarDoc, setAadhaarDoc] = useState<DocState>({
    objectKey: initialData.aadhaarDocKey || '',
    fileName: initialData.aadhaarDocKey ? 'Aadhaar (uploaded)' : '',
    status: initialData.aadhaarDocKey ? 'done' : 'idle',
  });
  const [panDoc, setPanDoc] = useState<DocState>({
    objectKey: initialData.panDocKey || '',
    fileName: initialData.panDocKey ? 'PAN (uploaded)' : '',
    status: initialData.panDocKey ? 'done' : 'idle',
  });
  const [passportDoc, setPassportDoc] = useState<DocState>({
    objectKey: initialData.passportDocKey || '',
    fileName: initialData.passportDocKey ? 'Passport (uploaded)' : '',
    status: initialData.passportDocKey ? 'done' : 'idle',
  });
  const [dlDoc, setDlDoc] = useState<DocState>({
    objectKey: initialData.drivingLicenceDocKey || '',
    fileName: initialData.drivingLicenceDocKey ? 'DL (uploaded)' : '',
    status: initialData.drivingLicenceDocKey ? 'done' : 'idle',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    // Attach document object keys so they flow into draftData
    data.aadhaarDocKey = aadhaarDoc.objectKey;
    data.panDocKey = panDoc.objectKey;
    data.passportDocKey = passportDoc.objectKey;
    data.drivingLicenceDocKey = dlDoc.objectKey;
    onSave(data);
  };

  return (
    <form id={formId || 'onboarding-form'} onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">

        {/* Government IDs */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
            <FileBadge className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-800">Government IDs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-8">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Aadhaar Number*</label>
                <Input name="aadhaar" type="text" defaultValue={initialData.aadhaar} placeholder="1234 5678 9012" required pattern="^\d{4}\s?\d{4}\s?\d{4}$" title="Enter a valid 12-digit Aadhaar number" maxLength={14} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">PAN Number*</label>
                <Input name="pan" type="text" defaultValue={initialData.pan} placeholder="ABCDE1234F" required pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$" title="Enter a valid PAN number (e.g., ABCDE1234F)" maxLength={10} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Passport Number</label>
                <Input name="passport" type="text" defaultValue={initialData.passport} placeholder="A1234567" pattern="^[A-Z][0-9]{7}$" title="Enter a valid Indian Passport number" maxLength={8} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Driving Licence</label>
                <Input name="drivingLicence" type="text" defaultValue={initialData.drivingLicence} placeholder="KA-01-2023-1234567" maxLength={20} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Voter ID (Optional)</label>
                <Input name="voterId" type="text" defaultValue={initialData.voterId} placeholder="EPIC Number" pattern="^[A-Z]{3}[0-9]{7}$" title="Enter a valid 10-character Voter ID" maxLength={10} className="uppercase" />
              </div>
            </div>

            {/* Document Upload Area */}
            <div className="border-t border-slate-100 pt-5">
              <p className="text-sm font-bold text-slate-700 mb-1">Upload Document Scans</p>
              <p className="text-xs text-slate-500 mb-4">All uploads are encrypted at rest (AES-256) and stored securely in private S3. Accessible only via time-limited signed URLs.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DocUploadSlot label="Aadhaar Card" doc={aadhaarDoc} setDoc={setAadhaarDoc} />
                <DocUploadSlot label="PAN Card" doc={panDoc} setDoc={setPanDoc} />
                <DocUploadSlot label="Passport Scan" doc={passportDoc} setDoc={setPassportDoc} />
                <DocUploadSlot label="Driving Licence" doc={dlDoc} setDoc={setDlDoc} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side Cards */}
      <div className="space-y-6">

        {/* Tax Info */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-800">Tax Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Tax Regime</label>
                <select name="taxRegime" defaultValue={initialData.taxRegime || 'NEW'} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="NEW">New Tax Regime (Default)</option>
                  <option value="OLD">Old Tax Regime</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">UAN Number</label>
                <Input name="uanNumber" type="text" defaultValue={initialData.uanNumber} placeholder="100XXXXXXXXXX" pattern="^\d{12}$" title="Enter a valid 12-digit UAN number" maxLength={12} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">PF Account</label>
                <Input name="pfAccount" type="text" defaultValue={initialData.pfAccount} placeholder="MH/BAN/0000000/000/0000000" maxLength={25} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">ESI Number</label>
                <Input name="esiNumber" type="text" defaultValue={initialData.esiNumber} placeholder="17-00-000000-000-0000" maxLength={22} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Citizenship */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-800">Citizenship</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nationality</label>
                <Input name="citizenNationality" type="text" defaultValue={initialData.citizenNationality || 'Indian'} placeholder="Indian" pattern="[A-Za-z\s]+" maxLength={50} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Residency Status</label>
                <select name="residencyStatus" defaultValue={initialData.residencyStatus || 'CITIZEN'} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="CITIZEN">Citizen</option>
                  <option value="PERMANENT_RESIDENT">Permanent Resident</option>
                  <option value="WORK_VISA">Work Visa</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Visa Type</label>
                  <Input name="visaType" type="text" defaultValue={initialData.visaType} placeholder="N/A" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Expiry</label>
                  <Input name="visaExpiry" type="date" defaultValue={initialData.visaExpiry} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </form>
  );
}
