/**
 * Curated timelines for Pakistan admissions & entry tests (indicative).
 * Shown on student dashboard — always with disclaimer to verify officially.
 */
const DISCLAIMER =
  'Dates change every year. Confirm on official university, HEC, or test body websites.';

const UPCOMING_ADMISSION_WINDOWS = [
  {
    id: 'fall-bs',
    title: 'Fall undergraduate admissions',
    typicalPeriod: 'July – October',
    detail: 'Most public and private universities open BS/BBA/BE admissions for fall intake.',
  },
  {
    id: 'spring-bs',
    title: 'Spring admissions (selected universities)',
    typicalPeriod: 'December – February',
    detail: 'Some institutions offer a spring semester; intake is smaller than fall.',
  },
  {
    id: 'medical',
    title: 'Medical & dental colleges',
    typicalPeriod: 'After MDCAT',
    detail: 'Centralized or provincial merit lists follow MDCAT. Watch PMC and provincial portals.',
  },
  {
    id: 'engineering-public',
    title: 'Public-sector engineering (e.g. UET)',
    typicalPeriod: 'June – August',
    detail: 'ECAT and provincial engineering admissions usually peak in summer.',
  },
];

const UPCOMING_ENTRY_TESTS = [
  {
    id: 'mdcat',
    name: 'MDCAT 2026',
    typicalPeriod: 'Expected Oct 26, 2026 (confirm PMC)',
    body: 'PMC / provincial medical admission authorities',
    manzilTip: 'Full milestone table on dashboard below. Use Degree & Career Scope + Mock Test for prep.',
  },
  {
    id: 'ecat',
    name: 'ECAT (UET Punjab)',
    typicalPeriod: '2026: challan/app by Mar 24; exam Mar 30 – Apr 3',
    body: 'UET Admissions portal — fee Rs. 3,000 (verify)',
    manzilTip: 'Step-by-step ECAT card on dashboard; confirm on official UET site.',
  },
  {
    id: 'nts',
    name: 'NTS NAT 2026',
    typicalPeriod: 'NAT-I through NAT-XII (see dashboard table)',
    body: 'National Testing Service — National Aptitude Test',
    manzilTip: 'Scroll to NAT table on dashboard for all registration & test dates.',
  },
  {
    id: 'nust-net',
    name: 'NUST NET',
    typicalPeriod: 'NET-3 ~Apr 2026 · NET-4 ~Jun–Jul 2026',
    body: 'National University of Sciences & Technology',
    manzilTip: 'Confirm series registration on nust.edu.pk.',
  },
  {
    id: 'usat',
    name: 'USAT (HEC undergraduate)',
    typicalPeriod: 'As announced by HEC',
    body: 'Higher Education Commission',
    manzilTip: 'See HEC website for eligibility and schedule.',
  },
  {
    id: 'lat-law',
    name: 'LAT & LAW-GAT',
    typicalPeriod: 'Multiple cycles in 2026 (dashboard tables)',
    body: 'Law admission & graduation assessment tests',
    manzilTip: 'See LAT / LAW-GAT sections on dashboard; verify on official legal education portals.',
  },
];

module.exports = {
  DISCLAIMER,
  UPCOMING_ADMISSION_WINDOWS,
  UPCOMING_ENTRY_TESTS,
};
