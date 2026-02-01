/**
 * Beam Brawlers - Canvas Renderer
 * Handles all canvas drawing operations
 */

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BEAM_WIDTH,
  BEAM_HEIGHT,
  BEAM_Y,
  BEAM_LEFT,
  BEAM_RIGHT,
  BEAM_EDGE_ZONE,
  FIGHTER_WIDTH,
  FIGHTER_HEIGHT,
  MAX_BALANCE,
  MAX_STAMINA,
  PIN_DURATION,
} from '../game/constants';
import type { GameState, Fighter, Callout } from '../game/types';
import theme from '../theme/linkittydoTheme';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Render the complete game frame
   */
  render(state: GameState): void {
    this.clear();
    this.drawBackground();
    this.drawBeam();
    this.drawFallZone();
    
    // Draw fighters
    this.drawFighter(state.player, theme.colors.blue);
    this.drawFighter(state.opponent, theme.colors.red);
    
    // Draw grapple indicator
    if (state.isGrappling) {
      this.drawGrappleIndicator(state.player, state.opponent);
    }
    
    // Draw pin progress
    if (state.pinningFighter) {
      this.drawPinProgress(state.pinProgress, state.pinningFighter);
    }
    
    // Draw HUD
    this.drawHUD(state);
    
    // Draw callout
    if (state.currentCallout) {
      this.drawCallout(state.currentCallout);
    }
  }

  /**
   * Draw background with geometric shapes
   */
  private drawBackground(): void {
    // Gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, theme.colors.cream);
    gradient.addColorStop(1, theme.colors.mint);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Decorative circles
    this.ctx.globalAlpha = 0.15;
    this.ctx.fillStyle = theme.colors.ink;
    this.ctx.beginPath();
    this.ctx.arc(100, 100, 60, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(CANVAS_WIDTH - 80, 150, 40, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(CANVAS_WIDTH - 150, CANVAS_HEIGHT - 100, 50, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.globalAlpha = 1;
  }

  /**
   * Draw the balance beam
   */
  private drawBeam(): void {
    const ctx = this.ctx;
    
    // Beam shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(BEAM_LEFT + 6, BEAM_Y + 6, BEAM_WIDTH, BEAM_HEIGHT);
    
    // Main beam
    const beamGradient = ctx.createLinearGradient(BEAM_LEFT, BEAM_Y, BEAM_LEFT, BEAM_Y + BEAM_HEIGHT);
    beamGradient.addColorStop(0, '#D4A574');
    beamGradient.addColorStop(0.5, '#C9956C');
    beamGradient.addColorStop(1, '#B8845B');
    ctx.fillStyle = beamGradient;
    ctx.fillRect(BEAM_LEFT, BEAM_Y, BEAM_WIDTH, BEAM_HEIGHT);
    
    // Beam border
    ctx.strokeStyle = theme.colors.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(BEAM_LEFT, BEAM_Y, BEAM_WIDTH, BEAM_HEIGHT);
    
    // Edge danger zones
    ctx.fillStyle = 'rgba(251, 43, 87, 0.3)';
    ctx.fillRect(BEAM_LEFT, BEAM_Y, BEAM_EDGE_ZONE, BEAM_HEIGHT);
    ctx.fillRect(BEAM_RIGHT - BEAM_EDGE_ZONE, BEAM_Y, BEAM_EDGE_ZONE, BEAM_HEIGHT);
    
    // Center line
    ctx.strokeStyle = theme.colors.ink;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const centerX = (BEAM_LEFT + BEAM_RIGHT) / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, BEAM_Y);
    ctx.lineTo(centerX, BEAM_Y + BEAM_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /**
   * Draw fall zone below beam
   */
  private drawFallZone(): void {
    const ctx = this.ctx;
    const fallZoneY = BEAM_Y + BEAM_HEIGHT + 20;
    
    ctx.fillStyle = 'rgba(22, 24, 19, 0.1)';
    ctx.fillRect(BEAM_LEFT - 50, fallZoneY, BEAM_WIDTH + 100, CANVAS_HEIGHT - fallZoneY);
    
    // "FALL ZONE" text
    ctx.fillStyle = 'rgba(22, 24, 19, 0.2)';
    ctx.font = '24px Bungee, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FALL ZONE', CANVAS_WIDTH / 2, fallZoneY + 40);
  }

  /**
   * Draw a fighter
   */
  private drawFighter(fighter: Fighter, accentColor: string): void {
    const ctx = this.ctx;
    const x = fighter.x;
    const baseY = BEAM_Y - FIGHTER_HEIGHT;
    
    // Calculate actual Y position including jump offset
    // fighter.y is negative when in air, so we add it to move up
    let drawY = baseY + fighter.y;
    
    // Adjust for falling off beam
    if (fighter.state === 'Falling') {
      drawY = BEAM_Y + 50; // Below beam
    }
    
    // Fighter shadow (changes size based on height)
    const shadowScale = Math.max(0.3, 1 + fighter.y / 100); // Smaller when higher
    ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(x, BEAM_Y - 2, (FIGHTER_WIDTH / 2 - 5) * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Fighter body (simplified)
    ctx.fillStyle = accentColor;
    ctx.strokeStyle = theme.colors.ink;
    ctx.lineWidth = 3;
    
    // Body rectangle
    const bodyWidth = FIGHTER_WIDTH - 10;
    const bodyHeight = FIGHTER_HEIGHT - 20;
    ctx.fillRect(x - bodyWidth / 2, drawY + 20, bodyWidth, bodyHeight);
    ctx.strokeRect(x - bodyWidth / 2, drawY + 20, bodyWidth, bodyHeight);
    
    // Head circle
    ctx.beginPath();
    ctx.arc(x, drawY + 12, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Facing indicator (eyes)
    const eyeOffset = fighter.facing === 'right' ? 4 : -4;
    ctx.fillStyle = theme.colors.paper;
    ctx.beginPath();
    ctx.arc(x + eyeOffset - 3, drawY + 10, 3, 0, Math.PI * 2);
    ctx.arc(x + eyeOffset + 3, drawY + 10, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // State indicator
    this.drawStateIndicator(fighter, x, drawY);
    
    // Name label
    ctx.fillStyle = theme.colors.ink;
    ctx.font = '14px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(fighter.id === 'player' ? 'YOU' : 'AI', x, drawY - 5);
  }

  /**
   * Draw state indicator above fighter
   */
  private drawStateIndicator(fighter: Fighter, x: number, y: number): void {
    const ctx = this.ctx;
    let text = '';
    let color: string = theme.colors.ink;
    
    switch (fighter.state) {
      case 'Jumping':
        text = '🦘';
        color = theme.colors.mint;
        break;
      case 'Stunned':
        text = '★★★';
        color = theme.colors.gold;
        break;
      case 'GrappleEngaged':
        text = '⚔';
        break;
      case 'ExecutingMove':
        text = '💥';
        break;
      case 'Pinned':
        text = '📌';
        color = theme.colors.pop;
        break;
      case 'Pinning':
        text = '🏆';
        color = theme.colors.gold;
        break;
      case 'Falling':
        text = '⬇️';
        color = theme.colors.pop;
        break;
    }
    
    if (text) {
      ctx.font = '20px sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(text, x, y - 20);
    }
  }

  /**
   * Draw grapple connection between fighters
   */
  private drawGrappleIndicator(player: Fighter, opponent: Fighter): void {
    const ctx = this.ctx;
    const y = BEAM_Y - FIGHTER_HEIGHT / 2;
    
    ctx.strokeStyle = theme.colors.gold;
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(player.x, y);
    ctx.lineTo(opponent.x, y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Grapple text
    ctx.fillStyle = theme.colors.gold;
    ctx.font = '16px Bungee, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GRAPPLE!', (player.x + opponent.x) / 2, y - 20);
  }

  /**
   * Draw pin progress indicator
   */
  private drawPinProgress(progress: number, pinner: 'player' | 'opponent'): void {
    const ctx = this.ctx;
    const centerX = CANVAS_WIDTH / 2;
    const y = 100;
    const width = 300;
    const height = 30;
    
    // Background
    ctx.fillStyle = theme.colors.paper;
    ctx.strokeStyle = theme.colors.ink;
    ctx.lineWidth = 3;
    ctx.fillRect(centerX - width / 2, y, width, height);
    ctx.strokeRect(centerX - width / 2, y, width, height);
    
    // Progress fill
    ctx.fillStyle = pinner === 'player' ? theme.colors.blue : theme.colors.red;
    ctx.fillRect(centerX - width / 2 + 3, y + 3, (width - 6) * progress, height - 6);
    
    // Text
    ctx.fillStyle = theme.colors.ink;
    ctx.font = '18px Bungee, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PIN! ${(progress * PIN_DURATION).toFixed(1)}s`, centerX, y + 22);
  }

  /**
   * Draw HUD elements
   */
  private drawHUD(state: GameState): void {
    this.drawScores(state);
    this.drawMeters(state.player, 50);
    this.drawMeters(state.opponent, CANVAS_WIDTH - 200);
    this.drawMatchTimer(state.matchTimer);
  }

  /**
   * Draw score display
   */
  private drawScores(state: GameState): void {
    const ctx = this.ctx;
    const centerX = CANVAS_WIDTH / 2;
    
    // Score box
    ctx.fillStyle = theme.colors.paper;
    ctx.strokeStyle = theme.colors.ink;
    ctx.lineWidth = 3;
    
    const boxWidth = 200;
    const boxHeight = 50;
    ctx.fillRect(centerX - boxWidth / 2, 10, boxWidth, boxHeight);
    ctx.strokeRect(centerX - boxWidth / 2, 10, boxWidth, boxHeight);
    
    // Scores
    ctx.font = '28px Bungee, sans-serif';
    ctx.textAlign = 'center';
    
    ctx.fillStyle = theme.colors.blue;
    ctx.fillText(state.player.score.toString(), centerX - 50, 45);
    
    ctx.fillStyle = theme.colors.ink;
    ctx.fillText('-', centerX, 45);
    
    ctx.fillStyle = theme.colors.red;
    ctx.fillText(state.opponent.score.toString(), centerX + 50, 45);
  }

  /**
   * Draw balance and stamina meters
   */
  private drawMeters(fighter: Fighter, startX: number): void {
    const ctx = this.ctx;
    const meterWidth = 150;
    const meterHeight = 16;
    let y = 80;
    
    // Labels
    ctx.fillStyle = theme.colors.ink;
    ctx.font = '12px Nunito, sans-serif';
    ctx.textAlign = 'left';
    
    // Balance meter
    ctx.fillText('BALANCE', startX, y - 3);
    this.drawMeter(startX, y, meterWidth, meterHeight, fighter.balance, MAX_BALANCE, theme.colors.mint);
    
    y += meterHeight + 15;
    
    // Stamina meter
    ctx.fillText('STAMINA', startX, y - 3);
    this.drawMeter(startX, y, meterWidth, meterHeight, fighter.stamina, MAX_STAMINA, theme.colors.gold);
  }

  /**
   * Draw a single meter
   */
  private drawMeter(
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    max: number,
    fillColor: string
  ): void {
    const ctx = this.ctx;
    const ratio = value / max;
    
    // Background
    ctx.fillStyle = theme.colors.paper;
    ctx.strokeStyle = theme.colors.ink;
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    
    // Fill
    const warningThreshold = 0.3;
    ctx.fillStyle = ratio < warningThreshold ? theme.colors.warning : fillColor;
    ctx.fillRect(x + 2, y + 2, (width - 4) * ratio, height - 4);
  }

  /**
   * Draw match timer
   */
  private drawMatchTimer(seconds: number): void {
    const ctx = this.ctx;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const timeStr = `${minutes}:${secs.toString().padStart(2, '0')}`;
    
    ctx.fillStyle = seconds <= 10 ? theme.colors.pop : theme.colors.ink;
    ctx.font = '24px Bungee, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, CANVAS_WIDTH / 2, 85);
  }

  /**
   * Draw move callout
   */
  private drawCallout(callout: Callout): void {
    const ctx = this.ctx;
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2 - 50;
    
    // Semi-transparent backdrop
    ctx.fillStyle = 'rgba(22, 24, 19, 0.7)';
    ctx.fillRect(centerX - 200, centerY - 40, 400, 100);
    
    // Main text
    ctx.fillStyle = theme.colors.cream;
    ctx.font = '48px Bungee, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(callout.text, centerX, centerY + 15);
    
    // Subtext (points, bonuses)
    if (callout.subtext) {
      ctx.fillStyle = theme.colors.gold;
      ctx.font = '20px Nunito, sans-serif';
      ctx.fillText(callout.subtext, centerX, centerY + 45);
    }
  }

  /**
   * Draw countdown
   */
  drawCountdown(count: number): void {
    this.clear();
    this.drawBackground();
    this.drawBeam();
    
    const ctx = this.ctx;
    const displayNum = Math.ceil(count);
    
    ctx.fillStyle = theme.colors.ink;
    ctx.font = '120px Bungee, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(displayNum > 0 ? displayNum.toString() : 'GO!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }

  /**
   * Get canvas dimensions
   */
  getDimensions(): { width: number; height: number } {
    return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
  }
}
