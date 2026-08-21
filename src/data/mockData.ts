import {
  MedicalCard,
  DiagnosticCenter,
  MedicalTest,
  HealthPackage,
  DiscountTransaction,
  BlogArticle,
  FaqItem,
  Testimonial,
  PartnerApplication,
  CmsNotice
} from '../types';

export const INITIAL_CARDS: MedicalCard[] = [
  {
    cardId: 'DMB-2026-1001',
    memberId: 'MEM-1001',
    memberName: 'Rahim Uddin Sheikh',
    cardTier: 'Silver',
    memberLimit: 4,
    beneficiaries: ['Rahim Uddin Sheikh (Self)', 'Razia Begum (Mother)', 'Salma Sheikh (Wife)', 'Arian Sheikh (Son)'],
    fatherName: 'Late Abdul Latif Sheikh',
    motherName: 'Razia Begum',
    dob: '1988-05-14',
    gender: 'Male',
    bloodGroup: 'B+',
    mobile: '01712345678',
    email: 'rahim.sheikh@example.com',
    address: 'Post Office Road, Bedgram, Ward 04',
    upazila: 'Gopalganj Sadar',
    district: 'Gopalganj',
    nidOrBirthCert: '19883512409800123',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    issueDate: '2026-01-10',
    expiryDate: '2027-01-09',
    status: 'ACTIVE'
  },
  {
    cardId: 'DMB-2026-1002',
    memberId: 'MEM-1002',
    memberName: 'Nusrat Jahan Tanvin',
    cardTier: 'Gold',
    memberLimit: 6,
    beneficiaries: ['Nusrat Jahan Tanvin (Self)', 'Mahbubur Rahman (Father)', 'Shahnaz Parveen (Mother)', 'Tariqul Islam (Spouse)', 'Ayan (Son)', 'Anika (Daughter)'],
    fatherName: 'Mahbubur Rahman',
    motherName: 'Shahnaz Parveen',
    dob: '1995-11-22',
    gender: 'Female',
    bloodGroup: 'O+',
    mobile: '01898765432',
    email: 'nusrat.jahan@example.com',
    address: 'College Road, Near Bangabandhu College',
    upazila: 'Narail Sadar',
    district: 'Narail',
    nidOrBirthCert: '19953512409800456',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    issueDate: '2026-02-01',
    expiryDate: '2027-01-31',
    status: 'ACTIVE'
  },
  {
    cardId: 'DMB-2026-1003',
    memberId: 'MEM-1003',
    memberName: 'Kazi Abdul Karim',
    cardTier: 'Platinum',
    memberLimit: 8,
    beneficiaries: ['Kazi Abdul Karim (Self)', 'Laila Arjumand (Mother)', 'Fatema Karim (Wife)', 'Kazi Hasan (Son)', 'Kazi Fahim (Son)', 'Kazi Sumaiya (Daughter)', 'Nazma Begum (Sister)', 'Kazi Motiur (Brother)'],
    fatherName: 'Kazi Mokbul Hossain',
    motherName: 'Laila Arjumand',
    dob: '1962-03-08',
    gender: 'Male',
    bloodGroup: 'AB+',
    mobile: '01911223344',
    email: 'karim.kazi@example.com',
    address: 'Zindabazar Point, Sylhet Sadar',
    upazila: 'Sylhet Sadar',
    district: 'Sylhet',
    nidOrBirthCert: '19623512409800789',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    issueDate: '2026-01-15',
    expiryDate: '2027-01-14',
    status: 'ACTIVE'
  },
  {
    cardId: 'DMB-2026-1004',
    memberId: 'MEM-1004',
    memberName: 'Sabina Yasmin',
    cardTier: 'Silver',
    memberLimit: 4,
    beneficiaries: ['Sabina Yasmin (Self)', 'Motiur Rahman (Father)', 'Fatema Khatun (Mother)', 'Mahir (Brother)'],
    fatherName: 'Motiur Rahman',
    motherName: 'Fatema Khatun',
    dob: '2001-08-30',
    gender: 'Female',
    bloodGroup: 'A+',
    mobile: '01655443322',
    email: 'sabina.y@example.com',
    address: 'Lohagara Bazar Road',
    upazila: 'Lohagara',
    district: 'Narail',
    nidOrBirthCert: '20013512409800999',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    issueDate: '2026-03-01',
    expiryDate: '2027-02-28',
    status: 'ACTIVE'
  }
];

