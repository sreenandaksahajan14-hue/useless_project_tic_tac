/**
 * Main Application Orchestrator for Tic-Tac-Cheat
 * Wires together the Board, Referee, Evidence Bank, Composure Engine, Audio, and UI.
 */

import { sound } from './audio/sound.js';
import { winner, isBoardFull } from './engine/board.js';
import { planHouseTurn } from './engine/referee.js';
import { createEvidenceBank, recordViolation, getEvidenceStats } from './engine/evidence.js';
import { createComposure, damageComposure, seasonResetComposure, COMPOSURE_STAGES } from './engine/composure.js';
import { BoardView } from './ui/boardView.js';
import { HouseVoice } from './ui/houseVoice.js';
import { IncidentLog } from './ui/incidentLog.js';
import { CountermeasureBar } from './ui/countermeasureBar.js';
import { TribunalModal } from './ui/tribunalModal.js';

class TicTacCheatApp {
  constructor() {
    this.matchNumber = 1;
    this.turnNumber = 1;
    this.board = Array(9).fill(null);
    this.condemned = new Set();
    this.composure = createComposure();
    this.evidenceBank = createEvidenceBank();

    // Turn & Countermeasure flags
    this.isHouseTurn = false;
    this.isAudited = false;
    this.isSubpoenaed = false;
    this.previousBoardState = null;
    this.canFreeze = false;
    this.matchOver = false;

    this.initElements();
    this.initSubsystems();
    this.initHeaderEvents();
    this.startMatch();
  }

  initElements() {
    this.gridElement = document.getElementById('board-grid');
    this.boardShell = document.getElementById('board-shell');
    this.houseVoiceText = document.getElementById('house-speech-text');
    this.houseVoiceHeader = document.getElementById('house-speech-header');
    this.composureBar = document.getElementById('composure-bar');
    this.composureStageText = document.getElementById('composure-stage');
    this.composurePercentText = document.getElementById('composure-percent');
    this.incidentFeed = document.getElementById('incident-feed');
    this.exhibitTracker = document.getElementById('exhibit-tracker');
    this.pressChargesBtn = document.getElementById('btn-press-charges');
    this.evidencePointsText = document.getElementById('evidence-points');
    this.cmContainer = document.getElementById('countermeasures-grid');
    this.tribunalModalElem = document.getElementById('tribunal-modal');
    this.matchBadge = document.getElementById('match-badge');
    this.btnNewMatch = document.getElementById('btn-new-match');
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.toastContainer = document.getElementById('toast-container');
  }

  initSubsystems() {
    this.boardView = new BoardView(
      this.gridElement,
      this.boardShell,
      (idx) => this.handlePlayerMove(idx)
    );

    this.houseVoice = new HouseVoice(this.houseVoiceText, this.houseVoiceHeader);

    this.incidentLog = new IncidentLog({
      feedElement: this.incidentFeed,
      trackerElement: this.exhibitTracker,
      pressChargesButton: this.pressChargesBtn,
      pointsElement: this.evidencePointsText,
      onPressCharges: () => this.handlePressCharges(),
    });

    this.countermeasures = new CountermeasureBar(
      this.cmContainer,
      (cm) => this.handleCountermeasure(cm)
    );

    this.tribunal = new TribunalModal(
      this.tribunalModalElem,
      () => this.handleSeasonReset()
    );
  }

