export type UserRole = 'SUPER_ADMIN' | 'ADMIN_STAFF' | 'MEDICAL_CARD_MEMBER' | 'DIAGNOSTIC_PARTNER' | 'REPRESENTATIVE' | 'DOCTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string;
  memberId?: string;
  partnerId?: string;
  repStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export type CardTier = 'Silver' | 'Gold' | 'Platinum';

export type CardStatus = 'ACTIVE' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'EXPIRED' | 'SUSPENDED' | 'UNASSIGNED';

export interface MedicalCard {
  cardId: string; // e.g. DMB-2026-1001
  memberId: string;
  memberName: string;
  cardTier: CardTier;
  memberLimit: number; // 4 for Silver, 6 for Gold, 8 for Platinum
  beneficiaries?: string[]; // Names/details of family members covered
  fatherName?: string;
  motherName?: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  mobile: string;
  email?: string;
  address: string;
  upazila: string;
  district: string; // Gopalganj, Narail, Sylhet
  nidOrBirthCert: string;
  photoUrl: string;
  issueDate: string;
  expiryDate: string;
  status: CardStatus;
  qrCodeDataUrl?: string;
  feeAmount?: number;
  paymentMethod?: string;
  paymentSenderNo?: string;
  trxId?: string;
  paymentStatus?: 'PAID' | 'VERIFIED' | 'PENDING';
  registeredByRepId?: string;
  registeredByName?: string;
  registeredByMobile?: string;
}

export interface DiagnosticCenter {
  id: string;
  name: string;
  code: string;
  division?: string; // Dhaka, Khulna, Sylhet, Chittagong, Rajshahi, Barisal, Rangpur, Mymensingh
  district: string;
  upazila: string;
  address: string;
  mobile: string;
  email?: string;
  discountPercentage: number;
  availableServices: string[];
  googleMapUrl?: string;
  featured: boolean;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  totalDiscountsProvided?: number;
  rating?: number;
}

export interface MedicalTest {
  id: string;
  name: string;
  category: string;
  regularPrice: number; // In BDT ৳
  dmbPrice: number;     // In BDT ৳
  savings: number;      // regularPrice - dmbPrice
  popular?: boolean;
}

export interface HealthPackage {
  id: string;
  title: string;
  description: string;
  category: 'Basic' | 'Diabetes' | 'Women' | 'Senior' | 'Executive';
  regularPrice: number;
  dmbPrice: number;
  includedTests: string[];
  recommendedFor: string;
  popular?: boolean;
  partnerLabId?: string;
  partnerLabName?: string;
  availableLabs?: string[];
}