export const INITIAL_DIAGNOSTIC_CENTERS: DiagnosticCenter[] = [
  {
    id: 'DC-001',
    name: 'Popular Diagnostic Centre (Gopalganj Branch)',
    code: 'POP-GOP-01',
    division: 'Dhaka',
    district: 'Gopalganj',
    upazila: 'Gopalganj Sadar',
    address: 'Hospital Road, Opposite to General Hospital, Bedgram',
    mobile: '01711009988',
    email: 'gopalganj@populardiagnostic.com',
    discountPercentage: 30,
    availableServices: ['4D Ultrasonography', 'Digital X-Ray', '1.5T MRI', '128 Slice CT Scan', 'Hormone Profile', 'Fully Automated Biochemistry'],
    googleMapUrl: 'https://maps.google.com/?q=Gopalganj+General+Hospital',
    featured: true,
    status: 'ACTIVE',
    totalDiscountsProvided: 142000,
    rating: 4.8
  },
  {
    id: 'DC-002',
    name: 'Sheba Diagnostic & Consultation Centre (Narail)',
    code: 'SHEBA-NAR-02',
    division: 'Khulna',
    district: 'Narail',
    upazila: 'Narail Sadar',
    address: 'Jail Road, Near Narail Modern Hospital',
    mobile: '01812334455',
    email: 'narail@shebadiagnostic.org',
    discountPercentage: 30,
    availableServices: ['Pathology', 'Digital X-Ray', 'ECG', 'Echocardiogram', 'Blood Bank'],
    googleMapUrl: 'https://maps.google.com/?q=Narail+Sadar',
    featured: true,
    status: 'ACTIVE',
    totalDiscountsProvided: 98000,
    rating: 4.7
  },
  {
    id: 'DC-003',
    name: 'Ibn Sina Hospital & Diagnostic Centre (Sylhet Branch)',
    code: 'IBN-SYL-03',
    division: 'Sylhet',
    district: 'Sylhet',
    upazila: 'Sylhet Sadar',
    address: 'Subhanani Ghat, Zindabazar, Sylhet',
    mobile: '01922334411',
    email: 'sylhet@ibnsina.com.bd',
    discountPercentage: 30,
    availableServices: ['General Pathology', 'Ultrasonography 4D', 'Digital X-Ray', 'CT Scan', 'Doctor Chamber'],
    googleMapUrl: 'https://maps.google.com/?q=Sylhet+Zindabazar',
    featured: true,
    status: 'ACTIVE',
    totalDiscountsProvided: 165000,
    rating: 4.9
  },
  {
    id: 'DC-004',
    name: 'Popular Diagnostic Centre (Dhanmondi, Dhaka)',
    code: 'POP-DHK-04',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    address: 'House 16, Road 2, Dhanmondi, Dhaka',
    mobile: '01711223344',
    email: 'dhanmondi@populardiagnostic.com',
    discountPercentage: 30,
    availableServices: ['3T MRI', 'PET-CT Scan', 'Endoscopy', 'Cardiac Cath Lab', 'Full Body Screening'],
    googleMapUrl: 'https://maps.google.com/?q=Popular+Dhanmondi',
    featured: true,
    status: 'ACTIVE',
    totalDiscountsProvided: 320000,
    rating: 4.9
  },
  {
    id: 'DC-005',
    name: 'Chittagong Health Care Diagnostic Ltd',
    code: 'CHC-CTG-05',
    division: 'Chittagong',
    district: 'Chittagong',
    upazila: 'Panchlaish',
    address: 'O.R. Nizam Road, Panchlaish, Chittagong',
    mobile: '01819887766',
    email: 'info@chc-diagnostic.bd',
    discountPercentage: 30,
    availableServices: ['Advanced Pathology', 'Digital Radiology', '4D Echo', 'CT Scan'],
    googleMapUrl: 'https://maps.google.com/?q=Chittagong+Panchlaish',
    featured: true,
    status: 'ACTIVE',
    totalDiscountsProvided: 210000,
    rating: 4.8
  },
  {
    id: 'DC-006',
    name: 'Rajshahi Labaid Diagnostic & Heart Centre',
    code: 'LAB-RAJ-06',
    division: 'Rajshahi',
    district: 'Rajshahi',
    upazila: 'Boalia',
    address: 'Greater Road, Laxmipur, Rajshahi',
    mobile: '01715554433',
    email: 'rajshahi@labaidgroup.com',
    discountPercentage: 30,
    availableServices: ['Cardiology', 'Digital X-Ray', 'Color Doppler', 'Bio-Chemistry'],
    googleMapUrl: 'https://maps.google.com/?q=Rajshahi+Laxmipur',
    featured: true,
    status: 'ACTIVE',
    totalDiscountsProvided: 115000,
    rating: 4.7
  },
  {
    id: 'DC-007',
    name: 'Khulna Modern Diagnostic Center',
    code: 'KMD-KHL-07',
    division: 'Khulna',
    district: 'Khulna',
    upazila: 'Khulna Sadar',
    address: 'KDA Avenue, Royal Hotel Cross, Khulna',
    mobile: '01912445566',
    email: 'khulna.modern@gmail.com',
    discountPercentage: 30,
    availableServices: ['Ultrasonography', 'Digital Radiology', 'Biochemistry', 'Hormone Assay'],
    googleMapUrl: 'https://maps.google.com/?q=Khulna+KDA+Avenue',
    featured: false,
    status: 'ACTIVE',
    totalDiscountsProvided: 87000,
    rating: 4.6
  },
  {
    id: 'DC-008',
    name: 'Barisal Medinova Medical Services',
    code: 'MED-BAR-08',
    division: 'Barisal',
    district: 'Barisal',
    upazila: 'Barisal Sadar',
    address: 'Sadat Alley, Band Road, Barisal',
    mobile: '01733667788',
    email: 'barisal.medinova@yahoo.com',
    discountPercentage: 30,
    availableServices: ['Microbiology', 'Serology', 'ECG', 'Echocardiogram', 'X-Ray'],
    googleMapUrl: 'https://maps.google.com/?q=Barisal+Band+Road',
    featured: false,
    status: 'ACTIVE',
    totalDiscountsProvided: 64000,
    rating: 4.5
  },
  {
    id: 'DC-009',
    name: 'Rangpur Central Diagnostic Complex',
    code: 'RCD-RNG-09',
    division: 'Rangpur',
    district: 'Rangpur',
    upazila: 'Rangpur Sadar',
    address: 'Jail Road, Medical East Gate, Rangpur',
    mobile: '01718990011',
    email: 'rangpur.central@diagnostic.bd',
    discountPercentage: 30,
    availableServices: ['4D Ultrasound', 'Mammography', 'Digital Pathology', 'Bone Densitometry'],
    googleMapUrl: 'https://maps.google.com/?q=Rangpur+Medical+East+Gate',
    featured: true,
    status: 'ACTIVE',
    totalDiscountsProvided: 78000,
    rating: 4.7
  },
  {
    id: 'DC-010',
    name: 'Mymensingh Life Care Hospital & Lab',
    code: 'LIF-MYM-10',
    division: 'Mymensingh',
    district: 'Mymensingh',
    upazila: 'Mymensingh Sadar',
    address: 'Charpara Medical Road, Mymensingh',
    mobile: '01917889900',
    email: 'mymensingh.lifecare@gmail.com',
    discountPercentage: 30,
    availableServices: ['Complete Pathology', 'Digital X-Ray', 'USG', 'Endoscopy'],
    googleMapUrl: 'https://maps.google.com/?q=Mymensingh+Charpara',
    featured: false,
    status: 'ACTIVE',
    totalDiscountsProvided: 52000,
    rating: 4.6
  },
  {
    id: 'DC-011',
    name: 'Narail Central Lab & Medical Care',
    code: 'NAR-04',
    division: 'Khulna',
    district: 'Narail',
    upazila: 'Lohagara',
    address: 'Lohagara Bus Stand, Narail',
    mobile: '01677889900',
    email: 'lohagara.lab@gmail.com',
    discountPercentage: 30,
    availableServices: ['Blood & Urine Routine', 'Diabetes Monitoring', 'Digital X-Ray', 'ECG'],
    googleMapUrl: 'https://maps.google.com/?q=Lohagara+Narail',
    featured: false,
    status: 'ACTIVE',
    totalDiscountsProvided: 32000,
    rating: 4.4
  },
  {
    id: 'DC-012',
    name: 'Sylhet City Lab & Consultation Center',
    code: 'SYL-05',
    division: 'Sylhet',
    district: 'Sylhet',
    upazila: 'Amberkhana',
    address: 'Amberkhana Point, Sylhet',
    mobile: '01755667788',
    email: 'sylhet.citylab@gmail.com',
    discountPercentage: 30,
    availableServices: ['Microbiology', 'Serology', 'Ultrasonography', 'Electrocardiogram'],
    googleMapUrl: 'https://maps.google.com/?q=Amberkhana+Sylhet',
    featured: false,
    status: 'ACTIVE',
    totalDiscountsProvided: 54000,
    rating: 4.6
  },
  {
    id: 'DC-013',
    name: 'Tungipara Digital Diagnostic (Gopalganj)',
    code: 'TUNG-06',
    division: 'Dhaka',
    district: 'Gopalganj',
    upazila: 'Tungipara',
    address: 'Bangabandhu Avenue, Bus Stand, Tungipara',
    mobile: '01700112233',
    email: 'tungipara@dmb.bd',
    discountPercentage: 30,
    availableServices: ['Pathology', 'Ultrasonography', 'Digital X-Ray'],
    googleMapUrl: 'https://maps.google.com/?q=Tungipara',
    featured: false,
    status: 'ACTIVE',
    totalDiscountsProvided: 21000,
    rating: 4.5
  }
];

