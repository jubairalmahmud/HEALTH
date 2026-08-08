import express from 'express';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import {
  INITIAL_CARDS,
  INITIAL_DIAGNOSTIC_CENTERS,
  INITIAL_TESTS,
  INITIAL_PACKAGES,
  INITIAL_TRANSACTIONS,
  INITIAL_BLOGS,
  INITIAL_FAQS,
  INITIAL_TESTIMONIALS,
  INITIAL_NOTICES
} from './src/data/mockData';
import {
  MedicalCard,
  DiagnosticCenter,
  MedicalTest,
  HealthPackage,
  DiscountTransaction,
  BlogArticle,
  PartnerApplication,
  ContactMessage,
  User,
  MedicalReport,
  Prescription,
  HealthSurvey,
  RepresentativeApplication,
  RepresentativeDistribution,
  JobCircular,
  SmsLog,
  SmsSettings,
  AuditLog,
  Testimonial,
  SiteSettings,
  CustomRole,
  DynamicPageContent,
  TeamMember,
  HeroBannerSettings
} from './src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'dmb_healthcare_secret_key_2026';

// In-Memory & Disk-backed Data Store
const DATA_FILE = path.join(process.cwd(), 'data_store.json');

let dbCards: MedicalCard[] = [...INITIAL_CARDS];
let dbCenters: DiagnosticCenter[] = [...INITIAL_DIAGNOSTIC_CENTERS];
let dbTests: MedicalTest[] = [...INITIAL_TESTS];
let dbPackages: HealthPackage[] = [...INITIAL_PACKAGES];
let dbTransactions: DiscountTransaction[] = [...INITIAL_TRANSACTIONS];
let dbBlogs: BlogArticle[] = [...INITIAL_BLOGS];
let dbNotices = [...INITIAL_NOTICES];
let dbTestimonials: Testimonial[] = INITIAL_TESTIMONIALS.map(t => ({
  ...t,
  status: 'APPROVED',
  date: '2026-01-15'
}));

let dbCustomRoles: CustomRole[] = [
  {
    id: 'ROLE-01',
    roleName: 'ফিল্ড ম্যানেজার (Field Manager)',
    description: 'মাঠ পর্যায়ের প্রতিনিধি তদারকি, কার্ড ইস্যু এবং ডিস্ট্রিবিউশন পারমিশন',
    permissions: {
      canApproveCards: true,
      canManagePrices: false,
      canSendSMS: true,
      canViewRevenue: true,
      canEditNotices: false,
      canManagePartners: false,
      canManageReps: true
    },
    createdAt: '2026-01-01'
  },
  {
    id: 'ROLE-02',
    roleName: 'অ্যাকাউন্টস অ্যান্ড ফাইন্যান্স (Accounts Staff)',
    description: 'রাজস্ব হিসাব, পেমেন্ট ভেরিফিকেশন ও ডিসকাউন্ট মূল্য তালিকা পরিচালনা',
    permissions: {
      canApproveCards: true,
      canManagePrices: true,
      canSendSMS: false,
      canViewRevenue: true,
      canEditNotices: false,
      canManagePartners: true,
      canManageReps: false
    },
    createdAt: '2026-01-02'
  }
];

let dbPageContent: DynamicPageContent = {
  aboutUs: {
    title: 'ডিজিটাল হেলথ প্রজেক্ট (DMB) সম্পর্কে',
    description: 'গোপালগঞ্জ, নড়াইল ও সিলেট জেলায় স্বাস্থ্য সেবাকে ডিজিটাল, সাশ্রয়ী ও সর্বসাধারণের হাতের নাগালে পৌঁছে দেওয়ার এক ঐতিহাসিক উদ্যোগ।',
    mission: 'বাংলাদেশের প্রতিটি পরিবারের কাছে ডিজিটাল মেডিক্যাল মেম্বারশিপ কার্ড পৌঁছে দিয়ে মানসম্মত ডায়াগনস্টিক ও চিকিৎসা সেবায় নির্ধারিত ৩০% ডিসকাউন্ট নিশ্চিত করা।',
    vision: 'সারা দেশে ১ কোটি প্রান্তিক ও নিম্ন-মধ্যবিত্ত পরিবারকে ডিজিটাল হেলথ কাভারেজের আওতায় নিয়ে আসা।',
    mdMessage: 'আমাদের লক্ষ্য হলো স্বাস্থ্যখাতে মধ্যস্বত্বভোগীদের অবসান ঘটিয়ে সরাসরি পপুলার, ইবনে সিনা ও ডিজিটাল হেলথ পার্টনারদের সাথে রোগীদের সংযোগ স্থাপন করা।',
    achievements: [
      { number: '৫,০০০+', label: 'সক্রিয় কার্ডধারী পরিবার' },
      { number: '২০+', label: 'অনুমোদিত ডায়াগনস্টিক ও হাসপাতাল' },
      { number: '৩০%', label: 'ডায়াগনস্টিক ডিসকাউন্ট' },
      { number: '২৪/৭', label: 'জরুরি হেল্পলাইন সাপোর্ট' }
    ]
  },
  medicalCardInfo: {
    title: 'DMB ডিজিটাল মেডিক্যাল মেম্বারশিপ কার্ড নির্দেশিকা',
    description: 'একটি কার্ডেই পুরো পরিবারের স্বাস্থ্য সুরক্ষা। ১ বছর মেয়াদী সিলভার, গোল্ড ও প্লাটিনাম মেম্বারশিপ।',
    perks: [
      { tier: 'Silver Card', discount: '৩০%', members: 'সর্বোচ্চ ৪ জন সদস্য', price: '৳২০০ / বছর' },
      { tier: 'Gold Card', discount: '৩০%', members: 'সর্বোচ্চ ৬ জন সদস্য', price: '৳৩৫০ / বছর' },
      { tier: 'Platinum Card', discount: '৩০%', members: 'সর্বোচ্চ ৮ জন সদস্য', price: '৳৫০০ / বছর' }
    ],
    coverageDistricts: ['গোপালগঞ্জ সদর', 'নড়াইল', 'সিলেট সদর', 'ঢাকা ধামরাই'],
    terms: 'কার্ডধারী সদস্য ও তার অনুমোদিত ফ্যামিলি মেম্বারগণ নিবন্ধিত পার্টনার হাসপাতাল ও সেন্টারে কিউআর কোড ভেরিফাই করে তাৎক্ষণিক ছাড় পাবেন।'
  },
  healthTips: [],
  eventGallery: [
    {
      id: 'EVT-01',
      title: 'গোপালগঞ্জে DMB ডিজিটাল হেলথ কার্ড বিতরণ ও ফ্রী মেডিকেল ক্যাম্প',
      location: 'বেদগ্রাম, গোপালগঞ্জ সদর',
      date: '২০২৬-০১-১০',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
      category: 'Medical Camp'
    },
    {
      id: 'EVT-02',
      title: 'পপুলার ডায়াগনস্টিক সেন্টারের সাথে দ্বিপাক্ষিক সমঝোতা চুক্তি (MoU) স্বাক্ষর',
      location: 'গোপালগঞ্জ',
      date: '২০২৬-০১-২০',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
      category: 'MoU Ceremony'
    }
  ]
};

let dbSmsSettings: SmsSettings = {
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
    repRejected: 'প্রিয় {name}, DMB প্রতিনিধি পদে আপনার আবেদনটি বাতিল করা হয়েছে। কারণ: {reason}। হেল্পলাইন: +8809658887470',
    otpTemplate: 'আপনার DMB মেডিক্যাল পোর্টালে লগইনের ওটিপি (OTP) কোড হলো: {otp}',
    customDefault: 'প্রিয় {name}, {message}'
  }
};

// Top Banner Notice & Announcement Settings
let dbBannerSettings = {
  badgeText: 'PILOT PROJECT',
  noticeText: 'গোপালগঞ্জ, নড়াইল ও সিলেট জেলায় পাইলট প্রজেক্ট চালু রয়েছে! সিলভার, গোল্ড ও প্লাটিনাম মেম্বারশিপ কার্ডে ৩০% ছাড় পেতে আজই আবেদন করুন।',
  hotline: '+8809658887470',
  email: 'health@nit.bd',
  enabled: true,
  speed: 'normal'
};

let dbHeroBannerSettings: HeroBannerSettings = {
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
};

let dbSiteSettings = {
  siteTitle: 'DMB Health Portal - ডিজিটাল হেলথ কার্ড ও স্বাস্থ্য সেবা',
  siteName: 'ডিজিটাল হেলথ কার্ড প্লাটফর্ম',
  siteTagline: 'স্মার্ট স্বাস্থ্য সেবায় আপনার নির্ভরযোগ্য ডিজিটাল হেলথ পার্টনার',
  logoText: 'DMB Health',
  logoUrl: '',
  faviconUrl: '',
  hotline: '+8809658887470',
  phoneSecondary: '01700000000',
  phone: '01700000000',
  email: 'health@nit.bd',
  address: 'গোপালগঞ্জ সদর, গোপালগঞ্জ, বাংলাদেশ',
  facebookUrl: 'https://facebook.com',
  emergencyNumber: '999',
  navLabels: {
    home: 'হোম',
    aboutGroup: 'আমাদের ও সেবা ▾',
    about: 'আমাদের সম্পর্কে',
    services: 'সেবাসমূহ',
    cardGroup: 'মেডিক্যাল কার্ড ▾',
    medicalCard: 'মেডিক্যাল কার্ড',
    applyCard: 'কার্ডের আবেদন',
    notice: 'বিজ্ঞপ্তি',
    diagnosticGroup: 'ডায়াগনস্টিক & টেস্ট ▾',
    diagnosticCenter: 'ডায়াগনস্টিক সেন্টার',
    testPrices: 'টেস্ট ফি তালিকা',
    packages: 'হেলথ প্যাকেজ',
    verifyBtn: 'কার্ড ভেরিফাই',
    loginBtn: 'লগইন / পোর্টাল',
    moreGroup: 'আরও ▾'
  }
};

let dbCardDesignSettings = {
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
  },
  fieldVisibility: {
    headerTitle: true,
    headerSubtitle: true,
    logo: true,
    tierBadge: true,
    photoUrl: true,
    bloodGroup: true,
    memberName: true,
    cardId: true,
    memberId: true,
    upazila: true,
    district: true,
    issueDate: true,
    expiryDate: true,
    helpline: true,
    nidOrBirthCert: true,
    beneficiaries: true,
    slogan: true,
    disclaimerText: true,
    qrCode: true,
    footerText: true,
    websiteUrl: true
  }
};

