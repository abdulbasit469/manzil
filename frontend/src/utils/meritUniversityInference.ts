/** Strip placeholder suffix so matching works (e.g. "… (Not specified)"). */
export function stripNotSpecifiedFromUniversityName(name: string): string {
  return name.replace(/\s*\(\s*not specified\s*\)/gi, '').trim();
}

/**
 * Infer which merit-calculator entry tests apply to a university (Pakistan admissions heuristics).
 * Order matters: first match wins for exclusive cases; some universities return multiple options.
 */
export function inferMeritTestsForUniversity(universityName: string): string[] {
  const n = stripNotSpecifiedFromUniversityName(universityName).trim();
  const lower = n.toLowerCase();

  if (/nust|national university of sciences/i.test(n)) {
    return ['NET', 'SAT'];
  }
  if (/giki/i.test(lower)) return ['GIKI'];
  if (/pieas/i.test(lower)) return ['PIEAS'];
  if (/\blums\b|\biba\b/i.test(n)) return ['SAT'];
  if (
    /medical|dental|mbbs|bds|pharm-?d|college of medicine|institute of medical|health sciences|doctor|hospital|kemc|dow\s|aku\b|shifa|fatima|liaquat|king edward|allama iqbal medical|services institute|sindh institute|gambat|zayed|rahim|hayat|bashir|chishtian|dental college|medical college/i.test(
      n
    )
  ) {
    return ['MDCAT'];
  }
  if (/uet|engineering and technology|engineering university|ghulam ishaq|mehran|ned\b|uettaxila|uet lahore/i.test(n)) {
    return ['ECAT'];
  }
  // Broad default for other universities (many accept NAT variants)
  return ['NAT'];
}
