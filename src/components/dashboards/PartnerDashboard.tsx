import React, { useState, useEffect } from 'react';
import { fetchJsonSafe } from '../../utils/api';
import {
  User as UserType,
  DiagnosticCenter,
  DiscountTransaction,
  HealthPackage,
  MedicalReport,
  MedicalCard,
  CmsNotice
} from '../../types';
import {
  Building2,
  QrCode,
  FileText,
  History,
  Package,
  UserCheck,
  Bell,
  LogOut,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  CreditCard,
  PlusCircle,
  ShieldCheck,
  Lock,
  Printer,
  Edit3,
  Trash2,
  Upload,
  FileCheck,
  Eye,
  Download,
  Plus,
  X,
  Key,
  Receipt,
  DollarSign,
  Users,
  Image as ImageIcon
} from 'lucide-react';

const COMMON_DIAGNOSTIC_TESTS = [
  'CBC (Complete Blood Count)',
  'RBS (Random Blood Sugar)',
  'HbA1c',
  'Lipid Profile',
  'Serum Creatinine',
  'SGPT / ALT',
  'SGOT / AST',
  'Serum Uric Acid',
  'TSH (Thyroid)',
  'USG (Whole Abdomen)',
  'Chest X-Ray',
  'ECG (12 Lead)',
  'Echocardiogram',
  'Urine R/E',
  'Serum Electrolytes',
  'Vitamin D',
  'HBsAg'
];

interface Props {
  user: UserType;
  onLogout: () => void;
  initialCenters?: DiagnosticCenter[];
}

