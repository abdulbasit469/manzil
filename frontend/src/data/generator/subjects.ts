import type { MockQuestion } from '../mockTestTypes';
import { makeRng } from './prng';
import { makeQ } from './buildMcq';

const SYN = [
  ['Benevolent', 'Kind', 'Cruel', 'Angry'],
  ['Adequate', 'Sufficient', 'Empty', 'Wrong'],
  ['Diligent', 'Hardworking', 'Lazy', 'Sleepy'],
  ['Eloquent', 'Fluent', 'Silent', 'Rude'],
  ['Frugal', 'Economical', 'Wasteful', 'Generous'],
];

const GK_POOL: [string, string, [string, string, string]][] = [
  ['Capital of Pakistan?', 'Islamabad', ['Karachi', 'Lahore', 'Peshawar']],
  ['Largest province by area?', 'Balochistan', ['Punjab', 'Sindh', 'KPK']],
  ['Indus River flows into?', 'Arabian Sea', ['Red Sea', 'Caspian Sea', 'Bay of Bengal']],
  ['How many UN Security Council permanent members?', '5', ['4', '6', '10']],
  ['Pakistan became independent in?', '1947', ['1946', '1948', '1950']],
  ['National language of Pakistan?', 'Urdu', ['Punjabi', 'English', 'Sindhi']],
  ['Capital of Khyber Pakhtunkhwa (KPK)?', 'Peshawar', ['Quetta', 'Lahore', 'Karachi']],
  ['K2 is in which mountain range?', 'Karakoram', ['Himalaya only', 'Hindu Kush only', 'Alps']],
  ['Gwadar port is in which province?', 'Balochistan', ['Sindh', 'Punjab', 'KPK']],
  ['Who is the head of state in Pakistan (title)?', 'President', ['Prime Minister', 'Chief Justice', 'Governor']],
];

const ISLAMIC_POOL: [string, string, [string, string, string]][] = [
  ['First revelation was in cave?', 'Hira', ['Thawr', 'Saur', 'Nur']],
  ['Hajj is which pillar of Islam?', '5th', ['3rd', '4th', '6th']],
  ['Quran has how many Surahs (approx.)?', '114', ['100', '120', '99']],
  ['Month of fasting?', 'Ramadan', ['Shawwal', 'Muharram', 'Rajab']],
  ['Zakat is roughly what % of savings (classic school)?', '2.5%', ['5%', '1%', '10%']],
  ['Salah is which pillar of Islam?', '2nd', ['1st', '3rd', '4th']],
  ['First month of Islamic calendar?', 'Muharram', ['Ramadan', 'Rabi ul Awwal', 'Shawwal']],
  ['How many rakats in Fard of Fajr?', '2', ['4', '3', '8']],
];

const PAK_POOL: [string, string, [string, string, string]][] = [
  ['Objectives Resolution year?', '1949', ['1947', '1956', '1973']],
  ['First constitution of Pakistan?', '1956', ['1962', '1973', '1948']],
  ['Lahore Resolution year?', '1940', ['1930', '1947', '1935']],
  ['National anthem composer?', 'Ahmed G. Chagla', ['Nazim Hikmat', 'Faiz', 'Iqbal']],
  ['1973 Constitution: Pakistan is?', 'Federal Islamic Republic', ['Unitary state', 'Monarchy', 'Confederation']],
  ['Simla Agreement year (India–Pakistan)?', '1972', ['1965', '1971', '1999']],
];

const URDU_POOL: [string, string, [string, string, string]][] = [
  ['"Kitab" means?', 'Book', ['Pen', 'House', 'Water']],
  ['"Pani" means?', 'Water', ['Fire', 'Air', 'Food']],
  ['"Dost" means?', 'Friend', ['Enemy', 'Teacher', 'Book']],
  ['"Khana" often means?', 'Food', ['House', 'Cloth', 'Road']],
  ['Plural "ladkiyan" refers to?', 'Girls', ['Boys', 'Teachers', 'Books']],
  ['Opposite (general sense) of "acha"?', 'Bura', ['Naya', 'Purana', 'Lamba']],
];

function fmt(n: number) {
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toFixed(2).replace(/\.?0+$/, '');
}

