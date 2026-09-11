/**
 * Noir Countermeasures (Signed Warrants) Component
 */

export const COUNTERMEASURES = [
  {
    id: 'subpoena',
    name: '📜 SUBPOENA DUCES TECUM',
    cost: 2,
    desc: 'Compels the Syndicate to declare its next corrupt maneuver.',
    sound: 'camera',
  },
  {
    id: 'freeze',
    name: '📸 EVIDENCE PHOTO',
    cost: 3,
    desc: 'Catches the referee red-handed. The last turn is struck from the record.',
    sound: 'objection',
  },
  {
    id: 'whistleblower',
    name: '📢 PRESS LEAK',
    cost: 4,
    desc: 'Front-page story in The Chronicle: -35 Syndicate Composure.',
    sound: 'siren',
  },
  {
    id: 'audit',
    name: '⚖️ COURT INJUNCTION',
    cost: 5,
    desc: 'Emergency federal freeze: The House skips its next turn.',
    sound: 'stamp-heavy',
  },
];

export class CountermeasureBar {
  constructor(containerElement, onAction) {
    this.container = containerElement;
    this.onAction = onAction;
    this.init();
  }

  init() {
    this.container.innerHTML = '';
    COUNTERMEASURES.forEach(cm => {
      const btn = document.createElement('button');
      btn.className = 'cm-warrant-btn';
      btn.id = `cm-btn-${cm.id}`;
      btn.dataset.id = cm.id;
      btn.innerHTML = `
        <div class="warrant-title">
          <span>${cm.name}</span>
          <span>${cm.cost} PTS</span>
        </div>
        <div class="warrant-desc">${cm.desc}</div>
      `;
      btn.addEventListener('click', () => this.onAction(cm));
      this.container.appendChild(btn);
    });
  }

  update(currentPoints, canFreeze = false) {
    COUNTERMEASURES.forEach(cm => {
      const btn = this.container.querySelector(`[data-id="${cm.id}"]`);
      if (btn) {
        let isEligible = currentPoints >= cm.cost;
        if (cm.id === 'freeze' && !canFreeze) {
          isEligible = false;
        }
        btn.disabled = !isEligible;
      }
    });
  }
}
