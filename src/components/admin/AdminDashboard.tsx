import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { fetchJsonSafe } from '../../utils/api';
import {
  Users,
  CreditCard,
  Building2,
  TrendingUp,
  Percent,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Edit3,
  Eye,
  Phone,
  Mail,
  MapPin,
  User as UserIcon,
  CheckCircle2,
  ShieldCheck,
  Download,
  Printer,
  Search,
  LayoutDashboard,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  BarChart3,
  ListOrdered,
  Menu,
  X,
  UserCheck,
  UserX,
  Globe,
  Award,
  Sparkles,
  Send,
  MessageSquare,
  Key,
  Sliders,
  Save,
  RefreshCw,
  Building,
  Star,
  Image as ImageIcon,
  Upload,
  Briefcase,
  ExternalLink,
  Check,
  ZoomIn,
  Palette,
  FileCheck,
  FileDown,
  Loader2
} from 'lucide-react';
import {
  MedicalCard,
  DiagnosticCenter,
  MedicalTest,
  HealthPackage,
  DiscountTransaction,
  BlogArticle,
  PartnerApplication,
  User,
  RepresentativeApplication,
  RepresentativeDistribution,
  JobCircular,
  SmsLog,
  SmsSettings,
  AuditLog,
  BannerSettings,
  SiteSettings,
  Testimonial,
  CustomRole,
  DynamicPageContent,
  CardDesignSettings,
  TeamMember,
  HeroBannerSettings
} from '../../types';
import { MedicalCardPrint, TIER_PRESETS } from '../MedicalCardPrint';
import { BANGLADESH_GEO_DATA } from '../../data/bangladeshGeo';

interface Props {
  user: User;
  onLogout: () => void;
  initialCards: MedicalCard[];
  initialCenters: DiagnosticCenter[];
  initialTests: MedicalTest[];
  initialPackages: HealthPackage[];
  initialTransactions: DiscountTransaction[];
  initialBlogs: BlogArticle[];
}

