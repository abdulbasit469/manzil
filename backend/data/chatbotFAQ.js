/**
 * Manzil Student Chatbot – FAQ + keyword / token overlap for fast answers.
 * When confidence is low, backend may call Gemini (see chatbotController).
 */
const FAQ = [
  // --- Registration & Account (1–8) ---
  { q: 'How do I sign up?', keywords: ['sign up', 'register', 'create account', 'signup'], a: 'Click "Sign Up" on the login page. Enter your full name, email, and a password (with uppercase, lowercase, number, and special character). You will receive a 6-digit OTP on your email to verify your account.' },
  { q: 'Why do I need to verify my email?', keywords: ['verify', 'otp', 'email verification', 'why verify'], a: 'Email verification ensures only real users join Manzil. After signing up, you get a 6-digit OTP on your email. Enter it on the verification page to activate your account. The OTP expires in 10 minutes.' },
  { q: 'I did not receive the OTP. What should I do?', keywords: ['no otp', 'otp not received', 'resend otp', 'otp missing'], a: 'Check your spam folder first. If the OTP has expired (after 10 minutes), use the "Resend OTP" option on the verification page to get a new code.' },
  { q: 'What are the password requirements?', keywords: ['password', 'password requirement', 'strong password'], a: 'Your password must have at least one uppercase letter, one lowercase letter, one number, and one special character. This keeps your account secure.' },
  { q: 'How do I log in?', keywords: ['login', 'log in', 'sign in', 'how to login'], a: 'Go to the login page, enter your registered email and password, and click "Login". You must verify your email first. After login, you are taken to your dashboard.' },
  { q: 'I forgot my password. How do I reset it?', keywords: ['forgot password', 'reset password', 'change password'], a: 'On the login page, click "Forgot your password?". Enter your registered email. You will receive a reset link by email. Click the link and set a new password. The link expires in 1 hour.' },
  { q: 'Can I use Manzil without creating an account?', keywords: ['without account', 'guest', 'no sign up'], a: 'No. You need to sign up and verify your email to use Manzil. This lets us save your profile, assessment results, and recommendations for you.' },
  { q: 'Who can use Manzil?', keywords: ['who can use', 'for whom', 'target', 'audience'], a: 'Manzil is for Pakistani students who have completed or are completing intermediate (FSc, FA, ICS, ICOM) and want career guidance and university admission information.' },

  // --- Profile (9–14) ---
  { q: 'What is the profile and why should I complete it?', keywords: ['profile', 'complete profile', 'what is profile'], a: 'Your profile includes your name, city, intermediate type (FSc/FA/ICS/ICOM), marks, and interests. Completing it helps the app give you better career and degree recommendations.' },
  { q: 'What fields are required in the profile?', keywords: ['profile fields', 'what to fill', 'profile form'], a: 'You need to fill your name, email (already set), city, intermediate type (e.g. FSc Pre-Medical, FA, ICS), your marks, and optionally phone and interests. The more accurate the data, the better the recommendations.' },
  { q: 'Can I update my profile later?', keywords: ['update profile', 'edit profile', 'change profile'], a: 'Yes. Go to the Profile section from the dashboard or menu. You can update your details, marks, and interests at any time.' },
  { q: 'What is intermediate type?', keywords: ['intermediate type', 'fsc', 'fa', 'ics', 'icom'], a: 'It is your board/stream after matric: e.g. FSc Pre-Medical, FSc Pre-Engineering, FA, ICS, ICOM. Manzil uses this to show relevant programs and eligibility.' },
  { q: 'Does Manzil store my personal data safely?', keywords: ['privacy', 'data safe', 'personal data', 'security'], a: 'Yes. Passwords are hashed and not stored in plain text. Your data is used only to provide career and university guidance within the app. We do not share your personal information with third parties.' },
  { q: 'What is profile completion percentage?', keywords: ['profile completion', 'completion percentage', 'profile percent'], a: 'It shows how much of your profile you have filled. A higher percentage usually unlocks better personalized suggestions on the dashboard and in recommendations.' },

  // --- Dashboard (15–18) ---
  { q: 'What is the dashboard?', keywords: ['dashboard', 'what is dashboard', 'home'], a: 'The dashboard is your main page after login. It shows your profile completion, quick links to Career Assessment, Universities, Programs, saved universities, and recent activity.' },
  { q: 'What can I do from the dashboard?', keywords: ['dashboard features', 'what to do', 'dashboard options'], a: 'You can go to Career Assessment, browse Universities, view Programs, see your saved universities, check notifications, and access your profile. It is the hub for all Manzil features.' },
  { q: 'Why do I see "Complete your profile"?', keywords: ['complete your profile', 'profile incomplete'], a: 'This appears when some required profile fields are missing. Completing your profile helps Manzil give you better career and degree recommendations.' },
  { q: 'How do I get to the career assessment from the dashboard?', keywords: ['go to assessment', 'start assessment', 'career test from dashboard'], a: 'On the dashboard, click the "Career Assessment" card or use the navigation menu to open the Career Assessment page. From there you can start or view your assessments.' },

  // --- Career Assessment (19–32) ---
  { q: 'What is the career assessment?', keywords: ['career assessment', 'what is assessment', 'career test'], a: 'It is a set of 3 tests: Personality Insights (MBTI), Brain Hemisphere, and Career Path Profiler (interests). Your answers are combined to suggest suitable careers and degree programs.' },
  { q: 'How many tests are there in the career assessment?', keywords: ['how many tests', 'number of tests', 'three tests'], a: 'There are 3 tests: (1) Personality Insights – MBTI type, (2) Brain Hemisphere – left/right/balanced thinking, (3) Career Path Profiler – your interests. Complete all three to get degree recommendations.' },
  { q: 'What is the Personality Insights test?', keywords: ['personality test', 'personality insights', 'mbti'], a: 'It is an MBTI-based test that identifies your personality type (e.g. ENFJ, ISTP). The result helps match you with careers and study paths that suit your personality.' },
  { q: 'What is the Brain Hemisphere test?', keywords: ['brain hemisphere', 'left brain', 'right brain', 'balanced brain'], a: 'It shows whether you lean toward left-brain (logical, analytical) or right-brain (creative) thinking, or are balanced. This is used along with other tests to refine your career and degree suggestions.' },
  { q: 'What is the Career Path Profiler?', keywords: ['career path profiler', 'interest test', 'interest assessment'], a: 'It is an interest-based test where you choose options that best describe you. It identifies your top interest dimensions (e.g. Analytical, Creative, Social) and links them to careers and degrees.' },
  { q: 'How long does each test take?', keywords: ['how long', 'duration', 'time for test', 'minutes'], a: 'Personality and Brain Hemisphere tests usually take about 5–10 minutes each. The Career Path Profiler (interest) is shorter. You can complete them one by one; there is no single time limit for all.' },
  { q: 'Can I retake a test?', keywords: ['retake', 'redo test', 'take again'], a: 'Yes. On the Career Assessment page, each completed test has a "Retake Assessment" option. Your new result will replace the previous one and recommendations will update accordingly.' },
  { q: 'When do I see my degree recommendations?', keywords: ['when recommendations', 'degree recommendations', 'when do i see results'], a: 'After you complete all 3 tests (Personality, Brain Hemisphere, and Career Path Profiler), the "Recommended Degrees" section on the Career Assessment page is filled with suggested programs based on your results.' },
  { q: 'How are recommendations generated?', keywords: ['how recommendations', 'how are degrees suggested', 'algorithm'], a: 'Your degree and career suggestions use a transparent weighted rule-based engine: scores from all 3 tests are normalized and mapped to career fields and programs. This keeps results consistent and explainable. The chat counselor may use AI separately to explain careers and admissions in natural language.' },
  { q: 'What if I see "No Recommendations Yet"?', keywords: ['no recommendations', 'recommendations not showing'], a: 'This usually means one or more of the 3 tests are not completed. Complete all three (Personality, Brain Hemisphere, Career Path Profiler), then refresh the page or click "Refresh recommendations" if shown.' },
  { q: 'What are "Details" on each assessment card?', keywords: ['details', 'assessment details', 'view details'], a: '"Details" opens a short explanation of your result for that test (e.g. your MBTI type, brain dominance, or top interest dimensions). It does not change your result.' },
  { q: 'Is the career assessment based on AI?', keywords: ['ai', 'artificial intelligence', 'machine learning'], a: 'The **three tests and numeric recommendations** are rule-based (weighted scores and mappings), not a black-box AI model. Separately, the **AI Career Counselor chat** (when enabled) uses natural language understanding to answer your questions about careers, admissions, and using Manzil.' },
  { q: 'Can I save or download my assessment results?', keywords: ['save results', 'download results', 'export assessment'], a: 'Your results are saved automatically in your account. You can view them anytime on the Career Assessment page. A formal download/export option may be added in a future update.' },

  // --- Universities & Programs (33–42) ---
  { q: 'How do I search for universities?', keywords: ['search universities', 'find universities', 'university search'], a: 'Go to the Universities section. You can search by name and filter by city, type (public/private), and other options. Results show HEC-recognized universities where applicable.' },
  { q: 'Are the universities HEC recognized?', keywords: ['hec', 'hec recognized', 'recognized universities'], a: 'Manzil aims to include HEC-recognized institutions. You can check each university’s details and the HEC ranking field where available. Always confirm recognition on the HEC website for important decisions.' },
  { q: 'How do I save a university?', keywords: ['save university', 'save university to list', 'bookmark university'], a: 'Open a university’s page and use the "Save" or "Add to saved" option. Saved universities appear in your dashboard or Saved Universities section for quick access.' },
  { q: 'Where can I see my saved universities?', keywords: ['saved universities', 'my saved', 'saved list'], a: 'From the dashboard or the main menu, open "Saved Universities" (or similar). There you can see and manage the list of universities you saved.' },
  { q: 'What information does each university show?', keywords: ['university details', 'university info', 'what does university page show'], a: 'You typically see name, city, type (public/private), description, website, contact, facilities, and linked programs. Some entries may also show HEC ranking or establishment year.' },
  { q: 'How do I find programs or degrees?', keywords: ['programs', 'degrees', 'find program', 'degree search'], a: 'You can browse programs from the Programs section or open a university and see its offered programs. Use filters (e.g. degree type, field) if available.' },
  { q: 'What is shown for each program?', keywords: ['program details', 'degree details', 'program info'], a: 'Usually program name, degree type, duration, fee (if available), eligibility, description, and career scope. This helps you compare and choose a suitable degree.' },
  { q: 'Can I compare universities?', keywords: ['compare universities', 'comparison'], a: 'You can open different university and program pages and compare them yourself. A dedicated comparison tool may be added in a future update.' },
  { q: 'How do I know if I am eligible for a program?', keywords: ['eligibility', 'am i eligible', 'program eligibility'], a: 'Each program has an eligibility section (e.g. required intermediate stream, minimum marks). Check your profile (intermediate type and marks) against these requirements.' },
  { q: 'Where do I get merit or cutoff information?', keywords: ['merit', 'cutoff', 'merit list', 'aggregate'], a: 'If Manzil has a Merit or Admission section, use it for merit criteria and past trends. Otherwise, check the university’s official website for latest merit lists and cutoffs.' },

  // --- General & App (43–50) ---
  { q: 'What is Manzil?', keywords: ['what is manzil', 'what is this app', 'about manzil'], a: 'Manzil is a smart career counseling and university guidance portal for Pakistani students. It helps you with career assessments, degree recommendations, and information on universities and programs after intermediate.' },
  { q: 'Is Manzil free to use?', keywords: ['free', 'cost', 'price', 'payment'], a: 'Manzil is designed as a free platform for students. If any premium feature is introduced later, it will be clearly indicated in the app.' },
  { q: 'I am facing a technical issue. What should I do?', keywords: ['technical issue', 'error', 'not working', 'bug', 'problem'], a: 'Try refreshing the page and clearing the browser cache. If you are on login or assessment, check your internet and try again. For persistent issues, note the error message and contact support through the contact option in the app or repository.' },
  { q: 'How do I contact support?', keywords: ['contact', 'support', 'help', 'customer care'], a: 'Use the contact or feedback option in the app or the GitHub repository link mentioned in the app. Include your email and a short description of the issue.' },
  { q: 'Can I use Manzil on mobile?', keywords: ['mobile', 'phone', 'responsive', 'app on phone'], a: 'Yes. Manzil is a web app that works on phones and tablets. Open the same website in your mobile browser and log in to use all features.' },
  { q: 'What browsers are supported?', keywords: ['browser', 'chrome', 'safari', 'supported'], a: 'Manzil works on modern browsers like Chrome, Firefox, Safari, and Edge. Keep your browser updated for the best experience.' },
  { q: 'What does "Manzil" mean?', keywords: ['manzil meaning', 'name manzil'], a: '"Manzil" means "destination" or "goal" in Urdu. The app is named so because it helps you reach your career and education destination.' },
  { q: 'How often should I update my profile or retake assessments?', keywords: ['update often', 'retake when', 'how often'], a: 'Update your profile when your details or marks change. You can retake assessments when you feel your interests or goals have changed; there is no fixed schedule.' },
  { q: 'What is the merit calculator?', keywords: ['merit calculator', 'merit calculate', 'aggregate calculator'], a: 'The Merit Calculator helps you estimate your aggregate or merit score based on your marks (e.g. matric, intermediate) and the criteria used by universities. Open it from the dashboard or Merit section to use it.' },

  // --- Admissions, tests, scholarships, degree scope (proposal-aligned) ---
  { q: 'What is MDCAT and who needs it?', keywords: ['mdcat', 'medical entry', 'mbbs test', 'medical admission test'], a: 'MDCAT is the medical and dental college admission test used for MBBS/BDS pathways in Pakistan. Eligibility, syllabus, and dates change — always confirm on the official PMC and your target universities’ websites. In Manzil you can explore medical degree scope under Degree & Career Scope and use Mock Test for practice only.' },
  { q: 'What is ECAT?', keywords: ['ecat', 'engineering entry', 'uet entry'], a: 'ECAT is commonly used for engineering admissions (e.g. UET Punjab and related programs). Exact weightage and dates vary by year and university. Check official UET and university notices. Manzil’s Merit Calculator and Universities section help you plan; verify all numbers on official sites.' },
  { q: 'What is NTS and USAT?', keywords: ['nts', 'usat', 'hec test', 'national testing'], a: 'NTS runs tests for many institutions; requirements depend on each program. USAT is an HEC-related undergraduate admissions test for certain pathways — confirm current policy on HEC and your chosen university websites. Use Manzil’s university and program pages plus Community for peer tips, not as the official notice board.' },
  { q: 'Where can I learn about scholarships?', keywords: ['scholarship', 'scholarships', 'financial aid', 'hec scholarship', 'need based'], a: 'Scholarships include HEC programs, university merit/need schemes, and others — rules and deadlines differ. Manzil’s Community and notifications may discuss opportunities; for applying, always use official HEC and university portals. The chat counselor can explain types of aid in general.' },
  { q: 'What is Degree & Career Scope in Manzil?', keywords: ['degree scope', 'career scope', 'job market', 'salary after degree', 'future trends'], a: 'Degree & Career Scope lists degrees with job market outlook, sample roles, indicative salary bands, and trends for Pakistan-focused context. Open it from the sidebar to compare fields before you choose a program. Linked programs show universities where data exists in the database.' },
  { q: 'How do I prepare for entry tests?', keywords: ['entry test', 'test preparation', 'test ki tayari', 'tayari'], a: 'Use a mix of official syllabi, past papers, and timed practice. In Manzil, open **Mock Test** for practice-style questions and **Career Assessment** to align interests with fields. For exact test format and registration, follow the official body (NTS, university, PMC, etc.).' },
  { q: 'Does Manzil show official admission deadlines?', keywords: ['deadline', 'last date', 'admission date', 'closing date'], a: 'Manzil may show general guidance and community discussions, but **official closing dates and forms** change every season. Always verify on each university’s admission portal. Enable notifications in the app for announcements your admins send.' },
  { q: 'Kya Manzil Urdu samajh sakta hai?', keywords: ['urdu', 'roman urdu', 'kya', 'kaise', 'madad'], a: 'Haan — aap Roman Urdu ya simple Urdu mein likh sakte hain. AI counselor (jab API key lagi ho) natural language se jawab dega; FAQ match bhi Urdu keywords se ho sakta hai. Career assessment ab bhi English interface mein ho sakta hai.' },
];