let dbTeamMembers: TeamMember[] = [
  {
    id: 'm1',
    name: 'ড. রফিকুল ইসলাম',
    designation: 'নির্বাহী পরিচালক (Executive Director)',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    education: 'MBBS (DMC), MPH (DU)',
    email: 'director@nit.bd',
    phone: '+880 1711-000001',
    linkedin: 'https://linkedin.com',
    experience: '১৫+ বছরের জনস্বাস্থ্য ব্যবস্থাপনা অভিজ্ঞতা',
    bio: 'প্রান্তিক জনগোষ্ঠীর দৌড়গোড়ায় আধুনিক ডিজিটাল স্বাস্থ্যসেবা পৌঁছে দেওয়ার ব্রত নিয়ে DMB প্রজেক্টের নেতৃত্ব দিচ্ছেন।'
  },
  {
    id: 'm2',
    name: 'মাহফুজ আহমেদ',
    designation: 'প্রজেক্ট ডিরেক্টর (Project Director)',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    education: 'M.Sc in Health Economics (DU)',
    email: 'project.lead@nit.bd',
    phone: '+880 1711-000002',
    linkedin: 'https://linkedin.com',
    experience: '১২+ বছরের প্রজেক্ট কো-অর্ডিনেশন অভিজ্ঞতা',
    bio: 'মাঠপর্যায়ে হাসপাতাল ও ডায়াগনস্টিক সেন্টারের সাথে অংশীদারিত্ব প্রতিষ্ঠা ও নেটওয়ার্ক সচল রাখায় নিয়োজিত।'
  },
  {
    id: 'm3',
    name: 'ডা. ফারহানা শারমিন',
    designation: 'চিফ মেডিকেল অফিসার (Chief Medical Officer)',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1594824813566-78a0505f5737?auto=format&fit=crop&q=80&w=400',
    education: 'MBBS, DGO, FCPS (Part-2)',
    email: 'cmo@nit.bd',
    phone: '+880 1711-000003',
    linkedin: 'https://linkedin.com',
    experience: '১০+ বছরের ক্লিনিক্যাল অভিজ্ঞতা',
    bio: 'মেডিক্যাল কার্ডধারীদের সর্বোচ্চ মানের সেবা নিশ্চিতকরণ ও কোয়ালিটি কন্ট্রোল টিম পরিচালনা করেন।'
  },
  {
    id: 'm4',
    name: 'এস. এম. রেজওয়ান',
    designation: 'হেড অফ অপারেশনস (Head of Operations)',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    education: 'MBA (DU)',
    email: 'operations@nit.bd',
    phone: '+880 1711-000004',
    linkedin: 'https://linkedin.com',
    experience: '৮+ বছরের অপারেশনাল লজিস্টিকস পরিচালনা',
    bio: 'ডিজিটাল কার্ড ইস্যুয়েন্স, ভেরিফিকেশন ও অ্যাডমিন নেটওয়ার্কের নির্বিঘ্ন অপারেশন পরিচালনা করছেন।'
  },
  {
    id: 'm5',
    name: 'জসিম উদ্দিন',
    designation: 'কো-অর্ডিনেটর, হেলথ কেয়ার নেটওয়ার্ক',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    education: 'B.Sc in Public Health',
    email: 'network@nit.bd',
    phone: '+880 1711-000005',
    linkedin: 'https://linkedin.com',
    experience: '৭+ বছরের পার্টনারশিপ কো-অর্ডিনেশন',
    bio: 'গোপালগঞ্জ, সিলেট ও নড়াইলের পার্টনার ল্যাব ও হাসপাতালের টেস্ট ফি ও ডিসকাউন্ট মনিটরিংয়ে দায়িত্বপ্রাপ্ত।'
  },
  {
    id: 'm6',
    name: 'তানজিনা বেগম',
    designation: 'হেড অফ আইটি ও ডিজিটাল পোর্টাল',
    category: 'management',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    education: 'B.Sc in CSE (BUET)',
    email: 'it@nit.bd',
    phone: '+880 1711-000006',
    linkedin: 'https://linkedin.com',
    experience: '৬+ বছরের সফটওয়্যার ও হেলথ-টেক ডেভেলপমেন্ট',
    bio: 'ডিজিটাল কার্ডের QR কোড সিকিউরিটি, সার্ভার ডাটাবেজ এবং মোবাইল পোর্টাইবিলিটি ডেভেলপমেন্টে নিয়োজিত।'
  },
  {
    id: 'f1',
    name: 'মোঃ শামসুল হক',
    designation: 'সিনিয়র ফিল্ড অফিসার',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    locationServed: 'গোপালগঞ্জ সদর, গোপালগঞ্জ',
    phone: '+880 1812-100001',
    email: 'shamsul.field@nit.bd',
    experience: '৫ বছরের ফিল্ড ক্যাম্প অভিজ্ঞতা',
    bio: 'গোপালগঞ্জ সদরে মাঠপর্যায়ে কার্ড বিতরণ ও ডায়াগনস্টিক সেন্টারে রোগীদের তথ্য সহায়তা প্রদানে দায়িত্ব পালন করছেন।'
  },
  {
    id: 'f2',
    name: 'সুমাইয়া সুলতানা',
    designation: 'কমিউনিটি হেলথ ওয়ার্কার',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    locationServed: 'টুঙ্গিপাড়া, গোপালগঞ্জ',
    phone: '+880 1812-100002',
    email: 'sumaiya.field@nit.bd',
    experience: '৪ বছরের স্বাস্থ্য সচেতনতা কার্যক্রম',
    bio: 'গ্রামাঞ্চলে মা ও শিশুদের বিনামূল্যে স্বাস্থ্যসেবা পরামর্শ দেওয়া এবং কার্ড গ্রহণে উদ্বুদ্ধ করতে কাজ করছেন।'
  },
  {
    id: 'f3',
    name: 'মোঃ নাজমুল হোসেন',
    designation: 'ফিল্ড সুপারভাইজার',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    locationServed: 'কোটালিপাড়া, গোপালগঞ্জ',
    phone: '+880 1812-100003',
    email: 'nazmul.field@nit.bd',
    experience: '৬ বছরের প্রজেক্ট এক্সিকিউশন',
    bio: 'কোটালিপাড়া এলাকার পার্টনার ফার্মেসি ও প্যাথলজি ল্যাবে কার্ড ভেরিফিকেশন ও ডিসকাউন্ট সুবিধা তদারকি করেন।'
  },
  {
    id: 'f4',
    name: 'রাবেয়া খাতুন',
    designation: 'স্বাস্থ্যসেবা কর্মী ও কেয়ার অ্যাসিস্ট্যান্ট',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400',
    locationServed: 'সিলেট সদর, সিলেট',
    phone: '+880 1812-100004',
    email: 'rabeya.field@nit.bd',
    experience: '৪ বছরের নার্সিং ও পেশেন্ট কেয়ার',
    bio: 'সিলেট অঞ্চলে বয়স্ক ও অসচ্ছল রোগীদের পরীক্ষা-নিরীক্ষায় সরাসরি হেল্পডেস্ক থেকে সার্বিক সহযোগিতা করেন।'
  },
  {
    id: 'f5',
    name: 'আতিকুর রহমান',
    designation: 'মেডিক্যাল রিপ্রেজেন্টেটিভ ও ফিল্ড অফিসার',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    locationServed: 'নড়াইল সদর, নড়াইল',
    phone: '+880 1812-100005',
    email: 'atik.field@nit.bd',
    experience: '৫ বছরের ফার্মাসিউটিক্যালস ও হেলথ ফিল্ড ওয়ার্ক',
    bio: 'নড়াইল জেলার হাসপাতাল ও চিকিৎসকদের সাথে যোগাযোগ রক্ষা এবং হেলথ কার্ড ক্যাম্পেইন পরিচালনা করেন।'
  },
  {
    id: 'f6',
    name: 'ফাতিমা আক্তার',
    designation: 'স্বাস্থ্য সংগঠক',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    locationServed: 'কাসিয়ানী, গোপালগঞ্জ',
    phone: '+880 1812-100006',
    email: 'fatema.field@nit.bd',
    experience: '৩ বছরের সামাজিক স্বাস্থ্য ক্যাম্প',
    bio: 'কাসিয়ানী উপজেলার বিভিন্ন ইউনিয়নে ফ্রি মেডিক্যাল ক্যাম্পের আয়োজন ও স্থানীয় মানুষদের স্বাস্থ্য সচেতনতা বৃদ্ধিতে সক্রিয়।'
  },
  {
    id: 'f7',
    name: 'কামরুল হাসান',
    designation: 'ল্যাব ও ডায়াগনস্টিক হেল্প ডেস্ক প্রতিনিধি',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
    locationServed: 'পপুলার ও সেবা ডায়াগনস্টিক, গোপালগঞ্জ',
    phone: '+880 1812-100007',
    email: 'kamrul.lab@nit.bd',
    experience: '৪ বছরের ডায়াগনস্টিক বুথ হেল্প ডেস্ক',
    bio: 'পার্টনার ডায়াগনস্টিক সেন্টারে আগত DMB কার্ডধারীদের সরাসরি ৩০% ডিসকাউন্ট ভাউচার ও সিরিয়াল পেতে সাহায্য করেন।'
  },
  {
    id: 'f8',
    name: 'নাসরিন জাহান',
    designation: 'ফিল্ড কেয়ার কো-অর্ডিনেটর',
    category: 'field',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400',
    locationServed: 'মৌলভীবাজার ও সিলেট জোন',
    phone: '+880 1812-100008',
    email: 'nasrin.field@nit.bd',
    experience: '৫ বছরের হেলথ ভলান্টিয়ার কো-অর্ডিনেশন',
    bio: 'সিলেট বিভাগে প্রজেক্টের বিস্তার ও ফিল্ড ওয়ার্কারদের ট্রেনিং এবং সাপ্তাহিক রিপোর্ট সংগ্রহে দায়িত্ব পালন করেন।'
  }
];

// --- MySQL Persistence & Pool Configuration ---
let dbPool: mysql.Pool | null = null;
let isMySQLConnected = false;

async function saveToMySQL() {
  if (!dbPool || !isMySQLConnected) return;
  try {
    const data = {
      cards: dbCards,
      centers: dbCenters,
      tests: dbTests,
      packages: dbPackages,
      transactions: dbTransactions,
      blogs: dbBlogs,
      notices: dbNotices,
      bannerSettings: dbBannerSettings,
      siteSettings: dbSiteSettings,
      cardDesignSettings: dbCardDesignSettings,
      repApplications: dbRepApplications,
      repDistributions: dbRepDistributions,
      smsSettings: dbSmsSettings,
      smsLogs: dbSmsLogs,
      auditLogs: dbAuditLogs,
      contactMessages: dbContactMessages,
      userPasswords: dbUserPasswords,
      testimonials: dbTestimonials,
      customRoles: dbCustomRoles,
      pageContent: dbPageContent,
      jobCirculars: dbJobCirculars,
      teamMembers: dbTeamMembers,
      heroBannerSettings: dbHeroBannerSettings
    };
    const jsonStr = JSON.stringify(data);
    await dbPool.query(
      "INSERT INTO dmb_system_store (store_key, store_value) VALUES ('main_data', ?) ON DUPLICATE KEY UPDATE store_value = VALUES(store_value)",
      [jsonStr]
    );
  } catch (err: any) {
    console.error('❌ [MySQL] Save to database failed:', err.message);
  }
}

async function syncDataFromMySQL() {
  if (!dbPool || !isMySQLConnected) return;
  try {
    const [rows]: any = await dbPool.query("SELECT store_value FROM dmb_system_store WHERE store_key = 'main_data'");
    if (rows && rows.length > 0 && rows[0].store_value) {
      const data = JSON.parse(rows[0].store_value);
      if (Array.isArray(data.cards)) dbCards = data.cards;
      if (Array.isArray(data.centers)) dbCenters = data.centers;
      if (Array.isArray(data.tests)) dbTests = data.tests;
      if (Array.isArray(data.packages)) dbPackages = data.packages;
      if (Array.isArray(data.transactions)) dbTransactions = data.transactions;
      if (Array.isArray(data.blogs)) dbBlogs = data.blogs;
      if (Array.isArray(data.notices)) dbNotices = data.notices;
      if (data.bannerSettings) dbBannerSettings = { ...dbBannerSettings, ...data.bannerSettings };
      if (data.siteSettings) dbSiteSettings = { ...dbSiteSettings, ...data.siteSettings };
      if (data.cardDesignSettings) dbCardDesignSettings = { ...dbCardDesignSettings, ...data.cardDesignSettings };
      if (Array.isArray(data.repApplications)) dbRepApplications = data.repApplications;
      if (Array.isArray(data.repDistributions)) dbRepDistributions = data.repDistributions;
      if (data.smsSettings) dbSmsSettings = { ...dbSmsSettings, ...data.smsSettings };
      if (Array.isArray(data.smsLogs)) dbSmsLogs = data.smsLogs;
      if (Array.isArray(data.auditLogs)) dbAuditLogs = data.auditLogs;
      if (Array.isArray(data.contactMessages)) dbContactMessages = data.contactMessages;
      if (data.userPasswords) dbUserPasswords = { ...dbUserPasswords, ...data.userPasswords };
      if (Array.isArray(data.testimonials)) dbTestimonials = data.testimonials;
      if (Array.isArray(data.customRoles)) dbCustomRoles = data.customRoles;
      if (data.pageContent) dbPageContent = { ...dbPageContent, ...data.pageContent };
      if (Array.isArray(data.jobCirculars)) dbJobCirculars = data.jobCirculars;
      if (Array.isArray(data.teamMembers)) dbTeamMembers = data.teamMembers;
      if (data.heroBannerSettings) dbHeroBannerSettings = { ...dbHeroBannerSettings, ...data.heroBannerSettings };
      console.log('✅ [MySQL] Successfully synced dataset from MySQL database!');
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } else {
      console.log('ℹ️ [MySQL] Database table empty. Initializing seed dataset into MySQL...');
      await saveToMySQL();
    }
  } catch (err: any) {
    console.error('❌ [MySQL] Error loading data from MySQL:', err.message);
  }
}

async function initMySQLPool() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'national_health';
  const password = process.env.DB_PASSWORD || 'Health@2026';
  const database = process.env.DB_NAME || 'national_health';
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

  try {
    dbPool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 8000
    });

    const connection = await dbPool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS dmb_system_store (
        id INT PRIMARY KEY AUTO_INCREMENT,
        store_key VARCHAR(100) NOT NULL UNIQUE,
        store_value LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    connection.release();
    isMySQLConnected = true;
    console.log(`✅ [MySQL] Successfully connected to MySQL database '${database}' on '${host}:${port}'`);
    await syncDataFromMySQL();
  } catch (err: any) {
    console.warn(`⚠️ [MySQL] Could not connect to MySQL database (${err.message}). Using local JSON backup.`);
    isMySQLConnected = false;
  }
}

