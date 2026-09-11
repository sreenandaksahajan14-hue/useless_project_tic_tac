/**
 * Noir Composure State Machine
 * Monitors Syndicate referee psychological stability as evidence mounts.
 */

export const COMPOSURE_STAGES = {
  SMUG: {
    min: 75,
    max: 100,
    title: 'COLD & UNTOUCHABLE',
    color: 'var(--ink-black)',
    quip: 'The Syndicate operates with complete municipal immunity.',
  },
  DEFENSIVE: {
    min: 50,
    max: 74,
    title: 'DEFENSIVE BUREAUCRAT',
    color: 'var(--tape-evidence)',
    quip: 'Your formal inquiries have been forwarded to the dead-letter archive.',
  },
  RATTLED: {
    min: 25,
    max: 49,
    title: 'SWEATING UNDER INQUEST',
    color: 'var(--ink-red)',
    quip: 'Who leaked the grand jury docket? Shred the remaining carbon copies!',
  },
  UNHINGED: {
    min: 0,
    max: 24,
    title: 'DESPERATELY UNHINGED',
    color: 'var(--ink-red-dark)',
    quip: 'I RUN THIS PRECINCT! THERE ARE NO WITNESSES ON THIS BOARD!',
  },
};

export function createComposure() {
  return {
    value: 100,
    stage: 'SMUG',
    shakenCount: 0,
  };
}

export function getComposureStage(value) {
  if (value >= 75) return 'SMUG';
  if (value >= 50) return 'DEFENSIVE';
  if (value >= 25) return 'RATTLED';
  return 'UNHINGED';
}

export function damageComposure(composure, amount, reason = '') {
  const previousStage = composure.stage;
  composure.value = Math.max(0, Math.min(100, composure.value - amount));
  composure.stage = getComposureStage(composure.value);

  if (amount > 0) {
    composure.shakenCount += 1;
  }

  const stageChanged = previousStage !== composure.stage;
  const stageData = COMPOSURE_STAGES[composure.stage];

  return {
    value: composure.value,
    stage: composure.stage,
    stageChanged,
    stageData,
    amount,
    reason,
  };
}

export function seasonResetComposure(composure, matchNumber) {
  const cap = Math.max(40, 100 - (matchNumber - 1) * 15);
  composure.value = Math.min(cap, composure.value + 20);
  composure.stage = getComposureStage(composure.value);
  return composure;
}