export const INITIAL_TESTS: MedicalTest[] = [
  { id: 'T-01', name: 'Complete Blood Count (CBC) with ESR', category: 'Hematology', regularPrice: 500, dmbPrice: 350, savings: 150, popular: true },
  { id: 'T-02', name: 'Fastings Blood Glucose (FBS) & PPBS', category: 'Biochemistry', regularPrice: 350, dmbPrice: 220, savings: 130, popular: true },
  { id: 'T-03', name: 'HbA1c (Glycated Hemoglobin)', category: 'Biochemistry', regularPrice: 800, dmbPrice: 550, savings: 250, popular: true },
  { id: 'T-04', name: 'Lipid Profile Complete (Cholesterol, Triglycerides, HDL, LDL)', category: 'Biochemistry', regularPrice: 1300, dmbPrice: 850, savings: 450, popular: true },
  { id: 'T-05', name: 'Liver Function Test (SGPT, SGOT, Bilirubin, Alk Phos)', category: 'Biochemistry', regularPrice: 1500, dmbPrice: 1000, savings: 500, popular: true },
  { id: 'T-06', name: 'Renal Function Test (Creatinine, Urea, Uric Acid)', category: 'Biochemistry', regularPrice: 1200, dmbPrice: 800, savings: 400, popular: true },
  { id: 'T-07', name: 'Thyroid Function Test (T3, T4, TSH)', category: 'Endocrinology', regularPrice: 2200, dmbPrice: 1500, savings: 700, popular: true },
  { id: 'T-08', name: 'Ultrasonography Whole Abdomen (4D Color)', category: 'Radiology & Imaging', regularPrice: 1800, dmbPrice: 1250, savings: 550, popular: true },
  { id: 'T-09', name: 'Digital Chest X-Ray (PA View)', category: 'Radiology & Imaging', regularPrice: 600, dmbPrice: 400, savings: 200, popular: true },
  { id: 'T-10', name: 'ECG 12 Lead Digital', category: 'Cardiology', regularPrice: 400, dmbPrice: 250, savings: 150, popular: true },
  { id: 'T-11', name: '2D Color Doppler Echocardiogram', category: 'Cardiology', regularPrice: 3000, dmbPrice: 2100, savings: 900, popular: false },
  { id: 'T-12', name: 'MRI Brain 1.5 Tesla', category: 'Radiology & Imaging', regularPrice: 8500, dmbPrice: 6000, savings: 2500, popular: false },
  { id: 'T-13', name: 'CT Scan Chest / Abdomen', category: 'Radiology & Imaging', regularPrice: 6500, dmbPrice: 4600, savings: 1900, popular: false },
  { id: 'T-14', name: 'Urine Routine & Microscopy (R/E)', category: 'Pathology', regularPrice: 300, dmbPrice: 180, savings: 120, popular: true },
  { id: 'T-15', name: 'Vitamin D3 & Vitamin B12 Level', category: 'Biochemistry', regularPrice: 3500, dmbPrice: 2400, savings: 1100, popular: false }
];

