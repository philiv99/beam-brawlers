/**
 * Beam Brawlers - Game State Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  resetMatch,
  transitionScene,
  updateMatchTimer,
  updateCountdown,
  checkTimeout,
  checkPinVictory,
  setCallout,
  clearCallout,
  attemptPin,
} from '../src/game/logic/gameState';
import { transitionState, updateBalance, awardScore } from '../src/game/logic/fighter';
import { MATCH_DURATION, COUNTDOWN_DURATION, BEAM_LEFT, BEAM_RIGHT, GRAPPLE_RANGE } from '../src/game/constants';

describe('Initial State', () => {
  it('should create initial state with Title scene', () => {
    const state = createInitialState();
    expect(state.scene).toBe('Title');
    expect(state.matchTimer).toBe(MATCH_DURATION);
    expect(state.isPaused).toBe(false);
  });

  it('should create player and opponent', () => {
    const state = createInitialState();
    expect(state.player.id).toBe('player');
    expect(state.opponent.id).toBe('opponent');
    expect(state.player.facing).toBe('right');
    expect(state.opponent.facing).toBe('left');
  });

  it('should initialize with no grapple', () => {
    const state = createInitialState();
    expect(state.isGrappling).toBe(false);
    expect(state.grappleInitiator).toBe(null);
  });

  it('should initialize with no pin', () => {
    const state = createInitialState();
    expect(state.pinProgress).toBe(0);
    expect(state.pinningFighter).toBe(null);
  });
});

describe('Scene Transitions', () => {
  it('should transition to HowToPlay', () => {
    const state = createInitialState();
    const newState = transitionScene(state, 'HowToPlay');
    expect(newState.scene).toBe('HowToPlay');
  });

  it('should reset match to Countdown', () => {
    const state = createInitialState();
    const newState = resetMatch(state);
    expect(newState.scene).toBe('Countdown');
    expect(newState.countdownTimer).toBe(COUNTDOWN_DURATION);
  });
});

describe('Timer Updates', () => {
  it('should update match timer when Playing', () => {
    let state = createInitialState();
    state = transitionScene(state, 'Playing');
    const newState = updateMatchTimer(state, 1);
    expect(newState.matchTimer).toBe(MATCH_DURATION - 1);
  });

  it('should not update match timer when paused', () => {
    let state = createInitialState();
    state = transitionScene(state, 'Playing');
    state = { ...state, isPaused: true };
    const newState = updateMatchTimer(state, 1);
    expect(newState.matchTimer).toBe(MATCH_DURATION);
  });

  it('should update countdown and transition to Playing', () => {
    let state = createInitialState();
    state = { ...state, scene: 'Countdown' as const, countdownTimer: 0.5 };
    const newState = updateCountdown(state, 1);
    expect(newState.scene).toBe('Playing');
    expect(newState.countdownTimer).toBe(0);
  });

  it('should decrement countdown without transition', () => {
    let state = createInitialState();
    state = { ...state, scene: 'Countdown' as const, countdownTimer: 3 };
    const newState = updateCountdown(state, 1);
    expect(newState.scene).toBe('Countdown');
    expect(newState.countdownTimer).toBe(2);
  });
});

describe('Victory Conditions', () => {
  it('should detect timeout with player winning', () => {
    let state = createInitialState();
    state = { 
      ...state, 
      matchTimer: 0,
      player: awardScore(state.player, 500),
      opponent: awardScore(state.opponent, 300),
    };
    
    const result = checkTimeout(state);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('player');
    expect(result!.reason).toBe('timeout');
  });

  it('should detect timeout with opponent winning', () => {
    let state = createInitialState();
    state = { 
      ...state, 
      matchTimer: 0,
      player: awardScore(state.player, 100),
      opponent: awardScore(state.opponent, 400),
    };
    
    const result = checkTimeout(state);
    expect(result!.winner).toBe('opponent');
  });

  it('should detect timeout draw', () => {
    let state = createInitialState();
    state = { 
      ...state, 
      matchTimer: 0,
      player: awardScore(state.player, 250),
      opponent: awardScore(state.opponent, 250),
    };
    
    const result = checkTimeout(state);
    expect(result!.winner).toBe('draw');
  });

  it('should not trigger timeout when time remains', () => {
    let state = createInitialState();
    state = { ...state, matchTimer: 30 };
    const result = checkTimeout(state);
    expect(result).toBeNull();
  });

  it('should detect pin victory', () => {
    let state = createInitialState();
    state = {
      ...state,
      pinProgress: 1,
      pinningFighter: 'player',
    };
    
    const result = checkPinVictory(state);
    expect(result).not.toBeNull();
    expect(result!.winner).toBe('player');
    expect(result!.reason).toBe('pin');
  });

  it('should not trigger pin victory when progress incomplete', () => {
    let state = createInitialState();
    state = {
      ...state,
      pinProgress: 0.5,
      pinningFighter: 'player',
    };
    
    const result = checkPinVictory(state);
    expect(result).toBeNull();
  });
});

describe('Callouts', () => {
  it('should set callout', () => {
    const state = createInitialState();
    const newState = setCallout(state, 'PANCAKE!', '+200');
    
    expect(newState.currentCallout).not.toBeNull();
    expect(newState.currentCallout!.text).toBe('PANCAKE!');
    expect(newState.currentCallout!.subtext).toBe('+200');
  });

  it('should clear callout', () => {
    let state = createInitialState();
    state = setCallout(state, 'TEST', 'test');
    state = clearCallout(state);
    
    expect(state.currentCallout).toBeNull();
  });
});

describe('Pin Attempts', () => {
  it('should allow pin attempt when conditions met', () => {
    let state = createInitialState();
    
    // Position fighters close together
    const center = (BEAM_LEFT + BEAM_RIGHT) / 2;
    state = {
      ...state,
      player: { ...state.player, x: center - 20, balance: 50 },
      opponent: transitionState({ ...state.opponent, x: center + 20 }, 'Stunned', 1),
    };
    
    const newState = attemptPin(state, 'player');
    expect(newState.pinningFighter).toBe('player');
    expect(newState.pinProgress).toBe(0);
  });

  it('should reject pin when opponent not stunned', () => {
    let state = createInitialState();
    
    const center = (BEAM_LEFT + BEAM_RIGHT) / 2;
    state = {
      ...state,
      player: { ...state.player, x: center - 20, balance: 50 },
      opponent: { ...state.opponent, x: center + 20 }, // Idle, not stunned
    };
    
    const newState = attemptPin(state, 'player');
    expect(newState.pinningFighter).toBeNull();
  });

  it('should reject pin when attacker balance too low', () => {
    let state = createInitialState();
    
    const center = (BEAM_LEFT + BEAM_RIGHT) / 2;
    state = {
      ...state,
      player: updateBalance({ ...state.player, x: center - 20 }, -90), // Balance = 10
      opponent: transitionState({ ...state.opponent, x: center + 20 }, 'Stunned', 1),
    };
    
    const newState = attemptPin(state, 'player');
    expect(newState.pinningFighter).toBeNull();
  });
});
