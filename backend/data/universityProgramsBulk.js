/**
 * Bulk program listings (comma-separated) per faculty group.
 * matchNames must match (or fuzzy-match) documents in University collection.
 * Add more blocks as needed; re-run: node backend/scripts/importUniversityProgramsBulk.js
 */
module.exports = [
  {
    matchNames: ['National University of Sciences & Technology (NUST)', 'NUST'],
    groups: {
      Engineering:
        'BS/MS/PhD Mechanical Engineering, BS Electrical Engineering, BS Civil Engineering, BS Chemical Engineering, BS Aerospace Engineering, BS Avionics Engineering, BS Software Engineering, BS Mechatronics Engineering, BS Geoinformatics Engineering',
      Computing:
        'BS Computer Science, BS Artificial Intelligence, BS Data Science, BS Bioinformatics',
      Business: 'BBA, BS Accounting & Finance, BS Tourism & Hospitality Management',
      'Social Sciences': 'BS Economics, BS Psychology, BS Mass Communication, LLB',
      'Applied Sciences':
        'BS Biotechnology, BS Physics, BS Chemistry, BS Mathematics, BS Environmental Science',
    },
  },
  {
    matchNames: ['COMSATS University Islamabad', 'COMSATS'],
    groups: {
      Engineering:
        'BS Electrical Engineering, BS Chemical Engineering, BS Mechanical Engineering, BS Civil Engineering, BS Computer Engineering',
      IT: 'BS Computer Science, BS Software Engineering, BS Data Science, BS Cyber Security',
      Business: 'BBA, BS Accounting & Finance, MBA',
      Sciences:
        'BS Biosciences, BS Physics, BS Chemistry, BS Mathematics, BS Statistics',
      Architecture: 'B.Arch, BS Interior Design',
    },
  },
  {
    matchNames: [
      'FAST National University of Computer and Emerging Sciences (FAST-NU)',
      'FAST-NUCES',
    ],
    groups: {
      Computing:
        'BS Computer Science, BS Software Engineering, BS Data Science, BS Artificial Intelligence, BS Cyber Security',
      Business: 'BBA, BS Accounting & Finance, BS Business Analytics',
      Engineering: 'BS Electrical Engineering, BS Civil Engineering',
      Graduate: 'MS Computer Science, MS Software Project Management, MS Data Science, PhD Computer Science',
    },
  },
  {
    matchNames: ['Quaid-i-Azam University'],
    groups: {
      'Natural Sciences':
        'BS Physics, BS Chemistry, BS Mathematics, BS Statistics, BS Electronics, BS Earth Sciences, MSc Physics, MSc Chemistry, PhD Natural Sciences',
      'Biological Sciences':
        'BS Botany, BS Zoology, BS Biochemistry, BS Microbiology, BS Biotechnology',
      'Social Sciences':
        'BS Economics, BS Anthropology, BS Sociology, BS International Relations, BS Political Science, BS Psychology, BS History',
      Business: 'BBA, BS Public Administration, MBA',
    },
  },
  {
    matchNames: ['University of the Punjab'],
    groups: {
      Computing: 'BSCS, BSIT, BS Software Engineering, BS Data Science',
      Medical: 'Pharm-D',
      Law: 'LLB',
      Business: 'BBA, BS Commerce, BS Accounting & Finance, MBA, MPA',
      'Arts & Humanities':
        'BS English, BS Urdu, BS History, BS Gender Studies, BS Fine Arts, BS Graphic Design',
      Engineering: 'BS Chemical Engineering, BS Metallurgy & Materials Engineering, BS Electrical Engineering',
    },
  },
  {
    matchNames: ['Lahore University of Management Sciences (LUMS)'],
    groups: {
      Business: 'BSc Accounting & Finance, BSc Management Science',
      Humanities:
        'BA English, BA History, BSc Economics, BS Anthropology & Sociology, BS Political Science',
      Law: 'BA-LLB',
      Sciences: 'BS Biology, BS Chemistry, BS Mathematics, BS Physics',
      Engineering: 'BS Computer Science, BS Electrical Engineering, BS Chemical Engineering',
    },
  },
  {
    matchNames: ['Institute of Business Administration (IBA)'],
    groups: {
      Business: 'BBA, BS Accounting & Finance',
      Computing: 'BS Computer Science, BS Mathematics',
      'Social Sciences': 'BS Economics, BS Social Sciences & Liberal Arts',
      Graduate: 'MBA, MS Data Science, MS Finance, MS Journalism, MS Islamic Banking',
    },
  },
  {
    matchNames: ['NED University of Engineering & Technology'],
    groups: {
      Engineering:
        'BS Civil Engineering, BS Mechanical Engineering, BS Electrical Engineering, BS Electronics Engineering, BS Computer Systems Engineering, BS Textile Engineering, BS Biomedical Engineering, BS Food Engineering, BS Polymer Engineering, BS Automotive Engineering',
      Computing:
        'BS Computer Science, BS Software Engineering, BS Artificial Intelligence, BS Cyber Security',
      Architecture: 'B.Arch, BS Development Studies',
    },
  },
  {
    matchNames: ['AIOU - Allama Iqbal Open University', 'Allama Iqbal Open University (AIOU)'],
    groups: {
      Education: 'B.Ed, M.Ed, MA Education',
      General: 'BS English, BS Urdu, BS Islamic Studies, BS Pakistan Studies, BS Arabic',
      Science: 'BS Physics, BS Chemistry, BS Mathematics, BS Statistics',
      Technical: 'BS Computer Science, Associate Degrees in Business',
    },
  },
  {
    matchNames: ['Air University'],
    groups: {
      Engineering: 'BE Mechanical Engineering, BE Electrical Engineering, BE Mechatronics Engineering, BE Aerospace Engineering, BE Avionics Engineering',
      Computing: 'BS Computer Science, BS Cyber Security, BS Artificial Intelligence',
      Medical: 'MBBS (through Fazaia Medical College)',
      Business: 'BBA, BS Accounting & Finance, BS Aviation Management',
    },
  },
  {
    matchNames: ['Bahria University'],
    groups: {
      Maritime: 'BS Maritime Business & Management',
      Health: 'MBBS, BDS, Nursing',
      Engineering: 'BS Electrical Engineering, BS Software Engineering, BS Computer Engineering',
      'Social Sciences':
        'BS Psychology, BS International Relations, BS Media Studies, LLB',
    },
  },
  {
    matchNames: ['Government College University Lahore (GCU)', 'Government College University, Lahore'],
    groups: {
      'Pure Sciences':
        'BS Physics, BS Chemistry, BS Botany, BS Zoology, BS Biotechnology, BS Microbiology',
      Arts: 'BS English Literature, BS Philosophy, BS History, BS Art History',
      Professional: 'BS Computer Science, B.Ed, LLB, BBA, BS Banking & Finance',
    },
  },
  {
    matchNames: ['Aga Khan University'],
    groups: {
      Medical: 'MBBS, Bachelor of Science in Nursing',
      'Post-Graduate':
        'MS Biological Sciences, PhD Biological Sciences, M.Ed, Master of Health Professions Education',
      Midwifery: 'Diploma in Midwifery, BS Midwifery',
    },
  },
  {
    matchNames: ['Bahauddin Zakariya University (BZU)'],
    groups: {
      Engineering:
        'BS Civil Engineering, BS Electrical Engineering, BS Mechanical Engineering, BS Agricultural Engineering',
      Sciences:
        'BS Physics, BS Chemistry, BS Botany, BS Zoology, BS Statistics, BS Mathematics',
      Business: 'BBA, BS Commerce, BS Accounting & Finance, MBA',
      'Arts & Law':
        'LLB, BS English, BS Sociology, BS Psychology, BS Islamic Studies',
      Agriculture: 'BS Agriculture, DVM',
    },
  },
  {
    matchNames: ['University of Engineering & Technology, Lahore (UET Lahore)'],
    groups: {
      Engineering:
        'BS Mechanical Engineering, BS Electrical Engineering, BS Civil Engineering, BS Chemical Engineering, BS Petroleum Engineering, BS Mining Engineering, BS Geological Engineering, BS Mechatronics Engineering, BS Industrial & Manufacturing Engineering',
      Technology: 'BS Computer Science, BS Data Science, BS Cyber Security',
      Architecture: 'B.Arch, City & Regional Planning',
      Sciences: 'BS Physics, BS Mathematics, BS Chemistry',
    },
  },
  {
    matchNames: ['University of Engineering & Technology, Taxila'],
    groups: {
      Engineering:
        'BS Civil Engineering, BS Mechanical Engineering, BS Electrical Engineering, BS Industrial Engineering, BS Environmental Engineering, BS Telecommunication Engineering',
      Computing: 'BS Computer Science, BS Software Engineering, BS Data Science',
      Management: 'BS Business Administration',
    },
  },
  {
    matchNames: ['University of Engineering & Technology Peshawar (UET Peshawar)'],
    groups: {
      Engineering:
        'BS Civil Engineering, BS Electrical Engineering, BS Mechanical Engineering, BS Chemical Engineering, BS Mining Engineering, BS Agricultural Engineering, BS Mechatronics Engineering, BS Industrial Engineering',
      Computing: 'BS Computer Science, BS Data Science',
      Architecture: 'B.Arch',
    },
  },
  {
    matchNames: ['Dow University of Health Sciences'],
    groups: {
      Clinical: 'MBBS, BDS, Pharm-D',
      'Allied Health':
        'BS Medical Technology, BS Nursing, BS Occupational Therapy, BS Prosthetics & Orthotics',
      Biotechnology: 'BS Biotechnology',
    },
  },
  {
    matchNames: ['Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI)'],
    groups: {
      Engineering:
        'BS Mechanical Engineering, BS Electrical Engineering, BS Materials Engineering, BS Chemical Engineering, BS Civil Engineering',
      Computing: 'BS Computer Science, BS Artificial Intelligence, BS Data Science',
      Management: 'BS Management Sciences',
    },
  },
  {
    matchNames: ['University of Karachi'],
    groups: {
      Arts:
        'BS English, BS Urdu, BS International Relations, BS Political Science, BS Psychology, BS Sociology, BS Mass Communication',
      Sciences:
        'BS Physics, BS Chemistry, BS Zoology, BS Botany, BS Microbiology, BS Biochemistry, BS Applied Physics',
      Business: 'BBA, BS Commerce',
      Medical: 'Pharm-D',
      Law: 'LLB',
    },
  },
  {
    matchNames: ['University of Peshawar'],
    groups: {
      'Social Sciences':
        'BS Anthropology, BS Criminology, BS Political Science, BS International Relations',
      'Pure Sciences':
        'BS Physics, BS Chemistry, BS Mathematics, BS Electronics',
      'Life Sciences': 'BS Botany, BS Zoology, BS Environmental Sciences',
      Professional: 'BBA, LLB, BS Journalism',
    },
  },
  {
    matchNames: ['University of Balochistan'],
    groups: {
      Sciences: 'BS Physics, BS Chemistry, BS Mathematics, BS Geology',
      Humanities:
        'BS English, BS History, BS Balochi Literature, BS Brahui Literature, BS Pashto Literature',
      Professional: 'BBA, LLB, BS Pharmacy, BS Computer Science',
    },
  },
  {
    matchNames: ['Forman Christian College'],
    groups: {
      'Natural Sciences':
        'BS Biotechnology, BS Biological Sciences, BS Chemistry, BS Physics, BS Mathematics, BS Statistics',
      Humanities:
        'BS Economics, BS English, BS History, BS Philosophy, BS Political Science, BS Psychology, BS Sociology, BS Urdu',
      Professional:
        'BS Computer Science, BBA, Pharm-D, BS Mass Communication',
    },
  },
  {
    matchNames: ['Pakistan Institute of Development Economics (PIDE)'],
    groups: {
      Economics: 'BS Economics, BS Environmental Economics, BS Economics & Finance',
      Management: 'BS Business Analytics, BS Public Policy, MBA',
      'Social Sciences': 'BS Anthropology, BS Sociology',
    },
  },
  {
    matchNames: ['University of Lahore (UOL)'],
    groups: {
      Business: 'BBA, BS Commerce, BS Accounting & Finance',
      IT: 'BS Computer Science, BS Software Engineering',
      'Social Sciences': 'BS English, BS Applied Psychology, BS Economics',
      Law: 'LLB',
    },
  },
  {
    matchNames: ['Ziauddin University'],
    groups: {
      Medical: 'MBBS, BDS, Pharm-D, DPT',
      Media: 'BS Communication & Media Sciences',
      Engineering: 'BS Biomedical Engineering, BS Electrical Engineering',
      Law: 'LLB',
      Nursing: 'BS Nursing, Post-RN BSN',
    },
  },
  {
    matchNames: ['National University of Modern Languages (NUML)'],
    groups: {
      Languages:
        'BS English, BS Urdu, BS Arabic, BS Chinese, BS French, BS German, BS Persian',
      Management: 'BBA, BS Accounting & Finance, BS Commerce, MBA',
      Computing:
        'BS Computer Science, BS Software Engineering, BS Artificial Intelligence',
      'Social Sciences':
        'BS International Relations, BS Mass Communication, BS Psychology, B.Ed',
    },
  },
  {
    matchNames: ['Institute of Space Technology (IST)'],
    groups: {
      Engineering:
        'BE Aerospace Engineering, BE Avionics Engineering, BE Electrical Engineering, BE Mechanical Engineering, BE Materials Science & Engineering',
      Sciences: 'BS Space Science, BS Mathematics, BS Physics',
      Computing: 'BS Computer Science, BS Data Science',
    },
  },
  {
    matchNames: ['Institute of Management Sciences (IMSciences)'],
    groups: {
      Management: 'BBA, BS Accounting & Finance, BS Business Analytics',
      Computing: 'BS Computer Science, BS Software Engineering, BS Data Science',
      'Social Sciences': 'BS Economics, BS Social Science, BS Political Science',
      Development: 'BS Development Studies, BS Public Administration',
    },
  },
  {
    matchNames: [
      'University of Veterinary and Animal Sciences',
      'UVAS',
      'University of Veterinary & Animal Sciences',
    ],
    groups: {
      Veterinary: 'DVM, BS Animal Sciences, BS Poultry Sciences',
      Medical: 'Pharm-D, BS Medical Laboratory Technology',
      Sciences: 'BS Biotechnology, BS Zoology, BS Wildlife Management',
      Food: 'BS Food Science & Technology, BS Human Nutrition & Dietetics',
    },
  },
  {
    matchNames: [
      'University of Agriculture, Faisalabad',
      'University of Agriculture Faisalabad',
      'UAF',
      'Agriculture University Faisalabad',
    ],
    groups: {
      Agriculture: 'BS Agriculture, BS Horticulture, BS Animal Sciences, BS Food Science & Technology',
      Engineering: 'BS Agricultural Engineering, BS Environmental Engineering',
      Sciences: 'BS Biotechnology, BS Chemistry, BS Physics, BS Mathematics',
      Business: 'BBA, BS Agricultural Economics, BS Agribusiness',
      'Social Sciences': 'BS Rural Sociology, BS Agricultural Extension',
    },
  },
  {
    matchNames: ['University of Sargodha'],
    groups: {
      Sciences: 'BS Physics, BS Chemistry, BS Zoology, BS Botany, BS Mathematics',
      IT: 'BS Computer Science, BS Software Engineering, BS Information Technology',
      Business: 'BBA, BS Commerce, BS Accounting & Finance, MBA',
      Arts: 'BS English, BS Urdu, BS Islamic Studies, BS History',
      Law: 'LLB',
    },
  },
  {
    matchNames: ['University of Gujrat'],
    groups: {
      Engineering: 'BS Electrical Engineering, BS Mechanical Engineering, BS Computer Engineering',
      Computing: 'BS Computer Science, BS Software Engineering',
      Business: 'BBA, BS Accounting & Finance',
      Sciences: 'BS Physics, BS Chemistry, BS Mathematics',
      Arts: 'BS English, BS Urdu, BS Islamic Studies',
    },
  },
  {
    matchNames: ['University of Sindh', 'Sindh University Jamshoro'],
    groups: {
      Sciences: 'BS Physics, BS Chemistry, BS Botany, BS Zoology, BS Biochemistry',
      IT: 'BS Computer Science, BS Software Engineering',
      Business: 'BBA, BS Commerce, MBA',
      Arts: 'BS English, BS Sindhi, BS International Relations, BS Mass Communication',
      Law: 'LLB',
    },
  },
  {
    matchNames: ['Abdul Wali Khan University', 'AWKUM'],
    groups: {
      Sciences: 'BS Physics, BS Chemistry, BS Botany, BS Zoology',
      IT: 'BS Computer Science, BS Software Engineering',
      Business: 'BBA, BS Accounting & Finance',
      Arts: 'BS English, BS Pashto, BS Islamic Studies, BS Political Science',
    },
  },
  {
    matchNames: ['Hazara University'],
    groups: {
      Sciences: 'BS Physics, BS Chemistry, BS Botany, BS Environmental Sciences',
      IT: 'BS Computer Science, BS Software Engineering',
      Business: 'BBA, BS Commerce',
      Arts: 'BS English, BS Urdu, BS Islamic Studies',
    },
  },
  {
    matchNames: ['University of Malakand', 'Malakand University'],
    groups: {
      Sciences: 'BS Physics, BS Chemistry, BS Botany, BS Zoology',
      IT: 'BS Computer Science',
      Business: 'BBA, BS Economics',
      Arts: 'BS English, BS Pashto, BS Islamic Studies',
    },
  },
  {
    matchNames: ['Kohat University of Science and Technology', 'KUST Kohat'],
    groups: {
      Engineering: 'BS Electrical Engineering, BS Computer Engineering',
      Sciences: 'BS Physics, BS Chemistry, BS Microbiology',
      IT: 'BS Computer Science, BS Software Engineering',
      Business: 'BBA, BS Economics',
    },
  },
  {
    matchNames: ['The Women University Multan', 'Women University Multan'],
    groups: {
      Sciences: 'BS Botany, BS Zoology, BS Chemistry, BS Mathematics',
      Arts: 'BS English, BS Urdu, BS Islamic Studies, BS Fine Arts',
      Business: 'BBA, BS Commerce',
      IT: 'BS Computer Science',
    },
  },
  {
    matchNames: ['University of Sahiwal'],
    groups: {
      IT: 'BS Computer Science, BS Information Technology',
      Business: 'BBA, BS Commerce',
      Sciences: 'BS Physics, BS Chemistry, BS Mathematics',
      Arts: 'BS English, BS Islamic Studies',
    },
  },
  {
    matchNames: ['University of Okara'],
    groups: {
      IT: 'BS Computer Science, BS Software Engineering',
      Business: 'BBA, BS Accounting & Finance',
      Sciences: 'BS Physics, BS Chemistry, BS Agriculture',
      Arts: 'BS English, BS Urdu',
    },
  },
  {
    matchNames: ['University of Education', 'UOE Lahore'],
    groups: {
      Education: 'B.Ed, BS Education, M.Ed',
      Sciences: 'BS Mathematics, BS Physics, BS Chemistry',
      IT: 'BS Computer Science',
      Arts: 'BS English, BS Urdu',
    },
  },
  {
    matchNames: ['GIFT University'],
    groups: {
      Business: 'BBA, BS Accounting & Finance, MBA',
      Computing: 'BS Computer Science, BS Software Engineering',
      'Social Sciences': 'BS Economics, BS Psychology',
    },
  },
  {
    matchNames: ['University of Management and Technology', 'UMT Lahore'],
    groups: {
      Business: 'BBA, BS Accounting & Finance, MBA',
      Engineering: 'BS Electrical Engineering, BS Civil Engineering',
      Computing: 'BS Computer Science, BS Software Engineering, BS Data Science',
    },
  },
  {
    matchNames: ['Riphah International University'],
    groups: {
      Medical: 'MBBS, Pharm-D, BS Medical Imaging',
      Computing: 'BS Computer Science, BS Software Engineering',
      Business: 'BBA, MBA',
      'Social Sciences': 'BS Psychology, LLB',
    },
  },
  {
    matchNames: ['Hajvery University'],
    groups: {
      Business: 'BBA, BS Commerce, MBA',
      Computing: 'BS Computer Science, BS Software Engineering',
      Media: 'BS Film & TV, BS Textile Design',
    },
  },
  {
    matchNames: ['National Textile University', 'NTU Faisalabad'],
    groups: {
      Textile: 'BS Textile Engineering, BS Fashion Design, BS Polymer Engineering',
      Management: 'BBA, MBA',
      Computing: 'BS Computer Science',
    },
  },
  {
    matchNames: ['University of Haripur', 'Haripur University'],
    groups: {
      Sciences: 'BS Chemistry, BS Botany, BS Zoology, BS Mathematics',
      IT: 'BS Computer Science',
      Business: 'BBA',
      Arts: 'BS English, BS Islamic Studies',
    },
  },
  {
    matchNames: ['University of Mianwali', 'Mianwali University'],
    groups: {
      Engineering: 'BS Electrical Engineering, BS Civil Engineering',
      IT: 'BS Computer Science',
      Business: 'BBA',
      Sciences: 'BS Physics, BS Chemistry',
    },
  },
  {
    matchNames: ['University of Narowal'],
    groups: {
      IT: 'BS Computer Science',
      Business: 'BBA, BS Commerce',
      Sciences: 'BS Mathematics, BS Chemistry',
      Arts: 'BS English, BS Islamic Studies',
    },
  },
  {
    matchNames: ['University of Turbat'],
    groups: {
      IT: 'BS Computer Science',
      Business: 'BBA',
      Sciences: 'BS Physics, BS Chemistry, BS Mathematics',
      Arts: 'BS English, BS Balochi',
    },
  },
  {
    matchNames: ['University of Gwadar'],
    groups: {
      Marine: 'BS Marine Sciences, BS Fisheries',
      Business: 'BBA',
      IT: 'BS Computer Science',
      Social: 'BS International Relations',
    },
  },
  {
    matchNames: ['University of Chakwal'],
    groups: {
      IT: 'BS Computer Science, BS Software Engineering',
      Business: 'BBA',
      Sciences: 'BS Mathematics, BS Chemistry',
    },
  },
  {
    matchNames: ['University of Layyah'],
    groups: {
      Agriculture: 'BS Agriculture, BS Agronomy',
      IT: 'BS Computer Science',
      Business: 'BBA',
    },
  },
  {
    matchNames: ['University of Bhakkar'],
    groups: {
      IT: 'BS Computer Science',
      Business: 'BBA',
      Sciences: 'BS Chemistry, BS Mathematics',
    },
  },
  {
    matchNames: ['University of Attock'],
    groups: {
      IT: 'BS Computer Science',
      Business: 'BBA',
      Sciences: 'BS Physics, BS Chemistry',
    },
  },
  {
    matchNames: ['University of Faisalabad', 'Faisalabad University'],
    groups: {
      Business: 'BBA, MBA',
      IT: 'BS Computer Science',
      Sciences: 'BS Biotechnology, BS Chemistry',
    },
  },
  {
    matchNames: ['University of Jhang'],
    groups: {
      IT: 'BS Computer Science',
      Business: 'BBA',
      Sciences: 'BS Mathematics, BS Physics',
    },
  },
  {
    matchNames: ['University of Dera Ghazi Khan', 'Ghazi University'],
    groups: {
      IT: 'BS Computer Science',
      Business: 'BBA',
      Agriculture: 'BS Agriculture',
      Sciences: 'BS Chemistry, BS Botany',
    },
  },
  {
    matchNames: ['University of Kotli', 'Kotli University'],
    groups: {
      IT: 'BS Computer Science',
      Business: 'BBA',
      Sciences: 'BS Mathematics, BS Physics',
    },
  },
  {
    matchNames: ['Mirpur University of Science and Technology', 'MUST Mirpur'],
    groups: {
      Engineering: 'BS Electrical Engineering, BS Civil Engineering',
      Computing: 'BS Computer Science, BS Software Engineering',
      Business: 'BBA',
    },
  },
  {
    matchNames: ['University of Azad Jammu and Kashmir', 'UAJK'],
    groups: {
      Sciences: 'BS Physics, BS Chemistry, BS Botany, BS Zoology',
      IT: 'BS Computer Science',
      Business: 'BBA, MBA',
      Arts: 'BS English, BS Urdu, LLB',
    },
  },
  {
    matchNames: ['Lasbela University of Agriculture', 'LUAWMS'],
    groups: {
      Agriculture: 'BS Agriculture, BS Animal Husbandry',
      Engineering: 'BS Mining Engineering',
      Business: 'BBA',
      IT: 'BS Computer Science',
    },
  },
  {
    matchNames: ['Shaheed Benazir Bhutto University', 'SBBU'],
    groups: {
      Sciences: 'BS Botany, BS Zoology, BS Chemistry',
      IT: 'BS Computer Science',
      Business: 'BBA',
      Arts: 'BS English, BS Sindhi',
    },
  },
  {
    matchNames: ['Shah Abdul Latif University', 'SALU Khairpur'],
    groups: {
      Sciences: 'BS Physics, BS Chemistry, BS Botany, BS Zoology',
      IT: 'BS Computer Science',
      Business: 'BBA, MBA',
      Arts: 'BS English, BS Sindhi, LLB',
    },
  },
  {
    matchNames: ['Islamia University of Bahawalpur', 'IUB Bahawalpur'],
    groups: {
      Engineering: 'BS Electrical Engineering, BS Chemical Engineering',
      IT: 'BS Computer Science, BS Software Engineering',
      Medical: 'Pharm-D, MBBS',
      Business: 'BBA, MBA',
      Arts: 'BS English, BS Islamic Studies, LLB',
    },
  },
  {
    matchNames: ['Government College University Faisalabad', 'GCUF'],
    groups: {
      Sciences: 'BS Physics, BS Chemistry, BS Botany, BS Zoology',
      IT: 'BS Computer Science',
      Business: 'BBA, BS Commerce',
      Arts: 'BS English, BS Urdu',
    },
  },
  {
    matchNames: ['Fatima Jinnah Women University', 'FJWU Rawalpindi'],
    groups: {
      Sciences: 'BS Biotechnology, BS Environmental Sciences',
      IT: 'BS Computer Science',
      Business: 'BBA',
      Arts: 'BS English, BS Fine Arts, BS Psychology',
    },
  },
  /** Added with indicative-fee seed (2026-style listings; verify on official sites) */
  {
    matchNames: ['Information Technology University'],
    groups: {
      'Undergraduate (BS)':
        'BS Computer Science, BS Artificial Intelligence, BS Software Engineering, BS Electrical Engineering, BS Computer Engineering, BS Economics with Data Science, BS FinTech, BS Management and Technology',
      'Graduate (MS/MPhil/PhD)':
        'MS Computer Science, PhD Computer Science, MS Electrical Engineering, PhD Electrical Engineering, MS Data Science, PhD Data Science, MS Public Policy, PhD Public Policy, MS Development Studies, PhD Development Studies, Executive MBA',
    },
  },
  {
    matchNames: ['Pakistan Institute of Engineering & Applied Sciences (PIEAS)'],
    groups: {
      'Undergraduate (BS)':
        'BS Electrical Engineering, BS Mechanical Engineering, BS Chemical Engineering, BS Metallurgy and Materials Engineering, BS Computer Science, BS Physics',
      'Graduate (MS/MPhil/PhD)':
        'MS Nuclear Engineering, PhD Nuclear Engineering, MS Medical Physics, PhD Medical Physics, MS Systems Engineering, PhD Systems Engineering, MS Materials Engineering, PhD Materials Engineering, MS Cyber Security, PhD Cyber Security, MS Artificial Intelligence, PhD Artificial Intelligence',
    },
  },
  {
    matchNames: ['Lahore School of Economics (LSE)'],
    groups: {
      'Undergraduate (BS/Bachelor)':
        'BS Economics with Double Majors in Finance Data Analytics and Mathematics, BBA, BS Social Sciences, BS Media Studies, BS Environmental Science',
      'Graduate (MS/MPhil/PhD)':
        'MS Economics, MPhil Economics, PhD Economics, MS Business Administration, MPhil Business Administration, PhD Business Administration, MS Development Studies, MPhil Development Studies, PhD Development Studies',
    },
  },
  {
    matchNames: ['University of Management and Technology (UMT)'],
    groups: {
      'Undergraduate (BS)':
        'BS Computer Science, BS Software Engineering, BS Information Technology, BS Artificial Intelligence, BS Cyber Security, BS Data Science, BS Gaming and Immersive Media, BS Aviation Management, Doctor of Physical Therapy (DPT), BS Nutrition, BS Fashion and Textile Design',
      'Graduate (MS/PhD)':
        'MS or PhD in Engineering, MS or PhD in Management, MS or PhD in Psychology, MS or PhD in Education, MS or PhD in Textiles, MS or PhD in Media and Communication',
    },
  },
  {
    matchNames: ['Superior University'],
    groups: {
      'Undergraduate (BS)':
        'BS Robotics, BS Internet of Things, BS Gaming and Animation, BS Applied Computing, BS Aviation Engineering, MBBS, Pharm-D, B.Arch, BS Graphic Design',
      'Graduate (MS/PhD)':
        'MS Business Analytics, MS Project Management, MS Clinical Psychology, MS Electrical Engineering',
    },
  },
  {
    matchNames: ['Foundation University Islamabad'],
    groups: {
      'Undergraduate (BS)':
        'BS Psychology, BS English, BS Media and Communication, MBBS, BDS, BS Nursing, BS Software Engineering, BS Electrical Engineering, BS Computer Engineering, BS Aviation Management',
      'Graduate (MS/PhD)':
        'MS Computer Science, MS Software Engineering, MS Finance, MS English, MS Psychology',
    },
  },
  {
    matchNames: ['Virtual University of Pakistan'],
    groups: {
      'Undergraduate (BS)':
        'BS Computer Science, BS Information Technology, BS Software Engineering, BS Data Science, BS Bioinformatics, BS Biotechnology, BS Psychology, BS Commerce, B.Ed (Hons)',
      'Graduate (MS/MBA)':
        'MS Computer Science, MS Computer Science with Software Engineering and AI specialization, MBA, MS Applied Linguistics',
    },
  },
  {
    matchNames: ['University of Baltistan, Skardu'],
    groups: {
      'Undergraduate (BS)':
        'BS Biological Sciences, BS Geosciences, BS Environmental Science, BS Medical Laboratory Technology (MLT), BS Public Health, BS Tourism and Hospitality, BS English, BS Business Management',
      'Graduate (MS/MPhil)':
        'MS Business Management, MPhil Business Management, MS Education, MPhil Education, MS English, MPhil English with Regional Development focus',
    },
  },
];