export const INITIAL_PACKAGES: HealthPackage[] = [
  {
    id: 'PKG-01',
    title: 'Basic Health Checkup Package',
    description: 'Essential preventive screening package for adults to monitor general wellness, blood sugar, and kidney health.',
    category: 'Basic',
    regularPrice: 2800,
    dmbPrice: 1750,
    includedTests: ['CBC with ESR', 'Fastings Blood Glucose', 'Serum Creatinine', 'Urine R/E', 'Digital Chest X-Ray', 'ECG'],
    recommendedFor: 'Adults aged 18+ for annual baseline checkup',
    popular: true,
    partnerLabName: 'পপুলার ডায়াগনস্টিক সেন্টার (গোপালগঞ্জ প্রধান শাখা)',
    availableLabs: ['পপুলার ডায়াগনস্টিক সেন্টার, গোপালগঞ্জ', 'সেবা ডায়াগনস্টিক সেন্টার, নড়াইল', 'ইবনে সিনা ডায়াগনস্টিক, সিলেট']
  },
  {
    id: 'PKG-02',
    title: 'Comprehensive Diabetes Care Package',
    description: 'Specially designed for diabetic patients to assess blood glucose control, lipid levels, liver & renal functions.',
    category: 'Diabetes',
    regularPrice: 4500,
    dmbPrice: 2900,
    includedTests: ['HbA1c', 'Fasting & PP Blood Sugar', 'Lipid Profile', 'Serum Creatinine', 'Microalbuminuria', 'ECG', 'Fundoscopy Guidance'],
    recommendedFor: 'Diabetic & Pre-diabetic individuals (Bi-annual screening)',
    popular: true,
    partnerLabName: 'পপুলার ডায়াগনস্টিক সেন্টার (গোপালগঞ্জ প্রধান শাখা)',
    availableLabs: ['পপুলার ডায়াগনস্টিক সেন্টার, গোপালগঞ্জ', 'ইবনে সিনা ডায়াগনস্টিক, সিলেট']
  },
  {
    id: 'PKG-03',
    title: 'Women Wellness & Hormone Package',
    description: 'Tailored health package focusing on women health, anemia screening, thyroid balance, and bone density markers.',
    category: 'Women',
    regularPrice: 5800,
    dmbPrice: 3800,
    includedTests: ['CBC with Ferritin', 'TSH (Thyroid)', 'Ultrasonography Lower Abdomen', 'Serum Calcium & Vit D3', 'Pap Smear Referral Test', 'Lipid Profile'],
    recommendedFor: 'Women aged 25+ for hormonal and gynecological care',
    popular: true,
    partnerLabName: 'সেবা ডায়াগনস্টিক সেন্টার (নড়াইল শাখা)',
    availableLabs: ['সেবা ডায়াগনস্টিক সেন্টার, নড়াইল', 'পপুলার ডায়াগনস্টিক সেন্টার, গোপালগঞ্জ']
  },
  {
    id: 'PKG-04',
    title: 'Senior Citizen Vital Health Package',
    description: 'In-depth cardiac, metabolic, and systemic health evaluation for elderly family members.',
    category: 'Senior',
    regularPrice: 7200,
    dmbPrice: 4600,
    includedTests: ['CBC', 'Lipid Profile', 'Liver Function Test', 'Renal Function Test', 'ECG', 'Echocardiogram', 'USG Whole Abdomen', 'Uric Acid'],
    recommendedFor: 'Senior citizens aged 55+ (Recommended every 6 months)',
    popular: true,
    partnerLabName: 'ইবনে সিনা ডায়াগনস্টিক (সিলেট শাখা)',
    availableLabs: ['ইবনে সিনা ডায়াগনস্টিক, সিলেট', 'পপুলার ডায়াগনস্টিক সেন্টার, গোপালগঞ্জ']
  }
];

