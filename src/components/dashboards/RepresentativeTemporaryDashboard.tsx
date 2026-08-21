import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, XCircle, RefreshCw, LogOut, FileText, Printer, 
  User, Phone, Mail, MapPin, Calendar, Award, ShieldCheck, Download, 
  ExternalLink, Sparkles, Building2, CreditCard, ArrowRight, AlertCircle, Eye, Receipt
} from 'lucide-react';
import { User as UserType, RepresentativeApplication } from '../../types';

interface Props {
  user: UserType;
  onLogout: () => void;
  onApproved?: () => void;
}

export const RepresentativeTemporaryDashboard: React.FC<Props> = ({ user, onLogout, onApproved }) => {
  const [repProfile, setRepProfile] = useState<RepresentativeApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isApprovedAnimation, setIsApprovedAnimation] = useState(false);

  useEffect(() => {
    fetchApplicationStatus();

    // Auto poll every 10 seconds to check if Admin approves application
    const interval = setInterval(() => {
      fetchApplicationStatus(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchApplicationStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/representatives/applications');
      if (res.ok) {
        const apps: RepresentativeApplication[] = await res.json();
        const myApp = apps.find(a => 
          a.mobile === user.mobile || 
          a.id === user.id || 
          (a.email && user.email && a.email.toLowerCase() === user.email.toLowerCase())
        );

        if (myApp) {
          setRepProfile(myApp);

          // If status turned to APPROVED!
          if (myApp.status === 'APPROVED') {
            setIsApprovedAnimation(true);
            setTimeout(() => {
              if (onApproved) onApproved();
              else window.location.reload();
            }, 2500);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching application status:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Print Official Money Receipt Function
  const handlePrintReceipt = () => {
    const app = repProfile || {
      id: user.id || 'REP-APP-1001',
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      circularTitle: 'ফিল্ড রিপ্রেজেন্টেটিভ পদ',
      appliedDate: user.createdAt || new Date().toISOString().split('T')[0],
      status: 'PENDING',
      paymentAmount: 500,
      paymentMethod: 'bKash / Nagad',
      paymentTxnId: 'TRX-DEFAULT-2026',
      paymentDate: new Date().toISOString(),
      upazila: 'Gopalganj Sadar',
      district: 'Gopalganj'
    };

    const printWin = window.open('', '_blank', 'width=850,height=950');
    if (!printWin) {
      alert('পপআপ ব্লক করা আছে। ব্রাউজার পারমিশন দিয়ে আবার চেষ্টা করুন।');
      return;
    }

    const receiptNo = `DMB-REC-${app.paymentTxnId || app.id.slice(-6)}`;
    const formattedDate = app.paymentDate ? new Date(app.paymentDate).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('bn-BD');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>টাকা জমার রিসিট - ${app.name}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
            .receipt-card { max-width: 750px; margin: 0 auto; background: #ffffff; border: 2px solid #0284c7; border-radius: 16px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); position: relative; }
            .header { display: flex; align-items: center; justify-content: space-between; border-b: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 20px; }
            .brand { display: flex; align-items: center; gap: 15px; }
            .logo-badge { width: 55px; h: 55px; background: #0284c7; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 22px; }
            .title h1 { margin: 0; font-size: 20px; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; }
            .title p { margin: 3px 0 0; font-size: 12px; color: #64748b; font-weight: 600; }
            .receipt-no { text-align: right; }
            .receipt-no h2 { margin: 0; font-size: 16px; color: #0f172a; font-family: monospace; }
            .receipt-no span { font-size: 11px; color: #64748b; font-weight: bold; }
            .status-badge { display: inline-block; padding: 6px 14px; background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-size: 12px; font-weight: 800; border-radius: 20px; margin-bottom: 15px; }
            .details-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .details-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
            .details-table td.label { font-weight: 700; color: #475569; width: 35%; background: #f8fafc; }
            .details-table td.val { font-weight: 800; color: #0f172a; }
            .amount-box { margin-top: 25px; padding: 15px 20px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; }
            .amount-box span { font-size: 14px; font-weight: 800; color: #0369a1; }
            .amount-box h3 { margin: 0; font-size: 22px; color: #0284c7; font-weight: 900; font-family: monospace; }
            .footer { margin-top: 35px; display: flex; justify-content: space-between; align-items: flex-end; pt-2; }
            .signature { text-align: center; border-top: 1px solid #94a3b8; width: 180px; padding-top: 5px; font-size: 11px; font-weight: 700; color: #475569; }
            .seal { font-size: 10px; color: #94a3b8; text-align: center; }
            @media print {
              body { background: white; padding: 0; }
              .receipt-card { border: 2px solid #000; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div class="brand">
                <div class="logo-badge">DMB</div>
                <div class="title">
                  <h1>Digital Media Bridge (DMB)</h1>
                  <p>গোপালগঞ্জ সেন্ট্রাল অফিস - নিয়োগ আবেদন ফি মানি রিসিট</p>
                </div>
              </div>
              <div class="receipt-no">
                <h2>${receiptNo}</h2>
                <span>তারিখ: ${formattedDate}</span>
              </div>
            </div>

            <div style="text-align: right;">
              <span class="status-badge">⏳ PENDING ADMIN VERIFICATION (ভেরিফিকেশন সাপেক্ষ রিসিট)</span>
            </div>

            <table class="details-table">
              <tr>
                <td class="label">আবেদনকারীর নাম:</td>
                <td class="val">${app.name}</td>
              </tr>
              <tr>
                <td class="label">আবেদন আইডি / ট্র্যাক আইডি:</td>
                <td class="val" style="font-family: monospace;">${app.id}</td>
              </tr>
              <tr>
                <td class="label">পদের নাম:</td>
                <td class="val">${app.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ (মাঠ প্রতিনিধি)'}</td>
              </tr>
              <tr>
                <td class="label">মোবাইল নম্বর:</td>
                <td class="val" style="font-family: monospace;">${app.mobile}</td>
              </tr>
              <tr>
                <td class="label">জেলা ও উপজেলা:</td>
                <td class="val">${app.upazila || 'Sadar'}, ${app.district || 'Gopalganj'}</td>
              </tr>
              <tr>
                <td class="label">পেমেন্ট মেথড (Medium):</td>
                <td class="val">${app.paymentMethod || 'bKash/Nagad Online Gateway'}</td>
              </tr>
              <tr>
                <td class="label">ট্রানজেকশন আইডি (TrxID):</td>
                <td class="val" style="font-family: monospace; color: #0284c7;">${app.paymentTxnId || 'N/A'}</td>
              </tr>
            </table>

            <div class="amount-box">
              <span>প্রদেয় মোট আবেদন ফি:</span>
              <h3>৳ ${(app.paymentAmount || 500).toFixed(2)}</h3>
            </div>

            <p style="font-size: 11px; color: #64748b; margin-top: 15px; font-style: italic; text-align: center;">
              * এটি একটি অনলাইন সিস্টেম জেনারেটেড রিসিট। এডমিন প্যানেল হতে আপনার কাগজপত্র ও পেমেন্ট যাচাইকরণের পর চূড়ান্ত নিয়োগ অনুমোদন প্রদান করা হবে।
            </p>

            <div class="footer">
              <div class="seal">
                ডিজিটাল মিডিয়া ব্রিজ কম্পিউটারাইজড কপি<br>
                www.health.nit.bd
              </div>
              <div class="signature">
                অনুমোদিত হিসাব কর্মকর্তা<br>
                ডিজিটাল মিডিয়া ব্রিজ (DMB)
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const app = repProfile || {
    id: user.id || 'REP-APP-1001',
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    circularTitle: 'সাধারণ প্রতিনিধি নিবন্ধন (Field Representative)',
    appliedDate: user.createdAt || new Date().toISOString().split('T')[0],
    status: 'PENDING',
    paymentAmount: 500,
    paymentMethod: 'bKash / Mobile Banking',
    paymentTxnId: 'TRX-DEFAULT-2026',
    paymentDate: new Date().toISOString(),
    upazila: 'Gopalganj Sadar',
    district: 'Gopalganj',
    educationalQualification: 'HSC / Equivalent',
    experienceYears: '0-1 Year',
    assignedArea: 'গোপালগঞ্জ সদর উপজেলা',
    photoUrl: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16 font-sans">
      
      {/* APPROVED CELEBRATION OVERLAY ANIMATION */}
      {isApprovedAnimation && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-500 flex items-center justify-center text-emerald-400 mb-6 animate-bounce">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">🎉 অভিনন্দন! আবেদন অনুমোদিত হয়েছে!</h1>
          <p className="text-lg text-emerald-300 font-bold max-w-xl">
            আপনার ফিল্ড রিপ্রেজেন্টেটিভ আবেদনটি সফলভাবে অনুমোদন করা হয়েছে। আপনাকে সরাসরি মাঠ প্রতিনিধি পোর্টালে রিডাইরেক্ট করা হচ্ছে...
          </p>
          <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm font-mono">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg">
              DMB
            </div>
            <div>
              <h1 className="font-black text-base text-white tracking-wide flex items-center gap-2">
                আবেদনকারী টেম্পরারি ড্যাশবোর্ড
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  TEMPORARY PANEL
                </span>
              </h1>
              <p className="text-xs text-slate-400">ডিজিটাল মিডিয়া ব্রিজ (DMB) - মাঠ প্রতিনিধি প্যানেল</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchApplicationStatus()}
              disabled={refreshing}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="স্ট্যাটাস রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">স্ট্যাটাস রিফ্রেশ</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* WELCOME APPLICANT CARD */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <img
                src={app.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                alt={app.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-xl flex-shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                    ID: {app.id}
                  </span>
                  <span className="text-xs text-slate-400">
                    আবেদনের তারিখ: <span className="font-mono text-slate-200">{app.appliedDate}</span>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{app.name}</h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  আবেদনকৃত পদ: <span className="font-extrabold text-amber-300">{app.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ (মাঠ প্রতিনিধি)'}</span>
                </p>
                <p className="text-xs text-slate-400">
                  মোবাইল: <span className="font-mono text-slate-200">{app.mobile}</span> | এলাকা: <span className="text-slate-200 font-bold">{app.upazila}, {app.district}</span>
                </p>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowReceiptModal(true)}
                className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>টাকা জমার রিসিট দেখুন</span>
              </button>

              <button
                onClick={handlePrintReceipt}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm border border-slate-700 shadow transition flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-sky-400" />
                <span>প্রিন্ট রিসিট</span>
              </button>
            </div>
          </div>
        </div>

        {/* LIVE STEP TIMELINE & STATUS BANNER */}
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                আবেদনের বর্তমান অগ্রগতি ও অবস্থা (Live Status)
              </h3>
              <p className="text-xs text-slate-400">এডমিন প্যানেল হতে পেপারস যাচাইকরণ সম্পন্ন হওয়ার প্রতিটি ধাপ নিচে দেওয়া হলো</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>লাইব সিঙ্ক চালু</span>
            </div>
          </div>

          {/* 3-STEP TIMELINE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* STEP 1: Application & Fee */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-emerald-500/40 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-400 font-black text-xs flex items-center justify-center">
                  ১
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> সম্পন্ন
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-white mb-1">আবেদন ও ফি জমা</h4>
              <p className="text-xs text-slate-400">অনলাইনে আবেদনপত্র পূরণ ও ৳৫০০ নিয়োগ আবেদন ফি জমা নেওয়া হয়েছে।</p>
            </div>

            {/* STEP 2: Papers Verification */}
            <div className={`p-5 rounded-2xl border relative ${
              app.status === 'APPROVED' 
                ? 'bg-slate-900/90 border-emerald-500/40' 
                : app.status === 'REJECTED'
                ? 'bg-rose-950/20 border-rose-500/40'
                : 'bg-amber-950/20 border-amber-500/50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center ${
                  app.status === 'APPROVED' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' 
                    : app.status === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500 animate-pulse'
                }`}>
                  ২
                </span>
                
                {app.status === 'APPROVED' ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> অনুমোদিত
                  </span>
                ) : app.status === 'REJECTED' ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> বাতিল
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3" /> পেপারস ভেরিফিকেশন চলছে
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-sm text-white mb-1">এডমিন ভেরিফিকেশন</h4>
              <p className="text-xs text-slate-400">
                {app.status === 'APPROVED' 
                  ? 'কাগজপত্র ও পেমেন্ট যাচাই শেষে আপনার নিয়োগ অনুমোদন করা হয়েছে।'
                  : app.status === 'REJECTED'
                  ? 'আপনার আবেদনে অসংগতি থাকায় আবেদনটি বাতিল করা হয়েছে।'
                  : 'গোপালগঞ্জ কেন্দ্রীয় অফিস থেকে আপনার সার্টিফিকেট ও পেমেন্ট ট্রানজেকশন যাচাই করা হচ্ছে।'}
              </p>
            </div>

            {/* STEP 3: Approval & Representative Portal */}
            <div className={`p-5 rounded-2xl border relative ${
              app.status === 'APPROVED' 
                ? 'bg-slate-900/90 border-emerald-500/40' 
                : 'bg-slate-900/40 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center ${
                  app.status === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  ৩
                </span>
                
                {app.status === 'APPROVED' ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ পোর্টাল আনলকড
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    🔒 অপেক্ষমাণ
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-sm text-white mb-1">প্রতিনিধি পোর্টাল ও আইডি কার্ড</h4>
              <p className="text-xs text-slate-400">অনুমোদনের পর সম্পূর্ণ ফিল্ড রিপ্রেজেন্টেটিভ পোর্টাল ও ডিজিটাল আইডি কার্ড অ্যাক্টিভ হবে।</p>
            </div>

          </div>

          {/* DYNAMIC STATUS EXPLANATION ALERT */}
          {app.status === 'PENDING' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3.5">
              <Clock className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <h5 className="font-bold text-sm text-amber-300">⏳ আপনার আবেদনটি বর্তমানে ভেরিফিকেশনের জন্য অপেক্ষমাণ রয়েছে</h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ধন্যবাদ! আপনার আবেদন ও ডকুমেন্টস আমাদের সিস্টেমে সফলভাবে জমা হয়েছে। আমাদের অ্যাডমিন টিম আপনার সার্টিফিকেট ও পেমেন্ট ভেরিফাই করছে। সাধারণত ১২ থেকে ২৪ ঘণ্টার মধ্যে ভেরিফিকেশন সম্পন্ন হয়। এডমিন অনুমোদন দেওয়া মাত্রই আপনার প্যানেলটি স্বয়ংক্রিয়ভাবে **মাঠ প্রতিনিধি পোর্টালে (Representative Dashboard)** রূপান্তরিত হয়ে যাবে।
                </p>
              </div>
            </div>
          )}

          {app.status === 'REJECTED' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 flex items-start gap-3.5">
              <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-bold text-sm text-rose-300">✕ দুঃখিত! আপনার আবেদনটি অনুমোদন করা সম্ভব হয়নি</h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  আপনার জমা দেওয়া পেপারস অথবা পেমেন্ট ট্রানজেকশনে অসংগতি পাওয়ার কারণে এডমিন কর্তৃক এটি বাতিল করা হয়েছে। বিস্তারিত জানতে অনুগ্রহ করে গোপালগঞ্জ হেল্পলাইনে যোগাযোগ করুন।
                </p>
              </div>
            </div>
          )}

          {app.status === 'APPROVED' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex items-start gap-3.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-bold text-sm text-emerald-300">🎉 অভিনন্দন! আপনার ফিল্ড রিপ্রেজেন্টেটিভ পদ অনুমোদিত হয়েছে</h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  এডমিন প্যানেল হতে আপনার কাগজপত্র এবং পেমেন্ট সঠিকভাবে ভেরিফাই করা হয়েছে। নিচের বাটনে ক্লিক করে আপনি মাঠ প্রতিনিধি ড্যাশবোর্ডে প্রবেশ করতে পারেন।
                </p>
                <button
                  onClick={() => onApproved ? onApproved() : window.location.reload()}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>মাঠ প্রতিনিধি পোর্টালে প্রবেশ করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TWO COLUMN GRID: MONEY RECEIPT PREVIEW & SUBMITTED DATA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMN 1: MONEY RECEIPT CARD */}
          <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">টাকা জমার অফিশিয়াল রিসিট (Receipt)</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-extrabold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                ৳ {(app.paymentAmount || 500).toFixed(2)}
              </span>
            </div>

            {/* RECEIPT BOX DISPLAY */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">রিসিট নম্বর</span>
                  <p className="font-mono text-sm font-black text-amber-300">
                    DMB-REC-{app.paymentTxnId || app.id.slice(-6)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">পেমেন্ট মেথড</span>
                  <p className="font-mono text-xs font-bold text-sky-400">
                    {app.paymentMethod || 'bKash/Nagad Online'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">ট্রানজেকশন আইডি (TrxID):</span>
                  <p className="font-mono font-extrabold text-slate-200 mt-0.5">{app.paymentTxnId || 'TRX-DEFAULT-2026'}</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">পেমেন্ট তারিখ:</span>
                  <p className="font-mono text-slate-300 mt-0.5">
                    {app.paymentDate ? new Date(app.paymentDate).toLocaleDateString('bn-BD') : app.appliedDate}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">জমাগ্রহীতা প্রতিষ্ঠান:</span>
                  <p className="font-bold text-white mt-0.5">ডিজিটাল মিডিয়া ব্রিজ (DMB)</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">পেমেন্ট স্ট্যাটাস:</span>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ⏳ PENDING VERIFICATION
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">নিয়োগ ফি রশিদ প্রিন্ট কপি</span>
                <button
                  onClick={handlePrintReceipt}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> প্রিন্ট / ডাউনলোড
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-bold text-slate-300">• রিসিট সংক্রান্ত তথ্য:</p>
              <p>আপনার প্রদত্ত ট্রানজেকশন আইডি অ্যাডমিন প্যানেল হতে বিকাশ/নগদ স্টেটমেন্টের সাথে মিলানো হচ্ছে। যাচাই শেষ হলে চূড়ান্ত অনুমোদনের এসএমএস পাবেন।</p>
            </div>
          </div>

          {/* COLUMN 2: SUBMITTED APPLICATION DETAILS */}
          <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-sky-400" />
                <h3 className="font-black text-white text-base">জমাকৃত আবেদনপত্রের সারসংক্ষেপ</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">APPLICATION FORM</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">শিক্ষাগত যোগ্যতা</span>
                <p className="font-bold text-white mt-0.5">{app.educationalQualification || 'HSC Passed'}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">অভিজ্ঞতা</span>
                <p className="font-bold text-white mt-0.5">{app.experienceYears || '0-1 Year'}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">NID / BIRTH CERTIFICATE</span>
                <p className="font-mono font-bold text-amber-300 mt-0.5">{app.nidNo || 'N/A'}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">বরাদ্দকৃত কর্ম এলাকা</span>
                <p className="font-bold text-sky-300 mt-0.5">{app.assignedArea || `${app.upazila} এলাকা`}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 sm:col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">স্থায়ী ঠিকানা</span>
                <p className="font-bold text-slate-200 mt-0.5">{app.address || `${app.upazila}, ${app.district}`}</p>
              </div>
            </div>

            {/* ATTACHMENTS CHECKLIST */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" /> জমাকৃত ডকুমেন্টস ও ফাইল চেকলিস্ট
              </h4>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold block">✓ NID কপি</span>
                  <span className="text-[9px] text-slate-500">সংযুক্ত রয়েছে</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold block">✓ সনদ কপি</span>
                  <span className="text-[9px] text-slate-500">সংযুক্ত রয়েছে</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold block">✓ সিভি (CV)</span>
                  <span className="text-[9px] text-slate-500">সংযুক্ত রয়েছে</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SUPPORT & HELPLINE FOOTER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">গোপালগঞ্জ সেন্ট্রাল অফিস ও হেল্পলাইন</h4>
              <p className="text-xs text-slate-400">যেকোনো তথ্যের জন্য আমাদের হেল্পলাইনে কল করুন: <span className="font-mono text-sky-300 font-bold">01700000000</span></p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> info@health.nit.bd</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> গোপালগঞ্জ Sadar</span>
          </div>
        </div>

      </main>

      {/* MONEY RECEIPT MODAL */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-amber-400" />
                <h3 className="font-black text-white text-lg">অফিশিয়াল পেমেন্ট রিসিট</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>রিসিট নম্বর:</span>
                <span className="font-mono text-white font-bold">DMB-REC-{app.paymentTxnId || app.id.slice(-6)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>আবেদনকারীর নাম:</span>
                <span className="text-white font-bold">{app.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>আবেদন আইডি:</span>
                <span className="font-mono text-sky-400 font-bold">{app.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>পেমেন্ট মেথড & TrxID:</span>
                <span className="font-mono text-amber-300 font-bold">{app.paymentMethod} ({app.paymentTxnId || 'N/A'})</span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-3">
                <span className="font-bold text-slate-200">মোট পরিশোধিত ফি:</span>
                <span className="font-mono text-lg font-black text-emerald-400">৳ {(app.paymentAmount || 500).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  handlePrintReceipt();
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Printer className="w-4 h-4" /> রিসিট প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
