import React, { useState, useEffect } from 'react';
import { fetchJsonSafe } from '../../utils/api';
import {
  User as UserType,
  MedicalCard,
  HealthSurvey,
  CmsNotice,
  RepresentativeApplication
} from '../../types';
import { MedicalCardPrint } from '../MedicalCardPrint';
import {
  UserCheck,
  CreditCard,
  UserPlus,
  ClipboardList,
  Search,
  Bell,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Phone,
  Eye,
  Lock,
  HeartPulse,
  Target
} from 'lucide-react';

interface Props {
  user: UserType;
  onLogout: () => void;
}

export const RepresentativeDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'cards' | 'activation' | 'register' | 'survey' | 'search' | 'profile' | 'notifications'
  >('overview');

  const [cards, setCards] = useState<MedicalCard[]>([]);
  const [surveys, setSurveys] = useState<HealthSurvey[]>([]);
  const [notices, setNotices] = useState<CmsNotice[]>([]);
  const [selectedCard, setSelectedCard] = useState<MedicalCard | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Registration Form
  const [regForm, setRegForm] = useState({
    memberName: '',
    customCardId: '', // Pre-printed Card Number
    cardTier: 'Silver' as 'Silver' | 'Gold' | 'Platinum',
    beneficiaries: '',
    fatherName: '',
    motherName: '',
    bloodGroup: 'A+',
    mobile: '',
    address: 'গোপালগঞ্জ সদর',
    upazila: 'Gopalganj Sadar',
    district: 'Gopalganj',
    nidOrBirthCert: ''
  });
  const [regMsg, setRegMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Survey Form
  const [surveyForm, setSurveyForm] = useState({
    familyHeadName: '',
    mobile: '',
    district: 'Gopalganj',
    upazila: 'Gopalganj Sadar',
    familyMembersCount: 4,
    chronicDiseases: 'Diabetes, Hypertension',
    incomeGroup: 'Middle Class'
  });
  const [surveyMsg, setSurveyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [repProfile, setRepProfile] = useState<RepresentativeApplication | null>(null);

  useEffect(() => {
    fetchRepData();
  }, [user]);

  const fetchRepData = async () => {
    try {
      const [resCards, resSurveys, resNotices, resApps] = await Promise.all([
        fetchJsonSafe('/api/members', undefined, []),
        fetchJsonSafe('/api/surveys', undefined, []),
        fetchJsonSafe('/api/notices', undefined, []),
        fetchJsonSafe('/api/representatives/applications', undefined, [])
      ]);
      if (Array.isArray(resCards)) setCards(resCards);
      if (Array.isArray(resSurveys)) setSurveys(resSurveys);
      if (Array.isArray(resNotices)) setNotices(resNotices);
      if (Array.isArray(resApps)) {
        const found = resApps.find((a: RepresentativeApplication) => a.mobile === user.mobile || a.name === user.name);
        if (found) setRepProfile(found);
      }
    } catch (e) {
      console.error('Error loading representative data', e);
    }
  };

  // Card Activation
  const handleActivateCard = async (cardId: string) => {
    try {
      const res = await fetch(`/api/members/${cardId}/activate`, { method: 'PUT' });
      if (res.ok) {
        setCards(cards.map(c => c.cardId === cardId ? { ...c, status: 'ACTIVE' } : c));
      }
    } catch (e) {
      console.error('Activation failed', e);
    }
  };

  // Submit Family Registration
  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegMsg(null);

    try {
      const res = await fetch('/api/members/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regForm,
          beneficiaries: regForm.beneficiaries.split(',').map(s => s.trim())
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCards([data.card, ...cards]);
        setRegMsg({ type: 'success', text: `নতুন সদস্য কার্ড নিবন্ধিত হয়েছে! কার্ড আইডি: ${data.card.cardId}` });
        setRegForm({
          memberName: '',
          customCardId: '',
          cardTier: 'Silver',
          beneficiaries: '',
          fatherName: '',
          motherName: '',
          bloodGroup: 'A+',
          mobile: '',
          address: 'গোপালগঞ্জ সদর',
          upazila: 'Gopalganj Sadar',
          district: 'Gopalganj',
          nidOrBirthCert: ''
        });
      } else {
        const errData = await res.json();
        setRegMsg({ type: 'error', text: errData.error || 'নিবন্ধন জমা দেওয়া সম্ভব হয়নি।' });
      }
    } catch (e) {
      setRegMsg({ type: 'error', text: 'নিবন্ধন জমা দেওয়া সম্ভব হয়নি।' });
    }
  };

  // Submit Health Survey
  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSurveyMsg(null);

    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repName: user.name,
          familyHeadName: surveyForm.familyHeadName,
          mobile: surveyForm.mobile,
          district: surveyForm.district,
          upazila: surveyForm.upazila,
          familyMembersCount: Number(surveyForm.familyMembersCount),
          chronicDiseases: surveyForm.chronicDiseases.split(',').map(s => s.trim()),
          incomeGroup: surveyForm.incomeGroup
        })
      });

      if (res.ok) {
        const added = await res.json();
        setSurveys([added, ...surveys]);
        setSurveyMsg({ type: 'success', text: 'হেলথ সার্ভে সফলভাবে সেভ করা হয়েছে!' });
        setSurveyForm({
          familyHeadName: '',
          mobile: '',
          district: 'Gopalganj',
          upazila: 'Gopalganj Sadar',
          familyMembersCount: 4,
          chronicDiseases: 'Diabetes, Hypertension',
          incomeGroup: 'Middle Class'
        });
      }
    } catch (e) {
      setSurveyMsg({ type: 'error', text: 'সার্ভে জমা ব্যর্থ হয়েছে।' });
    }
  };

  const activeCards = cards.filter(c => c.status === 'ACTIVE');
  const pendingCards = cards.filter(c => c.status === 'PENDING');
  const filteredCards = cards.filter(c => {
    const matchesSearch =
      c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center font-extrabold text-slate-950 text-lg shadow-md">
              DMB
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide">
                মাঠ প্রতিনিধি পোর্টাল <span className="text-xs text-amber-400 font-normal">(Representative Dashboard)</span>
              </h1>
              <p className="text-[10px] text-slate-400">Field Operations & Community Health Representative</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-amber-300 font-mono">গোপালগঞ্জ ও নড়াইল ফিল্ড জোন</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer text-xs flex items-center gap-1.5 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
            <div className="p-3 bg-slate-900 text-white rounded-xl mb-3">
              <p className="font-bold text-xs truncate text-white">{user.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">অ্যাসাইনকৃত কার্ড: {cards.length} টি</p>
            </div>

            {[
              { id: 'overview', label: 'কর্মক্ষমতা ওভারভিউ', icon: TrendingUp },
              { id: 'cards', label: 'অ্যাসাইনকৃত কার্ডসমূহ', icon: CreditCard },
              { id: 'activation', label: 'কার্ড একটিভেশন', icon: CheckCircle2 },
              { id: 'register', label: 'নতুন পরিবার রেজিস্ট্রেশন', icon: UserPlus },
              { id: 'survey', label: 'স্বাস্থ্য জরিপ (Survey)', icon: ClipboardList },
              { id: 'search', label: 'সদস্য অনুসন্ধান', icon: Search },
              { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-amber-600 text-slate-950 font-black shadow-md'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN PANEL */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">মোট অ্যাসাইনকৃত কার্ড</p>
                    <p className="text-xl font-extrabold text-slate-900">{cards.length} টি</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">একটিভ কার্ড</p>
                    <p className="text-xl font-extrabold text-emerald-700">{activeCards.length} টি</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">পেন্ডিং একটিভেশন</p>
                    <p className="text-xl font-extrabold text-rose-600">{pendingCards.length} টি</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">জমা দেওয়া সার্ভে</p>
                    <p className="text-xl font-extrabold text-slate-900">{surveys.length} টি</p>
                  </div>
                </div>
              </div>

              {/* Target Goal Progress Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    এডমিন নির্ধারিত কার্ড বিতরণ টার্গেট (Target Progress)
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    কাজের অগ্রগতি
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Daily Target */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-900">দৈনিক টার্গেট</span>
                      <span className="font-mono font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                        {repProfile?.dailyTarget ? `${repProfile.dailyTarget} টি/দিন` : 'নির্ধারিত নয়'}
                      </span>
                    </div>
                    {repProfile?.dailyTarget ? (
                      <>
                        <div className="w-full bg-emerald-200/60 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (activeCards.length / repProfile.dailyTarget) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-[11px] text-emerald-800 font-semibold flex justify-between">
                          <span>অর্জিত: {activeCards.length} টি</span>
                          <span className="font-mono">{Math.round((activeCards.length / repProfile.dailyTarget) * 100)}%</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">কোনো দৈনিক টার্গেট সেট করা হয়নি</p>
                    )}
                  </div>

                  {/* Weekly Target */}
                  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-sky-900">সাপ্তাহিক টার্গেট</span>
                      <span className="font-mono font-extrabold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded">
                        {repProfile?.weeklyTarget ? `${repProfile.weeklyTarget} টি/সপ্তাহ` : 'নির্ধারিত নয়'}
                      </span>
                    </div>
                    {repProfile?.weeklyTarget ? (
                      <>
                        <div className="w-full bg-sky-200/60 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (activeCards.length / repProfile.weeklyTarget) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-[11px] text-sky-800 font-semibold flex justify-between">
                          <span>অর্জিত: {activeCards.length} টি</span>
                          <span className="font-mono">{Math.round((activeCards.length / repProfile.weeklyTarget) * 100)}%</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">কোনো সাপ্তাহিক টার্গেট সেট করা হয়নি</p>
                    )}
                  </div>

                  {/* Monthly Target */}
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-purple-900">মাসিক টার্গেট</span>
                      <span className="font-mono font-extrabold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded">
                        {repProfile?.monthlyTarget ? `${repProfile.monthlyTarget} টি/মাস` : 'নির্ধারিত নয়'}
                      </span>
                    </div>
                    {repProfile?.monthlyTarget ? (
                      <>
                        <div className="w-full bg-purple-200/60 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (activeCards.length / repProfile.monthlyTarget) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-[11px] text-purple-800 font-semibold flex justify-between">
                          <span>অর্জিত: {activeCards.length} টি</span>
                          <span className="font-mono">{Math.round((activeCards.length / repProfile.monthlyTarget) * 100)}%</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">কোনো মাসিক টার্গেট সেট করা হয়নি</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED CARDS */}
          {activeTab === 'cards' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    অ্যাসাইনকৃত কার্ড রেজিস্টার
                  </h3>
                  <p className="text-xs text-slate-500">আপনার অধীনস্থ জোনের নিবন্ধিত কার্ড ও মেম্বারশিপ তালিকা</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="নাম বা আইডি খুঁজুন..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="p-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="p-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold"
                  >
                    <option value="ALL">সকল স্ট্যাটাস</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b">
                      <th className="p-3">কার্ড আইডি</th>
                      <th className="p-3">সদস্যের নাম</th>
                      <th className="p-3">মোবাইল</th>
                      <th className="p-3">টায়ার</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCards.map(c => (
                      <tr key={c.cardId} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{c.cardId}</td>
                        <td className="p-3 font-semibold text-slate-800">{c.memberName}</td>
                        <td className="p-3 font-mono text-slate-600">{c.mobile}</td>
                        <td className="p-3 font-bold text-amber-700">{c.cardTier}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedCard(c)}
                            className="p-1.5 rounded bg-slate-900 text-white hover:bg-slate-800 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card View Modal */}
              {selectedCard && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="font-bold text-sm">ডিজিটাল কার্ড বিবরণ</h4>
                      <button onClick={() => setSelectedCard(null)} className="font-bold">✕</button>
                    </div>
                    <MedicalCardPrint card={selectedCard} showPrintButton={false} />
                    <button
                      onClick={() => setSelectedCard(null)}
                      className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CARD ACTIVATION */}
          {activeTab === 'activation' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                  ফিল্ড মেম্বারশিপ কার্ড একটিভেশন
                </h3>
                <p className="text-xs text-slate-500">পেন্ডিং আবেদনে সরাসরি মাঠে এক ক্লিকে কার্ড সক্রিয় করুন</p>
              </div>

              {pendingCards.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">কোনো পেন্ডিং একটিভেশন কার্ড নেই।</p>
              ) : (
                <div className="space-y-3">
                  {pendingCards.map(c => (
                    <div key={c.cardId} className="p-4 rounded-xl bg-slate-50 border flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{c.memberName} ({c.cardId})</p>
                        <p className="text-[11px] text-slate-500">{c.mobile} • {c.upazila}</p>
                      </div>
                      <button
                        onClick={() => handleActivateCard(c.cardId)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                      >
                        এক ক্লিকে সক্রিয় করুন
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FAMILY REGISTRATION */}
          {activeTab === 'register' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Field Enrollment Portal
                  </span>
                  <h3 className="font-black text-xl text-slate-900 mt-1 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-600" />
                    নতুন পরিবার ও মেম্বারশিপ কার্ড এনরোলমেন্ট
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    মাঠপর্যায়ে সরাসরি নতুন পরিবার নিবন্ধিত করুন এবং প্রয়োজন অনুযায়ী ইনস্ট্যান্ট এক্টিভ করে দিন।
                  </p>
                </div>
              </div>

              {regMsg && (
                <div className={`p-4 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-sm ${
                  regMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>{regMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleRegisterMember} className="space-y-6 text-xs">
                
                {/* Pre-printed Physical Card Number Input */}
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      প্রিন্ট করা প্লাস্টিক/পেপার কার্ড নম্বর (Physical Card ID)
                    </label>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                      মাঠপর্যায়ে হস্তান্তরিত কার্ড
                    </span>
                  </div>

                  <div className="flex items-center rounded-xl border border-amber-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-amber-500">
                    <span className="px-3.5 py-3 bg-amber-100 text-amber-900 font-mono font-black text-xs select-none border-r border-amber-300">
                      DMB-2026-
                    </span>
                    <input
                      type="text"
                      placeholder="1050 (খালি রাখলে অটো আইডি তৈরি হবে)"
                      value={regForm.customCardId.startsWith('DMB-2026-') ? regForm.customCardId.replace('DMB-2026-', '') : regForm.customCardId}
                      onChange={e => {
                        let val = e.target.value.toUpperCase();
                        if (val.startsWith('DMB-2026-')) val = val.replace('DMB-2026-', '');
                        setRegForm({
                          ...regForm,
                          customCardId: val ? `DMB-2026-${val}` : ''
                        });
                      }}
                      className="w-full p-3 bg-transparent text-slate-900 text-xs font-mono font-bold focus:outline-none placeholder:font-normal placeholder:text-slate-400 uppercase"
                    />
                  </div>

                  <p className="text-[11px] text-amber-800 leading-snug">
                    💡 <strong>ফিল্ড পরামর্শ:</strong> আপনার ব্যাগে থাকা ফিজিক্যাল কার্ড বিতরণ করলে শুধু কার্ডের শেষের ইউনিক সংখ্যাটি (যেমন: <span className="font-mono font-bold">1050</span>) লিখুন।
                  </p>
                </div>

                {/* Card Tier Selection Grid */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-extrabold text-slate-800">
                    মেম্বারশিপ কার্ড প্যাকেজ নির্বাচন করুন (Select Tier) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegForm({ ...regForm, cardTier: 'Silver' })}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        regForm.cardTier === 'Silver' ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm">🥈 সিলভার (Silver)</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">৳২০০</span>
                      </div>
                      <p className="text-[11px] opacity-80 mt-1">১টি পরিবারে সর্বোচ্চ ৪ জন কভার</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegForm({ ...regForm, cardTier: 'Gold' })}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        regForm.cardTier === 'Gold' ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-600' : 'bg-white text-slate-800 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm">🥇 গোল্ড (Gold)</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">৳৩৫০</span>
                      </div>
                      <p className="text-[11px] opacity-80 mt-1">১টি পরিবারে সর্বোচ্চ ৬ জন কভার</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegForm({ ...regForm, cardTier: 'Platinum' })}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        regForm.cardTier === 'Platinum' ? 'bg-sky-700 text-white border-sky-700 shadow-md ring-2 ring-sky-700' : 'bg-white text-slate-800 border-slate-200 hover:bg-sky-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm">💎 প্লাটিনাম (Platinum)</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900">৳৫০০</span>
                      </div>
                      <p className="text-[11px] opacity-80 mt-1">১টি পরিবারে সর্বোচ্চ ৮ জন কভার</p>
                    </button>
                  </div>
                </div>

                {/* Primary Member Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পরিবার প্রধানের পুরো নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                      value={regForm.memberName}
                      onChange={e => setRegForm({ ...regForm, memberName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      required
                      placeholder="01712345678"
                      value={regForm.mobile}
                      onChange={e => setRegForm({ ...regForm, mobile: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পিতার নাম</label>
                    <input
                      type="text"
                      placeholder="পিতার নাম"
                      value={regForm.fatherName}
                      onChange={e => setRegForm({ ...regForm, fatherName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মাতার নাম</label>
                    <input
                      type="text"
                      placeholder="মাতার নাম"
                      value={regForm.motherName}
                      onChange={e => setRegForm({ ...regForm, motherName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">রক্তের গ্রুপ</label>
                    <select
                      value={regForm.bloodGroup}
                      onChange={e => setRegForm({ ...regForm, bloodGroup: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">এনআইডি/জন্ম নিবন্ধন নম্বর</label>
                    <input
                      type="text"
                      placeholder="1990123456789"
                      value={regForm.nidOrBirthCert}
                      onChange={e => setRegForm({ ...regForm, nidOrBirthCert: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">জেলা</label>
                    <input
                      type="text"
                      value={regForm.district}
                      onChange={e => setRegForm({ ...regForm, district: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">উপজেলা/থানা</label>
                    <input
                      type="text"
                      value={regForm.upazila}
                      onChange={e => setRegForm({ ...regForm, upazila: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">গ্রাম/মহল্লা ও পূর্ণ ঠিকানা</label>
                    <input
                      type="text"
                      placeholder="যেমন: মৌলভিপাড়া, ওয়ার্ড ০৩, গোপালগঞ্জ সদর"
                      value={regForm.address}
                      onChange={e => setRegForm({ ...regForm, address: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      পরিবারের অন্তর্ভুক্ত অন্যান্য সদস্যদের নাম (কমা দিয়ে লিখুন)
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: মোসাম্মাৎ পারভীন বেগম (স্ত্রী), রাফিদ হোসেন (ছেলে)"
                      value={regForm.beneficiaries}
                      onChange={e => setRegForm({ ...regForm, beneficiaries: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-amber-400">ফিল্ড রেজিস্ট্রেশন সামারি</p>
                    <p className="text-sm font-extrabold mt-0.5">
                      {regForm.cardTier} Card • ফি: {regForm.cardTier === 'Silver' ? '৳২০০' : regForm.cardTier === 'Gold' ? '৳৩৫০' : '৳৫০০'}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
                  >
                    নিবন্ধন সম্পন্ন করুন
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 5: HEALTH SURVEY */}
          {activeTab === 'survey' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-amber-600" />
                  কমিউনিটি হেলথ সার্ভে সাবমিশন
                </h3>
                <p className="text-xs text-slate-500">মাঠপর্যায়ে পরিবারের স্বাস্থ্য তথ্য সংগ্রহ করুন</p>
              </div>

              {surveyMsg && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  surveyMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {surveyMsg.text}
                </div>
              )}

              <form onSubmit={handleSubmitSurvey} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-w-lg">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পরিবার প্রধানের নাম *</label>
                  <input
                    type="text"
                    required
                    value={surveyForm.familyHeadName}
                    onChange={e => setSurveyForm({ ...surveyForm, familyHeadName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">যোগাযোগের মোবাইল *</label>
                  <input
                    type="text"
                    required
                    value={surveyForm.mobile}
                    onChange={e => setSurveyForm({ ...surveyForm, mobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">পরিবারের সদস্য সংখ্যা</label>
                  <input
                    type="number"
                    value={surveyForm.familyMembersCount}
                    onChange={e => setSurveyForm({ ...surveyForm, familyMembersCount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জটিল রোগসমূহ (যদি থাকে)</label>
                  <input
                    type="text"
                    value={surveyForm.chronicDiseases}
                    onChange={e => setSurveyForm({ ...surveyForm, chronicDiseases: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow transition"
                  >
                    সার্ভে ডাটা জমা দিন
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: SEARCH */}
          {activeTab === 'search' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">সদস্য ও সুবিধাভোগী সার্চ</h3>
              <input
                type="text"
                placeholder="কার্ড আইডি বা নাম লিখুন..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-3 rounded-xl border bg-slate-50 text-xs font-mono"
              />
              <div className="space-y-2">
                {filteredCards.slice(0, 5).map(c => (
                  <div key={c.cardId} className="p-3 bg-slate-50 rounded-xl border text-xs flex justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{c.memberName} ({c.cardId})</p>
                      <p className="text-slate-500">{c.mobile} • {c.upazila}</p>
                    </div>
                    <span className="font-bold text-emerald-600">{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                ফিল্ড সার্ভিস আপডেট ও নোটিশ
              </h3>
              <div className="space-y-3">
                {notices.map(n => (
                  <div key={n.id} className="p-4 rounded-xl bg-slate-50 border text-xs space-y-1">
                    <p className="font-bold text-slate-900">{n.title}</p>
                    <p className="text-slate-600">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
