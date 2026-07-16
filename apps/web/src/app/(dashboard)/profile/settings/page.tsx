"use client";
import Image from "next/image";

import React, { useEffect, useState } from 'react';
import { Shield, User, Lock, Smartphone, Key, Settings as SettingsIcon, Loader2, Save, Eye, EyeOff, MapPin, Briefcase } from 'lucide-react';
import { fetchMyProfile, updateMyProfile, changePassword } from '@/lib/api/profile';
import { useAuthStore } from '@/store/auth';

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState<'personal' | 'official' | 'contact' | 'security' | 'preferences'>('personal');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const setPhotoUrl = useAuthStore((state) => state.setPhotoUrl);
  
  // Security Tab State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchMyProfile();
      // Ensure JSON objects exist
      if (!data.currentAddress) data.currentAddress = { street: '', city: '', state: '', zip: '' };
      if (!data.permanentAddress) data.permanentAddress = { street: '', city: '', state: '', zip: '' };
      if (!data.emergencyContact) data.emergencyContact = { name: '', relationship: '', phone: '' };

      data.emailNotifications = data.emailNotifications ?? (localStorage.getItem('pref_email') !== 'false');
      data.pushNotifications = data.pushNotifications ?? (localStorage.getItem('pref_push') !== 'false');

      setProfile(data);
      if (data.photoUrl !== undefined) {
        setPhotoUrl(data.photoUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('pref_email', profile?.emailNotifications);
        localStorage.setItem('pref_push', profile?.pushNotifications);
      }

      await updateMyProfile({
        phone: profile?.phone,
        personalEmail: profile?.personalEmail,
        preferredName: profile?.preferredName,
        bloodGroup: profile?.bloodGroup,
        currentAddress: profile?.currentAddress,
        permanentAddress: profile?.permanentAddress,
        emergencyContact: profile?.emergencyContact,
        gender: profile?.gender,
        dateOfBirth: profile?.dateOfBirth,
        maritalStatus: profile?.maritalStatus,
        photoUrl: profile?.photoUrl
      });
      if (profile?.photoUrl !== undefined) {
        setPhotoUrl(profile?.photoUrl);
      }
      alert('Profile updated successfully!');
      await loadProfile();
    } catch (e) {
      console.error(e);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoRemove = () => {
    setProfile({ ...profile, photoUrl: null });
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      setSaving(true);
      await changePassword({ currentPassword, newPassword });
      alert('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      console.error(e);
      alert('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const fullName = profile ? `${profile.firstName || ''} ${profile.middleName || ''} ${profile.lastName || ''}`.replace(/\s+/g, ' ').trim() : 'Loading...';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto transition-colors">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-8 py-8 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="relative group w-24 h-24 shrink-0">
              <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center overflow-hidden">
                {profile?.photoUrl ? (
                  <Image src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" fill style={{ objectFit: "cover" }} />
                ) : (
                  <User className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                )}
              </div>
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                <span className="text-xs font-semibold">Edit</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            {profile?.photoUrl && (
              <button onClick={handlePhotoRemove} className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider transition-colors focus:outline-none">
                Remove
              </button>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {profile?.preferredName || fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-slate-400 dark:text-slate-500" /> {profile?.employeeId || 'N/A'}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500" /> {profile?.designation?.title || 'N/A'}</span>
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" /> {profile?.department?.name || 'N/A'}</span>
              <span className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full">{profile?.officialEmail || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 space-y-1">
          <button onClick={() => setActiveTab('personal')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-semibold transition-all ${activeTab === 'personal' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
            <User className="w-5 h-5" /> Personal Info
          </button>
          <button onClick={() => setActiveTab('official')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-semibold transition-all ${activeTab === 'official' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
            <Briefcase className="w-5 h-5" /> Official Info
          </button>
          <button onClick={() => setActiveTab('contact')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-semibold transition-all ${activeTab === 'contact' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
            <MapPin className="w-5 h-5" /> Contact Details
          </button>
          <button onClick={() => setActiveTab('security')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-semibold transition-all ${activeTab === 'security' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
            <Key className="w-5 h-5" /> Security & Auth
          </button>
          <button onClick={() => setActiveTab('preferences')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-semibold transition-all ${activeTab === 'preferences' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
            <SettingsIcon className="w-5 h-5" /> Preferences
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 min-h-[500px] transition-colors relative">
          
          {/* PERSONAL TAB */}
          {activeTab === 'personal' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Preferred Name</label>
                  <input type="text" value={profile?.preferredName || ''} onChange={(e) => setProfile({...profile, preferredName: e.target.value})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Blood Group</label>
                  <input type="text" value={profile?.bloodGroup || ''} onChange={(e) => setProfile({...profile, bloodGroup: e.target.value})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Personal Email</label>
                  <input type="email" value={profile?.personalEmail || ''} onChange={(e) => setProfile({...profile, personalEmail: e.target.value})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Mobile Number</label>
                  <input type="text" value={profile?.phone || ''} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Gender</label>
                  <select value={profile?.gender || ''} onChange={(e) => setProfile({...profile, gender: e.target.value})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all [&>option]:bg-white dark:[&>option]:bg-slate-900">
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Date of Birth</label>
                  <input type="date" value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''} onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value ? new Date(e.target.value).toISOString() : null})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Marital Status</label>
                  <select value={profile?.maritalStatus || ''} onChange={(e) => setProfile({...profile, maritalStatus: e.target.value})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all [&>option]:bg-white dark:[&>option]:bg-slate-900">
                    <option value="">Select Status</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* OFFICIAL TAB */}
          {activeTab === 'official' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Official Information <Lock className="inline w-4 h-4 text-slate-400" /></h2>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-6 text-sm text-slate-600 dark:text-slate-400 font-medium transition-colors">
                These fields are read-only. Please contact HR to request any changes.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Employee ID</label>
                  <input type="text" readOnly value={profile?.employeeId || 'N/A'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Company Email</label>
                  <input type="text" readOnly value={profile?.officialEmail || 'N/A'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Department</label>
                  <input type="text" readOnly value={profile?.department?.name || 'N/A'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Designation</label>
                  <input type="text" readOnly value={profile?.designation?.title || 'N/A'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Team</label>
                  <input type="text" readOnly value={'Engineering'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Reporting Manager</label>
                  <input type="text" readOnly value={profile?.reportingManager ? `${profile.reportingManager.firstName} ${profile.reportingManager.lastName}` : 'N/A'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Date of Joining</label>
                  <input type="text" readOnly value={profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Salary Grade</label>
                  <input type="text" readOnly value={profile?.grade || 'N/A'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Employment Type</label>
                  <input type="text" readOnly value={profile?.employeeType || 'N/A'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Office Location</label>
                  <input type="text" readOnly value={profile?.workLocation || 'N/A'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Employee Status</label>
                  <input type="text" readOnly value={profile?.status || 'N/A'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Shift Timings</label>
                  <input type="text" readOnly value={profile?.shiftTimings || 'Standard (09:00 AM - 06:00 PM)'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium focus:outline-none transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h2>
              
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">Current Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Street</label>
                  <input type="text" value={profile?.currentAddress?.street || ''} onChange={(e) => setProfile({...profile, currentAddress: {...profile.currentAddress, street: e.target.value}})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">City</label>
                  <input type="text" value={profile?.currentAddress?.city || ''} onChange={(e) => setProfile({...profile, currentAddress: {...profile.currentAddress, city: e.target.value}})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">State</label>
                    <input type="text" value={profile?.currentAddress?.state || ''} onChange={(e) => setProfile({...profile, currentAddress: {...profile.currentAddress, state: e.target.value}})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">ZIP Code</label>
                    <input type="text" value={profile?.currentAddress?.zip || ''} onChange={(e) => setProfile({...profile, currentAddress: {...profile.currentAddress, zip: e.target.value}})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Contact Name</label>
                  <input type="text" value={profile?.emergencyContact?.name || ''} onChange={(e) => setProfile({...profile, emergencyContact: {...profile.emergencyContact, name: e.target.value}})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Relationship</label>
                  <input type="text" value={profile?.emergencyContact?.relationship || ''} onChange={(e) => setProfile({...profile, emergencyContact: {...profile.emergencyContact, relationship: e.target.value}})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Contact Number</label>
                  <input type="text" value={profile?.emergencyContact?.phone || ''} onChange={(e) => setProfile({...profile, emergencyContact: {...profile.emergencyContact, phone: e.target.value}})} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Security & Auth</h2>
              
              <div className="mb-10">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">Change Password</h3>
                <div className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Current Password</label>
                    <div className="relative">
                      <input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all pr-10" />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none">
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">New Password</label>
                    <div className="relative">
                      <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all pr-10" />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all pr-10" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button onClick={handleChangePassword} disabled={saving || !currentPassword || !newPassword} className="w-full bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                  </button>
                </div>
              </div>

              <hr className="my-8 border-slate-100 dark:border-slate-800 transition-colors" />
              
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Authenticator App</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Not configured (Future update)</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-full">Coming Soon</span>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="max-w-md">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Language</label>
                    <select className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                      <option value="en">English (United States)</option>
                      <option value="uk">English (United Kingdom)</option>
                      <option value="hi">Hindi (India)</option>
                    </select>
                  </div>

                  <div className="max-w-md">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Time Zone</label>
                    <select className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Date Format</label>
                      <select className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Time Format</label>
                      <select className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                        <option value="12h">12-hour (AM/PM)</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 h-full">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Notification Preferences</label>
                    <div className="space-y-6">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications' },
                        { key: 'smsNotifications', label: 'SMS Notifications' },
                        { key: 'projectUpdates', label: 'Project Updates' },
                        { key: 'leaveApprovalNotifications', label: 'Leave Approval Notifications' },
                        { key: 'attendanceReminders', label: 'Attendance Reminders' },
                        { key: 'taskAssignmentAlerts', label: 'Task Assignment Alerts' },
                        { key: 'announcementNotifications', label: 'Announcement Notifications' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</span>
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={profile?.[item.key] ?? false} 
                              onChange={(e) => setProfile({ ...profile, [item.key]: e.target.checked })} 
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer for Editable Tabs */}
          {['personal', 'contact', 'preferences'].includes(activeTab) && (
            <div className="absolute bottom-8 right-8 animate-in fade-in">
              <button onClick={handleUpdateProfile} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
