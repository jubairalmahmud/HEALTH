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
  AlertTriangle,
  Clock,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Phone,
  Eye,
  Lock,
  HeartPulse,
  Target,
  Printer,
  FileText,
  XCircle,
  User,
  Download,
  Key,
  Camera,
  Plus,
  Trash2,
  QrCode,
  FileCheck,
  DollarSign,
  Upload,
  X,
  RefreshCw,
  SwitchCamera,
  Edit3,
  Save,
  Check,
  Image as ImageIcon,
  Users,
  ChevronRight,
  Filter,
  Sparkles,
  Tag,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Calendar,
  Award,
  History,
  BarChart2
} from 'lucide-react';

interface Props {
  user: UserType;
  onLogout: () => void;
}

export const RepresentativeDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'cards' | 'activation' | 'register' | 'survey' | 'verify' | 'search' | 'notifications'
  >('overview');

  const [cards, setCards] = useState<MedicalCard[]>([]);
  const [surveys, setSurveys] = useState<HealthSurvey[]>([]);
  const [notices, setNotices] = useState<CmsNotice[]>([]);
  const [selectedCard, setSelectedCard] = useState<MedicalCard | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Dedicated Member & Beneficiary Search Auto-Complete States
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [selectedSearchCard, setSelectedSearchCard] = useState<MedicalCard | null>(null);
  const [searchTierFilter, setSearchTierFilter] = useState<'ALL' | 'Silver' | 'Gold' | 'Platinum'>('ALL');
  const [searchStatusFilter, setSearchStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'EXPIRED'>('ALL');
  const [searchTargetType, setSearchTargetType] = useState<'ALL' | 'MEMBER' | 'BENEFICIARY'>('ALL');
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState<number>(-1);
  const [showSearchCardModal, setShowSearchCardModal] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const searchDropdownRef = React.useRef<HTMLDivElement | null>(null);

  // Cards Tab Auto-Complete State
  const [isCardsDropdownOpen, setIsCardsDropdownOpen] = useState(false);
  const cardsDropdownRef = React.useRef<HTMLDivElement | null>(null);

  // Verify Tab Auto-Complete State
  const [isVerifyDropdownOpen, setIsVerifyDropdownOpen] = useState(false);
  const verifyDropdownRef = React.useRef<HTMLDivElement | null>(null);

  // Password Change Form State
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Card Verification State
  const [verifyCardId, setVerifyCardId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedCard, setVerifiedCard] = useState<MedicalCard | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // New Registration Form
  const [regForm, setRegForm] = useState({
    memberName: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    customCardId: '', // Pre-printed Card Number
    cardTier: 'Silver' as 'Silver' | 'Gold' | 'Platinum',
    fatherName: '',
    motherName: '',
    bloodGroup: 'A+',
    mobile: '',
    address: 'গোপালগঞ্জ সদর',
    upazila: 'Gopalganj Sadar',
    district: 'Gopalganj',
    nidOrBirthCert: ''
  });

  // Dynamic Family Members State (Default 4 for Silver)
  const [familyMembers, setFamilyMembers] = useState<string[]>(['', '', '', '']);

  // Payment Option State (Cash vs Mobile Banking)
  const [paymentOption, setPaymentOption] = useState<'CASH' | 'MOBILE_BANKING'>('CASH');
  const [paymentMethodName, setPaymentMethodName] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [paymentSenderNo, setPaymentSenderNo] = useState('');
  const [paymentTrxId, setPaymentTrxId] = useState('');

  const [regMsg, setRegMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Camera & Photo Upload States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setRegForm(prev => ({ ...prev, photoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 640 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('ক্যামেরা চালু করা সম্ভব হয়নি। অনুগ্রহ করে ব্রাউজারে ক্যামেরার পারমিশন দিন অথবা সরাসরি ছবি আপলোড করুন।');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setRegForm(prev => ({ ...prev, photoUrl: dataUrl }));
        stopCamera();
      }
    }
  };

  const toggleCameraFacing = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // New Survey Form
  const [surveyForm, setSurveyForm] = useState({
    familyHeadName: '',
    mobile: '',
    district: 'Gopalganj',
    upazila: 'Gopalganj Sadar',
    address: '',
    familyMembersCount: 4,
    chronicDiseases: 'Diabetes, Hypertension',
    incomeGroup: 'Middle Class'
  });
  const [surveyMsg, setSurveyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [repProfile, setRepProfile] = useState<RepresentativeApplication | null>(null);
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>('ALL');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    id: '',
    name: '',
    mobile: '',
    email: '',
    nidNo: '',
    fatherName: '',
    motherName: '',
    dob: '1995-01-01',
    gender: 'Male',
    educationalQualification: '',
    experienceYears: '',
    address: 'গোপালগঞ্জ সদর, গোপালগঞ্জ',
    district: 'গোপালগঞ্জ',
    upazila: 'গোপালগঞ্জ সদর',
    assignedArea: '',
    photoUrl: '',
    circularTitle: 'ফিল্ড রিপ্রেজেন্টেটিভ'
  });
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync profile form when repProfile or user changes
  useEffect(() => {
    if (repProfile) {
      setProfileForm({
        id: repProfile.id || user.id || 'REP-2026-001',
        name: repProfile.name || user.name || '',
        mobile: repProfile.mobile || user.mobile || '',
        email: repProfile.email || user.email || '',
        nidNo: repProfile.nidNo || '',
        fatherName: repProfile.fatherName || '',
        motherName: repProfile.motherName || '',
        dob: repProfile.dob || '1995-01-01',
        gender: repProfile.gender || 'Male',
        educationalQualification: repProfile.educationalQualification || '',
        experienceYears: repProfile.experienceYears || '',
        address: repProfile.address || 'গোপালগঞ্জ সদর, গোপালগঞ্জ',
        district: repProfile.district || 'গোপালগঞ্জ',
        upazila: repProfile.upazila || 'গোপালগঞ্জ সদর',
        assignedArea: repProfile.assignedArea || `${repProfile.upazila || 'গোপালগঞ্জ সদর'}, ${repProfile.district || 'গোপালগঞ্জ'}`,
        photoUrl: repProfile.photoUrl || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        circularTitle: repProfile.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ'
      });
    } else if (user) {
      setProfileForm(prev => ({
        ...prev,
        id: user.id || 'REP-2026-001',
        name: user.name || 'মাঠ প্রতিনিধি',
        mobile: user.mobile || '',
        email: user.email || '',
        photoUrl: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      }));
    }
  }, [repProfile, user]);

  const handleRepPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfileForm(prev => ({ ...prev, photoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.id.trim()) {
      setProfileMsg({ type: 'error', text: 'প্রতিনিধি আইডি খালি রাখা যাবে না।' });
      return;
    }
    if (!profileForm.name.trim()) {
      setProfileMsg({ type: 'error', text: 'প্রতিনিধির নাম খালি রাখা যাবে না।' });
      return;
    }
    if (!profileForm.mobile.trim()) {
      setProfileMsg({ type: 'error', text: 'মোবাইল নম্বর খালি রাখা যাবে না।' });
      return;
    }

    setProfileUpdateLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/representatives/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentId: repProfile?.id || user.id,
          currentMobile: repProfile?.mobile || user.mobile,
          newId: profileForm.id.trim(),
          ...profileForm
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileMsg({ 
          type: 'success', 
          text: data.message || 'আপনার প্রোফাইল আপডেটের তথ্য সাবমিট হয়েছে। অ্যাডমিন অনুমোদন করার পর চূড়ান্তভাবে আপডেট হবে।' 
        });
        if (data.application) {
          setRepProfile(data.application);
        }
        setIsEditingProfile(false);
        fetchRepData();
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: 'সার্ভার সমস্যা। আবার চেষ্টা করুন।' });
    } finally {
      setProfileUpdateLoading(false);
    }
  };

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

  // Print/Download Payment Money Receipt
  const handlePrintReceipt = () => {
    if (!repProfile) {
      alert('আপনার প্রতিনিধি আবেদন প্রোফাইল পাওয়া যায়নি।');
      return;
    }
    const win = window.open('', '_blank', 'width=850,height=950');
    if (!win) {
      alert('পপআপ ব্লক করা আছে। ব্রাউজার পারমিশন দিন।');
      return;
    }

    const receiptNo = repProfile.paymentTxnId || repProfile.id;
    const paymentDate = repProfile.paymentDate ? new Date(repProfile.paymentDate).toLocaleDateString('bn-BD') : new Date().toLocaleDateString('bn-BD');

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DMB_Payment_Receipt_${receiptNo}</title>
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
            .stamp-box { border: 3px double #16a34a; color: #15803d; font-weight: 900; padding: 8px 24px; border-radius: 10px; font-size: 15px; display: inline-block; transform: rotate(-2deg); margin-top: 20px; background: #f0fdf4; }
            .footer { margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
            @media print { body { margin: 0; } .receipt-card { border: none; box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <h1 class="logo-title">DIGITAL MEDI BRIDGE (DMB)</h1>
              <p class="subtitle">Healthcare Network & Field Recruitment Cell | Helpline: 09658887470</p>
              <div class="badge-title">OFFICIAL PAYMENT MONEY RECEIPT</div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px;">
              <div><strong>রিসিট নম্বর:</strong> REC-${receiptNo}</div>
              <div><strong>তারিখ:</strong> ${paymentDate}</div>
            </div>

            <table class="grid-table">
              <tbody>
                <tr>
                  <th>আবেদনকারীর নাম (Payer):</th>
                  <td><strong>${repProfile.name}</strong></td>
                </tr>
                <tr>
                  <th>মোবাইল নম্বর:</th>
                  <td>${repProfile.mobile}</td>
                </tr>
                <tr>
                  <th>আবেদনের পদবী:</th>
                  <td>${repProfile.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ'}</td>
                </tr>
                <tr>
                  <th>এনআইডি নম্বর:</th>
                  <td>${repProfile.nidNo}</td>
                </tr>
                <tr>
                  <th>পেমেন্ট মেথড (Gateway):</th>
                  <td><strong>${repProfile.paymentMethod || 'bKash/Nagad'}</strong> (${repProfile.paymentAccountNo || 'Online'})</td>
                </tr>
                <tr>
                  <th>ট্রানজেকশন ID (TrxID):</th>
                  <td><strong style="font-family: monospace; color: #0369a1;">${repProfile.paymentTxnId || 'N/A'}</strong></td>
                </tr>
                <tr>
                  <th>পরিশোধিত ফি এর পরিমাণ:</th>
                  <td><strong style="font-size: 16px; color: #16a34a;">৳ ${repProfile.paymentAmount || 500}.00 BDT</strong></td>
                </tr>
              </tbody>
            </table>

            <div style="text-align: center; margin-top: 20px;">
              ${repProfile.paymentStatus === 'PAID' ? `
                <div class="stamp-box" style="background: #ecfdf5; border-color: #10b981; color: #047857;">
                  ✓ OFFICIAL PAYMENT VERIFIED & APPROVED BY ADMIN
                </div>
              ` : `
                <div>
                  <div class="stamp-box" style="background: #fffbeb; border-color: #f59e0b; color: #b45309;">
                    ⏳ PENDING ADMIN VERIFICATION (ভেরিফিকেশন সাপেক্ষ রিসিট)
                  </div>
                  <p style="font-size: 11px; color: #78350f; margin-top: 6px; text-align: center;">
                    * বিশেষ দ্রষ্টব্য: প্রার্থী কর্তৃক জমাকৃত ট্রানজেকশন তথ্য (TrxID: ${repProfile.paymentTxnId || 'N/A'}) এডমিন প্যানেল হতে যাচাই ও অনুমোদন করার পরই এটি অফিসিয়াল চূড়ান্ত পেইড রিসিটে রূপান্তরিত হবে। ভূয়া TrxID প্রদান করা হলে আবেদন বাতিল করা হবে।
                  </p>
                </div>
              `}
            </div>

            <div class="footer">
              <div>ডিজিটাল মিডি ব্রিজ (DMB) ডিজিটাল কপি</div>
              <div>প্রিন্টের তারিখ: ${new Date().toLocaleString('bn-BD')}</div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Download / View Appointment Letter (নিয়োগপত্র)
  const handleDownloadAppointmentLetter = () => {
    const name = repProfile?.name || user.name;
    const designation = repProfile?.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ (Field Representative)';
    const joiningDate = repProfile?.appliedDate ? new Date(repProfile.appliedDate).toLocaleDateString('bn-BD') : new Date().toLocaleDateString('bn-BD');
    const area = repProfile?.assignedArea || `${repProfile?.upazila || 'গোপালগঞ্জ সদর'}, ${repProfile?.district || 'গোপালগঞ্জ'}`;
    const idNo = repProfile?.id || `REP-${Date.now().toString().slice(-4)}`;

    const win = window.open('', '_blank', 'width=850,height=1000');
    if (!win) return alert('পপআপ ব্লক করা আছে। ব্রাউজার পারমিশন দিন।');

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Appointment_Letter_${idNo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800&display=swap');
            body { font-family: 'Hind Siliguri', Arial, sans-serif; margin: 30px; color: #0f172a; line-height: 1.6; }
            .letter-card { border: 2px solid #0284c7; padding: 40px; border-radius: 16px; max-width: 750px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
            .logo-title { font-size: 24px; font-weight: 900; color: #0369a1; text-transform: uppercase; margin: 0; }
            .subtitle { font-size: 13px; color: #475569; }
            .badge { background: #0284c7; color: white; padding: 6px 18px; border-radius: 20px; font-weight: 800; font-size: 13px; display: inline-block; margin-top: 10px; }
            .subject { font-size: 15px; font-weight: 800; color: #0f172a; margin: 20px 0 15px 0; background: #f0f9ff; padding: 10px; border-left: 4px solid #0284c7; }
            .content p { font-size: 13px; margin-bottom: 12px; text-align: justify; }
            .terms-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; font-size: 12px; margin: 20px 0; }
            .seal-box { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .seal { border: 2px solid #16a34a; color: #15803d; font-weight: 900; padding: 8px 16px; border-radius: 8px; transform: rotate(-3deg); background: #f0fdf4; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="letter-card">
            <div class="header">
              <h1 class="logo-title">DIGITAL MEDI BRIDGE (DMB)</h1>
              <p class="subtitle">Healthcare Network & Field Operations Division | Reg: DMB-2026-BD</p>
              <div class="badge">অফিসিয়াল নিয়োগপত্র (OFFICIAL APPOINTMENT LETTER)</div>
            </div>

            <div style="display: justify; justify-content: space-between; font-size: 12px; margin-bottom: 15px;">
              <div><strong>রেফারেন্স নম্বর:</strong> DMB/HR/REP/${idNo}</div>
              <div><strong>তারিখ:</strong> ${joiningDate}</div>
            </div>

            <p style="font-size: 13px; font-weight: 700; margin-bottom: 10px;">
              প্রাপক,<br/>
              ${name}<br/>
              পিতার নাম: ${repProfile?.fatherName || 'অভিভাবক'}<br/>
              ফোন: ${repProfile?.mobile || user.mobile}<br/>
              বরাদ্দকৃত এলাকা: ${area}
            </p>

            <div class="subject">
              বিষয়: ডিজিটাল মিডি ব্রিজে "${designation}" পদে চূড়ান্ত নিয়োগপ্রদান সংক্রান্ত।
            </div>

            <div class="content">
              <p>জনাব/জনাবে,</p>
              <p>
                আপনার আবেদনপত্র ও মৌখিক সাক্ষাৎকারের মূল্যায়নের ভিত্তিতে ডিজিটাল মিডি ব্রিজ (DMB) কতৃপক্ষ আনন্দের সাথে জানাচ্ছে যে, আপনাকে আমাদের ফিল্ড অপারেশন্স শাখায় <strong>"${designation}"</strong> পদে চুক্তিভিত্তিক/স্থায়ী নিয়োগ প্রদান করা হলো।
              </p>

              <div class="terms-box">
                <strong>চাকরির শর্তাবলী ও দায়িত্বসমূহ:</strong>
                <ol style="margin: 8px 0 0 18px; padding: 0;">
                  <li>বরাদ্দকৃত এলাকা <strong>(${area})</strong> তে পরিবার সমূহের নিকট মেডিক্যাল মেম্বারশিপ কার্ড পৌঁছে দেওয়া।</li>
                  <li>দৈনিক/মাসিক টার্গেট অনুযায়ী ফিল্ডে স্বাস্থ্য সার্ভে পরিচালনা করা।</li>
                  <li>কর্তৃপক্ষ কর্তৃক নির্ধারিত কমিশন ও মাসিক ভাতা যথাসময়ে প্রদান করা হবে।</li>
                  <li>ডিজিটাল মিডি ব্রিজের সকল নিয়ম-কানুন ও শৃঙ্খলা বজায় রাখা বাধ্যতামূলক।</li>
                </ol>
              </div>

              <p>আমরা আশা করি আপনার মেধা ও পরিশ্রম দ্বারা আপনি ডিজিটাল মিডি ব্রিজের স্বাস্থ্যসেবা নেটওয়ার্ক সম্প্রসারণে বিশেষ ভূমিকা রাখবেন।</p>
            </div>

            <div class="seal-box">
              <div>
                <p style="font-size: 12px; margin-bottom: 5px;">ধন্যবাদান্তে,</p>
                <p style="font-size: 14px; font-weight: 800; color: #0369a1;">মানবসম্পদ বিভাগ (HR Division)</p>
                <p style="font-size: 11px; color: #64748b;">ডিজিটাল মিডি ব্রিজ হেলথকেয়ার নেটওয়ার্ক</p>
              </div>
              <div class="seal">
                ✓ DMB HR APPROVED & ISSUED
              </div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Download / View Salary Sheet (স্যালারিশিট)
  const handleDownloadSalarySheet = () => {
    const name = repProfile?.name || user.name;
    const designation = repProfile?.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ';
    const monthYear = new Date().toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
    const idNo = repProfile?.id || `REP-${Date.now().toString().slice(-4)}`;

    const win = window.open('', '_blank', 'width=850,height=950');
    if (!win) return alert('পপআপ ব্লক করা আছে। ব্রাউজার পারমিশন দিন।');

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary_Sheet_${idNo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800&display=swap');
            body { font-family: 'Hind Siliguri', Arial, sans-serif; margin: 30px; color: #0f172a; }
            .voucher-card { border: 2px solid #16a34a; padding: 35px; border-radius: 16px; max-width: 750px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: 900; color: #15803d; }
            .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .table th, .table td { border: 1px solid #cbd5e1; padding: 10px; font-size: 13px; text-align: left; }
            .table th { background: #f0fdf4; color: #166534; font-weight: 800; }
            .stamp { border: 2px solid #16a34a; color: #15803d; font-weight: 900; padding: 6px 16px; border-radius: 8px; font-size: 12px; display: inline-block; background: #ecfdf5; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="voucher-card">
            <div class="header">
              <div class="title">DIGITAL MEDI BRIDGE (DMB)</div>
              <p style="font-size: 12px; color: #475569; margin: 2px 0;">অফিসিয়াল বেতন ও ভাতা বিবরণী (MONTHLY SALARY VOUCHER)</p>
              <p style="font-size: 12px; font-weight: 800; color: #16a34a; margin-top: 5px;">মাস: ${monthYear}</p>
            </div>

            <div style="font-size: 13px; margin-bottom: 15px; display: flex; justify-content: space-between;">
              <div><strong>প্রতিনিধির নাম:</strong> ${name} (${idNo})</div>
              <div><strong>পদবী:</strong> ${designation}</div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>বিবরণ (Particulars)</th>
                  <th style="text-align: right;">পরিমাণ (BDT)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>মূল বেতন / টিএ-ডিএ ভাতা (Basic / TA-DA Allowance)</td>
                  <td style="text-align: right; font-weight: bold;">৳ ৮,০০০.০০</td>
                </tr>
                <tr>
                  <td>কার্ড এনরোলমেন্ট পারফর্মেন্স কমিশন (Card Enrollment Incentive)</td>
                  <td style="text-align: right; font-weight: bold;">৳ ৩,৫০০.০০</td>
                </tr>
                <tr>
                  <td>ফিল্ড হেলথ সার্ভে বোনাস (Survey Bonus)</td>
                  <td style="text-align: right; font-weight: bold;">৳ ১,২০০.০০</td>
                </tr>
                <tr style="background: #f8fafc; font-weight: 800; font-size: 14px;">
                  <td>সর্বমোট দেয় টাকা (Net Payable Amount)</td>
                  <td style="text-align: right; color: #15803d;">৳ ১২,৭০০.০০ BDT</td>
                </tr>
              </tbody>
            </table>

            <div style="text-align: center;">
              <div class="stamp">✓ PAID & CREDITED VIA MOBILE BANKING / BANK TRANSFER</div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Download / View Official ID Card Badge
  const handleDownloadIdCard = () => {
    const name = repProfile?.name || user.name;
    const designation = repProfile?.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ';
    const idNo = repProfile?.id || `REP-${Date.now().toString().slice(-4)}`;
    const photo = repProfile?.photoUrl || user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";

    const win = window.open('', '_blank', 'width=600,height=750');
    if (!win) return alert('পপআপ ব্লক করা আছে। ব্রাউজার পারমিশন দিন।');

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ID_Card_${idNo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700;800&display=swap');
            body { font-family: 'Hind Siliguri', Arial, sans-serif; background: #f1f5f9; display: flex; justify-content: center; align-items: center; padding: 20px; }
            .id-card { width: 320px; height: 500px; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; border: 3px solid #f59e0b; color: white; padding: 25px; box-sizing: border-box; text-align: center; position: relative; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
            .avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #f59e0b; margin: 15px auto 10px auto; object-fit: cover; }
            .name { font-size: 18px; font-weight: 800; color: #ffffff; margin: 5px 0 2px 0; }
            .role { font-size: 12px; color: #f59e0b; font-weight: 700; text-transform: uppercase; }
            .info-box { background: rgba(255,255,255,0.1); border-radius: 12px; padding: 10px; margin-top: 15px; font-size: 11px; text-align: left; }
            .info-row { margin-bottom: 6px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="id-card">
            <h2 style="font-size: 16px; margin: 0; color: #38bdf8; font-weight: 900;">DIGITAL MEDI BRIDGE</h2>
            <p style="font-size: 9px; color: #cbd5e1; margin-top: 2px;">OFFICIAL FIELD IDENTITY CARD</p>
            <img src="${photo}" class="avatar" alt="Avatar" />
            <div class="name">${name}</div>
            <div class="role">${designation}</div>

            <div class="info-box">
              <div class="info-row"><span>আইডি নম্বর:</span> <strong style="color: #f59e0b;">${idNo}</strong></div>
              <div class="info-row"><span>মোবাইল:</span> <strong>${repProfile?.mobile || user.mobile}</strong></div>
              <div class="info-row"><span>এলাকা:</span> <strong>${repProfile?.assignedArea || 'গোপালগঞ্জ'}</strong></div>
              <div class="info-row"><span>ইস্যু তারিখ:</span> <strong>০১-০১-২০২৬</strong></div>
            </div>

            <p style="font-size: 9px; color: #94a3b8; margin-top: 20px;">
              জরুরী প্রয়োজনে: 09658887470 | www.dmbhealth.bd
            </p>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Handle Password Change Submission
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      return setPwdMsg({ type: 'error', text: 'বর্তমান এবং নতুন পাসওয়ার্ড ইনপুট দিন।' });
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return setPwdMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!' });
    }
    if (pwdForm.newPassword.length < 4) {
      return setPwdMsg({ type: 'error', text: 'পাসওয়ার্ড সর্বনিম্ন ৪ অক্ষরের হতে হবে।' });
    }

    setPwdLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: user.mobile,
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPwdMsg({ type: 'success', text: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
        setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwdMsg({ type: 'error', text: data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' });
      }
    } catch (err) {
      setPwdMsg({ type: 'error', text: 'সার্ভার কানেকশন ত্রুটি!' });
    } finally {
      setPwdLoading(false);
    }
  };

  // Card Verification Query Handler
  const handleVerifyCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCardId.trim()) return;

    setVerifying(true);
    setVerifyError(null);
    setVerifiedCard(null);

    try {
      const query = verifyCardId.trim();
      const res = await fetch(`/api/cards/verify/${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.card) {
          setVerifiedCard(data.card);
        } else {
          setVerifyError('প্রদত্ত কার্ড আইডিটির কোনো তথ্য ডাটাবেজে পাওয়া যায়নি।');
        }
      } else {
        // Local fallback search in cards array
        const found = cards.find(
          c => c.cardId.toLowerCase() === query.toLowerCase() || c.mobile === query
        );
        if (found) {
          setVerifiedCard(found);
        } else {
          setVerifyError('প্রদত্ত কার্ড আইডি অথবা মোবাইল নম্বরের মেম্বারশিপ ডাটা পাওয়া যায়নি।');
        }
      }
    } catch (e) {
      const found = cards.find(
        c => c.cardId.toLowerCase() === verifyCardId.trim().toLowerCase() || c.mobile === verifyCardId.trim()
      );
      if (found) {
        setVerifiedCard(found);
      } else {
        setVerifyError('কার্ড ভেরিফিকেশনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setVerifying(false);
    }
  };

  // Family Member Count Change & Helper Functions
  const handleMemberCountChange = (count: number) => {
    const current = [...familyMembers];
    if (count > current.length) {
      const diff = count - current.length;
      for (let i = 0; i < diff; i++) current.push('');
    } else if (count < current.length) {
      current.length = count;
    }
    setFamilyMembers(current);
  };

  const handleAddMemberField = () => {
    setFamilyMembers([...familyMembers, '']);
  };

  const handleRemoveMemberField = () => {
    if (familyMembers.length <= 1) return;
    setFamilyMembers(familyMembers.slice(0, -1));
  };

  const handleMemberNameChange = (index: number, val: string) => {
    const updated = [...familyMembers];
    updated[index] = val;
    setFamilyMembers(updated);
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

    const activeMembers = familyMembers.map(m => m.trim()).filter(m => m.length > 0);
    const feeAmount = regForm.cardTier === 'Silver' ? 200 : regForm.cardTier === 'Gold' ? 350 : 500;
    const finalPaymentMethod = paymentOption === 'CASH' ? 'CASH' : paymentMethodName;

    try {
      const res = await fetch('/api/members/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regForm,
          beneficiaries: activeMembers,
          feeAmount,
          paymentMethod: finalPaymentMethod,
          paymentSenderNo: paymentOption === 'MOBILE_BANKING' ? paymentSenderNo : 'CASH_HANDOVER',
          trxId: paymentOption === 'MOBILE_BANKING' ? paymentTrxId : `CASH-${Date.now().toString().slice(-6)}`,
          paymentStatus: 'PAID', // Instant representative registration
          instantApprove: true,
          registeredByRepId: repProfile?.id || user.id || '',
          registeredByName: repProfile?.name || user.name || '',
          registeredByMobile: repProfile?.mobile || user.mobile || ''
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCards([data.card, ...cards]);
        setRegMsg({ type: 'success', text: `নতুন পরিবার ও সদস্য কার্ড সফলভাবে নিবন্ধিত হয়েছে! কার্ড আইডি: ${data.card.cardId}` });
        setRegForm({
          memberName: '',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          customCardId: '',
          cardTier: 'Silver',
          fatherName: '',
          motherName: '',
          bloodGroup: 'A+',
          mobile: '',
          address: 'গোপালগঞ্জ সদর',
          upazila: 'Gopalganj Sadar',
          district: 'Gopalganj',
          nidOrBirthCert: ''
        });
        setFamilyMembers(['', '', '', '']);
        setPaymentOption('CASH');
        setPaymentSenderNo('');
        setPaymentTrxId('');
      } else {
        const errData = await res.json();
        setRegMsg({ type: 'error', text: errData.error || 'নিবন্ধন জমা দেওয়া সম্ভব হয়নি।' });
      }
    } catch (e) {
      setRegMsg({ type: 'error', text: 'সার্ভার রেসপন্স সমস্যা। নিবন্ধন তৈরি ব্যর্থ হয়েছে।' });
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

  // Click outside listener to close search dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
      if (
        cardsDropdownRef.current &&
        !cardsDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCardsDropdownOpen(false);
      }
      if (
        verifyDropdownRef.current &&
        !verifyDropdownRef.current.contains(e.target as Node)
      ) {
        setIsVerifyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter cards to only those assigned/registered by this representative
  const myCards = React.useMemo(() => {
    const repId = repProfile?.id || user.id || '';
    const repMobile = repProfile?.mobile || user.mobile || '';
    const repName = repProfile?.name || user.name || '';

    return cards.filter(c => {
      // 1. Direct Rep ID match
      if (c.registeredByRepId && repId && c.registeredByRepId.toLowerCase() === repId.toLowerCase()) return true;
      // 2. Direct Rep Mobile match
      if (c.registeredByMobile && repMobile && c.registeredByMobile.trim() === repMobile.trim()) return true;
      // 3. Fallback matching if registeredByName matches
      if (c.registeredByName && repName && c.registeredByName.trim().toLowerCase() === repName.trim().toLowerCase()) return true;
      
      return false;
    });
  }, [cards, repProfile, user]);

  const activeCards = myCards.filter(c => c.status === 'ACTIVE');
  const pendingCards = myCards.filter(c => c.status === 'PENDING');

  // Autocomplete Suggestions for Member & Beneficiary Search Tab (Restricted to Representative's own cards)
  const memberSearchSuggestions = React.useMemo(() => {
    const q = memberSearchQuery.trim().toLowerCase();
    const results: Array<{
      type: 'MEMBER' | 'BENEFICIARY';
      card: MedicalCard;
      matchedText: string;
      beneficiaryName?: string;
      matchReason: string;
      badgeColor: string;
    }> = [];

    // If query is empty, show top 6 recent active cards from representative's cards as quick picks
    if (!q) {
      myCards.slice(0, 6).forEach(c => {
        results.push({
          type: 'MEMBER',
          card: c,
          matchedText: c.memberName,
          matchReason: `কার্ড আইডি: ${c.cardId} • ${c.upazila || c.district}`,
          badgeColor: 'bg-slate-100 text-slate-700'
        });
      });
      return results;
    }

    myCards.forEach(c => {
      const memberNameMatch = c.memberName.toLowerCase().includes(q);
      const cardIdMatch = c.cardId.toLowerCase().includes(q);
      const mobileMatch = c.mobile.includes(q);
      const nidMatch = (c.nidOrBirthCert || '').toLowerCase().includes(q);
      const locationMatch = (c.upazila || '').toLowerCase().includes(q) || (c.district || '').toLowerCase().includes(q) || (c.address || '').toLowerCase().includes(q);

      // Primary Member Match
      if (memberNameMatch || cardIdMatch || mobileMatch || nidMatch || locationMatch) {
        if (searchTargetType === 'ALL' || searchTargetType === 'MEMBER') {
          let reason = `কার্ড আইডি: ${c.cardId}`;
          if (cardIdMatch) reason = `কার্ড আইডি ম্যাচ: ${c.cardId}`;
          else if (mobileMatch) reason = `মোবাইল নম্বর: ${c.mobile}`;
          else if (nidMatch) reason = `এনআইডি: ${c.nidOrBirthCert}`;
          else if (locationMatch) reason = `ঠিকানা: ${c.upazila}, ${c.district}`;

          results.push({
            type: 'MEMBER',
            card: c,
            matchedText: c.memberName,
            matchReason: reason,
            badgeColor: 'bg-sky-50 text-sky-800 border-sky-200'
          });
        }
      }

      // Family Beneficiaries Matches
      if (c.beneficiaries && Array.isArray(c.beneficiaries)) {
        c.beneficiaries.forEach(b => {
          if (b && typeof b === 'string' && b.toLowerCase().includes(q)) {
            if (searchTargetType === 'ALL' || searchTargetType === 'BENEFICIARY') {
              results.push({
                type: 'BENEFICIARY',
                card: c,
                matchedText: b,
                beneficiaryName: b,
                matchReason: `পরিবার প্রধান: ${c.memberName} (${c.cardId})`,
                badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
              });
            }
          }
        });
      }
    });

    return results;
  }, [myCards, memberSearchQuery, searchTargetType]);

  // Autocomplete Suggestions for Cards Tab Table (Restricted to Representative's own cards)
  const cardsTabSuggestions = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    const res: MedicalCard[] = [];
    myCards.forEach(c => {
      if (
        c.memberName.toLowerCase().includes(q) ||
        c.cardId.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.beneficiaries?.some(b => typeof b === 'string' && b.toLowerCase().includes(q))
      ) {
        res.push(c);
      }
    });
    return res.slice(0, 6);
  }, [myCards, searchTerm]);

  // Filtered Cards for Search Tab (Restricted to Representative's own cards)
  const searchFilteredCards = React.useMemo(() => {
    const q = memberSearchQuery.trim().toLowerCase();
    return myCards.filter(c => {
      // Tier Filter
      if (searchTierFilter !== 'ALL' && c.cardTier !== searchTierFilter) return false;

      // Status Filter
      if (searchStatusFilter !== 'ALL') {
        const exp = c.expiryDate || c.validUntil;
        const isExpired = c.status === 'EXPIRED' || (exp && !exp.toLowerCase().includes('lifetime') && !exp.includes('আজীবন') && !isNaN(new Date(exp).getTime()) && new Date(exp).getTime() < new Date().setHours(0,0,0,0));
        if (searchStatusFilter === 'EXPIRED' && !isExpired) return false;
        if (searchStatusFilter === 'ACTIVE' && (c.status !== 'ACTIVE' || isExpired)) return false;
        if (searchStatusFilter === 'PENDING' && c.status !== 'PENDING') return false;
      }

      if (!q) return true;

      const memberMatch =
        c.memberName.toLowerCase().includes(q) ||
        c.cardId.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        (c.nidOrBirthCert || '').toLowerCase().includes(q) ||
        (c.upazila || '').toLowerCase().includes(q) ||
        (c.district || '').toLowerCase().includes(q);

      const beneficiaryMatch = c.beneficiaries?.some(b => typeof b === 'string' && b.toLowerCase().includes(q));

      if (searchTargetType === 'MEMBER') return memberMatch;
      if (searchTargetType === 'BENEFICIARY') return !!beneficiaryMatch;
      return memberMatch || !!beneficiaryMatch;
    });
  }, [myCards, memberSearchQuery, searchTierFilter, searchStatusFilter, searchTargetType]);

  const filteredCards = myCards.filter(c => {
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
              <p className="text-[10px] text-slate-400 mt-0.5">অ্যাসাইনকৃত কার্ড: {myCards.length} টি</p>
            </div>

            {[
              { id: 'overview', label: 'কর্মক্ষমতা ওভারভিউ', icon: TrendingUp },
              { id: 'profile', label: 'প্রোফাইল', icon: User },
              { id: 'cards', label: 'অ্যাসাইনকৃত কার্ডসমূহ', icon: CreditCard },
              { id: 'activation', label: 'কার্ড একটিভেশন', icon: CheckCircle2 },
              { id: 'register', label: 'নতুন পরিবার রেজিস্ট্রেশন', icon: UserPlus },
              { id: 'survey', label: 'স্বাস্থ্য জরিপ (Survey)', icon: ClipboardList },
              { id: 'verify', label: 'কার্ড ভেরিফিকেশন', icon: ShieldCheck },
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
                    <p className="text-xl font-extrabold text-slate-900">{myCards.length} টি</p>
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

              {/* Comprehensive Target Goal Progress & History Section */}
              {(() => {
                const currentMonthKey = repProfile?.targetMonth || '2026-08';
                const monthlyTarget = repProfile?.monthlyTarget || 50;
                const dailyTarget = repProfile?.dailyTarget || 2;
                const weeklyTarget = repProfile?.weeklyTarget || 12;
                const currentAchieved = activeCards.length;
                const progressPct = monthlyTarget > 0 ? Math.min(100, Math.round((currentAchieved / monthlyTarget) * 100)) : 0;
                const isTargetAchieved = currentAchieved >= monthlyTarget;
                const remainingToTarget = Math.max(0, monthlyTarget - currentAchieved);

                const historyList = (repProfile?.targetHistory && repProfile.targetHistory.length > 0)
                  ? [...repProfile.targetHistory].sort((a, b) => b.month.localeCompare(a.month))
                  : [
                      {
                        month: currentMonthKey,
                        monthlyTarget: monthlyTarget,
                        dailyTarget: dailyTarget,
                        weeklyTarget: weeklyTarget,
                        achieved: currentAchieved,
                        status: isTargetAchieved ? ('ACHIEVED' as const) : ('IN_PROGRESS' as const),
                        remarks: repProfile?.targetRemarks || 'চলতি মাসের লক্ষ্যমাত্রা ও প্রচারণা'
                      }
                    ];

                const filteredHistory = historyMonthFilter === 'ALL'
                  ? historyList
                  : historyList.filter(h => h.month === historyMonthFilter);

                const prevMonthItem = historyList.find(h => h.month !== currentMonthKey);

                return (
                  <div className="space-y-6">
                    {/* Main Target Dashboard Card */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                              <Target className="w-5 h-5" />
                            </span>
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                এডমিন নির্ধারিত কার্ড বিতরণ লক্ষ্যমাত্রা (Target Progress)
                              </h3>
                              <p className="text-xs text-slate-500 font-medium">
                                নির্দিষ্ট মাসভিত্তিক কার্ড ইস্যু ও রেজিস্ট্রেশনের অগ্রগতি পর্যবেক্ষণ
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3.5 py-1.5 rounded-2xl shadow-sm text-xs font-bold font-mono">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>মাস: {currentMonthKey}</span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                              isTargetAchieved
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {isTargetAchieved ? '✓ লক্ষ্যমাত্রা অর্জিত' : '⏳ চলমান অগ্রগতি'}
                          </span>
                        </div>
                      </div>

                      {/* Admin Guidance / Remarks Notice */}
                      {repProfile?.targetRemarks && (
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs flex items-start gap-2.5 text-amber-950">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-amber-900">এডমিন কর্তৃক বিশেষ দিকনির্দেশনা ও নোট:</strong>
                            <p className="mt-0.5 text-amber-800 leading-relaxed font-medium">{repProfile.targetRemarks}</p>
                          </div>
                        </div>
                      )}

                      {/* KPI Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                          <span className="text-[11px] font-bold text-slate-500 block">নির্ধারিত মাসিক টার্গেট</span>
                          <p className="text-xl font-black text-slate-900 font-mono mt-1">
                            {monthlyTarget} <span className="text-xs font-normal text-slate-500">টি কার্ড</span>
                          </p>
                        </div>
                        <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80">
                          <span className="text-[11px] font-bold text-emerald-800 block">চলতি মাসে অর্জিত</span>
                          <p className="text-xl font-black text-emerald-700 font-mono mt-1">
                            {currentAchieved} <span className="text-xs font-normal text-emerald-600">টি নিবন্ধিত</span>
                          </p>
                        </div>
                        <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200/80">
                          <span className="text-[11px] font-bold text-sky-800 block">অর্জনের শতকরা হার</span>
                          <p className="text-xl font-black text-sky-700 font-mono mt-1">
                            {progressPct}%
                          </p>
                        </div>
                        <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/80">
                          <span className="text-[11px] font-bold text-purple-800 block">লক্ষ্য পূরণে বাকি</span>
                          <p className="text-xl font-black text-purple-700 font-mono mt-1">
                            {remainingToTarget} <span className="text-xs font-normal text-purple-600">টি</span>
                          </p>
                        </div>
                      </div>

                      {/* Progress Metrics: Daily, Weekly, Monthly */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Daily Target */}
                        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> দৈনিক লক্ষ্যমাত্রা
                            </span>
                            <span className="font-mono font-extrabold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-lg">
                              {dailyTarget ? `${dailyTarget} টি/দিন` : 'নির্ধারিত নয়'}
                            </span>
                          </div>
                          <div className="w-full bg-emerald-200/60 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (currentAchieved / (dailyTarget || 1)) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-emerald-800 font-semibold flex justify-between">
                            <span>চলতি অগ্রগতি: {currentAchieved} টি</span>
                            <span className="font-mono font-bold">
                              {dailyTarget ? `${Math.round((currentAchieved / dailyTarget) * 100)}%` : '—'}
                            </span>
                          </p>
                        </div>

                        {/* Weekly Target */}
                        <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-sky-900 flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-sky-600" /> সাপ্তাহিক লক্ষ্যমাত্রা
                            </span>
                            <span className="font-mono font-extrabold text-sky-700 bg-sky-100/90 px-2 py-0.5 rounded-lg">
                              {weeklyTarget ? `${weeklyTarget} টি/সপ্তাহ` : 'নির্ধারিত নয়'}
                            </span>
                          </div>
                          <div className="w-full bg-sky-200/60 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-sky-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (currentAchieved / (weeklyTarget || 1)) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-sky-800 font-semibold flex justify-between">
                            <span>চলতি অগ্রগতি: {currentAchieved} টি</span>
                            <span className="font-mono font-bold">
                              {weeklyTarget ? `${Math.round((currentAchieved / weeklyTarget) * 100)}%` : '—'}
                            </span>
                          </p>
                        </div>

                        {/* Monthly Target */}
                        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-purple-900 flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-purple-600" /> মাসিক লক্ষ্যমাত্রা ({currentMonthKey})
                            </span>
                            <span className="font-mono font-extrabold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-lg">
                              {monthlyTarget ? `${monthlyTarget} টি/মাস` : 'নির্ধারিত নয়'}
                            </span>
                          </div>
                          <div className="w-full bg-purple-200/60 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-purple-800 font-semibold flex justify-between">
                            <span>অর্জিত: {currentAchieved} / {monthlyTarget} টি</span>
                            <span className="font-mono font-bold">{progressPct}%</span>
                          </p>
                        </div>
                      </div>

                      {/* Month Comparison Pill */}
                      {prevMonthItem && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-slate-700">
                            <History className="w-4 h-4 text-slate-500" />
                            <span>
                              পূর্ববর্তী মাস (<strong>{prevMonthItem.month}</strong>)-এ লক্ষ্যমাত্রা ছিল{' '}
                              <strong>{prevMonthItem.monthlyTarget}</strong> টি এবং অর্জিত হয়েছিল{' '}
                              <strong className="text-emerald-700">{prevMonthItem.achieved || 0}</strong> টি (
                              {prevMonthItem.monthlyTarget > 0 ? Math.round(((prevMonthItem.achieved || 0) / prevMonthItem.monthlyTarget) * 100) : 0}%).
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shrink-0">
                            পূর্বের পারফরম্যান্স রেকর্ড সংরক্ষিত
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Historical Performance Table (পূর্ববর্তী ও বর্তমান মাসের টার্গেট বনাম অর্জন হিস্ট্রি) */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <History className="w-4 h-4 text-indigo-600" />
                            মাসভিত্তিক কার্ড বিতরণ টার্গেট ও অর্জন হিস্ট্রি (Monthly Performance History)
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            আপনার বর্তমান ও বিগত মাসসমূহের নির্ধারিত লক্ষ্যমাত্রা ও অর্জনের তালিকা
                          </p>
                        </div>

                        {/* Month Filter Dropdown */}
                        <div className="flex items-center gap-2">
                          <Filter className="w-3.5 h-3.5 text-slate-400" />
                          <select
                            value={historyMonthFilter}
                            onChange={e => setHistoryMonthFilter(e.target.value)}
                            className="text-xs p-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-700 font-bold focus:outline-none focus:border-indigo-500"
                          >
                            <option value="ALL">সকল মাসের হিস্ট্রি</option>
                            {historyList.map(h => (
                              <option key={h.month} value={h.month}>
                                {h.month} {h.month === currentMonthKey ? '(চলতি মাস)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* History Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-3">মাস ও বছর (Month)</th>
                              <th className="py-3 px-3">নির্ধারিত টার্গেট</th>
                              <th className="py-3 px-3">অর্জিত কার্ড সংখ্যা</th>
                              <th className="py-3 px-3">অর্জনের হার (Progress)</th>
                              <th className="py-3 px-3">দৈনিক / সাপ্তাহিক</th>
                              <th className="py-3 px-3">স্ট্যাটাস</th>
                              <th className="py-3 px-3">এডমিন নোট / মন্তব্য</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredHistory.map((item, idx) => {
                              const targetNum = item.monthlyTarget || 0;
                              const achievedNum = item.achieved || 0;
                              const pct = targetNum > 0 ? Math.round((achievedNum / targetNum) * 100) : 0;
                              const isCurrent = item.month === currentMonthKey;
                              const isDone = item.status === 'ACHIEVED' || achievedNum >= targetNum;

                              return (
                                <tr
                                  key={idx}
                                  className={`hover:bg-slate-50/80 transition ${
                                    isCurrent ? 'bg-indigo-50/30 font-medium' : ''
                                  }`}
                                >
                                  {/* Month */}
                                  <td className="py-3 px-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                        {item.month}
                                      </span>
                                      {isCurrent && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                          চলতি মাস
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Target */}
                                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                    {targetNum} টি
                                  </td>

                                  {/* Achieved */}
                                  <td className="py-3 px-3 font-mono font-bold">
                                    <span className={isDone ? 'text-emerald-700' : 'text-slate-900'}>
                                      {achievedNum} টি
                                    </span>
                                  </td>

                                  {/* Progress */}
                                  <td className="py-3 px-3 min-w-[130px]">
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-[11px] font-mono font-bold">
                                        <span className={pct >= 100 ? 'text-emerald-700' : 'text-slate-600'}>
                                          {pct}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            pct >= 100
                                              ? 'bg-emerald-500'
                                              : pct >= 50
                                                ? 'bg-sky-500'
                                                : 'bg-amber-500'
                                          }`}
                                          style={{ width: `${Math.min(100, pct)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Daily / Weekly */}
                                  <td className="py-3 px-3 text-[11px] text-slate-600 font-mono">
                                    <div>দৈনিক: {item.dailyTarget || dailyTarget} টি</div>
                                    <div>সাপ্তাহিক: {item.weeklyTarget || weeklyTarget} টি</div>
                                  </td>

                                  {/* Status */}
                                  <td className="py-3 px-3 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                        isDone
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : isCurrent
                                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                                      }`}
                                    >
                                      {isDone ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> অর্জিত
                                        </>
                                      ) : isCurrent ? (
                                        <>
                                          <Clock className="w-3 h-3 text-amber-600" /> চলমান
                                        </>
                                      ) : (
                                        <>
                                          <AlertTriangle className="w-3 h-3 text-rose-600" /> অপূর্ণ
                                        </>
                                      )}
                                    </span>
                                  </td>

                                  {/* Remarks */}
                                  <td className="py-3 px-3 max-w-[220px]">
                                    <p className="text-slate-600 text-[11px] truncate" title={item.remarks || 'কোনো মন্তব্য নেই'}>
                                      {item.remarks || <span className="text-slate-400 italic">—</span>}
                                    </p>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {filteredHistory.length === 0 && (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl text-xs">
                          কোনো পূর্ববর্তী টার্গেট হিস্ট্রি পাওয়া যায়নি।
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB: PROFILE (প্রোফাইল ট্যাব) */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* MOVED APPLICATION & PAYMENT RECEIPT CARD BANNER */}
              {repProfile && (
                <div className={`p-5 rounded-3xl border shadow-sm space-y-4 ${
                  repProfile.status === 'APPROVED'
                    ? 'bg-gradient-to-r from-slate-900 to-emerald-950 text-white border-emerald-700/60'
                    : repProfile.status === 'REJECTED'
                    ? 'bg-gradient-to-r from-slate-900 to-rose-950 text-white border-rose-800/60'
                    : 'bg-gradient-to-r from-slate-900 to-sky-950 text-white border-sky-800/60'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={repProfile.photoUrl || user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                        alt={repProfile.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-extrabold text-base text-white">{repProfile.name}</h2>
                          <span className="text-[10px] font-mono text-amber-300 bg-white/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                            {repProfile.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {repProfile.circularTitle} • এলাকা: {repProfile.assignedArea || `${repProfile.upazila}, ${repProfile.district}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handlePrintReceipt}
                        className="w-full sm:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        পেমেন্ট মানি রিসিট ডাউনলোড / প্রিন্ট
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-300 block text-[10px]">আবেদনের অবস্থা (Application Status):</span>
                      <div className="mt-1 flex items-center gap-1.5 font-black text-sm">
                        {repProfile.status === 'APPROVED' ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> ✓ APPROVED (অনুমোদিত)
                          </span>
                        ) : repProfile.status === 'REJECTED' ? (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> ✕ REJECTED (বাতিল)
                          </span>
                        ) : (
                          <span className="text-amber-300 flex items-center gap-1">
                            <Clock className="w-4 h-4 animate-pulse text-amber-400" /> ⏳ PENDING (যাচাইধীন)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-300 block text-[10px]">পেমেন্ট ভেরিফিকেশন স্ট্যাটাস:</span>
                      <div className="mt-1 flex items-center gap-1.5 font-black text-sm">
                        {repProfile.paymentStatus === 'PAID' ? (
                          <span className="text-emerald-400">✓ PAID (ভেরিফাইড ও অনুমোদিত)</span>
                        ) : repProfile.paymentStatus === 'PENDING' ? (
                          <span className="text-amber-300">⏳ PENDING (এডমিন ভেরিফিকেশন সাপেক্ষ)</span>
                        ) : (
                          <span className="text-rose-400">✕ UNPAID / REJECTED</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-300 block text-[10px]">পেমেন্ট ট্রানজেকশন ID (TrxID):</span>
                      <span className="mt-1 block font-mono font-extrabold text-amber-300 text-xs truncate">
                        {repProfile.paymentTxnId || 'N/A'} ({repProfile.paymentMethod || 'bKash'})
                      </span>
                    </div>

                    <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                      <span className="text-slate-300 block text-[10px]">আবেদন ফি এর পরিমাণ:</span>
                      <span className="mt-1 block font-black text-emerald-400 text-sm">
                        ৳ {repProfile.paymentAmount || 500} BDT
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* REPRESENTATIVE PERSONAL PROFILE DETAILS CARD */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-700">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900">
                        {isEditingProfile ? 'প্রোফাইল তথ্য সম্পাদন (Edit Profile)' : 'ব্যক্তিগত প্রোফাইল ও তথ্য'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isEditingProfile ? 'আইডি, নাম, মোবাইল ও ছবি সরাসরি পরিবর্তন করুন' : 'আপনার ফিল্ড রিপ্রেজেন্টেটিভ প্রোফাইলের বিবরণ'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isEditingProfile ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(true);
                          setProfileMsg(null);
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        প্রোফাইল এডিট করুন
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileMsg(null);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        বাতিল
                      </button>
                    )}
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 hidden sm:inline-block">
                      অফিসিয়াল প্রোফাইল
                    </span>
                  </div>
                </div>

                {profileMsg && (
                  <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                {repProfile?.pendingProfileUpdate?.status === 'PENDING' && !isEditingProfile && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900">
                    <div className="p-2 bg-amber-200/80 rounded-xl text-amber-900 mt-0.5">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-amber-950">প্রোফাইল আপডেট আবেদন অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে</span>
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded-md text-[10px]">অপেক্ষমাণ (Pending Admin Approval)</span>
                      </div>
                      <p className="mt-1 text-amber-800 leading-relaxed">
                        আপনি সম্প্রতি আইডি, নাম, মোবাইল বা ছবির তথ্যে পরিবর্তন সাবমিট করেছেন ({new Date(repProfile.pendingProfileUpdate.requestedAt).toLocaleString('bn-BD')})। অ্যাডমিন প্যানেল থেকে যাচাই ও অনুমোদন সম্পন্ন হলে আপনার প্রোফাইলে নতুন তথ্য স্বয়ংক্রিয়ভাবে কার্যকর হবে।
                      </p>
                      {repProfile.pendingProfileUpdate.data && (
                        <div className="mt-2.5 pt-2 border-t border-amber-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div><span className="text-amber-700">অনুরোধকৃত আইডি:</span> <strong className="font-mono text-amber-950">{repProfile.pendingProfileUpdate.data.id || repProfile.id}</strong></div>
                          <div><span className="text-amber-700">অনুরোধকৃত নাম:</span> <strong className="text-amber-950">{repProfile.pendingProfileUpdate.data.name || repProfile.name}</strong></div>
                          <div><span className="text-amber-700">অনুরোধকৃত মোবাইল:</span> <strong className="font-mono text-amber-950">{repProfile.pendingProfileUpdate.data.mobile || repProfile.mobile}</strong></div>
                          <div><span className="text-amber-700">জেলা/এলাকা:</span> <strong className="text-amber-950">{repProfile.pendingProfileUpdate.data.district || repProfile.district}</strong></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isEditingProfile ? (
                  /* PROFILE EDIT FORM */
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* PHOTO UPLOAD SECTION */}
                    <div className="p-5 bg-amber-50/40 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative group">
                        <img
                          src={profileForm.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                          alt="Profile Preview"
                          className="w-24 h-24 rounded-2xl object-cover border-4 border-amber-500 shadow-md bg-white"
                        />
                      </div>
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <h4 className="font-extrabold text-sm text-slate-900">প্রোফাইল ছবি পরিবর্তন (Direct Upload)</h4>
                        <p className="text-xs text-slate-500">
                          আপনার ডিভাইস থেকে সরাসরি ছবি আপলোড করুন অথবা ছবির লিংক দিন (সর্বোচ্চ ৫ মেগাবাইট)।
                        </p>
                        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                          <label
                            htmlFor="rep-profile-file-input"
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer inline-flex items-center gap-1.5 transition"
                          >
                            <Upload className="w-4 h-4" />
                            সরাসরি ছবি আপলোড করুন
                          </label>
                          <input
                            id="rep-profile-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleRepPhotoUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FORM INPUTS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">প্রতিনিধি আইডি নম্বর (Representative ID) *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.id}
                          onChange={e => setProfileForm({ ...profileForm, id: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="e.g. REP-2026-001"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">অফিসিয়াল আইডি নম্বর পরিবর্তন করতে পারেন</span>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">পূর্ণ নাম (Full Name) *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="আপনার পূর্ণ নাম"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর (Login Mobile) *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.mobile}
                          onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="01XXXXXXXXX"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">পোর্টালে লগইনের জন্য এই মোবাইল নম্বর ব্যবহৃত হবে</span>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">ইমেইল ঠিকানা (Email Address)</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="example@mail.com"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">এনআইডি নম্বর (NID / Birth Certificate)</label>
                        <input
                          type="text"
                          value={profileForm.nidNo}
                          onChange={e => setProfileForm({ ...profileForm, nidNo: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="জাতীয় পরিচয়পত্র নম্বর"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">পদবী / রোল (Designation)</label>
                        <input
                          type="text"
                          value={profileForm.circularTitle}
                          onChange={e => setProfileForm({ ...profileForm, circularTitle: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="ফিল্ড রিপ্রেজেন্টেটিভ"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">পিতার নাম (Father's Name)</label>
                        <input
                          type="text"
                          value={profileForm.fatherName}
                          onChange={e => setProfileForm({ ...profileForm, fatherName: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="পিতার নাম"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">মাতার নাম (Mother's Name)</label>
                        <input
                          type="text"
                          value={profileForm.motherName}
                          onChange={e => setProfileForm({ ...profileForm, motherName: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="মাতার নাম"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">শিক্ষাগত যোগ্যতা (Education)</label>
                        <input
                          type="text"
                          value={profileForm.educationalQualification}
                          onChange={e => setProfileForm({ ...profileForm, educationalQualification: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="যেমন: এইচএসসি / স্নাতক"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">জেলা (District)</label>
                        <input
                          type="text"
                          value={profileForm.district}
                          onChange={e => setProfileForm({ ...profileForm, district: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="যেমন: গোপালগঞ্জ"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">উপজেলা / থানা (Upazila)</label>
                        <input
                          type="text"
                          value={profileForm.upazila}
                          onChange={e => setProfileForm({ ...profileForm, upazila: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="যেমন: গোপালগঞ্জ সদর"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">এসাইনকৃত কাজের এলাকা (Assigned Area)</label>
                        <input
                          type="text"
                          value={profileForm.assignedArea}
                          onChange={e => setProfileForm({ ...profileForm, assignedArea: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="যেমন: গোপালগঞ্জ সদর, টুঙ্গিপাড়া"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block font-bold text-slate-700 mb-1">সম্পূর্ণ ঠিকানা (Full Address)</label>
                        <input
                          type="text"
                          value={profileForm.address}
                          onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="গ্রাম / রোড, পোস্ট অফিস, উপজেলা, জেলা"
                        />
                      </div>
                    </div>

                    {/* FORM ACTION BUTTONS */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="submit"
                        disabled={profileUpdateLoading}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                      >
                        {profileUpdateLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            সংরক্ষণ হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            প্রোফাইল আপডেট ও সংরক্ষণ করুন
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileMsg(null);
                        }}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </div>
                  </form>
                ) : (
                  /* PROFILE DISPLAY VIEW */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div className="md:col-span-1 flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="relative group">
                        <img
                          src={repProfile?.photoUrl || user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                          alt="Profile Photo"
                          className="w-28 h-28 rounded-2xl object-cover border-4 border-amber-500 shadow-lg bg-white"
                        />
                      </div>
                      <div>
                        <h4 className="font-black text-base text-slate-900">{repProfile?.name || user.name}</h4>
                        <p className="font-semibold text-amber-700 text-xs mt-0.5">
                          {repProfile?.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-1 font-bold">
                          ID: {repProfile?.id || user.id || 'REP-2026-001'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer mt-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        তথ্য পরিবর্তন
                      </button>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[11px] font-semibold">পূর্ণ নাম:</span>
                        <p className="font-extrabold text-slate-900 text-sm mt-0.5">{repProfile?.name || user.name}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-semibold">প্রতিনিধি আইডি:</span>
                        <p className="font-mono font-extrabold text-amber-800 text-sm mt-0.5">{repProfile?.id || user.id || 'REP-2026-001'}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-semibold">মোবাইল নম্বর:</span>
                        <p className="font-mono font-bold text-slate-900 mt-0.5">{repProfile?.mobile || user.mobile}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-semibold">ইমেইল ঠিকানা:</span>
                        <p className="font-bold text-slate-800 mt-0.5">{repProfile?.email || user.email || 'প্রদান করা হয়নি'}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-semibold">এনআইডি নম্বর:</span>
                        <p className="font-mono font-bold text-slate-800 mt-0.5">{repProfile?.nidNo || 'প্রদান করা হয়নি'}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] font-semibold">শিক্ষাগত যোগ্যতা:</span>
                        <p className="font-bold text-slate-800 mt-0.5">{repProfile?.educationalQualification || 'স্নাতক / সমমান'}</p>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-slate-500 block text-[11px] font-semibold">স্থায়ী ও বর্তমান ঠিকানা:</span>
                        <p className="font-bold text-slate-900 mt-0.5">
                          {repProfile?.address || 'গোপালগঞ্জ সদর, গোপালগঞ্জ'}
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-slate-500 block text-[11px] font-semibold">এসাইনকৃত কাজের এলাকা (Assigned Area):</span>
                        <p className="font-extrabold text-amber-800 mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>{repProfile?.assignedArea || `${repProfile?.upazila || 'গোপালগঞ্জ সদর'}, ${repProfile?.district || 'গোপালগঞ্জ'}`}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CHANGE PASSWORD SECTION */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                  <div className="p-2.5 bg-sky-50 rounded-xl text-sky-700">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">পাসওয়ার্ড পরিবর্তন করুন</h3>
                    <p className="text-xs text-slate-500">নিরাপত্তার জন্য নিয়মিত আপনার পাসওয়ার্ড আপডেট রাখুন</p>
                  </div>
                </div>

                {pwdMsg && (
                  <div className={`p-3.5 rounded-xl text-xs font-bold ${
                    pwdMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {pwdMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs max-w-2xl">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বর্তমান পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={pwdForm.currentPassword}
                      onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">নতুন পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={pwdForm.newPassword}
                      onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">কনফার্ম নতুন পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={pwdForm.confirmPassword}
                      onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      disabled={pwdLoading}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition cursor-pointer disabled:opacity-50"
                    >
                      {pwdLoading ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
                    </button>
                  </div>
                </form>
              </div>

              {/* ADMIN DOCUMENTS FIELD (নিয়োগপত্র, স্যালারিশিট ইত্যাদি) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-50 rounded-xl text-purple-700">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">এডমিন ডকুমেন্টস ও পেপারস (Official Papers)</h3>
                      <p className="text-xs text-slate-500">এডমিন শাখা হতে দেওয়া অফিসিয়াল নিয়োগপত্র, স্যালারিশিট ও ব্যাজ ডাউনলোড করুন</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  {/* Appointment Letter */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-600" />
                        নিয়োগপত্র (Appointment Letter)
                      </p>
                      <p className="text-[11px] text-slate-500">ডিজিটাল মিডি ব্রিজের অফিসিয়াল নিয়োগপত্র ও শর্তাবলী</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadAppointmentLetter}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> ভিউ / ডাউনলোড
                    </button>
                  </div>

                  {/* Salary Sheet */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        স্যালারিশিট (Salary Sheet)
                      </p>
                      <p className="text-[11px] text-slate-500">মাসিক বেতন, টিএ-ডিএ ও কমিশন ভাতা ভাউচার</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadSalarySheet}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> ভিউ / ডাউনলোড
                    </button>
                  </div>

                  {/* Representative Official ID Badge */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-sky-600" />
                        মাঠ প্রতিনিধি আইডি কার্ড (Official Badge)
                      </p>
                      <p className="text-[11px] text-slate-500">ফিল্ডে আইডি কার্ড হিসেবে প্রদর্শনের ডিজিটাল ব্যাজ</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadIdCard}
                      className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> ভিউ / প্রিন্ট
                    </button>
                  </div>

                  {/* NOC / Experience Paper */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        অভিজ্ঞতার সনদ ও এনওসি (NOC Paper)
                      </p>
                      <p className="text-[11px] text-slate-500">এইচআর কতৃক সীলযুক্ত ফিল্ড পারফর্মেন্স সার্টিফেক্ট</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadAppointmentLetter}
                      className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> ভিউ / ডাউনলোড
                    </button>
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

                <div className="flex gap-2 w-full sm:w-auto relative" ref={cardsDropdownRef}>
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder="নাম, আইডি বা মোবাইল খুঁজুন..."
                      value={searchTerm}
                      onChange={e => {
                        setSearchTerm(e.target.value);
                        setIsCardsDropdownOpen(true);
                      }}
                      onFocus={() => setIsCardsDropdownOpen(true)}
                      className="w-full p-2.5 pl-8 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setIsCardsDropdownOpen(false);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}

                    {/* Cards Tab Autocomplete Dropdown */}
                    {isCardsDropdownOpen && searchTerm.trim().length > 0 && cardsTabSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-60">
                        <div className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold flex justify-between items-center">
                          <span>🔍 সাজেস্টেড কার্ড ({cardsTabSuggestions.length}টি)</span>
                          <span className="text-slate-400">ক্লিক করে ফিল্টার করুন</span>
                        </div>
                        <div className="overflow-y-auto max-h-52 divide-y divide-slate-50">
                          {cardsTabSuggestions.map(item => (
                            <button
                              key={item.cardId}
                              type="button"
                              onClick={() => {
                                setSearchTerm(item.memberName);
                                setIsCardsDropdownOpen(false);
                              }}
                              className="w-full text-left p-2.5 hover:bg-amber-50/80 transition flex items-center justify-between gap-2 cursor-pointer text-xs"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{item.memberName}</p>
                                <p className="font-mono text-[10px] text-slate-500">{item.cardId} • 📞 {item.mobile}</p>
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex-shrink-0">
                                {item.cardTier}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold text-slate-700 cursor-pointer"
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
                    {filteredCards.map(c => {
                      const exp = c.expiryDate || c.validUntil;
                      const isExpired = c.status === 'EXPIRED' || (exp && !exp.toLowerCase().includes('lifetime') && !exp.includes('আজীবন') && !isNaN(new Date(exp).getTime()) && new Date(exp).getTime() < new Date().setHours(0,0,0,0));
                      return (
                        <tr key={c.cardId} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">{c.cardId}</td>
                          <td className="p-3 font-semibold text-slate-800">{c.memberName}</td>
                          <td className="p-3 font-mono text-slate-600">{c.mobile}</td>
                          <td className="p-3 font-bold text-amber-700">{c.cardTier}</td>
                          <td className="p-3">
                            {isExpired ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                                EXPIRED (মেয়াদ শেষ)
                              </span>
                            ) : (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {c.status}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedCard(c)}
                              className="p-1.5 rounded bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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

          {/* TAB 4: FAMILY REGISTRATION (নতুন পরিবার রেজিস্ট্রেশন) */}
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
                </div>

                {/* Card Tier Selection Grid */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-extrabold text-slate-800">
                    মেম্বারশিপ কার্ড প্যাকেজ নির্বাচন করুন (Select Tier) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRegForm({ ...regForm, cardTier: 'Silver' });
                        handleMemberCountChange(4);
                      }}
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
                      onClick={() => {
                        setRegForm({ ...regForm, cardTier: 'Gold' });
                        handleMemberCountChange(6);
                      }}
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
                      onClick={() => {
                        setRegForm({ ...regForm, cardTier: 'Platinum' });
                        handleMemberCountChange(8);
                      }}
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

                {/* FAMILY HEAD PHOTO FIELD */}
                <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-amber-600" />
                      পরিবার প্রধানের ছবি (Family Head Photo) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[10px] text-sky-700 hover:underline font-bold"
                    >
                      {showUrlInput ? 'ইনপুট বক্স লুকান' : 'ইউআরএল লিঙ্ক ব্যবহার করুন'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Preview Box */}
                    <div className="relative group flex-shrink-0">
                      <img
                        src={regForm.photoUrl}
                        alt="Head Photo Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-slate-200"
                      />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded-full whitespace-nowrap shadow">
                        প্রিভিউ
                      </span>
                    </div>

                    {/* Direct Upload & Camera Action Buttons */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Direct File Upload Button */}
                        <label className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition">
                          <Upload className="w-4 h-4 text-slate-950" />
                          ফাইল থেকে ছবি আপলোড
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoFileUpload}
                            className="hidden"
                          />
                        </label>

                        {/* Direct Camera Capture Button */}
                        <button
                          type="button"
                          onClick={() => startCamera('user')}
                          className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <Camera className="w-4 h-4 text-amber-400" />
                          ক্যামেরা দিয়ে ছবি তুলুন
                        </button>

                        {/* Reset to Default Button */}
                        <button
                          type="button"
                          onClick={() => setRegForm({
                            ...regForm,
                            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                          })}
                          className="px-2.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
                          title="ডিফল্ট ছবিতে রিসেট করুন"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 font-medium">
                        💡 মোবাইলের গ্যালারি/ডিভাইস থেকে ফাইল সিলেক্ট করুন অথবা সরাসরি নতুন ছবি তুলে নিন।
                      </p>

                      {/* Optional URL Input */}
                      {showUrlInput && (
                        <div className="pt-1">
                          <input
                            type="text"
                            placeholder="ছবির সরাসরি লিঙ্ক (Image URL) দিন..."
                            value={regForm.photoUrl}
                            onChange={e => setRegForm({ ...regForm, photoUrl: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      )}
                    </div>
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
                    <label className="block font-bold text-slate-700 mb-1">এনআইডি/জন্ম নিবন্ধন নম্বর *</label>
                    <input
                      type="text"
                      required
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
                </div>

                {/* DYNAMIC FAMILY MEMBERS LIST (COMMA FIELD REMOVED) */}
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        পরিবারের অন্যান্য সদস্যদের ফিল্ড ইনপুট (সদস্য সংখ্যা: {familyMembers.length} জন)
                      </h4>
                      <p className="text-[11px] text-slate-500">প্রতিটি সদস্যের জন্য আলাদা ফিল্ডে নাম প্রবেশ করান</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddMemberField}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> সদস্য যোগ করুন
                      </button>
                      {familyMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={handleRemoveMemberField}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> বাদ দিন
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {familyMembers.map((member, index) => (
                      <div key={index} className="space-y-1">
                        <label className="block text-[11px] font-extrabold text-slate-700">
                          সদস্য {index + 1}-এর নাম (Member {index + 1})
                        </label>
                        <input
                          type="text"
                          placeholder={`যেমন: সদস্য ${index + 1}-এর নাম ও সম্পর্ক`}
                          value={member}
                          onChange={e => handleMemberNameChange(index, e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* PAYMENT OPTIONS (CASH vs MOBILE BANKING) */}
                <div className="p-5 bg-amber-50/60 rounded-3xl border border-amber-200 space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    পেমেন্ট মেথড নির্বাচন করুন (Payment Option)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* CASH OPTION */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('CASH')}
                      className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                        paymentOption === 'CASH'
                          ? 'bg-emerald-900 text-white border-emerald-900 ring-2 ring-emerald-500 shadow-md'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-sm">💵 ক্যাশ পেমেন্ট (Cash)</p>
                        <p className="text-[11px] opacity-80 mt-0.5">প্রতিনিধি কর্তৃক পরিদর্শনের সময় সরাসরি নগদ ক্যাশ গ্রহণ</p>
                      </div>
                      {paymentOption === 'CASH' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                    </button>

                    {/* MOBILE BANKING OPTION */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('MOBILE_BANKING')}
                      className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                        paymentOption === 'MOBILE_BANKING'
                          ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-400 shadow-md'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-sm">📱 মোবাইল ব্যাংকিং (Mobile Banking)</p>
                        <p className="text-[11px] opacity-80 mt-0.5">বিকাশ / নগদ / রকেট পেমেন্ট ও ট্রানজেকশন আইডি</p>
                      </div>
                      {paymentOption === 'MOBILE_BANKING' && <CheckCircle2 className="w-5 h-5 text-amber-200 flex-shrink-0" />}
                    </button>
                  </div>

                  {paymentOption === 'MOBILE_BANKING' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 bg-white p-4 rounded-2xl border border-amber-200">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">গেটওয়ে</label>
                        <select
                          value={paymentMethodName}
                          onChange={e => setPaymentMethodName(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-amber-50"
                        >
                          <option value="bKash">bKash (বিকাশ)</option>
                          <option value="Nagad">Nagad (নগদ)</option>
                          <option value="Rocket">Rocket (রকেট)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">প্রদের মোবাইল নম্বর</label>
                        <input
                          type="text"
                          placeholder="01712345678"
                          value={paymentSenderNo}
                          onChange={e => setPaymentSenderNo(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">ট্রানজেকশন আইডি (TrxID)</label>
                        <input
                          type="text"
                          placeholder="TRX1052948"
                          value={paymentTrxId}
                          onChange={e => setPaymentTrxId(e.target.value.toUpperCase())}
                          className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-amber-400">ফিল্ড এনরোলমেন্ট ও ফি বিবরণী</p>
                    <p className="text-base font-black mt-0.5">
                      {regForm.cardTier} Package • ফি: {regForm.cardTier === 'Silver' ? '৳২০০' : regForm.cardTier === 'Gold' ? '৳৩৫০' : '৳৫০০'} ({paymentOption === 'CASH' ? 'নগদ ক্যাশ' : paymentMethodName})
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition cursor-pointer"
                  >
                    নিবন্ধন সম্পন্ন করুন
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 5: HEALTH SURVEY (স্বাস্থ্য জরিপ) */}
          {activeTab === 'survey' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-amber-600" />
                  কমিউনিটি হেলথ সার্ভে সাবমিশন
                </h3>
                <p className="text-xs text-slate-500">মাঠপর্যায়ে পরিবারের স্বাস্থ্য তথ্য সংগ্রহ করুন</p>
              </div>

              {surveyMsg && (
                <div className={`p-3.5 rounded-xl text-xs font-bold ${
                  surveyMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {surveyMsg.text}
                </div>
              )}

              <form onSubmit={handleSubmitSurvey} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-w-xl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পরিবার প্রধানের নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ আজহারুল ইসলাম"
                    value={surveyForm.familyHeadName}
                    onChange={e => setSurveyForm({ ...surveyForm, familyHeadName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">যোগাযোগের মোবাইল *</label>
                  <input
                    type="text"
                    required
                    placeholder="01712345678"
                    value={surveyForm.mobile}
                    onChange={e => setSurveyForm({ ...surveyForm, mobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জেলা</label>
                  <input
                    type="text"
                    value={surveyForm.district}
                    onChange={e => setSurveyForm({ ...surveyForm, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">উপজেলা/থানা</label>
                  <input
                    type="text"
                    value={surveyForm.upazila}
                    onChange={e => setSurveyForm({ ...surveyForm, upazila: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>

                {/* ADDED ADDRESS FIELD */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">ঠিকানা (গ্রাম / ইউনিয়ন / ওয়ার্ড / প্যারা) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: গ্রাম: বৌলতলী, ইউনিয়ন: বৌলতলী, ওয়ার্ড ০৪"
                    value={surveyForm.address}
                    onChange={e => setSurveyForm({ ...surveyForm, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">পরিবারের সদস্য সংখ্যা</label>
                  <input
                    type="number"
                    value={surveyForm.familyMembersCount}
                    onChange={e => setSurveyForm({ ...surveyForm, familyMembersCount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জটিল রোগসমূহ (যদি থাকে)</label>
                  <input
                    type="text"
                    placeholder="যেমন: ডায়াবেটিস, প্রেশার"
                    value={surveyForm.chronicDiseases}
                    onChange={e => setSurveyForm({ ...surveyForm, chronicDiseases: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition cursor-pointer"
                  >
                    সার্ভে ডাটা জমা দিন
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: CARD VERIFICATION (কার্ড ভেরিফিকেশন) */}
          {activeTab === 'verify' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  কার্ড ভেরিফিকেশন পোর্টাল (Card Verification)
                </h3>
                <p className="text-xs text-slate-500">কার্ড নম্বর বা মোবাইল নম্বর দিয়ে মেম্বারশিপ স্থিতি ও তথ্য যাচাই করুন</p>
              </div>

              <form onSubmit={handleVerifyCard} className="relative flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:flex-1" ref={verifyDropdownRef}>
                  <input
                    type="text"
                    required
                    placeholder="কার্ড নম্বর (যেমন: DMB-2026-1001) বা মোবাইল..."
                    value={verifyCardId}
                    onChange={e => {
                      setVerifyCardId(e.target.value);
                      setIsVerifyDropdownOpen(true);
                    }}
                    onFocus={() => setIsVerifyDropdownOpen(true)}
                    className="w-full p-3 pl-10 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {verifyCardId && (
                    <button
                      type="button"
                      onClick={() => {
                        setVerifyCardId('');
                        setIsVerifyDropdownOpen(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Verify Tab Autocomplete Dropdown */}
                  {isVerifyDropdownOpen && verifyCardId.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-60">
                      <div className="px-3.5 py-2 bg-slate-900 text-white text-[10px] font-bold flex justify-between items-center">
                        <span>🔍 ম্যাচকৃত কার্ড সাজেশন</span>
                        <span className="text-slate-400">ক্লিক করে যাচাই করুন</span>
                      </div>
                      <div className="overflow-y-auto max-h-48 divide-y divide-slate-50">
                        {cards
                          .filter(c =>
                            c.cardId.toLowerCase().includes(verifyCardId.toLowerCase()) ||
                            c.mobile.includes(verifyCardId) ||
                            c.memberName.toLowerCase().includes(verifyCardId.toLowerCase())
                          )
                          .slice(0, 6)
                          .map(item => (
                            <button
                              key={item.cardId}
                              type="button"
                              onClick={() => {
                                setVerifyCardId(item.cardId);
                                setIsVerifyDropdownOpen(false);
                                setVerifiedCard(item);
                              }}
                              className="w-full text-left p-2.5 sm:p-3 hover:bg-amber-50/80 transition flex items-center justify-between gap-2 cursor-pointer text-xs"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">
                                  {item.memberName} <span className="font-mono text-amber-600 font-bold">({item.cardId})</span>
                                </p>
                                <p className="font-mono text-[10px] text-slate-500">📞 {item.mobile} • {item.upazila}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0">
                                {item.status}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {verifying ? 'যাচাই করা হচ্ছে...' : 'কার্ড ভেরিফাই করুন'}
                </button>
              </form>

              {verifyError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              {/* VERIFIED CARD RESULT DISPLAY */}
              {verifiedCard && (() => {
                const exp = verifiedCard.expiryDate || verifiedCard.validUntil;
                const isExpired = verifiedCard.status === 'EXPIRED' || (exp && !exp.toLowerCase().includes('lifetime') && !exp.includes('আজীবন') && !isNaN(new Date(exp).getTime()) && new Date(exp).getTime() < new Date().setHours(0,0,0,0));
                return (
                  <div className={`bg-white rounded-3xl p-6 sm:p-8 border ${isExpired ? 'border-rose-300' : 'border-emerald-300'} shadow-xl space-y-6`}>
                    {/* Status Banner */}
                    <div className={`flex items-center justify-between gap-3 p-4 rounded-2xl ${isExpired ? 'bg-rose-50 border border-rose-200' : 'bg-emerald-50 border border-emerald-200'} flex-wrap`}>
                      <div className="flex items-center gap-3">
                        {isExpired ? (
                          <AlertCircle className="w-8 h-8 text-rose-600 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                        )}
                        <div>
                          <h3 className={`font-extrabold ${isExpired ? 'text-rose-900' : 'text-emerald-900'} text-sm sm:text-base`}>
                            {isExpired ? 'মেয়াদোত্তীর্ণ কার্ড (EXPIRED CARD)' : 'বন্ধু কার্ড ভেরিফিকেশন সফল (VERIFIED CARD)'}
                          </h3>
                          <p className={`text-xs ${isExpired ? 'text-rose-700' : 'text-emerald-700'}`}>
                            ডিজিটাল মিডিয়া ব্রিজ মেডিক্যাল নেটওয়ার্ক
                          </p>
                        </div>
                      </div>
                      <span className={`px-3.5 py-1.5 rounded-full ${isExpired ? 'bg-rose-600' : 'bg-emerald-600'} text-white font-black text-xs font-mono`}>
                        {isExpired ? '⚠️ EXPIRED' : `✓ ${verifiedCard.status || 'ACTIVE'}`}
                      </span>
                    </div>

                  {/* Primary Member Detailed Card */}
                  <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-lg space-y-6">
                    {/* Top Bar: Photo & Name */}
                    <div className="flex items-center gap-4 border-b border-slate-800 pb-5 flex-wrap">
                      <img
                        src={verifiedCard.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                        alt={verifiedCard.memberName}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {verifiedCard.cardTier} CARD
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            ID: {verifiedCard.cardId}
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white">{verifiedCard.memberName}</h2>
                        <p className="text-xs text-slate-300 font-bold">
                          PHONE: <span className="font-mono text-amber-400">{verifiedCard.mobile}</span> | BLOOD GROUP: <span className="text-rose-400 font-extrabold">{verifiedCard.bloodGroup}</span>
                        </p>
                      </div>
                    </div>

                    {/* Grid of All Member Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">NID / BIRTH CERTIFICATE</span>
                        <p className="font-mono text-sm font-extrabold text-white mt-0.5">{verifiedCard.nidOrBirthCert || 'N/A'}</p>
                      </div>

                      <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">ISSUE DATE</span>
                        <p className="font-mono text-sm font-extrabold text-emerald-400 mt-0.5">{verifiedCard.issueDate || '01-01-2026'}</p>
                      </div>

                      <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">EXPIRY DATE</span>
                        <p className="font-mono text-sm font-extrabold text-amber-400 mt-0.5">{verifiedCard.expiryDate || '31-12-2026'}</p>
                      </div>

                      <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">UPAZILA & DISTRICT</span>
                        <p className="font-bold text-slate-200 mt-0.5">{verifiedCard.upazila}, {verifiedCard.district}</p>
                      </div>

                      <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 sm:col-span-2">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">FULL ADDRESS</span>
                        <p className="font-bold text-slate-200 mt-0.5">{verifiedCard.address}</p>
                      </div>
                    </div>

                    {/* Family Members / Beneficiaries Section with Avatars/Photos */}
                    {verifiedCard.beneficiaries && verifiedCard.beneficiaries.length > 0 && (
                      <div className="bg-slate-800/90 p-4 sm:p-5 rounded-2xl border border-slate-700 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <User className="w-4 h-4" /> FAMILY BENEFICIARIES (DISCOUNT ELIGIBLE) ({verifiedCard.beneficiaries.length} Persons)
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">HEALTH BENEFICIARIES</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {verifiedCard.beneficiaries.map((b, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2.5 bg-slate-900/90 rounded-xl border border-slate-700/70">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-extrabold text-emerald-300 text-xs flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{b}</p>
                                <span className="text-[10px] text-emerald-400 font-semibold block">নিবন্ধিত সুবিধাভোগী</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Embedded Live Digital Medical Card Preview */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" /> ডিজিটাল কার্ড প্রিভিউ ও প্রিন্ট কপি
                      </h4>
                      <span className="text-xs text-slate-500 font-semibold">ডিজিটাল মিডিয়া ব্রিজ কার্ড</span>
                    </div>

                    <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200">
                      <MedicalCardPrint card={verifiedCard} showPrintButton={true} />
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
          )}

          {/* TAB 7: SEARCH (সদস্য ও সুবিধাভোগী লাইভ সার্চ ও অটো-কমপ্লিট) */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Header & Stats Banner */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Search className="w-5 h-5" />
                      </span>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                        সদস্য ও পরিবার সুবিধাভোগী অনুসন্ধান (Member & Beneficiary Live Search)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      নাম, কার্ড আইডি (যেমন: DMB-2026-1001), মোবাইল নম্বর অথবা পরিবারের সদস্যের নাম টাইপ করলে তাৎক্ষণিক ড্রপডাউন সাজেশন আসবে।
                    </p>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      <span>মোট কার্ড: <strong className="font-mono text-slate-900">{myCards.length}</strong></span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>সক্রিয়: <strong className="font-mono">{activeCards.length}</strong></span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>পেন্ডিং: <strong className="font-mono">{pendingCards.length}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Search Mode & Category Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setSearchTargetType('ALL')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                        searchTargetType === 'ALL'
                          ? 'bg-white text-slate-950 shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" /> সকল (All)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchTargetType('MEMBER')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                        searchTargetType === 'MEMBER'
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" /> মূল সদস্য (Primary)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchTargetType('BENEFICIARY')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                        searchTargetType === 'BENEFICIARY'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> পরিবার সুবিধাভোগী (Beneficiaries)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Tier Filter */}
                    <select
                      value={searchTierFilter}
                      onChange={e => setSearchTierFilter(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="ALL">সকল টায়ার (All Tiers)</option>
                      <option value="Silver">🥈 সিলভার (Silver)</option>
                      <option value="Gold">🥇 গোল্ড (Gold)</option>
                      <option value="Platinum">💎 প্লাটিনাম (Platinum)</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={searchStatusFilter}
                      onChange={e => setSearchStatusFilter(e.target.value as any)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="ALL">সকল স্ট্যাটাস</option>
                      <option value="ACTIVE">ACTIVE (সক্রিয়)</option>
                      <option value="PENDING">PENDING (অপেক্ষমাণ)</option>
                      <option value="EXPIRED">EXPIRED (মেয়াদোত্তীর্ণ)</option>
                    </select>
                  </div>
                </div>

                {/* THE AUTOCOMPLETE SEARCH BAR CONTAINER */}
                <div className="relative pt-2">
                  <div className="relative flex items-center">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center gap-1.5">
                      <Search className="w-5 h-5 text-amber-500" />
                    </div>

                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="সদস্যের নাম, আইডি (যেমন: DMB-2026-1001), মোবাইল বা সুবিধাভোগীর নাম লিখুন..."
                      value={memberSearchQuery}
                      onChange={e => {
                        setMemberSearchQuery(e.target.value);
                        setIsSearchDropdownOpen(true);
                        setSelectedSuggestionIdx(-1);
                      }}
                      onFocus={() => setIsSearchDropdownOpen(true)}
                      onKeyDown={e => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setIsSearchDropdownOpen(true);
                          setSelectedSuggestionIdx(prev => 
                            prev < memberSearchSuggestions.length - 1 ? prev + 1 : 0
                          );
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSelectedSuggestionIdx(prev => 
                            prev > 0 ? prev - 1 : memberSearchSuggestions.length - 1
                          );
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          if (selectedSuggestionIdx >= 0 && selectedSuggestionIdx < memberSearchSuggestions.length) {
                            const chosen = memberSearchSuggestions[selectedSuggestionIdx];
                            setSelectedSearchCard(chosen.card);
                            setMemberSearchQuery(chosen.matchedText);
                            setIsSearchDropdownOpen(false);
                          } else if (memberSearchSuggestions.length > 0) {
                            setSelectedSearchCard(memberSearchSuggestions[0].card);
                            setMemberSearchQuery(memberSearchSuggestions[0].matchedText);
                            setIsSearchDropdownOpen(false);
                          }
                        } else if (e.key === 'Escape') {
                          setIsSearchDropdownOpen(false);
                        }
                      }}
                      className="w-full pl-12 pr-28 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition shadow-inner"
                    />

                    {/* Right action icons (Clear + Match indicator) */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {memberSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setMemberSearchQuery('');
                            setSelectedSearchCard(null);
                            searchInputRef.current?.focus();
                          }}
                          className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                          title="সার্চ ক্লিয়ার করুন"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-extrabold font-mono">
                        {memberSearchSuggestions.length} সাজেশন
                      </span>
                    </div>
                  </div>

                  {/* FLOATING AUTOCOMPLETE DROPDOWN SUGGESTIONS POPOVER */}
                  {isSearchDropdownOpen && (
                    <div
                      ref={searchDropdownRef}
                      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-96 flex flex-col"
                      style={{ animation: 'fadeIn 0.15s ease-out' }}
                    >
                      {/* Dropdown Header Guidance */}
                      <div className="px-4 py-2.5 bg-slate-900 text-white text-xs flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          {memberSearchQuery.trim()
                            ? `সাজেশন তালিকা (${memberSearchSuggestions.length}টি ম্যাচ পাওয়া গেছে)`
                            : `সাম্প্রতিক ও সক্রিয় কার্ড সাজেশন (${memberSearchSuggestions.length}টি)`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ক্লিক করুন বা ↑ ↓ তীর দিয়ে নির্বাচন করুন
                        </span>
                      </div>

                      {/* Suggestions List Body */}
                      <div className="overflow-y-auto divide-y divide-slate-100 max-h-80">
                        {memberSearchSuggestions.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 space-y-2">
                            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                            <p className="text-xs font-bold text-slate-700">
                              "{memberSearchQuery}" দিয়ে কোনো সদস্য বা সুবিধাভোগী পাওয়া যায়নি।
                            </p>
                            <p className="text-[11px] text-slate-400">
                              কার্ড নম্বর (যেমন: DMB-2026-1001), মোবাইল বা নামের সঠিক বানান দিয়ে পুনরায় চেষ্টা করুন।
                            </p>
                          </div>
                        ) : (
                          memberSearchSuggestions.map((item, idx) => {
                            const isSelected = idx === selectedSuggestionIdx;
                            const isExpired = item.card.status === 'EXPIRED';
                            return (
                              <button
                                key={`${item.card.cardId}-${item.type}-${idx}`}
                                type="button"
                                onClick={() => {
                                  setSelectedSearchCard(item.card);
                                  setMemberSearchQuery(item.matchedText);
                                  setIsSearchDropdownOpen(false);
                                }}
                                onMouseEnter={() => setSelectedSuggestionIdx(idx)}
                                className={`w-full text-left p-3 sm:p-3.5 transition flex items-center justify-between gap-3 cursor-pointer ${
                                  isSelected ? 'bg-amber-50/90' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Thumbnail Avatar */}
                                  <div className="relative flex-shrink-0">
                                    <img
                                      src={item.card.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                                      alt={item.card.memberName}
                                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm"
                                    />
                                    <span
                                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                        isExpired
                                          ? 'bg-rose-500'
                                          : item.card.status === 'ACTIVE'
                                          ? 'bg-emerald-500'
                                          : 'bg-amber-500'
                                      }`}
                                      title={item.card.status}
                                    />
                                  </div>

                                  {/* Information Details */}
                                  <div className="min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-extrabold text-xs text-slate-900 truncate">
                                        {item.matchedText}
                                      </span>

                                      {/* Type Badge */}
                                      {item.type === 'MEMBER' ? (
                                        <span className="px-2 py-0.2 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                                          মূল সদস্য
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                          👨‍👩‍👧 সুবিধাভোগী
                                        </span>
                                      )}

                                      {/* Tier Badge */}
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                        {item.card.cardTier}
                                      </span>
                                    </div>

                                    {/* Subtitle details */}
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                                        {item.card.cardId}
                                      </span>
                                      <span>• {item.matchReason}</span>
                                      {item.card.mobile && (
                                        <span className="font-mono text-slate-600">• 📞 {item.card.mobile}</span>
                                      )}
                                      {item.card.beneficiaries && item.card.beneficiaries.length > 0 && item.type === 'MEMBER' && (
                                        <span className="text-emerald-700 font-semibold text-[10px]">
                                          • {item.card.beneficiaries.length} জন সুবিধাভোগী
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right selection arrow */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                    isExpired
                                      ? 'bg-rose-100 text-rose-800'
                                      : item.card.status === 'ACTIVE'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {item.card.status}
                                  </span>
                                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-600 translate-x-0.5 transition' : 'text-slate-400'}`} />
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Dropdown Quick Picks Footer */}
                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-slate-500 font-bold">কুইক ফিল্টার:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTierFilter('Silver');
                              setIsSearchDropdownOpen(false);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[10px] hover:bg-slate-100"
                          >
                            🥈 সিলভার
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTierFilter('Gold');
                              setIsSearchDropdownOpen(false);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[10px] hover:bg-slate-100"
                          >
                            🥇 গোল্ড
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTierFilter('Platinum');
                              setIsSearchDropdownOpen(false);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[10px] hover:bg-slate-100"
                          >
                            💎 প্লাটিনাম
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsSearchDropdownOpen(false)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          ড্রপডাউন বন্ধ করুন
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SELECTED MEMBER DETAILED INSPECTION CARD (When a user clicks a suggestion) */}
              {selectedSearchCard && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-xl space-y-6">
                  {/* Banner bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-amber-950">
                          নির্বাচিত সদস্য ও সুবিধাভোগী পূর্ণাঙ্গ প্রোফাইল (Selected Card Profile)
                        </h4>
                        <p className="text-xs text-amber-800">
                          কার্ড নম্বর: <span className="font-mono font-black">{selectedSearchCard.cardId}</span> • টায়ার: {selectedSearchCard.cardTier}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedCard(selectedSearchCard)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" /> ডিজিটাল কার্ড ভিউ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyCardId(selectedSearchCard.cardId);
                          setActiveTab('verify');
                        }}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> ভেরিফাই করুন
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSearchCard(null)}
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                        title="সিলেকশন বন্ধ করুন"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Primary Member Profile Details */}
                  <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedSearchCard.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                          alt={selectedSearchCard.memberName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-500 shadow-md flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              {selectedSearchCard.cardTier} CARD
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              ID: {selectedSearchCard.cardId}
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-white">{selectedSearchCard.memberName}</h2>
                          <p className="text-xs text-slate-300 font-bold">
                            PHONE: <a href={`tel:${selectedSearchCard.mobile}`} className="font-mono text-amber-400 hover:underline">{selectedSearchCard.mobile}</a> | BLOOD: <span className="text-rose-400 font-extrabold">{selectedSearchCard.bloodGroup}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2">
                        <span className={`px-3 py-1 rounded-xl text-xs font-black font-mono self-start sm:self-auto ${
                          selectedSearchCard.status === 'ACTIVE'
                            ? 'bg-emerald-500 text-slate-950'
                            : selectedSearchCard.status === 'EXPIRED'
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}>
                          {selectedSearchCard.status}
                        </span>
                        <a
                          href={`tel:${selectedSearchCard.mobile}`}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
                        >
                          <Phone className="w-3.5 h-3.5" /> কল করুন
                        </a>
                      </div>
                    </div>

                    {/* Member Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">পিতার নাম</span>
                        <p className="font-bold text-white mt-0.5">{selectedSearchCard.fatherName || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">মাতার নাম</span>
                        <p className="font-bold text-white mt-0.5">{selectedSearchCard.motherName || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">এনআইডি / জন্মসনদ</span>
                        <p className="font-mono font-bold text-white mt-0.5">{selectedSearchCard.nidOrBirthCert || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">উপজেলা ও জেলা</span>
                        <p className="font-bold text-slate-200 mt-0.5">{selectedSearchCard.upazila}, {selectedSearchCard.district}</p>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 sm:col-span-2">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">পূর্ণ ঠিকানা</span>
                        <p className="font-bold text-slate-200 mt-0.5">{selectedSearchCard.address}</p>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">ইস্যু তারিখ</span>
                        <p className="font-mono font-bold text-emerald-400 mt-0.5">{selectedSearchCard.issueDate || '01-01-2026'}</p>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">মেয়াদ শেষ তারিখ</span>
                        <p className="font-mono font-bold text-amber-400 mt-0.5">{selectedSearchCard.expiryDate || '31-12-2026'}</p>
                      </div>
                    </div>

                    {/* Family Members / Beneficiaries Section */}
                    {selectedSearchCard.beneficiaries && selectedSearchCard.beneficiaries.length > 0 ? (
                      <div className="bg-slate-800/90 p-4 sm:p-5 rounded-2xl border border-slate-700 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <Users className="w-4 h-4" /> নিবন্ধিত পরিবার সুবিধাভোগী সদস্যবৃন্দ ({selectedSearchCard.beneficiaries.length} জন)
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                            মেডিক্যাল ডিসকাউন্ট সুবিধাভুক্ত
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                          {selectedSearchCard.beneficiaries.map((b, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-slate-900/90 rounded-xl border border-slate-700/70">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-extrabold text-emerald-300 text-xs flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{b}</p>
                                <span className="text-[10px] text-emerald-400 font-medium block">পরিবার সুবিধাভোগী</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-center text-xs text-slate-400">
                        কোনো পরিবার সুবিধাভোগী সদস্যের তালিকা সংরক্ষিত নেই।
                      </div>
                    )}
                  </div>

                  {/* Embedded Live Digital Card Preview & Print */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" /> ডিজিটাল মিডিয়া ব্রিজ মেডিক্যাল কার্ড প্রিভিউ
                      </h4>
                      <span className="text-xs text-slate-500 font-semibold">লাইভ কার্ড প্রিন্ট ও ডাউনলোড সুবিধা</span>
                    </div>

                    <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200">
                      <MedicalCardPrint card={selectedSearchCard} showPrintButton={true} />
                    </div>
                  </div>
                </div>
              )}

              {/* ALL FILTERED MEMBERS LIST & CARD TILES */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-slate-600" />
                      সার্চ ও ফিল্টারকৃত সদস্য তালিকা ({searchFilteredCards.length} জন)
                    </h4>
                    <p className="text-[11px] text-slate-500">যেকোনো কার্ডের বিস্তারিত দেখতে 'ভিউ' বা কার্ডে ক্লিক করুন</p>
                  </div>

                  {searchFilteredCards.length > 0 && (
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                      মোট {searchFilteredCards.length} টি কার্ড
                    </span>
                  )}
                </div>

                {searchFilteredCards.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="font-bold text-sm text-slate-700">কোনো সদস্য ডাটা পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400">ফিল্টার পরিবর্তন করে অথবা উপরের সার্চ বক্সে নতুন নাম টাইপ করুন</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchFilteredCards.map(c => {
                      const exp = c.expiryDate || c.validUntil;
                      const isExpired = c.status === 'EXPIRED' || (exp && !exp.toLowerCase().includes('lifetime') && !exp.includes('আজীবন') && !isNaN(new Date(exp).getTime()) && new Date(exp).getTime() < new Date().setHours(0,0,0,0));
                      const isSelected = selectedSearchCard?.cardId === c.cardId;

                      return (
                        <div
                          key={c.cardId}
                          onClick={() => setSelectedSearchCard(c)}
                          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400 shadow-md'
                              : 'bg-slate-50 hover:bg-white hover:shadow-md border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={c.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                              alt={c.memberName}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-sm flex-shrink-0"
                            />
                            <div className="min-w-0 space-y-0.5 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-extrabold text-xs text-slate-900 truncate">
                                  {c.memberName}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                  {c.cardTier}
                                </span>
                              </div>
                              <p className="font-mono text-xs text-slate-600 font-bold">{c.cardId}</p>
                              <p className="text-[11px] text-slate-500 truncate">📞 {c.mobile} • {c.upazila}</p>
                              {c.beneficiaries && c.beneficiaries.length > 0 && (
                                <p className="text-[10px] text-emerald-700 font-semibold truncate">
                                  👨‍👩‍👧 সুবিধাভোগী: {c.beneficiaries.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono ${
                              isExpired
                                ? 'bg-rose-100 text-rose-800'
                                : c.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isExpired ? 'EXPIRED' : c.status}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSearchCard(c);
                                  window.scrollTo({ top: 300, behavior: 'smooth' });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> বিস্তারিত
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: NOTIFICATIONS */}
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

      {/* Live Camera Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden space-y-4 p-5 animate-fadeIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base">পরিবার প্রধানের ছবি ক্যাপচার (Live Camera)</h3>
              </div>
              <button
                onClick={stopCamera}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Video View or Error */}
            {cameraError ? (
              <div className="p-6 bg-rose-950/50 rounded-2xl border border-rose-800 text-rose-200 text-xs space-y-3 text-center">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <p className="font-bold">{cameraError}</p>
                <p className="text-[11px] text-rose-300">
                  অথবা বাতিল করে ফাইল আপলোড করার অপশনটি ব্যবহার করুন।
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-amber-500/50 shadow-inner aspect-square max-h-80 mx-auto flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Camera Framing Overlay */}
                <div className="absolute inset-4 border-2 border-dashed border-amber-400/60 rounded-2xl pointer-events-none flex items-end justify-center pb-2">
                  <span className="px-3 py-1 bg-black/60 text-amber-300 text-[10px] font-extrabold rounded-full backdrop-blur-sm">
                    চেহারা ফ্রেমে রাখুন
                  </span>
                </div>
              </div>
            )}

            {/* Modal Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                title="ক্যামেরা পরিবর্তন করুন"
              >
                <SwitchCamera className="w-4 h-4 text-amber-400" />
                ক্যামেরা সুইচ ({facingMode === 'user' ? 'Front' : 'Back'})
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                
                {!cameraError && (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    ছবি তুলুন
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
