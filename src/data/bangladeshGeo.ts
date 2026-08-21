export interface GeoDivision {
  id: string;
  nameBn: string;
  nameEn: string;
  districts: {
    nameBn: string;
    nameEn: string;
    upazilas: string[];
  }[];
}

export const BANGLADESH_GEO_DATA: GeoDivision[] = [
  {
    id: 'dhaka',
    nameBn: 'ঢাকা বিভাগ',
    nameEn: 'Dhaka',
    districts: [
      { nameBn: 'গোপালগঞ্জ', nameEn: 'Gopalganj', upazilas: ['Gopalganj Sadar', 'Tungipara', 'Kotalipara', 'Kashiani', 'Muksudpur'] },
      { nameBn: 'ঢাকা', nameEn: 'Dhaka', upazilas: ['Dhanmondi', 'Mirpur', 'Uttara', 'Gulshan', 'Mohakhali', 'Savak', 'Jatrabari'] },
      { nameBn: 'গাজীপুর', nameEn: 'Gazipur', upazilas: ['Gazipur Sadar', 'Kaliakair', 'Sreepur', 'Tongie'] },
      { nameBn: 'নারায়ণগঞ্জ', nameEn: 'Narayanganj', upazilas: ['Narayanganj Sadar', 'Siddhirganj', 'Rupganj', 'Araihazar'] },
      { nameBn: 'ফরিদপুর', nameEn: 'Faridpur', upazilas: ['Faridpur Sadar', 'Bhanga', 'Boalmari', 'Nagarkanda'] }
    ]
  },
  {
    id: 'khulna',
    nameBn: 'খুলনা বিভাগ',
    nameEn: 'Khulna',
    districts: [
      { nameBn: 'নড়াইল', nameEn: 'Narail', upazilas: ['Narail Sadar', 'Lohagara', 'Kalia'] },
      { nameBn: 'খুলনা', nameEn: 'Khulna', upazilas: ['Khulna Sadar', 'Sonadanga', 'Daulatpur', 'Khalishpur', 'Rupsha'] },
      { nameBn: 'যশোর', nameEn: 'Jessore', upazilas: ['Jessore Sadar', 'Jhikargachha', 'Bagherpara', 'Sharsha'] },
      { nameBn: 'সাতক্ষীরা', nameEn: 'Satkhira', upazilas: ['Satkhira Sadar', 'Kalaroa', 'Tala', 'Shyamnagar'] },
      { nameBn: 'বাগেরহাট', nameEn: 'Bagerhat', upazilas: ['Bagerhat Sadar', 'Mongla', 'Fakirhat', 'Rampal'] }
    ]
  },
  {
    id: 'sylhet',
    nameBn: 'সিলেট বিভাগ',
    nameEn: 'Sylhet',
    districts: [
      { nameBn: 'সিলেট', nameEn: 'Sylhet', upazilas: ['Sylhet Sadar', 'Zindabazar', 'Amberkhana', 'Beanibazar', 'Golapganj'] },
      { nameBn: 'মৌলভীবাজার', nameEn: 'Moulvibazar', upazilas: ['Moulvibazar Sadar', 'Sreemangal', 'Kulaura'] },
      { nameBn: 'হবিগঞ্জ', nameEn: 'Habiganj', upazilas: ['Habiganj Sadar', 'Madhabpur', 'Nabiganj'] },
      { nameBn: 'সুনামগঞ্জ', nameEn: 'Sunamganj', upazilas: ['Sunamganj Sadar', 'Chhatak', 'Jagannathpur'] }
    ]
  },
  {
    id: 'chittagong',
    nameBn: 'চট্টগ্রাম বিভাগ',
    nameEn: 'Chittagong',
    districts: [
      { nameBn: 'চট্টগ্রাম', nameEn: 'Chittagong', upazilas: ['Agrabad', 'Panchlaish', 'Kotwali', 'Halishahar', 'Hathazari'] },
      { nameBn: 'কক্সবাজার', nameEn: 'Cox\'s Bazar', upazilas: ['Cox\'s Bazar Sadar', 'Teknaf', 'Ukhiya', 'Ramu'] },
      { nameBn: 'কুমিল্লা', nameEn: 'Comilla', upazilas: ['Comilla Sadar', 'Kandirpar', 'Daudkandi', 'Laksham'] },
      { nameBn: 'ফেনী', nameEn: 'Feni', upazilas: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan'] }
    ]
  },
  {
    id: 'rajshahi',
    nameBn: 'রাজশাহী বিভাগ',
    nameEn: 'Rajshahi',
    districts: [
      { nameBn: 'রাজশাহী', nameEn: 'Rajshahi', upazilas: ['Rajshahi Sadar', 'Boalia', 'Rajpara', 'Puthia'] },
      { nameBn: 'বগুড়া', nameEn: 'Bogra', upazilas: ['Bogra Sadar', 'Sherpur', 'Shajahanpur', 'Ghabtali'] },
      { nameBn: 'পাবনা', nameEn: 'Pabna', upazilas: ['Pabna Sadar', 'Ishwardi', 'Santhia'] }
    ]
  },
  {
    id: 'barisal',
    nameBn: 'বরিশাল বিভাগ',
    nameEn: 'Barisal',
    districts: [
      { nameBn: 'বরিশাল', nameEn: 'Barisal', upazilas: ['Barisal Sadar', 'Kotwali', 'Gournadi', 'Babuganj'] },
      { nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali', upazilas: ['Patuakhali Sadar', 'Kuakata', 'Galachipa'] },
      { nameBn: 'ভোলা', nameEn: 'Bhola', upazilas: ['Bhola Sadar', 'Char Fasson', 'Borhanuddin'] }
    ]
  },
  {
    id: 'rangpur',
    nameBn: 'রংপুর বিভাগ',
    nameEn: 'Rangpur',
    districts: [
      { nameBn: 'রংপুর', nameEn: 'Rangpur', upazilas: ['Rangpur Sadar', 'Pirganj', 'Badarganj', 'Mithapukur'] },
      { nameBn: 'দিনাজপুর', nameEn: 'Dinajpur', upazilas: ['Dinajpur Sadar', 'Birganj', 'Fulbari'] }
    ]
  },
  {
    id: 'mymensingh',
    nameBn: 'ময়মনসিংহ বিভাগ',
    nameEn: 'Mymensingh',
    districts: [
      { nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', upazilas: ['Mymensingh Sadar', 'Muktagachha', 'Trishal', 'Bhaluka'] },
      { nameBn: 'জামালপুর', nameEn: 'Jamalpur', upazilas: ['Jamalpur Sadar', 'Sarsabari', 'Melandaha'] }
    ]
  }
];
