import React, { useState, useEffect } from 'react';
import { fetchJsonSafe } from '../../utils/api';
import {
  User as UserType,
  MedicalCard,
  MedicalReport,
  Prescription,
  CmsNotice
} from '../../types';
import {
  Stethoscope,
  Users,
  FileText,
  FilePlus,
  Search,
  Bell,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  HeartPulse,
  PlusCircle,
  Trash2,
  Calendar,
  Lock,
  Eye,
  Activity
} from 'lucide-react';

interface Props {
  user: UserType;
  onLogout: () => void;
}

export const DoctorDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'patients' | 'prescription' | 'reports' | 'profile' | 'notifications'
  >('overview');

  const [cards, setCards] = useState<MedicalCard[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [notices, setNotices] = useState<CmsNotice[]>([]);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<MedicalCard | null>(null);

  // New Prescription State
  const [rxForm, setRxForm] = useState({
    cardId: '',
    diagnosis: '',
    medicines: [
      { name: 'Tab. Seclo 20mg', dosage: '1+0+1', duration: '14 days', instruction: 'খাবারের ২০ মি: আগে' }
    ],
    advice: 'পর্যাপ্ত বিশ্রাম নিন এবং তেল-মসলাযুক্ত খাবার এড়িয়ে চলুন।'
  });
  const [rxMsg, setRxMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Doctor Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    bmdcNo: 'BMDC-A-48392',
    specialty: 'মেডিসিন ও কার্ডিওলজি বিশেষজ্ঞ',
    chamber: 'পপুলার ডায়াগনস্টিক সেন্টার, চেম্বার ৩, গোপালগঞ্জ',
    mobile: user.mobile
  });
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchDoctorData();
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      const [resCards, resRx, resRpt, resNotices] = await Promise.all([
        fetchJsonSafe('/api/members', undefined, []),
        fetchJsonSafe('/api/prescriptions', undefined, []),
        fetchJsonSafe('/api/medical-reports', undefined, []),
        fetchJsonSafe('/api/notices', undefined, [])
      ]);
      if (Array.isArray(resCards)) setCards(resCards);
      if (Array.isArray(resRx)) setPrescriptions(resRx);
      if (Array.isArray(resRpt)) setReports(resRpt);
      if (Array.isArray(resNotices)) setNotices(resNotices);
    } catch (e) {
      console.error('Error loading doctor dashboard data', e);
    }
  };

  // Add Medicine Row
  const handleAddMedicine = () => {
    setRxForm({
      ...rxForm,
      medicines: [
        ...rxForm.medicines,
        { name: '', dosage: '1+0+1', duration: '7 days', instruction: 'খাবারের পর' }
      ]
    });
  };

  // Remove Medicine Row
  const handleRemoveMedicine = (index: number) => {
    setRxForm({
      ...rxForm,
      medicines: rxForm.medicines.filter((_, i) => i !== index)
    });
  };

  // Medicine Change
  const handleMedicineChange = (index: number, field: string, value: string) => {
    const updated = [...rxForm.medicines];
    (updated[index] as any)[field] = value;
    setRxForm({ ...rxForm, medicines: updated });
  };

  // Submit Prescription
  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setRxMsg(null);

    if (!rxForm.cardId || !rxForm.diagnosis) {
      setRxMsg({ type: 'error', text: 'রোগীর কার্ড আইডি এবং ডায়াগনসিস তথ্য দিন।' });
      return;
    }

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: rxForm.cardId,
          doctorName: profileForm.name,
          bmdcNo: profileForm.bmdcNo,
          diagnosis: rxForm.diagnosis,
          medicines: rxForm.medicines,
          advice: rxForm.advice
        })
      });

      if (res.ok) {
        const newRx = await res.json();
        setPrescriptions([newRx, ...prescriptions]);
        setRxMsg({ type: 'success', text: `ই-প্রেসক্রিপশন সফলভাবে সংরক্ষিত ও রোগীর আইডি ${rxForm.cardId} তে যুক্ত হয়েছে!` });
        setRxForm({
          cardId: '',
          diagnosis: '',
          medicines: [{ name: '', dosage: '1+0+1', duration: '7 days', instruction: 'খাবারের পর' }],
          advice: 'পর্যাপ্ত বিশ্রাম নিন।'
        });
      }
    } catch (e) {
      setRxMsg({ type: 'error', text: 'প্রেসক্রিপশন সেভ করা সম্ভব হয়নি।' });
    }
  };

  const filteredPatients = cards.filter(c =>
    c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center font-extrabold text-white text-lg shadow-md">
              DMB
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide">
                ডাক্তার পোর্টাল <span className="text-xs text-rose-400 font-normal">(Doctor Dashboard)</span>
              </h1>
              <p className="text-[10px] text-slate-400">Clinical Management & Electronic Health Records</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{profileForm.name}</p>
                <p className="text-[10px] text-emerald-400 font-mono">{profileForm.bmdcNo}</p>
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
              <p className="font-bold text-xs truncate text-white">{profileForm.name}</p>
              <p className="text-[10px] text-rose-300 mt-0.5">{profileForm.specialty}</p>
            </div>

            {[
              { id: 'overview', label: 'ড্যাশবোর্ড ওভারভিউ', icon: Activity },
              { id: 'patients', label: 'রোগী ডিরেক্টরি ও হিস্ট্রি', icon: Users },
              { id: 'prescription', label: 'নতুন ই-প্রেসক্রিপশন', icon: FilePlus },
              { id: 'reports', label: 'ল্যাব রিপোর্ট পর্যালোচনা', icon: FileText },
              { id: 'profile', label: 'ডাক্তার প্রোফাইল সেটিংস', icon: Stethoscope },
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
                      ? 'bg-rose-600 text-white shadow-md'
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

        {/* MAIN PANEL */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">আজকের পরামর্শপ্রাপ্ত রোগী</p>
                    <p className="text-xl font-extrabold text-slate-900">{cards.length} জন</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <FilePlus className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">মোট প্রদানকৃত প্রেসক্রিপশন</p>
                    <p className="text-xl font-extrabold text-slate-900">{prescriptions.length} টি</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">পর্যালোচিত রিপোর্ট</p>
                    <p className="text-xl font-extrabold text-slate-900">{reports.length} টি</p>
                  </div>
                </div>
              </div>

              {/* Recent Prescriptions */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <FilePlus className="w-4 h-4 text-rose-600" />
                    সাম্প্রতিক ইস্যুকৃত প্রেসক্রিপশন রেজিস্টার
                  </h3>
                  <button
                    onClick={() => setActiveTab('prescription')}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    + নতুন প্রেসক্রিপশন
                  </button>
                </div>

                <div className="space-y-3">
                  {prescriptions.map(rx => (
                    <div key={rx.id} className="p-4 rounded-xl bg-slate-50 border space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-900">{rx.memberName} (কার্ড: {rx.cardId})</p>
                          <p className="text-rose-700 font-semibold">{rx.diagnosis}</p>
                        </div>
                        <span className="text-[10px] text-slate-400">{rx.date}</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border font-mono text-[11px]">
                        <p className="font-bold text-slate-700 text-[10px]">ঔষধসমূহ:</p>
                        {rx.medicines.map((m, i) => (
                          <p key={i}>• {m.name} - {m.dosage} ({m.instruction})</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PATIENTS DIRECTORY */}
          {activeTab === 'patients' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-rose-600" />
                    রোগী অনুসন্ধান ও মেডিকেল টাইমলাইন
                  </h3>
                  <p className="text-xs text-slate-500">কার্ড আইডি, হেলথ আইডি বা মোবাইল নম্বর দিয়ে খুঁজুন</p>
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="কার্ড আইডি বা নাম খুঁজুন..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPatients.map(p => (
                  <div key={p.cardId} className="p-4 rounded-2xl border bg-slate-50 space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={p.photoUrl} alt="Patient" className="w-12 h-12 rounded-xl object-cover border" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{p.memberName}</h4>
                        <p className="text-[11px] text-rose-700 font-mono font-bold">{p.cardId}</p>
                        <p className="text-[10px] text-slate-500">{p.mobile} • {p.bloodGroup}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPatient(p)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      মেডিকেল প্রোফাইল ও ইতিহাস দেখুন
                    </button>
                  </div>
                ))}
              </div>

              {/* Selected Patient Medical History Modal */}
              {selectedPatient && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="font-bold text-sm">{selectedPatient.memberName} - মেডিকেল রেকর্ড</h4>
                      <button onClick={() => setSelectedPatient(null)} className="font-bold">✕</button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border">
                        <p><strong>CARD ID:</strong> {selectedPatient.cardId}</p>
                        <p><strong>BLOOD GROUP:</strong> {selectedPatient.bloodGroup}</p>
                        <p><strong>ADDRESS:</strong> {selectedPatient.address}, {selectedPatient.upazila}</p>
                      </div>

                      <h5 className="font-bold text-xs pt-2">রোগীর বিগত টেস্ট রিপোর্টসমূহ:</h5>
                      {reports.filter(r => r.cardId === selectedPatient.cardId).map(r => (
                        <div key={r.id} className="p-2.5 bg-sky-50 rounded-lg border text-sky-900">
                          <p className="font-bold">{r.testName} ({r.reportDate})</p>
                          <p className="text-[11px]">{r.notes}</p>
                        </div>
                      ))}

                      <h5 className="font-bold text-xs pt-2">বিগত প্রেসক্রিপশনসমূহ:</h5>
                      {prescriptions.filter(rx => rx.cardId === selectedPatient.cardId).map(rx => (
                        <div key={rx.id} className="p-2.5 bg-rose-50 rounded-lg border text-rose-900">
                          <p className="font-bold">{rx.diagnosis} ({rx.date})</p>
                          <p className="text-[11px]">ডাক্তার: {rx.doctorName}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: E-PRESCRIPTION */}
          {activeTab === 'prescription' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-rose-600" />
                  নতুন ডিজিটাল ই-প্রেসক্রিপশন তৈরি করুন
                </h3>
                <p className="text-xs text-slate-500">রোগীর কার্ড আইডির বিপরীতে সরাসরি ডিজিটাল প্রেসক্রিপশন প্রদান করুন</p>
              </div>

              {rxMsg && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  rxMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  <span>{rxMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmitPrescription} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">রোগীর DMB কার্ড আইডি *</label>
                    <input
                      type="text"
                      required
                      placeholder="DMB-2026-1001"
                      value={rxForm.cardId}
                      onChange={e => setRxForm({ ...rxForm, cardId: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">রোগীর সমস্যা / ডায়াগনসিস (Diagnosis) *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: Mild Gastritis & Fever"
                      value={rxForm.diagnosis}
                      onChange={e => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-slate-50"
                    />
                  </div>
                </div>

                {/* Medicines List */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800 text-xs">ঔষধের তালিকা (Rx Medicines):</label>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="px-3 py-1 bg-rose-600 text-white font-bold text-[11px] rounded-lg shadow"
                    >
                      + ঔষধ যোগ করুন
                    </button>
                  </div>

                  {rxForm.medicines.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-3 rounded-xl border">
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="ঔষধের নাম (যেমন: Tab. Seclo 20mg)"
                          value={med.name}
                          onChange={e => handleMedicineChange(idx, 'name', e.target.value)}
                          className="w-full p-2 rounded-lg border text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="সেবনমাত্রা (1+0+1)"
                          value={med.dosage}
                          onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full p-2 rounded-lg border text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="সময়কাল (7 days)"
                          value={med.duration}
                          onChange={e => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="w-full p-2 rounded-lg border text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="পরামর্শ (খাবারের পর)"
                          value={med.instruction}
                          onChange={e => handleMedicineChange(idx, 'instruction', e.target.value)}
                          className="w-full p-2 rounded-lg border text-xs"
                        />
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-1.5 bg-rose-100 text-rose-700 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ডাক্তারের বিশেষ উপদেশ (Advice)</label>
                  <textarea
                    rows={2}
                    value={rxForm.advice}
                    onChange={e => setRxForm({ ...rxForm, advice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition cursor-pointer"
                >
                  ই-প্রেসক্রিপশন প্রিন্ট ও সেভ করুন
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: REPORTS */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                সকল রোগীর প্যাথলজি ও ল্যাব রিপোর্ট রেজিস্টার
              </h3>
              <div className="space-y-3">
                {reports.map(r => (
                  <div key={r.id} className="p-4 rounded-xl border bg-slate-50 text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-900">{r.testName} ({r.memberName})</span>
                      <span className="text-slate-500">{r.reportDate}</span>
                    </div>
                    <p className="text-slate-600">ল্যাব: {r.centerName}</p>
                    <p className="text-slate-700 font-mono bg-white p-2 rounded border">{r.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">ডাক্তার প্রোফাইল তথ্য</h3>
              <form className="space-y-3 text-xs max-w-md">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ডাক্তারের পূর্ণ নাম</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">BMDC রেজিস্ট্রেশন নম্বর</label>
                  <input
                    type="text"
                    value={profileForm.bmdcNo}
                    onChange={e => setProfileForm({ ...profileForm, bmdcNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">বিশেষজ্ঞতা (Specialty)</label>
                  <input
                    type="text"
                    value={profileForm.specialty}
                    onChange={e => setProfileForm({ ...profileForm, specialty: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">চেম্বার / হাসপাতাল লোকেশন</label>
                  <input
                    type="text"
                    value={profileForm.chamber}
                    onChange={e => setProfileForm({ ...profileForm, chamber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => alert('ডাক্তার প্রোফাইল আপডেট করা হয়েছে!')}
                  className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl shadow"
                >
                  প্রোফাইল সেভ করুন
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-600" />
                মেডিকেল নেটওয়ার্ক নোটিশ
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
