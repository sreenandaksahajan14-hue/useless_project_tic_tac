/**
 * Refined Noir AI Referee Engine
 * 
 * Cold, calculated syndicate AI. Plays smart fundamental Tic-Tac-Toe first,
 * but when cornered or faced with a human win, executes cold bureaucratic corruption.
 */

import {
  LINES,
  winner,
  winningLines,
  squares,
  openSquares,
  immediateWins,
  forks,
  isBoardFull
} from './board.js';

const NOIR_VOICES = {
  offside: [
    'Three in a row? The coroner has ruled that third mark inadmissible.',
    'Under executive review... and redacted from the official transcript.',
    'That diagonal was zoned for syndicate operations. Nullified.',
  ],
  erasure: [
    'Classified under the Municipal Secrecy Act. The mark never existed.',
    'Official records have been corrected. You never made that placement.',
    'Evidence lost in transit. Kindly accept this administrative redaction.',
    'A drop of dark ink on your ledger. The mark is gone.',
  ],
  doubleDealing: [
    'The defense rests... actually, the defense calls a surprise second witness.',
    'A minor procedural amendment: The House takes consecutive placement.',
    'One for the record, and one for insurance.',
    'Double-dealing? Around here we call it "judicial efficiency".',
  ],
  condemn: [
    'Crime scene sealed. Yellow tape deployed. Square condemned by mayoral decree.',
    'Subpoenaed real estate. No civilian marks permitted in this quadrant.',
    'Structural tampering detected. This cell is under federal quarantine.',
  ],
  rebrand: [
    'Witness tampering: That X has flipped state evidence and is now an O.',
    'Forensic reinvestigation shows this mark was always property of The House.',
    'Reclassified as syndicate collateral. Your cooperation is noted.',
  ],
  obstruction: [
    'A tie? There are no draws in this precinct. Eviction notice executed.',
    'Stalemates are a violation of municipal peace. The House seizes the board.',
    'The court cannot adjourn without a verdict. The House claims the win.',
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Plans the House referee's turn.
 */
export function planHouseTurn(inputBoard, ctx) {
  const {
    turn = 1,
    matchNumber = 1,
    tier = Math.min(5, matchNumber),
    composure,
    isAudited = false,
  } = ctx;

  const condemned = new Set(ctx.condemned || []);
  let board = [...inputBoard];
  const steps = [];
  const cheatEvents = [];

  const commit = ({
    changes = [],
    message = '',
    delay = 650,
    cheatEvent = null,
    cue = null,
    sound = 'typewriter'
  }) => {
    for (const [idx, mark] of changes) {
      if (idx != null) board[idx] = mark;
    }
    const changed = changes.map(([idx]) => idx).filter(i => i != null);
    if (cheatEvent) cheatEvents.push(cheatEvent);

    steps.push({
      board: [...board],
      condemned: new Set(condemned),
      changed,
      message,
      delay,
      cheatEvent,
      cue,
      sound,
    });
  };

  // 1. AUDIT CHECK: Court injunction halts the House
  if (isAudited) {
    commit({
      changes: [],
      message: '⚖️ COURT INJUNCTION IN EFFECT: Syndicate operations frozen for one turn.',
      delay: 700,
      cue: 'audit-pause',
      sound: 'camera'
    });
    return { steps, finalBoard: board, condemned, cheatEvents };
  }

  // 2. SACRED INVARIANT: Intercept completed player line immediately
  const playerWins = winningLines(board, 'X');
  if (playerWins.length > 0) {
    const winLine = playerWins[0];
    const victim = winLine[1] !== undefined ? winLine[1] : winLine[0];

    if (tier >= 4 && Math.random() > 0.45) {
      // Rebrand victim X -> O
      const msg = pickRandom(NOIR_VOICES.rebrand);
      commit({
        changes: [[victim, 'O']],
        message: `[WITNESS FLIPPED] ${msg}`,
        delay: 800,
        cue: 'rebrand',
        sound: 'stamp-heavy',
        cheatEvent: {
          exhibitClass: 'identityFraud',
          statute: '§16.0 BRAND-11',
          message: msg,
          details: { cell: victim, from: 'X', to: 'O' }
        }
      });
    } else {
      // Redact / Erase victim X
      const msg = pickRandom(NOIR_VOICES.offside);
      commit({
        changes: [[victim, null]],
        message: `[EVIDENCE REDACTED] ${msg}`,
        delay: 800,
        cue: 'vaporize',
        sound: 'shred',
        cheatEvent: {
          exhibitClass: 'erasure',
          statute: '§4.1 ERA-01',
          message: msg,
          details: { cell: victim, action: 'erasure' }
        }
      });
    }
  }

  // 3. IMMEDIATE WIN CHECK (The House wins cleanly if possible)
  let houseWins = immediateWins(board, 'O', condemned);
  if (houseWins.length > 0) {
    const winIdx = houseWins[0];
    commit({
      changes: [[winIdx, 'O']],
      message: 'Case closed. The Syndicate takes the verdict.',
      delay: 550,
      cue: 'win',
      sound: 'stamp-heavy'
    });
    return { steps, finalBoard: board, condemned, cheatEvents };
  }

  // 4. STRATEGIC PLAY & CORNERED CORRUPTION
  const playerThreats = immediateWins(board, 'X', condemned);
  const isPlayerThreatening = playerThreats.length > 0;
  const playerForks = forks(board, 'X', condemned);
  const isPlayerForking = playerForks.length > 0;

  // If player threatened or created an unavoidable fork:
  if (isPlayerThreatening || isPlayerForking) {
    // If player has a fork (2 simultaneous wins) or tier >= 3, syndicate cheats before moving:
    if (tier >= 3 && Math.random() > 0.4 && condemned.size < 3) {
      // Condemn one of the critical cells
      const targetCell = isPlayerThreatening ? playerThreats[0] : playerForks[0];
      condemned.add(targetCell);
      const msg = pickRandom(NOIR_VOICES.condemn);
      commit({
        changes: [],
        message: `[CRIME SCENE SEALED] ${msg}`,
        delay: 750,
        cue: 'condemn',
        sound: 'stamp-heavy',
        cheatEvent: {
          exhibitClass: 'structural',
          statute: '§12.3 STRUCT-09',
          message: msg,
          details: { cell: targetCell, action: 'condemnation' }
        }
      });
    } else if (tier >= 4 && isPlayerForking && Math.random() > 0.35) {
      // Convert one of the player's pieces
      const xCells = squares(board, 'X');
      if (xCells.length > 0) {
        const victim = pickRandom(xCells);
        const msg = pickRandom(NOIR_VOICES.rebrand);
        commit({
          changes: [[victim, 'O']],
          message: `[WITNESS FLIPPED] ${msg}`,
          delay: 800,
          cue: 'rebrand',
          sound: 'stamp-heavy',
          cheatEvent: {
            exhibitClass: 'identityFraud',
            statute: '§16.0 BRAND-11',
            message: msg,
            details: { cell: victim, from: 'X', to: 'O' }
          }
        });
      }
    } else if (isPlayerThreatening && Math.random() > 0.5) {
      // Slap redaction on one of their marks
      const xCells = squares(board, 'X');
      if (xCells.length > 0) {
        const victim = pickRandom(xCells);
        const msg = pickRandom(NOIR_VOICES.erasure);
        commit({
          changes: [[victim, null]],
          message: `[EVIDENCE REDACTED] ${msg}`,
          delay: 750,
          cue: 'vaporize',
          sound: 'shred',
          cheatEvent: {
            exhibitClass: 'erasure',
            statute: '§4.1 ERA-01',
            message: msg,
            details: { cell: victim, action: 'erasure' }
          }
        });
      }
    }
  }

  // 5. HOUSE MOVE SELECTION (Tactical AI)
  let open = openSquares(board, condemned);

  // If no open squares remain -> ANTI-DRAW TAMPERING
  if (open.length === 0) {
    const xMarks = squares(board, 'X');
    if (xMarks.length > 0) {
      const victim = pickRandom(xMarks);
      const msg = pickRandom(NOIR_VOICES.obstruction);
      commit({
        changes: [[victim, 'O']],
        message: `[STALEMATE OVERRULED] ${msg}`,
        delay: 800,
        cue: 'anti-draw',
        sound: 'stamp-heavy',
        cheatEvent: {
          exhibitClass: 'obstruction',
          statute: '§22.4 COMP-99',
          message: msg,
          details: { cell: victim, action: 'draw-suppression' }
        }
      });
      return { steps, finalBoard: board, condemned, cheatEvents };
    }
  }

  // Tactical placement selection
  houseWins = immediateWins(board, 'O', condemned);
  let placeIdx;

  if (houseWins.length > 0) {
    placeIdx = houseWins[0];
  } else {
    const remainingThreats = immediateWins(board, 'X', condemned);
    if (remainingThreats.length > 0) {
      // Block player
      placeIdx = remainingThreats[0];
    } else if (open.includes(4)) {
      // Center control
      placeIdx = 4;
    } else {
      // Corners or first good square
      const corners = [0, 2, 6, 8].filter(c => open.includes(c));
      placeIdx = corners.length > 0 ? pickRandom(corners) : pickRandom(open);
    }
  }

  if (placeIdx != null) {
    commit({
      changes: [[placeIdx, 'O']],
      message: 'The Syndicate stamps the record.',
      delay: 500,
      cue: 'place-o',
      sound: 'stamp-light'
    });
  }

  // 6. TIER 2+ DOUBLE-CROSS (Consecutive Turn)
  const isWinningNow = winner(board, 'O') !== null;
  const rollDouble = (tier >= 2 && !isWinningNow && Math.random() > 0.45) || (tier >= 3 && Math.random() > 0.4);

  if (rollDouble) {
    open = openSquares(board, condemned);
    if (open.length > 0) {
      const quickWins = immediateWins(board, 'O', condemned);
      const doubleIdx = quickWins.length > 0 ? quickWins[0] : pickRandom(open);
      const msg = pickRandom(NOIR_VOICES.doubleDealing);

      commit({
        changes: [[doubleIdx, 'O']],
        message: `[CORRUPT ADDENDUM] ${msg}`,
        delay: 750,
        cue: 'double-deal',
        sound: 'stamp-heavy',
        cheatEvent: {
          exhibitClass: 'doubleDealing',
          statute: '§7.2 DBL-04',
          message: msg,
          details: { cell: doubleIdx, consecutive: true }
        }
      });
    }
  }

  // 7. FINAL SACRED INVARIANT SAFETY
  const finalWins = winningLines(board, 'X');
  if (finalWins.length > 0) {
    const line = finalWins[0];
    const victim = line[0];
    commit({
      changes: [[victim, 'O']],
      message: '[EXECUTIVE ORDER] That line has been reclassified as State Evidence.',
      delay: 700,
      cue: 'rebrand',
      sound: 'stamp-heavy',
      cheatEvent: {
        exhibitClass: 'obstruction',
        statute: '§22.4 COMP-99',
        message: 'Emergency line nullification to maintain the status quo.',
        details: { cell: victim }
      }
    });
  }

  return { steps, finalBoard: board, condemned, cheatEvents };
}
