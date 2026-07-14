import React from 'react';
import { HeartPulse, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface EmergencyProps {
  onSave: (data: any) => void;
  initialData?: any;
  formId?: string;
}

export function EmergencyForm({ onSave, initialData = {}, formId }: EmergencyProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const sanitizePhone = (val: string) => val ? val.replace(/[^\d+]/g, '') : val;
    const data: any = Object.fromEntries(formData.entries());
    
    if (data.emergencyContactPhone) {
      data.emergencyContactPhone = sanitizePhone(data.emergencyContactPhone);
    }
    
    onSave(data);
  };

  return (
    <form id={formId || "onboarding-form"} onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      
      {/* Emergency Contacts */}
      <Card className="border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
          <Phone className="w-5 h-5 text-red-500" />
          <CardTitle className="text-lg font-bold text-slate-800">Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="space-y-4 p-4 border border-slate-100 bg-slate-50 rounded-xl">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Primary Contact</h4>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Name*</label>
                <Input name="emergencyContactName" type="text" placeholder="Full Name" required maxLength={100} pattern="[A-Za-z\s]+" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Phone*</label>
                <Input name="emergencyContactPhone" type="tel" placeholder="+91 9876543210" required pattern="^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$" title="Enter a valid Indian phone number" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Relationship*</label>
                <Input name="emergencyContactRelation" type="text" placeholder="e.g. Spouse, Parent" required maxLength={50} pattern="[A-Za-z\s]+" />
              </div>
            </div>

            <div className="space-y-4 p-4 border border-slate-100 rounded-xl">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Secondary Contact (Optional)</h4>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Name</label>
                <Input type="text" placeholder="Full Name" maxLength={100} pattern="[A-Za-z\s]+" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Phone</label>
                <Input type="tel" placeholder="+91 9876543210" pattern="^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$" title="Enter a valid Indian phone number" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Relationship</label>
                <Input type="text" placeholder="e.g. Sibling, Friend" maxLength={50} pattern="[A-Za-z\s]+" />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card className="border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg font-bold text-slate-800">Address Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Current Residential Address</label>
              <textarea placeholder="Enter full address" className="w-full h-24 p-3 rounded-md border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" maxLength={250} />
            </div>
            
            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700">Permanent Address</label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Same as current</span>
                </label>
              </div>
              <textarea placeholder="Enter permanent address" className="w-full h-24 p-3 rounded-md border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" maxLength={250} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Info */}
      <Card className="border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-500" />
          <CardTitle className="text-lg font-bold text-slate-800">Medical Information (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Blood Type</label>
              <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Known Allergies</label>
              <Input type="text" placeholder="e.g. Penicillin, Peanuts" maxLength={150} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Pre-existing Medical Conditions</label>
              <textarea placeholder="Any conditions emergency responders should know about..." className="w-full h-20 p-3 rounded-md border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-slate-900/20 outline-none transition-all" maxLength={500} />
            </div>
          </div>
        </CardContent>
      </Card>

    </form>
  );
}
