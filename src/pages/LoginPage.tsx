import React, { useState, useEffect } from 'react';
import {
  LogIn,
  User as UserIcon,
  ShieldCheck,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
  Copy,
  Check,
  ExternalLink,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface Props {
  onLoginSuccess: (user: UserType, token: string) => void;
  setActiveTab: (tab: string) => void;
}

const roleSlugMap: Record<string, UserRole> = {
  'super-admin': 'SUPER_ADMIN',
  'super_admin': 'SUPER_ADMIN',
  'admin': 'SUPER_ADMIN',
  'staff': 'ADMIN_STAFF',
  'admin_staff': 'ADMIN_STAFF',
  'partner': 'DIAGNOSTIC_PARTNER',
  'lab': 'DIAGNOSTIC_PARTNER',
  'member': 'MEDICAL_CARD_MEMBER',
  'card': 'MEDICAL_CARD_MEMBER',
  'representative': 'REPRESENTATIVE',
  'rep': 'REPRESENTATIVE',
  'doctor': 'DOCTOR',
  'doc': 'DOCTOR'
};

const roleToSlug: Record<UserRole, string> = {
  'SUPER_ADMIN': 'super-admin',
  'ADMIN_STAFF': 'staff',
  'DIAGNOSTIC_PARTNER': 'partner',
  'MEDICAL_CARD_MEMBER': 'member',
  'REPRESENTATIVE': 'representative',
  'DOCTOR': 'doctor'
};

const ROLE_INFO: Array<{
  role: UserRole;
  slug: string;
  title: string;
  icon: string;
  desc: string;
}> = [
  {
    role: 'SUPER_ADMIN',
    slug: 'super-admin',
    title: 'Super Admin',
    icon: '👑',
    desc: 'সিস্টেম ও নেটওয়ার্ক সম্পূর্ণ নিয়ন্ত্রণ'
  },
  {
    role: 'ADMIN_STAFF',
    slug: 'staff',
    title: 'Staff Admin',
    icon: '👨‍💼',
    desc: 'আবেদন ও সদস্য কার্ড ভেরিফিকেশন প্যানেল'
  },
  {
    role: 'DIAGNOSTIC_PARTNER',
    slug: 'partner',
    title: 'Partner Lab',
    icon: '🏥',
    desc: 'ডায়াগনস্টিক ডিসকাউন্ট ও ট্র্যাকিং'
  },
  {
    role: 'MEDICAL_CARD_MEMBER',
    slug: 'member',
    title: 'Card Member',
    icon: '💳',
    desc: 'ডিজিটাল হেলথ কার্ড ও ডিসকাউন্ট হিস্ট্রি'
  },
  {
    role: 'REPRESENTATIVE',
    slug: 'representative',
    title: 'Representative',
    icon: '🚩',
    desc: 'প্রতিনিধি পোর্টাল ও নতুন মেম্বার রেজিস্ট্রেশন'
  },
  {
    role: 'DOCTOR',
    slug: 'doctor',
    title: 'Doctor',
    icon: '🩺',
    desc: 'ডাক্তার প্যানেল ও রুগী ব্যবস্থাপনা'
  }
];

export const LoginPage: React.FC<Props> = ({ onLoginSuccess, setActiveTab }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [showDirectLinks, setShowDirectLinks] = useState(false);

  useEffect(() => {
    // Read URL query parameter ?role= or hash on load
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam && roleSlugMap[roleParam.toLowerCase()]) {
      const matchedRole = roleSlugMap[roleParam.toLowerCase()];
      handleRolePreset(matchedRole, false);
    } else {
      const hash = window.location.hash;
      if (hash.includes('role=')) {
        const match = hash.match(/role=([a-zA-Z0-9_-]+)/);
        if (match && match[1] && roleSlugMap[match[1].toLowerCase()]) {
          handleRolePreset(roleSlugMap[match[1].toLowerCase()], false);
        }
      }
    }
  }, []);

  const handleRolePreset = (role: UserRole, updateUrl = true) => {
    setSelectedRole(role);
    setError(null);

    if (updateUrl) {
      const slug = roleToSlug[role];
      if (slug) {
        const newUrl = `${window.location.pathname}?role=${slug}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }
    }
  };

  const copyRoleLink = (slug: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const origin = window.location.origin + window.location.pathname;
    const directUrl = `${origin}?role=${slug}`;
    navigator.clipboard.writeText(directUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let isServerHtmlResponse = false;
      let data: any = null;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailOrMobile,
            password,
            role: selectedRole
          })
        });

        const text = await res.text();
        if (text.trim().startsWith('<') || (!res.ok && text.trim().startsWith('<!'))) {
          isServerHtmlResponse = true;
        } else {
          try {
            data = JSON.parse(text);
          } catch (pErr) {
            isServerHtmlResponse = true;
          }
        }

        if (res.ok && data && data.user) {
          onLoginSuccess(data.user, data.token || 'auth-token-2026');
          setActiveTab('admin');
          return;
        }

        if (data && data.error) {
          throw new Error(data.error);
        }
      } catch (fetchErr: any) {
        if (fetchErr.message && !fetchErr.message.includes('Unexpected token') && !isServerHtmlResponse && data?.error) {
          throw fetchErr;
        }
        isServerHtmlResponse = true;
      }

      // If live backend API returned HTML or is unreachable
      if (isServerHtmlResponse) {
        throw new Error('সার্ভার রেসপন্স করছে না বা এপিআই কানেক্ট করা যায়নি। অনুগ্রহ করে সার্ভার কানেকশন চেক করুন।');
      }

      throw new Error('লগইন তথ্য সঠিক নয়। ইমেইল/মোবাইল ও পাসওয়ার্ড পুনরায় চেক করুন।');
    } catch (err: any) {
      setError(err.message || 'পাসওয়ার্ড বা তথ্য ভুল।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        
        {/* Top Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">DMB পোর্টাল লগইন</h1>
          <p className="text-xs text-slate-500">
            Digital Medi Bridge Healthcare Platform Access
          </p>
        </div>

        {/* Quick Role Selection Buttons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              লগইন রোল নির্বাচন করুন:
            </label>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-100">
              ?role={roleToSlug[selectedRole]}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {ROLE_INFO.map(item => (
              <button
                key={item.role}
                type="button"
                onClick={() => handleRolePreset(item.role)}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  selectedRole === item.role
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{item.icon} {item.title}</span>
                {selectedRole === item.role && (
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ইমেইল / মোবাইল / কার্ড আইডি
            </label>
            <input
              type="text"
              required
              placeholder="আপনার রেজিস্টার্ড ইমেইল বা মোবাইল নম্বর লিখুন"
              value={emailOrMobile}
              onChange={e => setEmailOrMobile(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">পাসওয়ার্ড</label>
            <input
              type="password"
              required
              placeholder="আপনার পাসওয়ার্ড প্রবেশ করান"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-sky-700 hover:from-blue-800 hover:to-sky-800 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'প্রবেশ করা হচ্ছে...' : 'পোর্টালে প্রবেশ করুন'}</span>
          </button>
        </form>

        {/* Section: Direct Role Links & URLs */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDirectLinks(!showDirectLinks)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-700 p-2 rounded-xl bg-slate-50 hover:bg-blue-50 transition cursor-pointer border border-slate-200"
          >
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>প্রতিটি রোলের আলাদা সরাসরি লিংকসমূহ (Direct URLs)</span>
            </span>
            {showDirectLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDirectLinks && (
            <div className="mt-3 space-y-2.5 text-xs animate-fadeIn">
              <p className="text-[11px] text-slate-500">
                নিচের যেকোনো রোলের "কপি লিংক" বাটনে ক্লিক করে সরাসরি লিংক কপি করতে পারবেন বা ব্রাউজারে শেয়ার করতে পারবেন:
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {ROLE_INFO.map(item => {
                  const currentOrigin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://health.nit.bd/';
                  const urlString = `${currentOrigin}?role=${item.slug}`;
                  const isCopied = copiedSlug === item.slug;

                  return (
                    <div
                      key={item.slug}
                      className={`p-3 rounded-2xl border transition ${
                        selectedRole === item.role
                          ? 'border-blue-300 bg-blue-50/60 ring-1 ring-blue-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                          <span>{item.icon}</span>
                          <span>{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({item.desc})</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => copyRoleLink(item.slug, e)}
                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-[10px] font-bold text-slate-700 transition flex items-center gap-1 cursor-pointer shadow-xs"
                            title="সরাসরি লিংক কপি করুন"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">কপি হয়েছে!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-blue-600" />
                                <span>কপি লিংক</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRolePreset(item.role)}
                            className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition cursor-pointer"
                          >
                            সিলেক্ট করুন
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-100 p-1.5 rounded-lg font-mono text-[10px] text-slate-600 break-all select-all flex items-center justify-between">
                        <span>{urlString}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 text-center text-[11px] text-slate-400">
          <p>DMB Healthcare Portal System Security • Version 2026</p>
        </div>

      </div>
    </div>
  );
};

