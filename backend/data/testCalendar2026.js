/**
 * 2026 Pakistan entry-test & admission milestones (curated from public notices:
 * UET Admissions ECAT, NTS NAT, HEC-style USAT/HAT tables, LAT/LAW-GAT schedules).
 * NET-3 / NET-4 windows per user note. MDCAT date per user note (verify PMC).
 * ALWAYS confirm on official portals before acting.
 */
const SOURCE_NOTE =
  'Compiled for student planning only. Official sites (UET, NTS, HEC, PMC, etc.) are final.';

/** UET Admissions — ECAT flow (screenshot: Admissions UET) */
const ECAT_UET_2026 = {
  id: 'ecat-uet-2026',
  title: 'ECAT — UET Punjab (2026 session)',
  fee: 'Rs. 3,000',
  steps: [
    {
      step: 1,
      title: 'Generate challan / token',
      detail: 'Pay challan online to enroll.',
      lastDate: 'Mar 24, 2026',
      action: 'Generate fee challan',
    },
    {
      step: 2,
      title: 'Fill application',
      detail: 'Complete the application form.',
      lastDate: 'Mar 24, 2026',
      action: 'Fill application',
    },
    {
      step: 3,
      title: 'Print admit card',
      detail: 'Download and print your roll slip.',
      lastDate: 'Mar 26, 2026',
      action: 'Print roll slip',
    },
    {
      step: 4,
      title: 'Appear in exam',
      detail: 'ECAT as per date, time and venue on admit card.',
      lastDate: 'Mar 30 – Apr 3, 2026',
      action: 'View exam guide',
    },
    {
      step: 5,
      title: 'Result — ECAT',
      detail: 'Check official UET admissions portal.',
      lastDate: 'Apr 17, 2026',
      action: null,
    },
  ],
};

/** NUST NET — user-supplied windows (verify nust.edu.pk) */
const NUST_NET_2026 = [
  { series: 'NET-3', window: 'April 2026', note: 'Confirm registration series on NUST site.' },
  { series: 'NET-4', window: 'June – July 2026', note: 'Confirm registration series on NUST site.' },
];

/** MDCAT — user-supplied expected date (verify PMC) */
const MDCAT_2026 = {
  expectedTestDate: 'October 26, 2026',
  note: 'Expected date — confirm syllabus, registration and final schedule on official PMC / provincial portals.',
};

/** NTS NAT 2026 — column keys match table headers */
const NAT_COLUMN_KEYS = [
  'testDate',
  'announcementDate',
  'registrationLast',
  'lateFeeLast',
  'rollSlipDate',
  'resultDate',
];

