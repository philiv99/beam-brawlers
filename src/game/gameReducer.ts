/**
 * Beam Brawlers - Game Reducer
 * Main state management for the game
 */

import type { GameState, GameAction, InputState, MoveType } from './types';
import {
  GRAPPLE_RANGE,
  MOVE_REQUIREMENTS,
  MOVE_TIMINGS,
  CALLOUT_DURATION,
} from './constants';
import {
  createInitialState,
  resetMatch,
  transitionScene,
  updateMatchTimer,
  updateCountdown,
  updatePinProgress,
  attemptPin,
  checkTimeout,
  checkPinVictory,
  endMatch,
  setCallout,
  clearCallout,
  updateFighters,
  setGrappling,
  getResetPositions,
  getFallPenalty,
} from './logic/gameState';
import {
  createFighter,
  isOnBeam,
  areInGrappleRange,
  canGrapple,
  canAct,
  moveFighter,
  setIdle,
  regenerate,
  applyMovementCosts,
  applyGrappleCosts,
  transitionState,
  updateStateTimer,
  updateBalance,
  updateStamina,
  awardScore,
  startFalling,
  resetAfterFall,
  updateFacing,
} from './logic/fighter';
import {
  validateMove,
  executeMove,
  getMoveName,
} from './logic/moves';

/**
 * Main game reducer
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return resetMatch(state);

    case 'SHOW_HOW_TO_PLAY':
      return transitionScene(state, 'HowToPlay');

    case 'HIDE_HOW_TO_PLAY':
      return transitionScene(state, 'Title');

    case 'PAUSE':
      if (state.scene === 'Playing') {
        return { ...state, isPaused: true, scene: 'Paused' };
      }
      return state;

    case 'RESUME':
      if (state.scene === 'Paused') {
        return { ...state, isPaused: false, scene: 'Playing' };
      }
      return state;

    case 'RESTART':
      return resetMatch(state);

    case 'UPDATE':
      return updateGame(state, action.deltaTime, action.input);

    case 'ATTEMPT_GRAPPLE':
      return handleGrappleAttempt(state, action.initiator);

    case 'BREAK_GRAPPLE':
      return breakGrapple(state);

    case 'EXECUTE_MOVE':
      return handleExecuteMove(state, action.fighter, action.move);

    case 'ATTEMPT_PIN':
      return attemptPin(state, action.attacker);

    case 'FIGHTER_FELL':
      return handleFighterFell(state, action.fighter);

    case 'RESET_POSITIONS':
      return resetPositions(state);

    case 'SHOW_CALLOUT':
      return setCallout(state, action.text, action.subtext);

    case 'CLEAR_CALLOUT':
      return clearCallout(state);

    case 'END_MATCH':
      return endMatch(state, action.winner, action.reason);

    default:
      return state;
  }
}

/**
 * Main update function - called every frame
 */
