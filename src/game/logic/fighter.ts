/**
 * Beam Brawlers - Fighter Logic
 * Pure functions for fighter state management
 */

import {
  MAX_BALANCE,
  MAX_STAMINA,
  BALANCE_REGEN_RATE,
  STAMINA_REGEN_RATE,
  BALANCE_MOVE_COST,
  STAMINA_MOVE_COST,
  BALANCE_GRAPPLE_DRAIN,
  LOW_STAMINA_THRESHOLD,
  BEAM_LEFT,
  BEAM_RIGHT,
  FIGHTER_WIDTH,
  FIGHTER_SPEED,
} from '../constants';
import type { Fighter, FighterState, FacingDirection } from '../types';

/**
 * Create initial fighter state
 */
export function createFighter(
  id: 'player' | 'opponent',
  x: number,
  facing: FacingDirection
): Fighter {
  return {
    id,
    x,
    y: 0, // Will be set relative to beam
    facing,
    state: 'Idle',
    balance: MAX_BALANCE,
    stamina: MAX_STAMINA,
    score: 0,
    stateTimer: 0,
    currentMove: null,
    comboCount: 0,
    lastMoveTime: 0,
    isDefending: false,
  };
}

/**
 * Check if fighter is on the beam
 */
export function isOnBeam(fighter: Fighter): boolean {
  const left = fighter.x - FIGHTER_WIDTH / 2;
  const right = fighter.x + FIGHTER_WIDTH / 2;
  return left >= BEAM_LEFT && right <= BEAM_RIGHT && fighter.state !== 'Falling';
}

/**
 * Check if fighter is near beam edge (danger zone)
 */
export function isNearEdge(fighter: Fighter, edgeZone: number): boolean {
  const distToLeft = fighter.x - BEAM_LEFT;
  const distToRight = BEAM_RIGHT - fighter.x;
  return distToLeft <= edgeZone || distToRight <= edgeZone;
}

/**
 * Get distance between two fighters
 */
export function getFighterDistance(f1: Fighter, f2: Fighter): number {
  return Math.abs(f1.x - f2.x);
}

/**
 * Check if fighters are in grapple range
 */
export function areInGrappleRange(f1: Fighter, f2: Fighter, range: number): boolean {
  return getFighterDistance(f1, f2) <= range;
}

/**
 * Check if a fighter can perform actions (not stunned, falling, etc.)
 */
export function canAct(fighter: Fighter): boolean {
  return (
    fighter.state === 'Idle' ||
    fighter.state === 'Moving' ||
    fighter.state === 'GrappleEngaged'
  );
}

/**
 * Check if fighter can initiate a grapple
 */
export function canGrapple(fighter: Fighter): boolean {
  return fighter.state === 'Idle' || fighter.state === 'Moving';
}

/**
 * Check if fighter can be pinned
 */
export function canBePinned(fighter: Fighter): boolean {
  return fighter.state === 'Stunned' && isOnBeam(fighter);
}

/**
 * Check if fighter can attempt a pin
 */
export function canAttemptPin(fighter: Fighter, minBalance: number): boolean {
  return (
    (fighter.state === 'Idle' || fighter.state === 'GrappleEngaged') &&
    fighter.balance >= minBalance &&
    isOnBeam(fighter)
  );
}

/**
 * Update fighter balance (clamped to 0-100)
 */
export function updateBalance(fighter: Fighter, delta: number): Fighter {
  const newBalance = Math.max(0, Math.min(MAX_BALANCE, fighter.balance + delta));
  return { ...fighter, balance: newBalance };
}

/**
 * Update fighter stamina (clamped to 0-100)
 */
export function updateStamina(fighter: Fighter, delta: number): Fighter {
  const newStamina = Math.max(0, Math.min(MAX_STAMINA, fighter.stamina + delta));
  return { ...fighter, stamina: newStamina };
}

/**
 * Regenerate balance and stamina for idle fighter
 */
export function regenerate(fighter: Fighter, deltaTime: number): Fighter {
  if (fighter.state !== 'Idle' && fighter.state !== 'Moving') {
    return fighter;
  }

  // Only regen when truly idle (not moving)
  const isIdle = fighter.state === 'Idle';
  const balanceRegen = isIdle ? BALANCE_REGEN_RATE * deltaTime : 0;
  const staminaRegen = STAMINA_REGEN_RATE * deltaTime * (isIdle ? 1 : 0.5);

  return {
    ...fighter,
    balance: Math.min(MAX_BALANCE, fighter.balance + balanceRegen),
    stamina: Math.min(MAX_STAMINA, fighter.stamina + staminaRegen),
  };
}