export function generateOneQuestion(
  testName: string,
  sectionName: string,
  genre: string,
  sectionLocalIndex: number,
  globalIndex: number
): MockQuestion {
  const rng = makeRng(testName, `${sectionName}#${sectionLocalIndex}`, globalIndex);
  const id = `${testName}-Q${globalIndex + 1}`;

  switch (genre) {
    case 'math':
    case 'quant':
    case 'sat_math': {
      // Matric / FSc: algebra, trig, calculus intro, sequences, matrices, coordinate geometry.
      const k = sectionLocalIndex % 32;
      if (k < 6) {
        let r1 = 1 + Math.floor(rng() * 7);
        let r2 = 1 + Math.floor(rng() * 7);
        if (r1 === r2) r2 = r1 + 1;
        const sum = r1 + r2;
        const prod = r1 * r2;
        const text = `Sum of roots of x² − ${sum}x + ${prod} = 0 is:`;
        return makeQ(id, sectionName, text, String(sum), [String(prod), String(sum + 1), String(Math.abs(r1 - r2))], rng);
      }
      if (k < 12) {
        const n = 2 + Math.floor(rng() * 5);
        return makeQ(
          id,
          sectionName,
          `For f(x) = x^${n}, the value of f′(1) (derivative at x = 1) is:`,
          String(n),
          [String(n + 1), String(n - 1), String(n * n)],
          rng
        );
      }
      if (k < 16) {
        const a = 2 + Math.floor(rng() * 8);
        const b = 2 + Math.floor(rng() * 8);
        return makeQ(
          id,
          sectionName,
          `∫₀¹ ${a}x dx =`,
          fmt(a / 2),
          [fmt(a), fmt(a * 2), '0'],
          rng
        );
      }
      if (k < 20) {
        const t = [30, 45, 60][Math.floor(rng() * 3)]!;
        const sinv = t === 30 ? '1/2' : t === 45 ? '√2/2' : '√3/2';
        return makeQ(id, sectionName, `sin(${t}°) =`, sinv, ['1', '0', '√3/2'], rng);
      }
      if (k < 24) {
        const a1 = 2 + Math.floor(rng() * 5);
        const d = 1 + Math.floor(rng() * 4);
        const n = 10;
        const s = (n / 2) * (2 * a1 + (n - 1) * d);
        return makeQ(
          id,
          sectionName,
          `Sum of first ${n} terms of AP: first term ${a1}, common difference ${d}. Sum =`,
          fmt(s),
          [fmt(s + 10), fmt(s - 10), fmt(s / 2)],
          rng
        );
      }
      if (k < 28) {
        const a = 2 + Math.floor(rng() * 4);
        const b = 1 + Math.floor(rng() * 4);
        const c = 3 + Math.floor(rng() * 4);
        const d = 1 + Math.floor(rng() * 4);
        const det = a * d - b * c;
        return makeQ(id, sectionName, `Determinant of [[${a},${b}],[${c},${d}]] is:`, String(det), ['0', '1', String(det + 1)], rng);
      }
      if (k === 28) {
        return makeQ(id, sectionName, 'logₐ(xy) equals (a > 0, a ≠ 1):', 'logₐx + logₐy', ['logₐx − logₐy', 'logₐx · logₐy', 'logₐx / logₐy'], rng);
      }
      if (k === 29) {
        return makeQ(
          id,
          sectionName,
          'Coefficient of x³ in (1 + x)⁵ (binomial expansion) is ⁵C₃ =',
          '10',
          ['5', '20', '15'],
          rng
        );
      }
      if (k === 30) {
        return makeQ(id, sectionName, 'Number of permutations of n distinct objects is:', 'n!', ['n²', '2n', 'n(n−1)/2'], rng);
      }
      return makeQ(id, sectionName, 'Distance between points (0,0) and (3,4) is:', '5', ['7', '12', '25'], rng);
    }

    case 'physics': {
      // Matric / FSc: mechanics, heat, waves, electricity, optics, modern basics.
      const k = sectionLocalIndex % 28;
      if (k < 4) {
        const u = 5 + Math.floor(rng() * 10);
        const a = 2;
        const t = 3;
        const v = u + a * t;
        return makeQ(id, sectionName, `A body starts at ${u} m/s and accelerates at ${a} m/s² for ${t} s. Final speed (m/s):`, String(v), [String(u + t), String(u * a), String(u)], rng);
      }
      if (k < 8) {
        const m = 4 + Math.floor(rng() * 6);
        const h = 5 + Math.floor(rng() * 10);
        const g = 10;
        const pe = m * g * h;
        return makeQ(id, sectionName, `PE = mgh with m=${m} kg, g=${g}, h=${h} m (J):`, String(pe), [String(pe + 10), String(pe / 2), String(m + h)], rng);
      }
      if (k < 11) {
        const v = 12;
        const r = 24;
        const i = v / r;
        return makeQ(id, sectionName, `If V=${v} V and R=${r} Ω, current I (A) by Ohm’s law:`, fmt(i), ['6', '3', '0.5'], rng);
      }
      if (k < 14) {
        return makeQ(id, sectionName, 'SI unit of electric current is:', 'Ampere', ['Volt', 'Ohm', 'Coulomb'], rng);
      }
      if (k < 16) {
        const f = 50;
        const lam = 6;
        const v = f * lam;
        return makeQ(id, sectionName, `If f=${f} Hz and λ=${lam} m, wave speed v = fλ (m/s):`, String(v), ['56', '300', '9'], rng);
      }
      if (k === 16) {
        return makeQ(id, sectionName, 'Lens formula (Cartesian sign convention): 1/f equals', '1/v + 1/u', ['v − u', 'u/v', 'f²'], rng);
      }
      if (k === 17) {
        return makeQ(id, sectionName, 'Snell’s law relates angles of incidence and refraction with:', 'Refractive indices of media', ['Mass only', 'Charge only', 'Wavelength in vacuum only'], rng);
      }
      if (k === 18) {
        return makeQ(id, sectionName, 'Coulomb’s law force between two point charges is proportional to:', '1/r²', ['r', 'r³', '1/r'], rng);
      }
      if (k === 19) {
        return makeQ(id, sectionName, 'Magnetic field around a long straight current-carrying wire is found using:', 'Ampere’s law / right-hand rule', ['Gauss law for electricity only', 'Ohm’s law', 'Bernoulli equation'], rng);
      }
      if (k === 20) {
        return makeQ(id, sectionName, 'Ideal gas law for n moles:', 'PV = nRT', ['PV = nR/T', 'P = nV', 'V = n/P'], rng);
      }
      if (k === 21) {
        return makeQ(id, sectionName, 'First law of thermodynamics: ΔU =', 'Q − W (by convention work done by system)', ['Q + W always', 'W − Q always', '0 always'], rng);
      }
      if (k === 22) {
        return makeQ(id, sectionName, 'Photoelectric effect shows light behaves as:', 'Particles (photons)', ['Only a wave in all cases', 'Sound', 'Static charge only'], rng);
      }
      if (k === 23) {
        return makeQ(id, sectionName, 'de Broglie wavelength λ for particle momentum p is:', 'h/p', ['p/h', 'hc/E', 'E/c'], rng);
      }
      if (k === 24) {
        return makeQ(id, sectionName, 'Radioactive decay law: N = N₀e^(−λt). Half-life T½ relates to λ as:', 'T½ = ln(2)/λ', ['T½ = λ/ln(2)', 'T½ = λ', 'T½ = 2λ'], rng);
      }
      if (k === 25) {
        return makeQ(id, sectionName, 'SI unit of power is:', 'Watt', ['Joule', 'Newton', 'Pascal'], rng);
      }
      if (k === 26) {
        return makeQ(id, sectionName, 'Kinetic energy formula:', '½mv²', ['mv', 'mgh', 'Fd'], rng);
      }
      return makeQ(id, sectionName, 'Acceleration due to gravity near Earth (approx., m/s²):', '9.8', ['10', '1', '98'], rng);
    }

    case 'chemistry':
    case 'chemistry_cs': {
      // Matric / FSc: periodic table, bonding, moles, acids/bases, equilibrium, organic basics; CS: number systems.
      const k = sectionLocalIndex % 26;
      const elements = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'];
      if (k < 5) {
        const z = 3 + Math.floor(rng() * 8);
        return makeQ(id, sectionName, `Atomic number ${z} corresponds to element:`, elements[z - 1]!, ['Na', 'Cl', 'K'], rng);
      }
      if (k === 5) {
        return makeQ(id, sectionName, 'Which bond shares electron pairs?', 'Covalent', ['Ionic only', 'Metallic only', 'Hydrogen only'], rng);
      }
      if (k === 6) {
        return makeQ(id, sectionName, 'pH of pure water at 25°C (approx.):', '7', ['6', '8', '14'], rng);
      }
      if (k === 7) {
        return makeQ(id, sectionName, 'Strong acid in dilute aqueous solution:', 'Fully ionizes', ['Never ionizes', 'Always pH = 7', 'Never conducts'], rng);
      }
      if (k === 8) {
        return makeQ(id, sectionName, 'Avogadro’s number (order of magnitude):', '6.02 × 10²³ mol⁻¹', ['6.02 × 10²²', '1.6 × 10⁻¹⁹', '9.8'], rng);
      }
      if (k === 9) {
        return makeQ(id, sectionName, 'Isotopes of an element differ in:', 'Neutron number', ['Proton number', 'Atomic number', 'Electron configuration in neutral atom'], rng);
      }
      if (k === 10) {
        return makeQ(id, sectionName, 'Le Chatelier: if stress increases concentration of reactants, equilibrium shifts:', 'Toward products', ['Toward reactants only', 'No shift', 'Stops reaction'], rng);
      }
      if (k === 11) {
        return makeQ(id, sectionName, 'General formula of alkanes:', 'CₙH₂ₙ₊₂', ['CₙH₂ₙ', 'CₙH₂ₙ₋₂', 'CₙHₙ'], rng);
      }
      if (k === 12) {
        return makeQ(id, sectionName, 'Functional group of aldehydes:', '−CHO (carbonyl at chain end)', ['−COOH', '−OH on benzene only', '−NH₂'], rng);
      }
      if (k === 13) {
        return makeQ(id, sectionName, 'Oxidation number of oxygen in most compounds (except peroxides, etc.):', '−2', ['−1', '+2', '0'], rng);
      }
      if (k === 14) {
        return makeQ(id, sectionName, 'Which has hydrogen bonding in pure liquid?', 'H₂O', ['CH₄', 'CCl₄', 'N₂'], rng);
      }
      if (k === 15) {
        return makeQ(id, sectionName, 'Molarity (M) is:', 'Moles of solute per liter of solution', ['Moles per kg solvent', 'Grams per liter only', 'Moles of solvent per liter'], rng);
      }
      // ECAT-style CS: mix number-system items with chemistry (not only binary for all high k).
      if (genre === 'chemistry_cs' && (k === 16 || k === 20 || k === 23)) {
        const dec = 10 + Math.floor(rng() * 5);
        return makeQ(id, sectionName, `Binary ${dec} in decimal:`, String(dec), [String(dec + 1), String(dec - 1), '16'], rng);
      }
      if (k === 16) {
        return makeQ(id, sectionName, 'Which gas is produced when an active metal reacts with dilute acid?', 'H₂', ['O₂', 'Cl₂', 'N₂'], rng);
      }
      if (k === 17) {
        return makeQ(id, sectionName, 'Buffer solutions resist change in:', 'pH', ['Volume only', 'Mass only', 'Temperature only'], rng);
      }
      if (k === 18) {
        return makeQ(id, sectionName, 'Catalyst mainly changes:', 'Activation energy / rate', ['ΔH of reaction', 'Equilibrium constant K', 'Stoichiometry'], rng);
      }
      if (k === 19) {
        return makeQ(id, sectionName, 'Sigma (σ) bond is formed by:', 'Head-on overlap of orbitals', ['Side-by-side π only', 'Ionic transfer only', 'No overlap'], rng);
      }
      if (k === 20) {
        return makeQ(id, sectionName, 'Electronegativity trend across a period (left to right) generally:', 'Increases', ['Decreases', 'Constant', 'No pattern'], rng);
      }
      if (k === 21) {
        return makeQ(id, sectionName, 'Which intermolecular force is weakest?', 'London dispersion', ['Dipole–dipole', 'Hydrogen bond', 'Ionic bond'], rng);
      }
      if (k === 22) {
        return makeQ(id, sectionName, 'Carboxylic acid functional group:', '−COOH', ['−CHO', '−OH (alcohol)', '−COCl'], rng);
      }
      if (k === 23) {
        return makeQ(id, sectionName, 'Unit of rate constant k depends on:', 'Order of reaction', ['Always s⁻¹', 'Always mol/L', 'Temperature only'], rng);
      }
      if (k === 24) {
        return makeQ(id, sectionName, 'Nuclear fusion is the source of energy in:', 'Stars (e.g., Sun)', ['Dry cell', 'Car battery only', 'Coal combustion only'], rng);
      }
      return makeQ(id, sectionName, 's-block elements are mainly in groups:', '1 and 2', ['13–18', '3–12', 'Only 18'], rng);
    }

    case 'biology': {
      // Matric / FSc Part 1–2: physiology, cell biology, genetics, plants, ecology.
      const k = sectionLocalIndex % 28;
      if (k === 0) {
        return makeQ(
          id,
          sectionName,
          'ADH increases water reabsorption in collecting ducts. The urine becomes:',
          'More concentrated (hypertonic) with smaller volume',
          ['More dilute with larger volume', 'Isotonic always', 'Unchanged osmolarity'],
          rng
        );
      }
      if (k === 1) {
        return makeQ(
          id,
          sectionName,
          'Cerebellum is mainly concerned with:',
          'Balance and coordination of movement',
          ['Vision', 'Hearing', 'Regulation of hunger'],
          rng
        );
      }
      if (k === 2) {
        return makeQ(
          id,
          sectionName,
          'In a simple reflex arc, the order is typically:',
          'Receptor → sensory neuron → CNS → motor neuron → effector',
          ['Effector → motor neuron → CNS', 'CNS → receptor → motor neuron', 'Motor neuron → receptor only'],
          rng
        );
      }
      if (k === 3) {
        return makeQ(id, sectionName, 'Mitochondria are the main site of:', 'ATP synthesis (cellular respiration)', ['Photosynthesis', 'Protein synthesis', 'DNA replication only'], rng);
      }
      if (k === 4) {
        return makeQ(id, sectionName, 'DNA replication occurs mainly in cell cycle phase:', 'S phase', ['G1', 'M', 'G2'], rng);
      }
      if (k === 5) {
        return makeQ(id, sectionName, 'Normal human somatic cell chromosome number:', '46', ['23', '44', '48'], rng);
      }
      if (k === 6) {
        return makeQ(id, sectionName, 'Crossing over between homologous chromosomes occurs during:', 'Prophase I of meiosis', ['Metaphase II', 'Anaphase I only', 'Interphase'], rng);
      }
      if (k === 7) {
        return makeQ(id, sectionName, 'Enzymes are mostly:', 'Proteins that speed up reactions', ['Fats', 'DNA', 'Simple sugars'], rng);
      }
      if (k === 8) {
        return makeQ(id, sectionName, 'Hemoglobin in RBCs mainly transports:', 'Oxygen (and some CO₂)', ['Glucose only', 'Urea', 'Insulin'], rng);
      }
      if (k === 9) {
        return makeQ(id, sectionName, 'Photosynthesis overall equation uses CO₂ and H₂O to form glucose and:', 'O₂', ['N₂', 'CH₄', 'H₂'], rng);
      }
      if (k === 10) {
        return makeQ(id, sectionName, 'Osmosis is the movement of water across a membrane from:', 'Lower solute to higher solute concentration', ['Higher to lower solute', 'No concentration gradient', 'Only through proteins, never lipid'],
          rng);
      }
      if (k === 11) {
        return makeQ(id, sectionName, 'In DNA, adenine pairs with:', 'Thymine', ['Cytosine', 'Guanine with adenine', 'Uracil'], rng);
      }
      if (k === 12) {
        return makeQ(id, sectionName, 'Which blood vessels carry blood away from the heart?', 'Arteries', ['Veins', 'Capillaries only', 'Venules toward heart only'], rng);
      }
      if (k === 13) {
        return makeQ(id, sectionName, 'Which organ produces bile?', 'Liver', ['Pancreas', 'Gall bladder', 'Stomach'], rng);
      }
      if (k === 14) {
        return makeQ(id, sectionName, 'Nephron functional unit is found in:', 'Kidney', ['Liver', 'Lung', 'Heart'], rng);
      }
      if (k === 15) {
        return makeQ(id, sectionName, 'Which chamber pumps oxygenated blood to the body?', 'Left ventricle', ['Right ventricle', 'Right atrium', 'Left atrium only'], rng);
      }
      if (k === 16) {
        return makeQ(id, sectionName, 'A gene is a segment of:', 'DNA that codes for a trait', ['RNA only', 'Lipid', 'Carbohydrate'], rng);
      }
      if (k === 17) {
        return makeQ(id, sectionName, 'Testosterone is mainly produced in:', 'Testes (Leydig cells)', ['Ovaries', 'Pituitary', 'Thyroid'], rng);
      }
      if (k === 18) {
        return makeQ(id, sectionName, 'In plants, xylem mainly transports:', 'Water and minerals upward', ['Sugars only', 'Oxygen', 'Hormones only'], rng);
      }
      if (k === 19) {
        return makeQ(id, sectionName, 'Which gas is used in legume root nodules by nitrogen-fixing bacteria?', 'N₂', ['O₂ only', 'CO only', 'Neon'], rng);
      }
      if (k === 20) {
        return makeQ(id, sectionName, 'A community and its abiotic environment form:', 'Ecosystem', ['Population only', 'Organ', 'Tissue'], rng);
      }
      if (k === 21) {
        return makeQ(id, sectionName, 'Which pathogen type causes cholera?', 'Bacterium', ['Virus only', 'Fungus', 'Protozoa only'], rng);
      }
      if (k === 22) {
        return makeQ(id, sectionName, 'Antibodies are produced by:', 'B lymphocytes (plasma cells)', ['Red blood cells', 'Platelets', 'Neurons'], rng);
      }
      if (k === 23) {
        return makeQ(id, sectionName, 'Insulin is secreted by:', 'Beta cells of pancreatic islets', ['Liver', 'Thyroid', 'Adrenal cortex'], rng);
      }
      if (k === 24) {
        return makeQ(id, sectionName, 'Aerobic respiration in eukaryotes mainly completes in:', 'Mitochondria', ['Nucleus', 'Ribosome only', 'Golgi'], rng);
      }
      if (k === 25) {
        return makeQ(id, sectionName, 'Which vitamin deficiency causes rickets (bone softening)?', 'Vitamin D', ['Vitamin C', 'Vitamin K', 'Vitamin B12'], rng);
      }
      if (k === 26) {
        return makeQ(id, sectionName, 'Binary fission is typical reproduction in:', 'Bacteria', ['Humans', 'Flowering plants', 'Fungi only'], rng);
      }
      return makeQ(id, sectionName, 'Urea is mainly excreted by:', 'Kidneys in urine', ['Lungs only', 'Skin only', 'Large intestine only'], rng);
    }

    case 'english':
    case 'verbal':
    case 'rw': {
      // Matric / FSc English: vocabulary, grammar, common exam-style items.
      const k = sectionLocalIndex % 24;
      if (k < 10) {
        const s = SYN[sectionLocalIndex % SYN.length]!;
        return makeQ(id, sectionName, `Closest synonym to "${s[0]}":`, s[1]!, [s[2]!, s[3]!, 'Silent'], rng);
      }
      if (k < 14) {
        return makeQ(
          id,
          sectionName,
          'Choose the grammatically correct sentence:',
          'She has been studying since Monday.',
          ['She study since Monday.', 'She studying since Monday.', 'She been study since Monday.'],
          rng
        );
      }
      if (k < 18) {
        return makeQ(
          id,
          sectionName,
          'Correct use of article: ___ honest man',
          'an',
          ['a', 'the', 'no article'],
          rng
        );
      }
      if (k < 21) {
        return makeQ(id, sectionName, 'Passive voice: "They built the bridge" →', 'The bridge was built by them.', ['The bridge built.', 'The bridge was build.', 'They were built the bridge.'], rng);
      }
      return makeQ(id, sectionName, 'Plural of "analysis":', 'analyses', ['analysises', 'analysiss', 'analysies'], rng);
    }

    case 'iq':
    case 'analytical': {
      // Logical / pattern items typical of entry-test practice (not advanced proof).
      const k = sectionLocalIndex % 16;
      if (k < 4) {
        const a = 2 + Math.floor(rng() * 4);
        const d = 2;
        const next = a + 5 * d;
        return makeQ(
          id,
          sectionName,
          `Next term: ${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, ${a + 4 * d}, ?`,
          String(next),
          [String(next + 1), String(next - 2), String(a)],
          rng
        );
      }
      if (k < 8) {
        return makeQ(
          id,
          sectionName,
          'If all roses are flowers and this is a rose, then:',
          'It is a flower',
          ['It is not a flower', 'It must be a tree', 'No conclusion'],
          rng
        );
      }
      if (k < 12) {
        return makeQ(id, sectionName, 'Odd one out: 2, 3, 5, 9', '9', ['2', '3', '5'], rng);
      }
      if (k === 12) {
        return makeQ(id, sectionName, 'If A > B and B > C, then:', 'A > C', ['A < C', 'A = C', 'No relation'], rng);
      }
      if (k === 13) {
        return makeQ(id, sectionName, 'Complete: Monday is to week as hour is to', 'Day (time unit)', ['Month', 'Year', 'Second only'], rng);
      }
      return makeQ(id, sectionName, 'Next term: 2, 4, 8, 16, ?', '32', ['24', '20', '64'], rng);
    }

    case 'science_mixed': {
      // FSc-level mix: biology, chemistry, physics (AKU-style science reasoning).
      const sub = sectionLocalIndex % 9;
      if (sub === 0) {
        return makeQ(id, sectionName, 'Blood glucose is regulated mainly by:', 'Insulin', ['Hemoglobin', 'Keratin', 'Amylase'], rng);
      }
      if (sub === 1) {
        return makeQ(id, sectionName, 'Ideal gas equation:', 'PV = nRT', ['PV = nR/T', 'P = nV', 'V = nP'], rng);
      }
      if (sub === 2) {
        return makeQ(id, sectionName, 'Lens formula 1/f =', '1/v + 1/u', ['u + v', 'uv', 'u/v'], rng);
      }
      if (sub === 3) {
        return makeQ(id, sectionName, 'Mitosis produces:', 'Two genetically identical daughter cells', ['Four haploid cells', 'Gametes only', 'One cell only'], rng);
      }
      if (sub === 4) {
        return makeQ(id, sectionName, 'pH < 7 at 25°C means solution is:', 'Acidic', ['Basic', 'Neutral', 'Always buffer'], rng);
      }
      if (sub === 5) {
        return makeQ(id, sectionName, 'Newton’s second law: F =', 'ma', ['mv', 'm/a', 'mgh'], rng);
      }
      if (sub === 6) {
        return makeQ(id, sectionName, 'Speed of light in vacuum (approx.)', '3 × 10⁸ m/s', ['3 × 10⁶ m/s', '340 m/s', '1.5 × 10⁸ m/s'], rng);
      }
      if (sub === 7) {
        return makeQ(id, sectionName, 'DNA → mRNA is called:', 'Transcription', ['Translation', 'Replication', 'Mutation'], rng);
      }
      return makeQ(id, sectionName, 'Unit of electric potential is:', 'Volt', ['Ampere', 'Ohm', 'Coulomb'], rng);
    }

    case 'gk': {
      const row = GK_POOL[sectionLocalIndex % GK_POOL.length]!;
      return makeQ(id, sectionName, row[0], row[1], row[2], rng);
    }

    case 'islamic': {
      const row = ISLAMIC_POOL[sectionLocalIndex % ISLAMIC_POOL.length]!;
      return makeQ(id, sectionName, row[0], row[1], row[2], rng);
    }

    case 'pakstudy': {
      const row = PAK_POOL[sectionLocalIndex % PAK_POOL.length]!;
      return makeQ(id, sectionName, row[0], row[1], row[2], rng);
    }

    case 'urdu': {
      const row = URDU_POOL[sectionLocalIndex % URDU_POOL.length]!;
      return makeQ(id, sectionName, row[0], row[1], row[2], rng);
    }

    default:
      return makeQ(
        id,
        sectionName,
        'Practice item (generic): 2 + 2 =',
        '4',
        ['3', '5', '22'],
        rng
      );
  }
}
