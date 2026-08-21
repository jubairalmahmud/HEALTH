import React from 'react';
import { HeartPulse, MapPin, Phone, Mail, ShieldCheck, Award, ArrowRight, ExternalLink } from 'lucide-react';
import { SiteSettings } from '../../types';

interface Props {
  setActiveTab: (tab: string) => void;
  siteSettings?: SiteSettings | null;
}

export const Footer: React.FC<Props> = ({ setActiveTab, siteSettings }) => {
  const helpline = siteSettings?.hotline || siteSettings?.phone || '+8809658887470';
  const email = siteSettings?.email || 'health@nit.bd';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {siteSettings?.logoUrl ? (
                <img
                  src={siteSettings.logoUrl}
                  alt={siteSettings.siteName || 'Logo'}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 bg-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center font-bold">
                  <HeartPulse className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-white font-extrabold text-lg">{siteSettings?.siteName || 'Digital Medi Bridge (DMB)'}</h3>
                <p className="text-xs text-sky-400 font-medium">{siteSettings?.siteTagline || 'Healthcare Service Platform & Medical Network'}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pr-4">
              Digital Medi Bridge (DMB) হলো নড়াইল, গোপালগঞ্জ ও সিলেট জেলায় বাস্তবায়িত একটি ডিজিটাল হেলথকেয়ার প্লাটফর্ম। 
              আমাদের উদ্দেশ্য সারাদেশে একটি ডায়নামিক, সাশ্রয়ী ও বিশ্বস্ত ডায়াগনস্টিক ও হাসপাতাল নেটওয়ার্ক গড়ে তোলা।
            </p>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" /> নড়াইল, গোপালগঞ্জ ও সিলেট পাইলট জোন
              </div>
              <p className="text-slate-300 text-[11px] pl-6">
                গোপালগঞ্জ (বেডগ্রাম), নড়াইল (জেল রোড) ও সিলেট (জিন্দাবাজার পয়েন্ট) আঞ্চলিক সেবা কেন্দ্রসমূহ।
              </p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">গুরুত্বপূর্ণ লিঙ্ক</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> আমাদের সম্পর্কে
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('team')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> আমাদের টিম
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('services')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> DMB সেবাসমূহ
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('medical-card')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> মেডিক্যাল কার্ড সুবিধা
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('apply')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> নতুন কার্ডের আবেদন
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('rep-register')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> ফিল্ড প্রতিনিধি নিবন্ধন
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('verify')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> কার্ড ভেরিফিকেশন
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Healthcare Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">ডায়াগনস্টিক ও টেস্ট</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('diagnostic')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> পার্টনার সেন্টার খুঁজুন
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('test-prices')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> ডায়াগনস্টিক টেস্ট ফি তালিকা
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('packages')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> হেলথ চেকআপ প্যাকেজ
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('partner')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> পার্টনার নিবন্ধনের আবেদন
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('blog')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> স্বাস্থ্য সচেতনতা নিবন্ধ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Emergency */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">হটলাইন ও সহায়তা</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">হেল্পলাইন (২৪/৭):</p>
                  <p className="font-mono text-white font-bold text-sm">{helpline}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">ইমেইল সাপোর্ট:</p>
                  <p className="text-sky-300 font-mono">{email}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('contact')}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition cursor-pointer text-center"
                >
                  সরাসরি বার্তা পাঠান
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Digital Medi Bridge (DMB). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('faq')} className="hover:underline">FAQ</button>
            <button onClick={() => setActiveTab('contact')} className="hover:underline">Gopalganj Office</button>
            <span className="text-emerald-400 font-semibold">Healthcare Network Phase 1</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