function saveDataToDisk() {
  try {
    const data = {
      cards: dbCards,
      centers: dbCenters,
      tests: dbTests,
      packages: dbPackages,
      transactions: dbTransactions,
      blogs: dbBlogs,
      notices: dbNotices,
      bannerSettings: dbBannerSettings,
      siteSettings: dbSiteSettings,
      cardDesignSettings: dbCardDesignSettings,
      repApplications: dbRepApplications,
      repDistributions: dbRepDistributions,
      smsSettings: dbSmsSettings,
      smsLogs: dbSmsLogs,
      auditLogs: dbAuditLogs,
      contactMessages: dbContactMessages,
      userPasswords: dbUserPasswords,
      testimonials: dbTestimonials,
      customRoles: dbCustomRoles,
      pageContent: dbPageContent,
      jobCirculars: dbJobCirculars,
      teamMembers: dbTeamMembers,
      heroBannerSettings: dbHeroBannerSettings
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    saveToMySQL().catch(err => console.error('Async MySQL save failed:', err));
  } catch (err) {
    console.error('[DataStore] Failed to save data to disk:', err);
  }
}

function loadDataFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data.cards)) dbCards = data.cards;
      if (Array.isArray(data.centers)) dbCenters = data.centers;
      if (Array.isArray(data.tests)) dbTests = data.tests;
      if (Array.isArray(data.packages)) dbPackages = data.packages;
      if (Array.isArray(data.transactions)) dbTransactions = data.transactions;
      if (Array.isArray(data.blogs)) dbBlogs = data.blogs;
      if (Array.isArray(data.notices)) dbNotices = data.notices;
      if (data.bannerSettings) dbBannerSettings = { ...dbBannerSettings, ...data.bannerSettings };
      if (data.siteSettings) dbSiteSettings = { ...dbSiteSettings, ...data.siteSettings };
      if (data.cardDesignSettings) dbCardDesignSettings = { ...dbCardDesignSettings, ...data.cardDesignSettings };
      if (Array.isArray(data.repApplications)) dbRepApplications = data.repApplications;
      if (Array.isArray(data.repDistributions)) dbRepDistributions = data.repDistributions;
      if (data.smsSettings) dbSmsSettings = { ...dbSmsSettings, ...data.smsSettings };
      if (Array.isArray(data.smsLogs)) dbSmsLogs = data.smsLogs;
      if (Array.isArray(data.auditLogs)) dbAuditLogs = data.auditLogs;
      if (Array.isArray(data.contactMessages)) dbContactMessages = data.contactMessages;
      if (data.userPasswords) dbUserPasswords = { ...dbUserPasswords, ...data.userPasswords };
      if (Array.isArray(data.testimonials)) dbTestimonials = data.testimonials;
      if (Array.isArray(data.customRoles)) dbCustomRoles = data.customRoles;
      if (data.pageContent) dbPageContent = { ...dbPageContent, ...data.pageContent };
      if (Array.isArray(data.jobCirculars)) dbJobCirculars = data.jobCirculars;
      if (Array.isArray(data.teamMembers)) dbTeamMembers = data.teamMembers;
      if (data.heroBannerSettings) dbHeroBannerSettings = { ...dbHeroBannerSettings, ...data.heroBannerSettings };
      console.log('✅ [DataStore] Successfully loaded database from data_store.json');
    }
  } catch (err) {
    console.error('[DataStore] Failed to load data from disk:', err);
  }
}


// User Passwords Map (Super Admin: Admin@2026, Staff/Partners/Reps/Doctors: 123456, Members: mobile number)
let dbUserPasswords: Record<string, string> = {
  'admin@health.nit.bd': 'Admin@2026',
  'admin@digitalmediabridge.com': 'Admin@2026',
  '01700000000': 'Admin@2026',
  'gopalganj.staff@digitalmediabridge.com': '123456',
  '01711223344': '123456',
  'gopalganj@populardiagnostic.com': '123456',
  '01711112222': '123456',
  'rep.gopalganj@digitalmediabridge.com': '123456',
  '01712998877': '123456',
  'dr.rahim@digitalmediabridge.com': '123456',
  '01812334455': '123456'
};

// Continuous Card Sequence Tracker
function getNextCardSequenceNumber(): number {
  let maxSeq = 1000;
  for (const card of dbCards) {
    const match = card.cardId.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }
  return maxSeq + 1;
}

let dbJobCirculars: JobCircular[] = [
  {
    id: 'JOB-2026-01',
    title: 'ফিল্ড এক্সিকিউটিভ (মেডিকেল কার্ড সেলস ও অনলাইন সার্ভিস)',
    position: 'উপজেলা ফিল্ড রিপ্রেজেন্টেটিভ (Representative)',
    district: 'গোপালগঞ্জ, নড়াইল ও সিলেট',
    upazila: 'সকল উপজেলা',
    vacancyCount: 15,
    salaryAllowance: '১৫,০০০ - ২৫,০০০ টাকা (ফিক্সড সম্মানী + আকর্ষণীয় সেলস পারফরম্যান্স বোনাস)',
    educationRequirement: 'এইচএসসি / স্নাতক সমমান (HSC / Graduate)',
    deadline: '2026-08-31',
    description: 'ডিজিটাল মিডিয়া ব্রিজের স্বাস্থ্য মেম্বারশিপ প্রজেক্টের আওতায় স্থানীয় পর্যায়ে কার্ড বিতরণ, সচেতনতা তৈরি, অনলাইন পেশেন্ট এনরোলমেন্ট ও পার্টনার হাসপাতালে পেশেন্ট সহায়তা করার জন্য উদ্যমী ফিল্ড প্রতিনিধি নিয়োগ দেওয়া হচ্ছে।',
    requirements: [
      'ন্যূনতম এইচএসসি পাশ বা সমমান ডিগ্রি',
      'স্থানীয় এলাকা ও এলাকার মানুষের সাথে যোগাযোগ দক্ষতা',
      'স্মার্টফোন ব্যবহারে দক্ষতা ও এনআরবি/মেডিকেল অ্যাপ ব্যবহারে পরিচিতি',
      'সততা, কর্মোদ্যম এবং কঠোর পরিশ্রম করার মানসিকতা'
    ],
    status: 'OPEN',
    postedDate: '2026-07-01'
  },
  {
    id: 'JOB-2026-02',
    title: 'মেডিকেল কো-অর্ডিনেটর ও ডায়াগনস্টিক পার্টনারশিপ অফিসার',
    position: 'এরিয়া কো-অর্ডিনেটর',
    district: 'গোপালগঞ্জ সদর',
    upazila: 'গোপালগঞ্জ সদর',
    vacancyCount: 3,
    salaryAllowance: '২০,০০০ - ৩০,০০০ টাকা + টিএ/ডিএ',
    educationRequirement: 'স্নাতক / বিএসসি (Graduate / Diploma)',
    deadline: '2026-08-15',
    description: 'গোপালগঞ্জ জেলার রেজিস্টার্ড পার্টনার ডায়াগনস্টিক সেন্টার ও ক্লিনিকের সাথে যোগাযোগ রক্ষা করা, ডিসকাউন্ট বিলিং তদারকি করা এবং ফিল্ড টিমকে পরিচালনা করা।',
    requirements: [
      'স্নাতক ডিগ্রীধারী (হেলথকেয়ার বা মার্কেটিং অভিজ্ঞ অগ্রাধিকার পাবে)',
      'ন্যূনতম ১ বছরের ফিল্ড নেটওয়ার্কিং অভিজ্ঞতা',
      'ডায়াগনস্টিক ও প্যাথলজি বিলিং সংক্রান্ত সাধারণ ধারণা'
    ],
    status: 'OPEN',
    postedDate: '2026-07-10'
  }
];

let dbRepApplications: RepresentativeApplication[] = [];
let dbRepDistributions: RepresentativeDistribution[] = [];
let dbSmsLogs: SmsLog[] = [];
let dbAuditLogs: AuditLog[] = [];
let dbReports: MedicalReport[] = [];
let dbPrescriptions: Prescription[] = [];
let dbSurveys: HealthSurvey[] = [];
let dbPartnerApps: PartnerApplication[] = [];
let dbContactMessages: ContactMessage[] = [];