export const PartnerDashboard: React.FC<Props> = ({ user, onLogout, initialCenters = [] }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'verify' | 'reports' | 'transactions' | 'packages' | 'profile' | 'notifications'
  >('overview');

  const [center, setCenter] = useState<DiagnosticCenter | null>(null);
  const [transactions, setTransactions] = useState<DiscountTransaction[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [notices, setNotices] = useState<CmsNotice[]>([]);

  // Card Verification State
  const [verifyCardId, setVerifyCardId] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    card?: MedicalCard;
    message?: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Billing System Form State
  const [newTxn, setNewTxn] = useState({
    cardId: '',
    memberName: '',
    testNames: '',
    originalAmount: ''
  });
  const [txnMsg, setTxnMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedPrintTxn, setSelectedPrintTxn] = useState<DiscountTransaction | null>(null);
  const [billingSearchTerm, setBillingSearchTerm] = useState('');

  // Report Upload Form State
  const [newReport, setNewReport] = useState({
    cardId: '',
    testName: 'Complete Blood Count (CBC)',
    notes: '',
    memberName: ''
  });
  const [reportFile, setReportFile] = useState<{
    fileUrl: string;
    fileType: 'image' | 'pdf';
    fileName: string;
    fileSizeKb: number;
  } | null>(null);
  const [reportMsg, setReportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedViewReport, setSelectedViewReport] = useState<MedicalReport | null>(null);

  // Health Package Management State
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<HealthPackage | null>(null);
  const [pkgForm, setPkgForm] = useState({
    title: '',
    category: 'Basic' as 'Basic' | 'Diabetes' | 'Women' | 'Senior' | 'Executive',
    description: '',
    includedTests: '',
    regularPrice: '',
    dmbPrice: '',
    recommendedFor: 'সকল বয়সের রোগীদের জন্য প্রযোজ্য',
    popular: false
  });
  const [pkgMsg, setPkgMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile & Password Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    address: '',
    mobile: '',
    email: '',
    availableServices: ''
  });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPartnerData();
  }, [user]);

  const fetchPartnerData = async () => {
    try {
      // 1. Fetch partner center details
      const resCtr = await fetch('/api/diagnostic-centers');
      if (resCtr.ok) {
        const centersList: DiagnosticCenter[] = await resCtr.json();
        const myCenter = centersList.find(c => c.id === user.partnerId || c.mobile === user.mobile) || centersList[0];
        if (myCenter) {
          setCenter(myCenter);
          setProfileForm({
            name: myCenter.name,
            address: myCenter.address,
            mobile: myCenter.mobile,
            email: myCenter.email || '',
            availableServices: (myCenter.availableServices || []).join(', ')
          });
        }
      }

      // 2. Fetch partner transactions
      const resTxns = await fetch('/api/discount-tracking');
      if (resTxns.ok) {
        const list: DiscountTransaction[] = await resTxns.json();
        setTransactions(list);
      }

      // 3. Fetch packages, reports & notices
      const [resPkg, resRpt, resNotices] = await Promise.all([
        fetchJsonSafe('/api/health-packages', undefined, []),
        fetchJsonSafe('/api/medical-reports', undefined, []),
        fetchJsonSafe('/api/notices', undefined, [])
      ]);
      if (Array.isArray(resPkg) && resPkg.length) setPackages(resPkg);
      if (Array.isArray(resRpt) && resRpt.length) setReports(resRpt);
      if (Array.isArray(resNotices) && resNotices.length) setNotices(resNotices);
    } catch (e) {
      console.error('Error loading partner dashboard data', e);
    }
  };

  // Card Verification Handler
  const handleVerifyCard = async (e?: React.FormEvent, targetCardId?: string) => {
    if (e) e.preventDefault();
    const idToVerify = targetCardId || verifyCardId.trim();
    if (!idToVerify) return;
    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch(`/api/cards/verify/${encodeURIComponent(idToVerify)}`);
      const data = await res.json();
      setVerificationResult(data);
      if (data.card) {
        setNewTxn(prev => ({
          ...prev,
          cardId: data.card.cardId,
          memberName: data.card.memberName
        }));
        setNewReport(prev => ({
          ...prev,
          cardId: data.card.cardId,
          memberName: data.card.memberName
        }));
      }
    } catch (e) {
      setVerificationResult({ verified: false, message: 'কার্ড আইডেন্টিফিকেশন করতে ত্রুটি হয়েছে।' });
    } finally {
      setVerifying(false);
    }
  };

  // File Selection Handler for Reports (Image & PDF Support)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('ফাইল সাইজ খুব বড়! সর্বোচ্চ ১০ মেগাবাইট ফাইল আপলোড করতে পারবেন।');
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      alert('শুধুমাত্র ছবি (JPG, PNG, WebP) অথবা পিডিএফ (PDF) ফাইল আপলোড করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setReportFile({
        fileUrl: result,
        fileType: isPdf ? 'pdf' : 'image',
        fileName: file.name,
        fileSizeKb: Math.round(file.size / 1024)
      });
    };
    reader.readAsDataURL(file);
  };

  // Create Bill & Receipt
  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxnMsg(null);

    const orig = Number(newTxn.originalAmount);
    if (!newTxn.cardId || !orig) {
      setTxnMsg({ type: 'error', text: 'কার্ড আইডি এবং মোট বিল ইনপুট দিন।' });
      return;
    }

    const discPct = center?.discountPercentage || 30;
    const discAmount = Math.round(orig * (discPct / 100));

    try {
      const res = await fetch('/api/discount-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: newTxn.cardId,
          centerId: center?.id || 'DC-001',
          testNames: newTxn.testNames.split(',').map(s => s.trim()).filter(Boolean),
          originalAmount: orig,
          discountAmount: discAmount
        })
      });

      if (res.ok) {
        const added: DiscountTransaction = await res.json();
        setTransactions([added, ...transactions]);
        setTxnMsg({ type: 'success', text: `বিলিং ও মানি রিসিট সফল! ছাড়: ৳${discAmount} (পরিশোধিত: ৳${added.paidAmount})` });
        setSelectedPrintTxn(added);
        setNewTxn({ cardId: '', memberName: '', testNames: '', originalAmount: '' });
      }
    } catch (e) {
      setTxnMsg({ type: 'error', text: 'বিলিং প্রসেসিং করতে সমস্যা হয়েছে।' });
    }
  };

  // Upload Medical Report
  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportMsg(null);
    if (!newReport.cardId || !newReport.testName) {
      setReportMsg({ type: 'error', text: 'কার্ড আইডি এবং টেস্টের নাম দিন।' });
      return;
    }

    try {
      const res = await fetch('/api/medical-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: newReport.cardId,
          memberName: newReport.memberName,
          testName: newReport.testName,
          centerName: center?.name || 'ডায়াগনস্টিক পার্টনার',
          notes: newReport.notes,
          fileUrl: reportFile?.fileUrl,
          fileType: reportFile?.fileType,
          fileName: reportFile?.fileName,
          uploadedBy: center?.name || 'ল্যাব ইনচার্জ'
        })
      });

      if (res.ok) {
        const rpt = await res.json();
        setReports([rpt, ...reports]);
        setReportMsg({ type: 'success', text: 'মেডিকেল রিপোর্ট (ছবি/পিডিএফ) সফলভাবে সার্ভারে আপলোড হয়েছে!' });
        setNewReport({ cardId: '', memberName: '', testName: 'Complete Blood Count (CBC)', notes: '' });
        setReportFile(null);
      }
    } catch (e) {
      setReportMsg({ type: 'error', text: 'রিপোর্ট আপলোড ব্যর্থ হয়েছে।' });
    }
  };

  // Health Package CRUD Handlers
  const handleOpenAddPkg = () => {
    setEditingPkg(null);
    setPkgForm({
      title: '',
      category: 'Basic',
      description: '',
      includedTests: '',
      regularPrice: '',
      dmbPrice: '',
      recommendedFor: 'সকল বয়সের রোগীদের জন্য প্রযোজ্য',
      popular: false
    });
    setShowPkgModal(true);
  };

  const handleOpenEditPkg = (pkg: HealthPackage) => {
    setEditingPkg(pkg);
    setPkgForm({
      title: pkg.title,
      category: pkg.category,
      description: pkg.description,
      includedTests: (pkg.includedTests || []).join(', '),
      regularPrice: String(pkg.regularPrice),
      dmbPrice: String(pkg.dmbPrice),
      recommendedFor: pkg.recommendedFor,
      popular: Boolean(pkg.popular)
    });
    setShowPkgModal(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setPkgMsg(null);

    const payload = {
      title: pkgForm.title,
      category: pkgForm.category,
      description: pkgForm.description,
      includedTests: pkgForm.includedTests.split(',').map(s => s.trim()).filter(Boolean),
      regularPrice: Number(pkgForm.regularPrice),
      dmbPrice: Number(pkgForm.dmbPrice),
      recommendedFor: pkgForm.recommendedFor,
      popular: pkgForm.popular
    };

    try {
      if (editingPkg) {
        const res = await fetch(`/api/health-packages/${editingPkg.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setPackages(packages.map(p => p.id === updated.id ? updated : p));
          setPkgMsg({ type: 'success', text: 'হেলথ প্যাকেজ সফলভাবে আপডেট করা হয়েছে!' });
          setShowPkgModal(false);
        }
      } else {
        const res = await fetch('/api/health-packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const added = await res.json();
          setPackages([added, ...packages]);
          setPkgMsg({ type: 'success', text: 'নতুন হেলথ প্যাকেজ সফলভাবে যুক্ত করা হয়েছে!' });
          setShowPkgModal(false);
        }
      }
    } catch (e) {
      setPkgMsg({ type: 'error', text: 'প্যাকেজ সেভ করতে সমস্যা হয়েছে।' });
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই হেলথ প্যাকেজটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`/api/health-packages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPackages(packages.filter(p => p.id !== id));
        setPkgMsg({ type: 'success', text: 'প্যাকেজটি সফলভাবে মুছে ফেলা হয়েছে।' });
      }
    } catch (e) {
      setPkgMsg({ type: 'error', text: 'ডিলিট করতে সমস্যা হয়েছে।' });
    }
  };

  // Lab Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!center) return;
    try {
      const res = await fetch(`/api/diagnostic-centers/${center.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          address: profileForm.address,
          mobile: profileForm.mobile,
          email: profileForm.email,
          availableServices: profileForm.availableServices.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setCenter(updated);
        setProfileMsg({ type: 'success', text: 'ল্যাব প্রোফাইলের তথ্য সফলভাবে আপডেট করা হয়েছে!' });
      }
    } catch (e) {
      setProfileMsg({ type: 'error', text: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।' });
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড দুটি মেলেনি!' });
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'পাসওয়ার্ড অত্যন্ত সংক্ষিপ্ত! কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন।' });
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: user.mobile || user.email || user.id,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: data.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' });
      }
    } catch (e) {
      setPasswordMsg({ type: 'error', text: 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে।' });
    }
  };

  // 1/ Dashboard Summary Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === todayStr);
  const todayCount = todayTransactions.length;
  const totalCount = transactions.length;
  const totalBill = transactions.reduce((sum, t) => sum + (t.originalAmount || 0), 0);
  const totalDiscount = transactions.reduce((sum, t) => sum + (t.discountAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center font-extrabold text-white text-lg shadow-md">
              DMB
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide">
                পার্টনার ল্যাব পোর্টাল <span className="text-xs text-sky-400 font-normal">(Partner Dashboard)</span>
              </h1>
              <p className="text-[10px] text-slate-400">Digital Medi Bridge Healthcare Network</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{center?.name || user.name}</p>
                <p className="text-[10px] text-emerald-400 font-mono">ছাড়: {center?.discountPercentage || 30}% (Read-Only Rate)</p>
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
              <p className="font-bold text-xs truncate text-white">{center?.name || 'পার্টনার ল্যাব'}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{center?.district} • Code: {center?.code || 'DC-001'}</p>
            </div>

            {[
              { id: 'overview', label: 'ড্যাশবোর্ড সামারি', icon: TrendingUp },
              { id: 'verify', label: 'প্যাশেন্ট কার্ড ভেরিফিকেশন', icon: QrCode },
              { id: 'reports', label: 'রিপোর্ট আপলোড (ছবি/PDF)', icon: FileText },
              { id: 'transactions', label: 'বিলিং সিস্টেম ও মানি রিসিট', icon: Receipt },
              { id: 'packages', label: 'হেলথ প্যাকেজ ম্যানেজমেন্ট', icon: Package },
              { id: 'profile', label: 'ল্যাব প্রোফাইল ও পাসওয়ার্ড', icon: Building2 },
              { id: 'notifications', label: 'নোটিশ বোর্ড', icon: Bell }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md'
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
          
          {/* TAB 1: OVERVIEW (Requirement 1: Summary Cards) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-sky-400" />
                  ড্যাশবোর্ড ওভারভিউ & সার্ভিস পারফরম্যান্স
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  আজকের ও সর্বমোট সেবা গ্রহীতা, মোট বিলিং এবং প্রদানকৃত ছাড়ের পরিসংখ্যান
                </p>
              </div>

              {/* 1/ Dashboard Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Today's Service Recipients */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">আজ কতজন সেবা গ্রহীতা</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{todayCount} জন</p>
                    <span className="text-[10px] text-sky-600 font-medium">আজকের চেকইন</span>
                  </div>
                </div>

                {/* 2. Total Service Recipients */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট সেবা গ্রহীতা</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{totalCount} জন</p>
                    <span className="text-[10px] text-indigo-600 font-medium">সর্বমোট পেশেন্ট সেবা</span>
                  </div>
                </div>

                {/* 3. Total Bill Amount */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট বিল (Gross Bill)</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">৳{totalBill.toLocaleString()}</p>
                    <span className="text-[10px] text-amber-700 font-medium">নিয়মিত সার্ভিস বিল</span>
                  </div>
                </div>

                {/* 4. Total Discount Provided */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট ডিসকাউন্ট</p>
                    <p className="text-2xl font-black text-emerald-600 mt-0.5">৳{totalDiscount.toLocaleString()}</p>
                    <span className="text-[10px] text-emerald-700 font-medium">প্রদানকৃত স্পেশাল ছাড়</span>
                  </div>
                </div>
              </div>

              {/* Quick Card Verification Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-sky-600" />
                  দ্রুত কার্ড ভেরিফিকেশন ও পেশেন্ট চেকইন
                </h3>
                <form onSubmit={e => handleVerifyCard(e)} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="কার্ড আইডি লিখুন (যেমন: DMB-2026-1001)..."
                    value={verifyCardId}
                    onChange={e => setVerifyCardId(e.target.value)}
                    className="flex-1 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold"
                  />
                  <button
                    type="submit"
                    disabled={verifying}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    {verifying ? 'যাচাই হচ্ছে...' : 'কার্ড যাচাই করুন'}
                  </button>
                </form>

                {verificationResult && (
                  <div className={`p-4 rounded-xl text-xs space-y-2 border ${
                    verificationResult.verified ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {verificationResult.verified ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>কার্ড ভ্যালিড ও সক্রিয় (Active Member)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-rose-600" />
                          <span>{verificationResult.message || 'কার্ডটি কার্যকর নয়'}</span>
                        </>
                      )}
                    </div>

                    {verificationResult.card && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 font-medium">
                        <p>সদস্য: <strong>{verificationResult.card.memberName}</strong></p>
                        <p>কার্ড টায়ার: <strong className="text-emerald-700">{verificationResult.card.cardTier}</strong></p>
                        <p>রক্তের গ্রুপ: <strong className="text-rose-700">{verificationResult.card.bloodGroup}</strong></p>
                        <p>মেয়াদ: <strong>{verificationResult.card.expiryDate}</strong></p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VERIFY */}
          {activeTab === 'verify' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-sky-600" />
                  রোগীর কার্ড স্ট্যাটাস ও QR ভেরিফিকেশন
                </h3>
                <p className="text-xs text-slate-500">QR কোড স্ক্যান অথবা কার্ড আইডি নম্বর ইনপুট দিন</p>
              </div>

              <form onSubmit={e => handleVerifyCard(e)} className="space-y-3 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">DMB কার্ড আইডি নম্বর</label>
                  <input
                    type="text"
                    required
                    placeholder="DMB-2026-1001"
                    value={verifyCardId}
                    onChange={e => setVerifyCardId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs font-bold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  {verifying ? 'যাচাই চলছে...' : 'ভেরিফাই করুন'}
                </button>
              </form>

              {verificationResult && verificationResult.card && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <img src={verificationResult.card.photoUrl} alt="Member" className="w-12 h-12 rounded-xl object-cover border" />
                      <div>
                        <h4 className="font-extrabold text-sm">{verificationResult.card.memberName}</h4>
                        <p className="text-xs text-amber-300 font-mono">{verificationResult.card.cardId}</p>
                      </div>
                    </div>
                    <span className="bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full">
                      ACTIVE
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300">
                    <p><strong>উপজেলা/জেলা:</strong> {verificationResult.card.upazila}, {verificationResult.card.district}</p>
                    <p><strong>নিবন্ধিত পরিবার সদস্য:</strong> {(verificationResult.card.beneficiaries || []).join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REPORTS UPLOAD (Requirement 2: Image & PDF Upload) */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-sky-600" />
                      রোগীর ডায়াগনস্টিক রিপোর্ট আপলোড সেন্টার
                    </h3>
                    <p className="text-xs text-slate-500">রোগীর DMB কার্ড আইডির বিপরীতে ছবি (JPG/PNG) এবং পিডিএফ (PDF) ফাইল আপলোড করুন</p>
                  </div>
                  <span className="px-3 py-1 bg-sky-50 text-sky-800 text-[11px] font-bold rounded-lg border border-sky-200 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" /> PDF & Image Supported
                  </span>
                </div>

                {reportMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    reportMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {reportMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{reportMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUploadReport} className="space-y-4 max-w-xl text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">রোগীর DMB কার্ড আইডি *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: DMB-2026-1001"
                        value={newReport.cardId}
                        onChange={e => setNewReport({ ...newReport, cardId: e.target.value })}
                        onBlur={e => {
                          if (e.target.value) handleVerifyCard(undefined, e.target.value);
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">রোগীর নাম</label>
                      <input
                        type="text"
                        placeholder="রোগীর নাম"
                        value={newReport.memberName}
                        onChange={e => setNewReport({ ...newReport, memberName: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পরীক্ষার নাম (Test Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: Complete Blood Count (CBC) / Chest X-Ray / USG"
                      value={newReport.testName}
                      onChange={e => setNewReport({ ...newReport, testName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    />
                  </div>

                  {/* 2/ File Upload Drag & Drop Zone for Image or PDF */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      রিপোর্ট ফাইল সিলেক্ট করুন (ছবি অথবা পিডিএফ)
                    </label>
                    
                    <div className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-4 bg-slate-50 text-center transition cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                      />
                      
                      {reportFile ? (
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm z-20 relative">
                          <div className="flex items-center gap-3">
                            {reportFile.fileType === 'pdf' ? (
                              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                                PDF
                              </div>
                            ) : (
                              <img src={reportFile.fileUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border" />
                            )}
                            <div className="text-left">
                              <p className="font-bold text-slate-900 text-xs truncate max-w-[200px]">{reportFile.fileName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {reportFile.fileType.toUpperCase()} • {reportFile.fileSizeKb} KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReportFile(null);
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1 py-2">
                          <Upload className="w-8 h-8 text-sky-600 mx-auto" />
                          <p className="font-bold text-slate-800 text-xs">এখানে ক্লিক করুন অথবা ফাইল ড্র্যাগ করুন</p>
                          <p className="text-[10px] text-slate-500">
                            সাপোর্টেড ফরম্যাট: JPG, PNG, WEBP, PDF (সর্বোচ্চ ১০MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">রিপোর্ট ফলাফল / ল্যাব নোটস</label>
                    <textarea
                      rows={2}
                      placeholder="পরীক্ষার সংক্ষিপ্ত ফলাফল ও মন্তব্য লিখুন..."
                      value={newReport.notes}
                      onChange={e => setNewReport({ ...newReport, notes: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition cursor-pointer text-xs flex items-center gap-2 shadow"
                  >
                    <Upload className="w-4 h-4" /> রিপোর্ট সফলভাবে সাবমিট করুন
                  </button>
                </form>
              </div>

              {/* Uploaded Reports Register */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900">আপলোডকৃত রিপোর্ট সমূহের তালিকা</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                      <tr>
                        <th className="p-3">তারিখ</th>
                        <th className="p-3">রোগী ও কার্ড আইডি</th>
                        <th className="p-3">টেস্টের নাম</th>
                        <th className="p-3">ফাইল টাইপ</th>
                        <th className="p-3 text-center">একশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {reports.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-slate-600">{r.reportDate}</td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{r.memberName || 'রোগী'}</p>
                            <p className="text-[10px] font-mono text-slate-500">{r.cardId}</p>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">{r.testName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.fileType === 'pdf' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {r.fileType === 'pdf' ? '📄 PDF রিপোর্ট' : '📷 ছবি রিপোর্ট'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {r.fileUrl ? (
                              <button
                                onClick={() => setSelectedViewReport(r)}
                                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition"
                              >
                                <Eye className="w-3.5 h-3.5" /> ভিউ / ডাউনলোড
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px]">ফাইল নাই</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BILLING SYSTEM (Requirement 3: Full Billing System & Receipt Printing) */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              {/* Record New Bill Form */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-sky-600" />
                      পার্টনার ল্যাব বিলিং সিস্টেম ও ডিসকাউন্ট মানি রিসিট
                    </h3>
                    <p className="text-xs text-slate-500">রোগীর টেস্ট বিল তৈরি করুন এবং ছাড় সহ ক্যাশ মানি রিসিট জেনারেট করুন</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
                    ছাড় হার: {center?.discountPercentage || 30}% (Fixed Partner Rate)
                  </span>
                </div>

                {txnMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    txnMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {txnMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{txnMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleCreateBill} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">রোগীর DMB কার্ড আইডি *</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          required
                          placeholder="DMB-2026-1001"
                          value={newTxn.cardId}
                          onChange={e => setNewTxn({ ...newTxn, cardId: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyCard(undefined, newTxn.cardId)}
                          className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 text-[11px] whitespace-nowrap cursor-pointer"
                        >
                          যাচাই
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">রোগীর নাম</label>
                      <input
                        type="text"
                        placeholder="রোগীর নাম (ঐচ্ছিক)"
                        value={newTxn.memberName}
                        onChange={e => setNewTxn({ ...newTxn, memberName: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-700">পরীক্ষাসমূহ নির্বাচন করুন (Dropdown / Checkbox / Comma Separated) *</label>
                        <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-extrabold">
                          ড্রপডাউন বা চেক দিয়ে সহজে নির্বাচন করুন
                        </span>
                      </div>

                      {/* Dropdown Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          onChange={e => {
                            const val = e.target.value;
                            if (!val) return;
                            const currentList = newTxn.testNames ? newTxn.testNames.split(',').map(s => s.trim()).filter(Boolean) : [];
                            if (!currentList.includes(val)) {
                              currentList.push(val);
                              setNewTxn({ ...newTxn, testNames: currentList.join(', ') });
                            }
                            e.target.value = '';
                          }}
                          className="w-full sm:w-1/2 p-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 font-bold text-xs cursor-pointer"
                        >
                          <option value="">➕ তালিকা থেকে টেস্ট যুক্ত করুন (Dropdown)...</option>
                          {COMMON_DIAGNOSTIC_TESTS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {/* Quick Interactive Checkbox / Pill Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {COMMON_DIAGNOSTIC_TESTS.slice(0, 10).map(test => {
                          const currentList = newTxn.testNames ? newTxn.testNames.split(',').map(s => s.trim()).filter(Boolean) : [];
                          const isSelected = currentList.includes(test);
                          return (
                            <button
                              key={test}
                              type="button"
                              onClick={() => {
                                let updated: string[];
                                if (isSelected) {
                                  updated = currentList.filter(t => t !== test);
                                } else {
                                  updated = [...currentList, test];
                                }
                                setNewTxn({ ...newTxn, testNames: updated.join(', ') });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{test}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Comma Separated Text Input */}
                      <input
                        type="text"
                        required
                        placeholder="কমা দিয়ে অন্যান্য টেস্টের নাম লিখুন (e.g. CBC, Lipid Profile, USG)"
                        value={newTxn.testNames}
                        onChange={e => setNewTxn({ ...newTxn, testNames: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">মোট নিয়মিত বিল (BDT ৳) *</label>
                      <input
                        type="number"
                        required
                        placeholder="2000"
                        value={newTxn.originalAmount}
                        onChange={e => setNewTxn({ ...newTxn, originalAmount: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-sm text-slate-900"
                      />
                    </div>

                    <div>
                      <p className="text-slate-500 font-bold mb-1">স্পেশাল ছাড় হার</p>
                      <p className="p-2.5 font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-mono">
                        {center?.discountPercentage || 30}% DISCOUNT
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 font-bold mb-1">মোট ছাড়ের পরিমাণ (৳)</p>
                      <p className="p-2.5 font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-xl text-sm font-mono">
                        ৳{Math.round((Number(newTxn.originalAmount) || 0) * ((center?.discountPercentage || 30) / 100)).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 font-bold mb-1">পরিশোধিত বিল (Net Payable ৳)</p>
                      <p className="p-2.5 font-extrabold text-sky-900 bg-sky-100 border border-sky-300 rounded-xl text-sm font-mono">
                        ৳{Math.max(0, (Number(newTxn.originalAmount) || 0) - Math.round((Number(newTxn.originalAmount) || 0) * ((center?.discountPercentage || 30) / 100))).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow cursor-pointer text-xs flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" /> বিল সাবমিট করুন ও ক্যাশ রিসিট প্রিন্ট করুন
                    </button>
                  </div>
                </form>
              </div>

              {/* Transactions / Billing Register */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
                  <h3 className="font-bold text-sm text-slate-900">ল্যাব বিলিং ইতিহাস ও ক্যাশ মানি রিসিট রেজিস্টার</h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="রিসিট নং বা কার্ড আইডি দিয়ে সার্চ..."
                      value={billingSearchTerm}
                      onChange={e => setBillingSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b">
                        <th className="p-3">রিসিট নং & তারিখ</th>
                        <th className="p-3">রোগীর নাম</th>
                        <th className="p-3">কার্ড আইডি</th>
                        <th className="p-3">মূল বিল (৳)</th>
                        <th className="p-3">ছাড় (৳)</th>
                        <th className="p-3">পরিশোধিত (৳)</th>
                        <th className="p-3 text-center">একশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {transactions
                        .filter(t =>
                          t.receiptNo.toLowerCase().includes(billingSearchTerm.toLowerCase()) ||
                          t.cardId.toLowerCase().includes(billingSearchTerm.toLowerCase()) ||
                          t.memberName.toLowerCase().includes(billingSearchTerm.toLowerCase())
                        )
                        .map(t => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <p className="font-mono font-bold text-slate-900">{t.receiptNo}</p>
                              <p className="text-[10px] text-slate-500">{t.date}</p>
                            </td>
                            <td className="p-3 font-semibold text-slate-800">{t.memberName}</td>
                            <td className="p-3 font-mono text-slate-600">{t.cardId}</td>
                            <td className="p-3 text-slate-500 line-through">৳{t.originalAmount}</td>
                            <td className="p-3 font-bold text-emerald-600">৳{t.discountAmount}</td>
                            <td className="p-3 font-extrabold text-slate-900">৳{t.paidAmount}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => setSelectedPrintTxn(t)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-400" /> রিসিট প্রিন্ট
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HEALTH PACKAGES (Requirement 4: Add, Edit, Delete Options) */}
          {activeTab === 'packages' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-sky-600" />
                    DMB হেলথ চেকআপ প্যাকেজ ম্যানেজমেন্ট
                  </h3>
                  <p className="text-xs text-slate-500">ল্যাবের হেলথ প্যাকেজ যোগ, এডিট এবং ডিলিট করুন</p>
                </div>
                <button
                  onClick={handleOpenAddPkg}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" /> নতুন হেলথ প্যাকেজ যুক্ত করুন
                </button>
              </div>

              {pkgMsg && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  pkgMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <span>{pkgMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map(p => (
                  <div key={p.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 text-xs relative hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px] uppercase tracking-wider">
                          {p.category} Package
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-1">{p.title}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditPkg(p)}
                          className="p-1.5 bg-white hover:bg-sky-50 text-sky-600 border rounded-lg transition cursor-pointer"
                          title="এডিট করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(p.id)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border rounded-lg transition cursor-pointer"
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-xs">{p.description}</p>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <p className="font-bold text-slate-700 text-[11px] mb-1">অন্তর্ভুক্ত টেস্টসমূহ:</p>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                        {(p.includedTests || []).map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-bold">
                      <div>
                        <span className="text-[10px] text-slate-400 block">নিয়মিত মূল্য</span>
                        <span className="text-slate-400 line-through text-xs">৳{p.regularPrice}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-600 block">DMB স্পেশাল মূল্য</span>
                        <span className="text-emerald-700 text-sm font-extrabold">৳{p.dmbPrice} BDT</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PROFILE & PASSWORD (Requirement 5: Password Update & Read-Only Proposed Discount) */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Lab Profile Form */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-extrabold text-base text-slate-900 border-b pb-2">
                  ল্যাব/হাসপাতাল প্রোফাইল সেটিংস
                </h3>

                {profileMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs max-w-lg">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">প্রতিষ্ঠানের নাম *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ঠিকানা</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">যোগাযোগের নম্বর</label>
                      <input
                        type="text"
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
                  </div>

                  {/* 5/ Proposed Discount is READ-ONLY for Partner Center */}
                  <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2">
                    <label className="block font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-600" />
                      প্রস্তাবিত ডিসকাউন্ট হার (নির্ধারিত % - Read Only)
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={`${center?.discountPercentage || 30}% Discount`}
                      className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-100/70 text-amber-950 font-mono font-black text-sm cursor-not-allowed"
                    />
                    <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                      ⚠️ প্রস্তাবিত ডিসকাউন্ট হার শুধুমাত্র সুপার এডমিন (Super Admin) পরিবর্তন করতে পারবেন। পার্টনার পোর্টালে এটি নির্দিষ্ট রিড-অনলি মোডে সংরক্ষিত।
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">উপলব্ধ সেবাসমূহ (কমা দিয়ে লিখুন)</label>
                    <textarea
                      rows={2}
                      value={profileForm.availableServices}
                      onChange={e => setProfileForm({ ...profileForm, availableServices: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow transition cursor-pointer"
                  >
                    প্রোফাইল সেভ করুন
                  </button>
                </form>
              </div>

              {/* 5/ Password Update Section */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-500" />
                  ল্যাব লগইন পাসওয়ার্ড পরিবর্তন
                </h3>

                {passwordMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${
                    passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {passwordMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3 text-xs max-w-md">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বর্তমান পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.oldPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                      placeholder="বর্তমান লগইন পাসওয়ার্ড"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">নতুন পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                      placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর)"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পুনরায় নতুন পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                      placeholder="নতুন পাসওয়ার্ড কনফার্ম করুন"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition cursor-pointer flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" /> পাসওয়ার্ড আপডেট করুন
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-600" />
                অফিসিয়াল নোটিশ বোর্ড
              </h3>
              <div className="space-y-3">
                {notices.map(n => (
                  <div key={n.id} className="p-4 rounded-xl bg-slate-50 border text-xs space-y-1">
                    <p className="font-bold text-slate-900">{n.title}</p>
                    <p className="text-slate-600">{n.content}</p>
                    <p className="text-[10px] text-slate-400">{n.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: ADD / EDIT HEALTH PACKAGE */}
      {showPkgModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingPkg ? 'হেলথ প্যাকেজ এডিট করুন' : 'নতুন হেলথ প্যাকেজ যুক্ত করুন'}
              </h3>
              <button onClick={() => setShowPkgModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">প্যাকেজের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ডায়াবেটিস কেয়ার প্যাকেজ"
                  value={pkgForm.title}
                  onChange={e => setPkgForm({ ...pkgForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={pkgForm.category}
                    onChange={e => setPkgForm({ ...pkgForm, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Women">Women</option>
                    <option value="Senior">Senior</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পপ্যুলার প্যাকেজ?</label>
                  <select
                    value={pkgForm.popular ? 'true' : 'false'}
                    onChange={e => setPkgForm({ ...pkgForm, popular: e.target.value === 'true' })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  >
                    <option value="false">সাধারণ</option>
                    <option value="true">পপ্যুলার (Featured)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                <input
                  type="text"
                  placeholder="প্যাকেজের সংক্ষিপ্ত বিবরণ"
                  value={pkgForm.description}
                  onChange={e => setPkgForm({ ...pkgForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">অন্তর্ভুক্ত টেস্টসমূহ (কমা দিয়ে লিখুন) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Fasting Glucose, HbA1c, Lipid Profile, Kidney Function Test"
                  value={pkgForm.includedTests}
                  onChange={e => setPkgForm({ ...pkgForm, includedTests: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">নিয়মিত মূল্য (BDT ৳) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={pkgForm.regularPrice}
                    onChange={e => setPkgForm({ ...pkgForm, regularPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">DMB স্পেশাল মূল্য (৳) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1650"
                    value={pkgForm.dmbPrice}
                    onChange={e => setPkgForm({ ...pkgForm, dmbPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowPkgModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow"
                >
                  {editingPkg ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT MONEY RECEIPT */}
      {selectedPrintTxn && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-600" />
                ক্যাশ মানি রিসিট প্রিন্ট প্রিভিউ
              </h3>
              <button onClick={() => setSelectedPrintTxn(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Printable Receipt Layout */}
            <div id="printable-money-receipt" className="p-4 bg-slate-50 rounded-xl border border-slate-300 text-xs space-y-3 font-sans print:bg-white print:border-none">
              <div className="text-center border-b pb-2 space-y-0.5">
                <h2 className="font-black text-base text-slate-900">{center?.name || selectedPrintTxn.centerName}</h2>
                <p className="text-[10px] text-slate-600">{center?.address || 'Authorized Diagnostic Partner'}</p>
                <p className="text-[10px] text-slate-500 font-mono">Center Code: {center?.code || 'DC-001'} • Mobile: {center?.mobile}</p>
              </div>

              <div className="flex justify-between border-b pb-2 font-mono text-[11px]">
                <div>
                  <p><strong>রিসিট নং:</strong> {selectedPrintTxn.receiptNo}</p>
                  <p><strong>তারিখ:</strong> {selectedPrintTxn.date}</p>
                </div>
                <div className="text-right">
                  <p><strong>কার্ড আইডি:</strong> {selectedPrintTxn.cardId}</p>
                  <p><strong>রোগীর নাম:</strong> {selectedPrintTxn.memberName}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-800">পরীক্ষাসমূহ:</p>
                <div className="bg-white p-2 rounded-lg border text-slate-700">
                  {(selectedPrintTxn.testNames || []).join(', ')}
                </div>
              </div>

              <div className="space-y-1 pt-1 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>মোট সার্ভিকাল বিল:</span>
                  <span>৳{selectedPrintTxn.originalAmount}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>DMB স্পেশাল ছাড় ({center?.discountPercentage || 30}%):</span>
                  <span>- ৳{selectedPrintTxn.discountAmount}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black border-t border-slate-300 pt-1 text-sm">
                  <span>পরিশোধিত অর্থ (Net Paid):</span>
                  <span>৳{selectedPrintTxn.paidAmount} BDT</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-end text-[9px] text-slate-500">
                <div>
                  <p>ভারীফাইড বাই: Digital Medi Bridge Network</p>
                  <p>www.health.nit.bd</p>
                </div>
                <div className="text-center border-t border-slate-400 pt-1 w-28">
                  স্বাক্ষর ও সিল
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t print:hidden">
              <button
                onClick={() => setSelectedPrintTxn(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> প্রিন্ট মানি রিসিট
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW MEDICAL REPORT */}
      {selectedViewReport && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {selectedViewReport.testName} - ডায়াগনস্টিক রিপোর্ট
                </h3>
                <p className="text-xs text-slate-500">রোগী: {selectedViewReport.memberName} ({selectedViewReport.cardId})</p>
              </div>
              <button onClick={() => setSelectedViewReport(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-4 bg-slate-100 rounded-xl border max-h-[70vh] overflow-y-auto flex items-center justify-center">
              {selectedViewReport.fileType === 'pdf' || selectedViewReport.fileUrl?.startsWith('data:application/pdf') ? (
                <div className="text-center space-y-3 py-6">
                  <FileText className="w-16 h-16 text-rose-600 mx-auto" />
                  <p className="font-bold text-slate-900 text-sm">{selectedViewReport.fileName || 'report.pdf'}</p>
                  <p className="text-xs text-slate-500">পিডিএফ ফরম্যাট রিপোর্ট ডাউনলোড বা ওপেন করুন</p>
                  <a
                    href={selectedViewReport.fileUrl}
                    download={selectedViewReport.fileName || 'medical_report.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow"
                  >
                    <Download className="w-4 h-4" /> পিডিএফ ডাউনলোড করুন
                  </a>
                </div>
              ) : selectedViewReport.fileUrl ? (
                <img
                  src={selectedViewReport.fileUrl}
                  alt="Medical Report"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border shadow-sm"
                />
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  কোন ডিজিটাল ফাইল যুক্ত নেই।
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border text-xs space-y-1">
              <p><strong>মন্তব্য/নোটস:</strong> {selectedViewReport.notes || 'স্বাভাবিক'}</p>
              <p className="text-[10px] text-slate-400">আপলোডকারীর নাম: {selectedViewReport.uploadedBy} • তারিখ: {selectedViewReport.reportDate}</p>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setSelectedViewReport(null)}
                className="px-5 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
