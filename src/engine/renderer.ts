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

// =============================================================================
// CROWD MEMBER TYPES
// =============================================================================

interface CrowdMember {
  x: number;
  y: number;
  type: 'person' | 'nematode';
  color: string;
  phase: number; // Animation phase offset
  height: number;
  armPhase: number;
}

// Colors for crowd members
const CROWD_COLORS = [
  '#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB',
  '#64B5F6', '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784',
  '#AED581', '#DCE775', '#FFF176', '#FFD54F', '#FFB74D',
  '#FF8A65', '#A1887F', '#90A4AE',
];

// Nematode colors (pale, worm-like)
const NEMATODE_COLORS = [
  '#F5E6D3', '#E8D5C4', '#DBC4B0', '#D4B896', '#C9A882',
  '#F0E0D0', '#E5D5C5', '#DAC5B5',
];

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private crowdMembers: CrowdMember[] = [];
  private animationTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    
    // Generate crowd
    this.generateCrowd();
  }

  /**
   * Generate the crowd with people and nematodes
   */
  private generateCrowd(): void {
    this.crowdMembers = [];
    
    // Crowd sits in rows behind/above the beam
    const rows = 5;
    const membersPerRow = 35;
    const crowdStartY = 50; // Top of crowd area
    const rowHeight = 55;
    
    for (let row = 0; row < rows; row++) {
      const y = crowdStartY + row * rowHeight;
      const rowOffset = (row % 2) * 15; // Stagger rows
      
      for (let i = 0; i < membersPerRow; i++) {
        const x = 20 + rowOffset + i * ((CANVAS_WIDTH - 40) / membersPerRow);
        
        // ~15% chance of nematode, rest are people
        const isNematode = Math.random() < 0.15;
        
        this.crowdMembers.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 8,
          type: isNematode ? 'nematode' : 'person',
          color: isNematode 
            ? NEMATODE_COLORS[Math.floor(Math.random() * NEMATODE_COLORS.length)]
            : CROWD_COLORS[Math.floor(Math.random() * CROWD_COLORS.length)],
          phase: Math.random() * Math.PI * 2,
          height: isNematode ? 20 + Math.random() * 15 : 25 + Math.random() * 10,
          armPhase: Math.random() * Math.PI * 2,
        });
      }
    }
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
    this.animationTime = Date.now() / 1000;
    
    // Calculate crowd excitement based on game state
    let excitement = 0.3; // Base level
    if (state.isGrappling) excitement = 0.6;
    if (state.pinningFighter) excitement = 0.9;
    if (state.player.state === 'Falling' || state.opponent.state === 'Falling') excitement = 1.0;
    if (state.currentCallout) excitement = Math.max(excitement, 0.7);
    
    this.clear();
    this.drawBackground();
    this.drawCrowd(excitement);
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
   * Draw the animated crowd
   */
  private drawCrowd(excitement: number): void {
    const ctx = this.ctx;
    const time = this.animationTime;
    
    // Draw crowd stand/bleacher background
    ctx.fillStyle = '#3D3D3D';
    ctx.fillRect(0, 30, CANVAS_WIDTH, 280);
    
    // Bleacher rows
    for (let i = 0; i < 5; i++) {
      const rowY = 50 + i * 55;
      ctx.fillStyle = i % 2 === 0 ? '#4A4A4A' : '#525252';
      ctx.fillRect(0, rowY, CANVAS_WIDTH, 50);
    }
    
    // Draw each crowd member
    for (const member of this.crowdMembers) {
      if (member.type === 'nematode') {
        this.drawNematode(member, time, excitement);
      } else {
        this.drawPerson(member, time, excitement);
      }
    }
    
    // Draw "voice bubbles" for cheering crowd (scattered exclamations)
    if (excitement > 0.5) {
      this.drawCrowdVoices(time, excitement);
    }
  }

  /**
   * Draw an animated person in the crowd
   */
  private drawPerson(member: CrowdMember, time: number, excitement: number): void {
    const ctx = this.ctx;
    const { x, y, color, phase, height, armPhase } = member;
    
    // Animation based on excitement
    const bobSpeed = 3 + excitement * 5;
    const bobAmount = 2 + excitement * 4;
    const bob = Math.sin(time * bobSpeed + phase) * bobAmount;
    
    const headY = y + bob;
    const bodyY = headY + 8;
    
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(x - 6, bodyY, 12, height - 8);
    
    // Head
    ctx.beginPath();
    ctx.arc(x, headY, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms waving when excited
    if (excitement > 0.4) {
      const armWave = Math.sin(time * 8 + armPhase) * (excitement * 0.8);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      // Left arm
      ctx.beginPath();
      ctx.moveTo(x - 6, bodyY + 5);
      ctx.lineTo(x - 12, bodyY - 5 + armWave * 10);
      ctx.stroke();
      
      // Right arm
      ctx.beginPath();
      ctx.moveTo(x + 6, bodyY + 5);
      ctx.lineTo(x + 12, bodyY - 5 - armWave * 10);
      ctx.stroke();
    }
    
    // Simple face
    ctx.fillStyle = '#2D2D2D';
    // Eyes
    ctx.fillRect(x - 3, headY - 2, 2, 2);
    ctx.fillRect(x + 1, headY - 2, 2, 2);
    // Mouth (open when cheering)
    if (excitement > 0.5 && Math.sin(time * 10 + phase) > 0.3) {
      ctx.beginPath();
      ctx.arc(x, headY + 3, 2, 0, Math.PI);
      ctx.fill();
    }
  }

  /**
   * Draw an animated nematode in the crowd
   */
  private drawNematode(member: CrowdMember, time: number, excitement: number): void {
    const ctx = this.ctx;
    const { x, y, color, phase, height } = member;
    
    // Nematodes wiggle more with excitement
    const wiggleSpeed = 4 + excitement * 4;
    const wiggleAmount = 3 + excitement * 5;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw wiggly worm body
    ctx.beginPath();
    const segments = 8;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const segY = y + t * height;
      const wiggle = Math.sin(time * wiggleSpeed + phase + t * Math.PI * 2) * wiggleAmount;
      
      if (i === 0) {
        ctx.moveTo(x + wiggle, segY);
      } else {
        ctx.lineTo(x + wiggle, segY);
      }
    }
    ctx.stroke();
    
    // Nematode head (slightly larger)
    const headWiggle = Math.sin(time * wiggleSpeed + phase) * wiggleAmount;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + headWiggle, y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Tiny eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x + headWiggle - 1.5, y - 1, 1, 0, Math.PI * 2);
    ctx.arc(x + headWiggle + 1.5, y - 1, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw crowd voice bubbles/exclamations
   */
  private drawCrowdVoices(time: number, excitement: number): void {
    const ctx = this.ctx;
    const exclamations = ['GO!', 'WOO!', 'YEAH!', '!!!', 'PIN!', 'SLAM!', '🔥', '💥', '⭐'];
    
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    
    // Show more voices when more excited
    const voiceCount = Math.floor(excitement * 8);
    
    for (let i = 0; i < voiceCount; i++) {
      const seed = i * 137.5; // Golden angle for distribution
      const vx = (seed * 7) % CANVAS_WIDTH;
      const baseVy = 80 + (seed * 3) % 180;
      
      // Bubble rises and fades
      const lifePhase = ((time * 0.5 + seed / 100) % 2);
      if (lifePhase > 1.5) continue; // Hide some
      
      const vy = baseVy - lifePhase * 20;
      const alpha = Math.max(0, 1 - lifePhase * 0.7);
      
      const text = exclamations[Math.floor(seed) % exclamations.length];
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.fillText(text, vx, vy);
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
   * Draw a fighter with animations
   */
  private drawFighter(fighter: Fighter, accentColor: string): void {
    const ctx = this.ctx;
    const time = this.animationTime;
    const x = fighter.x;
    const baseY = BEAM_Y - FIGHTER_HEIGHT;
    
    // Calculate actual Y position including jump offset
    let drawY = baseY + fighter.y;
    let rotation = 0;
    let scale = 1;
    
    // Handle falling animation (tumbling off beam)
    if (fighter.state === 'Falling') {
      // Tumble animation - fighter spins and falls
      const fallProgress = (fighter.stateTimer > 0) ? (1 - fighter.stateTimer) : 1;
      drawY = BEAM_Y + 30 + fallProgress * 100;
      rotation = fallProgress * Math.PI * 2.5; // 2.5 rotations during fall
      scale = Math.max(0.5, 1 - fallProgress * 0.3); // Shrink slightly as they fall away
      
      // Draw falling motion lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const lineY = drawY - 20 - i * 15;
        ctx.beginPath();
        ctx.moveTo(x - 10 + i * 5, lineY);
        ctx.lineTo(x + 10 - i * 5, lineY - 20);
        ctx.stroke();
      }
    }
    
    // Handle jumping animation (aerial pose)
    if (fighter.state === 'Jumping') {
      // Slight rotation during jump based on velocity
      rotation = fighter.velocityY * 0.0005;
      
      // Arms spread pose indicator (through body shape)
      if (fighter.y < -30) {
        // Draw motion blur effect
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.ellipse(x, drawY + 40, 15, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    
    // Fighter shadow (changes size based on height)
    const shadowScale = Math.max(0.3, 1 + fighter.y / 100);
    if (fighter.state !== 'Falling') {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * shadowScale})`;
      ctx.beginPath();
      ctx.ellipse(x, BEAM_Y - 2, (FIGHTER_WIDTH / 2 - 5) * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Apply rotation transform for falling/jumping
    ctx.save();
    ctx.translate(x, drawY + FIGHTER_HEIGHT / 2);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.translate(-x, -(drawY + FIGHTER_HEIGHT / 2));
    
    // Fighter body
    ctx.fillStyle = accentColor;
    ctx.strokeStyle = theme.colors.ink;
    ctx.lineWidth = 3;
    
    const bodyWidth = FIGHTER_WIDTH - 10;
    const bodyHeight = FIGHTER_HEIGHT - 20;
    
    // Draw different pose based on state
    if (fighter.state === 'Falling') {
      // Flailing pose - limbs spread
      this.drawFlailingFighter(x, drawY, bodyWidth, bodyHeight, accentColor, time);
    } else if (fighter.state === 'Jumping') {
      // Aerial pose
      this.drawJumpingFighter(x, drawY, bodyWidth, bodyHeight, accentColor, fighter.velocityY);
    } else if (fighter.state === 'Stunned') {
      // Dazed pose
      this.drawStunnedFighter(x, drawY, bodyWidth, bodyHeight, accentColor, time);
    } else {
      // Normal pose
      this.drawNormalFighter(x, drawY, bodyWidth, bodyHeight, accentColor, fighter.facing);
    }
    
    ctx.restore();
    
    // State indicator (drawn without rotation)
    if (fighter.state !== 'Falling') {
      this.drawStateIndicator(fighter, x, drawY);
    }
    
    // Name label (Zappa song title)
    if (fighter.state !== 'Falling') {
      ctx.fillStyle = fighter.id === 'player' ? theme.colors.mint : theme.colors.pop;
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = theme.colors.ink;
      ctx.lineWidth = 2;
      ctx.strokeText(fighter.name, x, drawY - 5);
      ctx.fillText(fighter.name, x, drawY - 5);
    } else {
      // "AAAH!" text for falling
      ctx.fillStyle = theme.colors.pop;
      ctx.font = 'bold 16px Bungee, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AAAH!', x, drawY - 10);
    }
  }

  /**
   * Draw fighter in normal standing pose
   */
  private drawNormalFighter(x: number, y: number, bodyWidth: number, bodyHeight: number, color: string, facing: 'left' | 'right'): void {
    const ctx = this.ctx;
    
    ctx.fillStyle = color;
    ctx.strokeStyle = theme.colors.ink;
    ctx.lineWidth = 3;
    
    // Body
    ctx.fillRect(x - bodyWidth / 2, y + 20, bodyWidth, bodyHeight);
    ctx.strokeRect(x - bodyWidth / 2, y + 20, bodyWidth, bodyHeight);
    
    // Head
    ctx.beginPath();
    ctx.arc(x, y + 12, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Eyes
    const eyeOffset = facing === 'right' ? 4 : -4;
    ctx.fillStyle = theme.colors.paper;
    ctx.beginPath();
    ctx.arc(x + eyeOffset - 3, y + 10, 3, 0, Math.PI * 2);
    ctx.arc(x + eyeOffset + 3, y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw fighter in jumping pose
   */
  private drawJumpingFighter(x: number, y: number, bodyWidth: number, bodyHeight: number, color: string, velocityY: number): void {
    const ctx = this.ctx;
    
    ctx.fillStyle = color;
    ctx.strokeStyle = theme.colors.ink;
    ctx.lineWidth = 3;
    
    // Compact body (tucked)
    ctx.fillRect(x - bodyWidth / 2, y + 25, bodyWidth, bodyHeight - 10);
    ctx.strokeRect(x - bodyWidth / 2, y + 25, bodyWidth, bodyHeight - 10);
    
    // Head
    ctx.beginPath();
    ctx.arc(x, y + 17, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Arms spread
    ctx.lineWidth = 4;
    const armAngle = velocityY < 0 ? -0.5 : 0.3; // Up when rising, down when falling
    ctx.beginPath();
    ctx.moveTo(x - bodyWidth / 2, y + 35);
    ctx.lineTo(x - bodyWidth / 2 - 15, y + 25 + armAngle * 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + bodyWidth / 2, y + 35);
    ctx.lineTo(x + bodyWidth / 2 + 15, y + 25 + armAngle * 20);
    ctx.stroke();
    
    // Determined eyes
    ctx.fillStyle = theme.colors.paper;
    ctx.beginPath();
    ctx.arc(x - 4, y + 15, 3, 0, Math.PI * 2);
    ctx.arc(x + 4, y + 15, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw fighter in flailing/falling pose
   */
  private drawFlailingFighter(x: number, y: number, bodyWidth: number, bodyHeight: number, color: string, time: number): void {
    const ctx = this.ctx;
    
    ctx.fillStyle = color;
    ctx.strokeStyle = theme.colors.ink;
    ctx.lineWidth = 3;
    
    // Body
    ctx.fillRect(x - bodyWidth / 2, y + 20, bodyWidth, bodyHeight);
    ctx.strokeRect(x - bodyWidth / 2, y + 20, bodyWidth, bodyHeight);
    
    // Head
    ctx.beginPath();
    ctx.arc(x, y + 12, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Flailing arms
    ctx.lineWidth = 4;
    const flail = Math.sin(time * 20) * 15;
    ctx.beginPath();
    ctx.moveTo(x - bodyWidth / 2, y + 30);
    ctx.lineTo(x - bodyWidth / 2 - 20, y + 10 + flail);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + bodyWidth / 2, y + 30);
    ctx.lineTo(x + bodyWidth / 2 + 20, y + 10 - flail);
    ctx.stroke();
    
    // Flailing legs
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 20 + bodyHeight);
    ctx.lineTo(x - 15, y + 30 + bodyHeight + flail * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 20 + bodyHeight);
    ctx.lineTo(x + 15, y + 30 + bodyHeight - flail * 0.5);
    ctx.stroke();
    
    // Panicked eyes (X X)
    ctx.fillStyle = theme.colors.paper;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('X', x - 4, y + 13);
    ctx.fillText('X', x + 4, y + 13);
    
    // Open mouth (screaming)
    ctx.beginPath();
    ctx.ellipse(x, y + 18, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw fighter in stunned pose
   */
  private drawStunnedFighter(x: number, y: number, bodyWidth: number, bodyHeight: number, color: string, time: number): void {
    const ctx = this.ctx;
    
    // Wobble effect
    const wobble = Math.sin(time * 10) * 3;
    
    ctx.fillStyle = color;
    ctx.strokeStyle = theme.colors.ink;
    ctx.lineWidth = 3;
    
    // Body (slightly tilted)
    ctx.save();
    ctx.translate(x, y + 50);
    ctx.rotate(wobble * 0.05);
    ctx.translate(-x, -(y + 50));
    
    ctx.fillRect(x - bodyWidth / 2, y + 20, bodyWidth, bodyHeight);
    ctx.strokeRect(x - bodyWidth / 2, y + 20, bodyWidth, bodyHeight);
    
    // Head
    ctx.beginPath();
    ctx.arc(x + wobble, y + 12, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
    
    // Dizzy spiral eyes
    ctx.strokeStyle = theme.colors.paper;
    ctx.lineWidth = 2;
    const spiralTime = time * 5;
    for (let eye = -1; eye <= 1; eye += 2) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = spiralTime + i * 0.5;
        const r = i * 0.4;
        const ex = x + eye * 4 + Math.cos(angle) * r;
        const ey = y + 10 + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(ex, ey);
        else ctx.lineTo(ex, ey);
      }
      ctx.stroke();
    }
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
