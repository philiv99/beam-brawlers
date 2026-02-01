/**
 * Beam Brawlers - Type Definitions
 */

// =============================================================================
// FIGHTER TYPES
// =============================================================================

export type FighterState =
  | 'Idle'
  | 'Moving'
  | 'GrappleEngaged'
  | 'ExecutingMove'
  | 'Stunned'
  | 'Falling'
  | 'Pinned'
  | 'Pinning'
  | 'Recovering';

export type MoveType = 'pancake' | 'scissors' | 'guillotine';

export type FacingDirection = 'left' | 'right';

export interface Fighter {
  id: 'player' | 'opponent';
  x: number; // Position along beam
  y: number; // Should be on beam unless falling
  facing: FacingDirection;
  state: FighterState;
  balance: number; // 0-100
  stamina: number; // 0-100
  score: number;
  
  // Timers (in seconds, countdown to 0)
  stateTimer: number;
  currentMove: MoveType | null;
  comboCount: number;
  lastMoveTime: number; // timestamp of last successful move
  
  // Defense
  isDefending: boolean;
}

// =============================================================================
// GAME STATE TYPES
// =============================================================================

export type GameScene = 'Title' | 'HowToPlay' | 'Countdown' | 'Playing' | 'Paused' | 'GameOver';

export type GameEndReason = 'pin' | 'timeout' | 'surrender';

export interface GameResult {
  winner: 'player' | 'opponent' | 'draw';
  reason: GameEndReason;
  playerScore: number;
  opponentScore: number;
  matchDuration: number;
}

export interface Callout {
  id: string;
  text: string;
  subtext?: string;
  timestamp: number;
}

export interface GameState {
  scene: GameScene;
  
  // Match state
  matchTimer: number; // seconds remaining
  countdownTimer: number;
  isPaused: boolean;
  
  // Fighters
  player: Fighter;
  opponent: Fighter;
  
  // Grapple state
  isGrappling: boolean;
  grappleInitiator: 'player' | 'opponent' | null;
  
  // Pin state
  pinProgress: number; // 0-1 (1 = pin complete)
  pinningFighter: 'player' | 'opponent' | null;
  
  // UI state
  currentCallout: Callout | null;
  
  // Result (set when game ends)
  result: GameResult | null;
}

// =============================================================================
// INPUT TYPES
// =============================================================================

export interface InputState {
  moveLeft: boolean;
  moveRight: boolean;
  balanceUp: boolean;
  balanceDown: boolean;
  grapple: boolean;
  pancake: boolean;
  scissors: boolean;
  guillotine: boolean;
  pin: boolean;
  defend: boolean;
}

// =============================================================================
// ACTION TYPES
// =============================================================================

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'SHOW_HOW_TO_PLAY' }
  | { type: 'HIDE_HOW_TO_PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }
  | { type: 'UPDATE'; deltaTime: number; input: InputState }
  | { type: 'ATTEMPT_GRAPPLE'; initiator: 'player' | 'opponent' }
  | { type: 'BREAK_GRAPPLE' }
  | { type: 'EXECUTE_MOVE'; fighter: 'player' | 'opponent'; move: MoveType }
  | { type: 'MOVE_COMPLETE'; fighter: 'player' | 'opponent'; success: boolean }
  | { type: 'ATTEMPT_PIN'; attacker: 'player' | 'opponent' }
  | { type: 'FIGHTER_FELL'; fighter: 'player' | 'opponent' }
  | { type: 'RESET_POSITIONS' }
  | { type: 'SHOW_CALLOUT'; text: string; subtext?: string }
  | { type: 'CLEAR_CALLOUT' }
  | { type: 'END_MATCH'; winner: 'player' | 'opponent' | 'draw'; reason: GameEndReason };

// =============================================================================
// MOVE RESULT TYPES
// =============================================================================

export interface MoveValidation {
  canExecute: boolean;
  reason?: string;
}

export interface MoveResult {
  success: boolean;
  pointsAwarded: number;
  bonuses: {
    balance: boolean;
    edge: boolean;
    combo: number;
  };
  defenderStunDuration: number;
  attackerRecovery: number;
}

// =============================================================================
// AI TYPES
// =============================================================================

export interface AIDecision {
  action: 'idle' | 'moveLeft' | 'moveRight' | 'grapple' | 'executeMove' | 'attemptPin' | 'defend';
  move?: MoveType;
}