export interface PartnerApplication {
  id: string;
  organizationName: string;
  type: 'Diagnostic Center' | 'Hospital' | 'Pharmacy' | 'Clinic';
  division?: string;
  district: string;
  upazila: string;
  address: string;
  contactPerson: string;
  designation: string;
  mobile: string;
  email: string;
  proposedDiscount: number;
  servicesOffered: string;
  appliedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DiscountTransaction {
  id: string;
  cardId: string;
  memberName: string;
  centerId: string;
  centerName: string;
  testNames: string[];
  originalAmount: number;
  discountAmount: number;
  paidAmount: number;
  dmbCommission: number;
  date: string;
  receiptNo: string;
  status: 'COMPLETED' | 'REVERSED' | 'PENDING';
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  summary: string;
  content: string;
  imageUrl: string;
  tags: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Medical Card' | 'Discount' | 'Partner' | 'Payment';
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  date: string;
  status: 'UNREAD' | 'READ' | 'RESOLVED';
}

export interface CmsNotice {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
  type: 'IMPORTANT' | 'ANNOUNCEMENT' | 'UPDATE';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  comment: string;
  rating: number;
  avatar: string;
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  date?: string;
  cardId?: string;
}

export interface MedicalReport {
  id: string;
  cardId: string;
  memberName: string;
  centerName: string;
  testName: string;
  reportDate: string;
  fileUrl?: string;
  fileType?: 'image' | 'pdf';
  fileName?: string;
  status: 'READY' | 'PROCESSING';
  uploadedBy: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  cardId: string;
  memberName: string;
  doctorName: string;
  bmdcNo?: string;
  date: string;
  diagnosis: string;
  medicines: { name: string; dosage: string; duration: string; instruction: string }[];
  advice?: string;
}

export interface HealthSurvey {
  id: string;
  repName: string;
  familyHeadName: string;
  mobile: string;
  district: string;
  upazila: string;
  address?: string;
  familyMembersCount: number;
  chronicDiseases: string[];
  incomeGroup: string;
  date: string;
}

export interface JobCircular {
  id: string;
  title: string;
  position: string;
  district: string;
  upazila?: string;
  vacancyCount: number;
  salaryAllowance: string;
  educationRequirement: string;
  deadline: string;
  description: string;
  requirements: string[];
  status: 'OPEN' | 'CLOSED';
  postedDate: string;
}

export interface PendingProfileUpdate {
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  data: {
    id?: string;
    name?: string;
    mobile?: string;
    email?: string;
    nidNo?: string;
    fatherName?: string;
    motherName?: string;
    dob?: string;
    gender?: 'Male' | 'Female' | 'Other';
    educationalQualification?: string;
    experienceYears?: string;
    address?: string;
    upazila?: string;
    district?: string;
    assignedArea?: string;
    photoUrl?: string;
    circularTitle?: string;
  };
}

export interface RepresentativeMonthlyTarget {
  month: string; // e.g. "2026-08"
  target: number;
  achieved: number;
  dailyTarget?: number;
  weeklyTarget?: number;
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'BEHIND' | 'PENDING';
  remarks?: string;
  updatedAt?: string;
}

export interface RepresentativeApplication {
  id: string;
  circularId?: string;
  circularTitle?: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  email: string;
  nidNo: string;
  educationalQualification?: string;
  experienceYears?: string;
  address: string;
  upazila: string;
  district: string;
  photoUrl: string;
  nidDocUrl?: string;
  educationDocUrl?: string;
  cvDocUrl?: string;
  assignedArea: string;
  appliedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  dailyTarget?: number;
  weeklyTarget?: number;
  monthlyTarget?: number;
  targetMonth?: string;
  targetRemarks?: string;
  previousMonthTarget?: number;
  previousMonthAchievement?: number;
  targetHistory?: RepresentativeMonthlyTarget[];
  notes?: string;
  adminNotes?: string;
  paymentStatus?: 'UNPAID' | 'PAID' | 'PENDING';
  paymentAmount?: number;
  paymentMethod?: 'bKash' | 'Nagad' | 'Bank' | 'Card' | string;
  paymentTxnId?: string;
  paymentDate?: string;
  paymentAccountNo?: string;
  pendingProfileUpdate?: PendingProfileUpdate;
}

export interface RepresentativeDistribution {
  id: string;
  repId: string;
  repName: string;
  repMobile: string;
  district?: string;
  upazila?: string;
  distributionDate: string;
  totalCards: number;
  startSerialNum: number; // e.g. 1001
  endSerialNum: number;   // e.g. 1050
  startSerial: string;    // e.g. DMB-2026-1001
  endSerial: string;      // e.g. DMB-2026-1050
  registeredCount: number;
  remainingCount: number;
  activatedCount: number;
  pendingCount: number;
  assignedBy: string;
}

export interface SmsSettings {
  apiKey: string;
  senderId: string;
  apiUrl: string;
  enabled: boolean;
  detectedServerIp?: string;
  ipWhitelistRequired?: boolean;
  lastApiError?: string;
  templates: {
    appSubmitted: string;
    appApproved: string;
    appRejected: string;
    repSubmitted?: string;
    repApproved: string;
    repRejected?: string;
    otpTemplate: string;
    customDefault: string;
  };
}

export interface SmsLog {
  id: string;
  mobile: string;
  recipientName: string;
  type: 'APP_SUBMITTED' | 'APP_APPROVED' | 'APP_REJECTED' | 'CARD_ACTIVATED' | 'EXPIRY_REMINDER' | 'RENEWAL_CONFIRMATION' | 'REP_SUBMITTED' | 'REP_APPROVED' | 'REP_REJECTED' | 'CUSTOM';
  messageText: string;
  sentAt: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  targetId?: string;
  timestamp: string;
}

export interface BannerSettings {
  badgeText: string;
  noticeText: string;
  hotline: string;
  email: string;
  enabled: boolean;
  speed: 'slow' | 'normal' | 'fast';
}

export interface NavLabels {
  home?: string;
  aboutGroup?: string;
  about?: string;
  services?: string;
  cardGroup?: string;
  medicalCard?: string;
  applyCard?: string;
  notice?: string;
  diagnosticGroup?: string;
  diagnosticCenter?: string;
  testPrices?: string;
  packages?: string;
  verifyBtn?: string;
  loginBtn?: string;
  moreGroup?: string;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  siteTitle?: string;
  logoUrl?: string;
  faviconUrl?: string;
  phone: string;
  hotline: string;
  email: string;
  address: string;
  dhakaOffice?: string;
  gopalganjOffice?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  whatsappNo?: string;
  navLabels?: NavLabels;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  accountType: 'Personal' | 'Agent' | 'Merchant' | 'Bank Account' | 'Counter' | string;
  number: string;
  instructions?: string;
  enabled: boolean;
  color?: string;
  bankBranch?: string;
  routingNo?: string;
}

export interface ApplicationFeeConfig {
  silverCardFee: number;
  goldCardFee: number;
  platinumCardFee: number;
  representativeFee: number;
  quickSelectPresets?: number[];
}

export interface PaymentSettings {
  methods: PaymentMethodConfig[];
  fees: ApplicationFeeConfig;
  noticeText?: string;
}

export interface CardTierThemeConfig {
  presetKey: string;
  customGradient?: string;
  badgeText?: string;
}

export interface CardDesignSettings {
  headerTitle: string;
  headerSubtitle: string;
  logoText: string;
  logoUrl?: string;
  slogan: string;
  helpline: string;
  websiteUrl: string;
  qrCodeUrl?: string;
  footerText: string;
  disclaimerText: string;
  silverTheme: CardTierThemeConfig;
  goldTheme: CardTierThemeConfig;
  platinumTheme: CardTierThemeConfig;
  fieldVisibility?: {
    headerTitle?: boolean;
    headerSubtitle?: boolean;
    logo?: boolean;
    tierBadge?: boolean;
    photoUrl?: boolean;
    bloodGroup?: boolean;
    memberName?: boolean;
    cardId?: boolean;
    memberId?: boolean;
    upazila?: boolean;
    district?: boolean;
    issueDate?: boolean;
    expiryDate?: boolean;
    helpline?: boolean;
    nidOrBirthCert?: boolean;
    beneficiaries?: boolean;
    slogan?: boolean;
    disclaimerText?: boolean;
    qrCode?: boolean;
    footerText?: boolean;
    websiteUrl?: boolean;
  };
}

export interface CustomRole {
  id: string;
  roleName: string;
  description: string;
  permissions: {
    canApproveCards: boolean;
    canManagePrices: boolean;
    canSendSMS: boolean;
    canViewRevenue: boolean;
    canEditNotices: boolean;
    canManagePartners: boolean;
    canManageReps: boolean;
  };
  createdAt: string;
}

export interface DynamicPageContent {
  aboutUs: {
    title: string;
    description: string;
    mission: string;
    vision: string;
    mdMessage: string;
    achievements: { number: string; label: string }[];
  };
  medicalCardInfo: {
    title: string;
    description: string;
    perks: { tier: string; discount: string; members: string; price: string }[];
    coverageDistricts: string[];
    terms: string;
  };
  healthTips: {
    id: string;
    title: string;
    category: string;
    content: string;
    date: string;
    imageUrl?: string;
  }[];
  eventGallery: {
    id: string;
    title: string;
    location: string;
    date: string;
    imageUrl: string;
    category: string;
  }[];
}

export interface UserReview {
  id: string;
  memberName: string;
  cardId?: string;
  location: string;
  rating: number;
  comment: string;
  avatarUrl?: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface HeroBannerSettings {
  badgeText: string;
  title: string;
  titleHighlight: string;
  description: string;
  primaryBtnText: string;
  secondaryBtnText: string;
  heroImage: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
}

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  category: 'management' | 'field';
  image: string;
  education?: string;
  locationServed?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  experience?: string;
  bio?: string;
}
