/**
 * Beam Brawlers - Game State Logic
 * Pure functions for managing overall game state
 */

import {
  BEAM_LEFT,
  BEAM_RIGHT,
  MATCH_DURATION,
  COUNTDOWN_DURATION,
  PIN_DURATION,
  MIN_BALANCE_FOR_PIN,
  GRAPPLE_RANGE,
  ZAPPA_FIGHTER_NAMES,
} from '../constants';
import type {
  GameState,
  GameScene,
  Fighter,
  GameResult,
  GameEndReason,
  Callout,
} from '../types';
import { createFighter, canBePinned, canAttemptPin, areInGrappleRange } from './fighter';

/**
 * Get a random Zappa song name
 */
export function getRandomZappaName(exclude?: string): string {
  const available = exclude
    ? ZAPPA_FIGHTER_NAMES.filter((n) => n !== exclude)
    : [...ZAPPA_FIGHTER_NAMES];
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Create initial game state
 */
export function createInitialState(): GameState {
  const beamCenter = (BEAM_LEFT + BEAM_RIGHT) / 2;
  const playerStartX = beamCenter - 100;
  const opponentStartX = beamCenter + 100;

  const playerName = getRandomZappaName();
  const opponentName = getRandomZappaName(playerName);

  return {
    scene: 'Title',
    matchTimer: MATCH_DURATION,
    countdownTimer: COUNTDOWN_DURATION,
    isPaused: false,
    player: createFighter('player', playerStartX, 'right', playerName),
    opponent: createFighter('opponent', opponentStartX, 'left', opponentName),
    isGrappling: false,
    grappleInitiator: null,
    pinProgress: 0,
    pinningFighter: null,
    currentCallout: null,
    result: null,
  };
}

/**
 * Reset match state for a new game
 */
export function resetMatch(_state: GameState): GameState {
  const initial = createInitialState();
  return {
    ...initial,
    scene: 'Countdown',
    countdownTimer: COUNTDOWN_DURATION,
  };
}

/**
 * Transition to a new scene
 */
export function transitionScene(state: GameState, scene: GameScene): GameState {
  return { ...state, scene };
}

/**
 * Check if match should end due to timeout
 */
export function checkTimeout(state: GameState): GameResult | null {
  if (state.matchTimer <= 0) {
    const playerScore = state.player.score;
    const opponentScore = state.opponent.score;

    let winner: 'player' | 'opponent' | 'draw';
    if (playerScore > opponentScore) {
      winner = 'player';
    } else if (opponentScore > playerScore) {
      winner = 'opponent';
    } else {
      winner = 'draw';
    }

    return {
      winner,
      reason: 'timeout',
      playerScore,
      opponentScore,
      matchDuration: MATCH_DURATION - state.matchTimer,
    };
  }
  return null;
}

/**
 * Check if a pin is successful
 */
export function checkPinVictory(state: GameState): GameResult | null {
  if (state.pinProgress >= 1 && state.pinningFighter) {
    const winner = state.pinningFighter;
    return {
      winner,
      reason: 'pin',
      playerScore: state.player.score,
      opponentScore: state.opponent.score,
      matchDuration: MATCH_DURATION - state.matchTimer,
    };
  }
  return null;
}

/**
 * Update pin progress
 */
export function updatePinProgress(
  state: GameState,
  deltaTime: number
): GameState {
  if (!state.pinningFighter) {
    return state;
  }

  const attacker = state.pinningFighter === 'player' ? state.player : state.opponent;
  const defender = state.pinningFighter === 'player' ? state.opponent : state.player;

  // Validate pin is still valid
  const pinStillValid =
    canAttemptPin(attacker, MIN_BALANCE_FOR_PIN) &&
    canBePinned(defender) &&
    areInGrappleRange(attacker, defender, GRAPPLE_RANGE);

  if (!pinStillValid) {
    return {
      ...state,
      pinProgress: 0,
      pinningFighter: null,
    };
  }

  // Increment pin progress
  const newProgress = Math.min(1, state.pinProgress + deltaTime / PIN_DURATION);
  return {
    ...state,
    pinProgress: newProgress,
  };
}

/**
 * Attempt to initiate a pin
 */
export function attemptPin(
  state: GameState,
  attacker: 'player' | 'opponent'
): GameState {
  const attackerFighter = attacker === 'player' ? state.player : state.opponent;
  const defenderFighter = attacker === 'player' ? state.opponent : state.player;

  // Validate pin attempt
  if (!canAttemptPin(attackerFighter, MIN_BALANCE_FOR_PIN)) {
    return state;
  }

  if (!canBePinned(defenderFighter)) {
    return state;
  }

  if (!areInGrappleRange(attackerFighter, defenderFighter, GRAPPLE_RANGE)) {
    return state;
  }

  return {
    ...state,
    pinningFighter: attacker,
    pinProgress: 0,
  };
}

/**
 * Update match timer
 */
export function updateMatchTimer(state: GameState, deltaTime: number): GameState {
  if (state.scene !== 'Playing' || state.isPaused) {
    return state;
  }

  return {
    ...state,
    matchTimer: Math.max(0, state.matchTimer - deltaTime),
  };
}

/**
 * Update countdown timer
 */
export function updateCountdown(state: GameState, deltaTime: number): GameState {
  if (state.scene !== 'Countdown') {
    return state;
  }

  const newTimer = state.countdownTimer - deltaTime;
  
  if (newTimer <= 0) {
    return {
      ...state,
      countdownTimer: 0,
      scene: 'Playing',
    };
  }

  return {
    ...state,
    countdownTimer: newTimer,
  };
}

/**
 * Create a callout
 */
export function createCallout(text: string, subtext?: string): Callout {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text,
    subtext,
    timestamp: Date.now(),
  };
}

/**
 * Set current callout
 */
export function setCallout(
  state: GameState,
  text: string,
  subtext?: string
): GameState {
  return {
    ...state,
    currentCallout: createCallout(text, subtext),
  };
}

/**
 * Clear current callout
 */
export function clearCallout(state: GameState): GameState {
  return {
    ...state,
    currentCallout: null,
  };
}

/**
 * End the match
 */
export function endMatch(
  state: GameState,
  winner: 'player' | 'opponent' | 'draw',
  reason: GameEndReason
): GameState {
  const result: GameResult = {
    winner,
    reason,
    playerScore: state.player.score,
    opponentScore: state.opponent.score,
    matchDuration: MATCH_DURATION - state.matchTimer,
  };

  return {
    ...state,
    scene: 'GameOver',
    result,
    isPaused: false,
  };
}

/**
 * Update fighters in state
 */
export function updateFighters(
  state: GameState,
  player: Fighter,
  opponent: Fighter
): GameState {
  return {
    ...state,
    player,
    opponent,
  };
}

/**
 * Set grapple state
 */
export function setGrappling(
  state: GameState,
  isGrappling: boolean,
  initiator: 'player' | 'opponent' | null = null
): GameState {
  return {
    ...state,
    isGrappling,
    grappleInitiator: initiator,
  };
}

/**
 * Get reset positions after a fall
 */
export function getResetPositions(): { playerX: number; opponentX: number } {
  const beamCenter = (BEAM_LEFT + BEAM_RIGHT) / 2;
  return {
    playerX: beamCenter - 100,
    opponentX: beamCenter + 100,
  };
}

/**
 * Apply fall penalty
 */
export function getFallPenalty(): number {
  return -100; // SCORING.penalties.fallOff
}
