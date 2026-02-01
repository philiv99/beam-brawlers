/**
 * Beam Brawlers - Audio Manager
 * Web Audio API based sound effects using synthesis (no external files needed)
 */

import { AUDIO_ENABLED_KEY, DEFAULT_AUDIO_ENABLED, MASTER_VOLUME } from '../game/constants';

export type SoundEffect =
  | 'jump'
  | 'land'
  | 'stomp'
  | 'grapple'
  | 'pancake'
  | 'scissors'
  | 'guillotine'
  | 'pin_start'
  | 'pin_tick'
  | 'pin_complete'
  | 'countdown'
  | 'match_start'
  | 'victory'
  | 'defeat'
  | 'hit'
  | 'block'
  | 'fall'
  | 'score';

class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean;
  private masterGain: GainNode | null = null;

  constructor() {
    this.enabled = this.loadEnabledState();
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  public init(): void {
    if (this.ctx) return;

    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = MASTER_VOLUME;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('AudioContext not available:', e);
    }
  }

  /**
   * Resume audio context if suspended
   */
  public async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /**
   * Check if audio is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Toggle audio on/off
   */
  public toggle(): boolean {
    this.enabled = !this.enabled;
    this.saveEnabledState();
    return this.enabled;
  }

  /**
   * Set audio enabled state
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.saveEnabledState();
  }

  /**
   * Play a sound effect
   */
  public play(sound: SoundEffect): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;

    // Ensure context is running
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    switch (sound) {
      case 'jump':
        this.playJump();
        break;
      case 'land':
        this.playLand();
        break;
      case 'stomp':
        this.playStomp();
        break;
      case 'grapple':
        this.playGrapple();
        break;
      case 'pancake':
        this.playPancake();
        break;
      case 'scissors':
        this.playScissors();
        break;
      case 'guillotine':
        this.playGuillotine();
        break;
      case 'pin_start':
        this.playPinStart();
        break;
      case 'pin_tick':
        this.playPinTick();
        break;
      case 'pin_complete':
        this.playPinComplete();
        break;
      case 'countdown':
        this.playCountdown();
        break;
      case 'match_start':
        this.playMatchStart();
        break;
      case 'victory':
        this.playVictory();
        break;
      case 'defeat':
        this.playDefeat();
        break;
      case 'hit':
        this.playHit();
        break;
      case 'block':
        this.playBlock();
        break;
      case 'fall':
        this.playFall();
        break;
      case 'score':
        this.playScore();
        break;
    }
  }

  // ==========================================================================
  // Sound Synthesis Functions
  // ==========================================================================

  private playJump(): void {
    // Rising sweep - "boing" effect
    const osc = this.createOscillator('sine');
    const gain = this.createGain(0.3);
    osc.frequency.setValueAtTime(200, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx!.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.15);
  }

  private playLand(): void {
    // Thud - low impact
    const osc = this.createOscillator('sine');
    const gain = this.createGain(0.4);
    osc.frequency.setValueAtTime(150, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx!.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.1);
  }

  private playStomp(): void {
    // Heavy impact + crunch
    const osc1 = this.createOscillator('sawtooth');
    const osc2 = this.createOscillator('square');
    const gain = this.createGain(0.5);
    
    osc1.frequency.setValueAtTime(200, this.ctx!.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(40, this.ctx!.currentTime + 0.2);
    osc2.frequency.setValueAtTime(80, this.ctx!.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(30, this.ctx!.currentTime + 0.15);
    
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.25);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain!);
    
    osc1.start();
    osc2.start();
    osc1.stop(this.ctx!.currentTime + 0.25);
    osc2.stop(this.ctx!.currentTime + 0.25);
  }

  private playGrapple(): void {
    // Lock-in sound - two tones
    const osc = this.createOscillator('square');
    const gain = this.createGain(0.2);
    osc.frequency.setValueAtTime(300, this.ctx!.currentTime);
    osc.frequency.setValueAtTime(400, this.ctx!.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.15);
  }

  private playPancake(): void {
    // Slam - heavy whomp
    this.playImpactSound(120, 0.6, 0.3);
    // Add slap
    setTimeout(() => this.playNoiseHit(0.3, 0.1), 50);
  }

  private playScissors(): void {
    // Scissor snip - two quick tones
    const osc = this.createOscillator('sawtooth');
    const gain = this.createGain(0.3);
    osc.frequency.setValueAtTime(500, this.ctx!.currentTime);
    osc.frequency.setValueAtTime(300, this.ctx!.currentTime + 0.08);
    osc.frequency.setValueAtTime(500, this.ctx!.currentTime + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.25);
  }

  private playGuillotine(): void {
    // Dramatic descending tone + impact
    const osc = this.createOscillator('sawtooth');
    const gain = this.createGain(0.4);
    osc.frequency.setValueAtTime(800, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx!.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.35);
    
    // Add thud at end
    setTimeout(() => this.playImpactSound(80, 0.5, 0.15), 250);
  }

  private playPinStart(): void {
    // Alert tone
    const osc = this.createOscillator('sine');
    const gain = this.createGain(0.3);
    osc.frequency.setValueAtTime(440, this.ctx!.currentTime);
    gain.gain.setValueAtTime(0.3, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.3);
  }

  private playPinTick(): void {
    // Quick tick
    const osc = this.createOscillator('sine');
    const gain = this.createGain(0.2);
    osc.frequency.setValueAtTime(880, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.05);
  }

  private playPinComplete(): void {
    // Bell/chime
    this.playChime([523, 659, 784], 0.4, 0.8);
  }

  private playCountdown(): void {
    // Beep
    const osc = this.createOscillator('sine');
    const gain = this.createGain(0.3);
    osc.frequency.setValueAtTime(440, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.15);
  }

  private playMatchStart(): void {
    // Rising fanfare
    this.playChime([262, 330, 392, 523], 0.4, 0.6);
  }

  private playVictory(): void {
    // Triumphant ascending arpeggio
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = this.createOscillator('sine');
        const gain = this.createGain(0.3);
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx!.currentTime + 0.4);
      }, i * 150);
    });
  }

  private playDefeat(): void {
    // Descending sad tones
    const notes = [392, 349, 330, 262]; // G4 F4 E4 C4
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = this.createOscillator('sine');
        const gain = this.createGain(0.25);
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx!.currentTime + 0.3);
      }, i * 200);
    });
  }

  private playHit(): void {
    this.playImpactSound(150, 0.4, 0.15);
  }

  private playBlock(): void {
    // Metallic clank
    const osc = this.createOscillator('triangle');
    const gain = this.createGain(0.3);
    osc.frequency.setValueAtTime(600, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx!.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.1);
  }

  private playFall(): void {
    // Descending whistle + thud
    const osc = this.createOscillator('sine');
    const gain = this.createGain(0.3);
    osc.frequency.setValueAtTime(600, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx!.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.5);
    
    setTimeout(() => this.playImpactSound(60, 0.5, 0.2), 400);
  }

  private playScore(): void {
    // Quick positive blip
    const osc = this.createOscillator('sine');
    const gain = this.createGain(0.25);
    osc.frequency.setValueAtTime(880, this.ctx!.currentTime);
    osc.frequency.setValueAtTime(1100, this.ctx!.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.15);
  }

  // ==========================================================================
  // Helper Functions
  // ==========================================================================

  private createOscillator(type: OscillatorType): OscillatorNode {
    const osc = this.ctx!.createOscillator();
    osc.type = type;
    return osc;
  }

  private createGain(initialValue: number): GainNode {
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(initialValue, this.ctx!.currentTime);
    return gain;
  }

  private playImpactSound(freq: number, volume: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.createOscillator('sine');
    const gain = this.createGain(volume);
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.3, this.ctx.currentTime + duration);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playNoiseHit(volume: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.createGain(volume);
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  }

  private playChime(frequencies: number[], volume: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        const osc = this.createOscillator('sine');
        const gain = this.createGain(volume);
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx!.currentTime + duration);
      }, i * 100);
    });
  }

  private loadEnabledState(): boolean {
    try {
      const stored = localStorage.getItem(AUDIO_ENABLED_KEY);
      return stored !== null ? stored === 'true' : DEFAULT_AUDIO_ENABLED;
    } catch {
      return DEFAULT_AUDIO_ENABLED;
    }
  }

  private saveEnabledState(): void {
    try {
      localStorage.setItem(AUDIO_ENABLED_KEY, String(this.enabled));
    } catch {
      // Ignore localStorage errors
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager();
