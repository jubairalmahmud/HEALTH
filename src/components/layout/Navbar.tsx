import React, { useState, useEffect } from 'react';
import { fetchJsonSafe } from '../../utils/api';
import {
  HeartPulse,
  Menu,
  X,
  CreditCard,
  ShieldCheck,
  Search,
  Building2,
  FileText,
  Package,
  PhoneCall,
  User,
  LayoutDashboard,
  Globe,
  LogIn
} from 'lucide-react';
import { User as UserType, BannerSettings, SiteSettings } from '../../types';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType | null;
  onLogout: () => void;
  siteSettings?: SiteSettings | null;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, user, onLogout, siteSettings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'BN' | 'EN'>('BN');
  const [internalSettings, setInternalSettings] = useState<SiteSettings | null>(siteSettings || null);
  const [banner, setBanner] = useState<BannerSettings>({
    badgeText: 'PILOT PROJECT',
    noticeText: 'গোপালগঞ্জ, নড়াইল ও সিলেট জেলায় পাইলট প্রজেক্ট চালু রয়েছে! সিলভার, গোল্ড ও প্লাটিনাম মেম্বারশিপ কার্ডে ৩০% ছাড় পেতে আজই আবেদন করুন।',
    hotline: '+8809658887470',
    email: 'health@nit.bd',
    enabled: true,
    speed: 'normal'
  });

  useEffect(() => {
    if (siteSettings) {
      setInternalSettings(siteSettings);
    } else {
      fetchJsonSafe('/api/site-settings').then(data => {
        if (data) setInternalSettings(data);
      });
    }
  }, [siteSettings]);

  useEffect(() => {
    fetchJsonSafe('/api/banner-settings').then(data => {
      if (data && data.noticeText) setBanner(data);
    });
  }, []);

  const nl = internalSettings?.navLabels || {};

  const navItems = [
    { id: 'home', label: nl.home || (language === 'BN' ? 'হোম' : 'Home') },
    { id: 'about', label: nl.about || (language === 'BN' ? 'আমাদের সম্পর্কে' : 'About DMB') },
    { id: 'team', label: language === 'BN' ? 'আমাদের টিম' : 'Our Team' },
    { id: 'services', label: nl.services || (language === 'BN' ? 'সেবাসমূহ' : 'Services') },
    { id: 'medical-card', label: nl.medicalCard || (language === 'BN' ? 'মেডিক্যাল কার্ড' : 'Medical Card') },
    { id: 'apply', label: nl.applyCard || (language === 'BN' ? 'কার্ডের আবেদন' : 'Apply Card') },
    { id: 'rep-register', label: nl.notice || (language === 'BN' ? 'বিজ্ঞপ্তি' : 'Notice') },
    { id: 'diagnostic', label: nl.diagnosticCenter || (language === 'BN' ? 'ডায়াগনস্টিক সেন্টার' : 'Diagnostics') },
    { id: 'test-prices', label: nl.testPrices || (language === 'BN' ? 'টেস্ট ফি তালিকা' : 'Test Prices') },
    { id: 'packages', label: nl.packages || (language === 'BN' ? 'হেলথ প্যাকেজ' : 'Health Packages') },
    { id: 'partner', label: language === 'BN' ? 'পার্টনার হোন' : 'Partner' },
    { id: 'events', label: language === 'BN' ? 'ইভент গ্যালারি' : 'Event Gallery' },
    { id: 'blog', label: language === 'BN' ? 'হেলথ টিপস' : 'Health Tips' },
    { id: 'faq', label: language === 'BN' ? 'FAQ' : 'FAQ' },
    { id: 'contact', label: language === 'BN' ? 'যোগাযোগ' : 'Contact' },
  ];

  const moreNavItems = [
    { id: 'partner', label: language === 'BN' ? 'পার্টনার হোন' : 'Partner' },
    { id: 'events', label: language === 'BN' ? 'ইভেন্ট গ্যালারি' : 'Event Gallery' },
    { id: 'blog', label: language === 'BN' ? 'হেলথ টিপস' : 'Health Tips' },
    { id: 'faq', label: language === 'BN' ? 'FAQ' : 'FAQ' },
    { id: 'contact', label: language === 'BN' ? 'যোগাযোগ' : 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm">
      {/* Top Banner Notice */}
      {banner.enabled && (
        <div className="bg-gradient-to-r from-blue-900 via-sky-800 to-emerald-800 text-white py-1.5 px-4 text-xs overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Badge & Scrolling Marquee */}
            <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
              {banner.badgeText && (
                <span className="bg-emerald-500 text-white font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full flex-shrink-0 animate-pulse shadow-sm z-10">
                  {banner.badgeText}
                </span>
              )}

              {/* Marquee Wrapper */}
              <div className="relative w-full overflow-hidden whitespace-nowrap">
                <div
                  className="animate-marquee hover:[animation-play-state:paused] cursor-pointer inline-flex"
                  style={{
                    animationDuration: banner.speed === 'slow' ? '35s' : banner.speed === 'fast' ? '12s' : '22s'
                  }}
                >
                  <span className="text-sky-100 font-medium pr-12">
                    {banner.noticeText}
                  </span>
                  <span className="text-sky-100 font-medium pr-12">
                    {banner.noticeText}
                  </span>
                </div>
              </div>
            </div>

            {/* Hotline & Language */}
            <div className="hidden md:flex items-center gap-4 text-[11px] flex-shrink-0 z-10">
              {banner.hotline && (
                <a href={`tel:${banner.hotline}`} className="hover:underline flex items-center gap-1 font-mono">
                  <PhoneCall className="w-3 h-3 text-emerald-400" /> হটলাইন: {banner.hotline}
                </a>
              )}
              {banner.email && (
                <a href={`mailto:${banner.email}`} className="hover:underline flex items-center gap-1 font-mono text-sky-200">
                  মেইল: {banner.email}
                </a>
              )}
              <button
                onClick={() => setLanguage(l => l === 'BN' ? 'EN' : 'BN')}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition cursor-pointer font-semibold"
              >
                <Globe className="w-3 h-3" /> {language === 'BN' ? 'English' : 'বাংলা'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {siteSettings?.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt={siteSettings.siteName || 'Logo'}
                className="w-11 h-11 rounded-2xl object-cover border border-sky-200 shadow-md group-hover:scale-105 transition-transform bg-white"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                  {siteSettings?.siteName || 'DMB'}
                </span>
                {(!siteSettings?.siteName || siteSettings.siteName.includes('DMB') || siteSettings.siteName.includes('Healthcare')) && (
                  <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-1.5 py-0.5 rounded border border-blue-200">
                    Healthcare
                  </span>
                )}
              </div>
              <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                {siteSettings?.siteTagline || 'Digital Medi Bridge'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-medium text-slate-700 whitespace-nowrap">
            {/* Home */}
            <button
              onClick={() => handleNavClick('home')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'home'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {nl.home || (language === 'BN' ? 'হোম' : 'Home')}
            </button>

            {/* Dropdown 1: আমাদের ও সেবা ▾ */}
            <div className="relative group">
              <button
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-medium whitespace-nowrap ${
                  activeTab === 'about' || activeTab === 'team' || activeTab === 'services'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {nl.aboutGroup || (language === 'BN' ? 'আমাদের ও সেবা ▾' : 'About & Services ▾')}
              </button>
              <div className="absolute left-0 top-full pt-1.5 w-48 hidden group-hover:flex flex-col z-50">
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 flex flex-col overflow-hidden">
                  <button
                    onClick={() => handleNavClick('about')}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-sky-50 transition cursor-pointer whitespace-nowrap ${
                      activeTab === 'about' ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-700'
                    }`}
                  >
                    {nl.about || (language === 'BN' ? 'আমাদের সম্পর্কে' : 'About DMB')}
                  </button>
                  <button
                    onClick={() => handleNavClick('team')}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-sky-50 transition cursor-pointer whitespace-nowrap ${
                      activeTab === 'team' ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-700'
                    }`}
                  >
                    {language === 'BN' ? 'আমাদের টিম' : 'Our Team'}
                  </button>
                  <button
                    onClick={() => handleNavClick('services')}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-sky-50 transition cursor-pointer whitespace-nowrap ${
                      activeTab === 'services' ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-700'
                    }`}
                  >
                    {nl.services || (language === 'BN' ? 'সেবাসমূহ' : 'Services')}
                  </button>
                </div>
              </div>
            </div>

            {/* Dropdown 2: মেডিক্যাল কার্ড ▾ */}
            <div className="relative group">
              <button
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-medium whitespace-nowrap ${
                  activeTab === 'medical-card' || activeTab === 'apply'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {nl.cardGroup || (language === 'BN' ? 'মেডিক্যাল কার্ড ▾' : 'Medical Card ▾')}
              </button>
              <div className="absolute left-0 top-full pt-1.5 w-48 hidden group-hover:flex flex-col z-50">
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 flex flex-col overflow-hidden">
                  <button
                    onClick={() => handleNavClick('medical-card')}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-sky-50 transition cursor-pointer whitespace-nowrap ${
                      activeTab === 'medical-card' ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-700'
                    }`}
                  >
                    {nl.medicalCard || (language === 'BN' ? 'মেডিক্যাল কার্ড' : 'Medical Card')}
                  </button>
                  <button
                    onClick={() => handleNavClick('apply')}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-sky-50 transition cursor-pointer whitespace-nowrap ${
                      activeTab === 'apply' ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-700'
                    }`}
                  >
                    {nl.applyCard || (language === 'BN' ? 'কার্ডের আবেদন' : 'Apply for Card')}
                  </button>
                </div>
              </div>
            </div>

            {/* Direct Link: বিজ্ঞপ্তি */}
            <button
              onClick={() => handleNavClick('rep-register')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'rep-register'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {nl.notice || (language === 'BN' ? 'বিজ্ঞপ্তি' : 'Notice')}
            </button>

            {/* Dropdown 3: ডায়াগনস্টিক & টেস্ট ▾ */}
            <div className="relative group">
              <button
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-medium whitespace-nowrap ${
                  activeTab === 'diagnostic' || activeTab === 'test-prices' || activeTab === 'packages'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {nl.diagnosticGroup || (language === 'BN' ? 'ডায়াগনস্টিক & টেস্ট ▾' : 'Diagnostics & Tests ▾')}
              </button>
              <div className="absolute left-0 top-full pt-1.5 w-52 hidden group-hover:flex flex-col z-50">
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 flex flex-col overflow-hidden">
                  <button
                    onClick={() => handleNavClick('diagnostic')}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-sky-50 transition cursor-pointer whitespace-nowrap ${
                      activeTab === 'diagnostic' ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-700'
                    }`}
                  >
                    {nl.diagnosticCenter || (language === 'BN' ? 'ডায়াগনস্টিক সেন্টার' : 'Diagnostic Center')}
                  </button>
                  <button
                    onClick={() => handleNavClick('test-prices')}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-sky-50 transition cursor-pointer whitespace-nowrap ${
                      activeTab === 'test-prices' ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-700'
                    }`}
                  >
                    {nl.testPrices || (language === 'BN' ? 'টেস্ট ফি তালিকা' : 'Test Price List')}
                  </button>
                  <button
                    onClick={() => handleNavClick('packages')}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-sky-50 transition cursor-pointer whitespace-nowrap ${
                      activeTab === 'packages' ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-700'
                    }`}
                  >
                    {nl.packages || (language === 'BN' ? 'হেলথ প্যাকেজ' : 'Health Packages')}
                  </button>
                </div>
              </div>
            </div>

            {/* Dropdown 4: আরও ▾ */}
            <div className="relative group">
              <button
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-medium whitespace-nowrap ${
                  moreNavItems.some(i => i.id === activeTab)
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {nl.moreGroup || (language === 'BN' ? 'আরও ▾' : 'More ▾')}
              </button>
              <div className="absolute right-0 top-full pt-1.5 w-48 hidden group-hover:flex flex-col z-50">
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 flex flex-col overflow-hidden">
                  {moreNavItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-sky-50 transition cursor-pointer whitespace-nowrap ${
                        activeTab === item.id ? 'text-blue-700 font-bold bg-blue-50' : 'text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Right Action / Auth Button */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => handleNavClick('verify')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-semibold text-xs transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {nl.verifyBtn || (language === 'BN' ? 'কার্ড ভেরিফাই' : 'Verify Card')}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('admin')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-sky-700 text-white font-semibold text-xs shadow hover:opacity-90 transition cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_STAFF' ? 'Admin Dashboard' : 'User Portal'}
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-rose-600 hover:underline px-2 py-1 font-medium cursor-pointer"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {nl.loginBtn || (language === 'BN' ? 'লগইন / পোর্টাল' : 'Login / Portal')}
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 pt-2 pb-3">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-xs"
              >
                <LayoutDashboard className="w-4 h-4" /> ড্যাশবোর্ডে প্রবেশ করুন
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow"
              >
                <LogIn className="w-4 h-4" /> লগইন করুন (Member / Admin / Partner)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