/**
 * Normalize text for matching: lowercase, trim, collapse spaces
 */
function normalize(text) {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Match keyword in user text without false positives (e.g. FAQ keyword "ai" must not match "hai").
 * Short keywords (length ≤ 3) must appear as whole tokens (bounded by non-alphanumeric).
 */
function safeTextMatch(haystack, needle) {
  if (!needle || !haystack) return false;
  if (needle.length <= 3) {
    const re = new RegExp(
      `(^|[^a-z0-9\u0600-\u06FF])${escapeRegExp(needle)}([^a-z0-9\u0600-\u06FF]|$)`,
      'i'
    );
    return re.test(haystack);
  }
  return haystack.includes(needle);
}

/** Roman Urdu / Urdu-style greetings and small talk → not a FAQ keyword game */
function isCasualRomanUrduGreeting(normalizedInput) {
  const s = normalizedInput.trim();
  if (!s) return false;
  const patterns = [
    /^(assalam|salam|salamualaikum|salaam|aoa|adaab)(\s*[!.,])?$/i,
    /^(assalam|salam|salaam)\s+walaikum/i,
    /^(kya|ki)\s+hal\s+(hai|hy|he)\b/i,
    /^(kya|ki)\s+haal\s+(hai|hy|he)\b/i,
    /^ka(is|s)e\s+ho\b/i,
    /^aap\s+ka(is|s)e\s+(hain|ho|hen)\b/i,
    /^sab\s+theek\b/i,
    /^allah\s+ka\s+shukar\b/i,
    /^khair\s+mubarak\b/i,
  ];
  return patterns.some((re) => re.test(s));
}

function greetingResponseSuggested() {
  return [
    'What is Degree & Career Scope in Manzil?',
    'Kya Manzil Urdu samajh sakta hai?',
    'How do I prepare for entry tests?',
  ];
}

function greetingAnswerRomanUrduFriendly() {
  return (
    '**Assalam-o-alaikum!** Main theek hoon, shukriya. ' +
    'Main **Manzil AI Career Counselor** hoon — admissions, MDCAT/ECAT, scholarships, degree scope, career tests, ya app use karne ke baray mein poochh sakte hain. ' +
    'Aap **Roman Urdu** ya English dono mein likh sakte hain.'
  );
}

function scoreKeywordsForItem(normalizedInput, item) {
  const keys = [normalize(item.q), ...(item.keywords || []).map(normalize)];
  let score = 0;
  for (const k of keys) {
    if (!k) continue;
    const forward = safeTextMatch(normalizedInput, k);
    const reverse =
      normalizedInput.length >= 4 && k.length >= 4 && k.includes(normalizedInput);
    if (forward) score += 1;
    if (forward || reverse) score += 2;
  }
  return score;
}

function bestFAQByKeywordScore(normalizedInput) {
  let best = null;
  let bestScore = 0;
  for (const item of FAQ) {
    const score = scoreKeywordsForItem(normalizedInput, item);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return { best, bestScore };
}

/**
 * Find best matching FAQ for user message. Returns { answer, question, suggested } or default.
 */
function getAnswer(userMessage) {
  const normalizedInput = normalize(userMessage);
  if (!normalizedInput) {
    return {
      answer: 'Please type a question. I can help with registration, login, profile, career assessment (3 tests), recommendations, universities, and programs.',
      question: null,
      suggested: FAQ.slice(0, 6).map(f => f.q),
    };
  }

  // Exact or high-similarity match on question
  for (const item of FAQ) {
    if (normalize(item.q) === normalizedInput) {
      return { answer: item.a, question: item.q, suggested: getSuggested(item) };
    }
  }

  if (isCasualRomanUrduGreeting(normalizedInput)) {
    return {
      answer: greetingAnswerRomanUrduFriendly(),
      question: null,
      suggested: greetingResponseSuggested(),
    };
  }

  // Keyword match (safe: short tokens like "ai" cannot match inside "hai")
  const { best, bestScore } = bestFAQByKeywordScore(normalizedInput);
  if (best && bestScore > 0) {
    return { answer: best.a, question: best.q, suggested: getSuggested(best) };
  }

  // Greetings / generic
  const greetings = ['hi', 'hello', 'hey', 'assalam', 'salam', 'aoa', 'asalam'];
  if (greetings.some((g) => normalizedInput.startsWith(g) || normalizedInput === g)) {
    return {
      answer:
        'Hello! I\'m your **Manzil AI Career Counselor**. Ask about sign up, profile, career assessment, admissions, MDCAT/ECAT, scholarships, Degree & Career Scope, or universities — English or Roman Urdu.',
      question: null,
      suggested: ['What is Degree & Career Scope in Manzil?', 'What is MDCAT and who needs it?', 'When do I see my degree recommendations?'],
    };
  }

  // No match
  return {
    answer: 'I couldn\'t find an exact answer for that. Try asking about: signing up, logging in, profile, career assessment (Personality, Brain Hemisphere, Interest tests), degree recommendations, or universities and programs. You can also type "hi" for suggested questions.',
    question: null,
    suggested: FAQ.slice(0, 6).map(f => f.q),
  };
}

function getSuggested(current) {
  const others = FAQ.filter(f => f.q !== current.q).slice(0, 5);
  return others.map(f => f.q);
}

/** Tokens for light-weight NLP overlap (English + common Roman Urdu) */
function tokenize(text) {
  const n = normalize(text);
  return n.split(/[^a-z0-9\u0600-\u06FF]+/).filter((t) => t.length > 1);
}

/**
 * Best FAQ by token overlap (Jaccard-style) when keyword score is weak.
 */
function bestFAQByOverlap(userMessage) {
  const userTokens = new Set(tokenize(userMessage));
  if (userTokens.size === 0) return { item: null, score: 0 };

  let best = null;
  let bestScore = 0;
  for (const item of FAQ) {
    const blob = [item.q, ...(item.keywords || []), item.a].join(' ');
    const corpusTokens = new Set(tokenize(blob));
    let inter = 0;
    for (const t of userTokens) {
      if (corpusTokens.has(t)) inter += 1;
    }
    const union = userTokens.size + corpusTokens.size - inter;
    const jaccard = union > 0 ? inter / union : 0;
    if (jaccard > bestScore) {
      bestScore = jaccard;
      best = item;
    }
  }
  return { item: best, score: bestScore };
}

/**
 * Returns FAQ match with confidence 0–1. useAI true → caller should try generative AI.
 */
function getAnswerWithMeta(userMessage) {
  const normalizedInput = normalize(userMessage);
  if (!normalizedInput) {
    return {
      answer: 'Please type a question. I can help with registration, login, profile, career assessment (3 tests), recommendations, universities, admissions, scholarships, and entry tests.',
      question: null,
      suggested: FAQ.slice(0, 6).map((f) => f.q),
      confidence: 0,
      useAI: false,
      matchedBy: 'empty',
    };
  }

  // Exact question match
  for (const item of FAQ) {
    if (normalize(item.q) === normalizedInput) {
      return {
        answer: item.a,
        question: item.q,
        suggested: getSuggested(item),
        confidence: 1,
        useAI: false,
        matchedBy: 'exact',
      };
    }
  }

  if (isCasualRomanUrduGreeting(normalizedInput)) {
    return {
      answer: greetingAnswerRomanUrduFriendly(),
      question: null,
      suggested: greetingResponseSuggested(),
      confidence: 1,
      useAI: false,
      matchedBy: 'greeting-roman-urdu',
    };
  }

  const { best, bestScore } = bestFAQByKeywordScore(normalizedInput);
  const keywordConfidence = Math.min(1, bestScore / 6);

  if (best && bestScore >= 3) {
    return {
      answer: best.a,
      question: best.q,
      suggested: getSuggested(best),
      confidence: Math.max(0.85, keywordConfidence),
      useAI: false,
      matchedBy: 'keyword-strong',
    };
  }

  if (best && bestScore >= 1) {
    return {
      answer: best.a,
      question: best.q,
      suggested: getSuggested(best),
      confidence: Math.max(0.45, keywordConfidence),
      useAI: false,
      matchedBy: 'keyword-weak',
    };
  }

  // Token overlap (NLP fallback)
  const { item: overlapItem, score: jaccard } = bestFAQByOverlap(userMessage);
  if (overlapItem && jaccard >= 0.12) {
    return {
      answer: overlapItem.a,
      question: overlapItem.q,
      suggested: getSuggested(overlapItem),
      confidence: Math.min(0.75, 0.25 + jaccard * 2),
      useAI: false,
      matchedBy: 'token-overlap',
    };
  }

  // Greetings
  const greetings = ['hi', 'hello', 'hey', 'assalam', 'salam', 'aoa', 'asalam'];
  if (greetings.some((g) => normalizedInput.startsWith(g) || normalizedInput === g)) {
    return {
      answer:
        'Hello! I\'m your **Manzil AI Career Counselor**. Ask about admissions, MDCAT/ECAT/NTS, scholarships, degree scope, career tests, or universities. You can type in English or Roman Urdu.',
      question: null,
      suggested: ['What is Degree & Career Scope in Manzil?', 'What is MDCAT and who needs it?', 'How do I prepare for entry tests?'],
      confidence: 1,
      useAI: false,
      matchedBy: 'greeting',
    };
  }

  return {
    answer: null,
    question: null,
    suggested: FAQ.slice(0, 8).map((f) => f.q),
    confidence: 0,
    useAI: true,
    matchedBy: 'none',
  };
}

module.exports = {
  FAQ,
  getAnswer,
  getSuggested,
  getAnswerWithMeta,
  bestFAQByOverlap,
};
