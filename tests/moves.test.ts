/**
 * Beam Brawlers - Move Logic Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateMove,
  calculateMoveScore,
  getMoveTiming,
  getMoveRequirements,
  getMoveName,
} from '../src/game/logic/moves';
import { createFighter, transitionState, updateBalance, updateStamina } from '../src/game/logic/fighter';
import { MOVE_REQUIREMENTS, SCORING, BEAM_LEFT, BEAM_RIGHT, GRAPPLE_RANGE } from '../src/game/constants';

describe('Move Validation', () => {
  const createGrapplingFighters = () => {
    const center = (BEAM_LEFT + BEAM_RIGHT) / 2;
    let player = createFighter('player', center - 30, 'right');
    let opponent = createFighter('opponent', center + 30, 'left');
    player = transitionState(player, 'GrappleEngaged');
    opponent = transitionState(opponent, 'GrappleEngaged');
    return { player, opponent };
  };

  it('should allow Pancake with sufficient balance and stamina', () => {
    const { player, opponent } = createGrapplingFighters();
    const result = validateMove(player, opponent, 'pancake');
    expect(result.canExecute).toBe(true);
  });

  it('should reject Pancake with insufficient balance', () => {
    let { player, opponent } = createGrapplingFighters();
    player = updateBalance(player, -80); // Balance = 20, need 30
    const result = validateMove(player, opponent, 'pancake');
    expect(result.canExecute).toBe(false);
    expect(result.reason).toContain('balance');
  });

  it('should reject Pancake with insufficient stamina', () => {
    let { player, opponent } = createGrapplingFighters();
    player = updateStamina(player, -90); // Stamina = 10, need 25
    const result = validateMove(player, opponent, 'pancake');
    expect(result.canExecute).toBe(false);
    expect(result.reason).toContain('stamina');
  });

  it('should reject move when not grappling', () => {
    const center = (BEAM_LEFT + BEAM_RIGHT) / 2;
    const player = createFighter('player', center - 30, 'right'); // Idle
    const opponent = createFighter('opponent', center + 30, 'left');
    const result = validateMove(player, opponent, 'pancake');
    expect(result.canExecute).toBe(false);
    expect(result.reason).toContain('grappling');
  });

  it('should reject move when out of range', () => {
    const center = (BEAM_LEFT + BEAM_RIGHT) / 2;
    let player = createFighter('player', center - 100, 'right');
    let opponent = createFighter('opponent', center + 100, 'left');
    player = transitionState(player, 'GrappleEngaged');
    const result = validateMove(player, opponent, 'pancake');
    expect(result.canExecute).toBe(false);
    expect(result.reason).toContain('range');
  });

  it('should allow Scissors with sufficient balance (40)', () => {
    const { player, opponent } = createGrapplingFighters();
    const result = validateMove(player, opponent, 'scissors');
    expect(result.canExecute).toBe(true);
  });

  it('should reject Scissors with insufficient balance', () => {
    let { player, opponent } = createGrapplingFighters();
    player = updateBalance(player, -70); // Balance = 30, need 40
    const result = validateMove(player, opponent, 'scissors');
    expect(result.canExecute).toBe(false);
  });

  it('should allow Guillotine with sufficient balance (50)', () => {
    const { player, opponent } = createGrapplingFighters();
    const result = validateMove(player, opponent, 'guillotine');
    expect(result.canExecute).toBe(true);
  });

  it('should reject Guillotine with insufficient balance', () => {
    let { player, opponent } = createGrapplingFighters();
    player = updateBalance(player, -60); // Balance = 40, need 50
    const result = validateMove(player, opponent, 'guillotine');
    expect(result.canExecute).toBe(false);
  });
});

describe('Move Scoring', () => {
  it('should calculate base points for Pancake', () => {
    const center = (BEAM_LEFT + BEAM_RIGHT) / 2;
    let player = createFighter('player', center, 'right');
    player = updateBalance(player, -30); // Balance = 70 (below bonus threshold)
    
    const result = calculateMoveScore('pancake', player, Date.now());
    expect(result.points).toBe(SCORING.moves.pancake); // 200
    expect(result.bonuses.balance).toBe(false);
  });

  it('should add balance bonus when balance >= 80', () => {
    const center = (BEAM_LEFT + BEAM_RIGHT) / 2;
    const player = createFighter('player', center, 'right'); // Balance = 100
    
    const result = calculateMoveScore('pancake', player, Date.now());
    expect(result.bonuses.balance).toBe(true);
    expect(result.points).toBeGreaterThan(SCORING.moves.pancake);
  });

  it('should calculate correct points for Scissors', () => {
    const center = (BEAM_LEFT + BEAM_RIGHT) / 2;
    let player = createFighter('player', center, 'right');
    player = updateBalance(player, -30);
    
    const result = calculateMoveScore('scissors', player, Date.now());
    expect(result.points).toBe(SCORING.moves.scissors); // 150
  });

  it('should calculate correct points for Guillotine', () => {
    const center = (BEAM_LEFT + BEAM_RIGHT) / 2;
    let player = createFighter('player', center, 'right');
    player = updateBalance(player, -30);
    
    const result = calculateMoveScore('guillotine', player, Date.now());
    expect(result.points).toBe(SCORING.moves.guillotine); // 250
  });
});

describe('Move Configuration', () => {
  it('should return correct timing for Pancake', () => {
    const timing = getMoveTiming('pancake');
    expect(timing.duration).toBe(0.8);
    expect(timing.counterWindow).toBe(0.3);
    expect(timing.stunDuration).toBe(1.0);
  });

  it('should return correct timing for Scissors', () => {
    const timing = getMoveTiming('scissors');
    expect(timing.duration).toBe(1.2);
    expect(timing.balanceDrainRate).toBe(40);
  });

  it('should return correct timing for Guillotine', () => {
    const timing = getMoveTiming('guillotine');
    expect(timing.duration).toBe(1.5);
    expect(timing.stunDuration).toBe(1.2);
  });

  it('should return correct requirements for each move', () => {
    expect(getMoveRequirements('pancake').minBalance).toBe(30);
    expect(getMoveRequirements('scissors').minBalance).toBe(40);
    expect(getMoveRequirements('guillotine').minBalance).toBe(50);
  });

  it('should return correct move names', () => {
    expect(getMoveName('pancake')).toBe('Pancake');
    expect(getMoveName('scissors')).toBe('Scissors');
    expect(getMoveName('guillotine')).toBe('Guillotine');
  });
});
