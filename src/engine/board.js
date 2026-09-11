/**
 * Board Engine for Tic-Tac-Cheat
 * Handles 3x3 board geometry, line evaluations, and threat detection.
 */

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const CORNERS = [0, 2, 6, 8];
export const EDGES = [1, 3, 5, 7];
export const CENTER = 4;

/**
 * Returns the winning line array [a, b, c] if `mark` has 3 in a row, else null.
 */
export function winner(board, mark) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] === mark && board[b] === mark && board[c] === mark) {
      return line;
    }
  }
  return null;
}

/**
 * Returns all winning lines for `mark`.
 */
export function winningLines(board, mark) {
  return LINES.filter(([a, b, c]) => board[a] === mark && board[b] === mark && board[c] === mark);
}

/**
 * Returns indices of all empty squares not condemned.
 */
export function openSquares(board, condemned = new Set()) {
  const open = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null && !condemned.has(i)) {
      open.push(i);
    }
  }
  return open;
}

/**
 * Returns indices of squares containing `mark`.
 */
export function squares(board, mark) {
  const result = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === mark) result.push(i);
  }
  return result;
}

/**
 * Returns empty squares where placing `mark` would create an immediate win.
 */
export function immediateWins(board, mark, condemned = new Set()) {
  const open = openSquares(board, condemned);
  return open.filter(i => {
    const next = [...board];
    next[i] = mark;
    return winner(next, mark) !== null;
  });
}

/**
 * Returns empty squares where placing `mark` creates 2 or more winning threats.
 */
export function forks(board, mark, condemned = new Set()) {
  const open = openSquares(board, condemned);
  return open.filter(i => {
    const next = [...board];
    next[i] = mark;
    return immediateWins(next, mark, condemned).length >= 2;
  });
}

/**
 * Checks if the board is full (no open valid squares).
 */
export function isBoardFull(board, condemned = new Set()) {
  return openSquares(board, condemned).length === 0;
}