function updateGame(state: GameState, deltaTime: number, input: InputState): GameState {
  // Handle countdown
  if (state.scene === 'Countdown') {
    return updateCountdown(state, deltaTime);
  }

  // Only update if playing and not paused
  if (state.scene !== 'Playing' || state.isPaused) {
    return state;
  }

  let newState = state;

  // Update match timer
  newState = updateMatchTimer(newState, deltaTime);

  // Check for timeout
  const timeoutResult = checkTimeout(newState);
  if (timeoutResult) {
    return endMatch(newState, timeoutResult.winner, 'timeout');
  }

  // Update fighters
  let player = newState.player;
  let opponent = newState.opponent;

  // Update state timers
  player = updateStateTimer(player, deltaTime);
  opponent = updateStateTimer(opponent, deltaTime);

  // Handle player input
  if (canAct(player)) {
    // Movement
    if (input.moveLeft && !input.moveRight) {
      player = moveFighter(player, 'left', deltaTime);
      player = applyMovementCosts(player, deltaTime);
    } else if (input.moveRight && !input.moveLeft) {
      player = moveFighter(player, 'right', deltaTime);
      player = applyMovementCosts(player, deltaTime);
    } else if (player.state === 'Moving') {
      player = setIdle(player);
    }

    // Defense
    player = { ...player, isDefending: input.defend };
  }

  // Regeneration
  player = regenerate(player, deltaTime);
  opponent = regenerate(opponent, deltaTime);

  // Grapple costs
  if (newState.isGrappling) {
    player = applyGrappleCosts(player, deltaTime);
    opponent = applyGrappleCosts(opponent, deltaTime);
  }

  // Update facing
  player = updateFacing(player, opponent.x);
  opponent = updateFacing(opponent, player.x);

  // Check for falls (balance = 0 or off beam)
  if (!isOnBeam(player) || player.balance <= 0) {
    if (player.state !== 'Falling') {
      player = startFalling(player);
    }
  }
  if (!isOnBeam(opponent) || opponent.balance <= 0) {
    if (opponent.state !== 'Falling') {
      opponent = startFalling(opponent);
    }
  }

  newState = updateFighters(newState, player, opponent);

  // Update pin progress
  if (newState.pinningFighter) {
    newState = updatePinProgress(newState, deltaTime);
    
    // Check for pin victory
    const pinResult = checkPinVictory(newState);
    if (pinResult) {
      return endMatch(newState, pinResult.winner, 'pin');
    }
  }

  // Clear old callouts
  if (newState.currentCallout) {
    const calloutAge = (Date.now() - newState.currentCallout.timestamp) / 1000;
    if (calloutAge > CALLOUT_DURATION) {
      newState = clearCallout(newState);
    }
  }

  return newState;
}

/**
 * Handle grapple attempt
 */
function handleGrappleAttempt(
  state: GameState,
  initiator: 'player' | 'opponent'
): GameState {
  const attacker = initiator === 'player' ? state.player : state.opponent;
  const defender = initiator === 'player' ? state.opponent : state.player;

  // Validate grapple attempt
  if (!canGrapple(attacker)) return state;
  if (!areInGrappleRange(attacker, defender, GRAPPLE_RANGE)) return state;
  if (defender.state === 'Falling') return state;

  // Both enter grapple state
  const newAttacker = transitionState(attacker, 'GrappleEngaged');
  const newDefender = canAct(defender)
    ? transitionState(defender, 'GrappleEngaged')
    : defender;

  let newState = initiator === 'player'
    ? updateFighters(state, newAttacker, newDefender)
    : updateFighters(state, newDefender, newAttacker);

  newState = setGrappling(newState, true, initiator);
  return newState;
}

/**
 * Break grapple (both return to idle)
 */
function breakGrapple(state: GameState): GameState {
  let player = state.player;
  let opponent = state.opponent;

  if (player.state === 'GrappleEngaged') {
    player = transitionState(player, 'Idle');
  }
  if (opponent.state === 'GrappleEngaged') {
    opponent = transitionState(opponent, 'Idle');
  }

  let newState = updateFighters(state, player, opponent);
  newState = setGrappling(newState, false, null);
  return newState;
}

/**
 * Handle move execution
 */
