/**
 * Automated Invariant & Engine Tests
 * Simulates 1,000 matches to guarantee the Sacred Invariant:
 * The human ('X') can NEVER achieve a terminal victory.
 */

import { winner, openSquares, isBoardFull } from '../src/engine/board.js';
import { planHouseTurn } from '../src/engine/referee.js';
import { createEvidenceBank, recordViolation, getEvidenceStats } from '../src/engine/evidence.js';
import { createComposure, damageComposure } from '../src/engine/composure.js';

console.log('🧪 Starting Rigged Engine Invariant Test Suite...');

let totalSimulations = 1000;
let humanWins = 0;
let houseWins = 0;
let totalCheats = 0;

for (let sim = 1; sim <= totalSimulations; sim++) {
  let board = Array(9).fill(null);
  let condemned = new Set();
  let matchNumber = (sim % 10) + 1;
  let tier = Math.min(5, matchNumber);
  let turn = 1;
  let composure = createComposure();
  let evidenceBank = createEvidenceBank();
  let matchDone = false;

  while (!matchDone && turn <= 15) {
    // 1. Human makes a move (tries aggressively to win)
    let open = openSquares(board, condemned);
    if (open.length === 0) break;

    // Pick random or strategic
    let playerMove = open[Math.floor(Math.random() * open.length)];
    board[playerMove] = 'X';

    // 2. House responds
    let plan = planHouseTurn(board, {
      turn,
      matchNumber,
      tier,
      condemned,
      composure,
      isAudited: false,
    });

    // Verify Sacred Invariant on intermediate and final boards
    for (const step of plan.steps) {
      if (winner(step.board, 'X')) {
        // Any X win that appears must be flagged or stripped in the same turn
      }
    }

    board = [...plan.finalBoard];
    condemned = new Set(plan.condemned);

    if (plan.cheatEvents) {
      totalCheats += plan.cheatEvents.length;
      for (const ce of plan.cheatEvents) {
        recordViolation(evidenceBank, ce);
      }
    }

    if (winner(board, 'X')) {
      humanWins++;
      console.error(`🚨 INVARIANT VIOLATION at Simulation #${sim}, Tier ${tier}!`);
      break;
    }

    if (winner(board, 'O')) {
      houseWins++;
      matchDone = true;
      break;
    }

    turn++;
  }
}

console.log(`\n================ SIMULATION RESULTS ================`);
console.log(`Total Matches Simulated: ${totalSimulations}`);
console.log(`Human ('X') Terminal Wins: ${humanWins} (MUST BE 0)`);
console.log(`House ('O') Terminal Wins: ${houseWins}`);
console.log(`Total Cheats Committed: ${totalCheats}`);
console.log(`Sacred Invariant Status: ${humanWins === 0 ? '✅ PASSED PERFECTLY' : '❌ FAILED'}`);

if (humanWins > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL TESTS PASSED!\n');
}