const NAT_2026_ROWS = [
  {
    name: 'NAT-I',
    testDate: 'Sun, Jan 18, 2026',
    announcementDate: 'Mon, Dec 22, 2025',
    registrationLast: 'Mon, Jan 5, 2026',
    lateFeeLast: 'Sun, Jan 11, 2026',
    rollSlipDate: 'Tue, Jan 13, 2026',
    resultDate: 'Mon, Jan 26, 2026',
  },
  {
    name: 'NAT-II',
    testDate: 'Sun, Feb 15, 2026',
    announcementDate: 'Mon, Jan 19, 2026',
    registrationLast: 'Mon, Feb 2, 2026',
    lateFeeLast: 'Sun, Feb 8, 2026',
    rollSlipDate: 'Tue, Feb 10, 2026',
    resultDate: 'Mon, Feb 23, 2026',
  },
  {
    name: 'NAT-III',
    testDate: 'Sun, Mar 15, 2026',
    announcementDate: 'Mon, Feb 16, 2026',
    registrationLast: 'Mon, Mar 2, 2026',
    lateFeeLast: 'Sun, Mar 8, 2026',
    rollSlipDate: 'Tue, Mar 10, 2026',
    resultDate: 'Mon, Mar 30, 2026',
  },
  {
    name: 'NAT-IV',
    testDate: 'Sun, Apr 12, 2026',
    announcementDate: 'Mon, Mar 16, 2026',
    registrationLast: 'Mon, Mar 30, 2026',
    lateFeeLast: 'Sun, Apr 5, 2026',
    rollSlipDate: 'Tue, Apr 7, 2026',
    resultDate: 'Mon, Apr 20, 2026',
  },
  {
    name: 'NAT-V',
    testDate: 'Sun, May 10, 2026',
    announcementDate: 'Mon, Apr 13, 2026',
    registrationLast: 'Mon, Apr 27, 2026',
    lateFeeLast: 'Sun, May 3, 2026',
    rollSlipDate: 'Tue, May 5, 2026',
    resultDate: 'Mon, May 18, 2026',
  },
  {
    name: 'NAT-VI',
    testDate: 'Sun, Jun 14, 2026',
    announcementDate: 'Mon, May 11, 2026',
    registrationLast: 'Mon, May 25, 2026',
    lateFeeLast: 'Mon, Jun 2, 2026',
    rollSlipDate: 'Mon, Jun 8, 2026',
    resultDate: 'Mon, Jun 22, 2026',
  },
  {
    name: 'NAT-VII',
    testDate: 'Sun, Jul 12, 2026',
    announcementDate: 'Mon, Jun 15, 2026',
    registrationLast: 'Mon, Jun 29, 2026',
    lateFeeLast: 'Sun, Jul 5, 2026',
    rollSlipDate: 'Tue, Jul 7, 2026',
    resultDate: 'Mon, Jul 20, 2026',
  },
  {
    name: 'NAT-VIII',
    testDate: 'Sun, Aug 9, 2026',
    announcementDate: 'Mon, Jul 13, 2026',
    registrationLast: 'Mon, Jul 27, 2026',
    lateFeeLast: 'Sun, Aug 2, 2026',
    rollSlipDate: 'Tue, Aug 4, 2026',
    resultDate: 'Mon, Aug 17, 2026',
  },
  {
    name: 'NAT-IX',
    testDate: 'Sun, Sep 13, 2026',
    announcementDate: 'Mon, Aug 10, 2026',
    registrationLast: 'Mon, Aug 24, 2026',
    lateFeeLast: 'Sun, Aug 30, 2026',
    rollSlipDate: 'Tue, Sep 1, 2026',
    resultDate: 'Mon, Sep 21, 2026',
  },
  {
    name: 'NAT-X',
    testDate: 'Sun, Oct 11, 2026',
    announcementDate: 'Mon, Sep 14, 2026',
    registrationLast: 'Mon, Sep 21, 2026',
    lateFeeLast: 'Sun, Sep 27, 2026',
    rollSlipDate: 'Tue, Sep 29, 2026',
    resultDate: 'Mon, Oct 19, 2026',
  },
  {
    name: 'NAT-XI',
    testDate: 'Sun, Nov 15, 2026',
    announcementDate: 'Mon, Oct 12, 2026',
    registrationLast: 'Mon, Oct 19, 2026',
    lateFeeLast: 'Sun, Oct 25, 2026',
    rollSlipDate: 'Tue, Oct 27, 2026',
    resultDate: 'Mon, Nov 23, 2026',
  },
  {
    name: 'NAT-XII',
    testDate: 'Sun, Dec 13, 2026',
    announcementDate: 'Mon, Nov 16, 2026',
    registrationLast: 'Mon, Dec 7, 2026',
    lateFeeLast: 'Sun, Dec 13, 2026',
    rollSlipDate: 'Tue, Dec 15, 2026',
    resultDate: 'Mon, Dec 21, 2026',
  },
];

const LAT_LABELS = ['announcement', 'registrationLast', 'rollSlip', 'testDate', 'resultDate'];

const LAT_2026 = [
  { cycle: 1, announcement: '14.12.2025', registrationLast: '29.12.2025', rollSlip: '14.01.2026', testDate: '25.01.2026', resultDate: '05.03.2026' },
  { cycle: 2, announcement: '08.03.2026', registrationLast: '22.03.2026', rollSlip: '03.04.2026', testDate: '12.04.2026', resultDate: '22.05.2026' },
  { cycle: 3, announcement: '10.05.2026', registrationLast: '25.05.2026', rollSlip: '11.06.2026', testDate: '21.06.2026', resultDate: '03.08.2026' },
  { cycle: 4, announcement: '26.07.2026', registrationLast: '10.08.2026', rollSlip: '28.08.2026', testDate: '06.09.2026', resultDate: '16.10.2026' },
  { cycle: 5, announcement: '04.10.2026', registrationLast: '20.10.2026', rollSlip: '06.11.2026', testDate: '15.11.2026', resultDate: '24.12.2026' },
];

const LAW_GAT_2026 = [
  { cycle: 1, announcement: '15.02.2026', registrationLast: '03.03.2026', rollSlip: '25.03.2026', testDate: '05.04.2026', resultDate: '23.04.2026' },
  { cycle: 2, announcement: '05.07.2026', registrationLast: '19.07.2026', rollSlip: '31.07.2026', testDate: '09.08.2026', resultDate: '28.08.2026' },
  { cycle: 3, announcement: '13.09.2026', registrationLast: '27.09.2026', rollSlip: '09.10.2026', testDate: '18.10.2026', resultDate: '06.11.2026' },
  { cycle: 4, announcement: '15.11.2026', registrationLast: '29.11.2026', rollSlip: '11.12.2026', testDate: '20.12.2026', resultDate: '31.12.2026' },
];

