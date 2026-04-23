/**
 * Quick sanity checks for comparison text filtering (run: node backend/scripts/testComparisonTextGuards.js)
 */
const assert = require('assert');
const g = require('../utils/comparisonTextGuards');

assert.strictEqual(g.looksLikeJunkFacilityText('Help Desk Screen Reader 051-111-112-468'), true);
assert.strictEqual(g.looksLikeJunkFacilityText('Color Switcher Air University aspires to be recognized globally'), true);
assert.strictEqual(g.isAcceptableFacilityLine('Library, hostels, and sports complex on main campus.'), true);
assert.strictEqual(g.joinFacilityBullets(['Library', 'Help Desk Screen Reader'], 200), 'Library');
assert.strictEqual(
  g.buildFactOnlyDescription({
    name: 'Air University',
    city: 'Islamabad',
    type: 'Public',
    programCount: 16,
  }).includes('Air University'),
  true
);
assert.strictEqual(g.sanitizeAiFacilitiesShort('Hostel blocks near the academic area.'), 'Hostel blocks near the academic area.');
assert.strictEqual(g.sanitizeAiFacilitiesShort('Color Switcher menu'), '');

const sum = 'The campus includes a central library and engineering labs. Visitors may use the help desk.';
assert.ok(g.firstUsableSummarySentence(sum).includes('library'));

console.log('comparisonTextGuards: all checks passed');