export const AdminDashboard: React.FC<Props> = ({
  user,
  onLogout,
  initialCards,
  initialCenters,
  initialTests,
  initialPackages,
  initialTransactions,
  initialBlogs
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'overview'
    | 'members'
    | 'cards'
    | 'centers'
    | 'partners'
    | 'tests'
    | 'packages'
    | 'discount-tracker'
    | 'reports'
    | 'cms'
    | 'hero-banner'
    | 'team'
    | 'roles'
    | 'reps'
    | 'bulk'
    | 'sms'
    | 'audit'
    | 'passwords'
  >('overview');

  // Hero Banner CMS State
  const [heroBannerSettings, setHeroBannerSettings] = useState<HeroBannerSettings>({
    badgeText: 'গোপালগঞ্জ জেলায় পাইলট প্রজেক্ট ফেজ ১ চালু',
    title: 'ডিজিটাল মেডিক্যাল কার্ডের মাধ্যমে',
    titleHighlight: 'স্বাস্থ্যসেবা ও ডায়াগনস্টিক খরচে সাশ্রয়',
    description: 'Digital Medi Bridge (DMB) হলো একটি আধুনিক Healthcare Network Platform। আমাদের ডিজিটাল মেডিক্যাল কার্ড ব্যবহার করে গোপালগঞ্জ সহ সারাদেশের পার্টনার ডায়াগনস্টিক সেন্টার ও হাসপাতাল থেকে পাচ্ছেন নির্ধারিত ৩০% বিশেষ ছাড়।',
    primaryBtnText: 'মেডিক্যাল কার্ডের আবেদন করুন',
    secondaryBtnText: 'কার্ড ভেরিফাই করুন',
    heroImage: '',
    stat1Value: '৩০% ছাড়',
    stat1Label: 'ডায়াগনস্টিক টেস্টে নিশ্চিত ছাড়',
    stat2Value: '১০,০০০+',
    stat2Label: 'নিবন্ধিত পরিবার',
    stat3Value: '১০০%',
    stat3Label: 'যাচাইকৃত পার্টনার ল্যাব'
  });
  const [heroBannerLoading, setHeroBannerLoading] = useState(false);

  // Team Management State
  const [teamMembersList, setTeamMembersList] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamCategoryFilter, setTeamCategoryFilter] = useState<'all' | 'management' | 'field'>('all');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [teamForm, setTeamForm] = useState({
    name: '',
    designation: '',
    category: 'management' as 'management' | 'field',
    image: '',
    education: '',
    locationServed: '',
    email: '',
    phone: '',
    linkedin: '',
    experience: '',
    bio: ''
  });
  const [teamToastMsg, setTeamToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Control State
  const [userPasswordList, setUserPasswordList] = useState<Array<{
    id: string;
    name: string;
    role: string;
    mobile: string;
    email: string;
    currentPassword: string;
    isDefault: boolean;
  }>>([]);
  const [passwordSearchTerm, setPasswordSearchTerm] = useState('');
  const [myPasswordForm, setMyPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setProfilePasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dashboard State
  const [cards, setCards] = useState<MedicalCard[]>(initialCards);
  const [centers, setCenters] = useState<DiagnosticCenter[]>(initialCenters);
  const [tests, setTests] = useState<MedicalTest[]>(initialTests);
  const [packages, setPackages] = useState<HealthPackage[]>(initialPackages);
  const [transactions, setTransactions] = useState<DiscountTransaction[]>(initialTransactions);
  const [blogs, setBlogs] = useState<BlogArticle[]>(initialBlogs);

  // Expanded Data States
  const [repApps, setRepApps] = useState<RepresentativeApplication[]>([]);
  const [repDistributions, setRepDistributions] = useState<RepresentativeDistribution[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Bulk Generator State
  const [bulkGenForm, setBulkGenForm] = useState({ startRange: '1001', endRange: '1050', cardTier: 'Silver' });
  const [bulkGenLoading, setBulkGenLoading] = useState(false);
  const [bulkGenProgressMsg, setBulkGenProgressMsg] = useState('');
  const [bulkGenSuccessMsg, setBulkGenSuccessMsg] = useState('');
  const [pdfDownloadProgressMsg, setPdfDownloadProgressMsg] = useState('');
  const [pdfTargetCount, setPdfTargetCount] = useState(0);

  // Rep Distribution Form State
  const [distForm, setDistForm] = useState({ repId: '', repName: '', repMobile: '', startSerialNum: '1001', endSerialNum: '1050' });

  // Custom SMS Form
  const [customSmsForm, setCustomSmsForm] = useState({ mobile: '', recipientName: '', messageText: '' });

  // SMS Gateway Config State
  const [smsSettings, setSmsSettings] = useState<SmsSettings>({
    apiKey: 'i71o7813NPx9vgASrBVu',
    senderId: 'DEHF',
    apiUrl: 'https://bulksmsbd.net/api/smsapi',
    enabled: true,
    templates: {
      appSubmitted: 'প্রিয় {name}, আপনার DMB মেডিক্যাল কার্ডের আবেদন সফলভাবে গ্রহণ করা হয়েছে (কার্ড নম্বর: {cardId})। আপনার মোবাইল নম্বর ({mobile}) দিয়ে পোর্টালে লগইন করতে পারবেন। বর্তমানে এটি অনুমোদনের অপেক্ষায় আছে। ধন্যবাদ।',
      appApproved: 'অভিনন্দন {name}! আপনার DMB মেডিক্যাল কার্ড ({cardId}) সফলভাবে অনুমোদিত ও অ্যাক্টিভ হয়েছে। পোর্টালে লগইন করে কার্ডটি ডাউনলোড/প্রিন্ট করতে পারবেন। ধন্যবাদ।',
      appRejected: 'প্রিয় {name}, আপনার DMB মেডিক্যাল কার্ডের আবেদনটি প্রয়োজনীয় তথ্যের অভাবে প্রত্যাখ্যাত (Rejected) হয়েছে। বিস্তারিত জানতে হেল্পলাইনে যোগাযোগ করুন: +8809658887470',
      repSubmitted: 'প্রিয় {name}, DMB ফিল্ড রিপ্রেজেন্টেটিভ পদে আপনার আবেদনটি সফলভাবে গ্রহণ করা হয়েছে। আবেদন আইডি: {repId}। পেপারস যাচাই শেষে আপনাকে এসএমএস দিয়ে জানানো হবে। ধন্যবাদ।',
      repApproved: 'অভিনন্দন {name}! DMB ফিল্ড রিপ্রেজেন্টেটিভ হিসেবে আপনার একাউন্ট অ্যাক্টিভ করা হয়েছে। ইউজার আইডি ও পাসওয়ার্ড হিসেবে মোবাইল নম্বর ({mobile}) ব্যবহার করে লগইন করুন।',
      repRejected: 'প্রিয় {name}, DMB প্রতিনিধি পদে আপনার আবেদনটি পেপারস যাচাই শেষে বাতিল করা হয়েছে। কারণ: {reason}। বিস্তারিত জানতে হেল্পলাইনে যোগাযোগ করুন: +8809658887470',
      otpTemplate: 'আপনার DMB মেডিক্যাল পোর্টালে লগইনের ওটিপি (OTP) কোড হলো: {otp}',
      customDefault: 'প্রিয় {name}, {message}'
    }
  });
  const [smsConfigLoading, setSmsConfigLoading] = useState(false);
  const [smsTestLoading, setSmsTestLoading] = useState(false);

  // Top Banner Notice Settings State
  const [bannerSettings, setBannerSettings] = useState<BannerSettings>({
    badgeText: 'PILOT PROJECT',
    noticeText: 'গোপালগঞ্জ, নড়াইল ও সিলেট জেলায় পাইলট প্রজেক্ট চালু রয়েছে! সিলভার, গোল্ড ও প্লাটিনাম মেম্বারশিপ কার্ডে ৩০% ছাড় পেতে আজই আবেদন করুন।',
    hotline: '+8809658887470',
    email: 'health@nit.bd',
    enabled: true,
    speed: 'normal'
  });
  const [bannerLoading, setBannerLoading] = useState(false);

  // Site Info & Logo Settings State (Requirement #9)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'ডিজিটাল হেলথ কার্ড প্লাটফর্ম',
    siteTagline: 'আপনার স্বাস্থ্য সুরক্ষা, আমাদের প্রতিশ্রুতি',
    logoUrl: '',
    phone: '01700000000',
    hotline: '+8809658887470',
    email: 'health@nit.bd',
    address: 'গোপালগঞ্জ সদর, গোপালগঞ্জ, বাংলাদেশ',
    dhakaOffice: 'ধানমণ্ডি, ঢাকা, বাংলাদেশ',
    gopalganjOffice: 'গোপালগঞ্জ সদর, গোপালগঞ্জ'
  });
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(false);

  // Card Design & Tier Colors State (Silver, Gold, Platinum)
  const [cardDesignSettings, setCardDesignSettings] = useState<CardDesignSettings>({
    headerTitle: 'DIGITAL MEDI BRIDGE',
    headerSubtitle: 'Healthcare Service Platform & Medical Network',
    logoText: 'DMB',
    logoUrl: '',
    slogan: 'স্মার্ট স্বাস্থ্য সেবায় আপনার নির্ভরযোগ্য ডিজিটাল হেলথ পার্টনার',
    helpline: '+8809658887470',
    websiteUrl: 'www.health.nit.bd',
    footerText: 'DMB Healthcare Network, Bangladesh',
    disclaimerText: '⚠️ এই কার্ডটি হস্তান্তরযোগ্য নয়। সেবার সময়ে মূল কার্ড ও ভেরিফিকেশন প্রযোজ্য।',
    silverTheme: {
      presetKey: 'classic_silver',
      badgeText: 'সিলভার কার্ড (Silver Card)'
    },
    goldTheme: {
      presetKey: 'royal_gold',
      badgeText: 'গোল্ড কার্ড (Gold Card)'
    },
    platinumTheme: {
      presetKey: 'royal_platinum',
      badgeText: 'প্লাটিনাম কার্ড (Platinum Card)'
    }
  });
  const [cardDesignLoading, setCardDesignLoading] = useState(false);
  const [cardDesignPreviewTier, setCardDesignPreviewTier] = useState<'Silver' | 'Gold' | 'Platinum'>('Silver');
  const [bulkTabMode, setBulkTabMode] = useState<'generator' | 'editor'>('generator');
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // Sample card details state for Card Design Editor live preview & editing
  const [sampleCardData, setSampleCardData] = useState({
    memberName: 'মোঃ আব্দুর রহমান (নমুনা কার্ড)',
    cardId: 'DMB-2026-1001',
    memberId: 'MEM-001',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    mobile: '01700000000',
    gender: 'Male',
    bloodGroup: 'B+',
    district: 'গোপালগঞ্জ',
    upazila: 'গোপালগঞ্জ সদর',
    address: '',
    nidOrBirthCert: '19951234567890',
    issueDate: '২০২৬-০১-১৫',
    expiryDate: '২০২৭-০১-১৪',
  });

  // Testimonials & Reviews Management State (Requirement #11)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Roles & Permissions Management State (Point #3)
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({
    roleName: '',
    description: '',
    permissions: {
      canApproveCards: true,
      canManagePrices: false,
      canSendSMS: true,
      canViewRevenue: false,
      canEditNotices: false,
      canManagePartners: false,
      canManageReps: true
    }
  });

  // Dynamic Pages Content Management State (Point #4)
  const [pageContent, setPageContent] = useState<DynamicPageContent | null>(null);
  const [newEventModal, setNewEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    category: 'Medical Camp'
  });

  // Job Circulars & Papers Verification Management States
  const [jobCirculars, setJobCirculars] = useState<JobCircular[]>([]);
  const [showCircularModal, setShowCircularModal] = useState(false);
  const [editingCircular, setEditingCircular] = useState<JobCircular | null>(null);
  const [circularForm, setCircularForm] = useState({
    title: '',
    position: 'উপজেলা ফিল্ড রিপ্রেজেন্টেটিভ',
    district: 'গোপালগঞ্জ',
    upazila: '',
    vacancyCount: 5,
    salaryAllowance: '১৫,০০০ - ২০,০০০ টাকা (সম্মানী + সেলস কমিশন)',
    educationRequirement: 'এইচএসসি / সমমান',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    requirementsStr: 'ন্যূনতম এইচএসসি পাশ বা সমমান\nস্থানী এলাকা সম্পর্কে ভালো ধারণা\nস্মার্টফোন ব্যবহারে প্রাথমিক জ্ঞান'
  });

  const [paperCheckModal, setPaperCheckModal] = useState<RepresentativeApplication | null>(null);
  const [paperVerificationState, setPaperVerificationState] = useState({
    photo: true,
    nid: true,
    certificate: true,
    cv: true
  });
  const [paperCheckNotes, setPaperCheckNotes] = useState('');
  const [docImagePreviewModal, setDocImagePreviewModal] = useState<{ title: string; url: string } | null>(null);
  const [repFilterCircular, setRepFilterCircular] = useState<string>('ALL');
  const [repFilterStatus, setRepFilterStatus] = useState<string>('ALL');

  // Search States
  const [memberSearch, setMemberSearch] = useState('');
  const [centerSearch, setCenterSearch] = useState('');
  const [testSearch, setTestSearch] = useState('');

  useEffect(() => {
    fetchAdminData();
    fetchUserPasswordList();
  }, []);

  const fetchUserPasswordList = async () => {
    try {
      const res = await fetch('/api/admin/users/passwords');
      if (res.ok) {
        const data = await res.json();
        setUserPasswordList(data);
      }
    } catch (e) {
      console.error('Error fetching password list', e);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [resMembers, resReps, resDists, resSms, resAudit, resSmsConfig, resBanner, resSite, resCardDesign, resTestimonials, resRoles, resContent, resCirculars, resTeam, resHero] = await Promise.all([
        fetchJsonSafe('/api/members', undefined, []),
        fetchJsonSafe('/api/representatives/applications', undefined, []),
        fetchJsonSafe('/api/representatives/distributions', undefined, []),
        fetchJsonSafe('/api/admin/sms-logs', undefined, []),
        fetchJsonSafe('/api/admin/audit-logs', undefined, []),
        fetchJsonSafe('/api/admin/sms-config', undefined, null),
        fetchJsonSafe('/api/banner-settings', undefined, null),
        fetchJsonSafe('/api/site-settings', undefined, null),
        fetchJsonSafe('/api/card-design-settings', undefined, null),
        fetchJsonSafe('/api/admin/testimonials', undefined, []),
        fetchJsonSafe('/api/roles', undefined, []),
        fetchJsonSafe('/api/page-content', undefined, null),
        fetchJsonSafe('/api/job-circulars', undefined, []),
        fetchJsonSafe('/api/team-members', undefined, []),
        fetchJsonSafe('/api/hero-banner', undefined, null)
      ]);
      if (Array.isArray(resMembers) && resMembers.length) setCards(resMembers);
      if (Array.isArray(resReps) && resReps.length) setRepApps(resReps);
      if (Array.isArray(resDists) && resDists.length) setRepDistributions(resDists);
      if (Array.isArray(resSms) && resSms.length) setSmsLogs(resSms);
      if (Array.isArray(resAudit) && resAudit.length) setAuditLogs(resAudit);
      if (resSmsConfig && resSmsConfig.apiKey) setSmsSettings(resSmsConfig);
      if (resBanner && resBanner.noticeText) setBannerSettings(resBanner);
      if (resSite && (resSite.hotline || resSite.siteName)) setSiteSettings(resSite);
      if (resCardDesign && resCardDesign.headerTitle) setCardDesignSettings(resCardDesign);
      if (Array.isArray(resTestimonials)) setTestimonials(resTestimonials);
      if (Array.isArray(resRoles)) setCustomRoles(resRoles);
      if (resContent) setPageContent(resContent);
      if (Array.isArray(resCirculars)) setJobCirculars(resCirculars);
      if (Array.isArray(resTeam) && resTeam.length) setTeamMembersList(resTeam);
      if (resHero && resHero.title) setHeroBannerSettings(resHero);
      fetchUserPasswordList();
    } catch (e) {
      console.error('Error fetching admin data', e);
    }
  };

  // Team Member Handler Functions
  const handleOpenAddTeamModal = () => {
    setEditingTeamMember(null);
    setTeamForm({
      name: '',
      designation: '',
      category: 'management',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      education: '',
      locationServed: '',
      email: '',
      phone: '',
      linkedin: '',
      experience: '',
      bio: ''
    });
    setIsTeamModalOpen(true);
  };

  const handleOpenEditTeamModal = (member: TeamMember) => {
    setEditingTeamMember(member);
    setTeamForm({
      name: member.name || '',
      designation: member.designation || '',
      category: member.category || 'management',
      image: member.image || '',
      education: member.education || '',
      locationServed: member.locationServed || '',
      email: member.email || '',
      phone: member.phone || '',
      linkedin: member.linkedin || '',
      experience: member.experience || '',
      bio: member.bio || ''
    });
    setIsTeamModalOpen(true);
  };

  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name.trim() || !teamForm.designation.trim()) {
      alert('সদস্যের নাম এবং পদবি প্রদান করা আবশ্যক!');
      return;
    }

    try {
      const url = editingTeamMember ? `/api/team-members/${editingTeamMember.id}` : '/api/team-members';
      const method = editingTeamMember ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm)
      });

      if (res.ok) {
        const savedItem = await res.json();
        if (editingTeamMember) {
          setTeamMembersList(prev => prev.map(m => m.id === savedItem.id ? savedItem : m));
          setTeamToastMsg({ type: 'success', text: 'টিম সদস্যের তথ্য সফলভাবে আপডেট করা হয়েছে!' });
        } else {
          setTeamMembersList(prev => [...prev, savedItem]);
          setTeamToastMsg({ type: 'success', text: 'নতুন টিম সদস্য সফলভাবে যোগ করা হয়েছে!' });
        }
        setIsTeamModalOpen(false);
        setTimeout(() => setTeamToastMsg(null), 4000);
      } else {
        alert('তথ্য সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      console.error('Error saving team member', err);
      alert('সার্ভার এরর 발생 হয়েছে।');
    }
  };

  const handleDeleteTeamMember = async (id: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}" কে টিম তালিকা থেকে মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/team-members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTeamMembersList(prev => prev.filter(m => m.id !== id));
        setTeamToastMsg({ type: 'success', text: `"${name}" কে তালিকা থেকে মুছে ফেলা হয়েছে।` });
        setTimeout(() => setTeamToastMsg(null), 4000);
      }
    } catch (err) {
      console.error('Error deleting team member', err);
      alert('মুছে ফেলার সময়ে ত্রুটি ঘটেছে।');
    }
  };

  const handleSaveCardDesignSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardDesignLoading(true);
    try {
      const res = await fetch('/api/card-design-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardDesignSettings)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'কার্ডের রঙ, লোগো, স্লোগান ও ডিজাইন সফলভাবে আপডেট করা হয়েছে!');
      } else {
        alert(data.error || 'সেটিংস সেভ ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার সংযোগে ত্রুটি।');
    } finally {
      setCardDesignLoading(false);
    }
  };

  const handleDownloadBulkPDF = async () => {
    const unassignedCards = cards.filter(c => (c.status || '').toUpperCase() === 'UNASSIGNED');
    if (unassignedCards.length === 0) {
      alert('ডাউনলোড করার মতো কোনো আন-অ্যাসাইনড বাল্ক কার্ড পাওয়া যায়নি। অনুগ্রহ করে প্রথমে কার্ড জেনারেট করুন।');
      return;
    }

    const printContainer = document.getElementById('bulk-cards-pdf-export-container');
    if (!printContainer) {
      alert('পিডিএফ রেন্ডার কন্টেইনার পাওয়া যায়নি।');
      return;
    }

    setPdfDownloading(true);
    setPdfTargetCount(unassignedCards.length);
    setPdfDownloadProgressMsg(`মোট ${unassignedCards.length}টি আন-অ্যাসাইনড কার্ডের লেআউট প্রসেস করা হচ্ছে...`);

    try {
      // Temporarily display container at fixed top left position
      printContainer.style.display = 'block';
      printContainer.style.visibility = 'visible';
      printContainer.style.position = 'fixed';
      printContainer.style.top = '0px';
      printContainer.style.left = '0px';
      printContainer.style.zIndex = '999999';
      printContainer.style.backgroundColor = '#f1f5f9';
      printContainer.classList.remove('hidden');

      // Wait 400ms for images and DOM layouts to stabilize
      await new Promise(resolve => setTimeout(resolve, 400));

      const pageBlocks = Array.from(printContainer.querySelectorAll('.pdf-page-block')) as HTMLElement[];
      if (pageBlocks.length === 0) {
        throw new Error('কোনো পেজ ব্লক পাওয়া যায়নি।');
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;

      for (let pageIdx = 0; pageIdx < pageBlocks.length; pageIdx++) {
        const pageEl = pageBlocks[pageIdx];
        setPdfDownloadProgressMsg(`পেজ ${pageIdx + 1} / ${pageBlocks.length} হাই-রেজোলিউশন ক্যানভাস রেন্ডার করা হচ্ছে...`);

        const pageCanvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 800,
          windowHeight: 1131,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            const exportContainer = clonedDoc.getElementById('bulk-cards-pdf-export-container');
            if (exportContainer) {
              exportContainer.style.display = 'block';
              exportContainer.style.visibility = 'visible';
              exportContainer.classList.remove('hidden');
            }

            const clonedBlocks = Array.from(clonedDoc.querySelectorAll('.pdf-page-block')) as HTMLElement[];
            if (clonedBlocks[pageIdx]) {
              const el = clonedBlocks[pageIdx];
              el.style.display = 'flex';
              el.style.visibility = 'visible';
              el.style.width = '800px';
              el.style.height = '1131px';
            }
          }
        });

        if (pageIdx > 0) {
          pdf.addPage();
        }

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      setPdfDownloadProgressMsg(`পিডিএফ ফাইল জেনারেট হচ্ছে...`);
      await new Promise(resolve => setTimeout(resolve, 100));

      const fileName = `DMB_Bulk_Cards_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
      setBulkGenSuccessMsg(`✅ ${unassignedCards.length}টি আন-অ্যাসাইনড কার্ডের পিডিএফ ফাইল সফলভাবে ডাউনলোড হয়েছে (${fileName})!`);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      alert('পিডিএফ ফাইল তৈরিতে সমস্যা হয়েছে: ' + (err?.message || 'Unknown Error'));
    } finally {
      printContainer.style.display = 'none';
      printContainer.style.visibility = 'hidden';
      printContainer.classList.add('hidden');
      setPdfDownloading(false);
      setPdfDownloadProgressMsg('');
    }
  };

  const handleApproveTestimonial = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'রিভিউ অনুমোদন করা হয়েছে!');
        fetchAdminData();
      } else {
        alert(data.error || 'অনুমোদন ব্যর্থ হয়েছে');
      }
    } catch (e) {
      alert('সার্ভার এরর');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('আপনি কি এই রিভিউটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'রিভিউ মুছে ফেলা হয়েছে!');
        fetchAdminData();
      } else {
        alert(data.error || 'মুছে ফেলা ব্যর্থ হয়েছে');
      }
    } catch (e) {
      alert('সার্ভার এরর');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.roleName) return alert('রোলের নাম প্রদান করুন');
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'নতুন রোল তৈরি হয়েছে!');
        setRoleModalOpen(false);
        setRoleForm({
          roleName: '',
          description: '',
          permissions: {
            canApproveCards: true,
            canManagePrices: false,
            canSendSMS: true,
            canViewRevenue: false,
            canEditNotices: false,
            canManagePartners: false,
            canManageReps: true
          }
        });
        fetchAdminData();
      } else {
        alert(data.error || 'রোল তৈরি ব্যর্থ হয়েছে');
      }
    } catch (e) {
      alert('সার্ভার এরর');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('আপনি কি এই কাস্টম রোলটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/roles/${roleId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('রোল মোছা হয়েছে');
        fetchAdminData();
      }
    } catch (e) {
      alert('সার্ভার এরর');
    }
  };

  const handleSavePageContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageContent) return;
    try {
      const res = await fetch('/api/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageContent)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'পেজ কনটেন্ট সফলভাবে আপডেট হয়েছে!');
        fetchAdminData();
      } else {
        alert(data.error || 'আপডেট ব্যর্থ হয়েছে');
      }
    } catch (e) {
      alert('সার্ভার এরর');
    }
  };

  const handleAddEventToGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.imageUrl) return alert('ইভেন্টের শিরোনাম ও ছবি লিংক দিন');
    if (!pageContent) return;
    const newEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      ...eventForm
    };
    const updatedContent = {
      ...pageContent,
      eventGallery: [newEvent, ...(pageContent.eventGallery || [])]
    };
    setPageContent(updatedContent);
    setNewEventModal(false);
    setEventForm({ title: '', location: '', date: new Date().toISOString().split('T')[0], imageUrl: '', category: 'Medical Camp' });
    try {
      await fetch('/api/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContent)
      });
      alert('নতুন ইভেন্ট গ্যালারিতে যোগ করা হয়েছে!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiteSettingsLoading(true);
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'সাইটের ফোন, ইমেইল, ঠিকানা ও লোগো সেটিংস সফলভাবে সেভ করা হয়েছে!');
      } else {
        alert(data.error || 'সেটিংস সেভ করতে সমস্যা হয়েছে।');
      }
    } catch (e) {
      alert('সার্ভার এরর');
    } finally {
      setSiteSettingsLoading(false);
    }
  };

  const handleSaveBannerSettings = async () => {
    setBannerLoading(true);
    try {
      const res = await fetch('/api/banner-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerSettings)
      });
      const data = await res.json();
      if (res.ok) {
        alert('হেডার নোটিশ স্ক্রল ও ব্যানার সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!');
      } else {
        alert('সংরক্ষণ করতে সমস্যা হয়েছে: ' + (data.error || 'Unknown error'));
      }
    } catch (e: any) {
      alert('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setBannerLoading(false);
    }
  };

  const handleSaveHeroBannerSettings = async () => {
    setHeroBannerLoading(true);
    try {
      const res = await fetch('/api/hero-banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroBannerSettings)
      });
      const data = await res.json();
      if (res.ok) {
        alert('হিরো ব্যানারের লেখা ও ছবি সফলভাবে সংরক্ষণ করা হয়েছে!');
      } else {
        alert('সংরক্ষণ করতে সমস্যা হয়েছে: ' + (data.error || 'Unknown error'));
      }
    } catch (e: any) {
      alert('নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setHeroBannerLoading(false);
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('ছবিটির সাইজ ৫ মেগাবাইটের বেশি। অনুগ্রহ করে ছোট সাইজের ছবি আপলোড করুন।');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setHeroBannerSettings(prev => ({ ...prev, heroImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleResetUserPassword = async (targetUserIdentifier: string, newPassword: string) => {
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserIdentifier, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
        fetchUserPasswordList();
      } else {
        alert(data.error || 'পাসওয়ার্ড আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      alert('সার্ভার সংযোগে ত্রুটি 발생');
    }
  };

  const handleChangeMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myPasswordForm.newPassword !== myPasswordForm.confirmPassword) {
      setProfilePasswordMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড দুটি মেলেনি!' });
      return;
    }
    if (myPasswordForm.newPassword.length < 4) {
      setProfilePasswordMsg({ type: 'error', text: 'পাসওয়ার্ড অত্যন্ত সংক্ষিপ্ত! কমপক্ষে ৪ অক্ষর হতে হবে।' });
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: user.email || user.mobile,
          oldPassword: myPasswordForm.oldPassword,
          newPassword: myPasswordForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProfilePasswordMsg({ type: 'success', text: data.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
        setMyPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        fetchUserPasswordList();
      } else {
        setProfilePasswordMsg({ type: 'error', text: data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' });
      }
    } catch (e) {
      setProfilePasswordMsg({ type: 'error', text: 'সার্ভার সংযোগ ত্রুটি।' });
    }
  };

  // Print Card Modal
  const [selectedPrintCard, setSelectedPrintCard] = useState<MedicalCard | null>(null);

  // Modals Toggle
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddCenterModal, setShowAddCenterModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);

  // Profile View & Edit Modals State
  const [viewMemberModal, setViewMemberModal] = useState<MedicalCard | null>(null);
  const [editMemberModal, setEditMemberModal] = useState<MedicalCard | null>(null);

  const [viewRepModal, setViewRepModal] = useState<RepresentativeApplication | null>(null);
  const [editRepModal, setEditRepModal] = useState<RepresentativeApplication | null>(null);

  const [viewCenterModal, setViewCenterModal] = useState<DiagnosticCenter | null>(null);
  const [editCenterModal, setEditCenterModal] = useState<DiagnosticCenter | null>(null);

  const [editTestModal, setEditTestModal] = useState<MedicalTest | null>(null);
  const [editPackageModal, setEditPackageModal] = useState<HealthPackage | null>(null);

  // Forms State
  const [newMember, setNewMember] = useState({
    memberName: '',
    customCardId: '', // Pre-printed physical card number
    cardTier: 'Silver' as 'Silver' | 'Gold' | 'Platinum',
    mobile: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: 'O+',
    district: 'Gopalganj',
    upazila: 'Gopalganj Sadar',
    address: '',
    nidOrBirthCert: '19951234567890'
  });

  const [newCenter, setNewCenter] = useState({
    name: '',
    code: 'DMB-LAB-10',
    division: 'Dhaka',
    district: 'Gopalganj',
    upazila: 'Gopalganj Sadar',
    address: '',
    mobile: '01700000000',
    discountPercentage: 30,
    servicesStr: 'Pathology, Digital X-Ray, Ultrasonography'
  });

  const [newTest, setNewTest] = useState({ name: '', category: 'Biochemistry', regularPrice: 1000, dmbPrice: 700 });

  const [newPkg, setNewPkg] = useState({
    title: '',
    category: 'Basic' as 'Basic' | 'Diabetes' | 'Women' | 'Senior' | 'Executive',
    regularPrice: 3000,
    dmbPrice: 2000,
    testsStr: 'CBC, Blood Sugar, ECG, Lipid Profile',
    recommendedFor: 'সকল বয়সের নাগরিকদের জন্য'
  });

  // Redemption Txn State
  const [newTxn, setNewTxn] = useState({
    cardId: 'DMB-2026-1001',
    centerId: centers[0]?.id || 'DC-001',
    testNames: 'CBC, Lipid Profile',
    originalAmount: 1800,
    discountAmount: 600
  });

  // Calculate High-level Dashboard Metrics
  const totalMembers = cards.length;
  const activeCardsCount = cards.filter(c => c.status === 'ACTIVE').length;
  const totalPartnersCount = centers.length;
  const totalDiscountSavedBDT = transactions.reduce((sum, t) => sum + t.discountAmount, 0);
  const totalCommissionBDT = transactions.reduce((sum, t) => sum + t.dmbCommission, 0);

  // Toggle Card Status (Active / Suspended)
  const toggleCardStatus = (cardId: string) => {
    setCards(prev => prev.map(c => {
      if (c.cardId === cardId) {
        return { ...c, status: c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return c;
    }));
  };

  // Member Edit & Delete Handlers
  const handleSaveEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMemberModal) return;
    try {
      const res = await fetch(`/api/members/${editMemberModal.cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMemberModal)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'সদস্যের তথ্য সফলভাবে আপডেট করা হয়েছে!');
        setCards(prev => prev.map(c => c.cardId === editMemberModal.cardId ? editMemberModal : c));
        setEditMemberModal(null);
      } else {
        alert(data.error || 'আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার এরর');
    }
  };

  const handleDeleteMember = async (cardId: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে আপনি ${name} (${cardId})-এর প্রোফাইল মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/members/${cardId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'সদস্যের প্রোফাইল মুছে ফেলা হয়েছে।');
        setCards(prev => prev.filter(c => c.cardId !== cardId));
        if (viewMemberModal?.cardId === cardId) setViewMemberModal(null);
      } else {
        alert(data.error || 'মুছে ফেলতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার এরর');
    }
  };

  // Representative Edit & Delete Handlers
  const handleSaveEditRep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRepModal) return;
    try {
      const res = await fetch(`/api/representatives/applications/${editRepModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editRepModal)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'প্রতিনিধির তথ্য সফলভাবে আপডেট করা হয়েছে!');
        setRepApps(prev => prev.map(r => r.id === editRepModal.id ? editRepModal : r));
        setEditRepModal(null);
      } else {
        alert(data.error || 'আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার এরর');
    }
  };

  const handleDeleteRep = async (id: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে আপনি প্রতিনিধি ${name}-এর প্রোফাইল মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/representatives/applications/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'প্রতিনিধির প্রোফাইল মুছে ফেলা হয়েছে।');
        setRepApps(prev => prev.filter(r => r.id !== id));
        if (viewRepModal?.id === id) setViewRepModal(null);
      } else {
        alert(data.error || 'মুছে ফেলতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার এরর');
    }
  };

  // Diagnostic Center Edit & Delete Handlers
  const handleSaveEditCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCenterModal) return;
    try {
      const res = await fetch(`/api/diagnostic-centers/${editCenterModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCenterModal)
      });
      const data = await res.json();
      if (res.ok) {
        alert('পার্টনার সেন্টারের তথ্য সফলভাবে আপডেট করা হয়েছে!');
        setCenters(prev => prev.map(c => c.id === editCenterModal.id ? (data.name ? data : editCenterModal) : c));
        setEditCenterModal(null);
      } else {
        alert(data.error || 'আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার এরর');
    }
  };

  const handleDeleteCenterConfirmed = async (centerId: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে আপনি ${name} মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/diagnostic-centers/${centerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'পার্টনার সেন্টার মুছে ফেলা হয়েছে।');
        setCenters(prev => prev.filter(c => c.id !== centerId));
        if (viewCenterModal?.id === centerId) setViewCenterModal(null);
      } else {
        alert(data.error || 'মুছে ফেলতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার এরর');
    }
  };

  // Delete & Edit Test
  const handleDeleteTest = (testId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই টেস্ট প্রাইস রেকর্ডটি মুছে ফেলতে চান?')) return;
    setTests(prev => prev.filter(t => t.id !== testId));
  };

  const handleSaveEditTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTestModal) return;
    const savings = Math.max(0, editTestModal.regularPrice - editTestModal.dmbPrice);
    const updated = { ...editTestModal, savings };
    setTests(prev => prev.map(t => t.id === updated.id ? updated : t));
    setEditTestModal(null);
    alert('টেস্ট মূল্য তালিকা সফলভাবে আপডেট করা হয়েছে!');
  };

  // Delete & Edit Package
  const handleDeletePackage = (pkgId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই প্যাকেজটি ডিলিট করতে চান?')) return;
    setPackages(prev => prev.filter(p => p.id !== pkgId));
  };

  const handleSaveEditPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPackageModal) return;
    setPackages(prev => prev.map(p => p.id === editPackageModal.id ? editPackageModal : p));
    setEditPackageModal(null);
    alert('হেলথ প্যাকেজ বিবরণ সফলভাবে আপডেট করা হয়েছে!');
  };

  // Card Approval Handler (Rule 1 & 11)
  const handleApproveCard = async (cardId: string) => {
    try {
      const res = await fetch(`/api/members/${cardId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'কার্ড অনুমোদন সম্পন্ন হয়েছে!');
        fetchAdminData();
      } else {
        alert(data.error || 'অনুমোদন ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      alert('সার্ভার এরর');
    }
  };

  // Card Rejection Handler
  const handleRejectCard = async (cardId: string) => {
    if (!confirm('আপনি কি এই আবেদনটি প্রত্যাখ্যান করতে চান?')) return;
    try {
      const res = await fetch(`/api/members/${cardId}/reject`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'আবেদন বাতিল করা হয়েছে।');
        fetchAdminData();
      }
    } catch (e) {
      alert('সার্ভার এরর');
    }
  };

  // Job Circular Handlers
  const handleSaveCircularSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: circularForm.title,
        position: circularForm.position,
        district: circularForm.district,
        upazila: circularForm.upazila,
        vacancyCount: Number(circularForm.vacancyCount),
        salaryAllowance: circularForm.salaryAllowance,
        educationRequirement: circularForm.educationRequirement,
        deadline: circularForm.deadline,
        description: circularForm.description,
        requirements: circularForm.requirementsStr.split('\n').filter(r => r.trim().length > 0)
      };

      const url = editingCircular ? `/api/job-circulars/${editingCircular.id}` : '/api/job-circulars';
      const method = editingCircular ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'নিয়োগ বিজ্ঞপ্তি সফলভাবে সংরক্ষিত হয়েছে!');
        setShowCircularModal(false);
        setEditingCircular(null);
        fetchAdminData();
      } else {
        alert(data.error || 'সার্কুলার সংরক্ষণে ত্রুটি হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার এরর');
    }
  };

  const handleDeleteCircular = async (id: string, title: string) => {
    if (!confirm(`আপনি কি "${title}" পোস্টটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/job-circulars/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        alert('বিজ্ঞপ্তিটি সফলভাবে মুছে ফেলা হয়েছে।');
        fetchAdminData();
      }
    } catch (err) {
      alert('সার্ভার এরর');
    }
  };

  const handleToggleCircularStatus = async (circular: JobCircular) => {
    const newStatus = circular.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const res = await fetch(`/api/job-circulars/${circular.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      alert('সার্ভার এরর');
    }
  };

  // Paper Check & Verification Handlers
  const handleApprovePaperCheck = async () => {
    if (!paperCheckModal) return;
    try {
      const res = await fetch(`/api/representatives/applications/${paperCheckModal.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNotes: paperCheckNotes || 'এনআইডি, ছবি ও সকল কাগজপত্র সফলভাবে যাচাই করা হয়েছে।',
          dailyTarget: paperCheckModal.dailyTarget,
          weeklyTarget: paperCheckModal.weeklyTarget,
          monthlyTarget: paperCheckModal.monthlyTarget
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'প্রতিনিধির কাগজপত্র যাচাই সম্পন্ন এবং অ্যাকাউন্ট অনুমোদন করা হয়েছে!');
        setPaperCheckModal(null);
        setPaperCheckNotes('');
        fetchAdminData();
      } else {
        alert(data.error || 'অনুমোদন করা সম্ভব হয়নি।');
      }
    } catch (err) {
      alert('সার্ভার এরর');
    }
  };

  const handleRejectPaperCheck = async () => {
    if (!paperCheckModal) return;
    try {
      const res = await fetch(`/api/representatives/applications/${paperCheckModal.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: paperCheckNotes || 'কাগজপত্রে অসংগতি থাকায় বা প্রয়োজনীয় এনআইডি/সনদপত্রের অভাবে বাতিল করা হয়েছে।' })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'আবেদনটি প্রত্যাখ্যান করা হয়েছে।');
        setPaperCheckModal(null);
        setPaperCheckNotes('');
        fetchAdminData();
      } else {
        alert(data.error || 'প্রত্যাখ্যান করা সম্ভব হয়নি।');
      }
    } catch (err) {
      alert('সার্ভার এরর');
    }
  };

  // Representative Approval Handler (Rule 4 & 5)
  const handleApproveRepApp = async (id: string) => {
    try {
      const res = await fetch(`/api/representatives/applications/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'প্রতিনিধি অ্যাকাউন্ট অনুমোদন করা হয়েছে!');
        fetchAdminData();
      }
    } catch (e) {
      alert('সার্ভার এরর');
    }
  };

  // Card Distribution Handler (Rule 8)
  const handleDistributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/representatives/distribute-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(distForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'সিরিয়াল রেঞ্জ সফলভাবে বরাদ্দ করা হয়েছে!');
        setDistForm({ repId: '', repName: '', repMobile: '', startSerialNum: '1001', endSerialNum: '1050' });
        fetchAdminData();
      } else {
        alert(data.error || 'বিতরণ ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      alert('সার্ভার এরর');
    }
  };

  // Bulk Card Generator Handler (Rule 9 & 10)
  const handleBulkGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startNum = parseInt(bulkGenForm.startRange, 10);
    const endNum = parseInt(bulkGenForm.endRange, 10);

    if (isNaN(startNum) || isNaN(endNum) || startNum <= 0 || endNum < startNum) {
      alert('সঠিক শুরু ও শেষ সিরিয়াল নম্বর প্রদান করুন (যেমন: 1001 থেকে 1020)।');
      return;
    }

    const countToGenerate = endNum - startNum + 1;
    setBulkGenLoading(true);
    setBulkGenSuccessMsg('');
    setBulkGenProgressMsg(`মোট ${countToGenerate}টি কার্ড সিকুয়েন্স প্রসেসিং ও কিউআর কোড জেনারেশন চলছে (DMB-2026-${startNum} থেকে DMB-2026-${endNum})...`);

    try {
      const res = await fetch('/api/admin/cards/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkGenForm)
      });
      const data = await res.json();
      if (res.ok) {
        if (data.generatedCards && Array.isArray(data.generatedCards) && data.generatedCards.length > 0) {
          setCards(prev => {
            const existingIds = new Set(prev.map(c => c.cardId));
            const newCards = data.generatedCards.filter((c: any) => !existingIds.has(c.cardId));
            return [...newCards, ...prev];
          });
        }
        
        const successText = `✅ সফলভাবে ${data.count || countToGenerate}টি বাল্ক আন-অ্যাসাইনড মেডিক্যাল কার্ড জেনারেট করা হয়েছে! (কার্ড আইডি: DMB-2026-${data.start || startNum} থেকে DMB-2026-${data.end || endNum})`;
        setBulkGenSuccessMsg(successText);

        // Auto advance startRange and endRange for convenience
        const nextStart = endNum + 1;
        const nextEnd = endNum + countToGenerate;
        setBulkGenForm(prev => ({
          ...prev,
          startRange: String(nextStart),
          endRange: String(nextEnd)
        }));

        fetchAdminData();

        // Smooth scroll to table
        setTimeout(() => {
          const cardsTableEl = document.getElementById('generated-bulk-cards-section');
          if (cardsTableEl) {
            cardsTableEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      } else {
        alert(data.error || 'বাল্ক জেনারেশন ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      alert('সার্ভার সংযোগে ত্রুটি বা নেটওয়ার্ক সমস্যা ঘটেছে।');
    } finally {
      setBulkGenLoading(false);
      setBulkGenProgressMsg('');
    }
  };

  // Send Custom SMS Handler (Rule 11)
  const handleSendCustomSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customSmsForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert('SMS সফলভাবে পাঠানো হয়েছে!');
        setCustomSmsForm({ mobile: '', recipientName: '', messageText: '' });
        fetchAdminData();
      } else {
        alert(data.error || 'SMS পাঠানো ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      alert('সার্ভার এরর');
    }
  };

  // Save SMS Configuration & Templates Handler
  const handleSaveSmsConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsConfigLoading(true);
    try {
      const res = await fetch('/api/admin/sms-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smsSettings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || 'এসএমএস কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!');
        if (data.config) setSmsSettings(data.config);
        fetchAdminData();
      } else {
        alert(data.error || 'এসএমএস সেটিংস আপডেট করতে সমস্যা হয়েছে।');
      }
    } catch (e) {
      alert('সার্ভারের সাথে যোগাযোগ করা সম্ভব হয়নি।');
    } finally {
      setSmsConfigLoading(false);
    }
  };

  // Test SMS Connection
  const handleTestSmsConnection = async () => {
    const targetMobile = prompt('যে মোবাইল নম্বরে টেস্ট এসএমএস পাঠাতে চান:', customSmsForm.mobile || '01700000000');
    if (!targetMobile) return;
    setSmsTestLoading(true);
    try {
      const res = await fetch('/api/admin/sms-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: targetMobile, recipientName: 'টেস্ট অ্যাডমিন' })
      });
      const data = await res.json();
      if (data.success) {
        alert('এসএমএস গেটওয়ে কানেকশন টেস্ট সফল হয়েছে!\nরেসপন্স: ' + JSON.stringify(data.apiResponse || 'DELIVERED'));
        fetchAdminData();
      } else {
        alert('এসএমএস টেস্ট ব্যর্থ হয়েছে!\nএরর বিবরণ: ' + (data.errorMessage || data.apiResponse || 'অজানা ত্রুটি'));
      }
    } catch (e) {
      alert('নেটওয়ার্ক এরর 발생');
    } finally {
      setSmsTestLoading(false);
    }
  };

  // Handle Add Member
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/members/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      const data = await res.json();
      if (data.card) {
        setCards([data.card, ...cards]);
        setShowAddMemberModal(false);
        alert(`নতুন সদস্য ${data.card.memberName} (${data.card.cardTier} Card) সফলভাবে নিবন্ধিত হয়েছে!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Add Center
  const handleAddCenterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newCenter.name,
        code: newCenter.code || `DC-${newCenter.district.slice(0, 3).toUpperCase()}-${centers.length + 1}`,
        division: newCenter.division,
        district: newCenter.district,
        upazila: newCenter.upazila,
        address: newCenter.address,
        mobile: newCenter.mobile,
        discountPercentage: Number(newCenter.discountPercentage),
        availableServices: newCenter.servicesStr ? newCenter.servicesStr.split(',').map(s => s.trim()).filter(Boolean) : ['Pathology', 'General Health'],
        featured: true,
        status: 'ACTIVE'
      };

      const res = await fetch('/api/diagnostic-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdCenter = await res.json();
        setCenters(prev => [createdCenter, ...prev]);
        setShowAddCenterModal(false);
        setNewCenter({
          name: '',
          code: 'DMB-LAB-10',
          division: 'Dhaka',
          district: 'Gopalganj',
          upazila: 'Gopalganj Sadar',
          address: '',
          mobile: '01700000000',
          discountPercentage: 30,
          servicesStr: 'Pathology, Digital X-Ray, Ultrasonography'
        });
        alert('নতুন পার্টনার সেন্টার সফলভাবে যুক্ত করা হয়েছে!');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'নতুন পার্টনার সেন্টার যুক্ত করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error('Error adding center:', err);
      alert('সার্ভার এরর 발생');
    }
  };

  // Handle Add Test
  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const savings = Math.max(0, newTest.regularPrice - newTest.dmbPrice);
    const created: MedicalTest = {
      id: `T-${tests.length + 10}`,
      name: newTest.name,
      category: newTest.category,
      regularPrice: Number(newTest.regularPrice),
      dmbPrice: Number(newTest.dmbPrice),
      savings,
      popular: true
    };
    setTests([created, ...tests]);
    setShowTestModal(false);
    setNewTest({ name: '', category: 'Biochemistry', regularPrice: 1000, dmbPrice: 700 });
  };

  // Handle Add Package
  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    const created: HealthPackage = {
      id: `PKG-${packages.length + 10}`,
      title: newPkg.title,
      description: `প্রস্তাবিত: ${newPkg.recommendedFor}`,
      category: newPkg.category,
      regularPrice: Number(newPkg.regularPrice),
      dmbPrice: Number(newPkg.dmbPrice),
      includedTests: newPkg.testsStr.split(',').map(s => s.trim()),
      recommendedFor: newPkg.recommendedFor,
      popular: true
    };
    setPackages([created, ...packages]);
    setShowPackageModal(false);
    alert('নতুন হেলথ প্যাকেজ সফলভাবে যুক্ত করা হয়েছে!');
  };

  // Handle New Transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCenter = centers.find(c => c.id === newTxn.centerId);
    const cardMember = cards.find(c => c.cardId === newTxn.cardId);
    const paid = Math.max(0, newTxn.originalAmount - newTxn.discountAmount);
    const comm = Math.round(newTxn.discountAmount * 0.1); // 10% commission

    const created: DiscountTransaction = {
      id: `TXN-${transactions.length + 500}`,
      cardId: newTxn.cardId,
      memberName: cardMember ? cardMember.memberName : 'সম্মানিত কার্ডধারী',
      centerId: newTxn.centerId,
      centerName: selectedCenter ? selectedCenter.name : 'পার্টনার ডায়াগনস্টিক',
      testNames: newTxn.testNames.split(','),
      originalAmount: Number(newTxn.originalAmount),
      discountAmount: Number(newTxn.discountAmount),
      paidAmount: paid,
      dmbCommission: comm,
      date: new Date().toISOString().split('T')[0],
      receiptNo: `RCP-2026-${transactions.length + 800}`,
      status: 'COMPLETED'
    };

    setTransactions([created, ...transactions]);
    alert('নতুন ডিসকাউন্ট লেনদেন সফলভাবে এন্ট্রি করা হয়েছে!');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      
      {/* MOBILE TOPBAR NAV */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 text-white font-extrabold flex items-center justify-center text-xs">
            DMB
          </div>
          <span className="font-bold text-sm">DMB Admin Dashboard</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 p-5 space-y-6 z-30`}>
        <div className="hidden md:flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white font-extrabold flex items-center justify-center text-sm shadow">
              DMB
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">DMB Admin Panel</h2>
              <p className="text-[10px] text-emerald-400 font-mono">National Expansion Phase</p>
            </div>
          </div>
        </div>

        {/* User Badge */}
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">{user.name}</span>
            <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded uppercase font-mono">
              {user.role}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">{user.email || user.mobile}</p>
        </div>

        {/* Nav Items */}
        <nav className="space-y-1 text-xs font-medium">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'members', label: 'Member Applications & Cards', icon: <Users className="w-4 h-4" /> },
            { id: 'reps', label: 'Field Representatives', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'bulk', label: 'Bulk Card Generator', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'sms', label: 'SMS Notifications', icon: <Bell className="w-4 h-4" /> },
            { id: 'passwords', label: 'পাসওয়ার্ড পরিবর্তন ও রিসেট', icon: <Key className="w-4 h-4 text-amber-400" /> },
            { id: 'audit', label: 'System Audit Logs', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'centers', label: 'Diagnostic Partners', icon: <Building2 className="w-4 h-4" /> },
            { id: 'tests', label: 'Test Price Manager', icon: <FileText className="w-4 h-4" /> },
            { id: 'packages', label: 'Health Packages', icon: <ListOrdered className="w-4 h-4" /> },
            { id: 'discount-tracker', label: 'Discount Tracking', icon: <Percent className="w-4 h-4" /> },
            { id: 'reports', label: 'Reports & Revenue', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'cms', label: 'Notices & CMS', icon: <Bell className="w-4 h-4" /> },
            { id: 'hero-banner', label: 'হিরো ব্যানার ও টেক্সট (Hero Banner)', icon: <Sparkles className="w-4 h-4 text-amber-300" /> },
            { id: 'team', label: 'টিম সদস্য ও কর্মকর্তা (Team)', icon: <Users className="w-4 h-4 text-emerald-400" /> },
            { id: 'roles', label: 'Role Permissions', icon: <Settings className="w-4 h-4" /> }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSubTab(item.id as any);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between cursor-pointer ${
                activeSubTab === item.id
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> লগআউট করুন
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* SUBTAB 1: OVERVIEW */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">জাতীয় ডিজিটাল হেলথ নেটওয়ার্ক এডমিন</h1>
                <p className="text-xs text-slate-500">ডিজিটাল মিডিয়া ব্রিজ রিয়েল-টাইম কন্ট্রোল প্যানেল</p>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> All Bangladesh Active
              </span>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">মোট সদস্য (Members)</span>
                  <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600"><Users className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 font-mono">{totalMembers}</p>
                <p className="text-[11px] text-emerald-600 font-semibold">সিলভার, গোল্ড ও প্লাটিনাম</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">সক্রিয় কার্ড (Active Cards)</span>
                  <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600"><CreditCard className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 font-mono">{activeCardsCount}</p>
                <p className="text-[11px] text-emerald-600 font-semibold">১০০% ভেরিফাইড কিউআর</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">পার্টনার সেন্টার</span>
                  <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600"><Building2 className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 font-mono">{totalPartnersCount}</p>
                <p className="text-[11px] text-amber-600 font-semibold">বিভাগীয় ডায়াগনস্টিক ল্যাব</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">মোট সাশ্রয় (Saved ৳)</span>
                  <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600"><TrendingUp className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-extrabold text-emerald-700 font-mono">৳{totalDiscountSavedBDT}</p>
                <p className="text-[11px] text-slate-500 font-medium">গ্রাহকদের প্রত্যক্ষ ডিসকাউন্ট</p>
              </div>

            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">সর্বশেষ ডিসকাউন্ট লেনদেন বিবরণী</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-3">রশিদ নং</th>
                      <th className="p-3">সদস্য ও কার্ড আইডি</th>
                      <th className="p-3">পার্টনার সেন্টার</th>
                      <th className="p-3 text-right">মূল বিল</th>
                      <th className="p-3 text-right">ডিসকাউন্ট (৳)</th>
                      <th className="p-3 text-right">পরিশোধিত</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {transactions.map(t => (
                      <tr key={t.id}>
                        <td className="p-3 font-mono font-bold text-sky-700">{t.receiptNo}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{t.memberName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{t.cardId}</p>
                        </td>
                        <td className="p-3 text-slate-700">{t.centerName}</td>
                        <td className="p-3 text-right font-mono text-slate-400">৳{t.originalAmount}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">৳{t.discountAmount}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">৳{t.paidAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 2: MEMBERS MANAGEMENT */}
        {activeSubTab === 'members' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">সদস্য ও মেডিক্যাল কার্ড হোল্ডারগণ</h1>
                <p className="text-xs text-slate-500">নিবন্ধিত সকল সদস্যের তথ্য ও স্ট্যাটাস নিয়ন্ত্রণ করুন</p>
              </div>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> নতুন সদস্য নিবন্ধন
              </button>
            </div>

            {/* Member Search Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="সদস্যের নাম, মোবাইল বা কার্ড আইডি দিয়ে খুঁজুন..."
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                className="w-full text-xs outline-none bg-transparent"
              />
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 font-bold uppercase">
                    <tr>
                      <th className="p-3">কার্ড আইডি & ক্যাটাগরি</th>
                      <th className="p-3">সদস্যের নাম</th>
                      <th className="p-3">মোবাইল</th>
                      <th className="p-3">রক্তের গ্রুপ</th>
                      <th className="p-3">জেলা ও উপজেলা</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-center">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {cards
                      .filter(c => 
                        c.memberName.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        c.cardId.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        c.mobile.includes(memberSearch)
                      )
                      .map(c => (
                        <tr key={c.cardId} className="hover:bg-slate-50">
                          <td className="p-3">
                            <span className="font-mono font-bold text-sky-700 block">{c.cardId}</span>
                            <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded uppercase mt-0.5 ${
                              c.cardTier === 'Platinum' ? 'bg-sky-100 text-sky-800' :
                              c.cardTier === 'Gold' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {c.cardTier || 'Silver'} ({c.memberLimit || 4} জন)
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{c.memberName}</p>
                            <p className="text-[10px] text-slate-400">পিতা: {c.fatherName || 'N/A'}</p>
                          </td>
                          <td className="p-3 font-mono">{c.mobile}</td>
                          <td className="p-3 font-bold text-rose-600">{c.bloodGroup}</td>
                          <td className="p-3">{c.upazila}, {c.district}</td>
                          <td className="p-3">
                            {c.status === 'PENDING' ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleApproveCard(c.cardId)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer shadow transition"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleRejectCard(c.cardId)}
                                  className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[10px] cursor-pointer transition"
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => toggleCardStatus(c.cardId)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                                  c.status === 'ACTIVE'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                                    : c.status === 'UNASSIGNED'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-rose-100 text-rose-800 hover:bg-emerald-100 hover:text-emerald-800'
                                }`}
                              >
                                {c.status === 'ACTIVE' ? '✓ ACTIVE' : c.status === 'UNASSIGNED' ? '⚪ UNASSIGNED' : '✕ SUSPENDED'}
                              </button>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setViewMemberModal(c)}
                                className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 cursor-pointer transition"
                                title="প্রোফাইল দেখুন"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditMemberModal(c)}
                                className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 cursor-pointer transition"
                                title="সম্পাদনা করুন"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedPrintCard(c)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] shadow hover:bg-emerald-700 cursor-pointer transition flex items-center gap-1"
                                title="প্রিন্ট কার্ড"
                              >
                                <Printer className="w-3.5 h-3.5" /> প্রিন্ট
                              </button>
                              <button
                                onClick={() => handleDeleteMember(c.cardId, c.memberName)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer transition"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: DIAGNOSTIC PARTNERS */}
        {activeSubTab === 'centers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">পার্টনার ডায়াগনস্টিক সেন্টার ও হাসপাতাল</h1>
                <p className="text-xs text-slate-500">দেশব্যাপী নিবন্ধিত সকল পার্টনার সেন্টারের তালিকা ও কমিশন ম্যানেজমেন্ট</p>
              </div>
              <button
                onClick={() => setShowAddCenterModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> নতুন পার্টনার সেন্টার যোগ
              </button>
            </div>

            {/* Centers Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 font-bold uppercase">
                    <tr>
                      <th className="p-3">কোড & সেন্টারের নাম</th>
                      <th className="p-3">বিভাগ ও জেলা</th>
                      <th className="p-3">ফোন ও ঠিকানা</th>
                      <th className="p-3 text-center">ছাড়ের হার</th>
                      <th className="p-3 text-center">স্ট্যাটাস</th>
                      <th className="p-3 text-center">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {centers.map(center => (
                      <tr key={center.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <span className="font-mono text-[10px] text-slate-400 block">{center.code}</span>
                          <span className="font-bold text-slate-900 text-sm">{center.name}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-sky-800">{center.district}</span>
                          <span className="text-[10px] text-slate-500 block">উপজেলা: {center.upazila}</span>
                        </td>
                        <td className="p-3 text-slate-600">
                          <p className="font-mono font-bold text-slate-800">{center.mobile}</p>
                          <p className="text-[10px] truncate max-w-xs">{center.address}</p>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-extrabold text-xs">
                            {center.discountPercentage}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {center.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewCenterModal(center)}
                              className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 cursor-pointer transition"
                              title="প্রোফাইল দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditCenterModal(center)}
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 cursor-pointer transition"
                              title="সম্পাদনা করুন"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCenterConfirmed(center.id, center.name)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer transition"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: TEST PRICE MANAGER */}
        {activeSubTab === 'tests' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">ডায়াগনস্টিক টেস্ট ও প্রাইস চার্ট</h1>
                <p className="text-xs text-slate-500">সকল প্যাথলজি ও রেডিওলজি টেস্টের স্ট্যান্ডার্ড রেট তালিকা</p>
              </div>
              <button
                onClick={() => setShowTestModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> নতুন টেস্ট যোগ করুন
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 font-bold uppercase">
                    <tr>
                      <th className="p-3">টেস্টের নাম</th>
                      <th className="p-3">ক্যাটাগরি</th>
                      <th className="p-3 text-right">নিয়মিত মূল্য</th>
                      <th className="p-3 text-right">DMB মূল্য</th>
                      <th className="p-3 text-right">নিশ্চিত সাশ্রয়</th>
                      <th className="p-3 text-center">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {tests.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{t.name}</td>
                        <td className="p-3 text-slate-500">{t.category}</td>
                        <td className="p-3 text-right font-mono text-slate-400 line-through">৳{t.regularPrice}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700 text-sm">৳{t.dmbPrice}</td>
                        <td className="p-3 text-right font-mono font-bold text-sky-700">৳{t.savings}</td>
                        <td className="p-3 text-center flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditTestModal(t)}
                            className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTest(t.id)}
                            className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                            title="ডিলিট করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* SUBTAB 5: HEALTH PACKAGES */}
        {activeSubTab === 'packages' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">ফ্যামিলি ও এক্সিকিউটিভ হেলথ প্যাকেজ</h1>
                <p className="text-xs text-slate-500">বিশেষায়িত ফুল বডি হেলথ চেকআপ প্যাকেজসমূহ</p>
              </div>
              <button
                onClick={() => setShowPackageModal(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> নতুন প্যাকেজ যোগ
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map(pkg => (
                <div key={pkg.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                        {pkg.category} Package
                      </span>
                      <span className="font-mono text-emerald-700 font-extrabold text-base">
                        ৳{pkg.dmbPrice}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{pkg.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">প্রস্তাবিত: {pkg.recommendedFor}</p>
                    
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <p className="text-[11px] font-bold text-slate-700">অন্তর্ভুক্ত টেস্টসমূহ:</p>
                      <ul className="text-xs text-slate-600 space-y-1 pl-3 list-disc">
                        {pkg.includedTests.map((test, i) => (
                          <li key={i}>{test}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 line-through font-mono">রেগুলার: ৳{pkg.regularPrice}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditPackageModal(pkg)}
                        className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                        title="প্যাকেজ এডিট করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                        title="প্যাকেজ ডিলিট করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 6: DISCOUNT TRACKER */}
        {activeSubTab === 'discount-tracker' && (
          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">ডিসকাউন্ট ট্র্যাকিং ও ওয়াক-ইন বিলিং</h1>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">নতুন ডিসকাউন্ট রেডিম এন্ট্রি ফর্ম (Partner Walk-In Counter)</h3>
              
              <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">কার্ড আইডি *</label>
                  <input
                    type="text"
                    required
                    value={newTxn.cardId}
                    onChange={e => setNewTxn({ ...newTxn, cardId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">পার্টনার সেন্টার *</label>
                  <select
                    value={newTxn.centerId}
                    onChange={e => setNewTxn({ ...newTxn, centerId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  >
                    {centers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.district})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">মূল বিল পরিমাণ (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={newTxn.originalAmount}
                    onChange={e => setNewTxn({ ...newTxn, originalAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">ডিসকাউন্ট পরিমাণ (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={newTxn.discountAmount}
                    onChange={e => setNewTxn({ ...newTxn, discountAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold text-emerald-700"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow cursor-pointer"
                  >
                    ডিসকাউন্ট লেনদেন রেকর্ড করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUBTAB: FIELD REPRESENTATIVES */}
        {activeSubTab === 'reps' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">ফিল্ড রিপ্রেজেন্টেটিভ (প্রতিনিধি) পোর্টাল</h1>
              <p className="text-xs text-slate-500">জব সার্কুলার পোস্ট, প্রতিনিধি নিবন্ধনের আবেদনসমূহ, পেপারস (NID/সার্টিফিকেট/সিভি) অনলাইন চেক ও অনুমোদন ব্যবস্থা</p>
            </div>

            {/* SECTION 1: JOB CIRCULARS MANAGEMENT */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Briefcase className="w-4.5 h-4.5 text-emerald-600" />
                    প্রতিনিধি নিয়োগ সার্কুলার ও বিজ্ঞপ্তি ম্যানেজমেন্ট (Job Circulars)
                  </h2>
                  <p className="text-[11px] text-slate-500">প্রতিনিধি পোর্টালে সরাসরি দেখানোর জন্য নিয়োগ বিজ্ঞপ্তি প্রকাশ করুন</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCircular(null);
                    setCircularForm({
                      title: 'উপজেলা ফিল্ড রিপ্রেজেন্টেটিভ নিয়োগ',
                      position: 'উপজেলা ফিল্ড রিপ্রেজেন্টেটিভ',
                      district: 'গোপালগঞ্জ',
                      upazila: 'গোপালগঞ্জ সদর',
                      vacancyCount: 5,
                      salaryAllowance: '১৫,০০০ - ২০,০০০ টাকা (সম্মানী + সেলস কমিশন)',
                      educationRequirement: 'এইচএসসি / সমমান',
                      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      description: 'ডিএমবি হেলথকেয়ার নেটওয়ার্কের আওতায় ফিল্ড পর্যায়ে কার্ড রেজিস্ট্রেশন ও হেলথ প্রমোশন কাজের জন্য প্রতিনিধি নিয়োগ।',
                      requirementsStr: 'ন্যূনতম এইচএসসি পাশ\nস্মার্টফোন ব্যবহার জানা আবশ্যক\nযোগাযোগে দক্ষ ও মাঠে কাজ করার মানসিকতা'
                    });
                    setShowCircularModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow flex items-center gap-1.5 cursor-pointer transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> নতুন সার্কুলার পোস্ট করুন
                </button>
              </div>

              {jobCirculars.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                  কোনো জব সার্কুলার পোস্ট করা হয়নি। "নতুন সার্কুলার পোস্ট করুন" বাটনে ক্লিক করে পোস্ট করুন।
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobCirculars.map(circular => (
                    <div key={circular.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            circular.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {circular.status === 'OPEN' ? '✓ চালু (OPEN)' : 'বন্ধ (CLOSED)'}
                          </span>
                          <h3 className="font-black text-slate-900 text-sm mt-1">{circular.title}</h3>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border">
                          {circular.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block">পদবী:</span>
                          <strong className="text-slate-800">{circular.position}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">জেলা/এলাকা:</span>
                          <strong className="text-slate-800">{circular.district}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">পদ সংখ্যা:</span>
                          <strong className="text-emerald-700">{circular.vacancyCount} জন</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">শেষ তারিখ:</span>
                          <strong className="text-rose-600 font-mono">{circular.deadline}</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                        <button
                          onClick={() => handleToggleCircularStatus(circular)}
                          className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                        >
                          {circular.status === 'OPEN' ? 'স্ট্যাটাস বন্ধ করুন' : 'পুনরায় চালু করুন'}
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingCircular(circular);
                              setCircularForm({
                                title: circular.title,
                                position: circular.position,
                                district: circular.district,
                                upazila: circular.upazila || '',
                                vacancyCount: circular.vacancyCount,
                                salaryAllowance: circular.salaryAllowance,
                                educationRequirement: circular.educationRequirement,
                                deadline: circular.deadline,
                                description: circular.description || '',
                                requirementsStr: circular.requirements.join('\n')
                              });
                              setShowCircularModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer font-bold text-[11px] flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> এডিট
                          </button>
                          <button
                            onClick={() => handleDeleteCircular(circular.id, circular.title)}
                            className="p-1.5 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 cursor-pointer font-bold text-[11px] flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> ডিলিট
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: REPRESENTATIVE APPLICATIONS & PAPERS CHECK */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    প্রতিনিধি নিবন্ধনের আবেদনসমূহ ও পেপারস চেকিং (Applications & Document Verification)
                  </h2>
                  <p className="text-[11px] text-slate-500">প্রার্থীদের জমা দেওয়া এনআইডি, ছবি, সার্টিফিকেট ও সিভি চেক করে এপ্রুভ বা রিজেক্ট করুন</p>
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={repFilterStatus}
                    onChange={e => setRepFilterStatus(e.target.value)}
                    className="p-2 rounded-xl border bg-slate-50 font-bold"
                  >
                    <option value="ALL">সকল স্ট্যাটাস (ALL)</option>
                    <option value="PENDING">অপেক্ষমাণ (PENDING)</option>
                    <option value="APPROVED">অনুমোদিত (APPROVED)</option>
                    <option value="REJECTED">বাতিল (REJECTED)</option>
                  </select>
                </div>
              </div>

              {repApps.length === 0 ? (
                <p className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl text-center">কোনো আবেদন জমা হয়নি।</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-200 font-bold uppercase">
                      <tr>
                        <th className="p-3">প্রার্থী & আইডি</th>
                        <th className="p-3">আবেদনের পদ/সার্কুলার</th>
                        <th className="p-3">মোবাইল & এনআইডি</th>
                        <th className="p-3">যোগাযোগের এলাকা</th>
                        <th className="p-3">নির্ধারিত টার্গেট</th>
                        <th className="p-3">জমা দেওয়া ডকুমেন্টস</th>
                        <th className="p-3">স্ট্যাটাস</th>
                        <th className="p-3 text-center">পেপারস একশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {repApps
                        .filter(app => repFilterStatus === 'ALL' || app.status === repFilterStatus)
                        .map(app => (
                          <tr key={app.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={app.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                                  alt={app.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-sm"
                                />
                                <div>
                                  <p className="font-extrabold text-slate-900 text-xs">{app.name}</p>
                                  <span className="font-mono text-[10px] text-sky-700 font-bold">{app.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-800">{app.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ'}</p>
                              <p className="text-[10px] text-slate-400">যোগ্যতা: {app.educationalQualification || 'HSC'}</p>
                            </td>
                            <td className="p-3">
                              <p className="font-mono font-bold text-slate-900">{app.mobile}</p>
                              <p className="font-mono text-[10px] text-slate-500">NID: {app.nidNo}</p>
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-800">{app.assignedArea}</p>
                              <p className="text-[10px] text-slate-400">{app.district}</p>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1 text-[10px] font-mono">
                                {app.dailyTarget ? (
                                  <span className="inline-block text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mr-1">
                                    দৈনিক: {app.dailyTarget}টি
                                  </span>
                                ) : null}
                                {app.weeklyTarget ? (
                                  <span className="inline-block text-sky-800 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 mr-1">
                                    সাপ্তাহিক: {app.weeklyTarget}টি
                                  </span>
                                ) : null}
                                {app.monthlyTarget ? (
                                  <span className="inline-block text-purple-800 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                    মাসিক: {app.monthlyTarget}টি
                                  </span>
                                ) : null}
                                {!app.dailyTarget && !app.weeklyTarget && !app.monthlyTarget && (
                                  <span className="text-slate-400 italic">নির্ধারিত নয়</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1 text-[10px]">
                                {app.photoUrl && <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">✓ ছবি</span>}
                                {app.nidDocUrl ? <span className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">✓ NID</span> : <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded">NID নাই</span>}
                                {app.educationDocUrl && <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">✓ সনদ</span>}
                                {app.cvDocUrl && <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">✓ সিভি</span>}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                app.status === 'APPROVED' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : app.status === 'REJECTED' 
                                    ? 'bg-rose-100 text-rose-800' 
                                    : 'bg-amber-100 text-amber-800'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setPaperCheckModal(app);
                                    setPaperCheckNotes(app.adminNotes || '');
                                    setPaperVerificationState({
                                      photo: !!app.photoUrl,
                                      nid: !!app.nidDocUrl,
                                      certificate: !!app.educationDocUrl,
                                      cv: !!app.cvDocUrl
                                    });
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-extrabold text-[11px] shadow flex items-center gap-1 cursor-pointer transition"
                                >
                                  <FileText className="w-3.5 h-3.5" /> পেপারস চেক
                                </button>

                                <button
                                  onClick={() => setEditRepModal(app)}
                                  className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 cursor-pointer transition"
                                  title="সম্পাদনা করুন"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteRep(app.id, app.name)}
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer transition"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Rep Card Serial Distribution Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b pb-3">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  প্রতিনিধিকে ফিজিক্যাল কার্ডের সিরিয়াল নম্বর বিতরণ (Assign Serial Range)
                </h2>
                <p className="text-xs text-slate-500">প্রতিনিধিকে বিতরণকৃত কার্ডের সিরিয়াল নম্বর রেকর্ড ও ফিল্ড রেজিস্ট্রেশন ট্র্যাকিং</p>
              </div>

              {/* Assign Form */}
              <form onSubmit={handleDistributeSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">প্রতিনিধির নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ জসিম উদ্দিন"
                    value={distForm.repName}
                    onChange={e => setDistForm({ ...distForm, repName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">প্রতিনিধির মোবাইল *</label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={distForm.repMobile}
                    onChange={e => setDistForm({ ...distForm, repMobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">শুরু সিরিয়াল নম্বর *</label>
                  <input
                    type="number"
                    required
                    value={distForm.startSerialNum}
                    onChange={e => setDistForm({ ...distForm, startSerialNum: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">শেষ সিরিয়াল নম্বর *</label>
                  <input
                    type="number"
                    required
                    value={distForm.endSerialNum}
                    onChange={e => setDistForm({ ...distForm, endSerialNum: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-white font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow cursor-pointer transition"
                  >
                    সিরিয়াল বরাদ্দ করুন
                  </button>
                </div>
              </form>

              {/* Distributions Tracking Table */}
              <div>
                <h3 className="font-bold text-slate-800 text-xs mb-3">বিতরণকৃত কার্ডের ফিল্ড ট্র্যাকিং সামারি (Field Tracking Summary):</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-200 font-bold uppercase">
                      <tr>
                        <th className="p-3">প্রতিনিধির নাম & মোবাইল</th>
                        <th className="p-3">কার্ড সিরিয়াল রেঞ্জ</th>
                        <th className="p-3 text-center">মোট বরাদ্দ</th>
                        <th className="p-3 text-center">নিবন্ধিত সংখ্যা</th>
                        <th className="p-3 text-center">অবশিষ্ট সংখ্যা</th>
                        <th className="p-3 text-center font-bold text-emerald-400">Approved</th>
                        <th className="p-3 text-center font-bold text-amber-400">Pending</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {repDistributions.map(d => {
                        // Calculate registered cards in this range
                        const totalAllocated = d.endSerial - d.startSerial + 1;
                        const inRange = cards.filter(c => {
                          const match = c.cardId.match(/(\d+)$/);
                          if (!match) return false;
                          const num = parseInt(match[1], 10);
                          return num >= d.startSerial && num <= d.endSerial;
                        });
                        const registeredCount = inRange.length;
                        const remainingCount = Math.max(0, totalAllocated - registeredCount);
                        const activeCount = inRange.filter(c => c.status === 'ACTIVE').length;
                        const pendingCount = inRange.filter(c => c.status === 'PENDING').length;

                        return (
                          <tr key={d.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{d.repName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{d.repMobile}</p>
                            </td>
                            <td className="p-3 font-mono">
                              <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded font-bold">
                                DMB-2026-{d.startSerial} হতে DMB-2026-{d.endSerial}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold font-mono">{totalAllocated} টি</td>
                            <td className="p-3 text-center font-bold text-sky-700 font-mono">{registeredCount} টি</td>
                            <td className="p-3 text-center font-bold text-slate-600 font-mono">{remainingCount} টি</td>
                            <td className="p-3 text-center font-bold text-emerald-600 font-mono">{activeCount} টি</td>
                            <td className="p-3 text-center font-bold text-amber-600 font-mono">{pendingCount} টি</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: BULK CARD GENERATOR & CARD DESIGN EDITOR */}
        {activeSubTab === 'bulk' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                  বাল্ক মেডিক্যাল কার্ড ও কার্ড ডিজাইন প্যানেল
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  প্রিন্টেড কার্ডের জন্য এক ক্লিকে সিরিয়াল জেনারেট করুন, ব্র্যান্ডিং ডিজাইন টিউন করুন এবং পিডিএফ ফরম্যাটে ডাউনলোড করুন
                </p>
              </div>

              {/* Subtab Navigation Buttons */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                <button
                  onClick={() => setBulkTabMode('generator')}
                  className={`px-4 py-2 rounded-lg font-extrabold text-xs cursor-pointer transition flex items-center gap-1.5 ${
                    bulkTabMode === 'generator'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  বাল্ক কার্ড জেনারেটর
                </button>
                <button
                  onClick={() => setBulkTabMode('editor')}
                  className={`px-4 py-2 rounded-lg font-extrabold text-xs cursor-pointer transition flex items-center gap-1.5 ${
                    bulkTabMode === 'editor'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  কার্ড ডিজাইন এডিটর
                </button>
              </div>
            </div>

            {/* MODE 1: CARD DESIGN EDITOR */}
            {bulkTabMode === 'editor' && (() => {
              const renderInlineToggle = (fieldKey: keyof NonNullable<CardDesignSettings['fieldVisibility']>) => {
                const isVisible = cardDesignSettings.fieldVisibility?.[fieldKey] !== false;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      setCardDesignSettings(prev => ({
                        ...prev,
                        fieldVisibility: {
                          ...(prev.fieldVisibility || {}),
                          [fieldKey]: !isVisible
                        }
                      }));
                    }}
                    className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer border transition-colors ${
                      isVisible
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                    }`}
                    title={isVisible ? 'কার্ডে দেখানো হবে' : 'কার্ডে হাইড থাকবে'}
                  >
                    {isVisible ? '● শো (Active)' : '○ হাইড (Inactive)'}
                  </button>
                );
              };

              const renderFieldToggle = (fieldKey: keyof NonNullable<CardDesignSettings['fieldVisibility']>, label: string) => {
                const isVisible = cardDesignSettings.fieldVisibility?.[fieldKey] !== false;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      setCardDesignSettings(prev => ({
                        ...prev,
                        fieldVisibility: {
                          ...(prev.fieldVisibility || {}),
                          [fieldKey]: !isVisible
                        }
                      }));
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                      isVisible
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-slate-100 border-slate-300 text-slate-500 line-through'
                    }`}
                  >
                    <span className="truncate pr-1">{label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex-shrink-0 ${
                        isVisible ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {isVisible ? 'একটিভ ✓' : 'ইনএকটিভ ✕'}
                    </span>
                  </button>
                );
              };

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                  {/* Form Controls */}
                  <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                    <div className="border-b pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                          <Palette className="w-5 h-5 text-blue-600" />
                          কার্ড টেমপ্লেট, রঙ, ছবি ও ব্র্যান্ডিং কাস্টমাইজেশন
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          সকল ফিল্ড ঐচ্ছিক এবং এডিটেবল। ফিল্ড একটিভ/ইনএকটিভ অপশন দিয়ে যেকোনো তথ্য কার্ডে চালু বা বন্ধ করুন।
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveCardDesignSettings} className="space-y-4 text-xs">
                      {/* FIELD ACTIVE / INACTIVE SHOW-HIDE TOGGLE SECTION */}
                      <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
                          <div>
                            <h4 className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-indigo-600" />
                              কার্ড ফিল্ড একটিভ / ইনএকটিভ প্রদর্শন নিয়ন্ত্রণ (Show / Hide Fields)
                            </h4>
                            <p className="text-[11px] text-indigo-700/80 mt-0.5">
                              যে তথ্যগুলো কার্ডে দেখাতে চান সেগুলোতে 'একটিভ ✓' রাখুন, যেগুলো দেখাতে চান না সেগুলোতে 'ইনএকটিভ ✕' ক্লিক করুন।
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const allTrue = {
                                  headerTitle: true, headerSubtitle: true, logo: true, tierBadge: true, photoUrl: true,
                                  bloodGroup: true, memberName: true, cardId: true, memberId: true, upazila: true,
                                  district: true, issueDate: true, expiryDate: true, helpline: true, nidOrBirthCert: true,
                                  beneficiaries: true, slogan: true, disclaimerText: true, qrCode: true, footerText: true, websiteUrl: true
                                };
                                setCardDesignSettings({ ...cardDesignSettings, fieldVisibility: allTrue });
                              }}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700 cursor-pointer shadow-sm"
                            >
                              সব একটিভ করুন
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                          {renderFieldToggle('headerTitle', '১. হেডার টাইটেল (Title)')}
                          {renderFieldToggle('headerSubtitle', '২. সাবটাইটেল (Subtitle)')}
                          {renderFieldToggle('logo', '৩. লোগো ব্র্যান্ডিং (Logo)')}
                          {renderFieldToggle('tierBadge', '৪. টায়ার ব্যাজ (Badge)')}
                          {renderFieldToggle('photoUrl', '৫. সদস্যের ছবি (Photo)')}
                          {renderFieldToggle('bloodGroup', '৬. রক্তের গ্রুপ (Blood Group)')}
                          {renderFieldToggle('memberName', '৭. সদস্যের নাম (Name)')}
                          {renderFieldToggle('cardId', '৮. কার্ড আইডি (Card ID)')}
                          {renderFieldToggle('memberId', '৯. মেম্বার আইডি (Member ID)')}
                          {renderFieldToggle('upazila', '১০. উপজেলা (Upazila)')}
                          {renderFieldToggle('district', '১১. জেলা (District)')}
                          {renderFieldToggle('issueDate', '১২. ইস্যু তারিখ (Issue Date)')}
                          {renderFieldToggle('expiryDate', '১৩. মেয়াদ তারিখ (Expiry Date)')}
                          {renderFieldToggle('helpline', '১৪. জরুরি হেল্পলাইন (Helpline)')}
                          {renderFieldToggle('nidOrBirthCert', '১৫. এনআইডি (NID/Birth Cert)')}
                          {renderFieldToggle('beneficiaries', '১৬. ফ্যামিলি মেম্বার (Beneficiaries)')}
                          {renderFieldToggle('slogan', '১৭. স্লোগান (Slogan)')}
                          {renderFieldToggle('disclaimerText', '১৮. ডিসক্লেমার (Disclaimer)')}
                          {renderFieldToggle('qrCode', '১৯. কিউআর কোড (QR Code)')}
                          {renderFieldToggle('footerText', '২০. ফুটার টেক্সট (Footer)')}
                          {renderFieldToggle('websiteUrl', '২১. ওয়েবসাইট (Website)')}
                        </div>
                      </div>

                      {/* Header Title & Subtitle */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-slate-800">কার্ড হেডার টাইটেল (Title)</label>
                            {renderInlineToggle('headerTitle')}
                          </div>
                          <input
                            type="text"
                            value={cardDesignSettings.headerTitle || ''}
                            onChange={e => setCardDesignSettings({ ...cardDesignSettings, headerTitle: e.target.value })}
                            className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                            placeholder="DIGITAL MEDI BRIDGE"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-slate-800">হেডার সাবটাইটেল (Subtitle)</label>
                            {renderInlineToggle('headerSubtitle')}
                          </div>
                          <input
                            type="text"
                            value={cardDesignSettings.headerSubtitle || ''}
                            onChange={e => setCardDesignSettings({ ...cardDesignSettings, headerSubtitle: e.target.value })}
                            className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                            placeholder="Healthcare Service Platform & Medical Network"
                          />
                        </div>
                      </div>

                      {/* Logo Text & Logo File Upload */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-slate-800">লোগো শর্টনেম (Logo Text)</label>
                            {renderInlineToggle('logo')}
                          </div>
                          <input
                            type="text"
                            value={cardDesignSettings.logoText || ''}
                            onChange={e => setCardDesignSettings({ ...cardDesignSettings, logoText: e.target.value })}
                            className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold font-mono"
                            placeholder="DMB"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-slate-800">লোগো ছবি আপলোড (Logo File Upload)</label>
                            {renderInlineToggle('logo')}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = ev => {
                                    setCardDesignSettings({ ...cardDesignSettings, logoUrl: ev.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                            {cardDesignSettings.logoUrl && (
                              <button
                                type="button"
                                onClick={() => setCardDesignSettings({ ...cardDesignSettings, logoUrl: '' })}
                                className="px-2 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-lg text-[10px] whitespace-nowrap cursor-pointer"
                              >
                                মুছে ফেলুন
                              </button>
                            )}
                          </div>
                          {cardDesignSettings.logoUrl && (
                            <div className="mt-2 flex items-center gap-2">
                              <img src={cardDesignSettings.logoUrl} alt="Logo preview" className="w-8 h-8 rounded-lg object-cover border" />
                              <span className="text-[10px] text-emerald-600 font-bold">✓ লোগো আপলোড করা হয়েছে</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Slogan & Helpline */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-slate-800">কার্ড স্লোগান (Slogan)</label>
                            {renderInlineToggle('slogan')}
                          </div>
                          <input
                            type="text"
                            value={cardDesignSettings.slogan || ''}
                            onChange={e => setCardDesignSettings({ ...cardDesignSettings, slogan: e.target.value })}
                            className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                            placeholder="স্মার্ট স্বাস্থ্য সেবায় আপনার নির্ভরযোগ্য ডিজিটাল হেলথ পার্টনার"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-slate-800">জরুরি হেল্পলাইন (Helpline)</label>
                            {renderInlineToggle('helpline')}
                          </div>
                          <input
                            type="text"
                            value={cardDesignSettings.helpline || ''}
                            onChange={e => setCardDesignSettings({ ...cardDesignSettings, helpline: e.target.value })}
                            className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold font-mono"
                            placeholder="+8809658887470"
                          />
                        </div>
                      </div>

                      {/* SAMPLE CARD MEMBER DATA EDITABLE SECTION */}
                      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                          <h4 className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                            <UserIcon className="w-4 h-4 text-emerald-600" />
                            কার্ডের তথ্য ও ছবি সম্পাদনা (Editable Sample Card Details)
                          </h4>
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                            লাইভ প্রিভিউতে আপডেট হবে
                          </span>
                        </div>

                        {/* Name & Photo Upload */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-[11px] text-slate-800">সদস্যের নাম (Member Name)</label>
                              {renderInlineToggle('memberName')}
                            </div>
                            <input
                              type="text"
                              value={sampleCardData.memberName}
                              onChange={e => setSampleCardData({ ...sampleCardData, memberName: e.target.value })}
                              className="w-full p-2 rounded-xl border bg-white font-bold"
                              placeholder="মোঃ আব্দুর রহমান"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold text-[11px] text-slate-800">সদস্যের ছবি ফাইল আপলোড (Photo File Upload)</label>
                              {renderInlineToggle('photoUrl')}
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = ev => {
                                      setSampleCardData({ ...sampleCardData, photoUrl: ev.target?.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                              />
                              {sampleCardData.photoUrl && (
                                <button
                                  type="button"
                                  onClick={() => setSampleCardData({ ...sampleCardData, photoUrl: '' })}
                                  className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-lg text-[10px] whitespace-nowrap cursor-pointer"
                                >
                                  রিমুভ
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                      {/* Card ID & Registration ID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[11px] text-slate-800 mb-1">কার্ড আইডি / নম্বর (Card ID)</label>
                          <input
                            type="text"
                            value={sampleCardData.cardId}
                            onChange={e => setSampleCardData({ ...sampleCardData, cardId: e.target.value })}
                            className="w-full p-2 rounded-xl border bg-white font-mono font-bold"
                            placeholder="DMB-2026-1001"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[11px] text-slate-800 mb-1">রেজিস্ট্রেশন / মেম্বার আইডি (Member ID)</label>
                          <input
                            type="text"
                            value={sampleCardData.memberId}
                            onChange={e => setSampleCardData({ ...sampleCardData, memberId: e.target.value })}
                            className="w-full p-2 rounded-xl border bg-white font-mono"
                            placeholder="MEM-001"
                          />
                        </div>
                      </div>

                      {/* Issue Date & Expiry Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[11px] text-slate-800 mb-1">ইস্যু তারিখ (Issue Date)</label>
                          <input
                            type="text"
                            value={sampleCardData.issueDate}
                            onChange={e => setSampleCardData({ ...sampleCardData, issueDate: e.target.value })}
                            className="w-full p-2 rounded-xl border bg-white font-mono"
                            placeholder="২০২৬-০১-১৫"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[11px] text-slate-800 mb-1">মেয়াদ উত্তীর্ণের তারিখ (Expiry Date)</label>
                          <input
                            type="text"
                            value={sampleCardData.expiryDate}
                            onChange={e => setSampleCardData({ ...sampleCardData, expiryDate: e.target.value })}
                            className="w-full p-2 rounded-xl border bg-white font-mono font-bold text-amber-700"
                            placeholder="২০২৭-০১-১৪"
                          />
                        </div>
                      </div>

                      {/* Blood Group, Gender & Mobile */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block font-bold text-[11px] text-slate-800 mb-1">রক্তের গ্রুপ</label>
                          <select
                            value={sampleCardData.bloodGroup}
                            onChange={e => setSampleCardData({ ...sampleCardData, bloodGroup: e.target.value })}
                            className="w-full p-2 rounded-xl border bg-white font-bold"
                          >
                            <option value="">নির্বাচন করুন</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-[11px] text-slate-800 mb-1">লিঙ্গ (Gender)</label>
                          <select
                            value={sampleCardData.gender}
                            onChange={e => setSampleCardData({ ...sampleCardData, gender: e.target.value })}
                            className="w-full p-2 rounded-xl border bg-white"
                          >
                            <option value="">নির্বাচন করুন</option>
                            <option value="Male">পুরুষ</option>
                            <option value="Female">মহিলা</option>
                            <option value="Other">অন্যান্য</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-[11px] text-slate-800 mb-1">মোবাইল নম্বর</label>
                          <input
                            type="text"
                            value={sampleCardData.mobile}
                            onChange={e => setSampleCardData({ ...sampleCardData, mobile: e.target.value })}
                            className="w-full p-2 rounded-xl border bg-white font-mono"
                            placeholder="01700000000"
                          />
                        </div>
                      </div>

                      {/* District, Upazila & NID */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block font-bold text-[11px] text-slate-800 mb-1">জেলা (District)</label>
                          <input
                            type="text"
                            value={sampleCardData.district}
                            onChange={e => setSampleCardData({ ...sampleCardData, district: e.target.value })}
                            className="w-full p-2 rounded-xl border bg-white"
                            placeholder="গোপালগঞ্জ"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[11px] text-slate-800 mb-1">উপজেলা (Upazila)</label>
                          <input
                            type="text"
                            value={sampleCardData.upazila}
                            onChange={e => setSampleCardData({ ...sampleCardData, upazila: e.target.value })}
                            className="w-full p-2 rounded-xl border bg-white"
                            placeholder="গোপালগঞ্জ সদর"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[11px] text-slate-800 mb-1">এনআইডি/জন্ম নিবন্ধন</label>
                          <input
                            type="text"
                            value={sampleCardData.nidOrBirthCert}
                            onChange={e => setSampleCardData({ ...sampleCardData, nidOrBirthCert: e.target.value })}
                            className="w-full p-2 rounded-xl border bg-white font-mono"
                            placeholder="19951234567890"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tier Preset Styling Selection */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        কার্ড টায়ার ক্যাটাগরি কালার থিম সেটিং
                      </h4>

                      {/* Silver Theme */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[11px] text-slate-700 mb-1">Silver Card থিম Preset</label>
                          <select
                            value={cardDesignSettings.silverTheme?.presetKey || 'classic_silver'}
                            onChange={e => setCardDesignSettings({
                              ...cardDesignSettings,
                              silverTheme: { ...cardDesignSettings.silverTheme, presetKey: e.target.value, badgeText: cardDesignSettings.silverTheme?.badgeText || 'Silver Card' }
                            })}
                            className="w-full p-2 rounded-xl border bg-white text-xs font-bold"
                          >
                            <option value="classic_silver">Classic Silver (ক্লাসিক ডার্ক সিলভার)</option>
                            <option value="bright_metallic_silver">Bright Metallic (ব্রাইট মেটালিক)</option>
                            <option value="dark_chrome_silver">Dark Chrome (ডার্ক ক্রোম)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-[11px] text-slate-700 mb-1">Silver Badge Text</label>
                          <input
                            type="text"
                            value={cardDesignSettings.silverTheme?.badgeText || 'সিলভার কার্ড (Silver Card)'}
                            onChange={e => setCardDesignSettings({
                              ...cardDesignSettings,
                              silverTheme: { ...cardDesignSettings.silverTheme, presetKey: cardDesignSettings.silverTheme?.presetKey || 'classic_silver', badgeText: e.target.value }
                            })}
                            className="w-full p-2 rounded-xl border bg-white text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Gold Theme */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[11px] text-slate-700 mb-1">Gold Card থিম Preset</label>
                          <select
                            value={cardDesignSettings.goldTheme?.presetKey || 'royal_gold'}
                            onChange={e => setCardDesignSettings({
                              ...cardDesignSettings,
                              goldTheme: { ...cardDesignSettings.goldTheme, presetKey: e.target.value, badgeText: cardDesignSettings.goldTheme?.badgeText || 'Gold Card' }
                            })}
                            className="w-full p-2 rounded-xl border bg-white text-xs font-bold"
                          >
                            <option value="royal_gold">Royal Gold (রয়েল গোল্ড)</option>
                            <option value="sunrise_gold">Sunrise Gold (সানরাইজ গোল্ড)</option>
                            <option value="metallic_amber_gold">Deep Amber Gold (ডিপ আম্বার)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-[11px] text-slate-700 mb-1">Gold Badge Text</label>
                          <input
                            type="text"
                            value={cardDesignSettings.goldTheme?.badgeText || 'গোল্ড কার্ড (Gold Card)'}
                            onChange={e => setCardDesignSettings({
                              ...cardDesignSettings,
                              goldTheme: { ...cardDesignSettings.goldTheme, presetKey: cardDesignSettings.goldTheme?.presetKey || 'royal_gold', badgeText: e.target.value }
                            })}
                            className="w-full p-2 rounded-xl border bg-white text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Platinum Theme */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[11px] text-slate-700 mb-1">Platinum Card থিম Preset</label>
                          <select
                            value={cardDesignSettings.platinumTheme?.presetKey || 'royal_platinum'}
                            onChange={e => setCardDesignSettings({
                              ...cardDesignSettings,
                              platinumTheme: { ...cardDesignSettings.platinumTheme, presetKey: e.target.value, badgeText: cardDesignSettings.platinumTheme?.badgeText || 'Platinum Card' }
                            })}
                            className="w-full p-2 rounded-xl border bg-white text-xs font-bold"
                          >
                            <option value="royal_platinum">Royal Cyber Platinum (রয়েল সাইবার)</option>
                            <option value="dark_titanium_platinum">Dark Titanium (ডার্ক টাইটেনিয়াম)</option>
                            <option value="platinum_chrome_blue">Chrome Blue Platinum (ক্রোম ব্লু)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-[11px] text-slate-700 mb-1">Platinum Badge Text</label>
                          <input
                            type="text"
                            value={cardDesignSettings.platinumTheme?.badgeText || 'প্লাটিনাম কার্ড (Platinum Card)'}
                            onChange={e => setCardDesignSettings({
                              ...cardDesignSettings,
                              platinumTheme: { ...cardDesignSettings.platinumTheme, presetKey: cardDesignSettings.platinumTheme?.presetKey || 'royal_platinum', badgeText: e.target.value }
                            })}
                            className="w-full p-2 rounded-xl border bg-white text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer & Footer Text */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold mb-1 text-slate-800">ডিসক্লেমার ওয়ার্নিং বার্তা</label>
                        <input
                          type="text"
                          value={cardDesignSettings.disclaimerText || ''}
                          onChange={e => setCardDesignSettings({ ...cardDesignSettings, disclaimerText: e.target.value })}
                          className="w-full p-2.5 rounded-xl border bg-slate-50 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-800">ফুটার অর্গানাইজেশন ব্র্যান্ডিং</label>
                        <input
                          type="text"
                          value={cardDesignSettings.footerText || ''}
                          onChange={e => setCardDesignSettings({ ...cardDesignSettings, footerText: e.target.value })}
                          className="w-full p-2.5 rounded-xl border bg-slate-50 text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={cardDesignLoading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow cursor-pointer text-sm transition flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {cardDesignLoading ? 'সেটিং সেভ হচ্ছে...' : 'কার্ড ডিজাইন ও থিম সেটিংস সংরক্ষণ করুন'}
                    </button>
                  </form>
                </div>

                {/* Live Preview Column */}
                <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-extrabold text-sm">লাইভ কার্ড রিয়েল-টাইম প্রিভিউ</h3>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                        {(['Silver', 'Gold', 'Platinum'] as const).map(tier => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setCardDesignPreviewTier(tier)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                              cardDesignPreviewTier === tier
                                ? 'bg-emerald-500 text-slate-950 font-black'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview Card Canvas */}
                    <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                      <MedicalCardPrint
                        card={{
                          cardId: sampleCardData.cardId || '',
                          memberName: sampleCardData.memberName || '',
                          customCardId: sampleCardData.cardId || '',
                          cardTier: cardDesignPreviewTier,
                          mobile: sampleCardData.mobile || '',
                          photoUrl: sampleCardData.photoUrl || '',
                          status: 'ACTIVE',
                          gender: sampleCardData.gender || '',
                          bloodGroup: sampleCardData.bloodGroup || '',
                          district: sampleCardData.district || '',
                          upazila: sampleCardData.upazila || '',
                          address: sampleCardData.address || '',
                          nidOrBirthCert: sampleCardData.nidOrBirthCert || '',
                          issueDate: sampleCardData.issueDate || '',
                          validUntil: sampleCardData.expiryDate || '',
                          expiryDate: sampleCardData.expiryDate || '',
                          memberId: sampleCardData.memberId || '',
                          hotline: cardDesignSettings.helpline || ''
                        }}
                        cardDesignSettings={cardDesignSettings}
                        showPrintButton={false}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center italic mt-4">
                    💡 উপরের ফর্মে পছন্দমতো নাম, ছবি, মেয়াদের তারিখ বা লোগো ফাইল আপলোড করলে রিয়েল-টাইমে লাইভ কার্ড প্রিভিউতে আপডেট দেখতে পাবেন।
                  </p>
                </div>
              </div>
              );
            })()}

            {/* MODE 2: BULK CARD GENERATOR */}
            {bulkTabMode === 'generator' && (
              <div className="space-y-6 animate-fadeIn">
                {/* SUCCESS NOTIFICATION BANNER */}
                {bulkGenSuccessMsg && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-500/50 text-emerald-950 rounded-2xl flex items-start justify-between gap-3 shadow-md animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-sm">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-950">কার্যক্রম সফল হয়েছে!</h4>
                        <p className="text-xs text-emerald-800 font-bold mt-0.5">{bulkGenSuccessMsg}</p>
                      </div>
                    </div>
                    <button onClick={() => setBulkGenSuccessMsg('')} className="text-emerald-700 hover:text-emerald-950 font-black text-sm p-1 cursor-pointer">
                      ✕
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 max-w-2xl">
                  <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-sky-900 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span>সেন্ট্রাল অটো-ইনক্রিমেন্ট সিকুয়েন্স নিয়ম (Rule 10)</span>
                    </div>
                    <p>
                      বাল্ক জেনারেশনে প্রতিটি কার্ড আইডি সেন্ট্রাল সিকুয়েন্স অনুসরণ করে ইউনিক ফরম্যাটে (যেমন: <strong className="font-mono">DMB-2026-1001</strong>) তৈরি হবে। কোনো কার্ড আইডি ডুপ্লিকেট হবে না।
                    </p>
                  </div>

                  <form onSubmit={handleBulkGenerateSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold mb-1 text-slate-800">শুরু সিরিয়াল নম্বর (Start Range) *</label>
                        <input
                          type="number"
                          required
                          value={bulkGenForm.startRange}
                          onChange={e => setBulkGenForm({ ...bulkGenForm, startRange: e.target.value })}
                          className="w-full p-3 rounded-xl border bg-slate-50 font-mono font-bold text-sm text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-800">শেষ সিরিয়াল নম্বর (End Range) *</label>
                        <input
                          type="number"
                          required
                          value={bulkGenForm.endRange}
                          onChange={e => setBulkGenForm({ ...bulkGenForm, endRange: e.target.value })}
                          className="w-full p-3 rounded-xl border bg-slate-50 font-mono font-bold text-sm text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-slate-800">কার্ড টায়ার ক্যাটাগরি *</label>
                      <select
                        value={bulkGenForm.cardTier}
                        onChange={e => setBulkGenForm({ ...bulkGenForm, cardTier: e.target.value })}
                        className="w-full p-3 rounded-xl border bg-slate-50 font-bold text-slate-900"
                      >
                        <option value="Silver">Silver Card (ফ্যামিলি ৪ জন)</option>
                        <option value="Gold">Gold Card (ফ্যামিলি ৬ জন)</option>
                        <option value="Platinum">Platinum Card (ফ্যামিলি ৮ জন)</option>
                      </select>
                    </div>

                    {/* LIVE BULK GENERATE PROGRESS INDICATOR */}
                    {bulkGenLoading && (
                      <div className="p-4 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl space-y-2 animate-pulse">
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <Loader2 className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0" />
                          <span>কার্ড সিকুয়েন্স ও কিউআর কোড জেনারেট হচ্ছে...</span>
                        </div>
                        <p className="text-xs text-amber-800 font-medium">{bulkGenProgressMsg}</p>
                        <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-600 h-full rounded-full w-3/4 animate-pulse"></div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bulkGenLoading}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow cursor-pointer text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {bulkGenLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>বাল্ক কার্ডস জেনারেট হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>বাল্ক কার্ডসমূহ জেনারেট করুন</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* GENERATED BULK UNASSIGNED CARDS TABLE & EXPORT / PRINT ACTIONS */}
                <div id="generated-bulk-cards-section" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                        জেনারেট হওয়া সকল বাল্ক আন-অ্যাসাইনড মেডিক্যাল কার্ডস ({cards.filter(c => (c.status || '').toUpperCase() === 'UNASSIGNED').length} টি)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        প্রিন্টিং প্রেস বা মাঠ প্রতিনিধিদের কাছে পাঠানোর জন্য বাল্ক কার্ড তালিকা পিডিএফ / সিএসভি ডাউনলোড ও প্রিন্ট করুন।
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* PDF DOWNLOAD BUTTON */}
                      <button
                        onClick={handleDownloadBulkPDF}
                        disabled={pdfDownloading}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
                      >
                        {pdfDownloading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>পিডিএফ প্রসেসিং হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <FileDown className="w-4 h-4" />
                            <span>📄 বাল্ক কার্ড পিডিএফ ডাউনলোড</span>
                          </>
                        )}
                      </button>

                      {/* CSV EXPORT BUTTON */}
                      <button
                        onClick={() => {
                          const unassignedCards = cards.filter(c => (c.status || '').toUpperCase() === 'UNASSIGNED');
                          if (unassignedCards.length === 0) return alert('কোনো বাল্ক আন-অ্যাসাইনড কার্ড পাওয়া যায়নি।');
                          
                          const headers = ['Card ID', 'Tier', 'Member Limit', 'Status', 'Issue Date'];
                          const rows = unassignedCards.map(c => [
                            c.cardId,
                            c.cardTier || 'Silver',
                            c.memberLimit || 4,
                            c.status,
                            c.issueDate || ''
                          ]);

                          const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement('a');
                          link.setAttribute('href', encodedUri);
                          link.setAttribute('download', `DMB_Bulk_Cards_${new Date().toISOString().slice(0, 10)}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4 text-emerald-400" /> এক্সপোর্ট CSV
                      </button>

                      <button
                        onClick={() => {
                          const unassigned = cards.filter(c => (c.status || '').toUpperCase() === 'UNASSIGNED');
                          if (unassigned.length === 0) return alert('প্রিন্ট করার মতো কোনো বাল্ক কার্ড নেই।');
                          setSelectedPrintCard(unassigned[0]);
                        }}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Printer className="w-4 h-4" /> বাল্ক কার্ডস ব্যাচ প্রিন্ট
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-200 font-bold uppercase">
                        <tr>
                          <th className="p-3">সিরিয়াল & কার্ড আইডি</th>
                          <th className="p-3">টায়ার ক্যাটাগরি</th>
                          <th className="p-3 text-center">মেম্বার লিমিট</th>
                          <th className="p-3 text-center">স্ট্যাটাস</th>
                          <th className="p-3 text-center">একশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {cards.filter(c => c.status === 'UNASSIGNED').length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-400">
                              বর্তমানে কোনো আন-অ্যাসাইনড বাল্ক কার্ড নেই। উপরের ফর্ম ব্যবহার করে নতুন কার্ড জেনারেট করুন।
                            </td>
                          </tr>
                        ) : (
                          cards.filter(c => c.status === 'UNASSIGNED').map((c, idx) => (
                            <tr key={c.cardId} className="hover:bg-slate-50">
                              <td className="p-3 font-mono">
                                <span className="text-slate-400 text-[10px] mr-2">#{idx + 1}</span>
                                <span className="font-bold text-sky-800 text-sm">{c.cardId}</span>
                              </td>
                              <td className="p-3">
                                <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase ${
                                  c.cardTier === 'Platinum' ? 'bg-sky-100 text-sky-800' :
                                  c.cardTier === 'Gold' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {c.cardTier || 'Silver'}
                                </span>
                              </td>
                              <td className="p-3 text-center font-bold font-mono">{c.memberLimit || 4} জন</td>
                              <td className="p-3 text-center">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  UNASSIGNED (ব্ল্যাঙ্ক প্রিন্টেড)
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => setSelectedPrintCard(c)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow cursor-pointer transition inline-flex items-center gap-1"
                                >
                                  <Printer className="w-3.5 h-3.5" /> প্রিন্ট কার্ড
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB: SMS NOTIFICATIONS & GATEWAY SETTINGS */}
        {activeSubTab === 'sms' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Bell className="w-6 h-6 text-sky-600" />
                  স্বয়ংস্ক্রিয় SMS গেটওয়ে কনফিগারেশন ও বার্তা টেমপ্লেট
                </h1>
                <p className="text-xs text-slate-500">
                  BulkSMSBD এপিআই কি, সেন্ডার আইডি, রিয়েলটাইম স্ট্যাটাস এবং প্রতিটি সিস্টেম ইভেন্টের মেসেজ টেমপ্লেট কাস্টমাইজেশন
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestSmsConnection}
                  disabled={smsTestLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${smsTestLoading ? 'animate-spin' : ''}`} />
                  {smsTestLoading ? 'টেস্ট পাঠানো হচ্ছে...' : 'গেটওয়ে কানেকশন টেস্ট করুন'}
                </button>
              </div>
            </div>

            {/* Top Gateway Configuration Box */}
            <form onSubmit={handleSaveSmsConfig} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${smsSettings.enabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-sm">BulkSMSBD এপিআই গেটওয়ে তথ্য (BulkSMSBD Settings)</h2>
                    <p className="text-[11px] text-slate-500">সার্ভার থেকে সরাসরি বাল্ক এসএমএস বিডি গেটওয়েতে মেসেজ প্রেরণের ইউআরএল ও ক্রিডেনশিয়াল</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">এসএমএস গেটওয়ে স্ট্যাটাস:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsSettings.enabled}
                      onChange={e => setSmsSettings({ ...smsSettings, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${smsSettings.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {smsSettings.enabled ? '✓ লাইভ (Live SMS Active)' : '⚠️ টেস্ট মোড (Simulated)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-sky-600" />
                    API Key (এপিআই কী) *
                  </label>
                  <input
                    type="text"
                    required
                    value={smsSettings.apiKey}
                    onChange={e => setSmsSettings({ ...smsSettings, apiKey: e.target.value })}
                    placeholder="i71o7813NPx9vgASrBVu"
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">BulkSMSBD ড্যাশবোর্ড থেকে প্রাপ্ত সিক্রেট এপিআই কী</p>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                    Sender ID (সেন্ডার আইডি) *
                  </label>
                  <input
                    type="text"
                    required
                    value={smsSettings.senderId}
                    onChange={e => setSmsSettings({ ...smsSettings, senderId: e.target.value })}
                    placeholder="DEHF"
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">অনুমোদিত ব্র্যান্ডেড বা মাস্কিং সেন্ডার নেম (যেমন: DEHF)</p>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-600" />
                    Gateway Endpoint URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={smsSettings.apiUrl}
                    onChange={e => setSmsSettings({ ...smsSettings, apiUrl: e.target.value })}
                    placeholder="https://bulksmsbd.net/api/smsapi"
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">BulkSMSBD HTTP GET/POST API এন্ডপয়েন্ট</p>
                </div>
              </div>

              {/* SMS Templates Customization */}
              <div className="border-t pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    স্বয়ংক্রিয় এসএমএস বার্তা টেমপ্লেটসমূহ (Dynamic SMS Templates)
                  </h3>
                  <span className="text-[11px] text-slate-500">ব্র্যাকেটের ভ্যারিয়েবলসমূহ (যেমন: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-sky-700">{"{name}"}</code>) অটোমেটিক ডায়নামিক ডেটা দ্বারা প্রতিস্থাপিত হবে</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Template 1: Application Received */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>১. কার্ড আবেদন জমা নেওয়ার মেসেজ (App Submitted)</span>
                      <span className="text-[10px] font-mono text-slate-400">{"{name}"}, {"{cardId}"}, {"{mobile}"}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={smsSettings.templates.appSubmitted}
                      onChange={e => setSmsSettings({
                        ...smsSettings,
                        templates: { ...smsSettings.templates, appSubmitted: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border bg-white leading-relaxed font-medium"
                    />
                  </div>

                  {/* Template 2: Application Approved */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>২. কার্ড অনুমোদনের মেসেজ (App Approved)</span>
                      <span className="text-[10px] font-mono text-slate-400">{"{name}"}, {"{cardId}"}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={smsSettings.templates.appApproved}
                      onChange={e => setSmsSettings({
                        ...smsSettings,
                        templates: { ...smsSettings.templates, appApproved: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border bg-white leading-relaxed font-medium"
                    />
                  </div>

                  {/* Template 3: Application Rejected */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>৩. আবেদন বাতিলের মেসেজ (App Rejected)</span>
                      <span className="text-[10px] font-mono text-slate-400">{"{name}"}, {"{cardId}"}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={smsSettings.templates.appRejected}
                      onChange={e => setSmsSettings({
                        ...smsSettings,
                        templates: { ...smsSettings.templates, appRejected: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border bg-white leading-relaxed font-medium"
                    />
                  </div>

                  {/* Template 4: Representative Submitted */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>৪. প্রতিনিধি আবেদন প্রাপ্তির মেসেজ (Rep Submitted)</span>
                      <span className="text-[10px] font-mono text-slate-400">{"{name}"}, {"{repId}"}, {"{mobile}"}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={smsSettings.templates.repSubmitted || ''}
                      onChange={e => setSmsSettings({
                        ...smsSettings,
                        templates: { ...smsSettings.templates, repSubmitted: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border bg-white leading-relaxed font-medium"
                    />
                  </div>

                  {/* Template 5: Representative Approved */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>৫. মাঠ প্রতিনিধি অ্যাক্টিভ মেসেজ (Rep Approved)</span>
                      <span className="text-[10px] font-mono text-slate-400">{"{name}"}, {"{repId}"}, {"{mobile}"}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={smsSettings.templates.repApproved}
                      onChange={e => setSmsSettings({
                        ...smsSettings,
                        templates: { ...smsSettings.templates, repApproved: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border bg-white leading-relaxed font-medium"
                    />
                  </div>

                  {/* Template 6: Representative Rejected */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>৬. প্রতিনিধি আবেদন বাতিলের মেসেজ (Rep Rejected)</span>
                      <span className="text-[10px] font-mono text-slate-400">{"{name}"}, {"{repId}"}, {"{reason}"}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={smsSettings.templates.repRejected || ''}
                      onChange={e => setSmsSettings({
                        ...smsSettings,
                        templates: { ...smsSettings.templates, repRejected: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-lg border bg-white leading-relaxed font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
                <button
                  type="submit"
                  disabled={smsConfigLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow cursor-pointer text-xs transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {smsConfigLoading ? 'সংরক্ষণ করা হচ্ছে...' : 'এসএমএস গেটওয়ে ও টেমপ্লেটসমূহ সংরক্ষণ করুন'}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Manual SMS Sender */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
                  <Send className="w-4 h-4 text-sky-600" />
                  ম্যানুয়াল ইনস্ট্যান্ট SMS পাঠান (Send Custom SMS)
                </h2>

                <form onSubmit={handleSendCustomSmsSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-800">প্রাপকের নাম (অপশনাল)</label>
                    <input
                      type="text"
                      placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                      value={customSmsForm.recipientName}
                      onChange={e => setCustomSmsForm({ ...customSmsForm, recipientName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-800">প্রাপকের মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      required
                      placeholder="017XXXXXXXX"
                      value={customSmsForm.mobile}
                      onChange={e => setCustomSmsForm({ ...customSmsForm, mobile: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-800">SMS বার্তা বিষয়বস্তু *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="আপনার কাস্টম মেসেজ এখানে লিখুন..."
                      value={customSmsForm.messageText}
                      onChange={e => setCustomSmsForm({ ...customSmsForm, messageText: e.target.value })}
                      className="w-full p-2.5 rounded-xl border bg-slate-50 leading-relaxed"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    তাত্ক্ষণিক SMS পাঠান
                  </button>
                </form>
              </div>

              {/* SMS Logs Table */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="font-bold text-slate-900 text-sm">
                    সাম্প্রতিক পাঠানো SMS লগ (Sent SMS Logs)
                  </h2>
                  <span className="text-[11px] font-bold text-slate-500">মোট: {smsLogs.length} টি</span>
                </div>

                <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-200 font-bold uppercase sticky top-0">
                      <tr>
                        <th className="p-2.5">তারিখ & সময়</th>
                        <th className="p-2.5">প্রাপক & মোবাইল</th>
                        <th className="p-2.5">মেসেজ কনটেন্ট</th>
                        <th className="p-2.5">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {smsLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-400">
                            এখনো কোনো SMS পাঠানো হয়নি।
                          </td>
                        </tr>
                      ) : (
                        smsLogs.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                              {s.sentAt || new Date().toLocaleString('bn-BD')}
                            </td>
                            <td className="p-2.5">
                              <span className="font-bold text-slate-900 block">{s.recipientName || 'গ্রাহক'}</span>
                              <span className="font-mono text-[11px] text-sky-700 font-bold">{s.mobile}</span>
                            </td>
                            <td className="p-2.5 text-slate-700 leading-snug max-w-xs">{s.messageText}</td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${s.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {s.status === 'DELIVERED' ? '✓ SENT' : '✕ FAILED'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: PASSWORDS MANAGEMENT */}
        {activeSubTab === 'passwords' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <Key className="w-6 h-6 text-amber-400" />
                  ব্যবহারকারীদের পাসওয়ার্ড কন্ট্রোল ও রিসেট সেন্টার
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  সুপার এডমিন, স্টাফ, ডায়াগনস্টিক পার্টনার, মাঠ প্রতিনিধি, ডাক্তার এবং কার্ড মেম্বারদের পাসওয়ার্ড পরিবর্তন করুন
                </p>
              </div>
              <button
                onClick={fetchUserPasswordList}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" /> রিফ্রেশ করুন
              </button>
            </div>

            {/* Section 1: Change My Admin Password */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                নিজের এডমিন পাসওয়ার্ড পরিবর্তন করুন ({user.email || user.mobile})
              </h3>

              {passwordMsg && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleChangeMyPassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs max-w-3xl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">বর্তমান পাসওয়ার্ড *</label>
                  <input
                    type="password"
                    required
                    value={myPasswordForm.oldPassword}
                    onChange={e => setMyPasswordForm({ ...myPasswordForm, oldPassword: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                    placeholder="বর্তমান পাসওয়ার্ড"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">নতুন পাসওয়ার্ড *</label>
                  <input
                    type="password"
                    required
                    value={myPasswordForm.newPassword}
                    onChange={e => setMyPasswordForm({ ...myPasswordForm, newPassword: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                    placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর)"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">কনফার্ম পাসওয়ার্ড *</label>
                  <input
                    type="password"
                    required
                    value={myPasswordForm.confirmPassword}
                    onChange={e => setMyPasswordForm({ ...myPasswordForm, confirmPassword: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                    placeholder="পুনরায় নতুন পাসওয়ার্ড"
                  />
                </div>
                <div className="sm:col-span-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow cursor-pointer transition text-xs flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> পাসওয়ার্ড পরিবর্তন করুন
                  </button>
                </div>
              </form>
            </div>

            {/* Section 2: All System Users Password List & Quick Reset */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    সকল ব্যবহারকারীর পাসওয়ার্ড ম্যানেজমেন্ট তালিকা
                  </h3>
                  <p className="text-xs text-slate-500">যে কোনো অ্যাকাউন্ট সার্চ করে ক্লিক করলেই পাসওয়ার্ড রিসেট বা পরিবর্তন করতে পারবেন</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="নাম, মোবাইল বা ইমেইল দিয়ে সার্চ..."
                    value={passwordSearchTerm}
                    onChange={e => setPasswordSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">ব্যবহারকারী & রোল</th>
                      <th className="p-3">মোবাইল & ইমেইল</th>
                      <th className="p-3">পাসওয়ার্ড স্ট্যাটাস</th>
                      <th className="p-3 text-center">নতুন পাসওয়ার্ড সেটিং</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {userPasswordList
                      .filter(u =>
                        u.name.toLowerCase().includes(passwordSearchTerm.toLowerCase()) ||
                        u.mobile.includes(passwordSearchTerm) ||
                        u.email.toLowerCase().includes(passwordSearchTerm.toLowerCase()) ||
                        u.role.toLowerCase().includes(passwordSearchTerm.toLowerCase()) ||
                        u.id.toLowerCase().includes(passwordSearchTerm.toLowerCase())
                      )
                      .map((u, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase mt-0.5 ${
                              u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                              u.role === 'ADMIN_STAFF' ? 'bg-sky-100 text-sky-800' :
                              u.role === 'DIAGNOSTIC_PARTNER' ? 'bg-amber-100 text-amber-800' :
                              u.role === 'REPRESENTATIVE' ? 'bg-emerald-100 text-emerald-800' :
                              u.role === 'DOCTOR' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono">
                            <p className="font-bold text-slate-800">{u.mobile}</p>
                            <p className="text-[11px] text-slate-500">{u.email || '—'}</p>
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              u.isDefault ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {u.isDefault ? 'ডিফল্ট পাসওয়ার্ড (123456/মোবাইল)' : 'কাস্টম পাসওয়ার্ড সেট করা'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                const newPass = prompt(`${u.name} (${u.role})-এর জন্য নতুন পাসওয়ার্ড দিন:`, '123456');
                                if (newPass) {
                                  handleResetUserPassword(u.mobile || u.email || u.id, newPass);
                                }
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow cursor-pointer transition text-[11px] inline-flex items-center gap-1"
                            >
                              <Key className="w-3.5 h-3.5" /> পাসওয়ার্ড রিসেট
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

        {/* SUBTAB: ROLES & PERMISSIONS SETUP (Point #3) */}
        {activeSubTab === 'roles' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-purple-600" />
                  নতুন কাস্টম রোল ক্রিয়েট ও পারমিশন সেটআপ কাস্টমাইজেশন
                </h1>
                <p className="text-xs text-slate-500">
                  সিস্টেম ইউজারদের জন্য কাস্টম রোল তৈরি করুন এবং গ্র্যানুলার অ্যাক্সেস পারমিশন কন্ট্রোল করুন।
                </p>
              </div>

              <button
                onClick={() => setRoleModalOpen(true)}
                className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold rounded-xl text-xs shadow flex items-center gap-2 cursor-pointer transition self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> নতুন রোল তৈরি করুন
              </button>
            </div>

            {/* Custom Roles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Default System Roles */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-extrabold text-purple-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" /> SUPER_ADMIN (সুপার এডমিন)
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                    ডিফল্ট সিস্টেম রোল
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  সিস্টেমের পূর্ণ নিয়ন্ত্রণ, সকল পারমিশন, পাসওয়ার্ড রিসেট, ফিন্যান্স ও ডায়াগনস্টিক ব্যাকএন্ড অ্যাক্সেস।
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">✓ সকল পারমিশন সক্রিয়</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-extrabold text-sky-900 text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-600" /> ADMIN_STAFF (এডমিন স্টাফ)
                  </span>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
                    ডিফল্ট সিস্টেম রোল
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  কার্ড অনুমোদন, মেম্বার সার্চ, এসএমএস সেন্ড ও রিপোর্ট দেখার পারমিশন সম্বলিত এক্সিকিউটিভ রোল।
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">✓ কার্ড এপ্রুভাল</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">✓ এসএমএস পাঠানো</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">✓ মেম্বারশিপ ফিল্টারিং</span>
                </div>
              </div>

              {/* Custom Dynamic Roles */}
              {customRoles.map(role => (
                <div key={role.id} className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm space-y-3 relative">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-600" /> {role.roleName}
                    </span>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-rose-600 hover:text-rose-800 font-bold text-[11px] underline cursor-pointer"
                    >
                      ডিলিট
                    </button>
                  </div>
                  <p className="text-slate-600 text-[11px]">{role.description || 'কাস্টম পারমিশন সেটআপ'}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {role.permissions.canApproveCards && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">✓ কার্ড এপ্রুভাল</span>}
                    {role.permissions.canManagePrices && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">✓ মূল্য তালিকা কন্ট্রোল</span>}
                    {role.permissions.canSendSMS && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">✓ বাল্ক এসএমএস</span>}
                    {role.permissions.canViewRevenue && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">✓ রাজস্ব হিসেব</span>}
                    {role.permissions.canEditNotices && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">✓ পেজ কনটেন্ট এডিট</span>}
                    {role.permissions.canManagePartners && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">✓ পার্টনার ম্যানেজমেন্ট</span>}
                    {role.permissions.canManageReps && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">✓ প্রতিনিধি তদারকি</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 border-t">তৈরির তারিখ: {role.createdAt}</p>
                </div>
              ))}
            </div>

            {/* Create Role Modal */}
            {roleModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl w-full max-w-lg space-y-4 animate-scaleUp">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-purple-600" />
                      নতুন কাস্টম এডমিন রোল তৈরি করুন
                    </h3>
                    <button onClick={() => setRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
                  </div>

                  <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold mb-1 text-slate-800">রোলের নাম (Role Name) *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: আঞ্চলিক সুপারভাইজার / ফাইন্যান্স ম্যানেজার"
                        value={roleForm.roleName}
                        onChange={e => setRoleForm({ ...roleForm, roleName: e.target.value })}
                        className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-slate-800">বিবরণ / দায়িত্ব</label>
                      <input
                        type="text"
                        placeholder="সংক্ষিপ্ত কাজের বিবরণ"
                        value={roleForm.description}
                        onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                        className="w-full p-2.5 rounded-xl border bg-slate-50"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <p className="font-extrabold text-slate-900 mb-1">পারমিশন সেটআপ করুন (Granular Permissions):</p>
                      
                      {[
                        { key: 'canApproveCards', label: 'মেডিকেল কার্ড ও আবেদন অনুমোদন' },
                        { key: 'canManagePrices', label: 'ডায়াগনস্টিক পরীক্ষার ডিসকাউন্ট মূল্য তালিকা এডিট' },
                        { key: 'canSendSMS', label: 'বাল্ক এসএমএস ও বাল্ক মেম্বারশিপ বার্তা প্রেরণ' },
                        { key: 'canViewRevenue', label: 'আর্থিক রাজস্ব ও বিতরণ কমিশন প্রতিবেদন দর্শন' },
                        { key: 'canEditNotices', label: 'সাইট নোটিশ, হোমপেজ ও ডায়নামিক পেজ আপডেট' },
                        { key: 'canManagePartners', label: 'নতুন ডায়াগনস্টিক সেন্টার ও হাসপাতাল অনুমোদন' },
                        { key: 'canManageReps', label: 'ফিল্ড রিপ্রেজেন্টেটিভ নিয়োগ ও কার্ড বরাদ্দ' }
                      ].map(perm => (
                        <label key={perm.key} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border hover:bg-slate-100 cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={Boolean(roleForm.permissions[perm.key as keyof typeof roleForm.permissions])}
                            onChange={e => setRoleForm({
                              ...roleForm,
                              permissions: {
                                ...roleForm.permissions,
                                [perm.key]: e.target.checked
                              }
                            })}
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                          />
                          <span className="font-bold text-slate-800">{perm.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setRoleModalOpen(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold rounded-xl shadow cursor-pointer transition"
                      >
                        রোল সেভ করুন
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB: AUDIT LOGS */}
        {activeSubTab === 'audit' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">সিস্টেম সিকিউরিটি Audit Log</h1>
              <p className="text-xs text-slate-500">অ্যাডমিন, রিপ্রেজেন্টেটিভ ও ইউজারদের সকল গুরুত্বপূর্ণ পরিবর্তন ও ট্রানজেকশনের অডিট রেকর্ড</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 font-bold uppercase">
                    <tr>
                      <th className="p-3">আইডি & সময়</th>
                      <th className="p-3">একশন ধরন (Action)</th>
                      <th className="p-3">সম্পাদনকারী (Performed By)</th>
                      <th className="p-3">বিস্তারিত তথ্য (Details)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditLogs.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-[11px]">
                          <span className="font-bold text-sky-700 block">{a.id}</span>
                          <span className="text-slate-400 text-[10px]">{new Date(a.timestamp).toLocaleString('bn-BD')}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {a.action}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{a.performedBy}</td>
                        <td className="p-3 text-slate-600 leading-relaxed">{a.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TOP BANNER ANNOUNCEMENT & MARQUEE SETTINGS (CMS) */}
        {activeSubTab === 'cms' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Header Announcement & Marquee Notice Settings
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  টপ হেডার স্ক্রলিং নোটিশ ও এনাউন্সমেন্ট ম্যানেজার
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  ওয়েবসাইটের একদম উপরে যে স্ক্রলিং টেক্সট নোটিশটি দেখায় তা এখান থেকে পরিবর্তন করতে পারবেন।
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveBannerSettings}
                  disabled={bannerLoading}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {bannerLoading ? 'সংরক্ষণ করা হচ্ছে...' : 'নোটিশ সেটিংস সেভ করুন'}
                </button>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>🔴 লাইভ স্ক্রলিং প্রিভিউ (Live Header Preview)</span>
                <span>স্ট্যাটাস: {bannerSettings.enabled ? '✓ সচল (Active)' : '⚠️ বন্ধ (Disabled)'}</span>
              </div>

              {bannerSettings.enabled ? (
                <div className="bg-gradient-to-r from-blue-900 via-sky-800 to-emerald-800 text-white py-2 px-4 text-xs rounded-xl overflow-hidden shadow-inner flex items-center gap-3">
                  {bannerSettings.badgeText && (
                    <span className="bg-emerald-500 text-white font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full flex-shrink-0 animate-pulse">
                      {bannerSettings.badgeText}
                    </span>
                  )}
                  <div className="relative w-full overflow-hidden whitespace-nowrap">
                    <div
                      className="animate-marquee hover:[animation-play-state:paused] cursor-pointer inline-flex"
                      style={{
                        animationDuration: bannerSettings.speed === 'slow' ? '35s' : bannerSettings.speed === 'fast' ? '12s' : '22s'
                      }}
                    >
                      <span className="text-sky-100 font-medium pr-12">
                        {bannerSettings.noticeText || 'কোনো নোটিশ টেক্সট লিখা হয়নি'}
                      </span>
                      <span className="text-sky-100 font-medium pr-12">
                        {bannerSettings.noticeText || 'কোনো নোটিশ টেক্সট লিখা হয়নি'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-800 rounded-xl text-center text-xs text-slate-400">
                  টপ হেডার নোটিশ ব্যানারটি বর্তমানে বন্ধ রাখা হয়েছে।
                </div>
              )}
            </div>

            {/* Settings Form Grid */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4 text-sky-600" />
                  নোটিশ কনফিগারেশন
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bannerSettings.enabled}
                    onChange={e => setBannerSettings({ ...bannerSettings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-3 text-xs font-bold text-slate-700">
                    {bannerSettings.enabled ? 'ব্যানার সচল (Show)' : 'ব্যানার বন্ধ (Hide)'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Badge Text */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    ব্যানার ব্যাজ/ট্যাগ (Badge Label)
                  </label>
                  <input
                    type="text"
                    value={bannerSettings.badgeText}
                    onChange={e => setBannerSettings({ ...bannerSettings, badgeText: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-emerald-700"
                    placeholder="যেমন: PILOT PROJECT বা নতুন নোটিশ"
                  />
                  <p className="text-[11px] text-slate-500">
                    স্ক্রলিং নোটিশের পাশে সবুজ রঙের ছোট ব্যাজ হিসেবে দেখাবে।
                  </p>
                </div>

                {/* Scroll Speed */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    স্ক্রলিং স্পিড (Scroll Speed)
                  </label>
                  <select
                    value={bannerSettings.speed}
                    onChange={e => setBannerSettings({ ...bannerSettings, speed: e.target.value as any })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800"
                  >
                    <option value="slow">ধীরগতি (Slow - 35s)</option>
                    <option value="normal">স্বাভাবিক (Normal - 22s)</option>
                    <option value="fast">দ্রুত (Fast - 12s)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    স্ক্রলিং টেক্সটের চলাচলের গতি নির্ধারণ করুন।
                  </p>
                </div>

                {/* Announcement Notice Text */}
                <div className="md:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-800">
                    মূল স্ক্রলিং নোটিশ বার্তা (Marquee Announcement Text) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={bannerSettings.noticeText}
                    onChange={e => setBannerSettings({ ...bannerSettings, noticeText: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 leading-relaxed font-medium"
                    placeholder="গোপালগঞ্জ, নড়াইল ও সিলেট জেলায় পাইলট প্রজেক্ট চালু রয়েছে!..."
                  />
                  <p className="text-[11px] text-slate-500">
                    এই বার্তাটি হোমপেজ ও সকল পেজের একদম উপরে সারাসরি ডান থেকে বামে স্ক্রল করবে।
                  </p>
                </div>

                {/* Hotline */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    হেডার হটলাইন নম্বর (Hotline Phone)
                  </label>
                  <input
                    type="text"
                    value={bannerSettings.hotline}
                    onChange={e => setBannerSettings({ ...bannerSettings, hotline: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800"
                    placeholder="+8809658887470"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    হেডার সাপোর্ট ইমেইল (Support Email)
                  </label>
                  <input
                    type="email"
                    value={bannerSettings.email}
                    onChange={e => setBannerSettings({ ...bannerSettings, email: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800"
                    placeholder="health@nit.bd"
                  />
                </div>

              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  onClick={handleSaveBannerSettings}
                  disabled={bannerLoading}
                  className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {bannerLoading ? 'সংরক্ষণ করা হচ্ছে...' : 'নোটিশ সেটিংস সেভ করুন'}
                </button>
              </div>

            </div>

            {/* SITE BRANDING, HOTLINE, EMAIL & ADDRESS SETTINGS FORM (Requirement #9) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b pb-4">
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Site Information & Branding Settings
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1 flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  সাইট তথ্য, হেল্প নাম্বার, ইমেইল, এড্রেস ও লোগো ম্যানেজার
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ওয়েবসাইটের ফুটারে, হেডারে ও কন্টাক্ট পেজে প্রদর্শিত ফোন নম্বর, ইমেইল, অফিস ঠিকানা ও ব্র্যান্ডের লোগো এখান থেকে আপডেট করুন।
                </p>
              </div>

              <form onSubmit={handleSaveSiteSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Site Title / Tab Title */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">ওয়েবসাইট ব্রাউজার টাইটেল (Browser Tab Title) *</label>
                    <input
                      type="text"
                      required
                      value={siteSettings.siteTitle || ''}
                      onChange={e => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                      placeholder="যেমন: DMB Health Portal - ডিজিটাল হেলথ কার্ড ও স্বাস্থ্য সেবা"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">সাইট / ব্র্যান্ডের নাম</label>
                    <input
                      type="text"
                      value={siteSettings.siteName || ''}
                      onChange={e => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">ব্র্যান্ড ট্যাগলাইন (Tagline)</label>
                    <input
                      type="text"
                      value={siteSettings.siteTagline || ''}
                      onChange={e => setSiteSettings({ ...siteSettings, siteTagline: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                      placeholder="যেমন: স্মার্ট স্বাস্থ্য সেবায় আপনার নির্ভরযোগ্য ডিজিটাল হেলথ পার্টনার"
                    />
                  </div>

                  {/* Direct Logo File Upload */}
                  <div className="sm:col-span-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                    <label className="block font-bold text-slate-800">ব্র্যান্ড লোগো ফাইল আপলোড (Logo File Upload)</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {siteSettings.logoUrl ? (
                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto">
                          <img src={siteSettings.logoUrl} alt="Site Logo" className="h-12 max-w-[150px] object-contain border rounded-lg bg-slate-50 p-1" />
                          <button
                            type="button"
                            onClick={() => setSiteSettings({ ...siteSettings, logoUrl: '' })}
                            className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition cursor-pointer"
                          >
                            লোগো মুছে ফেলুন
                          </button>
                        </div>
                      ) : (
                        <label className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-white rounded-xl cursor-pointer hover:bg-indigo-50/50 transition">
                          <Upload className="w-5 h-5 text-indigo-600" />
                          <span className="font-bold text-indigo-900 text-xs">কম্পিউটার/মোবাইল থেকে লোগো আপলোড করুন (PNG/JPG/SVG)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  alert('ফাইল সাইজ সর্বোচ্চ 5MB হতে পারবে');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  setSiteSettings({ ...siteSettings, logoUrl: ev.target?.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Direct Favicon File Upload */}
                  <div className="sm:col-span-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3">
                    <label className="block font-bold text-slate-800">ব্রাউজার ফেভিকন আইকন আপলোড (Favicon Upload)</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {siteSettings.faviconUrl ? (
                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto">
                          <img src={siteSettings.faviconUrl} alt="Favicon" className="w-10 h-10 object-contain border rounded-lg bg-slate-50 p-1" />
                          <span className="text-[10px] text-emerald-700 font-bold">✓ ফেভিকন সেভ আছে</span>
                          <button
                            type="button"
                            onClick={() => setSiteSettings({ ...siteSettings, faviconUrl: '' })}
                            className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition cursor-pointer"
                          >
                            ফেভিকন মুছে ফেলুন
                          </button>
                        </div>
                      ) : (
                        <label className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white rounded-xl cursor-pointer hover:bg-emerald-50/50 transition">
                          <Upload className="w-5 h-5 text-emerald-600" />
                          <span className="font-bold text-emerald-900 text-xs">ডিভাইস থেকে ফেভিকন ফাইল আপলোড করুন (.ico, .png, .jpg)</span>
                          <input
                            type="file"
                            accept="image/*,.ico"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                  alert('ফাইল সাইজ সর্বোচ্চ 2MB হতে পারবে');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  setSiteSettings({ ...siteSettings, faviconUrl: ev.target?.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">হটলাইন / হেল্পলাইন নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={siteSettings.hotline}
                      onChange={e => setSiteSettings({ ...siteSettings, hotline: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-sky-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">সেকেন্ডারি ফোন নম্বর</label>
                    <input
                      type="text"
                      value={siteSettings.phone}
                      onChange={e => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">অফিসিয়াল সাপোর্ট ইমেইল *</label>
                    <input
                      type="email"
                      required
                      value={siteSettings.email}
                      onChange={e => setSiteSettings({ ...siteSettings, email: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">ইমার্জেন্সি হেল্পলাইন (যেমন: 999)</label>
                    <input
                      type="text"
                      value={siteSettings.dhakaOffice || ''}
                      onChange={e => setSiteSettings({ ...siteSettings, dhakaOffice: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                      placeholder="ঢাকায় যোগাযোগ / সেন্ট্রাল হেল্প"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">প্রধান কার্যালয়ের সম্পূর্ণ ঠিকানা (Full Office Address) *</label>
                    <textarea
                      rows={2}
                      required
                      value={siteSettings.address}
                      onChange={e => setSiteSettings({ ...siteSettings, address: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800"
                    />
                  </div>

                  {/* Header Navigation Menu Labels Customization Section */}
                  <div className="sm:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 my-2">
                    <div className="border-b pb-2">
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <Menu className="w-4 h-4 text-indigo-600" />
                        হেডার নেভিগেশন মেনু বার কাস্টমাইজেশন (Editable Navigation Menu Labels)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        ওয়েবসাইটের উপরের ড্রপডাউন মেনু এবং সকল বাটন সমূহের নাম এখান থেকে পরিবর্তনের সুযোগ রাখা হয়েছে।
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">১. হোম বাটন (Home)</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.home || 'হোম'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), home: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">২. ড্রপডাউন ১ (আমাদের ও সেবা)</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.aboutGroup || 'আমাদের ও সেবা ▾'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), aboutGroup: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">-- আমাদের সম্পর্কে সাব-মেনু</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.about || 'আমাদের সম্পর্কে'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), about: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">-- সেবাসমূহ সাব-মেনু</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.services || 'সেবাসমূহ'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), services: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">৩. ড্রপডাউন ২ (মেডিক্যাল কার্ড)</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.cardGroup || 'মেডিক্যাল কার্ড ▾'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), cardGroup: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">-- মেডিক্যাল কার্ড সাব-মেনু</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.medicalCard || 'মেডিক্যাল কার্ড'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), medicalCard: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">-- কার্ডের আবেদন সাব-মেনু</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.applyCard || 'কার্ডের আবেদন'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), applyCard: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">৪. বিজ্ঞপ্তি মেনু (Notice)</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.notice || 'বিজ্ঞপ্তি'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), notice: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">৫. ড্রপডাউন ৩ (ডায়াগনস্টিক & টেস্ট)</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.diagnosticGroup || 'ডায়াগনস্টিক & টেস্ট ▾'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), diagnosticGroup: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">-- ডায়াগনস্টিক সেন্টার সাব-মেনু</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.diagnosticCenter || 'ডায়াগনস্টিক সেন্টার'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), diagnosticCenter: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">-- টেস্ট ফি তালিকা সাব-মেনু</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.testPrices || 'টেস্ট ফি তালিকা'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), testPrices: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">৬. হেলথ প্যাকেজ মেনু</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.packages || 'হেলথ প্যাকেজ'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), packages: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">৭. 'আরও' ড্রপডাউন (More)</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.moreGroup || 'আরও ▾'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), moreGroup: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">৮. কার্ড ভেরিফাই বাটন</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.verifyBtn || 'কার্ড ভেরিফাই'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), verifyBtn: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">৯. লগইন / পোর্টাল বাটন</label>
                        <input
                          type="text"
                          value={siteSettings.navLabels?.loginBtn || 'লগইন / পোর্টাল'}
                          onChange={e => setSiteSettings({
                            ...siteSettings,
                            navLabels: { ...(siteSettings.navLabels || {}), loginBtn: e.target.value }
                          })}
                          className="w-full p-2.5 rounded-xl border bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="submit"
                    disabled={siteSettingsLoading}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {siteSettingsLoading ? 'সংরক্ষণ করা হচ্ছে...' : 'সাইট টাইটেল, ফেভিকন ও লোগো আপডেট করুন'}
                  </button>
                </div>
              </form>
            </div>

            {/* MEDICAL CARD DESIGN, COLOR (SILVER, GOLD, PLATINUM), LOGO & SLOGAN MANAGER */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Medical Card Design & Branding
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    মেডিকেল কার্ড ডিজাইন, তিন ধরণের কালার (সিলভার, গোল্ড, প্লাটিনাম), লোগো ও স্লোগান ম্যানেজার
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    সিলভার, গোল্ড এবং প্লাটিনাম কার্ডের কালার থিম, লোগো, স্লোগান, হেল্পলাইন ও ফুটোর ব্র্যান্ডিং পরিবর্তন করুন। কার্ডের ফ্রন্ট ও ব্যাক উভয় সাইডের কালার হুবহু একই থাকবে।
                  </p>
                </div>

                {/* Live Preview Tier Selector Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCardDesignPreviewTier('Silver')}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                      cardDesignPreviewTier === 'Silver'
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    🥈 সিলভার (Silver)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardDesignPreviewTier('Gold')}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                      cardDesignPreviewTier === 'Gold'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    🏆 গোল্ড (Gold)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardDesignPreviewTier('Platinum')}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                      cardDesignPreviewTier === 'Platinum'
                        ? 'bg-cyan-700 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    👑 প্লাটিনাম (Platinum)
                  </button>
                </div>
              </div>

              {/* REAL-TIME CARD PREVIEW BOX */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner flex flex-col items-center gap-3">
                <div className="flex items-center justify-between w-full max-w-md text-slate-300 text-xs font-bold px-2">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    লাইভ রিভিউ: {cardDesignPreviewTier === 'Silver' ? '🥈 সিলভার কার্ড (Silver)' : cardDesignPreviewTier === 'Gold' ? '🏆 গোল্ড কার্ড (Gold)' : '👑 প্লাটিনাম কার্ড (Platinum)'}
                  </span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                    ✓ ফ্রন্ট ও ব্যাকের কালার হুবহু এক
                  </span>
                </div>

                <div className="w-full flex justify-center">
                  <MedicalCardPrint
                    showPrintButton={false}
                    cardDesignSettings={cardDesignSettings}
                    card={{
                      id: 'ADMIN-PREVIEW-CARD',
                      cardId: 'DMB-2026-8888',
                      memberName: 'মোঃ রফিকুল ইসলাম (সদস্য)',
                      mobileNumber: '01700000000',
                      bloodGroup: 'B+',
                      nidOrBirthCert: '19923512894109',
                      district: 'গোপালগঞ্জ',
                      upazila: 'গোপালগঞ্জ সদর',
                      address: 'গ্রাম: চন্দ্রদিঘলিয়া, গোপালগঞ্জ সদর',
                      issueDate: '2026-01-15',
                      expiryDate: '2027-01-14',
                      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                      qrCodeDataUrl: '',
                      cardTier: cardDesignPreviewTier,
                      status: 'ACTIVE',
                      beneficiaries: ['মোঃ রফিকুল ইসলাম (নিজ)', 'মোসাম্মৎ রেহানা বেগম (স্ত্রী)', 'রাকিব ইসলাম (পুত্র)']
                    }}
                  />
                </div>
              </div>

              {/* EDIT FORM */}
              <form onSubmit={handleSaveCardDesignSettings} className="space-y-6 text-xs">
                {/* General Header & Brand Settings */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b pb-2 text-indigo-900">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    ১. ব্র্যান্ড নেম, স্লোগান, লোগো ও সার্বিক কন্টেন্ট
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">কার্ড হেডার শিরোনাম (Header Title)</label>
                      <input
                        type="text"
                        required
                        value={cardDesignSettings.headerTitle}
                        onChange={e => setCardDesignSettings({ ...cardDesignSettings, headerTitle: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                        placeholder="DIGITAL MEDI BRIDGE"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">কার্ড হেডার সাবটাইটেল (Header Subtitle)</label>
                      <input
                        type="text"
                        value={cardDesignSettings.headerSubtitle}
                        onChange={e => setCardDesignSettings({ ...cardDesignSettings, headerSubtitle: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                        placeholder="Healthcare Service Platform & Medical Network"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">লোগো টেক্সট (Fallback Logo Text)</label>
                      <input
                        type="text"
                        value={cardDesignSettings.logoText}
                        onChange={e => setCardDesignSettings({ ...cardDesignSettings, logoText: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold"
                        placeholder="DMB"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">লোগো ছবি আপলোড (Custom Logo Image Upload)</label>
                      <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-300">
                        {cardDesignSettings.logoUrl ? (
                          <div className="flex items-center gap-3 w-full">
                            <img
                              src={cardDesignSettings.logoUrl}
                              alt="Card Logo"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-800 truncate">লোগো আপলোড সম্পন্ন</p>
                              <p className="text-[10px] text-emerald-600 font-medium">✓ কার্ডে দেখা যাবে</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCardDesignSettings({ ...cardDesignSettings, logoUrl: '' })}
                              className="px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 cursor-pointer transition-colors"
                            >
                              রিমুভ করুন
                            </button>
                          </div>
                        ) : (
                          <div className="w-full">
                            <input
                              type="file"
                              accept="image/*"
                              id="logo-file-upload-input"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 3 * 1024 * 1024) {
                                    alert('ছবিটি ৩ মেগাবাইটের চেয়ে ছোট হতে হবে।');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setCardDesignSettings({
                                        ...cardDesignSettings,
                                        logoUrl: event.target.result as string
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor="logo-file-upload-input"
                              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border border-dashed border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                            >
                              <Upload className="w-4 h-4 text-slate-500" />
                              কম্পিউটার/মোবাইল থেকে লোগো ছবি সিলেক্ট করুন
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-800 mb-1">কার্ড স্লোগান / বার্তা (Card Slogan)</label>
                      <input
                        type="text"
                        required
                        value={cardDesignSettings.slogan}
                        onChange={e => setCardDesignSettings({ ...cardDesignSettings, slogan: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900"
                        placeholder="স্মার্ট স্বাস্থ্য সেবায় আপনার নির্ভরযোগ্য ডিজিটাল হেলথ পার্টনার"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">কার্ড হেল্পলাইন নাম্বার (Helpline)</label>
                      <input
                        type="text"
                        required
                        value={cardDesignSettings.helpline}
                        onChange={e => setCardDesignSettings({ ...cardDesignSettings, helpline: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-sky-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">ওয়েবসাইট ইউআরএল (Website Link)</label>
                      <input
                        type="text"
                        value={cardDesignSettings.websiteUrl}
                        onChange={e => setCardDesignSettings({ ...cardDesignSettings, websiteUrl: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-emerald-800 font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-800 mb-1">কার্ডের পিছনের সতর্কবার্তা (Back Disclaimer Note)</label>
                      <textarea
                        rows={2}
                        value={cardDesignSettings.disclaimerText}
                        onChange={e => setCardDesignSettings({ ...cardDesignSettings, disclaimerText: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* TIER COLORS & PRESET SELECTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 🥈 SILVER CARD TIER CONFIG */}
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
                      <span className="text-base">🥈</span>
                      <h4 className="font-extrabold text-slate-900 text-xs">১. সিলভার কার্ড (Silver Tier)</h4>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">কালার থিম প্রিসেট (Theme Preset)</label>
                      <select
                        value={cardDesignSettings.silverTheme?.presetKey || 'classic_silver'}
                        onChange={e => setCardDesignSettings({
                          ...cardDesignSettings,
                          silverTheme: { ...cardDesignSettings.silverTheme, presetKey: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        {Object.entries(TIER_PRESETS.Silver).map(([key, item]) => (
                          <option key={key} value={key}>{item.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">ব্যাজ টেক্সট (Badge Label)</label>
                      <input
                        type="text"
                        value={cardDesignSettings.silverTheme?.badgeText || 'সিলভার কার্ড (Silver Card)'}
                        onChange={e => setCardDesignSettings({
                          ...cardDesignSettings,
                          silverTheme: { ...cardDesignSettings.silverTheme, badgeText: e.target.value }
                        })}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">কাস্টম গ্রেডিয়েন্ট / CSS ক্লাসেস (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={cardDesignSettings.silverTheme?.customGradient || ''}
                        onChange={e => setCardDesignSettings({
                          ...cardDesignSettings,
                          silverTheme: { ...cardDesignSettings.silverTheme, customGradient: e.target.value }
                        })}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-mono text-[10px]"
                        placeholder="e.g. bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800"
                      />
                    </div>
                  </div>

                  {/* 🏆 GOLD CARD TIER CONFIG */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                      <span className="text-base">🏆</span>
                      <h4 className="font-extrabold text-amber-950 text-xs">২. গোল্ড কার্ড (Gold Tier)</h4>
                    </div>

                    <div>
                      <label className="block font-bold text-amber-950 mb-1">কালার থিম প্রিসেট (Theme Preset)</label>
                      <select
                        value={cardDesignSettings.goldTheme?.presetKey || 'royal_gold'}
                        onChange={e => setCardDesignSettings({
                          ...cardDesignSettings,
                          goldTheme: { ...cardDesignSettings.goldTheme, presetKey: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border border-amber-300 bg-white font-semibold text-amber-950"
                      >
                        {Object.entries(TIER_PRESETS.Gold).map(([key, item]) => (
                          <option key={key} value={key}>{item.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-amber-950 mb-1">ব্যাজ টেক্সট (Badge Label)</label>
                      <input
                        type="text"
                        value={cardDesignSettings.goldTheme?.badgeText || 'গোল্ড কার্ড (Gold Card)'}
                        onChange={e => setCardDesignSettings({
                          ...cardDesignSettings,
                          goldTheme: { ...cardDesignSettings.goldTheme, badgeText: e.target.value }
                        })}
                        className="w-full p-2 rounded-xl border border-amber-300 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-950 mb-1">কাস্টম গ্রেডিয়েন্ট / CSS ক্লাসেস (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={cardDesignSettings.goldTheme?.customGradient || ''}
                        onChange={e => setCardDesignSettings({
                          ...cardDesignSettings,
                          goldTheme: { ...cardDesignSettings.goldTheme, customGradient: e.target.value }
                        })}
                        className="w-full p-2 rounded-xl border border-amber-300 bg-white font-mono text-[10px]"
                        placeholder="e.g. bg-gradient-to-br from-amber-800 via-amber-700 to-yellow-800"
                      />
                    </div>
                  </div>

                  {/* 👑 PLATINUM CARD TIER CONFIG */}
                  <div className="p-4 rounded-2xl bg-cyan-950/10 border border-cyan-300 space-y-3">
                    <div className="flex items-center gap-2 border-b border-cyan-300 pb-2">
                      <span className="text-base">👑</span>
                      <h4 className="font-extrabold text-cyan-950 text-xs">৩. প্লাটিনাম কার্ড (Platinum Tier)</h4>
                    </div>

                    <div>
                      <label className="block font-bold text-cyan-950 mb-1">কালার থিম প্রিসেট (Theme Preset)</label>
                      <select
                        value={cardDesignSettings.platinumTheme?.presetKey || 'royal_platinum'}
                        onChange={e => setCardDesignSettings({
                          ...cardDesignSettings,
                          platinumTheme: { ...cardDesignSettings.platinumTheme, presetKey: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border border-cyan-300 bg-white font-semibold text-cyan-950"
                      >
                        {Object.entries(TIER_PRESETS.Platinum).map(([key, item]) => (
                          <option key={key} value={key}>{item.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-cyan-950 mb-1">ব্যাজ টেক্সট (Badge Label)</label>
                      <input
                        type="text"
                        value={cardDesignSettings.platinumTheme?.badgeText || 'প্লাটিনাম কার্ড (Platinum Card)'}
                        onChange={e => setCardDesignSettings({
                          ...cardDesignSettings,
                          platinumTheme: { ...cardDesignSettings.platinumTheme, badgeText: e.target.value }
                        })}
                        className="w-full p-2 rounded-xl border border-cyan-300 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-cyan-950 mb-1">কাস্টম গ্রেডিয়েন্ট / CSS ক্লাসেস (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={cardDesignSettings.platinumTheme?.customGradient || ''}
                        onChange={e => setCardDesignSettings({
                          ...cardDesignSettings,
                          platinumTheme: { ...cardDesignSettings.platinumTheme, customGradient: e.target.value }
                        })}
                        className="w-full p-2 rounded-xl border border-cyan-300 bg-white font-mono text-[10px]"
                        placeholder="e.g. bg-gradient-to-br from-slate-950 via-cyan-950 to-indigo-950"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    type="submit"
                    disabled={cardDesignLoading}
                    className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {cardDesignLoading ? 'সংরক্ষণ করা হচ্ছে...' : 'কার্ড ডিজাইন, কালার থিম ও স্লোগান সেভ করুন'}
                  </button>
                </div>
              </form>
            </div>

            {/* TESTIMONIALS & REVIEWS APPROVAL MANAGER (Requirement #11) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                <div>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Member Reviews & Testimonials
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    ইউজার প্যানেল থেকে প্রাপ্ত রিভিউ ও টেস্টিমোনিয়াল অনুমোদন
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    সদস্যদের জমা দেওয়া মতামতসমূহ পর্যালোচনা করে অনুমোদন করুন যাতে ওয়েবসাইট হোমপেজে প্রদর্শিত হয়।
                  </p>
                </div>
                <span className="self-start sm:self-auto bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                  মোট রিভিউ: {testimonials.length} টি ({testimonials.filter(t => t.status === 'PENDING').length} টি পেন্ডিং)
                </span>
              </div>

              {testimonials.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">এখনো কোনো রিভিউ জমা হয়নি।</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {testimonials.map(t => (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        t.status === 'APPROVED'
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-amber-50/60 border-amber-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-slate-300" />
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{t.name}</h4>
                            <p className="text-[11px] text-slate-500">{t.role} • {t.location}</p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            t.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-200 text-amber-900 border border-amber-400 animate-pulse'
                          }`}
                        >
                          {t.status === 'APPROVED' ? '✓ অনুমোদিত' : '⏳ পেন্ডিং'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 mb-2">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>

                      <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium text-[11px] mb-3 italic">
                        "{t.comment}"
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                        <span>আইডি: {t.id} {t.cardId && `• মেম্বার কার্ড: ${t.cardId}`}</span>
                        <div className="flex items-center gap-2">
                          {t.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleApproveTestimonial(t.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer shadow-sm"
                            >
                              এপ্রুভ করুন
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-lg transition cursor-pointer"
                          >
                            ডিলিট
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DYNAMIC PAGES CONTENT EDITOR (Point #4) */}
            {pageContent && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      Dynamic Pages CMS Editor
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      এবাউট আস, মেডিক্যাল কার্ড পেজ ও ইভেন্ট গ্যালারি ডায়নামিক আপডেট
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      অ্যাডমিন প্যানেল থেকে যেকোনো তথ্য পরিবর্তন করলে তা সরাসরি পাবলিক পেজগুলোতে রিয়েলটাইমে আপডেট হবে।
                    </p>
                  </div>

                  <button
                    onClick={handleSavePageContent}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-2 self-start sm:self-auto"
                  >
                    <Save className="w-4 h-4" /> সকল ডায়নামিক পেজ সেভ করুন
                  </button>
                </div>

                {/* Section 1: About Us Page Content */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-extrabold text-slate-900 text-sm border-b pb-2 text-emerald-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-600" />
                    ১. আমাদের কথা (About Us) পেজ কনটেন্ট
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold mb-1 text-slate-800">প্রধান শিরোনাম (Title)</label>
                      <input
                        type="text"
                        value={pageContent.aboutUs.title}
                        onChange={e => setPageContent({
                          ...pageContent,
                          aboutUs: { ...pageContent.aboutUs, title: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-slate-800">সংক্ষিপ্ত বিবরণ (Description)</label>
                      <input
                        type="text"
                        value={pageContent.aboutUs.description}
                        onChange={e => setPageContent({
                          ...pageContent,
                          aboutUs: { ...pageContent.aboutUs, description: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-slate-800">আমাদের লক্ষ্য (Mission Statement)</label>
                      <textarea
                        rows={3}
                        value={pageContent.aboutUs.mission}
                        onChange={e => setPageContent({
                          ...pageContent,
                          aboutUs: { ...pageContent.aboutUs, mission: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border bg-white leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-slate-800">আমাদের ভিশন (Vision Statement)</label>
                      <textarea
                        rows={3}
                        value={pageContent.aboutUs.vision}
                        onChange={e => setPageContent({
                          ...pageContent,
                          aboutUs: { ...pageContent.aboutUs, vision: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border bg-white leading-relaxed"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-bold mb-1 text-slate-800">ম্যানেজিং ডিরেক্টরের বার্তা (MD Message)</label>
                      <textarea
                        rows={3}
                        value={pageContent.aboutUs.mdMessage}
                        onChange={e => setPageContent({
                          ...pageContent,
                          aboutUs: { ...pageContent.aboutUs, mdMessage: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border bg-white leading-relaxed font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Medical Card Info Content */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-extrabold text-slate-900 text-sm border-b pb-2 text-sky-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    ২. মেডিক্যাল কার্ড নির্দেশিকা (Medical Card Page) কনটেন্ট
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold mb-1 text-slate-800">পেজ শিরোনাম (Page Title)</label>
                      <input
                        type="text"
                        value={pageContent.medicalCardInfo.title}
                        onChange={e => setPageContent({
                          ...pageContent,
                          medicalCardInfo: { ...pageContent.medicalCardInfo, title: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-slate-800">কার্ড নির্দেশিকা বিবরণ (Description)</label>
                      <input
                        type="text"
                        value={pageContent.medicalCardInfo.description}
                        onChange={e => setPageContent({
                          ...pageContent,
                          medicalCardInfo: { ...pageContent.medicalCardInfo, description: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border bg-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-bold mb-1 text-slate-800">কার্ড ব্যবহারের শর্তাবলী (Terms & Guidelines)</label>
                      <textarea
                        rows={3}
                        value={pageContent.medicalCardInfo.terms}
                        onChange={e => setPageContent({
                          ...pageContent,
                          medicalCardInfo: { ...pageContent.medicalCardInfo, terms: e.target.value }
                        })}
                        className="w-full p-2.5 rounded-xl border bg-white leading-relaxed font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Event Gallery Manager */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-extrabold text-slate-900 text-sm text-purple-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      ৩. ইভেন্ট ফটো গ্যালারি পেজ ম্যানেজার ({pageContent.eventGallery?.length || 0} টি ইভেন্ট)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setNewEventModal(true)}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> নতুন ইভেন্ট যোগ করুন
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    {(pageContent.eventGallery || []).map(evt => (
                      <div key={evt.id} className="bg-white rounded-xl border overflow-hidden shadow-sm flex flex-col justify-between">
                        <img src={evt.imageUrl} alt={evt.title} className="h-32 w-full object-cover" />
                        <div className="p-3 space-y-1">
                          <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded-full">{evt.category || 'Event'}</span>
                          <h5 className="font-bold text-slate-900 line-clamp-2">{evt.title}</h5>
                          <p className="text-[10px] text-slate-500">📍 {evt.location} ({evt.date})</p>
                        </div>
                        <div className="p-2 bg-slate-50 border-t flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedEvts = pageContent.eventGallery.filter(e => e.id !== evt.id);
                              setPageContent({ ...pageContent, eventGallery: updatedEvts });
                            }}
                            className="text-rose-600 hover:text-rose-800 font-bold text-[10px] underline cursor-pointer"
                          >
                            মুছে ফেলুন
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* New Event Modal */}
                {newEventModal && (
                  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl w-full max-w-md space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <h3 className="font-extrabold text-slate-900 text-base">নতুন ইভেন্ট গ্যালারিতে যোগ করুন</h3>
                        <button onClick={() => setNewEventModal(false)} className="text-slate-400 font-bold text-lg">✕</button>
                      </div>

                      <form onSubmit={handleAddEventToGallery} className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold mb-1">ইভেন্ট শিরোনাম *</label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: গোপালগঞ্জে ফ্রী মেডিকেল ক্যাম্প"
                            value={eventForm.title}
                            onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                            className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1">স্থান (Location)</label>
                          <input
                            type="text"
                            placeholder="গোপালগঞ্জ সদর"
                            value={eventForm.location}
                            onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                            className="w-full p-2.5 rounded-xl border bg-slate-50"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1">ইভেন্ট ছবি আপলোড (Event Photo Upload) *</label>
                          {eventForm.imageUrl ? (
                            <div className="flex items-center justify-between bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                              <div className="flex items-center gap-3">
                                <img src={eventForm.imageUrl} alt="Event Preview" className="w-14 h-10 object-cover rounded-lg border border-purple-300" />
                                <span className="text-[11px] font-bold text-purple-900">✓ ছবি আপলোড সম্পন্ন</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEventForm({ ...eventForm, imageUrl: '' })}
                                className="text-rose-600 font-bold text-[11px] underline cursor-pointer"
                              >
                                মুছে ফেলুন
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-purple-300 hover:border-purple-500 bg-slate-50 rounded-xl cursor-pointer hover:bg-purple-50/50 transition">
                              <Upload className="w-4 h-4 text-purple-600" />
                              <span className="font-bold text-purple-900 text-xs">গ্যালারি/ক্যামেরা থেকে ছবি নির্বাচন করুন</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 5 * 1024 * 1024) {
                                      alert('ফাইল সাইজ সর্বোচ্চ 5MB হতে পারবে');
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = ev => {
                                      setEventForm({ ...eventForm, imageUrl: ev.target?.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-bold mb-1">তারিখ</label>
                            <input
                              type="date"
                              value={eventForm.date}
                              onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                              className="w-full p-2.5 rounded-xl border bg-slate-50"
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1">ক্যাটাগরি</label>
                            <input
                              type="text"
                              value={eventForm.category}
                              onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                              className="w-full p-2.5 rounded-xl border bg-slate-50"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t">
                          <button
                            type="button"
                            onClick={() => setNewEventModal(false)}
                            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                          >
                            বাতিল
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-purple-700 text-white font-extrabold rounded-xl shadow"
                          >
                            যোগ করুন
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* HERO BANNER & TEXT MANAGEMENT TAB */}
        {activeSubTab === 'hero-banner' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Hero Section Content Management
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  হিরো ব্যানারের লেখা ও ছবি কাস্টমাইজেশন (Hero Banner CMS)
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  হোমপেজের একদম উপরে প্রদর্শিত প্রধান হিরো সেকশনের শিরোনাম, হাইলাইট লেখা, বিবরণ, বাটন টেক্সট, কাউন্টার এবং ব্যানার ইমেজ এডমিন থেকেই পরিবর্তন করুন।
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveHeroBannerSettings}
                  disabled={heroBannerLoading}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-900/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {heroBannerLoading ? 'সংরক্ষণ করা হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
                </button>
              </div>
            </div>

            {/* Live Hero Banner Preview Box */}
            <div className="bg-gradient-to-br from-blue-950 via-sky-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-sky-200">
                <span className="flex items-center gap-1.5 font-bold">
                  <Eye className="w-4 h-4 text-emerald-400" /> লাইভ হোমপেজ হিরো প্রিভিউ (Homepage Hero Preview)
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30 font-mono">
                  LIVE PREVIEW
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  {heroBannerSettings.badgeText && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{heroBannerSettings.badgeText}</span>
                    </div>
                  )}

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    {heroBannerSettings.title || 'ডিজিটাল মেডিক্যাল কার্ডের মাধ্যমে'} <br />
                    {heroBannerSettings.titleHighlight && (
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-sky-200 to-amber-200">
                        {heroBannerSettings.titleHighlight}
                      </span>
                    )}
                  </h3>

                  <p className="text-xs sm:text-sm text-sky-100 leading-relaxed whitespace-pre-line">
                    {heroBannerSettings.description || 'Digital Medi Bridge (DMB) হলো একটি আধুনিক Healthcare Network Platform।'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow">
                      {heroBannerSettings.primaryBtnText || 'মেডিক্যাল কার্ডের আবেদন করুন'}
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 font-semibold text-xs">
                      {heroBannerSettings.secondaryBtnText || 'কার্ড ভেরিফাই করুন'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-center sm:text-left text-xs">
                    <div>
                      <p className="font-extrabold text-emerald-300 font-mono text-base">{heroBannerSettings.stat1Value}</p>
                      <p className="text-[10px] text-sky-200">{heroBannerSettings.stat1Label}</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-sky-300 font-mono text-base">{heroBannerSettings.stat2Value}</p>
                      <p className="text-[10px] text-sky-200">{heroBannerSettings.stat2Label}</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-amber-300 font-mono text-base">{heroBannerSettings.stat3Value}</p>
                      <p className="text-[10px] text-sky-200">{heroBannerSettings.stat3Label}</p>
                    </div>
                  </div>
                </div>

                {/* Right Side Visual Preview */}
                <div className="lg:col-span-5 flex justify-center">
                  {heroBannerSettings.heroImage ? (
                    <div className="w-full max-w-xs rounded-2xl bg-white/10 p-2 border border-white/20 shadow-xl space-y-2">
                      <img
                        src={heroBannerSettings.heroImage}
                        alt="Uploaded Banner"
                        className="w-full h-48 object-cover rounded-xl shadow border border-white/10"
                      />
                      <p className="text-center text-[11px] text-emerald-300 font-medium">কাস্টম হিরো ব্যানার ইমেজ সচল রয়েছে</p>
                    </div>
                  ) : (
                    <div className="w-full max-w-xs rounded-2xl bg-white/10 p-4 border border-white/20 shadow-xl text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto border border-emerald-400/30">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">ডিফল্ট ডিজিটাল মেডিক্যাল কার্ড ভিউ</p>
                        <p className="text-[10px] text-sky-200 mt-1">কোনো কাস্টম ছবি আপলোড না থাকলে এই ভিউটি থাকবে।</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Editor Forms Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Image Banner Section */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    হিরো সেকশন ছবি ও ব্যানার (Hero Image)
                  </h3>
                  {heroBannerSettings.heroImage && (
                    <button
                      onClick={() => setHeroBannerSettings({ ...heroBannerSettings, heroImage: '' })}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> ছবি রিমুভ করুন
                    </button>
                  )}
                </div>

                {/* Upload Image Preview Box */}
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 text-center space-y-3 hover:border-sky-400 transition">
                  {heroBannerSettings.heroImage ? (
                    <div className="relative group">
                      <img
                        src={heroBannerSettings.heroImage}
                        alt="Hero Banner Preview"
                        className="w-full h-48 object-cover rounded-xl shadow border border-slate-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer shadow">
                          ছবি পরিবর্তন
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">গ্যালারি/কম্পিউটার থেকে ছবি আপলোড করুন</p>
                        <p className="text-[10px] text-slate-500">PNG, JPG, WEBP (সর্বোচ্চ ৫ মেগাবাইট)</p>
                      </div>
                      <label className="inline-block mt-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer shadow transition">
                        ছবি সিলেক্ট করুন
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Or Direct Image URL Input */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    অথবা ইমেজের সরাসরি ওয়েব লিংক (Image URL):
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or https://..."
                      value={heroBannerSettings.heroImage}
                      onChange={e => setHeroBannerSettings({ ...heroBannerSettings, heroImage: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 font-mono"
                    />
                    <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    💡 টিপস: ছবি আপলোড করলে বা লিংক দিলে তা হোমপেজের ডানপাশে কাস্টম ব্যানার হিসেবে ভেসে উঠবে। ফাকা রাখলে ডিফল্ট ডিজিটাল মেম্বারশিপ কার্ড কার্ড প্রিভিউ দেখাবে।
                  </p>
                </div>
              </div>

              {/* Text & Content Editor Section */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    হিরো টেক্সট ও কনটেন্ট সম্পাদক (Title & Text Settings)
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Badge Tagline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      হিরো ব্যাজ / ট্যাগলাইন (Small Badge Text):
                    </label>
                    <input
                      type="text"
                      placeholder="গোপালগঞ্জ জেলায় পাইলট প্রজেক্ট ফেজ ১ চালু"
                      value={heroBannerSettings.badgeText}
                      onChange={e => setHeroBannerSettings({ ...heroBannerSettings, badgeText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Title Main */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        প্রধান শিরোনাম (১ম লাইন):
                      </label>
                      <input
                        type="text"
                        placeholder="ডিজিটাল মেডিক্যাল কার্ডের মাধ্যমে"
                        value={heroBannerSettings.title}
                        onChange={e => setHeroBannerSettings({ ...heroBannerSettings, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        হাইলাইট শিরোনাম (২য় রঙিন লাইন):
                      </label>
                      <input
                        type="text"
                        placeholder="স্বাস্থ্যসেবা ও ডায়াগনস্টিক খরচে সাশ্রয়"
                        value={heroBannerSettings.titleHighlight}
                        onChange={e => setHeroBannerSettings({ ...heroBannerSettings, titleHighlight: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold text-emerald-700"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      হিরো বিস্তারিত বিবরণ (Hero Description Paragraph):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Digital Medi Bridge (DMB) হলো একটি আধুনিক Healthcare Network Platform..."
                      value={heroBannerSettings.description}
                      onChange={e => setHeroBannerSettings({ ...heroBannerSettings, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                    />
                  </div>

                  {/* Buttons Labels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        প্রাথমিক বাটন টেক্সট (Button 1):
                      </label>
                      <input
                        type="text"
                        placeholder="মেডিক্যাল কার্ডের আবেদন করুন"
                        value={heroBannerSettings.primaryBtnText}
                        onChange={e => setHeroBannerSettings({ ...heroBannerSettings, primaryBtnText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        সেকেন্ডারি বাটন টেক্সট (Button 2):
                      </label>
                      <input
                        type="text"
                        placeholder="কার্ড ভেরিফাই করুন"
                        value={heroBannerSettings.secondaryBtnText}
                        onChange={e => setHeroBannerSettings({ ...heroBannerSettings, secondaryBtnText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Stat Metrics Counters */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-800">
                      পরিসংখ্যান ও সাফল্য কাউন্টার (Bottom 3 Stat Counters):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-600">কাউন্টার ১</span>
                        <input
                          type="text"
                          placeholder="৩০% ছাড়"
                          value={heroBannerSettings.stat1Value}
                          onChange={e => setHeroBannerSettings({ ...heroBannerSettings, stat1Value: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold"
                        />
                        <input
                          type="text"
                          placeholder="ডায়াগনস্টিক টেস্টে ছাড়"
                          value={heroBannerSettings.stat1Label}
                          onChange={e => setHeroBannerSettings({ ...heroBannerSettings, stat1Label: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border text-[11px]"
                        />
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-bold text-sky-600">কাউন্টার ২</span>
                        <input
                          type="text"
                          placeholder="১০,০০০+"
                          value={heroBannerSettings.stat2Value}
                          onChange={e => setHeroBannerSettings({ ...heroBannerSettings, stat2Value: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold"
                        />
                        <input
                          type="text"
                          placeholder="নিবন্ধিত পরিবার"
                          value={heroBannerSettings.stat2Label}
                          onChange={e => setHeroBannerSettings({ ...heroBannerSettings, stat2Label: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border text-[11px]"
                        />
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-bold text-amber-600">কাউন্টার ৩</span>
                        <input
                          type="text"
                          placeholder="১০০%"
                          value={heroBannerSettings.stat3Value}
                          onChange={e => setHeroBannerSettings({ ...heroBannerSettings, stat3Value: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold"
                        />
                        <input
                          type="text"
                          placeholder="যাচাইকৃত পার্টনার ল্যাব"
                          value={heroBannerSettings.stat3Label}
                          onChange={e => setHeroBannerSettings({ ...heroBannerSettings, stat3Label: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={handleSaveHeroBannerSettings}
                      disabled={heroBannerLoading}
                      className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {heroBannerLoading ? 'সেভ করা হচ্ছে...' : 'হিরো ব্যানার তথ্য সংরক্ষণ করুন'}
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* TEAM MEMBERS MANAGEMENT TAB */}
        {activeSubTab === 'team' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Team Members & Staff Management
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  টিম সদস্য ও কর্মকর্তা ব্যবস্থাপনা (Team Management)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  'আমাদের টিম' পেজে প্রদর্শিত কেন্দ্রীয় নির্বাহী পরিচালক, প্রজেক্ট অফিসার ও মাঠপর্যায়ের কর্মীদের যুক্ত ও আপডেট করুন।
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenAddTeamModal}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  নতুন টিম সদস্য যোগ করুন
                </button>
              </div>
            </div>

            {/* Toast Message Notification */}
            {teamToastMsg && (
              <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between animate-fadeIn ${
                teamToastMsg.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{teamToastMsg.text}</span>
                </div>
                <button onClick={() => setTeamToastMsg(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Metrics Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">মোট টিম সদস্য</p>
                  <h3 className="text-2xl font-black text-slate-900">{teamMembersList.length} জন</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">নেতৃত্বে ও ব্যবস্থাপনায়</p>
                  <h3 className="text-2xl font-black text-slate-900">
                    {teamMembersList.filter(m => m.category === 'management').length} জন
                  </h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">মাঠপর্যায়ে ও সেবাদানে</p>
                  <h3 className="text-2xl font-black text-slate-900">
                    {teamMembersList.filter(m => m.category === 'field').length} জন
                  </h3>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTeamCategoryFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    teamCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  সকল সদস্য ({teamMembersList.length})
                </button>
                <button
                  onClick={() => setTeamCategoryFilter('management')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    teamCategoryFilter === 'management'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  নেতৃত্বে ও ব্যবস্থাপনায় ({teamMembersList.filter(m => m.category === 'management').length})
                </button>
                <button
                  onClick={() => setTeamCategoryFilter('field')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    teamCategoryFilter === 'field'
                      ? 'bg-sky-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  মাঠপর্যায়ে ও সেবাদানে ({teamMembersList.filter(m => m.category === 'field').length})
                </button>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="নাম, পদবি বা এলাকা দিয়ে খুঁজুন..."
                  value={teamSearch}
                  onChange={e => setTeamSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>
            </div>

            {/* Member Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teamMembersList
                .filter(m => teamCategoryFilter === 'all' || m.category === teamCategoryFilter)
                .filter(m =>
                  !teamSearch ||
                  m.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
                  m.designation.toLowerCase().includes(teamSearch.toLowerCase()) ||
                  (m.locationServed && m.locationServed.toLowerCase().includes(teamSearch.toLowerCase()))
                )
                .map(member => (
                  <div key={member.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start gap-4">
                        <img
                          src={member.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                          alt={member.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
                          }}
                        />
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              member.category === 'management'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}>
                              {member.category === 'management' ? 'ব্যবস্থাপনা' : 'মাঠপর্যায়'}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm truncate">{member.name}</h4>
                          <p className="text-xs text-slate-600 font-medium line-clamp-2">{member.designation}</p>
                        </div>
                      </div>

                      {/* Extra Details */}
                      <div className="text-[11px] text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                        {member.education && (
                          <p className="flex items-center gap-2">
                            <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{member.education}</span>
                          </p>
                        )}
                        {member.locationServed && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                            <span className="truncate font-semibold text-slate-800">{member.locationServed}</span>
                          </p>
                        )}
                        {member.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{member.phone}</span>
                          </p>
                        )}
                        {member.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </p>
                        )}
                        {member.bio && (
                          <p className="text-slate-500 text-[11px] italic line-clamp-2 pt-1">
                            "{member.bio}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditTeamModal(member)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        সম্পাদনা
                      </button>
                      <button
                        onClick={() => handleDeleteTeamMember(member.id, member.name)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        মুছুন
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* ADD / EDIT MODAL */}
            {isTeamModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp my-8">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {editingTeamMember ? 'টিম সদস্য সম্পাদনা করুন' : 'নতুন টিম সদস্য যোগ করুন'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsTeamModalOpen(false)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveTeamMember} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          সদস্যের নাম <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদাহরণ: ড. রফিকুল ইসলাম"
                          value={teamForm.name}
                          onChange={e => setTeamForm({ ...teamForm, name: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          পদবি (Designation) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদাহরণ: প্রজেক্ট ডিরেক্টর"
                          value={teamForm.designation}
                          onChange={e => setTeamForm({ ...teamForm, designation: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ক্যাটাগরি <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={teamForm.category}
                          onChange={e => setTeamForm({ ...teamForm, category: e.target.value as 'management' | 'field' })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                        >
                          <option value="management">নেতৃত্বে ও ব্যবস্থাপনায় (Management)</option>
                          <option value="field">মাঠপর্যায়ে ও সেবাদানে (Field Staff)</option>
                        </select>
                      </div>

                    {/* Team Member Image Upload Section */}
                    <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <label className="block text-xs font-bold text-slate-800">
                        সদস্যের ছবি (Photo Upload / Image)
                      </label>

                      {teamForm.image ? (
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={teamForm.image}
                              alt="Team Member Preview"
                              className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
                              }}
                            />
                            <div>
                              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ছবি নির্বাচিত হয়েছে
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {teamForm.image.startsWith('data:') ? 'ফাইল থেকে সরাসরি আপলোড করা হয়েছে' : 'অনলাইন ইমেজ ইউআরএল'}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTeamForm({ ...teamForm, image: '' })}
                            className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            মুছে ফেলুন
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl cursor-pointer transition text-center group">
                            <Upload className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition" />
                            <span className="font-bold text-emerald-900 text-xs">ফাইল/ক্যামেরা থেকে ছবি আপলোড করুন</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WEBP (সর্বোচ্চ 5MB)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert('ফাইল সাইজ সর্বোচ্চ 5MB হতে পারবে');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = ev => {
                                    setTeamForm({ ...teamForm, image: ev.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">অথবা ইমেজ ইউআরএল দিন:</span>
                            <input
                              type="text"
                              placeholder="https://images.unsplash.com/..."
                              value={teamForm.image}
                              onChange={e => setTeamForm({ ...teamForm, image: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          শিক্ষাগত যোগ্যতা (Education)
                        </label>
                        <input
                          type="text"
                          placeholder="উদাহরণ: MBBS (DMC), MPH"
                          value={teamForm.education}
                          onChange={e => setTeamForm({ ...teamForm, education: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          কর্মক্ষেত্র / এলাকা (Location Served)
                        </label>
                        <input
                          type="text"
                          placeholder="উদাহরণ: গোপালগঞ্জ সদর, গোপালগঞ্জ"
                          value={teamForm.locationServed}
                          onChange={e => setTeamForm({ ...teamForm, locationServed: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          মোবাইল নম্বর (Phone)
                        </label>
                        <input
                          type="text"
                          placeholder="+880 1711-000000"
                          value={teamForm.phone}
                          onChange={e => setTeamForm({ ...teamForm, phone: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ইমেইল ঠিকানা (Email)
                        </label>
                        <input
                          type="email"
                          placeholder="member@nit.bd"
                          value={teamForm.email}
                          onChange={e => setTeamForm({ ...teamForm, email: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          অভিজ্ঞতা (Experience)
                        </label>
                        <input
                          type="text"
                          placeholder="উদাহরণ: ১০+ বছরের অভিজ্ঞতা"
                          value={teamForm.experience}
                          onChange={e => setTeamForm({ ...teamForm, experience: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          লিঙ্কডইন লিঙ্ক (LinkedIn URL)
                        </label>
                        <input
                          type="text"
                          placeholder="https://linkedin.com/in/username"
                          value={teamForm.linkedin}
                          onChange={e => setTeamForm({ ...teamForm, linkedin: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        সংক্ষিপ্ত পরিচিতি ও দায়িত্ব (Bio / Description)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="কর্মকর্তার দায়িত্ব ও ভূমিকা সংক্রান্ত সংক্ষিপ্ত বিবরণ..."
                        value={teamForm.bio}
                        onChange={e => setTeamForm({ ...teamForm, bio: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      ></textarea>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsTeamModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {editingTeamMember ? 'হালনাগাদ সেভ করুন' : 'নতুন সদস্য যোগ করুন'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OTHER SUBTABS (REPORTS, CARDS) */}
        {(activeSubTab === 'reports' || activeSubTab === 'cards' || activeSubTab === 'partners') && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900 capitalize">{activeSubTab.replace('-', ' ')} Active Module</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              সিস্টেম ডাটাবেজ ১০০% সমন্বিত রয়েছে। বাংলাদেশের সকল জেলা ও বিভাগের পার্টনার নেটওয়ার্ক ও এডমিন রোল আপডেট করার ব্যাকএন্ড সার্ভিসেস সচল আছে।
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
              <p>• Status: Operational & Live</p>
              <p>• Region Coverage: Dhaka, Khulna, Sylhet, Chittagong, Rajshahi, Barisal, Rangpur, Mymensingh</p>
            </div>
          </div>
        )}

      </main>

      {/* PRINT CARD MODAL */}
      {selectedPrintCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 animate-fadeIn relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPrintCard(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
            >
              ✕
            </button>
            <h3 className="font-bold text-slate-900 text-lg">মেডিক্যাল কার্ড প্রিন্ট প্রিভিউ</h3>
            <MedicalCardPrint card={selectedPrintCard} showPrintButton={true} />
          </div>
        </div>
      )}

      {/* NEW MEMBER MODAL */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-lg">নতুন সদস্য কার্ড ইস্যু করুন</h3>
            <form onSubmit={handleAddMemberSubmit} className="space-y-3 text-xs">
              
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <label className="block font-bold text-amber-950 text-[11px]">
                  প্রিন্ট করা কার্ড নম্বর (Pre-printed Physical Card No.)
                </label>
                <input
                  type="text"
                  value={newMember.customCardId}
                  onChange={e => setNewMember({ ...newMember, customCardId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-white font-mono font-bold text-slate-900 uppercase"
                  placeholder="যেমন: DMB-2026-1050 (খালি রাখলে অটো আইডি)"
                />
                <p className="text-[10px] text-amber-800">
                  ছাপানো প্লাস্টিক/পেপার কার্ডের আইডি নম্বর সরাসরি ইনপুট দিন।
                </p>
              </div>

              <div>
                <label className="block font-bold mb-1">সদস্যের নাম *</label>
                <input
                  type="text"
                  required
                  value={newMember.memberName}
                  onChange={e => setNewMember({ ...newMember, memberName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                  placeholder="পূর্ণ নাম লিখুন"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">কার্ড টিয়ার *</label>
                  <select
                    value={newMember.cardTier}
                    onChange={e => setNewMember({ ...newMember, cardTier: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  >
                    <option value="Silver">Silver (4 Persons)</option>
                    <option value="Gold">Gold (6 Persons)</option>
                    <option value="Platinum">Platinum (8 Persons)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={newMember.mobile}
                    onChange={e => setNewMember({ ...newMember, mobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                    placeholder="01711000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">জেলা *</label>
                  <input
                    type="text"
                    value={newMember.district}
                    onChange={e => setNewMember({ ...newMember, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">উপজেলা *</label>
                  <input
                    type="text"
                    value={newMember.upazila}
                    onChange={e => setNewMember({ ...newMember, upazila: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold shadow cursor-pointer"
                >
                  নিবন্ধন সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW CENTER MODAL */}
      {showAddCenterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-lg">নতুন পার্টনার ডায়াগনস্টিক যোগ</h3>
            <form onSubmit={handleAddCenterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">ডায়াগনস্টিক / হাসপাতালের নাম *</label>
                <input
                  type="text"
                  required
                  value={newCenter.name}
                  onChange={e => setNewCenter({ ...newCenter, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">বিভাগ *</label>
                  <select
                    value={newCenter.division}
                    onChange={e => setNewCenter({ ...newCenter, division: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  >
                    {BANGLADESH_GEO_DATA.map(d => (
                      <option key={d.id} value={d.nameEn}>{d.nameBn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">জেলা *</label>
                  <input
                    type="text"
                    required
                    value={newCenter.district}
                    onChange={e => setNewCenter({ ...newCenter, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">উপজেলা *</label>
                  <input
                    type="text"
                    required
                    value={newCenter.upazila}
                    onChange={e => setNewCenter({ ...newCenter, upazila: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">ছাড়ের হার (%) *</label>
                  <input
                    type="number"
                    required
                    value={newCenter.discountPercentage}
                    onChange={e => setNewCenter({ ...newCenter, discountPercentage: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">ঠিকানা *</label>
                <input
                  type="text"
                  required
                  value={newCenter.address}
                  onChange={e => setNewCenter({ ...newCenter, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCenterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW TEST MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 animate-fadeIn">
            <h3 className="font-bold text-slate-900 text-lg">নতুন টেস্ট প্রাইস রেট যোগ</h3>
            <form onSubmit={handleAddTest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">টেস্টের নাম *</label>
                <input
                  type="text"
                  required
                  value={newTest.name}
                  onChange={e => setNewTest({ ...newTest, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">নিয়মিত রেট (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={newTest.regularPrice}
                    onChange={e => setNewTest({ ...newTest, regularPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">DMB ডিসকাউন্ট রেট *</label>
                  <input
                    type="number"
                    required
                    value={newTest.dmbPrice}
                    onChange={e => setNewTest({ ...newTest, dmbPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold shadow cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PACKAGE MODAL */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 animate-fadeIn">
            <h3 className="font-bold text-slate-900 text-lg">নতুন হেলথ প্যাকেজ যোগ</h3>
            <form onSubmit={handleAddPackage} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">প্যাকেজের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={newPkg.title}
                  onChange={e => setNewPkg({ ...newPkg, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                  placeholder="যেমন: ডায়াবেটিস কেয়ার প্যাকেজ"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">নিয়মিত মূল্য (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={newPkg.regularPrice}
                    onChange={e => setNewPkg({ ...newPkg, regularPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">DMB প্যাকেজ মূল্য *</label>
                  <input
                    type="number"
                    required
                    value={newPkg.dmbPrice}
                    onChange={e => setNewPkg({ ...newPkg, dmbPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">অন্তর্ভুক্ত টেস্টসমূহ (কমা দিয়ে লিখুন) *</label>
                <input
                  type="text"
                  required
                  value={newPkg.testsStr}
                  onChange={e => setNewPkg({ ...newPkg, testsStr: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold shadow cursor-pointer"
                >
                  প্যাকেজ যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEST MODAL */}
      {editTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-base">টেস্ট প্রাইস বিবরণ এডিট</h3>
              <button onClick={() => setEditTestModal(null)} className="font-bold text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEditTest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">টেস্টের নাম *</label>
                <input
                  type="text"
                  required
                  value={editTestModal.name}
                  onChange={e => setEditTestModal({ ...editTestModal, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">ক্যাটাগরি</label>
                <input
                  type="text"
                  value={editTestModal.category}
                  onChange={e => setEditTestModal({ ...editTestModal, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">নিয়মিত রেট (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={editTestModal.regularPrice}
                    onChange={e => setEditTestModal({ ...editTestModal, regularPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">DMB ছাড়ের মূল্য (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={editTestModal.dmbPrice}
                    onChange={e => setEditTestModal({ ...editTestModal, dmbPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTestModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow cursor-pointer"
                >
                  আপডেট সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT HEALTH PACKAGE MODAL */}
      {editPackageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-base">হেলথ প্যাকেজ বিবরণ এডিট</h3>
              <button onClick={() => setEditPackageModal(null)} className="font-bold text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEditPackage} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">প্যাকেজের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={editPackageModal.title}
                  onChange={e => setEditPackageModal({ ...editPackageModal, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">নিয়মিত মূল্য (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={editPackageModal.regularPrice}
                    onChange={e => setEditPackageModal({ ...editPackageModal, regularPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">DMB প্যাকেজ মূল্য *</label>
                  <input
                    type="number"
                    required
                    value={editPackageModal.dmbPrice}
                    onChange={e => setEditPackageModal({ ...editPackageModal, dmbPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">অন্তর্ভুক্ত টেস্টসমূহ (কমা দিয়ে লিখুন) *</label>
                <input
                  type="text"
                  required
                  value={(editPackageModal.includedTests || []).join(', ')}
                  onChange={e => setEditPackageModal({
                    ...editPackageModal,
                    includedTests: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">প্রস্তাবিত কার জন্য</label>
                <input
                  type="text"
                  value={editPackageModal.recommendedFor}
                  onChange={e => setEditPackageModal({ ...editPackageModal, recommendedFor: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditPackageModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow cursor-pointer"
                >
                  প্যাকেজ সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xl overflow-hidden shadow-inner">
                  {viewMemberModal.photoUrl ? (
                    <img src={viewMemberModal.photoUrl} alt={viewMemberModal.memberName} className="w-full h-full object-cover" />
                  ) : (
                    viewMemberModal.memberName.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{viewMemberModal.memberName}</h3>
                  <p className="text-xs text-sky-700 font-mono font-bold">{viewMemberModal.cardId} (Member ID: {viewMemberModal.memberId})</p>
                </div>
              </div>
              <button
                onClick={() => setViewMemberModal(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">কার্ডের ক্যাটাগরি</span>
                <span className="font-extrabold text-slate-900 text-sm">{viewMemberModal.cardTier} Tier ({viewMemberModal.memberLimit} জন সুবিধাভোগী)</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">বর্তমান স্ট্যাটাস</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                  viewMemberModal.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                  viewMemberModal.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {viewMemberModal.status}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">মোবাইল নম্বর</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{viewMemberModal.mobile}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">ইমেইল এড্রেস</span>
                <span className="font-medium text-slate-800">{viewMemberModal.email || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">পিতার নাম</span>
                <span className="font-bold text-slate-900">{viewMemberModal.fatherName || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">মাতার নাম</span>
                <span className="font-bold text-slate-900">{viewMemberModal.motherName || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">জন্ম তারিখ & লিঙ্গ</span>
                <span className="font-bold text-slate-900">{viewMemberModal.dob} ({viewMemberModal.gender})</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">রক্তের গ্রুপ</span>
                <span className="font-extrabold text-rose-600 text-sm">{viewMemberModal.bloodGroup}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">এনআইডি/জন্ম নিবন্ধন নম্বর</span>
                <span className="font-mono font-bold text-slate-900">{viewMemberModal.nidOrBirthCert}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">জেলা ও উপজেলা</span>
                <span className="font-bold text-slate-900">{viewMemberModal.upazila}, {viewMemberModal.district}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1 sm:col-span-2">
                <span className="text-slate-400 font-bold block">বিস্তারিত ঠিকানা</span>
                <span className="font-medium text-slate-800">{viewMemberModal.address}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">ইস্যু ও মেয়াদের তারিখ</span>
                <span className="font-mono text-slate-800">{viewMemberModal.issueDate} থেকে {viewMemberModal.expiryDate}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1 sm:col-span-2">
                <span className="text-slate-400 font-bold block">সুবিধাভোগী পরিবারবর্গ (Beneficiaries)</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {viewMemberModal.beneficiaries && viewMemberModal.beneficiaries.length > 0 ? (
                    viewMemberModal.beneficiaries.map((b, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-lg text-[11px] font-bold">
                        {b}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">কোনো পরিবারবর্গ উল্লেখ করা হয়নি</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  const m = viewMemberModal;
                  setViewMemberModal(null);
                  setEditMemberModal(m);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer transition flex items-center gap-1.5 text-xs shadow"
              >
                <Edit3 className="w-4 h-4" /> সম্পাদনা করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = viewMemberModal;
                  setViewMemberModal(null);
                  setSelectedPrintCard(m);
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer transition flex items-center gap-1.5 text-xs shadow"
              >
                <Printer className="w-4 h-4" /> প্রিন্ট কার্ড
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMember(viewMemberModal.cardId, viewMemberModal.memberName)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition flex items-center gap-1.5 text-xs shadow"
              >
                <Trash2 className="w-4 h-4" /> মুছে ফেলুন
              </button>
              <button
                type="button"
                onClick={() => setViewMemberModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold cursor-pointer text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MEMBER PROFILE MODAL */}
      {editMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                মেডিক্যাল কার্ড হোল্ডারের তথ্য সম্পাদনা ({editMemberModal.cardId})
              </h3>
              <button onClick={() => setEditMemberModal(null)} className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMember} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">সদস্যের পুরো নাম *</label>
                  <input
                    type="text"
                    required
                    value={editMemberModal.memberName}
                    onChange={e => setEditMemberModal({ ...editMemberModal, memberName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={editMemberModal.mobile}
                    onChange={e => setEditMemberModal({ ...editMemberModal, mobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ইমেইল এড্রেস</label>
                  <input
                    type="email"
                    value={editMemberModal.email || ''}
                    onChange={e => setEditMemberModal({ ...editMemberModal, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">কার্ড ক্যাটাগরি / টায়ার *</label>
                  <select
                    value={editMemberModal.cardTier}
                    onChange={e => setEditMemberModal({ ...editMemberModal, cardTier: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  >
                    <option value="Silver">Silver (৪ জন সুবিধাভোগী)</option>
                    <option value="Gold">Gold (৬ জন সুবিধাভোগী)</option>
                    <option value="Platinum">Platinum (৮ জন সুবিধাভোগী)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">স্ট্যাটাস (Status) *</label>
                  <select
                    value={editMemberModal.status}
                    onChange={e => setEditMemberModal({ ...editMemberModal, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  >
                    <option value="ACTIVE">ACTIVE (সক্রিয়)</option>
                    <option value="PENDING">PENDING (অপেক্ষমাণ)</option>
                    <option value="SUSPENDED">SUSPENDED (স্থগিত)</option>
                    <option value="EXPIRED">EXPIRED (মেয়াদোত্তীর্ণ)</option>
                    <option value="REJECTED">REJECTED (প্রত্যাখ্যাত)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">রক্তের গ্রুপ *</label>
                  <select
                    value={editMemberModal.bloodGroup}
                    onChange={e => setEditMemberModal({ ...editMemberModal, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold text-rose-600"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">পিতার নাম</label>
                  <input
                    type="text"
                    value={editMemberModal.fatherName || ''}
                    onChange={e => setEditMemberModal({ ...editMemberModal, fatherName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">মাতার নাম</label>
                  <input
                    type="text"
                    value={editMemberModal.motherName || ''}
                    onChange={e => setEditMemberModal({ ...editMemberModal, motherName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">জন্ম তারিখ</label>
                  <input
                    type="date"
                    value={editMemberModal.dob || ''}
                    onChange={e => setEditMemberModal({ ...editMemberModal, dob: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">লিঙ্গ</label>
                  <select
                    value={editMemberModal.gender}
                    onChange={e => setEditMemberModal({ ...editMemberModal, gender: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  >
                    <option value="Male">পুরুষ (Male)</option>
                    <option value="Female">নারী (Female)</option>
                    <option value="Other">অন্যান্য (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">NID বা জন্ম সনদ নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={editMemberModal.nidOrBirthCert}
                    onChange={e => setEditMemberModal({ ...editMemberModal, nidOrBirthCert: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">জেলা *</label>
                  <input
                    type="text"
                    required
                    value={editMemberModal.district}
                    onChange={e => setEditMemberModal({ ...editMemberModal, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">উপজেলা *</label>
                  <input
                    type="text"
                    required
                    value={editMemberModal.upazila}
                    onChange={e => setEditMemberModal({ ...editMemberModal, upazila: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ঠিকানা</label>
                  <input
                    type="text"
                    value={editMemberModal.address}
                    onChange={e => setEditMemberModal({ ...editMemberModal, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditMemberModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow cursor-pointer transition"
                >
                  তথ্য আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW REP PROFILE MODAL */}
      {viewRepModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-xl overflow-hidden shadow-inner">
                  {viewRepModal.photoUrl ? (
                    <img src={viewRepModal.photoUrl} alt={viewRepModal.name} className="w-full h-full object-cover" />
                  ) : (
                    viewRepModal.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{viewRepModal.name} (ফিল্ড প্রতিনিধি)</h3>
                  <p className="text-xs text-sky-700 font-mono font-bold">আইডি: {viewRepModal.id}</p>
                </div>
              </div>
              <button onClick={() => setViewRepModal(null)} className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">বর্তমান স্ট্যাটাস</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                  viewRepModal.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {viewRepModal.status}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">দায়িত্বপ্রাপ্ত এলাকা</span>
                <span className="font-bold text-sky-800 text-sm">{viewRepModal.assignedArea}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">মোবাইল নম্বর</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{viewRepModal.mobile}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">ইমেইল</span>
                <span className="font-medium text-slate-800">{viewRepModal.email || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">এনআইডি নম্বর (NID)</span>
                <span className="font-mono font-bold text-slate-900">{viewRepModal.nidNo}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">পিতার নাম</span>
                <span className="font-bold text-slate-900">{viewRepModal.fatherName}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">মাতার নাম</span>
                <span className="font-bold text-slate-900">{viewRepModal.motherName || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">জন্ম তারিখ & লিঙ্গ</span>
                <span className="font-bold text-slate-900">{viewRepModal.dob} ({viewRepModal.gender})</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1 sm:col-span-2">
                <span className="text-slate-400 font-bold block">জেলা, উপজেলা ও ঠিকানা</span>
                <span className="font-medium text-slate-800">{viewRepModal.address}, {viewRepModal.upazila}, {viewRepModal.district}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  const r = viewRepModal;
                  setViewRepModal(null);
                  setEditRepModal(r);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer transition flex items-center gap-1.5 text-xs shadow"
              >
                <Edit3 className="w-4 h-4" /> সম্পাদনা করুন
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRep(viewRepModal.id, viewRepModal.name)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition flex items-center gap-1.5 text-xs shadow"
              >
                <Trash2 className="w-4 h-4" /> মুছে ফেলুন
              </button>
              <button
                type="button"
                onClick={() => setViewRepModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold cursor-pointer text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT REP PROFILE MODAL */}
      {editRepModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                ফিল্ড প্রতিনিধির তথ্য সম্পাদনা ({editRepModal.name})
              </h3>
              <button onClick={() => setEditRepModal(null)} className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRep} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">প্রতিনিধির নাম *</label>
                  <input
                    type="text"
                    required
                    value={editRepModal.name}
                    onChange={e => setEditRepModal({ ...editRepModal, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={editRepModal.mobile}
                    onChange={e => setEditRepModal({ ...editRepModal, mobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ইমেইল</label>
                  <input
                    type="email"
                    value={editRepModal.email || ''}
                    onChange={e => setEditRepModal({ ...editRepModal, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">এনআইডি নম্বর (NID) *</label>
                  <input
                    type="text"
                    required
                    value={editRepModal.nidNo}
                    onChange={e => setEditRepModal({ ...editRepModal, nidNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">দায়িত্বপ্রাপ্ত এলাকা *</label>
                  <input
                    type="text"
                    required
                    value={editRepModal.assignedArea}
                    onChange={e => setEditRepModal({ ...editRepModal, assignedArea: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">আবেদন স্ট্যাটাস *</label>
                  <select
                    value={editRepModal.status}
                    onChange={e => setEditRepModal({ ...editRepModal, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  >
                    <option value="APPROVED">APPROVED (অনুমোদিত)</option>
                    <option value="PENDING">PENDING (অপেক্ষমাণ)</option>
                    <option value="REJECTED">REJECTED (বাতিল)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">পিতার নাম</label>
                  <input
                    type="text"
                    value={editRepModal.fatherName}
                    onChange={e => setEditRepModal({ ...editRepModal, fatherName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">মাতার নাম</label>
                  <input
                    type="text"
                    value={editRepModal.motherName || ''}
                    onChange={e => setEditRepModal({ ...editRepModal, motherName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">জেলা *</label>
                  <input
                    type="text"
                    required
                    value={editRepModal.district}
                    onChange={e => setEditRepModal({ ...editRepModal, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">উপজেলা *</label>
                  <input
                    type="text"
                    required
                    value={editRepModal.upazila}
                    onChange={e => setEditRepModal({ ...editRepModal, upazila: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">ঠিকানা</label>
                  <input
                    type="text"
                    value={editRepModal.address}
                    onChange={e => setEditRepModal({ ...editRepModal, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>

                {/* Target Settings (Optional) */}
                <div className="sm:col-span-2 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-extrabold text-amber-900 text-xs">
                      🎯 প্রতিনিধির কাজের টার্গেট নির্ধারণ (Target Settings - optional / ঐচ্ছিক)
                    </label>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">
                      কোনো ক্ষেত্রই বাধ্যতামূলক নয়
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    প্রতিনিধির দৈনিক, সাপ্তাহিক বা মাসিক টার্গেট নির্ধারণ করুন। প্রয়োজন অনুযায়ী যেকোনো অপশন বেছে নিতে পারেন:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        দৈনিক টার্গেট (টি/দিন)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="যেমন: ৫"
                        value={editRepModal.dailyTarget ?? ''}
                        onChange={e => setEditRepModal({
                          ...editRepModal,
                          dailyTarget: e.target.value !== '' ? parseInt(e.target.value, 10) : undefined
                        })}
                        className="w-full p-2.5 rounded-xl border border-amber-300 bg-white font-mono font-bold text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        সাপ্তাহিক টার্গেট (টি/সপ্তাহ)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="যেমন: ৩০"
                        value={editRepModal.weeklyTarget ?? ''}
                        onChange={e => setEditRepModal({
                          ...editRepModal,
                          weeklyTarget: e.target.value !== '' ? parseInt(e.target.value, 10) : undefined
                        })}
                        className="w-full p-2.5 rounded-xl border border-amber-300 bg-white font-mono font-bold text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        মাসিক টার্গেট (টি/মাস)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="যেমন: ১২০"
                        value={editRepModal.monthlyTarget ?? ''}
                        onChange={e => setEditRepModal({
                          ...editRepModal,
                          monthlyTarget: e.target.value !== '' ? parseInt(e.target.value, 10) : undefined
                        })}
                        className="w-full p-2.5 rounded-xl border border-amber-300 bg-white font-mono font-bold text-slate-900 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditRepModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow cursor-pointer transition"
                >
                  তথ্য আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CENTER PROFILE MODAL */}
      {viewCenterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-xl shadow-inner">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{viewCenterModal.name}</h3>
                  <p className="text-xs text-slate-500 font-mono font-bold">কোড: {viewCenterModal.code}</p>
                </div>
              </div>
              <button onClick={() => setViewCenterModal(null)} className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">ডিসকাউন্ট সুবিধা</span>
                <span className="font-extrabold text-emerald-700 text-lg">{viewCenterModal.discountPercentage}% ছাড়</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">স্ট্যাটাস</span>
                <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-100 text-emerald-800">
                  {viewCenterModal.status}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">মোবাইল / ফোন</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{viewCenterModal.mobile}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">ইমেইল</span>
                <span className="font-medium text-slate-800">{viewCenterModal.email || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">জেলা ও উপজেলা</span>
                <span className="font-bold text-sky-800 text-sm">{viewCenterModal.upazila}, {viewCenterModal.district}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1">
                <span className="text-slate-400 font-bold block">মোট প্রদানকৃত ছাড়</span>
                <span className="font-mono font-bold text-slate-900 text-sm">৳{viewCenterModal.totalDiscountsProvided || 0} BDT</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1 sm:col-span-2">
                <span className="text-slate-400 font-bold block">ঠিকানা</span>
                <span className="font-medium text-slate-800">{viewCenterModal.address}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border space-y-1 sm:col-span-2">
                <span className="text-slate-400 font-bold block">উপলব্ধ চিকিৎসাসেবা ও টেস্টসমূহ</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {viewCenterModal.availableServices && viewCenterModal.availableServices.length > 0 ? (
                    viewCenterModal.availableServices.map((srv, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold">
                        {srv}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">সকল প্যাথলজি ও ডায়াগনস্টিক টেস্ট</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  const c = viewCenterModal;
                  setViewCenterModal(null);
                  setEditCenterModal(c);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer transition flex items-center gap-1.5 text-xs shadow"
              >
                <Edit3 className="w-4 h-4" /> সম্পাদনা করুন
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCenterConfirmed(viewCenterModal.id, viewCenterModal.name)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition flex items-center gap-1.5 text-xs shadow"
              >
                <Trash2 className="w-4 h-4" /> মুছে ফেলুন
              </button>
              <button
                type="button"
                onClick={() => setViewCenterModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold cursor-pointer text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JOB CIRCULAR ADD/EDIT MODAL */}
      {showCircularModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                {editingCircular ? 'জব সার্কুলার সম্পাদনা করুন' : 'নতুন প্রতিনিধি নিয়োগ বিজ্ঞপ্তি প্রকাশ'}
              </h3>
              <button onClick={() => setShowCircularModal(false)} className="p-2 rounded-xl bg-slate-100 text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCircularSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">বিজ্ঞপ্তির শিরোনাম (Job Title) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: উপজেলা ফিল্ড রিপ্রেজেন্টেটিভ পদে নিয়োগ"
                    value={circularForm.title}
                    onChange={e => setCircularForm({ ...circularForm, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">পদের নাম (Position) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ফিল্ড রিপ্রেজেন্টেটিভ"
                    value={circularForm.position}
                    onChange={e => setCircularForm({ ...circularForm, position: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">শূন্য পদের সংখ্যা (Vacancies) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={circularForm.vacancyCount}
                    onChange={e => setCircularForm({ ...circularForm, vacancyCount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">জেলা (District) *</label>
                  <input
                    type="text"
                    required
                    value={circularForm.district}
                    onChange={e => setCircularForm({ ...circularForm, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">উপজেলা/থানা (Upazila)</label>
                  <input
                    type="text"
                    value={circularForm.upazila}
                    onChange={e => setCircularForm({ ...circularForm, upazila: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">বেতন ও সম্মানী (Salary/Allowance) *</label>
                  <input
                    type="text"
                    required
                    placeholder="১৫,০০০ - ২০,০০০ টাকা"
                    value={circularForm.salaryAllowance}
                    onChange={e => setCircularForm({ ...circularForm, salaryAllowance: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">শিক্ষাগত যোগ্যতা *</label>
                  <input
                    type="text"
                    required
                    placeholder="এইচএসসি / ডিগ্রী"
                    value={circularForm.educationRequirement}
                    onChange={e => setCircularForm({ ...circularForm, educationRequirement: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">আবেদনের শেষ সময় (Deadline) *</label>
                  <input
                    type="date"
                    required
                    value={circularForm.deadline}
                    onChange={e => setCircularForm({ ...circularForm, deadline: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold font-mono text-rose-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">প্রয়োজনীয় যোগ্যতা ও শর্তাবলী (প্রতি লাইনে একটি শর্ত)</label>
                  <textarea
                    rows={3}
                    placeholder="যেমন: স্মার্টফোন ব্যবহারের দক্ষতা থাকতে হবে&#10;মাঠে কাজ করার আগ্রহ থাকতে হবে"
                    value={circularForm.requirementsStr}
                    onChange={e => setCircularForm({ ...circularForm, requirementsStr: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">বিস্তারিত সার্কুলার বিবরণ (Description)</label>
                  <textarea
                    rows={2}
                    placeholder="কাজের পরিবেশ ও সুযোগ সুবিধা সংক্রান্ত বিবরণ"
                    value={circularForm.description}
                    onChange={e => setCircularForm({ ...circularForm, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCircularModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow cursor-pointer transition"
                >
                  {editingCircular ? 'আপডেট করুন' : 'সার্কুলার প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAPER CHECK & DOCUMENT VERIFICATION MODAL */}
      {paperCheckModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full space-y-6 shadow-2xl animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={paperCheckModal.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                  alt={paperCheckModal.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{paperCheckModal.name}</h3>
                  <p className="text-xs text-slate-500">
                    আবেদন আইডি: <span className="font-mono font-bold text-sky-700">{paperCheckModal.id}</span> | মোবাইল: <span className="font-mono font-bold text-slate-800">{paperCheckModal.mobile}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setPaperCheckModal(null)} className="p-2 rounded-xl bg-slate-100 text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border">
                <span className="text-slate-400 block text-[10px]">আবেদনের পদ</span>
                <strong className="text-slate-800 font-bold">{paperCheckModal.circularTitle || 'ফিল্ড রিপ্রেজেন্টেটিভ'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border">
                <span className="text-slate-400 block text-[10px]">জাতীয় পরিচয়পত্র (NID)</span>
                <strong className="text-slate-900 font-mono font-bold">{paperCheckModal.nidNo}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border">
                <span className="text-slate-400 block text-[10px]">শিক্ষাগত যোগ্যতা</span>
                <strong className="text-slate-800 font-bold">{paperCheckModal.educationalQualification || 'HSC Passed'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border">
                <span className="text-slate-400 block text-[10px]">কর্ম এলাকা</span>
                <strong className="text-sky-800 font-bold">{paperCheckModal.assignedArea}</strong>
              </div>
            </div>

            {/* Document Preview Cards Grid */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 border-b pb-1">
                <FileText className="w-4 h-4 text-sky-600" />
                জমাকৃত পেপারস ও ফাইল প্রিভিউ (Uploaded Document Files)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Passport Photo Preview */}
                <div className="p-3 rounded-2xl border bg-slate-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={paperCheckModal.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                      alt="Photo"
                      className="w-14 h-14 rounded-xl object-cover border shadow-sm"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-xs">১. পাসপোর্ট সাইজ ছবি</p>
                      <span className="text-[10px] text-emerald-700 font-bold">✓ আপলোডকৃত</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDocImagePreviewModal({ title: `${paperCheckModal.name} - প্রার্থীর ছবি`, url: paperCheckModal.photoUrl || '' })}
                    className="p-2 bg-white rounded-xl border text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm text-xs font-bold flex items-center gap-1"
                  >
                    <ZoomIn className="w-4 h-4 text-sky-600" /> জুম
                  </button>
                </div>

                {/* 2. NID Document Preview */}
                <div className="p-3 rounded-2xl border bg-slate-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {paperCheckModal.nidDocUrl ? (
                      <img
                        src={paperCheckModal.nidDocUrl}
                        alt="NID"
                        className="w-16 h-12 rounded-xl object-cover border shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-[10px]">
                        NID নাই
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-800 text-xs">২. এনআইডি / স্মার্টকার্ড</p>
                      {paperCheckModal.nidDocUrl ? (
                        <span className="text-[10px] text-emerald-700 font-bold">✓ ফাইল যুক্ত আছে</span>
                      ) : (
                        <span className="text-[10px] text-rose-600 font-bold">ফাইল অনুপস্থিত</span>
                      )}
                    </div>
                  </div>
                  {paperCheckModal.nidDocUrl && (
                    <button
                      onClick={() => setDocImagePreviewModal({ title: `${paperCheckModal.name} - NID কপি`, url: paperCheckModal.nidDocUrl || '' })}
                      className="p-2 bg-white rounded-xl border text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm text-xs font-bold flex items-center gap-1"
                    >
                      <ZoomIn className="w-4 h-4 text-sky-600" /> জুম
                    </button>
                  )}
                </div>

                {/* 3. Certificate Preview */}
                <div className="p-3 rounded-2xl border bg-slate-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {paperCheckModal.educationDocUrl ? (
                      <img
                        src={paperCheckModal.educationDocUrl}
                        alt="Certificate"
                        className="w-16 h-12 rounded-xl object-cover border shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-[10px]">
                        সনদ নাই
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-800 text-xs">৩. শিক্ষা সনদপত্র</p>
                      {paperCheckModal.educationDocUrl ? (
                        <span className="text-[10px] text-emerald-700 font-bold">✓ ফাইল যুক্ত আছে</span>
                      ) : (
                        <span className="text-[10px] text-rose-600 font-bold">ফাইল অনুপস্থিত</span>
                      )}
                    </div>
                  </div>
                  {paperCheckModal.educationDocUrl && (
                    <button
                      onClick={() => setDocImagePreviewModal({ title: `${paperCheckModal.name} - শিক্ষা সনদ`, url: paperCheckModal.educationDocUrl || '' })}
                      className="p-2 bg-white rounded-xl border text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm text-xs font-bold flex items-center gap-1"
                    >
                      <ZoomIn className="w-4 h-4 text-sky-600" /> জুম
                    </button>
                  )}
                </div>

                {/* 4. CV File Preview */}
                <div className="p-3 rounded-2xl border bg-slate-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                      CV
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">৪. সিভি / জীবনবৃত্তান্ত</p>
                      {paperCheckModal.cvDocUrl ? (
                        <span className="text-[10px] text-emerald-700 font-bold">✓ সিভি ফাইল যুক্ত</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">সিভি যুক্ত হয়নি</span>
                      )}
                    </div>
                  </div>
                  {paperCheckModal.cvDocUrl && (
                    <a
                      href={paperCheckModal.cvDocUrl}
                      download={`CV_${paperCheckModal.name}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-xl border text-purple-700 hover:bg-purple-50 cursor-pointer shadow-sm text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" /> ডাউনলোড
                    </a>
                  )}
                </div>

              </div>
            </div>

            {/* Verification Checklist */}
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-2 text-xs">
              <span className="font-extrabold text-sky-900 block">এডমিন পেপারস ভেরিফিকেশন চেকলিস্ট:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="flex items-center gap-2 bg-white p-2 rounded-xl border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paperVerificationState.photo}
                    onChange={e => setPaperVerificationState({ ...paperVerificationState, photo: e.target.checked })}
                    className="rounded text-sky-600"
                  />
                  <span className="font-bold text-slate-800">ছবি সঠিক</span>
                </label>
                <label className="flex items-center gap-2 bg-white p-2 rounded-xl border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paperVerificationState.nid}
                    onChange={e => setPaperVerificationState({ ...paperVerificationState, nid: e.target.checked })}
                    className="rounded text-sky-600"
                  />
                  <span className="font-bold text-slate-800">NID ভেরিফাইড</span>
                </label>
                <label className="flex items-center gap-2 bg-white p-2 rounded-xl border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paperVerificationState.certificate}
                    onChange={e => setPaperVerificationState({ ...paperVerificationState, certificate: e.target.checked })}
                    className="rounded text-sky-600"
                  />
                  <span className="font-bold text-slate-800">সনদপত্র সঠিক</span>
                </label>
                <label className="flex items-center gap-2 bg-white p-2 rounded-xl border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paperVerificationState.cv}
                    onChange={e => setPaperVerificationState({ ...paperVerificationState, cv: e.target.checked })}
                    className="rounded text-sky-600"
                  />
                  <span className="font-bold text-slate-800">সিভি পর্যালোচিত</span>
                </label>
              </div>
            </div>

            {/* Optional Target Settings during Approval */}
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-900 block">
                  🎯 প্রতিনিধির টার্গেট নির্ধারণ (ঐচ্ছিক / Optional):
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">
                  কোনোটাই বাধ্যতামূলক নয়
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 text-[11px] mb-1">দৈনিক টার্গেট (টি/দিন)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="যেমন: ৫"
                    value={paperCheckModal.dailyTarget ?? ''}
                    onChange={e => setPaperCheckModal({
                      ...paperCheckModal,
                      dailyTarget: e.target.value !== '' ? parseInt(e.target.value, 10) : undefined
                    })}
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 text-[11px] mb-1">সাপ্তাহিক টার্গেট (টি/সপ্তাহ)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="যেমন: ৩০"
                    value={paperCheckModal.weeklyTarget ?? ''}
                    onChange={e => setPaperCheckModal({
                      ...paperCheckModal,
                      weeklyTarget: e.target.value !== '' ? parseInt(e.target.value, 10) : undefined
                    })}
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 text-[11px] mb-1">মাসিক টার্গেট (টি/মাস)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="যেমন: ১২০"
                    value={paperCheckModal.monthlyTarget ?? ''}
                    onChange={e => setPaperCheckModal({
                      ...paperCheckModal,
                      monthlyTarget: e.target.value !== '' ? parseInt(e.target.value, 10) : undefined
                    })}
                    className="w-full p-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-800">এডমিন মন্তব্য / নোটিশ (প্রার্থীকে SMS হিসেবে পাঠানো হবে):</label>
              <textarea
                rows={2}
                placeholder="যেমন: আপনার NID ও সার্টিফিকেট যাচাই শেষে আবেদনটি অনুমোদন করা হয়েছে। লগইন ইউজার আইডি: মোবাইল নম্বর।"
                value={paperCheckNotes}
                onChange={e => setPaperCheckNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-slate-50 focus:bg-white text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={handleRejectPaperCheck}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow cursor-pointer transition flex items-center gap-1.5"
              >
                ✕ আবেদনটি রিজেক্ট করুন (Reject)
              </button>
              
              <button
                type="button"
                onClick={handleApprovePaperCheck}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow cursor-pointer transition flex items-center gap-1.5"
              >
                ✓ পেপারস ওকে & এপ্রুভ করুন (Approve)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT IMAGE ZOOM PREVIEW MODAL */}
      {docImagePreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm">{docImagePreviewModal.title}</h3>
              <button onClick={() => setDocImagePreviewModal(null)} className="p-2 bg-slate-800 rounded-xl text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center min-h-[300px] max-h-[80vh] overflow-auto">
              <img src={docImagePreviewModal.url} alt="Document Zoom" className="max-w-full max-h-[75vh] rounded-xl object-contain shadow-2xl" />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>হাই-রেজোলেশন প্রিভিউ</span>
              <a
                href={docImagePreviewModal.url}
                download="document.png"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> ডাউনলোড করুন
              </a>
            </div>
          </div>
        </div>
      )}
      {editCenterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                পার্টনার সেন্টারের তথ্য সম্পাদনা ({editCenterModal.name})
              </h3>
              <button onClick={() => setEditCenterModal(null)} className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCenter} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">সেন্টারের নাম *</label>
                  <input
                    type="text"
                    required
                    value={editCenterModal.name}
                    onChange={e => setEditCenterModal({ ...editCenterModal, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">সেন্টার কোড</label>
                  <input
                    type="text"
                    value={editCenterModal.code}
                    onChange={e => setEditCenterModal({ ...editCenterModal, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={editCenterModal.mobile}
                    onChange={e => setEditCenterModal({ ...editCenterModal, mobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ইমেইল</label>
                  <input
                    type="email"
                    value={editCenterModal.email || ''}
                    onChange={e => setEditCenterModal({ ...editCenterModal, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ডিসকাউন্ট হার (%) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={editCenterModal.discountPercentage}
                    onChange={e => setEditCenterModal({ ...editCenterModal, discountPercentage: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-extrabold text-emerald-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">জেলা *</label>
                  <input
                    type="text"
                    required
                    value={editCenterModal.district}
                    onChange={e => setEditCenterModal({ ...editCenterModal, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">উপজেলা *</label>
                  <input
                    type="text"
                    required
                    value={editCenterModal.upazila}
                    onChange={e => setEditCenterModal({ ...editCenterModal, upazila: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">বিস্তারিত ঠিকানা *</label>
                  <input
                    type="text"
                    required
                    value={editCenterModal.address}
                    onChange={e => setEditCenterModal({ ...editCenterModal, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">উপলব্ধ সেবাসমূহ (কমা দিয়ে লিখুন)</label>
                  <input
                    type="text"
                    value={Array.isArray(editCenterModal.availableServices) ? editCenterModal.availableServices.join(', ') : editCenterModal.availableServices || ''}
                    onChange={e => setEditCenterModal({
                      ...editCenterModal,
                      availableServices: e.target.value.split(',').map(s => s.trim())
                    })}
                    className="w-full p-2.5 rounded-xl border bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditCenterModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow cursor-pointer transition"
                >
                  তথ্য আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING MODAL OVERLAY FOR PDF DOWNLOAD PROGRESS */}
      {pdfDownloading && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-5">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-rose-100 border-t-rose-600 animate-spin"></div>
              <FileDown className="w-9 h-9 text-rose-600 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                📄 বাল্ক মেডিক্যাল কার্ডস পিডিএফ তৈরি হচ্ছে
              </h3>
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-full inline-block border border-rose-200">
                মোট কার্ড: {pdfTargetCount} টি | হাই-রেজোলিউশন প্রিন্ট মোড
              </p>
            </div>

            <div className="space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Loader2 className="w-4 h-4 text-rose-600 animate-spin flex-shrink-0" />
                <span>{pdfDownloadProgressMsg || 'প্রসেসিং চলছে, অনুগ্রহ করে অপেক্ষা করুন...'}</span>
              </div>
              
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-600 h-full rounded-full w-2/3 animate-pulse"></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              ⚠️ ব্রাউজার উইন্ডো বন্ধ বা রিফ্রেশ করবেন না। পিডিএফ ফাইল তৈরি হওয়া সম্পন্ন হলে তা স্বয়ংক্রিয়ভাবে আপনার ডিভাইসে ডাউনলোড হবে।
            </p>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT CONTAINER FOR PDF EXPORT VIA HTML2CANVAS */}
      <div id="bulk-cards-pdf-export-container" className="hidden space-y-8 bg-slate-200 p-4 font-sans">
        {(() => {
          const unassignedList = cards.filter(c => (c.status || '').toUpperCase() === 'UNASSIGNED');
          const CARDS_PER_PAGE = 4;
          const pages = [];
          for (let i = 0; i < unassignedList.length; i += CARDS_PER_PAGE) {
            pages.push(unassignedList.slice(i, i + CARDS_PER_PAGE));
          }

          if (pages.length === 0) return null;

          return pages.map((pageCards, pageIdx) => (
            <div
              key={pageIdx}
              className="pdf-page-block w-[800px] h-[1131px] p-6 bg-white flex flex-col justify-between mx-auto box-border overflow-hidden relative shadow-md"
              style={{ width: '800px', height: '1131px', minWidth: '800px', minHeight: '1131px' }}
            >
              <div className="border-b pb-2 text-center flex-shrink-0">
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    DMB OFFICIAL CARD SHEET
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    Page {pageIdx + 1} of {pages.length}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                  {cardDesignSettings.headerTitle || 'DIGITAL MEDI BRIDGE'}
                </h2>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {cardDesignSettings.headerSubtitle || 'Healthcare Service Platform & Medical Network'}
                </p>
                <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
                  বাল্ক প্রিন্টেড মেম্বারশিপ কার্ডস শিট (Unassigned Blank Cards - Standard Size 85.6mm x 53.98mm)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 justify-items-center my-auto flex-1 items-center">
                {pageCards.map((c) => (
                  <div key={c.cardId} className="border border-slate-200 p-2 rounded-xl bg-white flex flex-col items-center shadow-xs">
                    <MedicalCardPrint card={c} cardDesignSettings={cardDesignSettings} showPrintButton={false} />
                  </div>
                ))}
              </div>

              <div className="text-center pt-2 border-t text-[10px] text-slate-500 flex justify-between items-center px-2 flex-shrink-0">
                <span>{cardDesignSettings.footerText || 'DMB Healthcare Network, Bangladesh'}</span>
                <span className="font-semibold text-slate-700">Helpline: {cardDesignSettings.helpline}</span>
              </div>
            </div>
          ));
        })()}
      </div>

    </div>
  );
};
