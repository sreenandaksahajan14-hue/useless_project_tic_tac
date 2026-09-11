/**
 * Board View Component
 * Handles rendering the 3x3 grid, user interactions, and cheat visual effects.
 */

import { sound } from '../audio/sound.js';

export class BoardView {
  constructor(gridElement, boardShellElement, onCellClick) {
    this.gridElement = gridElement;
    this.boardShell = boardShellElement;
    this.onCellClick = onCellClick;
    this.isInteractive = true;
    this.init();
  }

  init() {
    this.gridElement.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.id = `cell-${i}`;
      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('aria-label', `Square ${i + 1}`);

      cell.addEventListener('click', () => this.handleCellClick(i));
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleCellClick(i);
        }
      });

      this.gridElement.appendChild(cell);
    }
  }

  handleCellClick(index) {
    if (!this.isInteractive) return;
    const cell = this.getCell(index);
    if (cell.classList.contains('taken') || cell.classList.contains('condemned')) {
      return;
    }
    this.onCellClick(index);
  }

  getCell(index) {
    return this.gridElement.querySelector(`[data-index="${index}"]`);
  }

  setInteractive(enabled) {
    this.isInteractive = enabled;
  }

  shakeBoard() {
    this.boardShell.classList.remove('shake');
    void this.boardShell.offsetWidth; // Trigger reflow
    this.boardShell.classList.add('shake');
  }

  renderBoard(board, condemned = new Set()) {
    for (let i = 0; i < 9; i++) {
      const cell = this.getCell(i);
      const val = board[i];

      cell.className = 'cell';
      cell.innerHTML = '';

      if (condemned.has(i)) {
        cell.classList.add('condemned');
      }

      if (val === 'X') {
        cell.classList.add('taken');
        const span = document.createElement('span');
        span.className = 'mark-x';
        span.textContent = 'X';
        cell.appendChild(span);
      } else if (val === 'O') {
        cell.classList.add('taken');
        const span = document.createElement('span');
        span.className = 'mark-o';
        span.textContent = 'O';
        cell.appendChild(span);
      }
    }
  }

  /**
   * Plays a sequence of animated steps from the referee.
   */
  async playStepSequence(steps, onStepMessage) {
    this.setInteractive(false);

    for (const step of steps) {
      if (step.message && onStepMessage) {
        onStepMessage(step.message);
      }

      if (step.sound) {
        sound.play(step.sound);
      }

      if (step.cue === 'condemn' || step.cue === 'vaporize' || step.cue === 'rebrand' || step.cue === 'double-deal') {
        this.shakeBoard();
      }

      // Handle custom cues
      if (step.cue === 'vaporize' && step.changed?.length) {
        for (const idx of step.changed) {
          const cell = this.getCell(idx);
          if (cell) {
            cell.classList.add('vaporizing');
          }
        }
        await this.delay(350);
      } else if (step.cue === 'rebrand' && step.changed?.length) {
        for (const idx of step.changed) {
          const cell = this.getCell(idx);
          if (cell) {
            cell.classList.add('rebranding');
          }
        }
        await this.delay(400);
      }

      // Render updated board state
      this.renderBoard(step.board, step.condemned);

      await this.delay(step.delay || 500);
    }

    this.setInteractive(true);
  }

  highlightWinningLine(line) {
    if (!line) return;
    for (const idx of line) {
      const cell = this.getCell(idx);
      if (cell) {
        cell.style.borderColor = 'var(--yellow-hazard)';
        cell.style.boxShadow = '0 0 25px var(--crimson-glow)';
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
