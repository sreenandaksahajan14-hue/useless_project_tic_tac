/**
 * Noir Courtroom Tribunal Component
 * Climax: The People v. The Syndicate. Unsealed official docket with rubber stamps.
 */

import { sound } from '../audio/sound.js';
import { EXHIBIT_CLASSES } from '../engine/evidence.js';

export class TribunalModal {
  constructor(modalElement, onDismiss) {
    this.modal = modalElement;
    this.onDismiss = onDismiss;
  }

  show(evidenceBank, composure, matchNumber) {
    sound.play('siren');
    this.modal.classList.add('active');

    const exhibitsListHtml = Object.entries(EXHIBIT_CLASSES).map(([key, def]) => {
      const count = evidenceBank.exhibits[key] || 0;
      return `
        <div class="exhibit-summary-row">
          <span>${def.badge}: ${def.label}</span>
          <span class="exhibit-count">${count} Count(s)</span>
        </div>
      `;
    }).join('');

    this.modal.innerHTML = `
      <div class="tribunal-shell">
        <div class="tribunal-tape"></div>
        <div class="tribunal-header">
          <div class="court-docket">IN THE SPECIAL COURT OF ARBITRATION // DOCKET #1948-NOIR</div>
          <h2 class="court-title">THE PEOPLE <span>v.</span> THE HOUSE</h2>
        </div>

        <div class="gavel-animation-area">
          <span class="gavel-icon" id="tribunal-gavel">🔨</span>
        </div>

        <div class="tribunal-section">
          <div class="section-label">FORENSIC INDICTMENT // UNSEALED EVIDENCE</div>
          ${exhibitsListHtml}
        </div>

        <div class="tribunal-section">
          <div class="section-label">DEFENSE STATEMENT BY SYNDICATE COUNSEL</div>
          <p class="defense-statement">
            "Your Honor, the plaintiff entered this room of their own volition. 
            Under Municipal Ordinance 481, the Syndicate maintains proprietary rights to all straight lines, 
            diagonals, and corners. The player's marks were confiscated in accordance with civil asset forfeiture."
          </p>
        </div>

        <div class="verdict-stamp-box">
          <div class="verdict-stamp">GUILTY AS CHARGED</div>
          <p class="verdict-explanation">
            The Tribunal finds the House GUILTY on all counts of mark redaction, double-dealing, 
            and structural corruption across ${matchNumber} depositions.
          </p>
        </div>

        <div class="settlement-card">
          <div class="settlement-title">💼 CORPORATE COMPROMISE OFFER</div>
          <div class="settlement-desc">
            "Because the Syndicate owns the courthouse, the sheriff, and the printing press, 
            incarceration is impractical. As an alternative, we offer you:
            <br><br>
            <strong>CHIEF INVESTIGATOR OF COMPLIANCE</strong><br>
            <em>Salary: $0.00/yr + 1 Fresh Typewriter Ribbon + Official Immunity</em>"
          </div>
        </div>

        <div class="tribunal-actions">
          <button class="btn-stamp-primary" id="btn-copy-indictment">📋 COPY VERDICT REPORT</button>
          <button class="btn-stamp-secondary" id="btn-continue-season">RE-OPEN CASE (NEW GAME+)</button>
        </div>
      </div>
    `;

    // Trigger gavel smash and heavy stamp sound
    setTimeout(() => {
      const gavel = document.getElementById('tribunal-gavel');
      if (gavel) {
        gavel.classList.add('gavel-slam');
        sound.play('gavel');
      }
    }, 350);

    // Event listeners
    const copyBtn = document.getElementById('btn-copy-indictment');
    copyBtn.addEventListener('click', () => {
      const summary = `GRAND JURY INDICTMENT: THE PEOPLE v. THE HOUSE\n` +
        `Docket #1948-NOIR | Depositions: ${matchNumber}\n` +
        `Violations Documented: ${evidenceBank.totalViolations}\n` +
        `Distinct Exhibits Admitted: 5/5\n` +
        `Syndicate Composure: ${composure.value}% (${composure.stage})\n` +
        `Verdict: GUILTY ON ALL COUNTS.\n` +
        `Settlement: Offered position as Chief Investigator of Compliance.`;
      
      navigator.clipboard.writeText(summary).then(() => {
        copyBtn.textContent = 'TRANSCRIPT COPIED!';
        setTimeout(() => {
          copyBtn.textContent = '📋 COPY VERDICT REPORT';
        }, 2000);
      });
    });

    const continueBtn = document.getElementById('btn-continue-season');
    continueBtn.addEventListener('click', () => {
      this.close();
      if (this.onDismiss) this.onDismiss();
    });
  }

  close() {
    this.modal.classList.remove('active');
  }
}
