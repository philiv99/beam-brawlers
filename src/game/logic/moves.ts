/**
 * Beam Brawlers - Move Logic
 * Pure functions for wrestling move validation and execution
 */

import {
  MOVE_REQUIREMENTS,
  MOVE_TIMINGS,
  SCORING,
  BEAM_EDGE_ZONE,
  GRAPPLE_RANGE,
} from '../constants';
import type { Fighter, MoveType, MoveValidation, MoveResult } from '../types';
import { isNearEdge, areInGrappleRange, isOnBeam } from './fighter';

/**
 * Validate if a fighter can execute a specific move
 */
export function validateMove(
  attacker: Fighter,
  defender: Fighter,
  move: MoveType
): MoveValidation {
  const requirements = MOVE_REQUIREMENTS[move];

  // Must be in grapple state
  if (attacker.state !== 'GrappleEngaged') {
    return { canExecute: false, reason: 'Must be grappling' };
  }

  // Must be on the beam
  if (!isOnBeam(attacker)) {
    return { canExecute: false, reason: 'Must be on beam' };
  }

  // Check range
  if (!areInGrappleRange(attacker, defender, GRAPPLE_RANGE)) {
    return { canExecute: false, reason: 'Out of range' };
  }

  // Check balance requirement
  if (attacker.balance < requirements.minBalance) {
    return {
      canExecute: false,
      reason: `Need ${requirements.minBalance} balance`,
    };
  }

  // Check stamina requirement
  if (attacker.stamina < requirements.staminaCost) {
    return {
      canExecute: false,
      reason: `Need ${requirements.staminaCost} stamina`,
    };
  }

  // Defender can't already be falling
  if (defender.state === 'Falling') {
    return { canExecute: false, reason: 'Opponent is falling' };
  }

  return { canExecute: true };
}

/**
 * Calculate bonus multipliers for a move
 */
export function calculateBonuses(
  attacker: Fighter,
  currentTime: number
): { balance: boolean; edge: boolean; combo: number; total: number } {
  const bonusConfig = SCORING.bonuses;

  // Balance bonus: high balance at start
  const balanceBonus = attacker.balance >= bonusConfig.balanceThreshold;

  // Edge bonus: near beam edge (risky)
  const edgeBonus = isNearEdge(attacker, BEAM_EDGE_ZONE);

  // Combo bonus: chaining different moves
  let comboMultiplier = 0;
  if (attacker.lastMoveTime > 0) {
    const timeSinceLastMove = currentTime - attacker.lastMoveTime;
    if (timeSinceLastMove <= bonusConfig.comboWindow) {
      comboMultiplier = Math.min(
        attacker.comboCount * bonusConfig.comboBonus,
        bonusConfig.maxComboBonus
      );
    }
  }

  // Calculate total multiplier
  let total = 1;
  if (balanceBonus) total += bonusConfig.balanceBonus;
  if (edgeBonus) total += bonusConfig.edgeZoneBonus;
  total += comboMultiplier;

  return { balance: balanceBonus, edge: edgeBonus, combo: comboMultiplier, total };
}

/**
 * Calculate final score for a successful move
 */
export function calculateMoveScore(
  move: MoveType,
  attacker: Fighter,
  currentTime: number
): { points: number; bonuses: { balance: boolean; edge: boolean; combo: number } } {
  const basePoints = SCORING.moves[move];
  const bonuses = calculateBonuses(attacker, currentTime);
  const points = Math.round(basePoints * bonuses.total);

  return {
    points,
    bonuses: {
      balance: bonuses.balance,
      edge: bonuses.edge,
      combo: bonuses.combo,
    },
  };
}

/**
 * Get move timing configuration
 */
export function getMoveTiming(move: MoveType) {
  return MOVE_TIMINGS[move];
}

/**
 * Get move requirements configuration
 */
export function getMoveRequirements(move: MoveType) {
  return MOVE_REQUIREMENTS[move];
}

/**
 * Check if defender can counter the move (within counter window)
 */
export function canCounter(
  move: MoveType,
  moveProgress: number, // 0-1, how far through the move
  defenderStamina: number,
  isDefending: boolean
): boolean {
  const timing = MOVE_TIMINGS[move];
  const counterWindowRatio = timing.counterWindow / timing.duration;

  // Must be within counter window
  if (moveProgress > counterWindowRatio) {
    return false;
  }

  // Must be defending
  if (!isDefending) {
    return false;
  }

  // Stamina-based escape chance for scissors
  if (move === 'scissors') {
    // Mashing escape - stamina determines success
    return defenderStamina > 30;
  }

  // For other moves, defending in window is enough
  return true;
}

