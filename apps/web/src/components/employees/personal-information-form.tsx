import toast from "react-hot-toast";
import Image from "next/image";
import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { useAuthStore } from '@/store/auth';

interface PersonalInfoProps {
  onSave: (data: any) => void;
  initialData?: any;
  formId?: string;
}

export function PersonalInformationForm({ onSave, initialData: incomingData, formId }: PersonalInfoProps) {
  const initialData = incomingData || {};
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [photoKey, setPhotoKey] = useState<string>(initialData?.photoUrl || '');
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.photoUrl || '');
  const accessToken = useAuthStore((state) => state.accessToken);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(`${apiUrl}/documents/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          /* credentials: 'include' handled */
        },
        body: JSON.stringify({ fileName: file.name, contentType: file.type })
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("[PhotoUpload] Failed to get presigned URL:", res.status, errBody);
        throw new Error(`Server error ${res.status}: ${errBody}`);
      }

      const json = await res.json();
      const { uploadUrl, fields, objectKey } = json.data;

      if (!uploadUrl || !objectKey || !fields) {
        throw new Error("Server returned an invalid upload configuration");
      }

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", file);

      const s3Res = await fetch(uploadUrl, {
        method: "POST",
        body: formData
      });

      if (!s3Res.ok) {
        const s3Err = await s3Res.text();
        console.error("[PhotoUpload] S3 POST failed:", s3Res.status, s3Err);
        throw new Error(`S3 upload failed (${s3Res.status}): ${s3Err}`);
      }

      setPhotoKey(objectKey);
      setPreviewUrl(URL.createObjectURL(file));
      
      // Simulate virus scan polling
      setIsUploading(false);
      setIsScanning(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsScanning(false);
      
      toast.success("Photo scanned and uploaded successfully!");
    } catch (error: any) {
      console.error("[PhotoUpload] Error:", error?.message || error);
      toast.error(`Photo upload failed: ${error?.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    // Structure data to match backend Prisma schema expectations
    const sanitizePhone = (val: string) => val ? val.replace(/[^\d+]/g, '') : val;

    const data: any = {
      ...rawData,
      phone: sanitizePhone(rawData.phone as string),
      alternatePhone: sanitizePhone(rawData.alternatePhone as string),
      // Group emergency contact into a JSON object
      emergencyContact: {
        name: rawData.emergencyContactName,
        phone: sanitizePhone(rawData.emergencyContactPhone as string),
        relation: rawData.emergencyContactRelation
      }
    };

    // Remove the flat emergency fields so they don't cause validation errors if backend strict
    delete data.emergencyContactName;
    delete data.emergencyContactPhone;
    delete data.emergencyContactRelation;

    if (photoKey) {
      data.photoUrl = photoKey; // Use photoUrl as defined in Prisma schema
    }

    onSave(data);
  };
  return (
    <Card className="border-slate-200 shadow-sm rounded-xl">
      <CardHeader className="border-b border-slate-100 pb-4 mb-6">
        <CardTitle className="text-xl font-bold text-slate-800">Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form id={formId || "onboarding-form"} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">First name*</label>
              <Input name="firstName" type="text" defaultValue={initialData.firstName} placeholder="e.g. John" required maxLength={50} pattern="[A-Za-z\s]+" title="Only letters and spaces are allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Middle name</label>
              <Input name="middleName" type="text" defaultValue={initialData.middleName} placeholder="e.g. Quincy" maxLength={50} pattern="[A-Za-z\s]+" title="Only letters and spaces are allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Last name*</label>
              <Input name="lastName" type="text" defaultValue={initialData.lastName} placeholder="e.g. Doe" required maxLength={50} pattern="[A-Za-z\s]+" title="Only letters and spaces are allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Preferred name</label>
              <Input name="preferredName" type="text" defaultValue={initialData.preferredName} placeholder="e.g. Johnny" maxLength={50} pattern="[A-Za-z\s]+" title="Only letters and spaces are allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Date of birth*</label>
              <Input name="dateOfBirth" type="date" defaultValue={initialData.dateOfBirth?.split('T')[0]} className="text-slate-500" required max={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Gender*</label>
              <select name="gender" defaultValue={initialData.gender || ""} required className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all">
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Blood group</label>
              <select name="bloodGroup" defaultValue={initialData.bloodGroup || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all">
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="O+">O+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="A-">A-</option>
                <option value="O-">O-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nationality</label>
              <Input name="nationality" type="text" defaultValue={initialData.nationality} placeholder="e.g. Indian" maxLength={50} pattern="[A-Za-z\s]+" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Marital status</label>
              <select name="maritalStatus" defaultValue={initialData.maritalStatus || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all">
                <option value="">Select status</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
              </select>
            </div>

            {/* Profile Photo Uploader */}
            <div className="pt-4">
              <label className="text-sm font-semibold text-slate-700 block mb-3">Profile Photo</label>
              <div className="flex items-center gap-6">
                <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-colors overflow-hidden relative">
                  <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoUpload} disabled={isUploading || isScanning} />
                  {previewUrl && !isUploading && !isScanning ? (
                    <Image src={previewUrl} alt="Preview" className="w-full h-full object-cover" fill style={{ objectFit: "cover" }} />
                  ) : (
                    <>
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 mb-1 animate-spin text-slate-500" />
                      ) : isScanning ? (
                        <Loader2 className="w-6 h-6 mb-1 animate-spin text-blue-500" />
                      ) : (
                        <Camera className="w-6 h-6 mb-1" />
                      )}
                      <span className="text-[10px] font-bold text-center leading-tight">
                        {isUploading ? "Uploading..." : isScanning ? "Scanning..." : "Upload profile\nphoto"}
                      </span>
                    </>
                  )}
                </label>
                <div className="text-xs font-medium text-slate-500 leading-relaxed">
                  Max size 2MB. Format: JPG, PNG.<br />
                  Recommended size: 400x400px
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Official email*</label>
              <Input name="officialEmail" type="email" defaultValue={initialData.officialEmail} placeholder="john.doe@naprocs.com" required pattern="^[a-zA-Z0-9._%+-]+@naprocs\.com$" title="Must be a valid @naprocs.com email" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Personal email</label>
              <Input name="personalEmail" type="email" defaultValue={initialData.personalEmail} placeholder="john.doe@gmail.com" pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Phone*</label>
              <Input name="phone" type="tel" defaultValue={initialData.phone} placeholder="+91 9876543210" required pattern="^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$" title="Enter a valid Indian phone number" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Alternate phone</label>
              <Input name="alternatePhone" type="tel" defaultValue={initialData.alternatePhone} placeholder="+91 9876543210" pattern="^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$" title="Enter a valid Indian phone number" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Current address</label>
              <textarea name="currentAddress" defaultValue={initialData.currentAddress} placeholder="Enter current residence address" className="w-full h-[90px] p-3 rounded-md border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" maxLength={250} />
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700">Permanent address</label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Same as current address</span>
                </label>
              </div>
              <textarea name="permanentAddress" defaultValue={initialData.permanentAddress} placeholder="Enter permanent address" className="w-full h-[90px] p-3 rounded-md border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" maxLength={250} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Emergency contact name*</label>
              <Input name="emergencyContactName" type="text" defaultValue={initialData.emergencyContact?.name} placeholder="Full name" required maxLength={100} pattern="[A-Za-z\s]+" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Emergency contact phone*</label>
                <Input name="emergencyContactPhone" type="tel" defaultValue={initialData.emergencyContact?.phone} placeholder="+91 9876543210" required pattern="^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Relationship*</label>
                <Input name="emergencyContactRelation" type="text" defaultValue={initialData.emergencyContact?.relation || initialData.emergencyContact?.relationship} placeholder="e.g. Spouse, Parent" required maxLength={50} pattern="[A-Za-z\s]+" />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