/**
 * Apply movement costs to fighter
 */
export function applyMovementCosts(fighter: Fighter, deltaTime: number): Fighter {
  const balanceCost = BALANCE_MOVE_COST * deltaTime;
  const staminaCost = STAMINA_MOVE_COST * deltaTime;

  // Low stamina increases balance loss
  const staminaMultiplier = fighter.stamina < LOW_STAMINA_THRESHOLD ? 1.5 : 1;

  return {
    ...fighter,
    balance: Math.max(0, fighter.balance - balanceCost * staminaMultiplier),
    stamina: Math.max(0, fighter.stamina - staminaCost),
  };
}

/**
 * Apply grapple costs to fighter
 */
export function applyGrappleCosts(fighter: Fighter, deltaTime: number): Fighter {
  const balanceDrain = BALANCE_GRAPPLE_DRAIN * deltaTime;
  return {
    ...fighter,
    balance: Math.max(0, fighter.balance - balanceDrain),
  };
}

/**
 * Move fighter along beam
 */
export function moveFighter(
  fighter: Fighter,
  direction: 'left' | 'right',
  deltaTime: number
): Fighter {
  const speedMultiplier = fighter.stamina < LOW_STAMINA_THRESHOLD ? 0.6 : 1;
  const moveAmount = FIGHTER_SPEED * deltaTime * speedMultiplier;
  const newX =
    direction === 'left'
      ? Math.max(BEAM_LEFT + FIGHTER_WIDTH / 2, fighter.x - moveAmount)
      : Math.min(BEAM_RIGHT - FIGHTER_WIDTH / 2, fighter.x + moveAmount);

  const newFacing: FacingDirection = direction;

  return {
    ...fighter,
    x: newX,
    facing: newFacing,
    state: 'Moving',
  };
}

/**
 * Set fighter to idle state
 */
export function setIdle(fighter: Fighter): Fighter {
  if (fighter.state === 'Moving') {
    return { ...fighter, state: 'Idle' };
  }
  return fighter;
}

/**
 * Transition fighter to a new state with optional timer
 */
export function transitionState(
  fighter: Fighter,
  newState: FighterState,
  duration: number = 0
): Fighter {
  return {
    ...fighter,
    state: newState,
    stateTimer: duration,
  };
}

/**
 * Update fighter state timer and auto-transition when complete
 */
export function updateStateTimer(fighter: Fighter, deltaTime: number): Fighter {
  if (fighter.stateTimer <= 0) {
    return fighter;
  }

  const newTimer = Math.max(0, fighter.stateTimer - deltaTime);
  
  // Auto-transition back to Idle when timer expires
  if (newTimer === 0) {
    const nextState: FighterState =
      fighter.state === 'ExecutingMove' ||
      fighter.state === 'Stunned' ||
      fighter.state === 'Recovering'
        ? 'Idle'
        : fighter.state;
    
    return {
      ...fighter,
      stateTimer: 0,
      state: nextState,
      currentMove: nextState === 'Idle' ? null : fighter.currentMove,
    };
  }

  return { ...fighter, stateTimer: newTimer };
}

/**
 * Award score to fighter
 */
export function awardScore(fighter: Fighter, points: number): Fighter {
  return { ...fighter, score: fighter.score + points };
}

/**
 * Update fighter facing direction based on opponent position
 */
export function updateFacing(fighter: Fighter, opponentX: number): Fighter {
  const shouldFaceRight = opponentX > fighter.x;
  return {
    ...fighter,
    facing: shouldFaceRight ? 'right' : 'left',
  };
}

/**
 * Make fighter start falling
 */
export function startFalling(fighter: Fighter): Fighter {
  return {
    ...fighter,
    state: 'Falling',
    stateTimer: 0,
  };
}

/**
 * Reset fighter position after fall
 */
export function resetAfterFall(
  fighter: Fighter,
  newX: number,
  penalty: number
): Fighter {
  return {
    ...fighter,
    x: newX,
    state: 'Idle',
    balance: MAX_BALANCE * 0.7, // Start with reduced balance
    stamina: Math.min(MAX_STAMINA, fighter.stamina + 20), // Slight stamina recovery
    score: fighter.score + penalty, // Penalty is negative
    currentMove: null,
    isDefending: false,
  };
}