export const INITIAL_TRANSACTIONS: DiscountTransaction[] = [];

export const INITIAL_BLOGS: BlogArticle[] = [
  {
    id: 'BLOG-01',
    title: 'গোপালগঞ্জে ডেঙ্গু প্রতিরোধে করণীয় ও সঠিক ডায়াগনস্টিক পরীক্ষা',
    slug: 'dengue-prevention-gopalganj-diagnostic-tests',
    category: 'Seasonal Health',
    author: 'Dr. Shahriar Hossain, DMB Medical Advisory Board',
    date: '2026-07-10',
    readTime: '4 min read',
    summary: 'বর্ষা মৌসুমে ডেঙ্গুর প্রাদুর্ভাব বৃদ্ধি পায়। এনএস১ (NS1) ও সিবিসি (CBC) পরীক্ষার গুরুত্ব এবং সঠিক সময়ে ডেঙ্গু চিহ্নিত করার উপায় জানুন।',
    content: `গোপালগঞ্জ জেলা সহ সারাদেশেই বর্ষার সাথে সাথে মশার উপদ্রব এবং ডেঙ্গু জ্বরের প্রকোপ আশঙ্কাজনকভাবে বেড়ে যায়। সাধারণ জ্বর ভেবে অবহেলা না করে সঠিক সময়ে চিকিৎসকের পরামর্শ নেওয়া ও প্রয়োজনীয় রক্ত পরীক্ষা করা অত্যন্ত জরুরি।

### ডেঙ্গুর প্রাথমিক লক্ষণসমূহ:
১. তীব্র জ্বর (১০২° থেকে ১০৪° ফারেনহাইট)
২. চোখের পেছনে ও পিঠে প্রচণ্ড ব্যথা
৩. বমি ভাব বা খাবারে অরুচি
৪. শরীরে লালচে র‍্যাশ দেখা দেওয়া

### প্রয়োজনীয় ডায়াগনস্টিক পরীক্ষা:
- **Dengue NS1 Antigen Test:** জ্বরের ১ম থেকে ৩য় দিনের মধ্যে এই পরীক্ষা করা হয়।
- **Complete Blood Count (CBC):** রক্তে প্লেটলেট (Platelet) এবং হেমাটোক্রিট (Hematocrit) মাত্রা নিয়মিত মনিটর করার জন্য প্রতিদিন সিবিসি করা লাগতে পারে।

DMB মেডিক্যাল কার্ড ব্যবহারকারীরা গোপালগঞ্জের যেকোনো পার্টনার ডায়াগনস্টিক সেন্টারে ডেঙ্গু টেস্টের উপর ৩০% বিশেষ ডিসকাউন্ট সুবিধা পাচ্ছেন।`,
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    tags: ['Dengue', 'CBC Test', 'Gopalganj Health', 'Discount']
  },
  {
    id: 'BLOG-02',
    title: 'ডায়াবেটিস রোগীদের জন্য নিয়মিত স্বাস্থ্য পরীক্ষার প্রয়োজনীয়তা',
    slug: 'diabetes-regular-health-checkup-guide',
    category: 'Chronic Care',
    author: 'Dr. Farhana Yasmin, Endocrinologist',
    date: '2026-06-25',
    readTime: '5 min read',
    summary: 'নিয়মিত HbA1c, লিপিড প্রোফাইল ও কিডনি পরীক্ষা কীভাবে ডায়াবেটিসের জটিলতা প্রতিরোধ করে সে বিষয়ে বিস্তারিত নির্দেশিকা।',
    content: `ডায়াবেটিস একটি নীরব ঘাতক রোগ। সঠিক খাদ্যভ্যাস, ব্যায়াম এবং নিয়মিত ডায়াগনস্টিক মনিটরিং এর মাধ্যমে একজন ডায়াবেটিস রোগী সম্পূর্ণ স্বাভাবিক ও দীর্ঘায়ু জীবন যাপন করতে পারেন।

### প্রতি ৩ থেকে ৬ মাসে যে পরীক্ষাগুলো করা জরুরি:
১. **HbA1c (গ্লাইকেটেড হিমোগ্লোবিন):** বিগত ৩ মাসের গড় রক্তের শর্করার সঠিক পরিমাণ নির্দেশ করে।
২. **Lipid Profile:** ডায়াবেটিস রোগীদের হৃদরোগের ঝুঁকি কমানোর জন্য কোলেস্টেরল নিয়ন্ত্রণ রাখা আবশ্যক।
৩. **Serum Creatinine & Microalbumin:** কিডনির কার্যক্ষমতা ঠিক আছে কিনা নিশ্চিত করতে।

DMB এর "Comprehensive Diabetes Care Package" কার্ড হোল্ডারদের জন্য বিশেষ ছাড়ে পাওয়া যাচ্ছে।`,
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
    tags: ['Diabetes', 'HbA1c', 'Health Package', 'Prevention']
  },
  {
    id: 'BLOG-03',
    title: 'ডিজিটাল মেডিক্যাল কার্ড কীভাবে স্বাস্থ্যসেবার খরচ ৩০% কমায়',
    slug: 'digital-medical-card-healthcare-savings-bangladesh',
    category: 'Healthcare Finance',
    author: 'DMB Healthcare Innovation Team',
    date: '2026-06-15',
    readTime: '3 min read',
    summary: 'বাংলাদেশে পকেট থেকে সরাসরি স্বাস্থ্যসেবা ব্যয়ের চাপ কমাতে ডিজিটাল ডায়াগনস্টিক 네트워크ের ভূমিকা।',
    content: `বাংলাদেশে চিকিৎসা খরচের প্রায় ৬৮% সাধারণ মানুষকে নিজের পকেট থেকে বহন করতে হয়। বিশেষ করে নিয়মিত প্যাথলজিক্যাল টেস্ট, ইমেজিং এবং ডায়াগনস্টিক সেন্টারের উচ্চ ব্যয় মধ্যবিত্ত ও নিম্ন-মধ্যবিত্ত পরিবারের জন্য বড় একটি বোঝা।

ডিজিটাল মিডিয়া ব্রিজ (DMB) গোপালগঞ্জে পাইলট প্রজেক্ট হিসেবে শুরু হয়ে সারাদেশের স্বনামধন্য ডায়াগনস্টিক সেন্টার ও হাসপাতালের সাথে অংশীদারিত্ব স্থাপন করেছে। DMB কার্ড ব্যবহারকারীরা প্রতিটি প্যাথলজি ও রেডিওলজি টেস্টে ৩০% সাশ্রয় করতে পারেন।`,
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
    tags: ['Digital Medical Card', 'Savings', 'Gopalganj', 'Healthcare Network']
  }
];

