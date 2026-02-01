/**
 * Beam Brawlers - AI Logic
 * Simple behavior tree / utility-based AI opponent
 */

import {
  GRAPPLE_RANGE,
  LOW_BALANCE_THRESHOLD,
  AI_UPDATE_RATE,
  MOVE_REQUIREMENTS,
} from '../game/constants';
import type { Fighter, AIDecision, MoveType, GameState } from '../game/types';
import { getFighterDistance, canAct, canBePinned, isNearEdge, areInGrappleRange } from '../game/logic';

/**
 * AI decision-making class
 */
export class AIController {
  private lastDecisionTime: number = 0;
  private currentDecision: AIDecision = { action: 'idle' };
  
  /**
   * Make a decision based on current game state
   */
  decide(state: GameState, currentTime: number): AIDecision {
    // Rate limit decisions
    if (currentTime - this.lastDecisionTime < AI_UPDATE_RATE) {
      return this.currentDecision;
    }
    this.lastDecisionTime = currentTime;
    
    const ai = state.opponent;
    const player = state.player;
    
    // Can't act if in certain states
    if (!canAct(ai)) {
      return { action: 'idle' };
    }
    
    // Priority 1: Attempt pin if player is stunned and close
    if (canBePinned(player) && areInGrappleRange(ai, player, GRAPPLE_RANGE)) {
      this.currentDecision = { action: 'attemptPin' };
      return this.currentDecision;
    }
    
    // Priority 2: Execute moves if grappling
    if (ai.state === 'GrappleEngaged') {
      const move = this.selectMove(ai, player);
      if (move) {
        this.currentDecision = { action: 'executeMove', move };
        return this.currentDecision;
      }
    }
    
    // Priority 3: Defend if player is executing a move
    if (player.state === 'ExecutingMove' && state.isGrappling) {
      this.currentDecision = { action: 'defend' };
      return this.currentDecision;
    }
    
    // Priority 4: Attempt grapple if close enough
    const distance = getFighterDistance(ai, player);
    if (distance <= GRAPPLE_RANGE && ai.state !== 'GrappleEngaged') {
      this.currentDecision = { action: 'grapple' };
      return this.currentDecision;
    }
    
    // Priority 5: Move toward player (but avoid edges if balance low)
    const shouldAvoidEdge = ai.balance < LOW_BALANCE_THRESHOLD && isNearEdge(ai, 100);
    if (shouldAvoidEdge) {
      // Move toward center
      const centerX = 512;
      this.currentDecision = {
        action: ai.x < centerX ? 'moveRight' : 'moveLeft',
      };
    } else {
      // Move toward player
      this.currentDecision = {
        action: player.x > ai.x ? 'moveRight' : 'moveLeft',
      };
    }
    
    return this.currentDecision;
  }
  
  /**
   * Select the best move based on situation
   */
  private selectMove(ai: Fighter, player: Fighter): MoveType | null {
    // Prefer Guillotine if AI has high stamina and player is stunned
    if (ai.stamina >= MOVE_REQUIREMENTS.guillotine.staminaCost) {
      if (player.state === 'Stunned' && ai.stamina > 60) {
        return 'guillotine';
      }
    }
    
    // Prefer Scissors if player balance is low (to push them off)
    if (ai.stamina >= MOVE_REQUIREMENTS.scissors.staminaCost) {
      if (player.balance < 50 && ai.balance >= MOVE_REQUIREMENTS.scissors.minBalance) {
        return 'scissors';
      }
    }
    
    // Default to Pancake as reliable option
    if (ai.stamina >= MOVE_REQUIREMENTS.pancake.staminaCost) {
      if (ai.balance >= MOVE_REQUIREMENTS.pancake.minBalance) {
        return 'pancake';
      }
    }
    
    // Try scissors as backup
    if (ai.stamina >= MOVE_REQUIREMENTS.scissors.staminaCost &&
        ai.balance >= MOVE_REQUIREMENTS.scissors.minBalance) {
      return 'scissors';
    }
    
    return null;
  }
  
  /**
   * Reset AI state
   */
  reset(): void {
    this.lastDecisionTime = 0;
    this.currentDecision = { action: 'idle' };
  }
}

/**
 * Create AI controller instance
 */
export function createAIController(): AIController {
  return new AIController();
}