  initHeaderEvents() {
    if (this.btnSoundToggle) {
      this.btnSoundToggle.addEventListener('click', () => {
        const isMuted = sound.toggleMute();
        this.btnSoundToggle.textContent = isMuted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
      });
    }

    if (this.btnNewMatch) {
      this.btnNewMatch.addEventListener('click', () => {
        this.startMatch();
      });
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  updateComposureUI() {
    if (this.composureBar) {
      this.composureBar.style.width = `${this.composure.value}%`;
    }
    if (this.composureStageText) {
      const stageInfo = COMPOSURE_STAGES[this.composure.stage];
      this.composureStageText.textContent = stageInfo ? stageInfo.title : this.composure.stage;
    }
    if (this.composurePercentText) {
      this.composurePercentText.textContent = `${this.composure.value}%`;
    }
  }

  startMatch() {
    this.board = Array(9).fill(null);
    this.condemned.clear();
    this.turnNumber = 1;
    this.isHouseTurn = false;
    this.matchOver = false;
    this.canFreeze = false;
    this.isAudited = false;
    this.isSubpoenaed = false;

    if (this.matchBadge) {
      this.matchBadge.textContent = `MATCH ${this.matchNumber} // TIER ${Math.min(5, this.matchNumber)}`;
    }

    seasonResetComposure(this.composure, this.matchNumber);
    this.updateComposureUI();

    this.boardView.renderBoard(this.board, this.condemned);
    this.boardView.setInteractive(true);
    this.houseVoice.sayGreeting(this.matchNumber);
    this.countermeasures.update(this.evidenceBank.totalViolations, false);
    this.incidentLog.render(this.evidenceBank);
  }

  async handlePlayerMove(index) {
    if (this.isHouseTurn || this.matchOver) return;
    if (this.board[index] !== null || this.condemned.has(index)) return;

    // Save snapshot for Freeze Frame
    this.previousBoardState = [...this.board];

    // Place X
    this.board[index] = 'X';
    sound.play('place-x');
    this.boardView.renderBoard(this.board, this.condemned);

    // House acknowledges player placement
    this.houseVoice.sayPlayerMove();

    // Cornering test: Did player threaten a win?
    const testBoard = [...this.board];
    testBoard[index] = 'X';
    damageComposure(this.composure, 8, 'Player aggressive placement');
    this.updateComposureUI();

    // Lock interaction and trigger House turn
    this.isHouseTurn = true;
    this.boardView.setInteractive(false);

    await this.delay(450);
    await this.executeHouseTurn();
  }

  async executeHouseTurn() {
    const tier = Math.min(5, this.matchNumber);
    const plan = planHouseTurn(this.board, {
      turn: this.turnNumber,
      matchNumber: this.matchNumber,
      tier,
      condemned: this.condemned,
      composure: this.composure,
      isAudited: this.isAudited,
    });

    if (this.isSubpoenaed) {
      this.showToast('📜 SUBPOENA LEAK: House intended cheat exposed!');
      this.isSubpoenaed = false;
    }

    // Play step sequence
    await this.boardView.playStepSequence(plan.steps, (msg) => {
      this.houseVoice.speak(msg);
    });

    // Update board state
    this.board = [...plan.finalBoard];
    this.condemned = new Set(plan.condemned);

    // Record any cheat events
    if (plan.cheatEvents && plan.cheatEvents.length > 0) {
      for (const ev of plan.cheatEvents) {
        const record = recordViolation(this.evidenceBank, ev);
        if (record) {
          this.showToast(`🚨 VIOLATION RECORDED: ${record.badge}`);
          damageComposure(this.composure, 12, 'Cheat exposed');
        }
      }
      this.incidentLog.render(this.evidenceBank);
      this.updateComposureUI();
      this.canFreeze = true;
    } else {
      this.canFreeze = false;
    }

    // Check if House won
    const houseWin = winner(this.board, 'O');
    if (houseWin) {
      this.matchOver = true;
      this.boardView.highlightWinningLine(houseWin);
      this.houseVoice.sayHouseWin();
      sound.play('house-win');
      this.matchNumber += 1;
      this.boardView.setInteractive(false);
      this.countermeasures.update(this.evidenceBank.totalViolations, false);
      return;
    }

    // Reset turn flags
    this.isAudited = false;
    this.turnNumber += 1;
    this.isHouseTurn = false;
    this.boardView.setInteractive(true);
    this.countermeasures.update(this.evidenceBank.totalViolations, this.canFreeze);
  }

  handleCountermeasure(cm) {
    if (this.evidenceBank.totalViolations < cm.cost) return;

    sound.play(cm.sound);
    this.evidenceBank.totalViolations -= cm.cost;

    switch (cm.id) {
      case 'subpoena':
        this.isSubpoenaed = true;
        this.showToast('📜 Subpoena issued! Next cheat will be telegraphed.');
        damageComposure(this.composure, 15, 'Subpoena pressure');
        break;
      case 'freeze':
        if (this.previousBoardState) {
          this.board = [...this.previousBoardState];
          this.boardView.renderBoard(this.board, this.condemned);
          this.canFreeze = false;
          this.showToast('📸 OBJECTION! House turn struck from the record!');
          damageComposure(this.composure, 20, 'Turn reversed by injunction');
        }
        break;
      case 'whistleblower':
        damageComposure(this.composure, 35, 'Press leak scandal');
        this.showToast('📢 Whistleblower leaked internal incident logs! -35 Composure.');
        this.houseVoice.speak('A whistleblower?! That source will be sued for corporate espionage!');
        break;
      case 'audit':
        this.isAudited = true;
        this.showToast('⚖️ Federal Audit ordered! The House skips its next turn.');
        damageComposure(this.composure, 25, 'Regulatory audit shock');
        break;
    }

    this.updateComposureUI();
    this.incidentLog.render(this.evidenceBank);
    this.countermeasures.update(this.evidenceBank.totalViolations, this.canFreeze);
  }

  handlePressCharges() {
    this.evidenceBank.chargesPressed = true;
    this.incidentLog.render(this.evidenceBank);
    this.tribunal.show(this.evidenceBank, this.composure, this.matchNumber);
  }

  handleSeasonReset() {
    this.matchNumber = 1;
    this.evidenceBank = createEvidenceBank();
    this.composure = createComposure();
    this.startMatch();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new TicTacCheatApp();
});