export const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'FAQ-01',
    category: 'Medical Card',
    question: 'DMB ডিজিটাল মেডিক্যাল কার্ড কী এবং এটি কীভাবে কাজ করে?',
    answer: 'DMB মেডিক্যাল কার্ড হলো একটি ডিজিটাল হেলথ মেম্বারশিপ কার্ড। এই কার্ডটি দেখিয়ে বা কিউআর কোড স্ক্যান করার মাধ্যমে আপনি DMB-এর নিবন্ধিত যেকোনো ডায়াগনস্টিক সেন্টার, হাসপাতাল ও ফার্মেসি থেকে নির্ধারিত ৩০% বিশেষ ডিসকাউন্ট সুবিধা পাবেন।'
  },
  {
    id: 'FAQ-02',
    category: 'Medical Card',
    question: 'কার্ডের জন্য আবেদন করতে কী কী তথ্য ও কাগজপত্র লাগে?',
    answer: 'আবেদনকারীর নাম, পিতা/মাতার নাম, জন্ম তারিখ, রক্তের গ্রুপ, মোবাইল নম্বর, পূর্ণাঙ্গ ঠিকানা, এনআইডি (NID) বা জন্ম নিবন্ধনের নম্বর এবং একটি স্পষ্ট প্রোফাইল ছবি প্রয়োজন হয়।'
  },
  {
    id: 'FAQ-03',
    category: 'Discount',
    question: 'গোপালগঞ্জের বাইরে কি এই কার্ড ব্যবহার করা যাবে?',
    answer: 'হ্যাঁ! DMB পাইলট প্রজেক্ট হিসেবে গোপালগঞ্জ থেকে শুরু হলেও ঢাকার পপুলার, ন্যাশনাল হেলথকেয়ার সহ সারাদেশে নেটওয়ার্ক সম্প্রসারিত হচ্ছে। পার্টনার সেন্টারের তালিকা অ্যাপ বা ওয়েবসাইট থেকে দেখা যাবে।'
  },
  {
    id: 'FAQ-04',
    category: 'Partner',
    question: 'একটি ডায়াগনস্টিক সেন্টার কীভাবে DMB পার্টনার হতে পারে?',
    answer: 'আমাদের "Become a Partner" পেজ থেকে অনলাইনে ফর্মটি পূরণ করুন অথবা সরাসরি DMB গোপালগঞ্জ অফিসে যোগাযোগ করুন। আমাদের টিম ভেরিফিকেশন সম্পন্ন করে পার্টনার হিসেবে যুক্ত করবে।'
  },
  {
    id: 'FAQ-05',
    category: 'General',
    question: 'কার্ড ভেরিফিকেশন কীভাবে করব?',
    answer: 'ওয়েবসাইটের "Card Verification" পেজে গিয়ে আপনার ৯ বা ১২ ডিজিটের Card ID লিখুন অথবা কিউআর কোড স্ক্যান করুন। তাৎক্ষণিকভাবে কার্ডের স্থিতি ও মেয়াদের তারিখ ভেসে উঠবে।'
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'TEST-01',
    name: 'আব্দুল কুদ্দুস বিশ্বাস',
    role: 'অবসরপ্রাপ্ত শিক্ষক',
    location: 'বেদগ্রাম, গোপালগঞ্জ সদর',
    comment: 'আমার নিয়মিত ডায়াবেটিস ও হার্টের টেস্ট করতে মাসে অনেক টাকা লাগত। DMB মেডিক্যাল কার্ড নেওয়ার পর পপুলার ডায়াগনস্টিকে আমার টেস্ট খরচে ৩০% সাশ্রয় হচ্ছে। গোপালগঞ্জে এটা সত্যি অভাবনীয় উদ্যোগ!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'TEST-02',
    name: 'ফারজানা আক্তার রুনা',
    role: 'গৃহিণী',
    location: 'টুঙ্গিপাড়া, গোপালগঞ্জ',
    comment: 'আমার বাচ্চার জন্ডিস টেস্ট ও আল্ট্রাসনোগ্রাফির জন্য টুঙ্গিপাড়া পার্টনার সেন্টারে গিয়ে কিউআর কোড স্ক্যান করে সাথে সাথে ছাড় পেয়েছি। কোনো ঝামেলা নেই, খুব সুন্দর সার্ভিস।',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'TEST-03',
    name: 'ডা. মাহফুজুর রহমান',
    role: 'ম্যানেজিং ডিরেক্টর',
    location: 'সেবা ডায়াগনস্টিক, গোপালগঞ্জ',
    comment: 'DMB প্ল্যাটফর্মের মাধ্যমে আমাদের সেন্টারে রোগীর সংখ্যা ও বিশ্বস্ততা অনেক বৃদ্ধি পেয়েছে। তাদের সফটওয়্যার ম্যানেজমেন্ট এবং ডিসকাউন্ট ট্র্যাকিং সিস্টেম বেশ আধুনিক।',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
  }
];

export const INITIAL_NOTICES: CmsNotice[] = [
  {
    id: 'NOT-01',
    title: 'গোপালগঞ্জ পাইলট ফেজ ১ সফলভাবে চালু হয়েছে!',
    content: 'সকল গোপালগঞ্জবাসীকে জানানো যাচ্ছে যে DMB ডিজিটাল মেডিক্যাল কার্ডের মাধ্যমে পার্টনার ডায়াগনস্টিক সেন্টারে ৩০% ছাড় সুবিধা চালু রয়েছে।',
    date: '2026-07-01',
    active: true,
    type: 'IMPORTANT'
  },
  {
    id: 'NOT-02',
    title: 'বিনামূল্যে স্বাস্থ্য সেবা ও ফ্রি বিপি চেকআপ ক্যাম্প',
    content: 'আগামী শুক্রবার গোপালগঞ্জ সাধারণ হাসপাতাল গেটের সামনে DMB আয়োজিত ফ্রি ব্লাড প্রেশার ও ব্লাড সুগার ক্যাম্প আয়োজিত হবে।',
    date: '2026-07-25',
    active: true,
    type: 'ANNOUNCEMENT'
  }
];