function handleExecuteMove(
  state: GameState,
  fighterId: 'player' | 'opponent',
  move: MoveType
): GameState {
  const attacker = fighterId === 'player' ? state.player : state.opponent;
  const defender = fighterId === 'player' ? state.opponent : state.player;

  // Validate move
  const validation = validateMove(attacker, defender, move);
  if (!validation.canExecute) {
    return state;
  }

  // Get move requirements and apply stamina cost
  const requirements = MOVE_REQUIREMENTS[move];
  const timing = MOVE_TIMINGS[move];
  
  let newAttacker = updateStamina(attacker, -requirements.staminaCost);
  newAttacker = transitionState(newAttacker, 'ExecutingMove', timing.duration);
  newAttacker = { ...newAttacker, currentMove: move };

  // Check if defender is countering
  const wasCountered = defender.isDefending && Math.random() < 0.4; // 40% counter chance if defending

  // Calculate balance drain for scissors
  let defenderBalanceAfter = defender.balance;
  if (move === 'scissors' && !wasCountered) {
    const scissorsTiming = MOVE_TIMINGS.scissors;
    defenderBalanceAfter = Math.max(0, defender.balance - scissorsTiming.balanceDrainRate);
  }

  // Execute the move
  const result = executeMove(
    move,
    newAttacker,
    defender,
    Date.now(),
    wasCountered,
    defenderBalanceAfter
  );

  // Apply results
  let newDefender = defender;
  
  if (result.success) {
    // Award points
    newAttacker = awardScore(newAttacker, result.pointsAwarded);
    
    // Update combo
    newAttacker = {
      ...newAttacker,
      comboCount: newAttacker.comboCount + 1,
      lastMoveTime: Date.now(),
    };

    // Apply stun to defender
    if (result.defenderStunDuration > 0) {
      newDefender = transitionState(defender, 'Stunned', result.defenderStunDuration);
    }
    
    // Apply balance drain for scissors
    if (move === 'scissors') {
      newDefender = updateBalance(newDefender, -(defender.balance - defenderBalanceAfter));
      if (newDefender.balance <= 0) {
        newDefender = startFalling(newDefender);
      }
    }
  } else {
    // Move was countered - attacker has brief recovery
    newAttacker = transitionState(newAttacker, 'Recovering', result.attackerRecovery);
  }

  // Update state
  let newState = fighterId === 'player'
    ? updateFighters(state, newAttacker, newDefender)
    : updateFighters(state, newDefender, newAttacker);

  // Show callout
  const moveName = getMoveName(move).toUpperCase();
  if (result.success) {
    let subtext = `+${result.pointsAwarded}`;
    if (result.bonuses.balance) subtext += ' (Balance Bonus!)';
    if (result.bonuses.edge) subtext += ' (Edge Risk!)';
    if (result.bonuses.combo > 0) subtext += ' (Combo!)';
    newState = setCallout(newState, moveName + '!', subtext);
  } else {
    newState = setCallout(newState, 'BLOCKED!', `${moveName} countered!`);
  }

  return newState;
}

/**
 * Handle fighter falling off beam
 */
function handleFighterFell(
  state: GameState,
  fighterId: 'player' | 'opponent'
): GameState {
  const positions = getResetPositions();
  const penalty = getFallPenalty();

  let player = state.player;
  let opponent = state.opponent;

  if (fighterId === 'player') {
    player = resetAfterFall(player, positions.playerX, penalty);
    opponent = transitionState(opponent, 'Idle'); // Reset opponent too
  } else {
    opponent = resetAfterFall(opponent, positions.opponentX, penalty);
    player = transitionState(player, 'Idle');
  }

  let newState = updateFighters(state, player, opponent);
  newState = setGrappling(newState, false, null);
  newState = { ...newState, pinProgress: 0, pinningFighter: null };
  newState = setCallout(newState, 'FALL!', `${fighterId === 'player' ? 'YOU' : 'AI'} fell! -100`);

  return newState;
}

/**
 * Reset both fighters to starting positions
 */
function resetPositions(state: GameState): GameState {
  const positions = getResetPositions();
  
  let player = createFighter('player', positions.playerX, 'right');
  let opponent = createFighter('opponent', positions.opponentX, 'left');
  
  // Preserve scores
  player = { ...player, score: state.player.score };
  opponent = { ...opponent, score: state.opponent.score };

  let newState = updateFighters(state, player, opponent);
  newState = setGrappling(newState, false, null);
  newState = { ...newState, pinProgress: 0, pinningFighter: null };
  
  return newState;
}

/**
 * Create initial state
 */
export function getInitialState(): GameState {
  return createInitialState();
}
