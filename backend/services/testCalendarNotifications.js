/**
 * Creates in-app Notification rows for upcoming test/admission milestones (from test calendar).
 * Idempotent via metadata.calendarEventId. Throttled per user (24h) to avoid DB load on 30s dashboard poll.
 */
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { TEST_CALENDAR_2026 } = require('../data/testCalendar2026');

const SYNC_THROTTLE_MS = 24 * 60 * 60 * 1000;
const lastRunByUser = new Map();
const HORIZON_DAYS = 120;
const MAX_NOTIFICATIONS = 22;

function parsePakDate(str) {
  if (!str || typeof str !== 'string') return null;
  const s = str.trim();
  const ddmm = s.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (ddmm) {
    const d = new Date(parseInt(ddmm[3], 10), parseInt(ddmm[2], 10) - 1, parseInt(ddmm[1], 10));
    return isNaN(d.getTime()) ? null : d;
  }
  const first = s.split(/\s*[–—]\s*/)[0].trim();
  const d = new Date(first);
  if (!isNaN(d.getTime())) return d;
  const d2 = new Date(s);
  return isNaN(d2.getTime()) ? null : d2;
}

function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

function collectCalendarEvents() {
  const cal = TEST_CALENDAR_2026;
  const out = [];

  (cal.ecatUet?.steps || []).forEach((s) => {
    let d = parsePakDate(s.lastDate);
    if (!d && s.step === 4) d = new Date(2026, 2, 30); // Mar 30, 2026 — ECAT exam window start
    if (!d) return;
    out.push({
      id: `cal_ecat_step${s.step}_2026`,
      title: `ECAT (UET): ${s.title}`,
      message: `Key date: ${s.lastDate}. ${s.detail}${s.action ? ` — ${s.action}.` : ''} Confirm on UET Admissions portal.`,
      date: d,
      urgent: s.step <= 2,
    });
  });

  const md = parsePakDate(cal.mdcat?.expectedTestDate);
  if (md) {
    out.push({
      id: 'cal_mdcat_test_2026',
      title: 'MDCAT 2026 — expected test day',
      message: `${cal.mdcat.expectedTestDate}. ${cal.mdcat.note}`,
      date: md,
      urgent: false,
    });
  }

  out.push({
    id: 'cal_nust_net3_2026',
    title: 'NUST NET-3 (April 2026)',
    message: 'Registration window typically in April — monitor nust.edu.pk for exact NET-3 series.',
    date: new Date(2026, 3, 1),
    urgent: false,
  });
  out.push({
    id: 'cal_nust_net4_2026',
    title: 'NUST NET-4 (June–July 2026)',
    message: 'Registration window typically June–July — monitor nust.edu.pk for NET-4 series.',
    date: new Date(2026, 5, 15),
    urgent: false,
  });

  (cal.nat?.rows || []).forEach((row) => {
    [['registrationLast', 'Registration deadline'], ['testDate', 'Test day']].forEach(([field, label]) => {
      const d = parsePakDate(row[field]);
      if (!d) return;
      out.push({
        id: `cal_nat_${row.name.replace(/[^a-z0-9]/gi, '')}_${field}_2026`,
        title: `NTS ${row.name}: ${label}`,
        message: `${label}: ${row[field]}. Roll slip ${row.rollSlipDate}, result ${row.resultDate}. Verify on NTS.`,
        date: d,
        urgent: field === 'registrationLast',
      });
    });
  });

  (cal.lat?.rows || []).forEach((r) => {
    const reg = parsePakDate(r.registrationLast);
    const test = parsePakDate(r.testDate);
    if (reg) {
      out.push({
        id: `cal_lat_${r.cycle}_reg_2026`,
        title: `LAT 2026 — cycle ${r.cycle} registration ends`,
        message: `Last registration ${r.registrationLast} (DD.MM.YYYY). Test ${r.testDate}. Verify official LAT notice.`,
        date: reg,
        urgent: true,
      });
    }
    if (test) {
      out.push({
        id: `cal_lat_${r.cycle}_test_2026`,
        title: `LAT 2026 — cycle ${r.cycle} test`,
        message: `Test date ${r.testDate}. Result ${r.resultDate}.`,
        date: test,
        urgent: false,
      });
    }
  });

  (cal.lawGat?.rows || []).forEach((r) => {
    const reg = parsePakDate(r.registrationLast);
    const test = parsePakDate(r.testDate);
    if (reg) {
      out.push({
        id: `cal_lawgat_${r.cycle}_reg_2026`,
        title: `LAW-GAT — cycle ${r.cycle} registration ends`,
        message: `Last registration ${r.registrationLast}. Test ${r.testDate}.`,
        date: reg,
        urgent: true,
      });
    }
    if (test) {
      out.push({
        id: `cal_lawgat_${r.cycle}_test_2026`,
        title: `LAW-GAT — cycle ${r.cycle} test`,
        message: `Test ${r.testDate}. Result ${r.resultDate}.`,
        date: test,
        urgent: false,
      });
    }
  });

  [cal.usat, cal.hat].forEach((block) => {
    if (!block?.rows) return;
    const prefix = block.title?.includes('HAT') ? 'hat' : 'usat';
    block.rows.forEach((r) => {
      const test = parsePakDate(r.testDate);
      const res = parsePakDate(r.resultDate);
      if (test) {
        out.push({
          id: `cal_${prefix}_${r.cycle}_test_2026`,
          title: `${prefix.toUpperCase()} cycle ${r.cycle} — test`,
          message: `Test ${r.testDate} (DD.MM.YYYY). Confirm on HEC portal.`,
          date: test,
          urgent: false,
        });
      }
      if (res) {
        out.push({
          id: `cal_${prefix}_${r.cycle}_result_2026`,
          title: `${prefix.toUpperCase()} cycle ${r.cycle} — result`,
          message: `Expected result around ${r.resultDate}.`,
          date: res,
          urgent: false,
        });
      }
    });
  });

  return out;
}

/**
 * Upsert deadline notifications for milestones within the next HORIZON_DAYS (and not long past).
 */
async function ensureTestCalendarNotifications(userId) {
  const uid = String(userId);
  const now = Date.now();
  const prev = lastRunByUser.get(uid);
  if (prev && now - prev < SYNC_THROTTLE_MS) {
    return { skipped: true, reason: 'throttled' };
  }
  lastRunByUser.set(uid, now);

  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const today = startOfToday();
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + HORIZON_DAYS);

  const all = collectCalendarEvents();
  const upcoming = all
    .filter((e) => e.date >= today && e.date <= horizon)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_NOTIFICATIONS);

  let createdOrExists = 0;
  for (const ev of upcoming) {
    await Notification.findOneAndUpdate(
      {
        user: userObjectId,
        'metadata.calendarEventId': ev.id,
      },
      {
        $setOnInsert: {
          user: userObjectId,
          title: ev.title,
          message: ev.message,
          type: 'deadline',
          urgent: ev.urgent,
          read: false,
          link: '/dashboard',
          metadata: {
            calendarEventId: ev.id,
            source: 'test_calendar_2026',
            eventDate: ev.date.toISOString(),
          },
        },
      },
      { upsert: true, new: true }
    );
    createdOrExists += 1;
  }

  return { skipped: false, synced: createdOrExists };
}

module.exports = {
  ensureTestCalendarNotifications,
  collectCalendarEvents,
};
