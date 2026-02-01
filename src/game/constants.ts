/**
 * Beam Brawlers - Game Constants
 * All game configuration values in one place
 */

// =============================================================================
// GAME IDENTITY
// =============================================================================
export const GAME_NAME = 'Beam Brawlers';
export const GAME_REPO = 'beam-brawlers';
export const STORAGE_PREFIX = 'beam-brawlers:';

// =============================================================================
// ARENA DIMENSIONS
// =============================================================================
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 600;
export const BEAM_WIDTH = 800;
export const BEAM_HEIGHT = 20;
export const BEAM_Y = 400; // Y position of beam top
export const BEAM_LEFT = (CANVAS_WIDTH - BEAM_WIDTH) / 2;
export const BEAM_RIGHT = BEAM_LEFT + BEAM_WIDTH;
export const BEAM_EDGE_ZONE = BEAM_WIDTH * 0.1; // 10% from each edge is "danger zone"

// =============================================================================
// FIGHTER DIMENSIONS & MOVEMENT
// =============================================================================
export const FIGHTER_WIDTH = 50;
export const FIGHTER_HEIGHT = 80;
export const FIGHTER_SPEED = 200; // pixels per second
export const GRAPPLE_RANGE = 70; // pixels - distance to initiate grapple

// =============================================================================
// JUMP MECHANICS
// =============================================================================
export const JUMP_VELOCITY = -400; // Initial upward velocity (negative = up)
export const GRAVITY = 1200; // Pixels per second squared
export const JUMP_STAMINA_COST = 15; // Stamina cost to jump
export const JUMP_BALANCE_COST = 10; // Balance cost on landing
export const STOMP_DAMAGE = 20; // Balance damage when landing on opponent
export const STOMP_STUN_DURATION = 0.8; // Seconds opponent is stunned after stomp
export const STOMP_POINTS = 175; // Points for successful stomp
export const JUMP_OVER_BONUS = 50; // Points for jumping over opponent
export const MIN_JUMP_HEIGHT_FOR_OVER = 40; // Must be this high to jump over

// =============================================================================
// BALANCE & STAMINA
// =============================================================================
export const MAX_BALANCE = 100;
export const MAX_STAMINA = 100;
export const BALANCE_REGEN_RATE = 5; // per second when idle
export const STAMINA_REGEN_RATE = 8; // per second when idle
export const BALANCE_MOVE_COST = 2; // per second while moving
export const STAMINA_MOVE_COST = 3; // per second while moving
export const BALANCE_GRAPPLE_DRAIN = 5; // per second while grappling
export const LOW_STAMINA_THRESHOLD = 20;
export const LOW_BALANCE_THRESHOLD = 30;

// =============================================================================
// MOVE REQUIREMENTS
// =============================================================================
export const MOVE_REQUIREMENTS = {
  pancake: {
    minBalance: 30,
    staminaCost: 25,
    name: 'Pancake',
  },
  scissors: {
    minBalance: 40,
    staminaCost: 30,
    name: 'Scissors',
  },
  guillotine: {
    minBalance: 50,
    staminaCost: 35,
    name: 'Guillotine',
  },
} as const;

// =============================================================================
// MOVE TIMINGS (in seconds)
// =============================================================================
export const MOVE_TIMINGS = {
  pancake: {
    duration: 0.8,
    counterWindow: 0.3,
    stunDuration: 1.0,
  },
  scissors: {
    duration: 1.2,
    counterWindow: 1.2, // Can escape during entire hold
    stunDuration: 0.6,
    balanceDrainRate: 40, // per second to opponent
  },
  guillotine: {
    duration: 1.5,
    counterWindow: 0.4,
    stunDuration: 1.2,
  },
} as const;

// =============================================================================
// SCORING
// =============================================================================
export const SCORING = {
  moves: {
    pancake: 200,
    scissors: 150,
    guillotine: 250,
  },
  bonuses: {
    balanceThreshold: 80, // Balance >= this for bonus
    balanceBonus: 0.2, // +20%
    edgeZoneBonus: 0.15, // +15% for moves near edge
    comboWindow: 4, // seconds
    comboBonus: 0.1, // +10% per combo (stacking)
    maxComboBonus: 0.3, // cap at +30%
  },
  penalties: {
    fallOff: -100,
    whiffStaminaCost: 25,
  },
} as const;

// =============================================================================
// PIN MECHANICS
// =============================================================================
export const PIN_DURATION = 3.0; // seconds to hold pin for win
export const MIN_BALANCE_FOR_PIN = 20; // Attacker needs at least this balance

// =============================================================================
// MATCH SETTINGS
// =============================================================================
export const MATCH_DURATION = 90; // seconds
export const COUNTDOWN_DURATION = 3; // seconds before match starts
export const FALL_RESET_DELAY = 1.0; // seconds before resetting after fall

// =============================================================================
// INPUT
// =============================================================================
export const KEY_BINDINGS = {
  moveLeft: 'KeyA',
  moveRight: 'KeyD',
  jump: 'KeyW',
  crouch: 'KeyS',
  grapple: 'Space',
  pancake: 'KeyJ',
  scissors: 'KeyK',
  guillotine: 'KeyL',
  pin: 'KeyP',
  defend: 'ShiftLeft',
} as const;

// =============================================================================
// AI SETTINGS
// =============================================================================
export const AI_UPDATE_RATE = 100; // ms between AI decisions
export const AI_REACTION_DELAY = 200; // ms delay before AI reacts

// =============================================================================
// ANIMATION
// =============================================================================
export const CALLOUT_DURATION = 1.5; // seconds for move callout display
export const HIT_FLASH_DURATION = 0.15; // seconds
