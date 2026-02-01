/**
 * Beam Brawlers - Fighter Logic Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createFighter,
  isOnBeam,
  isNearEdge,
  getFighterDistance,
  areInGrappleRange,
  canAct,
  canGrapple,
  canBePinned,
  canAttemptPin,
  updateBalance,
  updateStamina,
  moveFighter,
  transitionState,
  awardScore,
} from '../src/game/logic/fighter';
import {
  BEAM_LEFT,
  BEAM_RIGHT,
  MAX_BALANCE,
  MAX_STAMINA,
} from '../src/game/constants';

describe('Fighter Creation', () => {
  it('should create a fighter with correct initial values', () => {
    const fighter = createFighter('player', 400, 'right');
    
    expect(fighter.id).toBe('player');
    expect(fighter.x).toBe(400);
    expect(fighter.facing).toBe('right');
    expect(fighter.state).toBe('Idle');
    expect(fighter.balance).toBe(MAX_BALANCE);
    expect(fighter.stamina).toBe(MAX_STAMINA);
    expect(fighter.score).toBe(0);
  });

  it('should create opponent with different id', () => {
    const fighter = createFighter('opponent', 500, 'left');
    expect(fighter.id).toBe('opponent');
    expect(fighter.facing).toBe('left');
  });
});

describe('Beam Position Checks', () => {
  it('should detect fighter on beam', () => {
    const fighter = createFighter('player', (BEAM_LEFT + BEAM_RIGHT) / 2, 'right');
    expect(isOnBeam(fighter)).toBe(true);
  });

  it('should detect fighter off beam (too far left)', () => {
    const fighter = createFighter('player', BEAM_LEFT - 100, 'right');
    expect(isOnBeam(fighter)).toBe(false);
  });

  it('should detect fighter off beam (too far right)', () => {
    const fighter = createFighter('player', BEAM_RIGHT + 100, 'right');
    expect(isOnBeam(fighter)).toBe(false);
  });

  it('should detect when near edge', () => {
    const fighter = createFighter('player', BEAM_LEFT + 30, 'right');
    expect(isNearEdge(fighter, 50)).toBe(true);
  });

  it('should detect when not near edge', () => {
    const fighter = createFighter('player', (BEAM_LEFT + BEAM_RIGHT) / 2, 'right');
    expect(isNearEdge(fighter, 50)).toBe(false);
  });
});

describe('Distance and Range', () => {
  it('should calculate correct distance between fighters', () => {
    const f1 = createFighter('player', 300, 'right');
    const f2 = createFighter('opponent', 400, 'left');
    expect(getFighterDistance(f1, f2)).toBe(100);
  });

  it('should detect fighters in grapple range', () => {
    const f1 = createFighter('player', 300, 'right');
    const f2 = createFighter('opponent', 350, 'left');
    expect(areInGrappleRange(f1, f2, 70)).toBe(true);
  });

  it('should detect fighters out of grapple range', () => {
    const f1 = createFighter('player', 300, 'right');
    const f2 = createFighter('opponent', 500, 'left');
    expect(areInGrappleRange(f1, f2, 70)).toBe(false);
  });
});

describe('Fighter State Checks', () => {
  it('should allow actions when Idle', () => {
    const fighter = createFighter('player', 400, 'right');
    expect(canAct(fighter)).toBe(true);
  });

  it('should allow actions when Moving', () => {
    const fighter = transitionState(createFighter('player', 400, 'right'), 'Moving');
    expect(canAct(fighter)).toBe(true);
  });

  it('should not allow actions when Stunned', () => {
    const fighter = transitionState(createFighter('player', 400, 'right'), 'Stunned', 1);
    expect(canAct(fighter)).toBe(false);
  });

  it('should allow grapple when Idle', () => {
    const fighter = createFighter('player', 400, 'right');
    expect(canGrapple(fighter)).toBe(true);
  });

  it('should not allow grapple when already grappling', () => {
    const fighter = transitionState(createFighter('player', 400, 'right'), 'GrappleEngaged');
    expect(canGrapple(fighter)).toBe(false);
  });

  it('should allow pinning stunned fighter on beam', () => {
    let fighter = createFighter('player', 400, 'right');
    fighter = transitionState(fighter, 'Stunned', 1);
    expect(canBePinned(fighter)).toBe(true);
  });

  it('should not allow pinning fighter not stunned', () => {
    const fighter = createFighter('player', 400, 'right');
    expect(canBePinned(fighter)).toBe(false);
  });

  it('should allow pin attempt with sufficient balance', () => {
    const fighter = createFighter('player', 400, 'right');
    expect(canAttemptPin(fighter, 20)).toBe(true);
  });

  it('should not allow pin attempt with insufficient balance', () => {
    let fighter = createFighter('player', 400, 'right');
    fighter = updateBalance(fighter, -90); // Balance = 10
    expect(canAttemptPin(fighter, 20)).toBe(false);
  });
});

describe('Balance and Stamina Updates', () => {
  it('should increase balance', () => {
    let fighter = createFighter('player', 400, 'right');
    fighter = updateBalance(fighter, -50); // Now 50
    fighter = updateBalance(fighter, 20); // Now 70
    expect(fighter.balance).toBe(70);
  });

  it('should not exceed max balance', () => {
    const fighter = createFighter('player', 400, 'right');
    const updated = updateBalance(fighter, 50);
    expect(updated.balance).toBe(MAX_BALANCE);
  });

  it('should not go below zero balance', () => {
    const fighter = createFighter('player', 400, 'right');
    const updated = updateBalance(fighter, -150);
    expect(updated.balance).toBe(0);
  });

  it('should decrease stamina', () => {
    const fighter = createFighter('player', 400, 'right');
    const updated = updateStamina(fighter, -30);
    expect(updated.stamina).toBe(70);
  });

  it('should not exceed max stamina', () => {
    const fighter = createFighter('player', 400, 'right');
    const updated = updateStamina(fighter, 50);
    expect(updated.stamina).toBe(MAX_STAMINA);
  });
});

describe('Movement', () => {
  it('should move left', () => {
    const fighter = createFighter('player', 500, 'right');
    const moved = moveFighter(fighter, 'left', 0.016); // ~60fps
    expect(moved.x).toBeLessThan(500);
    expect(moved.facing).toBe('left');
    expect(moved.state).toBe('Moving');
  });

  it('should move right', () => {
    const fighter = createFighter('player', 400, 'left');
    const moved = moveFighter(fighter, 'right', 0.016);
    expect(moved.x).toBeGreaterThan(400);
    expect(moved.facing).toBe('right');
  });

  it('should not move past beam left edge', () => {
    const fighter = createFighter('player', BEAM_LEFT + 30, 'right');
    const moved = moveFighter(fighter, 'left', 10); // Large dt to test clamping
    expect(moved.x).toBeGreaterThanOrEqual(BEAM_LEFT + 25); // FIGHTER_WIDTH/2
  });
});

describe('Scoring', () => {
  it('should award score', () => {
    const fighter = createFighter('player', 400, 'right');
    const scored = awardScore(fighter, 200);
    expect(scored.score).toBe(200);
  });

  it('should accumulate score', () => {
    let fighter = createFighter('player', 400, 'right');
    fighter = awardScore(fighter, 100);
    fighter = awardScore(fighter, 150);
    expect(fighter.score).toBe(250);
  });
});
