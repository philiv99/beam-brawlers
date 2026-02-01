/**
 * Beam Brawlers - Input System
 * Handles keyboard input mapping
 */

import { KEY_BINDINGS } from '../game/constants';
import type { InputState } from '../game/types';

/**
 * Create empty input state
 */
export function createInputState(): InputState {
  return {
    moveLeft: false,
    moveRight: false,
    jump: false,
    crouch: false,
    grapple: false,
    pancake: false,
    scissors: false,
    guillotine: false,
    pin: false,
    defend: false,
  };
}

/**
 * Input manager class for handling keyboard events
 */
export class InputManager {
  private state: InputState;
  private keyMap: Map<string, keyof InputState>;
  private pressedThisFrame: Set<keyof InputState>;

  constructor() {
    this.state = createInputState();
    this.pressedThisFrame = new Set();
    
    // Build reverse mapping from key codes to input names
    this.keyMap = new Map([
      [KEY_BINDINGS.moveLeft, 'moveLeft'],
      [KEY_BINDINGS.moveRight, 'moveRight'],
      [KEY_BINDINGS.jump, 'jump'],
      [KEY_BINDINGS.crouch, 'crouch'],
      [KEY_BINDINGS.grapple, 'grapple'],
      [KEY_BINDINGS.pancake, 'pancake'],
      [KEY_BINDINGS.scissors, 'scissors'],
      [KEY_BINDINGS.guillotine, 'guillotine'],
      [KEY_BINDINGS.pin, 'pin'],
      [KEY_BINDINGS.defend, 'defend'],
    ]);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Start listening to keyboard events
   */
  start(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  /**
   * Stop listening to keyboard events
   */
  stop(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.state = createInputState();
    this.pressedThisFrame.clear();
  }

  /**
   * Get current input state (copy)
   */
  getState(): InputState {
    return { ...this.state };
  }

  /**
   * Check if a key was just pressed this frame
   */
  wasJustPressed(key: keyof InputState): boolean {
    return this.pressedThisFrame.has(key);
  }

  /**
   * Clear just-pressed flags (call at end of frame)
   */
  clearJustPressed(): void {
    this.pressedThisFrame.clear();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const inputName = this.keyMap.get(event.code);
    if (inputName !== undefined) {
      event.preventDefault();
      
      // Track if this is a new press
      if (!this.state[inputName]) {
        this.pressedThisFrame.add(inputName);
      }
      
      this.state[inputName] = true;
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const inputName = this.keyMap.get(event.code);
    if (inputName !== undefined) {
      event.preventDefault();
      this.state[inputName] = false;
    }
  }
}

/**
 * Create and return a singleton input manager
 */
let inputManagerInstance: InputManager | null = null;

export function getInputManager(): InputManager {
  if (!inputManagerInstance) {
    inputManagerInstance = new InputManager();
  }
  return inputManagerInstance;
}
