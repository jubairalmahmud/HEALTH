import React, { useState, useEffect } from 'react';
import { 
  UserCheck, ShieldCheck, CheckCircle2, AlertCircle, FileText, ArrowRight, 
  User, Phone, Mail, MapPin, Calendar, Award, Upload, Briefcase, Eye, Trash2, 
  Check, ExternalLink, CreditCard, DollarSign, Building2, Smartphone, Printer, 
  Download, X, Sparkles, Clock, Receipt, RefreshCw 
} from 'lucide-react';
import { RepresentativeApplication, JobCircular, PaymentSettings } from '../types';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const RepresentativeRegisterPage: React.FC<Props> = ({ setActiveTab }) => {
  const [circulars, setCirculars] = useState<JobCircular[]>([]);
  const [selectedCircular, setSelectedCircular] = useState<JobCircular | null>(null);
  
  const [formData, setFormData] = useState({
    circularId: '',
    circularTitle: '',
    name: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    mobile: '',
    email: '',
    nidNo: '',
    educationalQualification: 'HSC Passed',
    experienceYears: 'Fresh Candidate / 0-1 Year',
    address: '',
    upazila: 'Gopalganj Sadar',
    district: 'Gopalganj',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    nidDocUrl: '',
    educationDocUrl: '',
    cvDocUrl: '',
    assignedArea: 'Gopalganj Sadar Upazila',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<RepresentativeApplication | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Payment Gateway Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    status: 'UNPAID' | 'PAID';
    amount: number;
    method: 'bKash' | 'Nagad' | 'Bank' | 'Card';
    accountNo: string;
    txnId: string;
    date: string;
  }>({
    status: 'UNPAID',
    amount: 500,
    method: 'bKash',
    accountNo: '',
    txnId: '',
    date: ''
  });

  // Modal Inputs
  const [modalAmount, setModalAmount] = useState<string>('500');
  const [modalMethod, setModalMethod] = useState<'bKash' | 'Nagad' | 'Bank' | 'Card'>('bKash');
  const [modalAccountNo, setModalAccountNo] = useState<string>('');
  const [modalTxnId, setModalTxnId] = useState<string>('');
  const [modalBankName, setModalBankName] = useState<string>('Dutch Bangla Bank Ltd');
  const [modalCardName, setModalCardName] = useState<string>('');
  const [modalCardNumber, setModalCardNumber] = useState<string>('');
  const [modalCardExpiry, setModalCardExpiry] = useState<string>('');
  const [modalCardCvv, setModalCardCvv] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  // File Upload State previews & loading
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [nidDocPreview, setNidDocPreview] = useState<string>('');
  const [educationDocPreview, setEducationDocPreview] = useState<string>('');
  const [cvDocName, setCvDocName] = useState<string>('');

  useEffect(() => {
    fetchCirculars();
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch('/api/payment-settings');
      if (res.ok) {
        const data = await res.json();
        setPaymentSettings(data);
        if (data.fees && data.fees.representativeFee) {
          setModalAmount(String(data.fees.representativeFee));
          setPaymentInfo(prev => ({ ...prev, amount: data.fees.representativeFee }));
        }
      }
    } catch (err) {
      console.error('Error fetching payment settings:', err);
    }
  };

  const fetchCirculars = async () => {
    try {
      const res = await fetch('/api/job-circulars');
      if (res.ok) {
        const data = await res.json();
        setCirculars(data);
        if (data.length > 0) {
          const openCircular = data.find((c: JobCircular) => c.status === 'OPEN') || data[0];
          setSelectedCircular(openCircular);
          setFormData(prev => ({
            ...prev,
            circularId: openCircular.id,
            circularTitle: openCircular.title
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load job circulars', err);
    }
  };

  const handleConfirmPayment = () => {
    setPaymentError('');
    const amt = parseFloat(modalAmount);
    if (isNaN(amt) || amt <= 0) {
      setPaymentError('অনুগ্রহ করে সঠিক ফির পরিমাণ (টাকা) প্রদান করুন।');
      return;
    }

    if (modalMethod === 'bKash' || modalMethod === 'Nagad') {
      if (!modalAccountNo || modalAccountNo.trim().length < 11) {
        setPaymentError(`অনুগ্রহ করে প্রেরকের সঠিক ১১ ডিজিটের ${modalMethod} নম্বর দিন।`);
        return;
      }
    } else if (modalMethod === 'Card') {
      if (!modalCardNumber || modalCardNumber.replace(/\s/g, '').length < 15) {
        setPaymentError('অনুগ্রহ করে সঠিক ১৬ ডিজিটের কার্ড নম্বর প্রদান করুন।');
        return;
      }
      if (!modalCardExpiry || !modalCardCvv) {
        setPaymentError('অনুগ্রহ করে কার্ডের মেয়াদ (MM/YY) ও CVV কোড দিন।');
        return;
      }
    } else if (modalMethod === 'Bank') {
      if (!modalAccountNo) {
        setPaymentError('অনুগ্রহ করে প্রেরকের ব্যাংকের নাম ও অ্যাকাউন্ট নম্বর বা রেফারেন্স দিন।');
        return;
      }
    }

    setProcessingPayment(true);
    setTimeout(() => {
      const generatedTxn = modalTxnId.trim().toUpperCase() || `TRX-DMB-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const nowFormatted = new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' });

      setPaymentInfo({
        status: 'PENDING',
        amount: amt,
        method: modalMethod,
        accountNo: modalMethod === 'Card' ? `**** **** **** ${modalCardNumber.slice(-4)}` : modalAccountNo,
        txnId: generatedTxn,
        date: nowFormatted
      });

      setProcessingPayment(false);
      setShowPaymentModal(false);
    }, 800);
  };

  const handlePrintReceipt = () => {
    const printEl = document.getElementById('printable-payment-receipt');
    if (!printEl) {
      alert('পেমেন্ট রিসিট কন্টেইনার পাওয়া যায়নি।');
      return;
    }

    const win = window.open('', '_blank', 'width=850,height=950');
    if (!win) {
      alert('পপআপ ব্লক করা আছে। ব্রাউজার পারমিশন দিন।');
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DMB_Payment_Receipt_${paymentInfo.txnId || 'Receipt'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800&display=swap');
            body { font-family: 'Hind Siliguri', Arial, sans-serif; margin: 20px; color: #0f172a; background: #fff; }
            .receipt-card { border: 2px solid #0284c7; padding: 30px; border-radius: 16px; max-width: 750px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
            .logo-title { font-size: 22px; font-weight: 900; color: #0369a1; text-transform: uppercase; margin: 0; }
            .subtitle { font-size: 13px; color: #475569; margin-top: 2px; }
            .badge-title { background: #0284c7; color: #fff; font-size: 14px; font-weight: 800; padding: 6px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; }
            .grid-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .grid-table td, .grid-table th { border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 13px; text-align: left; }
            .grid-table th { background: #f8fafc; color: #334155; font-weight: 700; width: 35%; }
            .stamp-box { border: 3px double #16a34a; color: #15803d; font-weight: 900; padding: 8px 24px; border-radius: 10px; font-size: 16px; display: inline-block; transform: rotate(-2deg); margin-top: 20px; background: #f0fdf4; }
            .footer { margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
            @media print { body { margin: 0; } .receipt-card { border: none; box-shadow: none; } }
          </style>
        </head>
        <body>
          ${printEl.innerHTML}
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handlePrintApplicationForm = () => {
    const printEl = document.getElementById('printable-application-form');
    if (!printEl) {
      alert('আবেদন ফর্ম কন্টেইনার পাওয়া যায়নি।');
      return;
    }

    const win = window.open('', '_blank', 'width=900,height=1000');
    if (!win) {
      alert('পপআপ ব্লক করা আছে। ব্রাউজার পারমিশন দিন।');
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DMB_Application_Form_${submittedApp?.id || 'Form'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800&display=swap');
            body { font-family: 'Hind Siliguri', Arial, sans-serif; margin: 25px; color: #0f172a; background: #fff; }
            .form-card { border: 2px solid #334155; padding: 30px; border-radius: 12px; max-width: 800px; margin: 0 auto; }
            .header-bar { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
            .form-title { font-size: 18px; font-weight: 900; color: #0f172a; text-transform: uppercase; background: #f1f5f9; padding: 6px 16px; border-radius: 8px; display: inline-block; border: 1px solid #cbd5e1; }
            .table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            .table td, .table th { border: 1px solid #94a3b8; padding: 8px 12px; text-align: left; }
            .table th { background: #f1f5f9; font-weight: 700; color: #1e293b; width: 30%; }
            .section-title { font-size: 14px; font-weight: 800; color: #0369a1; border-bottom: 2px solid #0369a1; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; }
            @media print { body { margin: 0; } .form-card { border: none; } }
          </style>
        </head>
        <body>
          ${printEl.innerHTML}
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleSelectCircular = (circular: JobCircular) => {
    setSelectedCircular(circular);
    setFormData(prev => ({
      ...prev,
      circularId: circular.id,
      circularTitle: circular.title
    }));
    const formEl = document.getElementById('rep-application-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'photoUrl' | 'nidDocUrl' | 'educationDocUrl' | 'cvDocUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ফাইলের সাইজ সর্বোচ্চ 5MB হতে পারবে।');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, [fieldName]: base64String }));

      if (fieldName === 'photoUrl') setPhotoPreview(base64String);
      if (fieldName === 'nidDocUrl') setNidDocPreview(base64String);
      if (fieldName === 'educationDocUrl') setEducationDocPreview(base64String);
      if (fieldName === 'cvDocUrl') setCvDocName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.mobile || !formData.nidNo || !formData.fatherName) {
      setErrorMsg('অনুগ্রহ করে নাম, মোবাইল নম্বর, এনআইডি এবং পিতার নাম প্রদান করুন।');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        paymentStatus: paymentInfo.status,
        paymentAmount: paymentInfo.amount,
        paymentMethod: paymentInfo.method,
        paymentTxnId: paymentInfo.txnId,
        paymentDate: paymentInfo.date || new Date().toISOString(),
        paymentAccountNo: paymentInfo.accountNo
      };

      const res = await fetch('/api/representatives/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setSubmittedApp(data.application);
      } else {
        setErrorMsg(data.error || 'নিবন্ধন জমা নেওয়া সম্ভব হয়নি।');
      }
    } catch (err) {
      setErrorMsg('সার্ভারে যোগাযোগ করা যাচ্ছে না। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-sky-800 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
              FIELD REPRESENTATIVE & CAREER PORTAL
            </span>
            <span className="text-sky-200 text-xs font-semibold">DMB Healthcare Field Force Recruitment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            প্রতিনিধি নিয়োগ ও জব সার্কুলার পোর্টাল
          </h1>
          <p className="mt-2 text-sky-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            ডিজিটাল মিডিয়া ব্রিজের ফিল্ড প্রতিনিধি পদে আবেদন করুন। সার্কুলার দেখে পছন্দসই পদে প্রয়োজনীয় পেপারস (ছবি, এনআইডি, সার্টিফিকেট ও সিভি) আপলোড করে আবেদন জমা দিন।
          </p>
        </div>

        {/* Section 1: Active Job Circulars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              চলতি নিয়োগ বিজ্ঞপ্তিসমূহ (Active Job Circulars)
            </h2>
            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full">
              {circulars.filter(c => c.status === 'OPEN').length} টি সার্কুলার চালু
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {circulars.map(circular => (
              <div 
                key={circular.id}
                className={`bg-white rounded-2xl p-5 border-2 transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                  selectedCircular?.id === circular.id 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      circular.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {circular.status === 'OPEN' ? '✓ আবেদন চলছে (OPEN)' : 'মাসিক কোটা পূর্ণ'}
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-bold">{circular.id}</span>
                  </div>

                  <h3 className="font-black text-slate-900 text-base leading-snug">{circular.title}</h3>
                  <p className="text-xs font-bold text-sky-800">পদবী: {circular.position}</p>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="block text-[10px] text-slate-400">এলাকা/জেলা:</span>
                      <strong className="text-slate-800">{circular.district}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="block text-[10px] text-slate-400">পদ সংখ্যা:</span>
                      <strong className="text-emerald-700">{circular.vacancyCount} জন</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl col-span-2">
                      <span className="block text-[10px] text-slate-400">বেতন ও ভাতা:</span>
                      <strong className="text-slate-800">{circular.salaryAllowance}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl col-span-2">
                      <span className="block text-[10px] text-slate-400">শিক্ষাগত যোগ্যতা:</span>
                      <strong className="text-slate-800">{circular.educationRequirement}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 pt-1">
                    <p className="font-semibold text-slate-700 mb-1">প্রয়োজনীয় শর্তাবলী:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                      {circular.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-rose-600 font-bold">
                    আবেদনের শেষ তারিখ: {circular.deadline}
                  </span>
                  <button
                    onClick={() => handleSelectCircular(circular)}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                      selectedCircular?.id === circular.id 
                        ? 'bg-emerald-600 text-white shadow' 
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {selectedCircular?.id === circular.id ? (
                      <>
                        <Check className="w-4 h-4" /> নির্বাচিত পদ
                      </>
                    ) : (
                      <>
                        আবেদন করুন <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {submittedApp ? (
          /* Success Screen */
          <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                আপনার আবেদন ও পেপারস সফলভাবে জমা হয়েছে!
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                এডমিন প্যানেল থেকে আপনার এনআইডি, ছবি ও পেপারস যাচাই করা হচ্ছে। অনুমোদন শেষে আপনার মোবাইল নম্বরে নিশ্চিতকরণ SMS পাঠানো হবে।
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left max-w-lg mx-auto space-y-2.5 text-xs">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">আবেদন ট্র্যাকিং নম্বর:</span>
                <span className="font-mono font-bold text-blue-700">{submittedApp.id}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">আবেদনের পদ:</span>
                <span className="font-bold text-emerald-800">{submittedApp.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ'}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">আবেদনকারীর নাম:</span>
                <span className="font-bold text-slate-800">{submittedApp.name}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">মোবাইল (ইউজার আইডি):</span>
                <span className="font-mono font-bold text-slate-800">{submittedApp.mobile}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">এনআইডি নম্বর:</span>
                <span className="font-mono font-bold text-slate-800">{submittedApp.nidNo}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">আবেদন ফি স্ট্যাটাস:</span>
                <span className={`font-bold ${
                  submittedApp.paymentStatus === 'PAID' 
                    ? 'text-emerald-700' 
                    : submittedApp.paymentStatus === 'PENDING' 
                      ? 'text-amber-700' 
                      : 'text-rose-700'
                }`}>
                  {submittedApp.paymentStatus === 'PAID' 
                    ? `✓ PAID & VERIFIED (৳${submittedApp.paymentAmount || 500} - ${submittedApp.paymentMethod})` 
                    : submittedApp.paymentStatus === 'PENDING'
                      ? `⏳ PENDING VERIFICATION (৳${submittedApp.paymentAmount || 500} - এডমিন যাচাই সাপেক্ষ)`
                      : '✕ UNPAID'}
                </span>
              </div>
              {submittedApp.paymentTxnId && (
                <div className="flex justify-between border-b pb-1.5 font-mono">
                  <span className="text-slate-500">পেমেন্ট TrxID:</span>
                  <span className="font-bold text-slate-800">{submittedApp.paymentTxnId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">স্ট্যাটাস:</span>
                <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-extrabold text-[11px]">
                  {submittedApp.status} (এডমিন যাচাইয়ের অপেক্ষায়)
                </span>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>⚠️ বিশেষ সতর্কতা:</strong> জমাকৃত ট্রানজেকশন আইডি (TrxID) এডমিন প্যানেল হতে যাচাই করা হবে। অসত্য বা ভূয়া TrxID পাওয়া গেলে আবেদনপত্রটি স্থায়ীভাবে বাতিল করা হবে।
              </div>
            </div>

            {/* DOWNLOAD & PRINT BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePrintApplicationForm}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                আবেদন ফর্ম ডাউনলোড / প্রিন্ট করুন
              </button>

              <button
                type="button"
                onClick={handlePrintReceipt}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                পেমেন্ট মানি রিসিট ডাউনলোড / প্রিন্ট
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs text-center font-bold">
                💡 আবেদনের অবস্থা ও টাকা জমার রিসিট দেখতে নিচের বাটনে ক্লিক করুন। লগইন ইউজার আইডি: <span className="font-mono text-amber-700">{submittedApp.mobile}</span> | পাসওয়ার্ড: <span className="font-mono text-amber-700">123456</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('login')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  টেম্পরারি ড্যাশবোর্ডে লগইন করুন
                </button>
                <button
                  onClick={() => setSubmittedApp(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  নতুন আরেকটি আবেদন করুন
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Registration Form with File Uploads */
          <form id="rep-application-form" onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-8">
            
            <div className="border-b pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  JOB APPLICATION FORM
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {selectedCircular ? selectedCircular.title : 'প্রতিনিধি আবেদন ফর্ম'}
                </h2>
              </div>
              {selectedCircular && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                  ID: {selectedCircular.id}
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Personal Information */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                ১. ব্যক্তিগত ও পারিবারিক তথ্যাবলী (Personal Info)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">আবেদনকারীর নাম (Applicant Name) *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="যেমন: মো: রফিকুল ইসলাম"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">পিতার নাম (Father's Name) *</label>
                  <input
                    type="text"
                    name="fatherName"
                    required
                    placeholder="পিতার পুরো নাম"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">মাতার নাম (Mother's Name)</label>
                  <input
                    type="text"
                    name="motherName"
                    placeholder="মাতার পুরো নাম"
                    value={formData.motherName}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জন্ম তারিখ (Date of Birth)</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">লিঙ্গ (Gender)</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Male">পুরুষ (Male)</option>
                    <option value="Female">নারী (Female)</option>
                    <option value="Other">অন্যান্য (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জাতীয় পরিচয়পত্র (NID Number) *</label>
                  <input
                    type="text"
                    name="nidNo"
                    required
                    placeholder="যেমন: 19923512345678901"
                    value={formData.nidNo}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Contact & Location */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                ২. যোগাযোগ ও এলাকা (Contact & Location)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর (User ID/Login) *</label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    placeholder="01712345678"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ইমেইল (Email)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="rep@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জেলা (District)</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Gopalganj">গোপালগঞ্জ (Gopalganj)</option>
                    <option value="Narail">নড়াইল (Narail)</option>
                    <option value="Sylhet">সিলেট (Sylhet)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">উপজেলা/থানা (Upazila)</label>
                  <input
                    type="text"
                    name="upazila"
                    placeholder="যেমন: গোপালগঞ্জ সদর"
                    value={formData.upazila}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">দায়িত্বপ্রাপ্ত কাজের এলাকা (Assigned Work Area)</label>
                  <input
                    type="text"
                    name="assignedArea"
                    placeholder="যেমন: গোপালগঞ্জ সদর পৌরসভা ও ২নং ওয়ার্ড"
                    value={formData.assignedArea}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">পূর্ণাঙ্গ ঠিকানা (Full Address)</label>
                  <textarea
                    name="address"
                    rows={2}
                    placeholder="গ্রাম/মহল্লা, রোড, পোস্ট অফিস"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Education & Experience */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                ৩. শিক্ষা ও অভিজ্ঞতা (Education & Experience)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">সর্বোচ্চ শিক্ষাগত যোগ্যতা *</label>
                  <select
                    name="educationalQualification"
                    value={formData.educationalQualification}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="HSC Passed">এইচএসসি / সমমান (HSC / Equivalent)</option>
                    <option value="Bachelor Degree">স্নাতক / ডিগ্রি (BA / BSc / BCom)</option>
                    <option value="Masters Degree">স্নাতকোত্তর (MA / MSc / MBA)</option>
                    <option value="Diploma">ডিপ্লোমা (Diploma in Medical/Tech)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">কাজের অভিজ্ঞতা</label>
                  <input
                    type="text"
                    name="experienceYears"
                    placeholder="যেমন: ১ বছর (ফার্মাসিউটিক্যাল / ফিল্ড মার্কেটিং)"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Paper & File Uploads Section */}
            <div className="space-y-4 bg-sky-50/50 p-6 rounded-3xl border border-sky-100">
              <div className="border-b border-sky-200 pb-2 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Upload className="w-5 h-5 text-sky-700" />
                  ৪. প্রয়োজনীয় পেপারস ও ডকুমেন্ট ফাইল আপলোড (Documents Upload)
                </h3>
                <span className="text-[10px] text-sky-800 font-bold bg-sky-100 px-2.5 py-1 rounded-full">
                  সর্বোচ্চ ফাইল সাইজ 5MB
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                {/* 1. Passport Photo */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-extrabold text-slate-800">
                    ১. প্রার্থীর পাসপোর্ট সাইজ ছবি (Photo) *
                  </label>
                  <p className="text-[11px] text-slate-500">পরিষ্কার ছবি আপলোড করুন</p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <label className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs cursor-pointer border border-sky-200 flex items-center gap-1.5 transition">
                      <Upload className="w-4 h-4" />
                      ছবি আপলোড
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'photoUrl')} 
                      />
                    </label>
                  </div>
                </div>

                {/* 2. NID Document */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-extrabold text-slate-800">
                    ২. এনআইডি / স্মার্ট কার্ডের কপি (NID Document) *
                  </label>
                  <p className="text-[11px] text-slate-500">এনআইডির সামনের ও পিছনের ছবি</p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    {nidDocPreview ? (
                      <img src={nidDocPreview} alt="NID" className="w-20 h-14 rounded-xl object-cover border-2 border-emerald-500 shadow-sm" />
                    ) : (
                      <div className="w-20 h-14 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                    <label className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs cursor-pointer border border-sky-200 flex items-center gap-1.5 transition">
                      <Upload className="w-4 h-4" />
                      NID আপলোড
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'nidDocUrl')} 
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Educational Certificate */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-extrabold text-slate-800">
                    ৩. শিক্ষাগত যোগ্যতার সনদপত্র (Certificate)
                  </label>
                  <p className="text-[11px] text-slate-500">এইচএসসি / ডিগ্রি সার্টিফিকেট বা মার্কশীট</p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    {educationDocPreview ? (
                      <img src={educationDocPreview} alt="Certificate" className="w-20 h-14 rounded-xl object-cover border-2 border-emerald-500 shadow-sm" />
                    ) : (
                      <div className="w-20 h-14 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <Award className="w-6 h-6" />
                      </div>
                    )}
                    <label className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs cursor-pointer border border-sky-200 flex items-center gap-1.5 transition">
                      <Upload className="w-4 h-4" />
                      সনদপত্র আপলোড
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'educationDocUrl')} 
                      />
                    </label>
                  </div>
                </div>

                {/* 4. CV File */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-extrabold text-slate-800">
                    ৪. সিভি / জীবনবৃত্তান্ত (CV / Resume File)
                  </label>
                  <p className="text-[11px] text-slate-500">PDF বা ইমেজ ফরম্যাটের সিভি</p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1 p-2 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-600 truncate">
                      {cvDocName || 'কোনো সিভি ফাইল সিলেক্ট করা হয়নি'}
                    </div>
                    <label className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs cursor-pointer border border-sky-200 flex items-center gap-1.5 transition flex-shrink-0">
                      <Upload className="w-4 h-4" />
                      সিভি আপলোড
                      <input 
                        type="file" 
                        accept="image/*,.pdf,.doc,.docx" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'cvDocUrl')} 
                      />
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* PAYMENT FEE SECTION (আবেদন ফি পরিশোধ) */}
            <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-emerald-950 p-5 sm:p-6 rounded-3xl text-white shadow-xl space-y-4 border border-sky-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">আবেদন ফি পরিশোধের তথ্য (Application Fee)</h3>
                      <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        ফ্লেক্সিবল পেমেন্ট
                      </span>
                    </div>
                    <p className="text-xs text-sky-200 mt-0.5">
                      বিকাশ, নগদ, ব্যাংক ট্রান্সফার অথবা কার্ডের মাধ্যমে আবেদন ফি পেমেন্ট করুন।
                    </p>
                  </div>
                </div>

                {paymentInfo.status === 'PAID' && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-extrabold text-xs px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ফি পরিশোধিত (PAID)
                  </span>
                )}
              </div>

              {paymentInfo.status === 'PAID' ? (
                /* Paid Status Card */
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-black/20 p-2.5 rounded-xl">
                      <span className="text-[10px] text-sky-200 block">পরিশোধের পরিমাণ:</span>
                      <strong className="text-amber-300 text-base font-black">৳ {paymentInfo.amount} BDT</strong>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-xl">
                      <span className="text-[10px] text-sky-200 block">পেমেন্ট মেথড:</span>
                      <strong className="text-white font-bold">{paymentInfo.method} ({paymentInfo.accountNo || 'N/A'})</strong>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-xl">
                      <span className="text-[10px] text-sky-200 block">ট্রানজেকশন ID:</span>
                      <strong className="text-emerald-300 font-mono font-extrabold">{paymentInfo.txnId}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-200 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">⚠️ বিশেষ সতর্কতা:</strong> জমাকৃত ট্রানজেকশন আইডি (TrxID) এডমিন প্যানেল হতে ভেরিফাই করা হবে। ভূয়া TrxID বা অসত্য পেমেন্ট তথ্য দেওয়া হলে আবেদনটি সরাসরি বাতিল বলে গণ্য হবে।
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handlePrintReceipt}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" />
                      পেমেন্ট মানি রিসিট প্রিন্ট / ডাউনলোড
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white font-semibold text-xs rounded-xl border border-white/20 transition"
                    >
                      পেমেন্ট পরিবর্তন / রি-সাবমিট
                    </button>
                  </div>
                </div>
              ) : (
                /* Unpaid Button & Option */
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="text-xs text-amber-300 font-bold flex items-center gap-1 justify-center sm:justify-start">
                      <AlertCircle className="w-4 h-4" />
                      আবেদন ফি এখনও পেমেন্ট করা হয়নি (Unpaid)
                    </div>
                    <p className="text-[11px] text-slate-300">
                      নিচের বাটনে ক্লিক করে পছন্দসই আবেদন ফি দিয়ে বিকাশ/নগদ/ব্যাংক/কার্ডে পেমেন্ট করুন।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xl cursor-pointer transition flex items-center justify-center gap-2 flex-shrink-0"
                  >
                    <CreditCard className="w-4.5 h-4.5" />
                    আবেদন ফি পরিশোধ করুন (Pay Application Fee)
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-700 hover:from-emerald-700 hover:to-sky-800 text-white font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>আবেদন ও পেপারস প্রসেস হচ্ছে...</span>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  আবেদন ও পেপারস জমা দিন (Submit Application)
                </>
              )}
            </button>
          </form>
        )}

        {/* PAYMENT MODAL POPUP */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0">
              
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-teal-900 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base leading-tight">আবেদন ফি অনলাইন পেমেন্ট গেটওয়ে</h3>
                    <p className="text-[11px] text-sky-200">ডিজিটাল মিডিয়া ব্রিজ পে-পয়েন্ট</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                
                {paymentError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Amount Custom Input & Presets */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-black text-slate-800">
                    আবেদন ফির পরিমাণ (টাকা):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-sm">৳</span>
                    <input
                      type="number"
                      value={modalAmount}
                      onChange={(e) => setModalAmount(e.target.value)}
                      placeholder="500"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-extrabold text-slate-900 text-base focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold">কুইক সিলেক্ট:</span>
                    {['200', '500', '1000', '2000'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setModalAmount(amt)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                          modalAmount === amt 
                            ? 'bg-sky-600 text-white shadow' 
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method Tabs */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-800">
                    পেমেন্ট মেথড সিলেক্ট করুন:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setModalMethod('bKash')}
                      className={`py-2.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                        modalMethod === 'bKash' 
                          ? 'border-pink-500 bg-pink-50 text-pink-700 font-black shadow-sm ring-2 ring-pink-500/20' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-pink-600" />
                      <span className="text-[11px] font-bold">বিকাশ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalMethod('Nagad')}
                      className={`py-2.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                        modalMethod === 'Nagad' 
                          ? 'border-orange-500 bg-orange-50 text-orange-700 font-black shadow-sm ring-2 ring-orange-500/20' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-orange-600" />
                      <span className="text-[11px] font-bold">নগদ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalMethod('Bank')}
                      className={`py-2.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                        modalMethod === 'Bank' 
                          ? 'border-blue-600 bg-blue-50 text-blue-800 font-black shadow-sm ring-2 ring-blue-500/20' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="text-[11px] font-bold">ব্যাংক</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalMethod('Card')}
                      className={`py-2.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                        modalMethod === 'Card' 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-black shadow-sm ring-2 ring-emerald-500/20' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px] font-bold">কার্ড</span>
                    </button>
                  </div>
                </div>

                {/* bKash Details */}
                {modalMethod === 'bKash' && (() => {
                  const bkashConfig = paymentSettings?.methods?.find(m => m.id.toLowerCase() === 'bkash') || {
                    number: '01700-000000',
                    accountType: 'Merchant',
                    instructions: '১. বিকাশ অ্যাপ বা *২৪৭# ডায়াল করে Make Payment এ যান।\n২. মার্চেন্ট নম্বর ০১৭০০-০০০০০০ এ টাকা পাঠান।'
                  };
                  return (
                    <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-pink-200/60 pb-2">
                        <span className="font-bold text-pink-900">bKash অ্যাকাউন্ট ({bkashConfig.accountType}):</span>
                        <span className="font-mono font-extrabold text-pink-700 bg-pink-100 px-2 py-0.5 rounded">
                          {bkashConfig.number}
                        </span>
                      </div>
                      <div className="text-[11px] text-pink-800 whitespace-pre-line leading-relaxed font-sans bg-pink-100/50 p-2 rounded-lg border border-pink-200/50">
                        {bkashConfig.instructions || `১. বিকাশ অ্যাপে 'Make Payment' দিয়ে ${bkashConfig.number} নম্বর দিন।\n২. ফি ৳${modalAmount} টাকা পাঠিয়ে TrxID লিখুন।`}
                      </div>
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            বিকাশ প্রেরক নম্বর (Sender Number) *
                          </label>
                          <input
                            type="text"
                            value={modalAccountNo}
                            onChange={(e) => setModalAccountNo(e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-pink-300 font-mono text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            ট্রানজেকশন আইডি (bKash TrxID)
                          </label>
                          <input
                            type="text"
                            value={modalTxnId}
                            onChange={(e) => setModalTxnId(e.target.value)}
                            placeholder="যেমন: TRX98765432"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-pink-300 font-mono text-xs uppercase focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Nagad Details */}
                {modalMethod === 'Nagad' && (() => {
                  const nagadConfig = paymentSettings?.methods?.find(m => m.id.toLowerCase() === 'nagad') || {
                    number: '01800-000000',
                    accountType: 'Merchant',
                    instructions: '১. নগদ অ্যাপ বা *১৬৭# ডায়াল করে Merchant Pay এ যান।\n২. মার্চেন্ট নম্বর ০১৮০০-০০০০০০ এ টাকা পাঠান।'
                  };
                  return (
                    <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-orange-200/60 pb-2">
                        <span className="font-bold text-orange-900">নগদ অ্যাকাউন্ট ({nagadConfig.accountType}):</span>
                        <span className="font-mono font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                          {nagadConfig.number}
                        </span>
                      </div>
                      <div className="text-[11px] text-orange-800 whitespace-pre-line leading-relaxed font-sans bg-orange-100/50 p-2 rounded-lg border border-orange-200/50">
                        {nagadConfig.instructions || `১. নগদ অ্যাপে মার্চেন্ট পে দিয়ে ${nagadConfig.number} নম্বর দিন।\n২. ফি ৳${modalAmount} টাকা পাঠিয়ে TrxID লিখুন।`}
                      </div>
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            নগদ প্রেরক নম্বর (Sender Number) *
                          </label>
                          <input
                            type="text"
                            value={modalAccountNo}
                            onChange={(e) => setModalAccountNo(e.target.value)}
                            placeholder="018XXXXXXXX"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-orange-300 font-mono text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            ট্রানজেকশন আইডি (Nagad TrxID)
                          </label>
                          <input
                            type="text"
                            value={modalTxnId}
                            onChange={(e) => setModalTxnId(e.target.value)}
                            placeholder="যেমন: NGD12345678"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-orange-300 font-mono text-xs uppercase focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Bank Details */}
                {modalMethod === 'Bank' && (() => {
                  const bankConfig = paymentSettings?.methods?.find(m => m.id.toLowerCase() === 'bank') || {
                    number: '1234567890123',
                    bankBranch: 'ইসলামী ব্যাংক বাংলাদেশ লিমিটেড, গোপালগঞ্জ শাখা',
                    routingNo: '125270123',
                    instructions: '১. ব্যাংক অ্যাকাউন্টে জমা দিয়ে রেফারেন্স তথ্য ইনপুট দিন।'
                  };
                  return (
                    <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-blue-200 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">ব্যাংক শাখা ও তথ্য:</span>
                          <strong className="text-blue-900 font-bold">{bankConfig.bankBranch || 'Digital Medi Bridge Bank Account'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">অ্যাকাউন্ট নম্বর:</span>
                          <strong className="font-mono text-slate-900 font-bold">{bankConfig.number}</strong>
                        </div>
                        {bankConfig.routingNo && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">রাউটিং নম্বর:</span>
                            <strong className="font-mono text-slate-700">{bankConfig.routingNo}</strong>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            প্রেরকের ব্যাংকের নাম ও অ্যাকাউন্ট নম্বর *
                          </label>
                          <input
                            type="text"
                            value={modalAccountNo}
                            onChange={(e) => setModalAccountNo(e.target.value)}
                            placeholder="যেমন: DBBL (A/C: 201.110.XXXX)"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-blue-300 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            ডিপোজিট স্লিপ / রেফারেন্স নম্বর
                          </label>
                          <input
                            type="text"
                            value={modalTxnId}
                            onChange={(e) => setModalTxnId(e.target.value)}
                            placeholder="যেমন: SLIP-998822"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-blue-300 font-mono text-xs uppercase focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Card Details */}
                {modalMethod === 'Card' && (
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900">Visa / Mastercard / AMEX</span>
                      <div className="flex gap-1">
                        <span className="bg-white border text-[10px] px-2 py-0.5 rounded font-extrabold text-blue-700">VISA</span>
                        <span className="bg-white border text-[10px] px-2 py-0.5 rounded font-extrabold text-rose-600">MC</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                          কার্ডহোল্ডারের নাম (Cardholder Name)
                        </label>
                        <input
                          type="text"
                          value={modalCardName}
                          onChange={(e) => setModalCardName(e.target.value)}
                          placeholder="NURUL ISLAM"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-emerald-300 text-xs uppercase focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                          কার্ড নম্বর (Card Number) *
                        </label>
                        <input
                          type="text"
                          value={modalCardNumber}
                          onChange={(e) => setModalCardNumber(e.target.value)}
                          placeholder="4123 4567 8901 2345"
                          maxLength={19}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-emerald-300 font-mono text-xs focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            মেয়াদ (MM/YY) *
                          </label>
                          <input
                            type="text"
                            value={modalCardExpiry}
                            onChange={(e) => setModalCardExpiry(e.target.value)}
                            placeholder="12/28"
                            maxLength={5}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-emerald-300 font-mono text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            CVV Code *
                          </label>
                          <input
                            type="password"
                            value={modalCardCvv}
                            onChange={(e) => setModalCardCvv(e.target.value)}
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-emerald-300 font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={processingPayment}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-700 hover:from-emerald-700 hover:to-sky-800 text-white font-black text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>পেমেন্ট ভেরিফাই করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      পেমেন্ট নিশ্চিত করুন (Confirm ৳{modalAmount})
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* PRINTABLE PAYMENT MONEY RECEIPT CONTAINER (Hidden in view, used for window.print) */}
        <div id="printable-payment-receipt" className="hidden">
          <div className="receipt-card">
            <div className="header">
              <h1 className="logo-title">DIGITAL MEDI BRIDGE (DMB)</h1>
              <p className="subtitle">Healthcare Network & Field Recruitment Cell | Helpline: 09658887470</p>
              <div className="badge-title">OFFICIAL PAYMENT MONEY RECEIPT</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '13px' }}>
              <div><strong>রিসিট নম্বর:</strong> REC-{paymentInfo.txnId || '20260808'}</div>
              <div><strong>তারিখ:</strong> {paymentInfo.date || new Date().toLocaleDateString('bn-BD')}</div>
            </div>

            <table className="grid-table">
              <tbody>
                <tr>
                  <th>আবেদনকারীর নাম (Payer):</th>
                  <td><strong>{formData.name || 'আবেদনকারী'}</strong></td>
                </tr>
                <tr>
                  <th>মোবাইল নম্বর:</th>
                  <td>{formData.mobile || 'N/A'}</td>
                </tr>
                <tr>
                  <th>আবেদনের পদবী:</th>
                  <td>{formData.circularTitle || selectedCircular?.title || 'ফিল্ড রিপ্রেজেন্টেটিভ'}</td>
                </tr>
                <tr>
                  <th>এনআইডি নম্বর:</th>
                  <td>{formData.nidNo || 'N/A'}</td>
                </tr>
                <tr>
                  <th>পেমেন্ট মেথড (Gateway):</th>
                  <td><strong>{paymentInfo.method}</strong> ({paymentInfo.accountNo || 'Online'})</td>
                </tr>
                <tr>
                  <th>ট্রানজেকশন ID (TrxID):</th>
                  <td><strong style={{ fontFamily: 'monospace', color: '#0369a1' }}>{paymentInfo.txnId}</strong></td>
                </tr>
                <tr>
                  <th>পরিশোধিত ফি এর পরিমাণ:</th>
                  <td><strong style={{ fontSize: '16px', color: '#16a34a' }}>৳ {paymentInfo.amount}.00 BDT</strong></td>
                </tr>
              </tbody>
            </table>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              {(submittedApp?.paymentStatus === 'PAID' || paymentInfo.status === 'PAID') ? (
                <div className="stamp-box" style={{ background: '#ecfdf5', borderColor: '#10b981', color: '#047857' }}>
                  ✓ OFFICIAL PAYMENT VERIFIED & APPROVED BY ADMIN
                </div>
              ) : (
                <div>
                  <div className="stamp-box" style={{ background: '#fffbeb', borderColor: '#f59e0b', color: '#b45309' }}>
                    ⏳ PENDING ADMIN VERIFICATION (ভেরিফিকেশন সাপেক্ষ রিসিট)
                  </div>
                  <p style={{ fontSize: '11px', color: '#78350f', marginTop: '6px', textAlign: 'center' }}>
                    * বিশেষ দ্রষ্টব্য: প্রার্থী কর্তৃক জমাকৃত ট্রানজেকশন তথ্য (TrxID: {paymentInfo.txnId || submittedApp?.paymentTxnId}) এডমিন প্যানেল হতে যাচাই ও অনুমোদন করার পরই এটি অফিসিয়াল চূড়ান্ত পেইড রিসিটে রূপান্তরিত হবে।
                  </p>
                </div>
              )}
            </div>

            <div className="footer">
              <div>* এটি কম্পিউটার জেনারেটেড অফিসিয়াল রিসিট। কোনো ম্যানুয়াল স্বাক্ষরের প্রয়োজন নেই।</div>
              <div>অফিসিয়াল কপি | DMB Healthcare</div>
            </div>
          </div>
        </div>

        {/* PRINTABLE JOB APPLICATION FORM CONTAINER (Hidden in view, used for window.print) */}
        <div id="printable-application-form" className="hidden">
          <div className="form-card">
            <div className="header-bar">
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>ডিজিটাল মিডিয়া ব্রিজ (DMB HEALTHCARE)</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>ফিল্ড প্রতিনিধি নিয়োগ প্যানেল | হেল্পলাইন: 09658887470</p>
              <div style={{ marginTop: '10px' }}>
                <span className="form-title">চাকরির আবেদন পত্র (JOB APPLICATION FORM)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ fontSize: '13px' }}>
                <div><strong>আবেদন ট্র্যাকিং ID:</strong> <span style={{ fontFamily: 'monospace', color: '#0369a1', fontWeight: 'bold' }}>{submittedApp?.id || 'REP-APP-2026'}</span></div>
                <div><strong>আবেদনের তারিখ:</strong> {submittedApp?.appliedDate || new Date().toLocaleDateString('bn-BD')}</div>
                <div><strong>নিয়োগ বিজ্ঞপ্তির পদ:</strong> <strong style={{ color: '#047857' }}>{submittedApp?.circularTitle || selectedCircular?.title || 'ফিল্ড রিপ্রেজেন্টেটিভ'}</strong></div>
              </div>
              <div style={{ width: '90px', height: '110px', border: '2px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                <img src={formData.photoUrl || photoPreview} alt="Applicant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            <div className="section-title">১. ব্যক্তিগত ও পারিবারিক বিবরণ</div>
            <table className="table">
              <tbody>
                <tr>
                  <th>আবেদনকারীর নাম:</th>
                  <td><strong>{formData.name}</strong></td>
                </tr>
                <tr>
                  <th>পিতার নাম:</th>
                  <td>{formData.fatherName}</td>
                </tr>
                <tr>
                  <th>মাতার নাম:</th>
                  <td>{formData.motherName || 'N/A'}</td>
                </tr>
                <tr>
                  <th>জন্ম তারিখ ও লিঙ্গ:</th>
                  <td>{formData.dob} | {formData.gender}</td>
                </tr>
                <tr>
                  <th>এনআইডি (NID) নম্বর:</th>
                  <td><strong>{formData.nidNo}</strong></td>
                </tr>
                <tr>
                  <th>মোবাইল নম্বর:</th>
                  <td><strong>{formData.mobile}</strong></td>
                </tr>
                <tr>
                  <th>ইমেইল ঠিকানা:</th>
                  <td>{formData.email || 'N/A'}</td>
                </tr>
                <tr>
                  <th>ঠিকানা (গ্রাম/ওয়ার্ড):</th>
                  <td>{formData.address}, {formData.upazila}, {formData.district}</td>
                </tr>
              </tbody>
            </table>

            <div className="section-title">২. যোগ্যতা ও অভিজ্ঞতার তথ্য</div>
            <table className="table">
              <tbody>
                <tr>
                  <th>সর্বশেষ শিক্ষাগত যোগ্যতা:</th>
                  <td>{formData.educationalQualification}</td>
                </tr>
                <tr>
                  <th>অভিজ্ঞতা:</th>
                  <td>{formData.experienceYears}</td>
                </tr>
                <tr>
                  <th>বরাদ্দকৃত কাজের এলাকা:</th>
                  <td>{formData.assignedArea}</td>
                </tr>
              </tbody>
            </table>

            <div className="section-title">৩. আবেদন ফি ও পেমেন্ট বিবরণ</div>
            <table className="table">
              <tbody>
                <tr>
                  <th>পেমেন্ট স্ট্যাটাস:</th>
                  <td>
                    {(submittedApp?.paymentStatus === 'PAID' || paymentInfo.status === 'PAID') ? (
                      <strong style={{ color: '#16a34a' }}>✓ PAID & VERIFIED (এডমিন কর্তৃক অনুমোদিত)</strong>
                    ) : (
                      <strong style={{ color: '#d97706' }}>⏳ PENDING (এডমিন ভেরিফিকেশন সাপেক্ষ)</strong>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>ফি এর পরিমাণ:</th>
                  <td>৳ {paymentInfo.amount || submittedApp?.paymentAmount || 500}.00 BDT</td>
                </tr>
                <tr>
                  <th>পেমেন্ট মেথড ও TrxID:</th>
                  <td>{paymentInfo.method || submittedApp?.paymentMethod} | TrxID: <strong>{paymentInfo.txnId || submittedApp?.paymentTxnId || 'PENDING'}</strong></td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingTop: '30px' }}>
              <div style={{ borderTop: '1px solid #475569', width: '180px', textAlign: 'center', paddingTop: '5px' }}>
                আবেদনকারীর স্বাক্ষর
              </div>
              <div style={{ borderTop: '1px solid #475569', width: '200px', textAlign: 'center', paddingTop: '5px' }}>
                অনুমোদনকারী কর্মকর্তার স্বাক্ষর ও সিল
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
