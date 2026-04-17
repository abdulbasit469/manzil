import { stripNotSpecifiedFromUniversityName } from './meritUniversityInference';

/** Percent weights for numeric aggregate (test + intermediate + matric), sum = 100 */
export type MeritCalcWeights = { test: number; intermediate: number; matric: number };

export type ResolvedUniversityMeritRule = {
  tests: string[];
  weights: MeritCalcWeights;
  maxMarks?: number;
  officialLine: string;
  entryTestOptional?: boolean;
  intermediateHint?: string;
  disclaimer?: string;
};

type InternalRule = ResolvedUniversityMeritRule & {
  match: (n: string, raw: string) => boolean;
};

const w = (test: number, intermediate: number, matric: number): MeritCalcWeights => ({
  test,
  intermediate,
  matric,
});

/**
 * Ordered most-specific first. Only universities still in your app DB should match;
 * deleted rows (e.g. Iqra National, Sarhad, Nipas) simply never match.
 * Non-numeric policies (interview-only, holistic) use a stated numeric proxy + disclaimer.
 */
const MERIT_RULES: InternalRule[] = [
  {
    match: (n) => n.includes('virtual university'),
    tests: ['NAT'],
    weights: w(0, 50, 50),
    officialLine: 'Virtual University of Pakistan — open merit (no entry test).',
    entryTestOptional: true,
    disclaimer:
      'Official policy: 100% academic (HSSC/SSC). Here: 50% intermediate + 50% matric as a numeric proxy; entry test marks are ignored.',
  },
  {
    match: (n) => n.includes('medical college') && n.includes('quaid'),
    tests: ['MDCAT'],
    weights: w(50, 40, 10),
    maxMarks: 200,
    officialLine: 'Quaid-i-Azam University — Medical College: MDCAT 50% + FSc/Intermediate 40% + Matric 10%.',
  },
  {
    match: (n) => n.includes('aga khan'),
    tests: ['SAT'],
    weights: w(100, 0, 0),
    maxMarks: 1600,
    officialLine: 'Aga Khan University: AKU Admission Test used for shortlisting; interview follows.',
    disclaimer:
      'Official aggregate includes interview and is not a simple % formula. Numeric mode: 100% weight on test marks (SAT scale as proxy — confirm on AKU admissions).',
  },
  {
    match: (n) => n.includes('fast') && n.includes('national university'),
    tests: ['NET'],
    weights: w(50, 50, 0),
    maxMarks: 200,
    officialLine: 'FAST-NUCES: NU Admission Test 50% + HSSC Part-I 50% (no matric in this aggregate).',
    intermediateHint: 'Use your Part-I (or combined Part-I + Part-II) marks as one intermediate percentage.',
  },
  {
    match: (n) => n.includes('information technology university'),
    tests: ['SAT'],
    weights: w(50, 50, 0),
    maxMarks: 1600,
    officialLine: 'ITU: ITU Admissions Test / SAT — 50% test + 50% HSSC Part-I (proxy uses SAT scale for multi-test path).',
    intermediateHint: 'Enter HSSC Part-I (or your best single-year intermediate %) as intermediate.',
    disclaimer:
      'If you sat the ITU test only, pick the closest calculator test and max marks from your scorecard; SAT is a stand-in when using multi-test mode.',
  },
  {
    match: (n) => n.includes('dow university'),
    tests: ['MDCAT'],
    weights: w(50, 40, 10),
    maxMarks: 200,
    officialLine: 'Dow University of Health Sciences (DUHS): MDCAT / Dow aptitude aggregate 50% + 40% + 10%.',
  },
  {
    match: (n) => n.includes('ibrahim medical'),
    tests: ['MDCAT'],
    weights: w(50, 40, 10),
    maxMarks: 200,
    officialLine: 'Ibrahim Medical College: MDCAT 50% + HSSC 40% + Matric 10%.',
  },
  {
    match: (n) => n.includes('khyber medical'),
    tests: ['MDCAT'],
    weights: w(50, 40, 10),
    maxMarks: 200,
    officialLine: 'Khyber Medical University (KMU): MDCAT / ETEA-style medical aggregate 50% + 40% + 10%.',
  },
  {
    match: (n) => n.includes('liaquat university') && n.includes('medical'),
    tests: ['MDCAT'],
    weights: w(50, 40, 10),
    maxMarks: 200,
    officialLine: 'Liaquat University of Medical & Health Sciences (LUMHS): MDCAT 50% + 40% + 10%.',
  },
  {
    match: (n) => n.includes('nishtar'),
    tests: ['MDCAT'],
    weights: w(50, 40, 10),
    maxMarks: 200,
    officialLine: 'Nishtar Medical University: MDCAT 50% + HSSC 40% + Matric 10%.',
  },
  {
    match: (n) => n.includes('shaheed zulfiqar ali bhutto medical'),
    tests: ['MDCAT'],
    weights: w(50, 40, 10),
    maxMarks: 200,
    officialLine: 'SZAB Medical University: MDCAT 50% + 40% + 10%.',
  },
  {
    match: (n) => n.includes('shifa tameer'),
    tests: ['MDCAT'],
    weights: w(50, 50, 0),
    maxMarks: 200,
    officialLine: 'Shifa Tameer-e-Millat University: Shifa entrance / MDCAT — 50% test + 50% academic (intermediate as academic proxy).',
    disclaimer: 'Program-wise formula may differ; confirm on Shifa admissions.',
  },
  {
    match: (n) => n.includes('ziauddin'),
    tests: ['MDCAT'],
    weights: w(50, 50, 0),
    maxMarks: 200,
    officialLine: 'Ziauddin University: ZU admission / MDCAT — 50% test + 50% academic (intermediate as academic proxy).',
  },
  {
    match: (n) => n.includes('university of health sciences') && n.includes('lahore'),
    tests: ['MDCAT'],
    weights: w(50, 40, 10),
    maxMarks: 200,
    officialLine: 'University of Health Sciences (UHS) Lahore: MDCAT 50% + 40% + 10%.',
  },
  {
    match: (n) => n.includes('quaid-i-azam university') && !n.includes('medical college'),
    tests: ['NAT'],
    weights: w(30, 56, 14),
    maxMarks: 100,
    officialLine: 'Quaid-i-Azam University (QAU): QAU entry test 30% + academic 70% (split as 56% intermediate + 14% matric).',
  },
  {
    match: (n) => n.includes('government college university') || n.includes('gcu lahore'),
    tests: ['NAT'],
    weights: w(50, 40, 10),
    maxMarks: 100,
    officialLine: 'GCU Lahore: GCU entry test 50% + HSSC 40% + interview/other 10% shown as matric slot (proxy).',
    disclaimer: 'Interview weight is merged into the 10% “matric” slot for a numeric estimate only.',
  },
  {
    match: (n) => n.includes('giki') || n.includes('ghulam ishaq khan institute'),
    tests: ['GIKI'],
    weights: w(85, 15, 0),
    maxMarks: 200,
    officialLine: 'GIKI: admission test 85% + HSSC/SSC combined 15%.',
  },
  {
    match: (n) => n.includes('pieas'),
    tests: ['PIEAS'],
    weights: w(60, 25, 15),
    maxMarks: 200,
    officialLine: 'PIEAS: admission test 60% + HSSC 25% + Matric 15%.',
  },
  {
    match: (n) => n.includes('nust') || n.includes('national university of sciences'),
    tests: ['NET', 'SAT'],
    weights: w(75, 15, 10),
    officialLine: 'NUST: NET / SAT / ACT — aggregate 75% test + 15% HSSC + 10% matric (NET scale shown; switch card for SAT).',
    disclaimer: 'SAT/ACT use the SAT card max (1600); normalize your score to % before entering.',
  },
  {
    match: (n) => n.includes('uet lahore'),
    tests: ['ECAT'],
    weights: w(33, 50, 17),
    maxMarks: 400,
    officialLine: 'UET Lahore: ECAT 33% + Intermediate 50% + Matric 17%.',
  },
  {
    match: (n) => n.includes('uet') && n.includes('taxila'),
    tests: ['ECAT'],
    weights: w(33, 50, 17),
    maxMarks: 400,
    officialLine: 'UET Taxila: ECAT 33% + Intermediate 50% + Matric 17%.',
  },
  {
    match: (n) => n.includes('uet') && n.includes('peshawar'),
    tests: ['NAT'],
    weights: w(50, 40, 10),
    maxMarks: 100,
    officialLine: 'UET Peshawar: ETEA engineering aggregate 50% + 40% + 10% (NAT card used for 100-max test proxy).',
    disclaimer: 'ETEA max marks differ by year; convert your test to % out of 100 before entering.',
  },
  {
    match: (n) => n.includes('chakwal'),
    tests: ['ECAT', 'NAT'],
    weights: w(33, 50, 17),
    officialLine: 'University of Chakwal: UET ECAT / self test — 33% + 50% + 17% when using ECAT path.',
    disclaimer: 'If you use the “self test” path, confirm weights on the official prospectus.',
  },
  {
    match: (n) => n.includes('ned'),
    tests: ['ECAT'],
    weights: w(50, 50, 0),
    maxMarks: 200,
    officialLine: 'NED University: NED entry test 50% + HSSC 50%.',
    disclaimer: 'NED test is out of a fixed total that changes; use your % score × 200 as obtained marks if needed.',
  },
  {
    match: (n) => n.includes('national textile'),
    tests: ['NAT', 'ECAT'],
    weights: w(45, 45, 10),
    officialLine: 'National Textile University (NTU): 45% test + 45% HSSC + 10% matric (NAT/NTU test path).',
    disclaimer: 'ECAT path may use different max marks; prefer your official % on the test.',
  },
  {
    match: (n) => n.includes('institute of space technology') || n.includes('inst. of space technology'),
    tests: ['NAT', 'SAT', 'ECAT'],
    weights: w(40, 40, 20),
    officialLine: 'IST: NAT / SAT / ECAT — 40% test + 40% HSSC + 20% matric.',
    disclaimer: 'Pick the test card you actually sat; each uses its usual max marks.',
  },
  {
    match: (n) => n.includes('iqra university') && !n.includes('national'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'Iqra University: Iqra admission test 50% + academic 50% (intermediate as academic proxy).',
  },
  {
    match: (n) => n.includes('pucit') || n.includes('punjab university college of information technology'),
    tests: ['NAT'],
    weights: w(25, 75, 0),
    maxMarks: 100,
    officialLine: 'PUCIT: PU entry test 25% + academic 75% (HSSC / combined academic in the intermediate slot; matric not in this 75%).',
    intermediateHint:
      'Enter your official “academic” percentage as intermediate obtained vs total if PU publishes a single academic %; otherwise use your HSSC aggregate here.',
  },
  {
    match: (n) =>
      n.includes('university of the punjab') && !n.includes('pucit') && !n.includes('college of information'),
    tests: ['NAT'],
    weights: w(25, 75, 0),
    maxMarks: 100,
    officialLine: 'PU entry test: 25% test + 75% academic (HSSC / combined academic in the intermediate slot; matric not weighted separately in this row).',
    intermediateHint:
      'Use your PU prospectus “academic” % as one intermediate percentage when the university gives a single combined figure.',
  },
  {
    match: (n) => n.includes('forman christian'),
    tests: ['SAT'],
    weights: w(50, 50, 0),
    maxMarks: 1600,
    officialLine: 'Forman Christian College (FCC): FEAT 50% + HSSC 50% (SAT scale as multi-test proxy).',
    disclaimer: 'FEAT has its own scale; convert to a percentage and map carefully to your scorecard.',
  },
  {
    match: (n) => n.includes('iba') && n.includes('karachi'),
    tests: ['SAT'],
    weights: w(50, 35, 15),
    maxMarks: 1600,
    officialLine: 'IBA Karachi: aptitude / interview / academic (numeric proxy 50% test + 35% inter + 15% matric).',
    disclaimer: 'Official process is pass/fail aptitude plus interview; this is only a rough numeric illustration.',
  },
  {
    match: (n) => n.includes('lums'),
    tests: ['SAT'],
    weights: w(40, 45, 15),
    maxMarks: 1600,
    officialLine: 'LUMS: LCAT / SAT / ACT holistic policy (numeric proxy 40% test + 45% inter + 15% matric).',
    disclaimer: 'LUMS uses holistic review; weights are an approximation for calculator use only.',
  },
  {
    match: (n) => n.includes('lahore school of economics'),
    tests: ['SAT'],
    weights: w(40, 40, 20),
    maxMarks: 1600,
    officialLine: 'LSE: entrance / SAT + academic + interview (numeric proxy 40/40/20).',
    disclaimer: 'Interview and qualitative factors are folded into weights approximately.',
  },
  {
    match: (n) => n.includes('institute of business and management') || n.includes('iobm'),
    tests: ['SAT'],
    weights: w(40, 40, 20),
    maxMarks: 1600,
    officialLine: 'IoBM: aptitude + HSSC + interview (numeric proxy 40/40/20).',
    disclaimer: 'Official weights are not public as a single formula; confirm with IoBM.',
  },
  {
    match: (n) => n.includes('institute of management sciences') || n.includes('imsciences'),
    tests: ['NAT', 'SAT'],
    weights: w(40, 50, 10),
    officialLine: 'IMSciences: entry test / SAT — 40% + 50% + 10%.',
  },
  {
    match: (n) => n.includes('comsats'),
    tests: ['NAT'],
    weights: w(50, 40, 10),
    maxMarks: 100,
    officialLine: 'COMSATS University: NTS NAT aggregate 50% + 40% + 10%.',
  },
  {
    match: (n) => n.includes('air university'),
    tests: ['NAT'],
    weights: w(50, 40, 10),
    maxMarks: 100,
    officialLine: 'Air University: AUET / NAT — 50% + 40% + 10% (NAT path as default).',
  },
  {
    match: (n) => n.includes('bahria university'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'Bahria University: BUET (CBT) 50% test + 50% academic (HSSC/SSC combined as intermediate proxy).',
  },
  {
    match: (n) => n.includes('islamic international university') || n.includes('iub - islamic'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'IIUI / IUB (Islamabad): IIUI entry / NAT — 40% test + 60% academic (48% + 12%).',
  },
  {
    match: (n) => n.includes('hazara university'),
    tests: ['NAT'],
    weights: w(40, 50, 10),
    maxMarks: 100,
    officialLine: 'Hazara University: NAT / departmental test — 40% + 50% + 10%.',
  },
  {
    match: (n) => n.includes('health services academy'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'Health Services Academy (HSA): HSA entry test 50% + academic 50% (intermediate as academic proxy).',
  },
  {
    match: (n) => n.includes('imperial college of business'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'Imperial College of Business Studies: self test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('karachi institute of economics') || n.includes('kiet'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'KIET: KIET aptitude test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('numl'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'NUML: NUML entrance test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('pide'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'PIDE: PIDE entrance test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('riphah'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'Riphah International University: Riphah entry test / alternate paths — 50% test + 50% academic.',
  },
  {
    match: (n) => n.includes('shaheed benazir bhutto women university'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'Shaheed Benazir Bhutto Women University (Peshawar): ETEA / self test — 40% + 60% academic.',
  },
  {
    match: (n) =>
      n.includes('shaheed benazir bhutto') &&
      (n.includes('dir') || n.includes('sheringal') || n.includes('sharingal')),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'Shaheed Benazir Bhutto University (Dir): ETEA / self test — 50% test + 50% academic.',
  },
  {
    match: (n) => n.includes('shaheed benazir bhutto university') && n.includes('shaheed benazirabad'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'Shaheed Benazir Bhutto University (main campus): SBBU entry — 40% + 60% academic.',
  },
  {
    match: (n) => n.includes('superior university'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'Superior University: Superior admission test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('university of faisalabad') || (n.includes('tuf') && n.includes('faisalabad')),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'The University of Faisalabad (TUF): TUF entry test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('azad jammu'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'University of Azad Jammu & Kashmir: UAJK entry — 40% + 60% academic.',
  },
  {
    match: (n) => n.includes('university of balochistan'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'University of Balochistan: UOB entry test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('baltistan') || n.includes('skardu'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'University of Baltistan, Skardu: UOBS entry — 40% + 60% academic.',
  },
  {
    match: (n) => n.includes('central punjab') || (n.includes('ucp') && n.includes('punjab')),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'University of Central Punjab (UCP): UCP admission test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('dera ghazi'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'University of Dera Ghazi Khan: DGU / NAT — 40% + 60% academic.',
  },
  {
    match: (n) => n.includes('university of education'),
    tests: ['NAT'],
    weights: w(25, 75, 0),
    maxMarks: 100,
    officialLine: 'University of Education: UE entry test 25% + academic 75% (same structure as PU entry row: academic in intermediate slot).',
  },
  {
    match: (n) => n.includes('university of gujrat'),
    tests: ['NAT'],
    weights: w(20, 64, 16),
    maxMarks: 100,
    officialLine: 'University of Gujrat (UOG): UOG entry — 20% test + 80% academic (64% + 16%).',
  },
  {
    match: (n) => n.includes('university of gwadar'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'University of Gwadar: UG entry — 40% + 60% academic.',
  },
  {
    match: (n) => n.includes('university of haripur'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'University of Haripur: UOH / ETEA — 40% + 60% academic.',
  },
  {
    match: (n) => n.includes('university of karachi') && !n.includes('ned'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'University of Karachi: KU aptitude test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('university of lahore'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'University of Lahore (UOL): UOL entry test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('university of malakand'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'University of Malakand: UOM / ETEA — 40% + 60% academic.',
  },
  {
    match: (n) =>
      (n.includes('management and technology') && n.includes('umt')) ||
      n.includes('university of management and technology'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'UMT Lahore: UMT admission test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('university of peshawar') && !n.includes('women'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'University of Peshawar: UOP / ETEA — 40% + 60% academic.',
  },
  {
    match: (n) => n.includes('university of sahiwal'),
    tests: ['NAT'],
    weights: w(30, 56, 14),
    maxMarks: 100,
    officialLine: 'University of Sahiwal: US entry / NAT — 30% + 70% academic.',
  },
  {
    match: (n) => n.includes('university of sargodha'),
    tests: ['NAT'],
    weights: w(25, 75, 0),
    maxMarks: 100,
    officialLine: 'University of Sargodha: UOS entry test 25% + academic 75% (academic in intermediate slot).',
  },
  {
    match: (n) => n.includes('university of sialkot'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'University of Sialkot: USKT entry test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('university of sindh'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'University of Sindh: entry test — 40% + 60% academic.',
  },
  {
    match: (n) => n.includes('university of swat'),
    tests: ['NAT'],
    weights: w(40, 48, 12),
    maxMarks: 100,
    officialLine: 'University of Swat: UOSwat / ETEA — 40% + 60% academic.',
  },
  {
    match: (n) => n.includes('university of turbat'),
    tests: ['NAT'],
    weights: w(50, 50, 0),
    maxMarks: 100,
    officialLine: 'University of Turbat: UOT entry test 50% + academic 50%.',
  },
  {
    match: (n) => n.includes('veterinary') && (n.includes('ryk') || n.includes('rahim')),
    tests: ['NAT'],
    weights: w(50, 40, 10),
    maxMarks: 100,
    officialLine: 'UVAS (Rahim Yar Khan): UVAS entry test 50% + HSSC 40% + matric 10% (NAT card as test proxy).',
    disclaimer: 'Convert your UVAS test score to an equivalent out of 100 if your scorecard uses a different total.',
  },
  {
    match: (n) => n.includes('veterinary') && n.includes('uvas'),
    tests: ['NAT'],
    weights: w(50, 40, 10),
    maxMarks: 100,
    officialLine: 'UVAS Lahore: UVAS entry test 50% + HSSC 40% + matric 10% (NAT card as test proxy).',
    disclaimer: 'Convert your UVAS test score to an equivalent out of 100 if your scorecard uses a different total.',
  },
  {
    match: (n) => n.includes('islamia university of bahawalpur'),
    tests: ['NAT'],
    weights: w(30, 56, 14),
    maxMarks: 100,
    officialLine: 'The Islamia University of Bahawalpur: IUB admission / NAT — 30% + 70% academic.',
  },
];

export function getUniversityMeritRule(universityName: string): ResolvedUniversityMeritRule | null {
  const raw = stripNotSpecifiedFromUniversityName(universityName).trim();
  if (!raw) return null;
  const n = raw.toLowerCase();
  for (const row of MERIT_RULES) {
    if (row.match(n, raw)) {
      const { match: _m, ...rest } = row;
      return rest;
    }
  }
  return null;
}
