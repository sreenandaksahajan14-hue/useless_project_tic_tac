/**
 * Noir Incident Dossier Component
 * Renders paper evidence exhibits, stamped violations, and the indictment seal action.
 */

import { EXHIBIT_CLASSES } from '../engine/evidence.js';

export class IncidentLog {
  constructor({
    feedElement,
    trackerElement,
    pressChargesButton,
    pointsElement,
    onPressCharges
  }) {
    this.feedElement = feedElement;
    this.trackerElement = trackerElement;
    this.pressChargesButton = pressChargesButton;
    this.pointsElement = pointsElement;
    this.onPressCharges = onPressCharges;

    this.initTracker();
    this.initEvents();
  }

  initTracker() {
    this.trackerElement.innerHTML = '';
    for (const [key, info] of Object.entries(EXHIBIT_CLASSES)) {
      const chip = document.createElement('div');
      chip.className = 'exhibit-stamp-chip';
      chip.dataset.class = key;
      chip.textContent = `${info.letter}`;
      chip.title = `${info.badge}: ${info.label}`;
      this.trackerElement.appendChild(chip);
    }
  }

  initEvents() {
    this.pressChargesButton.addEventListener('click', () => {
      if (this.pressChargesButton.classList.contains('ready')) {
        this.onPressCharges();
      }
    });
  }

  render(bank) {
    // 1. Evidence Points
    if (this.pointsElement) {
      this.pointsElement.textContent = `${bank.totalViolations} Evidence Points`;
    }

    // 2. Exhibit Stamps
    for (const [key, count] of Object.entries(bank.exhibits)) {
      const chip = this.trackerElement.querySelector(`[data-class="${key}"]`);
      if (chip) {
        if (count > 0) {
          chip.classList.add('unlocked');
          chip.textContent = `[EX ${EXHIBIT_CLASSES[key].letter}: ${count}]`;
        } else {
          chip.classList.remove('unlocked');
          chip.textContent = `${EXHIBIT_CLASSES[key].letter}`;
        }
      }
    }

    // 3. Incident Scroll Feed
    if (bank.history.length === 0) {
      this.feedElement.innerHTML = `
        <div class="incident-empty">
          [DOSSIER CURRENTLY UNSEALED]<br>
          Corner the Syndicate to document blatant procedural corruption.
        </div>
      `;
    } else {
      this.feedElement.innerHTML = '';
      bank.history.forEach(inc => {
        const item = document.createElement('div');
        item.className = 'incident-item';
        item.innerHTML = `
          <div class="incident-meta">
            <span class="incident-badge">${inc.badge}</span>
            <span>${inc.timestamp}</span>
          </div>
          <div class="incident-statute">${inc.statute}: ${inc.label}</div>
          <div class="incident-desc">"${inc.message}"</div>
        `;
        this.feedElement.appendChild(item);
      });
    }

    // 4. Press Charges Stamp Button
    if (bank.chargesAvailable && !bank.chargesPressed) {
      this.pressChargesButton.classList.add('ready');
      this.pressChargesButton.disabled = false;
      this.pressChargesButton.innerHTML = '⚖️ SEAL INDICTMENT & TAKE TO COURT';
    } else if (bank.chargesPressed) {
      this.pressChargesButton.classList.remove('ready');
      this.pressChargesButton.disabled = true;
      this.pressChargesButton.innerHTML = '✅ CASE SUBMITTED // UNDER INQUEST';
    } else {
      this.pressChargesButton.classList.remove('ready');
      this.pressChargesButton.disabled = true;
      const distinct = Object.values(bank.exhibits).filter(c => c > 0).length;
      this.pressChargesButton.innerHTML = `[SEAL INDICTMENT: ${distinct}/5 EXHIBITS]`;
    }
  }
}
