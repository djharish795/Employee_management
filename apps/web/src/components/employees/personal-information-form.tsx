import React from 'react';
import { Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

export function PersonalInformationForm() {
  return (
    <Card className="border-slate-200 shadow-sm rounded-xl">
      <CardHeader className="border-b border-slate-100 pb-4 mb-6">
        <CardTitle className="text-xl font-bold text-slate-800">Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">First name*</label>
              <Input type="text" placeholder="e.g. John" required maxLength={50} pattern="[A-Za-z\s]+" title="Only letters and spaces are allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Middle name</label>
              <Input type="text" placeholder="e.g. Quincy" maxLength={50} pattern="[A-Za-z\s]+" title="Only letters and spaces are allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Last name*</label>
              <Input type="text" placeholder="e.g. Doe" required maxLength={50} pattern="[A-Za-z\s]+" title="Only letters and spaces are allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Preferred name</label>
              <Input type="text" placeholder="e.g. Johnny" maxLength={50} pattern="[A-Za-z\s]+" title="Only letters and spaces are allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Date of birth*</label>
              <Input type="date" className="text-slate-500" required max={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Gender*</label>
              <select required className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Blood group</label>
              <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all">
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
              <Input type="text" placeholder="e.g. Indian" maxLength={50} pattern="[A-Za-z\s]+" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Marital status</label>
              <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all">
                <option value="">Select status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>

            {/* Profile Photo Uploader */}
            <div className="pt-4">
              <label className="text-sm font-semibold text-slate-700 block mb-3">Profile Photo</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-colors">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold text-center leading-tight">Upload profile<br/>photo</span>
                </div>
                <div className="text-xs font-medium text-slate-500 leading-relaxed">
                  Max size 2MB. Format: JPG, PNG.<br/>
                  Recommended size: 400x400px
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Official email*</label>
              <Input type="email" placeholder="john.doe@naprocs.com" required pattern="^[a-zA-Z0-9._%+-]+@naprocs\.com$" title="Must be a valid @naprocs.com email" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Personal email</label>
              <Input type="email" placeholder="john.doe@gmail.com" pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Phone*</label>
              <Input type="tel" placeholder="+91 9876543210" required pattern="^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$" title="Enter a valid Indian phone number" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Alternate phone</label>
              <Input type="tel" placeholder="+91 9876543210" pattern="^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$" title="Enter a valid Indian phone number" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Current address</label>
              <textarea placeholder="Enter current residence address" className="w-full h-[90px] p-3 rounded-md border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" maxLength={250} />
            </div>
            
            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700">Permanent address</label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Same as current address</span>
                </label>
              </div>
              <textarea placeholder="Enter permanent address" className="w-full h-[90px] p-3 rounded-md border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" maxLength={250} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Emergency contact name*</label>
              <Input type="text" placeholder="Full name" required maxLength={100} pattern="[A-Za-z\s]+" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Emergency contact phone*</label>
                <Input type="tel" placeholder="+91 9876543210" required pattern="^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Relationship*</label>
                <Input type="text" placeholder="e.g. Spouse, Parent" required maxLength={50} pattern="[A-Za-z\s]+" />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