/**
 * Execute Pancake move
 * Shove + flatten, defender gets stunned
 */
export function executePancake(
  attacker: Fighter,
  _defender: Fighter,
  currentTime: number,
  wasCountered: boolean
): MoveResult {
  const timing = MOVE_TIMINGS.pancake;

  if (wasCountered) {
    return {
      success: false,
      pointsAwarded: 0,
      bonuses: { balance: false, edge: false, combo: 0 },
      defenderStunDuration: 0,
      attackerRecovery: 0.3, // Brief recovery on counter
    };
  }

  const scoreResult = calculateMoveScore('pancake', attacker, currentTime);

  return {
    success: true,
    pointsAwarded: scoreResult.points,
    bonuses: scoreResult.bonuses,
    defenderStunDuration: timing.stunDuration,
    attackerRecovery: 0.2, // Can quickly follow up
  };
}

/**
 * Execute Scissors move
 * Leg lock that drains opponent balance
 */
export function executeScissors(
  attacker: Fighter,
  _defender: Fighter,
  currentTime: number,
  wasCountered: boolean,
  defenderBalanceAfter: number
): MoveResult {
  const timing = MOVE_TIMINGS.scissors;

  if (wasCountered) {
    return {
      success: false,
      pointsAwarded: 0,
      bonuses: { balance: false, edge: false, combo: 0 },
      defenderStunDuration: 0,
      attackerRecovery: 0.4,
    };
  }

  // If balance hit 0, defender falls
  if (defenderBalanceAfter <= 0) {
    // Partial points for causing fall
    return {
      success: true,
      pointsAwarded: Math.round(SCORING.moves.scissors * 0.5),
      bonuses: { balance: false, edge: false, combo: 0 },
      defenderStunDuration: 0, // They're falling instead
      attackerRecovery: 0.3,
    };
  }

  const scoreResult = calculateMoveScore('scissors', attacker, currentTime);

  return {
    success: true,
    pointsAwarded: scoreResult.points,
    bonuses: scoreResult.bonuses,
    defenderStunDuration: timing.stunDuration,
    attackerRecovery: 0.3,
  };
}

/**
 * Execute Guillotine move
 * Front headlock choke - highest risk/reward
 */
export function executeGuillotine(
  attacker: Fighter,
  _defender: Fighter,
  currentTime: number,
  wasCountered: boolean
): MoveResult {
  const timing = MOVE_TIMINGS.guillotine;

  if (wasCountered) {
    return {
      success: false,
      pointsAwarded: 0,
      bonuses: { balance: false, edge: false, combo: 0 },
      defenderStunDuration: 0,
      attackerRecovery: 0.5, // Longer recovery on this risky move
    };
  }

  const scoreResult = calculateMoveScore('guillotine', attacker, currentTime);

  return {
    success: true,
    pointsAwarded: scoreResult.points,
    bonuses: scoreResult.bonuses,
    defenderStunDuration: timing.stunDuration,
    attackerRecovery: 0.2,
  };
}

/**
 * Execute a move and return the result
 */
export function executeMove(
  move: MoveType,
  attacker: Fighter,
  defender: Fighter,
  currentTime: number,
  wasCountered: boolean,
  defenderBalanceAfter?: number
): MoveResult {
  switch (move) {
    case 'pancake':
      return executePancake(attacker, defender, currentTime, wasCountered);
    case 'scissors':
      return executeScissors(
        attacker,
        defender,
        currentTime,
        wasCountered,
        defenderBalanceAfter ?? defender.balance
      );
    case 'guillotine':
      return executeGuillotine(attacker, defender, currentTime, wasCountered);
    default: {
      // Exhaustive check
      const _exhaustiveCheck: never = move;
      throw new Error(`Unknown move type: ${_exhaustiveCheck}`);
    }
  }
}

/**
 * Get whiff penalty for a missed move
 */
export function getWhiffPenalty(): number {
  return SCORING.penalties.whiffStaminaCost;
}

/**
 * Get display name for a move
 */
export function getMoveName(move: MoveType): string {
  return MOVE_REQUIREMENTS[move].name;
}