const HEC_CYCLE_LABELS = ['announcement', 'col2', 'col3', 'testDate', 'resultDate'];

const USAT_2026 = [
  { cycle: 1, announcement: '07.12.2025', col2: '15.01.2026', col3: '26.01.2026', testDate: '01.02.2026', resultDate: '20.02.2026' },
  { cycle: 2, announcement: '15.03.2026', col2: '30.03.2026', col3: '10.04.2026', testDate: '19.04.2026', resultDate: '19.05.2026' },
  { cycle: 3, announcement: '17.05.2026', col2: '07.06.2026', col3: '19.06.2026', testDate: '05.07.2026', resultDate: '05.08.2026' },
  { cycle: 4, announcement: '30.08.2026', col2: '20.09.2026', col3: '02.10.2026', testDate: '11.10.2026', resultDate: '06.11.2026' },
  { cycle: 5, announcement: '08.11.2026', col2: '22.11.2026', col3: '04.12.2026', testDate: '13.12.2026', resultDate: '31.12.2026' },
];

const HAT_2026 = [
  { cycle: 1, announcement: '07.12.2025', col2: '15.01.2026', col3: '26.01.2026', testDate: '01.02.2026', resultDate: '20.02.2026' },
  { cycle: 2, announcement: '15.03.2026', col2: '30.03.2026', col3: '10.04.2026', testDate: '19.04.2026', resultDate: '08.05.2026' },
  { cycle: 3, announcement: '17.05.2026', col2: '07.06.2026', col3: '19.06.2026', testDate: '05.07.2026', resultDate: '31.07.2026' },
  { cycle: 4, announcement: '30.08.2026', col2: '20.09.2026', col3: '02.10.2026', testDate: '11.10.2026', resultDate: '06.11.2026' },
  { cycle: 5, announcement: '08.11.2026', col2: '22.11.2026', col3: '04.12.2026', testDate: '13.12.2026', resultDate: '31.12.2026' },
];

const TEST_CALENDAR_2026 = {
  year: 2026,
  sourceNote: SOURCE_NOTE,
  ecatUet: ECAT_UET_2026,
  mdcat: MDCAT_2026,
  nustNet: NUST_NET_2026,
  nat: {
    title: 'NTS — NAT 2026',
    columnLabels: {
      testDate: 'Test date',
      announcementDate: 'Announcement',
      registrationLast: 'Registration last date',
      lateFeeLast: 'Late fee closing',
      rollSlipDate: 'E. roll slip',
      resultDate: 'Result',
    },
    columnKeys: NAT_COLUMN_KEYS,
    rows: NAT_2026_ROWS,
  },
  lat: {
    title: 'Law Admission Test (LAT) 2026',
    columnLabels: {
      announcement: 'Announcement',
      registrationLast: 'Registration last',
      rollSlip: 'Roll slip',
      testDate: 'Test date',
      resultDate: 'Result',
    },
    labels: LAT_LABELS,
    rows: LAT_2026,
  },
  lawGat: {
    title: 'LAW-GAT 2026',
    columnLabels: {
      announcement: 'Announcement',
      registrationLast: 'Registration last',
      rollSlip: 'Roll slip',
      testDate: 'Test date',
      resultDate: 'Result',
    },
    labels: LAT_LABELS,
    rows: LAW_GAT_2026,
  },
  usat: {
    title: 'USAT (undergraduate) 2026 — HEC schedule',
    note: 'Five milestone dates per cycle (see HEC portal for exact labels).',
    columnLabels: {
      announcement: 'Date 1',
      col2: 'Date 2',
      col3: 'Date 3',
      testDate: 'Date 4 (test)',
      resultDate: 'Date 5 (result)',
    },
    labels: HEC_CYCLE_LABELS,
    rows: USAT_2026,
  },
  hat: {
    title: 'HAT (MS / MPhil / PhD) 2026 — HEC schedule',
    note: 'Same structure as USAT; cycles 2 & 3 result dates differ from USAT per official table.',
    columnLabels: {
      announcement: 'Date 1',
      col2: 'Date 2',
      col3: 'Date 3',
      testDate: 'Date 4 (test)',
      resultDate: 'Date 5 (result)',
    },
    labels: HEC_CYCLE_LABELS,
    rows: HAT_2026,
  },
};

module.exports = {
  TEST_CALENDAR_2026,
  SOURCE_NOTE,
};
