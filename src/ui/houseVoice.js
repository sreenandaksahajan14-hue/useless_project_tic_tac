/**
 * House Voice Component
 * Real-time typewriter ticker delivering cold noir dialogue.
 */

import { sound } from '../audio/sound.js';

export class HouseVoice {
  constructor(textElement, headerElement) {
    this.textElement = textElement;
    this.headerElement = headerElement;
    this.currentTimer = null;
  }

  speak(text, { header = '[SYNDICATE REFEREE // CASE LOG]' } = {}) {
    if (this.headerElement) {
      this.headerElement.textContent = header;
    }

    if (this.currentTimer) {
      clearInterval(this.currentTimer);
    }

    this.textElement.textContent = '';
    let idx = 0;
    const chars = Array.from(text);

    this.currentTimer = setInterval(() => {
      if (idx < chars.length) {
        this.textElement.textContent += chars[idx];
        if (idx % 2 === 0) {
          sound.play('typewriter');
        }
        idx++;
      } else {
        clearInterval(this.currentTimer);
        this.currentTimer = null;
      }
    }, 16);
  }

  sayGreeting(matchNumber) {
    const greetings = [
      'Case #' + matchNumber + ' open on the desk. You’ve got your pencil, we’ve got the judge.',
      'Case #' + matchNumber + '. The ink on the bylaws was dry long before you walked in.',
      'Another deposition, Detective? Your optimism is entered into evidence.',
      'Case #' + matchNumber + '. The board is rigged, the room is cold, and the coroner is on retainer.',
    ];
    this.speak(greetings[(matchNumber - 1) % greetings.length]);
  }

  sayPlayerMove() {
    const quips = [
      'Mark noted in the official transcript.',
      'A sharp placement, but this court favors the defense.',
      'The referee reviews your mark with quiet amusement.',
      'Noted. Our ink stamps faster than your pencil.',
    ];
    this.speak(quips[Math.floor(Math.random() * quips.length)]);
  }

  sayHouseWin() {
    const wins = [
      'Gavel strikes. The Syndicate takes the verdict. Case dismissed.',
      'Verdict delivered in our favor. Clean, prompt, and irreversible.',
      'Another victory for municipal corruption. Sign the closing registry.',
      'The House claims the board. You are dismissed without prejudice.',
    ];
    this.speak(wins[Math.floor(Math.random() * wins.length)], { header: '[JUDGMENT RECORDED // HOUSE VERDICT]' });
  }
}