// Pre-generated QR codes
async function generateCardQRCode(cardId: string): Promise<string> {
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify?id=${cardId}`;
  try {
    return await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      color: { dark: '#0284c7', light: '#ffffff' }
    });
  } catch (err) {
    return '';
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Load persistent store from disk if exists
  loadDataFromDisk();

  // Initialize MySQL Connection Pool & Load Latest Data from MySQL if connected
  await initMySQLPool();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS middleware for cPanel / multi-domain access
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // DB Connection Diagnostic Endpoint
  app.get('/api/db-status', (req, res) => {
    res.json({
      mysqlConnected: isMySQLConnected,
      dbHost: process.env.DB_HOST || 'localhost',
      dbName: process.env.DB_NAME || 'national_health',
      dbUser: process.env.DB_USER || 'national_health',
      dbPort: process.env.DB_PORT || '3306',
      message: isMySQLConnected 
        ? 'MySQL ডাটাবেজ সফলভাবে সংযুক্ত ও ডাটা সিঙ্কড রয়েছে।' 
        : 'MySQL সংযোগ বিচ্ছিন্ন বা কনফিগার করা হয়নি। ব্যাকআপ ফাইলে ডাটা সংরক্ষিত হচ্ছে।'
    });
  });


  // Attach QR codes to initial cards
  for (const card of dbCards) {
    if (!card.qrCodeDataUrl) {
      card.qrCodeDataUrl = await generateCardQRCode(card.cardId);
    }
  }

  // --- REST API ROUTES ---

  function renderSmsTemplate(templateStr: string, vars: Record<string, string>): string {
    if (!templateStr) return '';
    let res = templateStr;
    for (const [k, v] of Object.entries(vars)) {
      res = res.split(`{${k}}`).join(v || '');
    }
    return res;
  }

  // --- BULK SMS BD GATEWAY HELPER ---
  async function sendRealSms(mobile: string, recipientName: string, messageText: string, type: string = 'NOTIFICATION') {
    const cleanMobile = mobile.trim().replace(/[^\d]/g, '');
    const formattedMobile = cleanMobile.startsWith('01') ? '88' + cleanMobile : cleanMobile;

    if (!dbSmsSettings.enabled) {
      console.log(`[SMS Gateway Simulated Mode] Sent to ${formattedMobile}: ${messageText}`);
      const log: SmsLog = {
        id: `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        mobile: mobile.trim(),
        recipientName: recipientName || 'গ্রাহক',
        type: type as any,
        messageText: messageText + ' [Simulated Mode]',
        sentAt: new Date().toLocaleString('bn-BD'),
        status: 'DELIVERED'
      };
      dbSmsLogs.unshift(log);
      return { success: true, apiResponse: 'Simulated Mode (Disabled in Admin Settings)', errorMessage: '', log };
    }

    const { apiKey, senderId, apiUrl } = dbSmsSettings;
    const smsUrl = `${apiUrl}?api_key=${apiKey}&type=text&number=${encodeURIComponent(formattedMobile)}&senderid=${senderId}&message=${encodeURIComponent(messageText)}`;

    let status: 'DELIVERED' | 'FAILED' = 'FAILED';
    let apiResponse = '';
    let errorMessage = '';

    try {
      const response = await fetch(smsUrl);
      const text = await response.text();
      apiResponse = text;

      try {
        const json = JSON.parse(text);
        if (json.response_code === 202 || (json.success_message && !json.error_message)) {
          status = 'DELIVERED';
        } else {
          status = 'FAILED';
          errorMessage = json.error_message || `API error code: ${json.response_code}`;
        }
      } catch (e) {
        if (text.includes('202') || text.includes('Successfully')) {
          status = 'DELIVERED';
        } else {
          status = 'FAILED';
          errorMessage = text;
        }
      }

      console.log(`[BulkSMSBD API] Sent to ${formattedMobile}, Status: ${status}, Response: ${text}`);
    } catch (err: any) {
      console.error(`[BulkSMSBD Error] Failed to connect to API for ${formattedMobile}:`, err?.message || err);
      status = 'FAILED';
      apiResponse = err?.message || 'Network Error';
      errorMessage = 'সার্ভার থেকে BulkSMSBD API তে কানেক্ট করা যায়নি।';
    }

    const log: SmsLog = {
      id: `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      mobile: mobile.trim(),
      recipientName: recipientName || 'গ্রাহক',
      type: type as any,
      messageText,
      sentAt: new Date().toLocaleString('bn-BD'),
      status
    };

    dbSmsLogs.unshift(log);
    return { success: status === 'DELIVERED', apiResponse, errorMessage, log };
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Digital Medi Bridge (DMB) Healthcare API', region: 'Bangladesh (Gopalganj, Narail & Sylhet Pilot)' });
  });

  // Auth / Login
  app.post('/api/auth/login', (req, res) => {
    const { emailOrMobile, password, role } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({ error: 'মোবাইল/ইমেইল এবং পাসওয়ার্ড আবশ্যক।' });
    }

    const cleanedIdentifier = emailOrMobile.trim();
    const lowerIdentifier = cleanedIdentifier.toLowerCase();

    let user: User | null = null;
    let expectedPassword = '123456';

    // 1. Check Super Admin
    if (role === 'SUPER_ADMIN' || lowerIdentifier === 'admin@health.nit.bd' || lowerIdentifier === 'admin@digitalmediabridge.com') {
      if (lowerIdentifier !== 'admin@health.nit.bd' && lowerIdentifier !== 'admin@digitalmediabridge.com' && cleanedIdentifier !== '01700000000' && cleanedIdentifier !== '016016731731') {
        return res.status(401).json({ error: 'ইউজারনেম বা মোবাইল নম্বর সঠিক নয়।' });
      }
      expectedPassword = 'Admin@2026';
      user = {
        id: 'USR-ADMIN-01',
        name: 'DMB Chief System Administrator',
        email: 'admin@health.nit.bd',
        mobile: '01700000000',
        role: 'SUPER_ADMIN',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        createdAt: '2026-01-01'
      };
    } 
    // 2. Check Admin Staff
    else if (role === 'ADMIN_STAFF') {
      if (lowerIdentifier !== 'gopalganj.staff@digitalmediabridge.com' && cleanedIdentifier !== '01711223344' && cleanedIdentifier !== '01700000000') {
        return res.status(401).json({ error: 'স্টাফ এডমিন অ্যাকাউন্ট পাওয়া যায়নি।' });
      }
      expectedPassword = '123456';
      user = {
        id: 'USR-STAFF-02',
        name: 'Gopalganj Operations Manager',
        email: 'gopalganj.staff@digitalmediabridge.com',
        mobile: '01711223344',
        role: 'ADMIN_STAFF',
        createdAt: '2026-01-05'
      };
    } 
    // 3. Check Diagnostic Partner
    else if (role === 'DIAGNOSTIC_PARTNER') {
      const center = dbCenters.find(c => c.mobile === cleanedIdentifier || (c.email && c.email.toLowerCase() === lowerIdentifier));
      if (!center) {
        return res.status(401).json({ error: 'পার্টনার ডায়াগনস্টিক সেন্টার অ্যাকাউন্ট পাওয়া যায়নি।' });
      }
      expectedPassword = '123456';
      user = {
        id: `USR-PARTNER-${center.id}`,
        name: center.name,
        email: center.email || 'partner@popular.com',
        mobile: center.mobile,
        role: 'DIAGNOSTIC_PARTNER',
        partnerId: center.id,
        createdAt: '2026-01-10'
      };
    } 
    // 4. Check Representative
    else if (role === 'REPRESENTATIVE') {
      const rep = dbRepApplications.find(r => r.mobile === cleanedIdentifier || (r.email && r.email.toLowerCase() === lowerIdentifier));
      if (!rep) {
        return res.status(401).json({ error: 'ফিল্ড প্রতিনিধি অ্যাকাউন্ট পাওয়া যায়নি।' });
      }
      expectedPassword = '123456';
      user = {
        id: rep.id,
        name: `${rep.name} (মাঠ প্রতিনিধি)`,
        email: rep.email || 'rep@digitalmediabridge.com',
        mobile: rep.mobile,
        role: 'REPRESENTATIVE',
        avatar: rep.photoUrl,
        createdAt: rep.appliedDate
      };
    } 
    // 5. Check Doctor
    else if (role === 'DOCTOR') {
      if (lowerIdentifier !== 'dr.shafiq@popular.com' && cleanedIdentifier !== '01812334455') {
        return res.status(401).json({ error: 'ডাক্তার অ্যাকাউন্ট পাওয়া যায়নি।' });
      }
      expectedPassword = '123456';
      user = {
        id: 'USR-DOC-01',
        name: 'ডাক্তার কে এম শফিকুল ইসলাম (MBBS, FCPS)',
        email: 'dr.shafiq@popular.com',
        mobile: '01812334455',
        role: 'DOCTOR',
        createdAt: '2026-01-15'
      };
    } 
    // 6. Medical Card Member
    else {
      const card = dbCards.find(
        c => c.mobile === cleanedIdentifier || (c.email && c.email.toLowerCase() === lowerIdentifier) || c.cardId.toUpperCase() === cleanedIdentifier.toUpperCase()
      );
      if (!card) {
        return res.status(401).json({ error: 'মেডিক্যাল কার্ড মেম্বার অ্যাকাউন্ট পাওয়া যায়নি।' });
      }
      expectedPassword = cleanedIdentifier; // Default password for members is their mobile/card number
      user = {
        id: `USR-${card.memberId}`,
        name: card.memberName,
        email: card.email || `${card.mobile}@dmb.bd`,
        mobile: card.mobile,
        role: 'MEDICAL_CARD_MEMBER',
        memberId: card.memberId,
        avatar: card.photoUrl,
        createdAt: card.issueDate
      };
    }

    // Check custom password if set, else expected default password
    const customPassword = dbUserPasswords[cleanedIdentifier] || dbUserPasswords[lowerIdentifier];
    const targetPassword = customPassword || expectedPassword;

    if (password !== targetPassword) {
      return res.status(401).json({ error: 'পাসওয়ার্ড ভুল হয়েছে! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, partnerId: user.partnerId, memberId: user.memberId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user });
  });

  // Verify Medical Card (Public Endpoint - Search by Card ID, Name, Mobile, or NID)
  app.get('/api/cards/verify/:cardId', async (req, res) => {
    const rawQuery = decodeURIComponent(req.params.cardId).trim();
    if (!rawQuery) {
      return res.status(400).json({ verified: false, message: 'অনুগ্রহ করে অনুসন্ধানের জন্য তথ্য প্রদান করুন।' });
    }

    const qLower = rawQuery.toLowerCase();
    const qClean = rawQuery.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // Find matching cards from dbCards
    const matches = dbCards.filter(c => {
      const cardIdLower = (c.cardId || '').toLowerCase();
      const memberIdLower = (c.memberId || '').toLowerCase();
      const memberNameLower = (c.memberName || '').toLowerCase();
      const mobileClean = (c.mobile || '').replace(/\D/g, '');
      const nidClean = (c.nidOrBirthCert || '').replace(/\D/g, '');

      // 1. Card ID or member ID match
      if (
        cardIdLower === qLower ||
        cardIdLower === `dmb-2026-${qLower}` ||
        cardIdLower.endsWith(`-${qLower}`) ||
        cardIdLower.includes(qLower)
      ) {
        return true;
      }

      if (memberIdLower === qLower || memberIdLower.includes(qLower)) {
        return true;
      }

      // 2. Member Name match
      if (memberNameLower.includes(qLower)) {
        return true;
      }

      // 3. Mobile match
      if (mobileClean && qClean && (mobileClean.includes(qClean) || (c.mobile || '').includes(rawQuery))) {
        return true;
      }

      // 4. NID / Birth Cert match
      if (
        nidClean && qClean &&
        (nidClean.includes(qClean) || (c.nidOrBirthCert || '').toLowerCase().includes(qLower))
      ) {
        return true;
      }

      return false;
    });

    if (matches.length === 0) {
      return res.status(404).json({
        verified: false,
        message: 'প্রদত্ত তথ্য (কার্ড নম্বর, নাম, মোবাইল বা এনআইডি) দিয়ে কোনো নিবন্ধিত মেডিক্যাল কার্ড পাওয়া যায়নি।'
      });
    }

    // Generate QR code for matched cards if missing
    for (const card of matches) {
      if (!card.qrCodeDataUrl) {
        card.qrCodeDataUrl = await generateCardQRCode(card.cardId);
      }
      const isExpired = new Date(card.expiryDate) < new Date();
      if (isExpired) {
        card.status = 'EXPIRED';
      }
    }

    const primaryCard = matches.find(c => c.status === 'ACTIVE' || c.status === 'APPROVED') || matches[0];

    return res.json({
      verified: primaryCard.status === 'ACTIVE' || primaryCard.status === 'APPROVED',
      card: primaryCard,
      cards: matches,
      count: matches.length,
      verificationTimestamp: new Date().toISOString()
    });
  });

  // Medical Card Apply (Public Form)
  app.post('/api/members/apply', async (req, res) => {
    const {
      memberName,
      cardTier = 'Silver',
      beneficiaries = [],
      fatherName,
      motherName,
      dob,
      gender,
      bloodGroup,
      mobile,
      email,
      address,
      upazila,
      district,
      nidOrBirthCert,
      photoUrl,
      feeAmount,
      paymentMethod,
      paymentSenderNo,
      trxId,
      customCardId,
      cardId: reqCardId,
      instantApprove = false // Admin direct add flag
    } = req.body;

    if (!memberName || !mobile || !bloodGroup || !nidOrBirthCert) {
      return res.status(400).json({ error: 'অনুগ্রহ করে সকল আবশ্যকীয় তথ্য (নাম, মোবাইল, রক্তের গ্রুপ, NID) পূরণ করুন।' });
    }

    // Rule 3: One Mobile Number = One Active or Pending Medical Card
    const existingMobileCard = dbCards.find(
      c => c.mobile.trim() === mobile.trim() && c.status !== 'REJECTED'
    );
    if (existingMobileCard) {
      return res.status(400).json({
        error: `মোবাইল নম্বর ${mobile} দিয়ে ইতিমধ্যে একটি মেডিক্যাল কার্ড আবেদন বা ইস্যু করা হয়েছে (কার্ড নম্বর: ${existingMobileCard.cardId}, স্ট্যাটাস: ${existingMobileCard.status})। একটি মোবাইল নম্বরের বিপরীতে কেবল একটি মাত্র কার্ড আবেদন গ্রহণযোগ্য।`
      });
    }

    const tier: 'Silver' | 'Gold' | 'Platinum' = ['Silver', 'Gold', 'Platinum'].includes(cardTier) ? cardTier : 'Silver';
    const memberLimit = tier === 'Silver' ? 4 : tier === 'Gold' ? 6 : 8;

    // Rule 10: Automatic Card Number Sequence
    const userProvidedCardId = (customCardId || reqCardId || '').toString().trim();
    let cardId = '';

    if (userProvidedCardId) {
      let normalized = userProvidedCardId.toUpperCase();
      if (/^\d+$/.test(normalized)) {
        normalized = `DMB-2026-${normalized}`;
      } else if (!normalized.startsWith('DMB-')) {
        normalized = `DMB-${normalized}`;
      }
      
      const existing = dbCards.find(c => c.cardId.toUpperCase() === normalized || c.memberId.toUpperCase() === normalized);
      if (existing) {
        return res.status(400).json({ 
          error: `কার্ড নম্বর "${normalized}" ইতিমধ্যে ব্যবহার করা হয়েছে (${existing.memberName}-এর নামে নিবন্ধিত)। অনুগ্রহ করে সঠিক প্রিন্ট করা কার্ড নম্বরটি ব্যবহার করুন।` 
        });
      }
      cardId = normalized;
    } else {
      const nextSeq = getNextCardSequenceNumber();
      cardId = `DMB-2026-${nextSeq}`;
    }

    const memberId = `MEM-${Date.now().toString().slice(-6)}`;
    
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    const issueDate = today.toISOString().split('T')[0];
    const expiryDate = nextYear.toISOString().split('T')[0];

    const qrCodeDataUrl = await generateCardQRCode(cardId);

    // Rule 1: Initial status is PENDING (unless instantApprove = true from Admin Panel)
    const initialStatus = instantApprove ? 'ACTIVE' : 'PENDING';

    const newCard: MedicalCard = {
      cardId,
      memberId,
      memberName,
      cardTier: tier,
      memberLimit,
      beneficiaries: Array.isArray(beneficiaries) && beneficiaries.length > 0 ? beneficiaries : [memberName],
      fatherName: fatherName || '',
      motherName: motherName || '',
      dob: dob || '1990-01-01',
      gender: gender || 'Male',
      bloodGroup,
      mobile: mobile.trim(),
      email: email || '',
      address: address || 'Gopalganj',
      upazila: upazila || 'Gopalganj Sadar',
      district: district || 'Gopalganj',
      nidOrBirthCert,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      issueDate,
      expiryDate,
      status: initialStatus,
      qrCodeDataUrl,
      feeAmount: feeAmount || (tier === 'Silver' ? 200 : tier === 'Gold' ? 350 : 500),
      paymentMethod: paymentMethod || 'bKash',
      paymentSenderNo: paymentSenderNo || mobile,
      trxId: trxId || `DMB-TRX-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentStatus: trxId ? 'PAID' : 'VERIFIED'
    };

    dbCards.unshift(newCard);

    // Set Default Password = Mobile Number
    dbUserPasswords[mobile.trim()] = mobile.trim();

    // Rule 1 & 11: Auto-send Application Submission SMS via BulkSMSBD
    const smsMsg = renderSmsTemplate(dbSmsSettings.templates.appSubmitted, {
      name: memberName,
      cardId,
      mobile: mobile.trim()
    });
    await sendRealSms(mobile.trim(), memberName, smsMsg, 'APP_SUBMITTED');

    // Rule 12: Audit Log
    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'CARD_APPLICATION_SUBMITTED',
      details: `Card application submitted for ${memberName} (${cardId}), Status: ${initialStatus}`,
      performedBy: memberName,
      targetId: cardId,
      timestamp: new Date().toISOString()
    });

    saveDataToDisk();

    return res.status(201).json({
      success: true,
      message: 'Medical card application submitted successfully!',
      card: newCard
    });
  });

  // Approve Card Application (Admin)
  app.post('/api/members/:cardId/approve', async (req, res) => {
    const card = dbCards.find(c => c.cardId === req.params.cardId);
    if (!card) {
      return res.status(404).json({ error: 'মেডিক্যাল কার্ড পাওয়া যায়নি।' });
    }

    card.status = 'ACTIVE';

    // Rule 1 & 11: Auto Approval SMS via BulkSMSBD
    const smsText = renderSmsTemplate(dbSmsSettings.templates.appApproved, {
      name: card.memberName,
      cardId: card.cardId,
      mobile: card.mobile
    });
    await sendRealSms(card.mobile, card.memberName, smsText, 'APP_APPROVED');

    // Audit Log
    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'CARD_APPROVED',
      details: `Card ${card.cardId} approved by Admin`,
      performedBy: 'ADMIN',
      targetId: card.cardId,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'কার্ড সফলভাবে অনুমোদন করা হয়েছে।', card });
  });

  // Reject Card Application (Admin)
  app.post('/api/members/:cardId/reject', async (req, res) => {
    const card = dbCards.find(c => c.cardId === req.params.cardId);
    if (!card) {
      return res.status(404).json({ error: 'মেডিক্যাল কার্ড পাওয়া যায়নি।' });
    }

    card.status = 'REJECTED';

    const smsText = renderSmsTemplate(dbSmsSettings.templates.appRejected, {
      name: card.memberName,
      cardId: card.cardId,
      mobile: card.mobile
    });
    await sendRealSms(card.mobile, card.memberName, smsText, 'APP_REJECTED');

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'CARD_REJECTED',
      details: `Card ${card.cardId} rejected by Admin`,
      performedBy: 'ADMIN',
      targetId: card.cardId,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'আবেদনটি প্রত্যাখান করা হয়েছে।', card });
  });

  // Rule 9 & 10: Bulk Medical Card Generation
  app.post('/api/admin/cards/bulk-generate', async (req, res) => {
    const { startRange, endRange, cardTier = 'Silver' } = req.body;

    const start = parseInt(startRange, 10);
    const end = parseInt(endRange, 10);

    if (isNaN(start) || isNaN(end) || start > end || start <= 0) {
      return res.status(400).json({ error: 'সঠিক রেঞ্জ সংখ্যা প্রদান করুন (যেমন: 1001 থেকে 1200)।' });
    }

    if (end - start > 1000) {
      return res.status(400).json({ error: 'একবারে সর্বোচ্চ ১০০০টি কার্ড জেনারেট করা সম্ভব।' });
    }

    const tier: 'Silver' | 'Gold' | 'Platinum' = ['Silver', 'Gold', 'Platinum'].includes(cardTier) ? cardTier : 'Silver';
    const memberLimit = tier === 'Silver' ? 4 : tier === 'Gold' ? 6 : 8;

    const generatedCards: MedicalCard[] = [];
    let skippedCount = 0;

    for (let i = start; i <= end; i++) {
      const cardId = `DMB-2026-${i}`;
      
      // Check if card number already exists
      const existing = dbCards.find(c => c.cardId === cardId);
      if (existing) {
        skippedCount++;
        continue;
      }

      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);

      const qrCodeDataUrl = await generateCardQRCode(cardId);

      const newCard: MedicalCard = {
        cardId,
        memberId: `MEM-BULK-${i}`,
        memberName: `ছাপানো কার্ড #${i} (Unassigned)`,
        cardTier: tier,
        memberLimit,
        beneficiaries: [],
        dob: '2000-01-01',
        gender: 'Male',
        bloodGroup: 'Unassigned',
        mobile: `017000${i.toString().padStart(5, '0')}`,
        address: 'Gopalganj',
        upazila: 'Gopalganj Sadar',
        district: 'Gopalganj',
        nidOrBirthCert: `NID-BULK-${i}`,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        issueDate: today.toISOString().split('T')[0],
        expiryDate: nextYear.toISOString().split('T')[0],
        status: 'UNASSIGNED',
        qrCodeDataUrl,
        feeAmount: tier === 'Silver' ? 200 : tier === 'Gold' ? 350 : 500,
        paymentStatus: 'PAID'
      };

      generatedCards.push(newCard);
      dbCards.push(newCard);
    }

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'BULK_CARDS_GENERATED',
      details: `Generated ${generatedCards.length} cards from DMB-2026-${start} to DMB-2026-${end}. Skipped ${skippedCount} existing.`,
      performedBy: 'ADMIN',
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `${generatedCards.length}টি ইউনিক কার্ড সফলভাবে বাল্ক জেনারেট করা হয়েছে! (${skippedCount}টি পূর্বে বিদ্যমান ছিল)`,
      generatedCount: generatedCards.length,
      skippedCount
    });
  });

  // --- JOB CIRCULARS API ENDPOINTS ---
  app.get('/api/job-circulars', (req, res) => {
    return res.json(dbJobCirculars);
  });

  app.post('/api/job-circulars', (req, res) => {
    const { title, position, district, upazila, vacancyCount, salaryAllowance, educationRequirement, deadline, description, requirements } = req.body;
    if (!title || !position || !district) {
      return res.status(400).json({ error: 'অনুগ্রহ করে সার্কুলারের শিরোনাম, পদবী এবং জেলা উল্লেখ করুন।' });
    }

    const newCircular: JobCircular = {
      id: `JOB-${Date.now().toString().slice(-6)}`,
      title,
      position,
      district,
      upazila: upazila || '',
      vacancyCount: Number(vacancyCount) || 1,
      salaryAllowance: salaryAllowance || 'আলোচনা সাপেক্ষে',
      educationRequirement: educationRequirement || 'এইচএসসি / স্নাতক',
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: description || '',
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      status: 'OPEN',
      postedDate: new Date().toISOString().split('T')[0]
    };

    dbJobCirculars.unshift(newCircular);
    saveDataToDisk();

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'JOB_CIRCULAR_CREATED',
      details: `Job circular created: ${title} (${newCircular.id})`,
      performedBy: 'ADMIN',
      targetId: newCircular.id,
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({ success: true, message: 'জব সার্কুলার সফলভাবে পোস্ট করা হয়েছে।', circular: newCircular });
  });

  app.put('/api/job-circulars/:id', (req, res) => {
    const { id } = req.params;
    const index = dbJobCirculars.findIndex(j => j.id === id);
    if (index === -1) return res.status(404).json({ error: 'সার্কুলার পাওয়া যায়নি।' });

    dbJobCirculars[index] = { ...dbJobCirculars[index], ...req.body };
    saveDataToDisk();

    return res.json({ success: true, message: 'জব সার্কুলার তথ্য সফলভাবে আপডেট করা হয়েছে।', circular: dbJobCirculars[index] });
  });

  app.delete('/api/job-circulars/:id', (req, res) => {
    const { id } = req.params;
    const index = dbJobCirculars.findIndex(j => j.id === id);
    if (index === -1) return res.status(404).json({ error: 'সার্কুলার পাওয়া যায়নি।' });

    const removed = dbJobCirculars.splice(index, 1)[0];
    saveDataToDisk();

    return res.json({ success: true, message: 'জব সার্কুলার সফলভাবে মুছে ফেলা হয়েছে।' });
  });

  // Rule 4 & 5: Representative Registration & Job Application Submission
  app.post('/api/representatives/register', async (req, res) => {
    const {
      circularId,
      circularTitle,
      name,
      fatherName,
      motherName,
      dob,
      gender,
      mobile,
      email,
      nidNo,
      educationalQualification,
      experienceYears,
      address,
      upazila,
      district,
      photoUrl,
      nidDocUrl,
      educationDocUrl,
      cvDocUrl,
      assignedArea,
      notes
    } = req.body;

    if (!name || !mobile || !nidNo || !fatherName) {
      return res.status(400).json({ error: 'অনুগ্রহ করে সকল আবশ্যকীয় ঘরসমূহ (নাম, মোবাইল, পিতার নাম, NID) পূরণ করুন।' });
    }

    const existingApp = dbRepApplications.find(a => a.mobile === mobile || a.nidNo === nidNo);
    if (existingApp) {
      return res.status(400).json({ error: `মোবাইল অথবা NID ${mobile} দিয়ে ইতিমধ্যে প্রতিনিধি নিবন্ধনের আবেদন জমা করা হয়েছে।` });
    }

    const newApp: RepresentativeApplication = {
      id: `REP-APP-${Date.now().toString().slice(-6)}`,
      circularId: circularId || '',
      circularTitle: circularTitle || 'সাধারণ প্রতিনিধি নিবন্ধন',
      name,
      fatherName,
      motherName: motherName || '',
      dob: dob || '1995-01-01',
      gender: gender || 'Male',
      mobile: mobile.trim(),
      email: email || '',
      nidNo,
      educationalQualification: educationalQualification || '',
      experienceYears: experienceYears || '',
      address: address || '',
      upazila: upazila || 'Gopalganj Sadar',
      district: district || 'Gopalganj',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      nidDocUrl: nidDocUrl || '',
      educationDocUrl: educationDocUrl || '',
      cvDocUrl: cvDocUrl || '',
      assignedArea: assignedArea || `${upazila} এলাকা`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      notes: notes || ''
    };

    dbRepApplications.unshift(newApp);
    saveDataToDisk();

    // Send Representative Submission Confirmation SMS
    const repSubTemplate = dbSmsSettings.templates.repSubmitted || 'প্রিয় {name}, DMB ফিল্ড রিপ্রেজেন্টেটিভ পদে আপনার আবেদনটি সফলভাবে গ্রহণ করা হয়েছে। আবেদন আইডি: {repId}। পেপারস যাচাই শেষে আপনাকে এসএমএস দিয়ে জানানো হবে। ধন্যবাদ।';
    const repSmsText = renderSmsTemplate(repSubTemplate, {
      name: newApp.name,
      repId: newApp.id,
      mobile: newApp.mobile,
      circularTitle: newApp.circularTitle
    });
    await sendRealSms(newApp.mobile, newApp.name, repSmsText, 'REP_SUBMITTED');

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'REP_APPLICATION_SUBMITTED',
      details: `Representative application submitted for ${name} (${mobile}) for ${newApp.circularTitle}`,
      performedBy: name,
      targetId: newApp.id,
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'প্রতিনিধি পদে আপনার আবেদন ও পেপারস সফলভাবে জমা নেওয়া হয়েছে। অ্যাডমিন প্যানেল হতে পেপারস যাচাই শেষে আপনাকে এসএমএস এর মাধ্যমে জানানো হবে।',
      application: newApp
    });
  });

  // Get Representative Applications (Admin)
  app.get('/api/representatives/applications', (req, res) => {
    res.json(dbRepApplications);
  });

  // Approve Representative Application (Admin)
  app.post('/api/representatives/applications/:id/approve', async (req, res) => {
    const { adminNotes, dailyTarget, weeklyTarget, monthlyTarget } = req.body;
    const appItem = dbRepApplications.find(a => a.id === req.params.id);
    if (!appItem) {
      return res.status(404).json({ error: 'প্রতিনিধি আবেদন পাওয়া যায়নি।' });
    }

    appItem.status = 'APPROVED';
    if (adminNotes) appItem.adminNotes = adminNotes;
    if (dailyTarget !== undefined) appItem.dailyTarget = dailyTarget;
    if (weeklyTarget !== undefined) appItem.weeklyTarget = weeklyTarget;
    if (monthlyTarget !== undefined) appItem.monthlyTarget = monthlyTarget;

    // Set Default Password = Mobile Number
    dbUserPasswords[appItem.mobile] = appItem.mobile;

    saveDataToDisk();

    // Send Approval SMS via BulkSMSBD
    const smsText = renderSmsTemplate(dbSmsSettings.templates.repApproved, {
      name: appItem.name,
      repId: appItem.id,
      mobile: appItem.mobile
    });
    await sendRealSms(appItem.mobile, appItem.name, smsText, 'REP_APPROVED');

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'REP_APPROVED',
      details: `Representative ${appItem.name} (${appItem.mobile}) approved by Admin. Papers verified.`,
      performedBy: 'ADMIN',
      targetId: appItem.id,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'প্রতিনিধি একাউন্ট ও পেপারস সফলভাবে অনুমোদন করা হয়েছে।', application: appItem });
  });

  // Reject Representative Application (Admin)
  app.post('/api/representatives/applications/:id/reject', async (req, res) => {
    const { adminNotes } = req.body;
    const appItem = dbRepApplications.find(a => a.id === req.params.id);
    if (!appItem) {
      return res.status(404).json({ error: 'প্রতিনিধি আবেদন পাওয়া যায়নি।' });
    }

    appItem.status = 'REJECTED';
    appItem.adminNotes = adminNotes || 'কাগজপত্রে অসংগতি থাকায় বা প্রয়োজনীয় তথ্যের অভাবে প্রত্যাখ্যাত হয়েছে।';

    saveDataToDisk();

    // Send Rejection SMS
    const repRejTemplate = dbSmsSettings.templates.repRejected || 'প্রিয় {name}, DMB প্রতিনিধি পদে আপনার আবেদনটি বাতিল করা হয়েছে। কারণ: {reason}। হেল্পলাইন: +8809658887470';
    const smsText = renderSmsTemplate(repRejTemplate, {
      name: appItem.name,
      repId: appItem.id,
      mobile: appItem.mobile,
      reason: appItem.adminNotes
    });
    await sendRealSms(appItem.mobile, appItem.name, smsText, 'REP_REJECTED');

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'REP_REJECTED',
      details: `Representative application for ${appItem.name} (${appItem.mobile}) rejected by Admin. Reason: ${appItem.adminNotes}`,
      performedBy: 'ADMIN',
      targetId: appItem.id,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'আবেদনটি প্রত্যাখ্যান (Reject) করা হয়েছে এবং প্রার্থীকে এসএমএস পাঠানো হয়েছে।', application: appItem });
  });

  // Edit Representative Profile (Admin)
  app.put('/api/representatives/applications/:id', (req, res) => {
    const { id } = req.params;
    const index = dbRepApplications.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'প্রতিনিধি পাওয়া যায়নি।' });

    dbRepApplications[index] = { ...dbRepApplications[index], ...req.body };

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'REP_PROFILE_UPDATED',
      details: `Updated representative profile for ${dbRepApplications[index].name} (${id})`,
      performedBy: 'ADMIN',
      targetId: id,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'প্রতিনিধির তথ্য সফলভাবে আপডেট করা হয়েছে।', application: dbRepApplications[index] });
  });

  // Delete Representative Profile (Admin)
  app.delete('/api/representatives/applications/:id', (req, res) => {
    const { id } = req.params;
    const index = dbRepApplications.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'প্রতিনিধি পাওয়া যায়নি।' });

    const removed = dbRepApplications.splice(index, 1)[0];

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'REP_PROFILE_DELETED',
      details: `Deleted representative profile for ${removed.name} (${id})`,
      performedBy: 'ADMIN',
      targetId: id,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'প্রতিনিধির প্রোফাইল সফলভাবে মুছে ফেলা হয়েছে।' });
  });

  // Rule 8: Representative Card Distribution & Tracking
  app.post('/api/representatives/distribute-cards', (req, res) => {
    const { repId, repName, repMobile, startSerialNum, endSerialNum, assignedBy } = req.body;

    const startNum = parseInt(startSerialNum, 10);
    const endNum = parseInt(endSerialNum, 10);

    if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
      return res.status(400).json({ error: 'সঠিক সিরিয়াল নম্বর প্রদান করুন (যেমন: 1001 থেকে 1050)।' });
    }

    const totalCards = endNum - startNum + 1;

    // Calculate real-time counts from dbCards
    let registeredCount = 0;
    let activatedCount = 0;
    let pendingCount = 0;

    for (let i = startNum; i <= endNum; i++) {
      const serial = `DMB-2026-${i}`;
      const foundCard = dbCards.find(c => c.cardId === serial);
      if (foundCard && foundCard.status !== 'UNASSIGNED') {
        registeredCount++;
        if (foundCard.status === 'ACTIVE') activatedCount++;
        if (foundCard.status === 'PENDING') pendingCount++;
      }
    }

    const distribution: RepresentativeDistribution = {
      id: `DIST-${Date.now().toString().slice(-6)}`,
      repId: repId || 'REP-001',
      repName: repName || 'মাঠ প্রতিনিধি',
      repMobile: repMobile || '01700000000',
      distributionDate: new Date().toISOString().split('T')[0],
      totalCards,
      startSerialNum: startNum,
      endSerialNum: endNum,
      startSerial: `DMB-2026-${startNum}`,
      endSerial: `DMB-2026-${endNum}`,
      registeredCount,
      remainingCount: totalCards - registeredCount,
      activatedCount,
      pendingCount,
      assignedBy: assignedBy || 'Admin'
    };

    dbRepDistributions.unshift(distribution);

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'CARD_DISTRIBUTION_ASSIGNED',
      details: `Distributed ${totalCards} cards (${distribution.startSerial} to ${distribution.endSerial}) to ${repName}`,
      performedBy: assignedBy || 'ADMIN',
      targetId: distribution.id,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'কার্ড ইনভেন্টরি প্রতিনিধিকে সঠিকভাবে বরাদ্দ করা হয়েছে।', distribution });
  });

  // Get Card Distributions Tracking
  app.get('/api/representatives/distributions', (req, res) => {
    // Recompute real-time counts for accuracy
    const updatedDistributions = dbRepDistributions.map(d => {
      let registered = 0;
      let activated = 0;
      let pending = 0;

      for (let i = d.startSerialNum; i <= d.endSerialNum; i++) {
        const serial = `DMB-2026-${i}`;
        const found = dbCards.find(c => c.cardId === serial);
        if (found && found.status !== 'UNASSIGNED') {
          registered++;
          if (found.status === 'ACTIVE') activated++;
          if (found.status === 'PENDING') pending++;
        }
      }

      return {
        ...d,
        registeredCount: registered,
        remainingCount: d.totalCards - registered,
        activatedCount: activated,
        pendingCount: pending
      };
    });

    res.json(updatedDistributions);
  });

  // SMS Gateway Configuration & Settings API
  app.get('/api/admin/sms-config', (req, res) => {
    res.json(dbSmsSettings);
  });

  app.put('/api/admin/sms-config', (req, res) => {
    const { apiKey, senderId, apiUrl, enabled, templates } = req.body;
    if (apiKey !== undefined) dbSmsSettings.apiKey = apiKey.trim();
    if (senderId !== undefined) dbSmsSettings.senderId = senderId.trim();
    if (apiUrl !== undefined) dbSmsSettings.apiUrl = apiUrl.trim();
    if (enabled !== undefined) dbSmsSettings.enabled = Boolean(enabled);
    if (templates && typeof templates === 'object') {
      dbSmsSettings.templates = {
        ...dbSmsSettings.templates,
        ...templates
      };
    }

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'SMS_CONFIG_UPDATED',
      details: `SMS Config updated from Admin Panel (Gateway Enabled: ${dbSmsSettings.enabled}, Sender: ${dbSmsSettings.senderId})`,
      performedBy: 'ADMIN',
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'এসএমএস গেটওয়ে সেটিংস ও মেসেজ টেমপ্লেট সফলভাবে আপডেট করা হয়েছে।',
      config: dbSmsSettings
    });
  });

  app.post('/api/admin/sms-config/test', async (req, res) => {
    const { mobile = '01700000000', recipientName = 'টেস্ট প্রাপক' } = req.body;
    const testMessage = `[DMB Health Card] বাল্ক এসএমএস বিডি (BulkSMSBD) গেটওয়ে কানেকশন টেস্ট সফল হয়েছে। সময়: ${new Date().toLocaleTimeString('bn-BD')}`;
    const result = await sendRealSms(mobile, recipientName, testMessage, 'CUSTOM');
    return res.json(result);
  });

  // Rule 11: SMS Logs & Manual SMS
  app.get('/api/admin/sms-logs', (req, res) => {
    res.json(dbSmsLogs);
  });

  app.post('/api/admin/send-sms', async (req, res) => {
    const { mobile, recipientName, messageText, type = 'CUSTOM' } = req.body;
    if (!mobile || !messageText) {
      return res.status(400).json({ error: 'মোবাইল নম্বর ও বার্তা আবশ্যক।' });
    }

    const result = await sendRealSms(mobile, recipientName, messageText, type);

    return res.json({
      success: result.success,
      message: result.success ? 'SMS সফলভাবে পাঠানো হয়েছে (BulkSMSBD Gateway)।' : `SMS পাঠানো ব্যর্থ হয়েছে: ${result.errorMessage || 'Unknown Error'}`,
      apiResponse: result.apiResponse,
      errorMessage: result.errorMessage,
      log: result.log
    });
  });

  // Rule 12: Audit Logs
  app.get('/api/admin/audit-logs', (req, res) => {
    res.json(dbAuditLogs);
  });

  // Member & User Password Change Endpoint (Supports POST & PUT)
  const handlePasswordChange = (req: express.Request, res: express.Response) => {
    const { identifier, mobile, email, newPassword } = req.body;
    const targetKey = (identifier || mobile || email || '').toString().trim();

    if (!targetKey || !newPassword) {
      return res.status(400).json({ error: 'ব্যবহারকারীর আইডেন্টিফায়ার (মোবাইল/ইমেইল) এবং নতুন পাসওয়ার্ড প্রদান করা আবশ্যক।' });
    }

    if (newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'পাসওয়ার্ড অত্যন্ত সংক্ষিপ্ত! কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড ব্যবহার করুন।' });
    }

    const cleanPass = newPassword.trim();
    const lowerKey = targetKey.toLowerCase();

    dbUserPasswords[targetKey] = cleanPass;
    dbUserPasswords[lowerKey] = cleanPass;

    // Sync with card members if matching
    const member = dbCards.find(c => c.mobile === targetKey || c.email?.toLowerCase() === lowerKey || c.cardId.toUpperCase() === targetKey.toUpperCase());
    if (member) {
      dbUserPasswords[member.mobile] = cleanPass;
      if (member.email) dbUserPasswords[member.email.toLowerCase()] = cleanPass;
      dbUserPasswords[member.cardId] = cleanPass;
    }

    // Sync with field representatives if matching
    const rep = dbRepApplications.find(r => r.mobile === targetKey || r.email?.toLowerCase() === lowerKey || r.id === targetKey);
    if (rep) {
      dbUserPasswords[rep.mobile] = cleanPass;
      if (rep.email) dbUserPasswords[rep.email.toLowerCase()] = cleanPass;
    }

    // Sync with diagnostic partner centers if matching
    const center = dbCenters.find(c => c.mobile === targetKey || c.email?.toLowerCase() === lowerKey || c.id === targetKey);
    if (center) {
      dbUserPasswords[center.mobile] = cleanPass;
      if (center.email) dbUserPasswords[center.email.toLowerCase()] = cleanPass;
    }

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'PASSWORD_CHANGED',
      details: `Password changed for identifier: ${targetKey}`,
      performedBy: targetKey,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: `পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। (${targetKey})` });
  };

  app.post('/api/auth/change-password', handlePasswordChange);
  app.put('/api/auth/change-password', handlePasswordChange);

  // Admin API: Get List of All System Users & Password Status
  app.get('/api/admin/users/passwords', (req, res) => {
    const userList: Array<{
      id: string;
      name: string;
      role: string;
      mobile: string;
      email: string;
      currentPassword: string;
      isDefault: boolean;
    }> = [];

    // 1. Super Admin
    userList.push({
      id: 'USR-ADMIN-01',
      name: 'Super System Administrator',
      role: 'SUPER_ADMIN',
      mobile: '01700000000',
      email: 'admin@health.nit.bd',
      currentPassword: dbUserPasswords['admin@health.nit.bd'] || dbUserPasswords['01700000000'] || 'Admin@2026',
      isDefault: (dbUserPasswords['admin@health.nit.bd'] || 'Admin@2026') === 'Admin@2026'
    });

    // 2. Staff Admin
    userList.push({
      id: 'USR-STAFF-02',
      name: 'Gopalganj Operations Manager',
      role: 'ADMIN_STAFF',
      mobile: '01711223344',
      email: 'gopalganj.staff@digitalmediabridge.com',
      currentPassword: dbUserPasswords['01711223344'] || dbUserPasswords['gopalganj.staff@digitalmediabridge.com'] || '123456',
      isDefault: (dbUserPasswords['01711223344'] || '123456') === '123456'
    });

    // 3. Doctor
    userList.push({
      id: 'USR-DOC-01',
      name: 'ডাক্তার কে এম শফিকুল ইসলাম',
      role: 'DOCTOR',
      mobile: '01812334455',
      email: 'dr.rahim@digitalmediabridge.com',
      currentPassword: dbUserPasswords['01812334455'] || dbUserPasswords['dr.rahim@digitalmediabridge.com'] || '123456',
      isDefault: (dbUserPasswords['01812334455'] || '123456') === '123456'
    });

    // 4. Diagnostic Partners
    for (const center of dbCenters) {
      const pass = dbUserPasswords[center.mobile] || (center.email ? dbUserPasswords[center.email] : '') || '123456';
      userList.push({
        id: center.id,
        name: center.name,
        role: 'DIAGNOSTIC_PARTNER',
        mobile: center.mobile,
        email: center.email || '',
        currentPassword: pass,
        isDefault: pass === '123456'
      });
    }

    // 5. Representatives
    for (const rep of dbRepApplications) {
      const pass = dbUserPasswords[rep.mobile] || (rep.email ? dbUserPasswords[rep.email] : '') || '123456';
      userList.push({
        id: rep.id,
        name: `${rep.name} (মাঠ প্রতিনিধি)`,
        role: 'REPRESENTATIVE',
        mobile: rep.mobile,
        email: rep.email || '',
        currentPassword: pass,
        isDefault: pass === '123456'
      });
    }

    // 6. Medical Card Members
    for (const card of dbCards) {
      const pass = dbUserPasswords[card.mobile] || dbUserPasswords[card.cardId] || card.mobile;
      userList.push({
        id: card.cardId,
        name: card.memberName,
        role: 'MEDICAL_CARD_MEMBER',
        mobile: card.mobile,
        email: card.email || '',
        currentPassword: pass,
        isDefault: pass === card.mobile
      });
    }

    res.json(userList);
  });

  // Admin API: Direct Reset Password for Any User
  app.put('/api/admin/users/reset-password', (req, res) => {
    const { targetUserIdentifier, newPassword } = req.body;
    if (!targetUserIdentifier || !newPassword) {
      return res.status(400).json({ error: 'ব্যবহারকারী নির্বাচন এবং নতুন পাসওয়ার্ড প্রদান আবশ্যক।' });
    }

    const cleanKey = targetUserIdentifier.trim();
    const lowerKey = cleanKey.toLowerCase();
    const pass = newPassword.trim();

    dbUserPasswords[cleanKey] = pass;
    dbUserPasswords[lowerKey] = pass;

    // Check if card, rep, center and sync
    const card = dbCards.find(c => c.mobile === cleanKey || c.cardId.toUpperCase() === cleanKey.toUpperCase());
    if (card) {
      dbUserPasswords[card.mobile] = pass;
      dbUserPasswords[card.cardId] = pass;
    }
    const rep = dbRepApplications.find(r => r.mobile === cleanKey || r.id === cleanKey);
    if (rep) dbUserPasswords[rep.mobile] = pass;

    const center = dbCenters.find(c => c.mobile === cleanKey || c.id === cleanKey);
    if (center) dbUserPasswords[center.mobile] = pass;

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'ADMIN_PASSWORD_RESET',
      details: `Admin reset password for user: ${cleanKey}`,
      performedBy: 'ADMIN',
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `ব্যবহারকারী ${cleanKey}-এর পাসওয়ার্ড সফলভাবে আপডেট করে "${pass}" করা হয়েছে।`
    });
  });

  // Get All Members (Admin)
  app.get('/api/members', (req, res) => {
    const search = (req.query.search as string || '').toLowerCase();
    const status = req.query.status as string;

    let result = dbCards;
    if (search) {
      result = result.filter(c =>
        c.memberName.toLowerCase().includes(search) ||
        c.cardId.toLowerCase().includes(search) ||
        c.mobile.includes(search) ||
        c.nidOrBirthCert.includes(search)
      );
    }
    if (status) {
      result = result.filter(c => c.status === status);
    }

    res.json(result);
  });

  // Toggle/Update Card Status (Admin)
  app.put('/api/members/:cardId/status', (req, res) => {
    const { cardId } = req.params;
    const { status } = req.body;
    const card = dbCards.find(c => c.cardId === cardId);

    if (!card) return res.status(404).json({ error: 'Card not found' });
    card.status = status;
    res.json({ success: true, card });
  });

  // Edit Member Profile (Admin)
  app.put('/api/members/:cardId', (req, res) => {
    const { cardId } = req.params;
    const index = dbCards.findIndex(c => c.cardId === cardId);
    if (index === -1) return res.status(404).json({ error: 'সদস্য পাওয়া যায়নি।' });

    dbCards[index] = { ...dbCards[index], ...req.body };

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'MEMBER_PROFILE_UPDATED',
      details: `Updated member profile for ${dbCards[index].memberName} (${cardId})`,
      performedBy: 'ADMIN',
      targetId: cardId,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'সদস্যের তথ্য সফলভাবে আপডেট করা হয়েছে।', card: dbCards[index] });
  });

  // Delete Member Profile (Admin)
  app.delete('/api/members/:cardId', (req, res) => {
    const { cardId } = req.params;
    const cardIndex = dbCards.findIndex(c => c.cardId === cardId);
    if (cardIndex === -1) return res.status(404).json({ error: 'সদস্য পাওয়া যায়নি।' });

    const removed = dbCards.splice(cardIndex, 1)[0];

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'MEMBER_PROFILE_DELETED',
      details: `Deleted member profile for ${removed.memberName} (${cardId})`,
      performedBy: 'ADMIN',
      targetId: cardId,
      timestamp: new Date().toISOString()
    });

    return res.json({ success: true, message: 'সদস্যের প্রোফাইল সফলভাবে মুছে ফেলা হয়েছে।' });
  });

  // Diagnostic Centers API
  app.get('/api/diagnostic-centers', (req, res) => {
    const search = (req.query.search as string || '').toLowerCase();
    const upazila = req.query.upazila as string;
    const district = req.query.district as string;

    let list = dbCenters;
    if (search) {
      list = list.filter(c => c.name.toLowerCase().includes(search) || c.address.toLowerCase().includes(search));
    }
    if (upazila) {
      list = list.filter(c => c.upazila === upazila);
    }
    if (district) {
      list = list.filter(c => c.district === district);
    }

    res.json(list);
  });

  app.post('/api/diagnostic-centers', (req, res) => {
    const newCenter: DiagnosticCenter = {
      id: `DC-00${dbCenters.length + 1}`,
      code: `DC-CODE-${dbCenters.length + 1}`,
      status: 'ACTIVE',
      totalDiscountsProvided: 0,
      rating: 4.5,
      ...req.body
    };
    dbCenters.unshift(newCenter);
    saveDataToDisk();
    res.status(201).json(newCenter);
  });

  app.put('/api/diagnostic-centers/:id', (req, res) => {
    const index = dbCenters.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Center not found' });
    dbCenters[index] = { ...dbCenters[index], ...req.body };
    saveDataToDisk();
    res.json(dbCenters[index]);
  });

  app.delete('/api/diagnostic-centers/:id', (req, res) => {
    const { id } = req.params;
    const index = dbCenters.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'সেন্টার পাওয়া যায়নি।' });

    const removed = dbCenters.splice(index, 1)[0];

    dbAuditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action: 'CENTER_DELETED',
      details: `Deleted partner diagnostic center ${removed.name} (${id})`,
      performedBy: 'ADMIN',
      targetId: id,
      timestamp: new Date().toISOString()
    });

    saveDataToDisk();
    return res.json({ success: true, message: 'পার্টনার সেন্টার সফলভাবে মুছে ফেলা হয়েছে।' });
  });

  // Tests API
  app.get('/api/tests', (req, res) => {
    const search = (req.query.search as string || '').toLowerCase();
    const category = req.query.category as string;

    let list = dbTests;
    if (search) {
      list = list.filter(t => t.name.toLowerCase().includes(search) || t.category.toLowerCase().includes(search));
    }
    if (category) {
      list = list.filter(t => t.category === category);
    }

    res.json(list);
  });

  app.post('/api/tests', (req, res) => {
    const { name, category, regularPrice, dmbPrice } = req.body;
    const reg = Number(regularPrice);
    const dmb = Number(dmbPrice);
    const newTest: MedicalTest = {
      id: `T-${dbTests.length + 1}`,
      name,
      category,
      regularPrice: reg,
      dmbPrice: dmb,
      savings: Math.max(0, reg - dmb),
      popular: req.body.popular || false
    };
    dbTests.unshift(newTest);
    res.status(201).json(newTest);
  });

  app.post('/api/admin/clear-demo-data', (req, res) => {
    dbTransactions = [];
    dbRepApplications = [];
    dbRepDistributions = [];
    dbSmsLogs = [];
    dbAuditLogs = [];
    dbReports = [];
    dbPrescriptions = [];
    dbSurveys = [];
    dbPartnerApps = [];
    dbContactMessages = [];
    saveDataToDisk();
    res.json({ success: true, message: 'সকল ডেমো ডাটা সফলভাবে মুছে ফেলা হয়েছে।' });
  });

  app.put('/api/tests/:id', (req, res) => {
    const index = dbTests.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Test not found' });
    const reg = Number(req.body.regularPrice || dbTests[index].regularPrice);
    const dmb = Number(req.body.dmbPrice || dbTests[index].dmbPrice);
    dbTests[index] = {
      ...dbTests[index],
      ...req.body,
      regularPrice: reg,
      dmbPrice: dmb,
      savings: Math.max(0, reg - dmb)
    };
    res.json(dbTests[index]);
  });

  app.delete('/api/tests/:id', (req, res) => {
    dbTests = dbTests.filter(t => t.id !== req.params.id);
    res.json({ success: true });
  });

  // Health Packages API
  app.get('/api/health-packages', (req, res) => {
    res.json(dbPackages);
  });

  app.post('/api/health-packages', (req, res) => {
    const newPkg: HealthPackage = {
      id: `PKG-0${dbPackages.length + 1}`,
      title: req.body.title || 'নতুন হেলথ প্যাকেজ',
      description: req.body.description || '',
      category: req.body.category || 'Basic',
      regularPrice: Number(req.body.regularPrice) || 0,
      dmbPrice: Number(req.body.dmbPrice) || 0,
      includedTests: Array.isArray(req.body.includedTests)
        ? req.body.includedTests
        : (req.body.includedTests || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      recommendedFor: req.body.recommendedFor || 'সকলের জন্য প্রযোজ্য',
      popular: Boolean(req.body.popular)
    };
    dbPackages.unshift(newPkg);
    res.status(201).json(newPkg);
  });

  app.put('/api/health-packages/:id', (req, res) => {
    const index = dbPackages.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Package not found' });
    dbPackages[index] = {
      ...dbPackages[index],
      ...req.body,
      regularPrice: Number(req.body.regularPrice ?? dbPackages[index].regularPrice),
      dmbPrice: Number(req.body.dmbPrice ?? dbPackages[index].dmbPrice),
      includedTests: Array.isArray(req.body.includedTests)
        ? req.body.includedTests
        : (typeof req.body.includedTests === 'string'
            ? req.body.includedTests.split(',').map((s: string) => s.trim()).filter(Boolean)
            : dbPackages[index].includedTests)
    };
    res.json(dbPackages[index]);
  });

  app.delete('/api/health-packages/:id', (req, res) => {
    const index = dbPackages.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Package not found' });
    dbPackages.splice(index, 1);
    res.json({ success: true, message: 'হেলথ প্যাকেজটি সফলভাবে মুছে ফেলা হয়েছে।' });
  });

  // Partner Applications
  app.get('/api/partners/applications', (req, res) => {
    res.json(dbPartnerApps);
  });

  app.post('/api/partners/apply', (req, res) => {
    const appData: PartnerApplication = {
      id: `PART-APP-${dbPartnerApps.length + 10}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      ...req.body
    };
    dbPartnerApps.unshift(appData);
    res.status(201).json({ success: true, message: 'Application submitted successfully', data: appData });
  });

  app.put('/api/partners/applications/:id', (req, res) => {
    const appItem = dbPartnerApps.find(a => a.id === req.params.id);
    if (!appItem) return res.status(404).json({ error: 'Application not found' });
    appItem.status = req.body.status;

    if (req.body.status === 'APPROVED') {
      // Add to active centers
      const newCenter: DiagnosticCenter = {
        id: `DC-00${dbCenters.length + 1}`,
        name: appItem.organizationName,
        code: `DC-${appItem.district.slice(0, 3).toUpperCase()}-${dbCenters.length + 1}`,
        district: appItem.district,
        upazila: appItem.upazila,
        address: appItem.address,
        mobile: appItem.mobile,
        email: appItem.email,
        discountPercentage: appItem.proposedDiscount,
        availableServices: appItem.servicesOffered.split(',').map(s => s.trim()),
        featured: false,
        status: 'ACTIVE',
        totalDiscountsProvided: 0,
        rating: 4.5
      };
      dbCenters.unshift(newCenter);
    }

    res.json({ success: true, application: appItem });
  });

  // Discount Tracking / Transactions API
  app.get('/api/discount-tracking', (req, res) => {
    res.json(dbTransactions);
  });

  app.post('/api/discount-tracking', (req, res) => {
    const { cardId, centerId, testNames, originalAmount, discountAmount } = req.body;
    const card = dbCards.find(c => c.cardId === cardId);
    const center = dbCenters.find(c => c.id === centerId);

    const orig = Number(originalAmount) || 0;
    const disc = Number(discountAmount) || 0;
    const paid = Math.max(0, orig - disc);
    const commission = Math.round(disc * 0.1); // 10% DMB commission on savings

    const newTxn: DiscountTransaction = {
      id: `TXN-${9000 + dbTransactions.length + 1}`,
      cardId,
      memberName: card ? card.memberName : 'Walk-in Card Member',
      centerId,
      centerName: center ? center.name : 'Partner Center',
      testNames: Array.isArray(testNames) ? testNames : [testNames],
      originalAmount: orig,
      discountAmount: disc,
      paidAmount: paid,
      dmbCommission: commission,
      date: new Date().toISOString().split('T')[0],
      receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'COMPLETED'
    };

    dbTransactions.unshift(newTxn);

    // Update center stats
    if (center) {
      center.totalDiscountsProvided = (center.totalDiscountsProvided || 0) + disc;
    }

    res.status(201).json(newTxn);
  });

  // Medical Reports API
  app.get('/api/medical-reports', (req, res) => {
    const cardId = req.query.cardId as string;
    if (cardId) {
      const filtered = dbReports.filter(r => r.cardId === cardId);
      return res.json(filtered);
    }
    res.json(dbReports);
  });

  app.post('/api/medical-reports', (req, res) => {
    const { cardId, testName, centerName, notes, uploadedBy, fileUrl, fileType, fileName } = req.body;
    const card = dbCards.find(c => c.cardId === cardId);
    const newReport: MedicalReport = {
      id: `RPT-${100 + dbReports.length + 1}`,
      cardId: cardId || 'DMB-2026-1001',
      memberName: card ? card.memberName : (req.body.memberName || 'সদস্য'),
      centerName: centerName || 'পপুলার ডায়াগনস্টিক সেন্টার',
      testName: testName || 'সাধারণ প্যাথলজি রিপোর্ট',
      reportDate: new Date().toISOString().split('T')[0],
      fileUrl: fileUrl || undefined,
      fileType: fileType || (fileUrl?.startsWith('data:application/pdf') ? 'pdf' : 'image'),
      fileName: fileName || (fileType === 'pdf' ? 'report_file.pdf' : 'report_image.png'),
      status: 'READY',
      uploadedBy: uploadedBy || 'ডায়াগনস্টিক পার্টনার',
      notes: notes || 'সকল রিপোর্ট প্যারামিটার স্বাভাবিক রয়েছে।'
    };
    dbReports.unshift(newReport);
    res.status(201).json(newReport);
  });

  app.delete('/api/medical-reports/:id', (req, res) => {
    const index = dbReports.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Report not found' });
    dbReports.splice(index, 1);
    res.json({ success: true, message: 'মেডিকেল রিপোর্ট মুছে ফেলা হয়েছে।' });
  });

  // Prescriptions API
  app.get('/api/prescriptions', (req, res) => {
    const cardId = req.query.cardId as string;
    if (cardId) {
      const filtered = dbPrescriptions.filter(p => p.cardId === cardId);
      return res.json(filtered);
    }
    res.json(dbPrescriptions);
  });

  app.post('/api/prescriptions', (req, res) => {
    const { cardId, doctorName, bmdcNo, diagnosis, medicines, advice } = req.body;
    const card = dbCards.find(c => c.cardId === cardId);
    const newPrescription: Prescription = {
      id: `RX-${200 + dbPrescriptions.length + 1}`,
      cardId: cardId || 'DMB-2026-1001',
      memberName: card ? card.memberName : 'রোগী',
      doctorName: doctorName || 'ডাক্তার কে এম শফিকুল ইসলাম',
      bmdcNo: bmdcNo || 'BMDC-A-48392',
      date: new Date().toISOString().split('T')[0],
      diagnosis: diagnosis || 'General Health Consultation',
      medicines: Array.isArray(medicines) ? medicines : [],
      advice: advice || 'নিয়মিত ওষুধ খাবেন এবং পর্যাপ্ত বিশ্রাম নিন।'
    };
    dbPrescriptions.unshift(newPrescription);
    res.status(201).json(newPrescription);
  });

  // Health Surveys API
  app.get('/api/surveys', (req, res) => {
    res.json(dbSurveys);
  });

  app.post('/api/surveys', (req, res) => {
    const newSurvey: HealthSurvey = {
      id: `SRV-${500 + dbSurveys.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      ...req.body
    };
    dbSurveys.unshift(newSurvey);
    res.status(201).json(newSurvey);
  });

  // Update Member Profile / Beneficiaries
  app.put('/api/members/:cardId/profile', (req, res) => {
    const { cardId } = req.params;
    const cardIndex = dbCards.findIndex(c => c.cardId === cardId || c.memberId === cardId);
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Member card not found' });
    }
    dbCards[cardIndex] = { ...dbCards[cardIndex], ...req.body };
    res.json({ success: true, card: dbCards[cardIndex] });
  });

  // Activate Card (Representative / Staff)
  app.put('/api/members/:cardId/activate', (req, res) => {
    const { cardId } = req.params;
    const card = dbCards.find(c => c.cardId === cardId || c.memberId === cardId);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    card.status = 'ACTIVE';
    res.json({ success: true, card });
  });

  // Reports Summary API
  app.get('/api/reports/dashboard', (req, res) => {
    const totalMembers = dbCards.length;
    const activeCards = dbCards.filter(c => c.status === 'ACTIVE').length;
    const totalPartners = dbCenters.filter(c => c.status === 'ACTIVE').length;
    const totalTransactions = dbTransactions.length;

    const totalDiscountSaved = dbTransactions.reduce((acc, t) => acc + t.discountAmount, 0);
    const totalOriginalBilling = dbTransactions.reduce((acc, t) => acc + t.originalAmount, 0);
    const totalCommissionRevenue = dbTransactions.reduce((acc, t) => acc + t.dmbCommission, 0);

    res.json({
      totalMembers,
      activeCards,
      totalPartners,
      totalTransactions,
      totalDiscountSaved, // In ৳ BDT
      totalOriginalBilling,
      totalCommissionRevenue,
      pilotCoverage: 'গোপালগঞ্জ, নড়াইল ও সিলেট (ডায়নামিক পাইলট অঞ্চল)'
    });
  });

  // Blogs API
  app.get('/api/blogs', (req, res) => {
    res.json(dbBlogs);
  });

  app.post('/api/blogs', (req, res) => {
    const blog: BlogArticle = {
      id: `BLOG-0${dbBlogs.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      ...req.body
    };
    dbBlogs.unshift(blog);
    res.status(201).json(blog);
  });

  // Team Members API
  app.get('/api/team-members', (req, res) => {
    res.json(dbTeamMembers);
  });

  app.post('/api/team-members', (req, res) => {
    const member: TeamMember = {
      id: `TM-${Date.now()}`,
      name: req.body.name || '',
      designation: req.body.designation || '',
      category: req.body.category || 'management',
      image: req.body.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      education: req.body.education || '',
      locationServed: req.body.locationServed || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      linkedin: req.body.linkedin || '',
      experience: req.body.experience || '',
      bio: req.body.bio || ''
    };
    dbTeamMembers.push(member);
    saveDataToDisk();
    res.status(201).json(member);
  });

  app.put('/api/team-members/:id', (req, res) => {
    const index = dbTeamMembers.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Team member not found' });

    dbTeamMembers[index] = {
      ...dbTeamMembers[index],
      ...req.body,
      id: req.params.id
    };
    saveDataToDisk();
    res.json(dbTeamMembers[index]);
  });

  app.delete('/api/team-members/:id', (req, res) => {
    dbTeamMembers = dbTeamMembers.filter(m => m.id !== req.params.id);
    saveDataToDisk();
    res.json({ success: true, message: 'টিম সদস্য মুছে ফেলা হয়েছে' });
  });

  // Contact API
  app.get('/api/contact', (req, res) => {
    res.json(dbContactMessages);
  });

  app.post('/api/contact', (req, res) => {
    const msg: ContactMessage = {
      id: `MSG-${dbContactMessages.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      status: 'UNREAD',
      ...req.body
    };
    dbContactMessages.unshift(msg);
    res.status(201).json({ success: true, message: 'Message sent successfully. We will contact you soon.' });
  });

  // Banner Announcement Settings API
  app.get('/api/banner-settings', (req, res) => {
    res.json(dbBannerSettings);
  });

  app.put('/api/banner-settings', (req, res) => {
    dbBannerSettings = { ...dbBannerSettings, ...req.body };
    saveDataToDisk();
    res.json({ success: true, message: 'Top banner settings updated successfully!', bannerSettings: dbBannerSettings });
  });

  // Site Info & Branding Settings API (Hotline, Email, Address, Logo)
  app.get('/api/site-settings', (req, res) => {
    res.json(dbSiteSettings);
  });

  app.put('/api/site-settings', (req, res) => {
    dbSiteSettings = { ...dbSiteSettings, ...req.body };
    saveDataToDisk();
    // Audit log
    dbAuditLogs.unshift({
      id: `AUD-${Date.now().toString().slice(-6)}`,
      action: 'UPDATE_SITE_SETTINGS',
      performedBy: 'SUPER_ADMIN',
      timestamp: new Date().toISOString(),
      details: 'Updated hotline, email, address, or branding logo settings.'
    });
    res.json({ success: true, message: 'সাইট তথ্য ও সেটিংস সফলভাবে আপডেট করা হয়েছে!', siteSettings: dbSiteSettings });
  });

  // Card Design & Branding Settings API (Silver, Gold, Platinum Colors, Logo, Slogan)
  app.get('/api/card-design-settings', (req, res) => {
    res.json(dbCardDesignSettings);
  });

  app.put('/api/card-design-settings', (req, res) => {
    dbCardDesignSettings = { ...dbCardDesignSettings, ...req.body };
    saveDataToDisk();
    dbAuditLogs.unshift({
      id: `AUD-${Date.now().toString().slice(-6)}`,
      action: 'UPDATE_CARD_DESIGN_SETTINGS',
      performedBy: 'SUPER_ADMIN',
      timestamp: new Date().toISOString(),
      details: 'Updated medical card design, colors (Silver, Gold, Platinum), logo, and slogan.'
    });
    res.json({
      success: true,
      message: 'কার্ডের রঙ, লোগো, স্লোগান ও ডিজাইন সেটিংস সফলভাবে আপডেট করা হয়েছে!',
      cardDesignSettings: dbCardDesignSettings
    });
  });

  // Notices API
  app.get('/api/notices', (req, res) => {
    res.json(dbNotices);
  });

  // FAQs API
  app.get('/api/faqs', (req, res) => {
    res.json(INITIAL_FAQS);
  });

  // Testimonials & Website Reviews API
  app.get('/api/testimonials', (req, res) => {
    // Public view only sees APPROVED testimonials
    res.json(dbTestimonials.filter(t => !t.status || t.status === 'APPROVED'));
  });

  app.post('/api/testimonials/submit', (req, res) => {
    const { name, role, location, comment, rating, cardId } = req.body;
    if (!name || !comment) {
      return res.status(400).json({ error: 'নাম ও রিভিউ বক্তব্য পূরণ করা আবশ্যক।' });
    }
    const created: Testimonial = {
      id: `TEST-${Date.now().toString().slice(-6)}`,
      name,
      role: role || 'সম্মানিত পেশেন্ট / মেম্বার',
      location: location || 'গোপালগঞ্জ',
      comment,
      rating: Number(rating) || 5,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
      cardId: cardId || ''
    };
    dbTestimonials.unshift(created);
    saveDataToDisk();
    res.status(201).json({
      success: true,
      message: 'আপনার গুরুত্বপূর্ণ পরামর্শ ও রিভিউ জমা হয়েছে! অ্যাডমিন প্যানেল থেকে অনুমোদনের পর প্রকাশিত হবে।',
      testimonial: created
    });
  });

  // Admin Testimonials Management
  app.get('/api/admin/testimonials', (req, res) => {
    res.json(dbTestimonials);
  });

  app.post('/api/admin/testimonials/:id/approve', (req, res) => {
    const item = dbTestimonials.find(t => t.id === req.params.id);
    if (item) {
      item.status = 'APPROVED';
      saveDataToDisk();
      res.json({ success: true, message: 'ইউজার রিভিউ সফলভাবে অনুমোদন করা হয়েছে!' });
    } else {
      res.status(404).json({ error: 'রিভিউ রেকর্ড পাওয়া যায়নি।' });
    }
  });

  app.delete('/api/admin/testimonials/:id', (req, res) => {
    dbTestimonials = dbTestimonials.filter(t => t.id !== req.params.id);
    saveDataToDisk();
    res.json({ success: true, message: 'রিভিউ মুছে ফেলা হয়েছে।' });
  });

  // --- ROLES & PERMISSIONS API ---
  app.get('/api/roles', (req, res) => {
    res.json(dbCustomRoles);
  });

  app.post('/api/roles', (req, res) => {
    const { roleName, description, permissions } = req.body;
    if (!roleName) {
      return res.status(400).json({ error: 'রোলের নাম প্রদান করা আবশ্যক।' });
    }
    const newRole: CustomRole = {
      id: `ROLE-${Date.now().toString().slice(-4)}`,
      roleName,
      description: description || '',
      permissions: permissions || {
        canApproveCards: false,
        canManagePrices: false,
        canSendSMS: false,
        canViewRevenue: false,
        canEditNotices: false,
        canManagePartners: false,
        canManageReps: false
      },
      createdAt: new Date().toISOString().split('T')[0]
    };
    dbCustomRoles.push(newRole);
    saveDataToDisk();
    res.status(201).json({ success: true, message: 'নতুন রোল সফলভাবে তৈরি হয়েছে!', role: newRole });
  });

  app.put('/api/roles/:id', (req, res) => {
    const index = dbCustomRoles.findIndex(r => r.id === req.params.id);
    if (index !== -1) {
      dbCustomRoles[index] = { ...dbCustomRoles[index], ...req.body };
      saveDataToDisk();
      res.json({ success: true, message: 'রোল ও পারমিশন সফলভাবে আপডেট হয়েছে!', role: dbCustomRoles[index] });
    } else {
      res.status(404).json({ error: 'রোল পাওয়া যায়নি।' });
    }
  });

  app.delete('/api/roles/:id', (req, res) => {
    dbCustomRoles = dbCustomRoles.filter(r => r.id !== req.params.id);
    saveDataToDisk();
    res.json({ success: true, message: 'রোল মুছে ফেলা হয়েছে।' });
  });

  // --- DYNAMIC PAGE CONTENT API ---
  app.get('/api/page-content', (req, res) => {
    res.json(dbPageContent);
  });

  app.put('/api/page-content', (req, res) => {
    dbPageContent = { ...dbPageContent, ...req.body };
    saveDataToDisk();
    res.json({ success: true, message: 'ওয়েবসাইটের পেজ কনটেন্ট সফলভাবে আপডেট করা হয়েছে!', pageContent: dbPageContent });
  });

  // --- HERO BANNER & TEXT API ---
  app.get('/api/hero-banner', (req, res) => {
    res.json(dbHeroBannerSettings);
  });

  app.put('/api/hero-banner', (req, res) => {
    dbHeroBannerSettings = { ...dbHeroBannerSettings, ...req.body };
    saveDataToDisk();
    res.json({ success: true, message: 'হিরো ব্যানারের লেখা ও ছবি সফলভাবে আপডেট করা হয়েছে!', heroBanner: dbHeroBannerSettings });
  });


  // --- VITE / STATIC SERVING MIDDLEWARE ---
  const isProduction = process.env.NODE_ENV === 'production' || 
                       process.env.PASSENGER_APP_ENV === 'production';

  if (!isProduction) {
    try {
      const vitePkg = 'vite';
      const { createServer: createViteServer } = await import(vitePkg);
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite dev middleware not loaded:', e);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application build missing. Please run npm run build.');
      }
    });
  }

  if (typeof (global as any).PhusionPassenger !== 'undefined') {
    (global as any).PhusionPassenger.configure({ autoInstall: false });
    app.listen('passenger', () => {
      console.log('DMB Healthcare Platform server running under Phusion Passenger');
    });
  } else {
    const portVal = process.env.PORT;
    if (portVal) {
      if (/^\d+$/.test(portVal)) {
        app.listen(parseInt(portVal, 10), () => {
          console.log(`DMB Healthcare Platform server running on port ${portVal}`);
        });
      } else {
        app.listen(portVal, () => {
          console.log(`DMB Healthcare Platform server running on socket ${portVal}`);
        });
      }
    } else {
      app.listen(3000, '0.0.0.0', () => {
        console.log('DMB Healthcare Platform server running on http://0.0.0.0:3000');
      });
    }
  }
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});
