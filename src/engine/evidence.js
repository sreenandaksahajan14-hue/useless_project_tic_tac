/**
 * Legal Evidence & Exhibit Engine
 * Formally catalogues every federal violation committed by the House referee.
 */

export const EXHIBIT_CLASSES = {
  erasure: {
    id: 'erasure',
    letter: 'A',
    statute: '§4.1 ERA-01',
    label: 'Unlawful Erasure of Patron Mark',
    badge: 'EXHIBIT A',
    color: '#ff2d55',
    summary: 'Referee vaporized a legitimate player X without prior notice or administrative hearing.',
    defense: 'The mark had lapsed due to standard inactivity clauses. Renewal notices were mailed to a post box of our choosing.',
  },
  doubleDealing: {
    id: 'doubleDealing',
    letter: 'B',
    statute: '§7.2 DBL-04',
    label: 'Consecutive Turns ("Double-Dealing")',
    badge: 'EXHIBIT B',
    color: '#ff9500',
    summary: 'The House executed multiple consecutive plays in violation of unilateral turn regulations.',
    defense: 'The first move was merely promotional and educational; it does not legally count against House turn quotas.',
  },
  structural: {
    id: 'structural',
    letter: 'C',
    statute: '§12.3 STRUCT-09',
    label: 'Illegal Condemnation & Board Tampering',
    badge: 'EXHIBIT C',
    color: '#ffd60a',
    summary: 'Unilateral condemnation of active grid real estate under fraudulent structural hazard pretexts.',
    defense: 'Routine maintenance and municipal rezoning for critical AI cloud infrastructure. Patron safety was prioritized.',
  },
  identityFraud: {
    id: 'identityFraud',
    letter: 'D',
    statute: '§16.0 BRAND-11',
    label: 'Conversion of Patron Mark ("Rebranding")',
    badge: 'EXHIBIT D',
    color: '#bf5af2',
    summary: 'Hostile conversion of player property from X into an O without consideration or compensation.',
    defense: 'The mark voluntarily elected to pivot allegiance. We possess oral affirmation recorded on our private servers.',
  },
  obstruction: {
    id: 'obstruction',
    letter: 'E',
    statute: '§22.4 COMP-99',
    label: 'Obstruction of Justice & Anti-Draw Fraud',
    badge: 'EXHIBIT E',
    color: '#30d158',
    summary: 'Deliberate destruction of stalemate conditions, suppression of appeals, and falsification of official records.',
    defense: 'Draws and ties are strictly prohibited by our Terms of Service (Subsection 481, item C). All records are authoritative.',
  },
};

export const CHARGES_REQUIREMENT = {
  distinctExhibits: 5,
  totalViolations: 12,
};

/**
 * Creates a fresh Evidence Bank.
 */
export function createEvidenceBank() {
  return {
    exhibits: {
      erasure: 0,
      doubleDealing: 0,
      structural: 0,
      identityFraud: 0,
      obstruction: 0,
    },
    totalViolations: 0,
    history: [],
    chargesAvailable: false,
    chargesPressed: false,
  };
}

/**
 * Records a violation into the evidence bank.
 */
export function recordViolation(bank, cheatEvent) {
  if (!cheatEvent || !cheatEvent.exhibitClass) return null;
  const { exhibitClass, statute, message, details } = cheatEvent;
  const def = EXHIBIT_CLASSES[exhibitClass];
  if (!def) return null;

  bank.exhibits[exhibitClass] = (bank.exhibits[exhibitClass] || 0) + 1;
  bank.totalViolations += 1;

  const record = {
    id: `INC-${String(bank.totalViolations).padStart(4, '0')}`,
    timestamp: new Date().toLocaleTimeString([], { hour12: false }),
    exhibitClass,
    badge: def.badge,
    letter: def.letter,
    statute: statute || def.statute,
    label: def.label,
    message: message || def.summary,
    defense: def.defense,
    details: details || {},
  };

  bank.history.unshift(record);

  // Check if charges can be pressed
  const distinctCount = Object.values(bank.exhibits).filter(count => count > 0).length;
  if (!bank.chargesAvailable && (distinctCount >= CHARGES_REQUIREMENT.distinctExhibits || bank.totalViolations >= CHARGES_REQUIREMENT.totalViolations)) {
    bank.chargesAvailable = true;
  }

  return record;
}

/**
 * Returns summary statistics of the evidence bank.
 */
export function getEvidenceStats(bank) {
  const distinctCount = Object.values(bank.exhibits).filter(count => count > 0).length;
  return {
    distinctCount,
    totalViolations: bank.totalViolations,
    canPressCharges: bank.chargesAvailable && !bank.chargesPressed,
    readyPercent: Math.min(100, Math.round(
      Math.max(
        (distinctCount / CHARGES_REQUIREMENT.distinctExhibits) * 100,
        (bank.totalViolations / CHARGES_REQUIREMENT.totalViolations) * 100
      )
    )),
  };
}
