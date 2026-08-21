import React, { useState, useEffect } from 'react';
import { fetchJsonSafe } from '../../utils/api';
import {
  User as UserType,
  MedicalCard,
  HealthPackage,
  DiagnosticCenter,
  DiscountTransaction,
  MedicalReport,
  CmsNotice
} from '../../types';
import { MedicalCardPrint } from '../MedicalCardPrint';
import {
  CreditCard,
  UserCheck,
  FileText,
  Package,
  History,
  Building2,
  Bell,
  Users,
  LogOut,
  ShieldCheck,
  QrCode,
  Calendar,
  Lock,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  MapPin,
  Phone,
  HeartPulse,
  Printer,
  Star,
  AlertTriangle
} from 'lucide-react';

const isCardExpired = (card?: (MedicalCard & { validUntil?: string }) | null): boolean => {
  if (!card) return false;
  if (card.status === 'EXPIRED') return true;
  const exp = card.expiryDate || (card as any).validUntil;
  if (!exp) return false;
  if (typeof exp === 'string' && (exp.toLowerCase().includes('lifetime') || exp.includes('আজীবন'))) return false;
  const expTime = new Date(exp).getTime();
  if (isNaN(expTime)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expTime < today.getTime();
};

interface Props {
  user: UserType;
  onLogout: () => void;
  initialCards?: MedicalCard[];
  initialPackages?: HealthPackage[];
  initialCenters?: DiagnosticCenter[];
}

export const MemberDashboard: React.FC<Props> = ({
  user,
  onLogout,
  initialCards = [],
  initialPackages = [],
  initialCenters = []
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'card' | 'reports' | 'packages' | 'discounts' | 'partners' | 'notifications' | 'family'
  >('overview');

  const [card, setCard] = useState<MedicalCard | null>(null);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [packages, setPackages] = useState<HealthPackage[]>(initialPackages);
  const [centers, setCenters] = useState<DiagnosticCenter[]>(initialCenters);
  const [discounts, setDiscounts] = useState<DiscountTransaction[]>([]);
  const [notices, setNotices] = useState<CmsNotice[]>([]);

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    memberName: '',
    mobile: '',
    email: '',
    address: '',
    fatherName: '',
    motherName: ''
  });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter state for Partner Centers
  const [partnerSearch, setPartnerSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [reportFamilyFilter, setReportFamilyFilter] = useState<string>('ALL');

  // Review & Testimonial Modal State (Requirement #11)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    comment: '',
    rating: 5,
    role: 'সম্মানিত কার্ডধারী সদস্য',
    location: 'গোপালগঞ্জ'
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      alert('রিভিউ বক্তব্য পূরণ করা আবশ্যক।');
      return;
    }
    setReviewLoading(true);
    try {
      const res = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: card?.memberName || user.name,
          role: reviewForm.role,
          location: card?.district ? `${card.upazila}, ${card.district}` : reviewForm.location,
          comment: reviewForm.comment,
          rating: Number(reviewForm.rating),
          cardId: card?.cardId || ''
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'আপনার রিভিউ জমা নেওয়া হয়েছে!');
        setShowReviewModal(false);
        setReviewForm({ comment: '', rating: 5, role: 'সম্মানিত কার্ডধারী সদস্য', location: 'গোপালগঞ্জ' });
      } else {
        alert(data.error || 'রিভিউ সাবমিট ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার এরর');
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [user]);

  const fetchMemberData = async () => {
    try {
      // 1. Fetch member card info
      const resCards = await fetch('/api/members');
      if (resCards.ok) {
        const cardList: MedicalCard[] = await resCards.json();
        const userCard = cardList.find(
          c => c.memberId === user.memberId || c.mobile === user.mobile || c.email === user.email
        ) || cardList[0];
        if (userCard) {
          setCard(userCard);
          setProfileForm({
            memberName: userCard.memberName,
            mobile: userCard.mobile,
            email: userCard.email || '',
            address: userCard.address,
            fatherName: userCard.fatherName || '',
            motherName: userCard.motherName || ''
          });

          // Fetch member reports
          const resRpt = await fetch(`/api/medical-reports?cardId=${userCard.cardId}`);
          if (resRpt.ok) setReports(await resRpt.json());

          // Fetch member discount transactions
          const resTxn = await fetch('/api/discount-tracking');
          if (resTxn.ok) {
            const allTxns: DiscountTransaction[] = await resTxn.json();
            setDiscounts(allTxns.filter(t => t.cardId === userCard.cardId));
          }
        }
      }

      // 2. Fetch Centers, Packages, Notices
      const [resPkg, resCtr, resNotices] = await Promise.all([
        fetchJsonSafe('/api/health-packages', undefined, []),
        fetchJsonSafe('/api/diagnostic-centers', undefined, []),
        fetchJsonSafe('/api/notices', undefined, [])
      ]);
      if (Array.isArray(resPkg) && resPkg.length) setPackages(resPkg);
      if (Array.isArray(resCtr) && resCtr.length) setCenters(resCtr);
      if (Array.isArray(resNotices) && resNotices.length) setNotices(resNotices);
    } catch (e) {
      console.error('Error fetching member dashboard data', e);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    try {
      const res = await fetch(`/api/members/${card.cardId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        setProfileMsg({ type: 'success', text: 'প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!' });
        setCard(prev => prev ? { ...prev, ...profileForm } : null);
      } else {
        setProfileMsg({ type: 'error', text: 'আপডেট ব্যর্থ হয়েছে।' });
      }
    } catch (e) {
      setProfileMsg({ type: 'error', text: 'সার্ভার সংযোগ ত্রুটি।' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setProfileMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড দুটি মেলেনি!' });
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      setProfileMsg({ type: 'error', text: 'পাসওয়ার্ড অত্যন্ত ছোট! কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড ব্যবহার করুন।' });
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: user.mobile,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });
      if (res.ok) {
        setProfileMsg({ type: 'success', text: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।' });
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json();
        setProfileMsg({ type: 'error', text: data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' });
      }
    } catch (e) {
      setProfileMsg({ type: 'error', text: 'সার্ভার সংযোগ ত্রুটি।' });
    }
  };

  // Filter Centers
  const filteredCenters = centers.filter(c =>
    c.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
    c.district.toLowerCase().includes(partnerSearch.toLowerCase()) ||
    c.upazila.toLowerCase().includes(partnerSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center font-extrabold text-slate-950 text-lg shadow-md">
              DMB
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide">
                মেম্বার ড্যাশবোর্ড <span className="text-xs text-emerald-400 font-normal">(Member Portal)</span>
              </h1>
              <p className="text-[10px] text-slate-400">Digital Medi Bridge Healthcare Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-slate-200 font-medium">সক্রিয় সদস্য (Card Active)</span>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{card?.memberName || user.name}</p>
                <p className="text-[10px] font-mono text-amber-300">{card?.cardId || user.memberId || 'DMB-CARD'}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition cursor-pointer text-xs flex items-center gap-1.5 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
            <div className="p-3 bg-slate-900 text-white rounded-xl mb-3 flex items-center gap-3">
              <img
                src={card?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt="Member"
                className="w-12 h-12 rounded-lg object-cover border-2 border-emerald-400"
              />
              <div className="min-w-0">
                <p className="font-bold text-xs truncate text-white">{card?.memberName || user.name}</p>
                <span className="inline-block bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full mt-1">
                  {card?.cardTier || 'Silver'} Card
                </span>
              </div>
            </div>

            {[
              { id: 'overview', label: 'ড্যাশবোর্ড ওভারভিউ', icon: HeartPulse },
              { id: 'profile', label: 'আমার প্রোফাইল', icon: UserCheck },
              { id: 'card', label: 'ডিজিটাল মেডিক্যাল কার্ড', icon: CreditCard },
              { id: 'reports', label: 'মেডিক্যাল রিপোর্টসমূহ', icon: FileText },
              { id: 'family', label: 'পরিবারের সদস্যবৃন্দ', icon: Users },
              { id: 'packages', label: 'হেলথ প্যাকেজসমূহ', icon: Package },
              { id: 'discounts', label: 'ডিসকাউন্ট হিস্ট্রি', icon: History },
              { id: 'partners', label: 'পার্টনার ডায়াগনস্টিক', icon: Building2 },
              { id: 'notifications', label: 'নোটিশ ও নোটিফিকেশন', icon: Bell }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN DISPLAY AREA */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Expired Card Warning Alert if applicable */}
              {isCardExpired(card) && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-rose-500 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black">সতর্কতা: আপনার মেডিক্যাল কার্ডের মেয়াদ শেষ হয়েছে! (Card Expired)</h4>
                      <p className="text-xs text-rose-100 font-normal mt-0.5">
                        মেয়াদোত্তীর্ণের তারিখ: <strong className="font-mono text-amber-200">{card?.expiryDate}</strong>। পার্টনার হাসপাতাল ও ডায়াগনস্টিক সেন্টারে ডিসকাউন্ট সুবিধা চালু রাখতে কার্ডটি রিনিউ করুন।
                      </p>
                    </div>
                  </div>
                  <a
                    href="tel:+8809658887470"
                    className="px-4 py-2 rounded-xl bg-white text-rose-700 text-xs font-black hover:bg-rose-50 shadow transition cursor-pointer flex-shrink-0"
                  >
                    রিনিউ হেল্পলাইন
                  </a>
                </div>
              )}

              {/* Member Card Summary Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    {isCardExpired(card) ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> কার্ডের মেয়াদ শেষ হয়েছে (Expired)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> হেলথ মেম্বারশিপ এক্টিভ
                      </span>
                    )}
                    <h2 className="text-2xl font-extrabold text-white">{card?.memberName}</h2>
                    <p className="text-xs text-slate-300 flex items-center gap-2">
                      <span>CARD ID: <strong className="text-amber-300 font-mono">{card?.cardId}</strong></span>
                      <span>•</span>
                      <span>HEALTH ID: <strong className="text-sky-300 font-mono">{card?.memberId}</strong></span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300">
                        TIER: <strong className="text-emerald-400">{card?.cardTier}</strong>
                      </span>
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300">
                        EXPIRY: <strong className={isCardExpired(card) ? "text-rose-400 font-black" : "text-amber-300"}>{card?.expiryDate}</strong>
                      </span>
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300">
                        BLOOD GROUP: <strong className="text-rose-400">{card?.bloodGroup}</strong>
                      </span>
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-3.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md hover:scale-105"
                      >
                        <Star className="w-3.5 h-3.5 fill-slate-950" />
                        রিভিউ ও সার্ভিস রেটিং দিন
                      </button>
                    </div>
                  </div>

                  {/* QR Code Quick Card */}
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex flex-col items-center justify-center text-center">
                    {card?.qrCodeDataUrl ? (
                      <img src={card.qrCodeDataUrl} alt="QR" className="w-20 h-20 rounded-lg bg-white p-1" />
                    ) : (
                      <QrCode className="w-16 h-16 text-emerald-300" />
                    )}
                    <span className="text-[10px] font-mono font-semibold text-emerald-300 mt-1">VERIFIED QR</span>
                  </div>
                </div>
              </div>

              {/* Quick Action Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">মোট মেডিকেল রিপোর্ট</p>
                    <p className="text-xl font-extrabold text-slate-900">{reports.length} টি</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">মোট ডিসকাউন্ট ট্রানজেকশন</p>
                    <p className="text-xl font-extrabold text-slate-900">{discounts.length} টি</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">কভার করা সদস্য সীমা</p>
                    <p className="text-xl font-extrabold text-slate-900">{card?.memberLimit || 4} জন</p>
                  </div>
                </div>
              </div>

              {/* Recent Reports Preview */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    সাম্প্রতিক প্যাথলজি ও পরীক্ষা রিপোর্টসমূহ
                  </h3>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                  >
                    সবগুলো দেখুন →
                  </button>
                </div>

                {reports.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">এখনো কোনো রিপোর্ট আপলোড করা হয়নি।</p>
                ) : (
                  <div className="space-y-2">
                    {reports.map(r => (
                      <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{r.testName}</p>
                          <p className="text-[11px] text-slate-500">{r.centerName} • {r.reportDate}</p>
                        </div>
                        <button
                          onClick={() => { setSelectedReport(r); setActiveTab('reports'); }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition"
                        >
                          রিপোর্ট দেখুন
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    আমার মেম্বারশিপ প্রোফাইল তথ্য
                  </h3>
                  <p className="text-xs text-slate-500">আপনার ব্যক্তিগত তথ্য পর্যালোচনা এবং হালনাগাদ করুন</p>
                </div>

                {profileMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">সদস্যের পুরো নাম *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.memberName}
                      onChange={e => setProfileForm({ ...profileForm, memberName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.mobile}
                      onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পিতার নাম</label>
                    <input
                      type="text"
                      value={profileForm.fatherName}
                      onChange={e => setProfileForm({ ...profileForm, fatherName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মাতার নাম</label>
                    <input
                      type="text"
                      value={profileForm.motherName}
                      onChange={e => setProfileForm({ ...profileForm, motherName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ঠিকানা / এলাকা</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm cursor-pointer"
                    >
                      প্রোফাইল আপডেট করুন
                    </button>
                  </div>
                </form>

                {/* Password Change Form */}
                <div className="border-t border-slate-200 pt-6 space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    পাসওয়ার্ড পরিবর্তন করুন (Security Settings)
                  </h4>
                  <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">বর্তমান পাসওয়ার্ড</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.oldPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">নতুন পাসওয়ার্ড</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-3 pt-1">
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                      >
                        পাসওয়ার্ড সেভ করুন
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: DIGITAL MEDICAL CARD */}
          {activeTab === 'card' && card && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    আপনার ডিজিটাল মেডিক্যাল কার্ড
                  </h3>
                  <p className="text-xs text-slate-500">পার্টনার হাসপাতালে ও ডায়াগনস্টিক সেন্টারে ডিসকাউন্ট সুবিধা পেতে এটি প্রদর্শন করুন</p>
                </div>

                {isCardExpired(card) ? (
                  <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300" /> কার্ডের মেয়াদ শেষ হয়েছে (Expired)
                  </span>
                ) : card.status === 'ACTIVE' || card.status === 'APPROVED' ? (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> কার্ড স্ট্যাটাস: এক্টিভ (Active)
                  </span>
                ) : card.status === 'PENDING' ? (
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> কার্ড স্ট্যাটাস: পেন্ডিং (Pending Approval)
                  </span>
                ) : (
                  <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> কার্ড স্ট্যাটাস: প্রত্যাখ্যাত (Rejected)
                  </span>
                )}
              </div>

              {card.status === 'PENDING' ? (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6 animate-bounce" />
                  </div>
                  <h4 className="font-extrabold text-amber-900 text-sm">
                    ⏳ আপনার মেডিক্যাল কার্ডের আবেদনটি বর্তমানে এডমিন প্যানেলে পর্যালোচনায় রয়েছে (Pending Review)
                  </h4>
                  <p className="text-xs text-amber-800 max-w-xl mx-auto leading-relaxed">
                    আবেদন নম্বর: <strong className="font-mono">{card.cardId}</strong> | মোবাইল: <strong className="font-mono">{card.mobile}</strong><br />
                    এডমিন কর্তৃপক্ষ তথ্য যাচাই করে অনুমোদন (Approve) সম্পন্ন করলেই আপনার মোবাইল নম্বরে স্বয়ংক্রিয় Approval SMS পাঠানো হবে।
                    অনুমোদনের পর এখানে আপনার ডিজিটাল কার্ডটি দৃশ্যমান হবে এবং <strong>Print Card</strong> ও <strong>Download Card</strong> অপশন অ্যাক্টিভ হবে।
                  </p>
                </div>
              ) : card.status === 'REJECTED' ? (
                <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-rose-900 text-sm">আবেদনটি প্রত্যাখ্যাত হয়েছে (Application Rejected)</h4>
                  <p className="text-xs text-rose-700">
                    প্রয়োজনীয় তথ্যের অমিল বা অসম্পূর্ণ আবেদনের কারণে এটি বাতিল করা হয়েছে। অনুসন্ধানের জন্য হেল্পলাইনে কল করুন: <strong>+8809658887470</strong>
                  </p>
                </div>
              ) : (
                /* Renders standard Card component for Approved/Active Cards */
                <div className="flex justify-center">
                  <MedicalCardPrint card={card} showPrintButton={true} isMemberView={true} />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MEDICAL REPORTS */}
          {activeTab === 'reports' && (() => {
            const familyList = [
              card?.memberName || user.name,
              ...(card?.beneficiaries || [])
            ].filter(Boolean);

            const filteredReports = reports.filter(r => {
              if (reportFamilyFilter === 'ALL') return true;
              return r.memberName?.trim().toLowerCase() === reportFamilyFilter.trim().toLowerCase();
            });

            return (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      আমার ও পরিবারের মেডিকেল ও প্যাথলজি রিপোর্ট
                    </h3>
                    <p className="text-xs text-slate-500">ডিজিটাল মিডিয়া ব্রিজ পার্টনার সেন্টারে সম্পন্ন হওয়া সকল পরীক্ষার ডিজিটাল কপি</p>
                  </div>

                  {/* Family Member Filter Dropdown */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-600" /> সদস্য নির্বাচন:
                    </label>
                    <select
                      value={reportFamilyFilter}
                      onChange={e => setReportFamilyFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="ALL">সকল সদস্যের রিপোর্ট ({reports.length})</option>
                      {familyList.map((name, idx) => {
                        const count = reports.filter(r => r.memberName?.trim().toLowerCase() === name.trim().toLowerCase()).length;
                        return (
                          <option key={idx} value={name}>
                            {name} {idx === 0 ? '(মূল কার্ডধারী)' : '(পরিবারের সদস্য)'} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {filteredReports.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      {reportFamilyFilter === 'ALL'
                        ? 'কোনো ডিজিটাল রিপোর্ট পাওয়া যায়নি'
                        : `"${reportFamilyFilter}"-এর কোনো রিপোর্ট পাওয়া যায়নি`}
                    </p>
                    <p className="text-[11px] text-slate-500">পার্টনার ডায়াগনস্টিক রিপোর্ট আপলোড করলে এখানে দেখা যাবে।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredReports.map(r => (
                      <div key={r.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded">
                                {r.status}
                              </span>
                              {r.fileUrl && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  r.fileType === 'pdf' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                                }`}>
                                  {r.fileType === 'pdf' ? '📄 PDF' : '📷 Image'}
                                </span>
                              )}
                              <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                👤 {r.memberName || 'সদস্য'}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">{r.testName}</h4>
                            <p className="text-xs text-slate-500">{r.centerName}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{r.reportDate}</span>
                        </div>

                        {r.notes && (
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 font-mono">
                            <strong className="text-slate-900 block text-[10px]">উপসংহার/নোট:</strong>
                            {r.notes}
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedReport(r)}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> রিপোর্ট ভিউ ও ডাউনলোড করুন
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Report Modal */}
                {selectedReport && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <h3 className="font-bold text-base text-slate-900">{selectedReport.testName}</h3>
                          <p className="text-xs text-slate-500">{selectedReport.centerName} • {selectedReport.reportDate}</p>
                        </div>
                        <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
                      </div>

                      <div className="space-y-3 text-xs text-slate-700">
                        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border text-xs">
                          <p><strong>রোগীর নাম:</strong> {selectedReport.memberName}</p>
                          <p><strong>কার্ড নম্বর:</strong> <span className="font-mono text-emerald-700 font-bold">{selectedReport.cardId}</span></p>
                          <p><strong>ডায়াগনস্টিক:</strong> {selectedReport.centerName}</p>
                          <p><strong>আপলোডকারী:</strong> {selectedReport.uploadedBy}</p>
                        </div>

                        {/* PDF / Image Viewer */}
                        {selectedReport.fileUrl ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <strong className="text-slate-900">সংযুক্ত রিপোর্ট ডকুমেন্ট:</strong>
                              <a
                                href={selectedReport.fileUrl}
                                download={selectedReport.fileName || 'medical_report'}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1"
                              >
                                📥 ফাইল ডাউনলোড করুন
                              </a>
                            </div>

                            {selectedReport.fileType === 'pdf' || selectedReport.fileUrl.startsWith('data:application/pdf') ? (
                              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 p-2 text-center">
                                <iframe
                                  src={selectedReport.fileUrl}
                                  title="Report Document PDF"
                                  className="w-full h-80 rounded-xl border border-slate-200 bg-white"
                                />
                                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                                  PDF ডকুমেন্ট লোড না হলে উপরের "ফাইল ডাউনলোড" বাটনে ক্লিক করুন।
                                </p>
                              </div>
                            ) : (
                              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 p-2 text-center">
                                <img
                                  src={selectedReport.fileUrl}
                                  alt="Report Preview"
                                  className="max-h-80 w-auto mx-auto object-contain rounded-xl"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs font-semibold">
                            ⚠️ কোনো সংলগ্ন ফাইল পাওয়া যায়নি। ল্যাব থেকে শুধুমাত্র বিবরণ সংজোযন করা হয়েছে।
                          </div>
                        )}

                        {selectedReport.notes && (
                          <div className="p-3 bg-slate-50 rounded-xl border text-slate-800 font-mono">
                            <strong className="block text-slate-900 mb-1">ল্যাব ডাক্তারের মন্তব্য / পর্যবেক্ষণ:</strong>
                            {selectedReport.notes}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setSelectedReport(null)}
                          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
                        >
                          বন্ধ করুন
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 5: FAMILY MEMBERS */}
          {activeTab === 'family' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    FAMILY BENEFICIARIES (DISCOUNT ELIGIBLE)
                  </h3>
                  <p className="text-xs text-slate-500">আপনার {card?.cardTier} কার্ডের আওতায় কভারকৃত সদস্য তথ্য</p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                  সীমা: {card?.memberLimit || 4} জন পর্যন্ত
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(card?.beneficiaries || [card?.memberName || 'মূল সদস্য']).map((b, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{b}</p>
                      <p className="text-[10px] text-slate-500">স্ট্যাটাস: এক্টিভ ডিসকাউন্ট সুবিধাপ্রাপ্ত</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: HEALTH PACKAGES */}
          {activeTab === 'packages' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  উপলব্ধ DMB বিশেষ হেলথ প্যাকেজসমূহ
                </h3>
                <p className="text-xs text-slate-500">মেডিকেল কার্ড সদস্যদের জন্য বিশেষ ছাড়কৃত প্যাকেজ মূল্যে টেস্ট সুবিধা</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map(pkg => (
                  <div key={pkg.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 relative overflow-hidden">
                    {pkg.popular && (
                      <span className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase">
                        POPULAR
                      </span>
                    )}
                    <h4 className="font-bold text-sm text-slate-900">{pkg.title}</h4>
                    <p className="text-xs text-slate-600">{pkg.description}</p>

                    <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                      <p className="font-bold text-slate-700 text-[11px]">অন্তর্বুক্ত টেস্টসমূহ:</p>
                      <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                        {pkg.includedTests.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-xs text-slate-400 line-through">৳{pkg.regularPrice}</span>
                        <span className="text-lg font-extrabold text-emerald-600 ml-2">৳{pkg.dmbPrice} BDT</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        সাশ্রয়: ৳{pkg.regularPrice - pkg.dmbPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: DISCOUNT HISTORY */}
          {activeTab === 'discounts' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  আমার ডিসকাউন্ট গ্রহণের ইতিহাস
                </h3>
                <p className="text-xs text-slate-500">পার্টনার হাসপাতালে আপনার গৃহীত ছাড় ও সাশ্রয়ের পূর্ণাঙ্গ তালিকা</p>
              </div>

              {discounts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">এখনো কোনো ডিসকাউন্ট ট্রানজেকশন রিসিভ করেননি।</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">তারিখ ও রিসিট</th>
                        <th className="p-3">ডায়াগনস্টিক সেন্টার</th>
                        <th className="p-3">পরীক্ষাসমূহ</th>
                        <th className="p-3">মূল বিল</th>
                        <th className="p-3">ছাড়ের পরিমাণ</th>
                        <th className="p-3">পরিশোধিত মূল্য</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {discounts.map(d => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{d.date}</p>
                            <p className="font-mono text-[10px] text-slate-500">{d.receiptNo}</p>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">{d.centerName}</td>
                          <td className="p-3 text-slate-600">{d.testNames.join(', ')}</td>
                          <td className="p-3 text-slate-500 line-through">৳{d.originalAmount}</td>
                          <td className="p-3 font-bold text-emerald-600">৳{d.discountAmount}</td>
                          <td className="p-3 font-extrabold text-slate-900">৳{d.paidAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: PARTNER CENTERS */}
          {activeTab === 'partners' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    পার্টনার ডায়াগনস্টিক সেন্টার ও হাসপাতালসমূহ
                  </h3>
                  <p className="text-xs text-slate-500">যেসব ল্যাবে আপনি DMB কার্ড দিয়ে ৩০%-৫০% পর্যন্ত ছাড় পাবেন</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="উপজেলা বা নাম খুঁজুন..."
                    value={partnerSearch}
                    onChange={e => setPartnerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCenters.map(ctr => (
                  <div key={ctr.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{ctr.name}</h4>
                      <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded">
                        {ctr.discountPercentage}% ছাড়
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ctr.address}, {ctr.upazila}, {ctr.district}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {ctr.mobile}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-600" />
                  সিস্টেম নোটিশ ও গুরুত্বপূর্ণ আপডেট
                </h3>
              </div>

              <div className="space-y-3">
                {notices.map(n => (
                  <div key={n.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {n.type}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.date}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* SUBMIT REVIEW / TESTIMONIAL MODAL (Requirement #11) */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-5">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Member Testimonial & Review
              </span>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                আপনার অভিজ্ঞতা ও রিভিউ লিখুন
              </h3>
              <p className="text-xs text-slate-500">
                আমাদের স্বাস্থ্য সেবা, ডিসকাউন্ট ও মেম্বারশিপ সুবিধা কেমন লাগছে তা সংক্ষেপে জানিয়ে রিভিউ দিন।
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">আপনার নাম (স্বয়ংক্রিয়)</label>
                <input
                  type="text"
                  readOnly
                  value={card?.memberName || user.name}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">পরিচয় / ডেজিগনেশন</label>
                  <input
                    type="text"
                    value={reviewForm.role}
                    onChange={e => setReviewForm({ ...reviewForm, role: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    placeholder="যেমন: অবসরপ্রাপ্ত শিক্ষক / কার্ডধারী সদস্য"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">স্টার রেটিং (Rating)</label>
                  <select
                    value={reviewForm.rating}
                    onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-amber-600"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (৫ স্টার - চমৎকার)</option>
                    <option value={4}>⭐⭐⭐⭐ (৪ স্টার - খুব ভালো)</option>
                    <option value={3}>⭐⭐⭐ (৩ স্টার - ভালো)</option>
                    <option value={2}>⭐⭐ (২ স্টার - মোটামুঠি)</option>
                    <option value={1}>⭐ (১ স্টার - অসন্তোষজনক)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">আপনার রিভিউ বা মন্তব্য *</label>
                <textarea
                  rows={4}
                  required
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium leading-relaxed"
                  placeholder="যেমন: DMB মেডিক্যাল কার্ড দিয়ে পরীক্ষা করানোর পর আমার বেশ ভালো সাশ্রয় হয়েছে। সেবা এবং ডিসকাউন্ট ব্যবস্থা অনেক সহজ।"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {reviewLoading ? 'জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
