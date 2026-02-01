/**
 * Beam Brawlers - Main Game Hook
 * Custom hook that manages game state and loop
 */

import { useReducer, useEffect, useRef, useCallback } from 'react';
import { gameReducer, getInitialState } from '../game/gameReducer';
import { GameLoop } from '../engine/gameLoop';
import { InputManager } from '../engine/input';
import { CanvasRenderer } from '../engine/renderer';
import { audioManager } from '../engine/audio';
import { AIController } from '../game/ai';
import { GRAPPLE_RANGE, MIN_BALANCE_FOR_PIN } from '../game/constants';
import type { GameState } from '../game/types';
import { areInGrappleRange, canBePinned, canAttemptPin } from '../game/logic';

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [state, dispatch] = useReducer(gameReducer, null, getInitialState);
  
  const gameLoopRef = useRef<GameLoop | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const aiControllerRef = useRef<AIController | null>(null);
  const stateRef = useRef<GameState>(state);
  const prevStateRef = useRef<GameState>(state);
  const lastCountdownRef = useRef<number>(0);
  const lastPinProgressRef = useRef<number>(0);

  // Keep stateRef current
  useEffect(() => {
    prevStateRef.current = stateRef.current;
    stateRef.current = state;
  }, [state]);

  // Initialize engine components
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create renderer
    rendererRef.current = new CanvasRenderer(canvasRef.current);

    // Create input manager
    inputManagerRef.current = new InputManager();

    // Create AI controller
    aiControllerRef.current = new AIController();

    // Create game loop
    gameLoopRef.current = new GameLoop({
      update: (deltaTime: number) => {
        const currentState = stateRef.current;
        const inputManager = inputManagerRef.current;
        const aiController = aiControllerRef.current;

        if (!inputManager || !aiController) return;

        // Get player input
        const input = inputManager.getState();

        // Handle single-press inputs (grapple, moves, pin, jump)
        if (currentState.scene === 'Playing' && !currentState.isPaused) {
          // Jump attempt
          if (inputManager.wasJustPressed('jump')) {
            const canJump = currentState.player.state === 'Idle' || currentState.player.state === 'Moving';
            if (canJump && currentState.player.y >= 0 && currentState.player.stamina >= 15) {
              audioManager.play('jump');
            }
            dispatch({ type: 'JUMP', fighter: 'player' });
          }

          // Grapple attempt (only when grounded)
          if (inputManager.wasJustPressed('grapple') && !currentState.isGrappling && currentState.player.y >= 0) {
            dispatch({ type: 'ATTEMPT_GRAPPLE', initiator: 'player' });
          }

          // Move attempts (while grappling)
          if (currentState.isGrappling && currentState.player.state === 'GrappleEngaged') {
            if (inputManager.wasJustPressed('pancake')) {
              dispatch({ type: 'EXECUTE_MOVE', fighter: 'player', move: 'pancake' });
            }
            if (inputManager.wasJustPressed('scissors')) {
              dispatch({ type: 'EXECUTE_MOVE', fighter: 'player', move: 'scissors' });
            }
            if (inputManager.wasJustPressed('guillotine')) {
              dispatch({ type: 'EXECUTE_MOVE', fighter: 'player', move: 'guillotine' });
            }
          }

          // Pin attempt
          if (inputManager.wasJustPressed('pin')) {
            if (
              canAttemptPin(currentState.player, MIN_BALANCE_FOR_PIN) &&
              canBePinned(currentState.opponent) &&
              areInGrappleRange(currentState.player, currentState.opponent, GRAPPLE_RANGE)
            ) {
              dispatch({ type: 'ATTEMPT_PIN', attacker: 'player' });
            }
          }

          // AI decision making
          const aiDecision = aiController.decide(currentState, Date.now());
          
          switch (aiDecision.action) {
            case 'jump':
              dispatch({ type: 'JUMP', fighter: 'opponent' });
              break;
            case 'grapple':
              if (!currentState.isGrappling && currentState.opponent.y >= 0) {
                dispatch({ type: 'ATTEMPT_GRAPPLE', initiator: 'opponent' });
              }
              break;
            case 'executeMove':
              if (aiDecision.move && currentState.opponent.state === 'GrappleEngaged') {
                dispatch({ type: 'EXECUTE_MOVE', fighter: 'opponent', move: aiDecision.move });
              }
              break;
            case 'attemptPin':
              if (
                canAttemptPin(currentState.opponent, MIN_BALANCE_FOR_PIN) &&
                canBePinned(currentState.player) &&
                areInGrappleRange(currentState.opponent, currentState.player, GRAPPLE_RANGE)
              ) {
                dispatch({ type: 'ATTEMPT_PIN', attacker: 'opponent' });
              }
              break;
          }

          // Handle falling resets
          if (currentState.player.state === 'Falling') {
            dispatch({ type: 'FIGHTER_FELL', fighter: 'player' });
          }
          if (currentState.opponent.state === 'Falling') {
            dispatch({ type: 'FIGHTER_FELL', fighter: 'opponent' });
          }
        }

        // Clear just-pressed flags
        inputManager.clearJustPressed();

        // Update game state
        dispatch({ type: 'UPDATE', deltaTime, input });
      },
      render: (_interpolation: number) => {
        const currentState = stateRef.current;
        const renderer = rendererRef.current;

        if (!renderer) return;

        if (currentState.scene === 'Countdown') {
          renderer.drawCountdown(currentState.countdownTimer);
        } else if (currentState.scene === 'Playing' || currentState.scene === 'Paused') {
          renderer.render(currentState);
        }
      },
    });

    return () => {
      gameLoopRef.current?.stop();
      inputManagerRef.current?.stop();
    };
  }, [canvasRef]);

  // Sound effects based on state changes
  useEffect(() => {
    const prev = prevStateRef.current;
    const curr = state;

    // Countdown beeps
    if (curr.scene === 'Countdown') {
      const prevSecond = Math.ceil(prev.countdownTimer);
      const currSecond = Math.ceil(curr.countdownTimer);
      if (currSecond !== prevSecond && currSecond > 0 && currSecond <= 3) {
        if (currSecond !== lastCountdownRef.current) {
          lastCountdownRef.current = currSecond;
          audioManager.play('countdown');
        }
      }
    }

    // Match start
    if (prev.scene === 'Countdown' && curr.scene === 'Playing') {
      audioManager.play('match_start');
      lastCountdownRef.current = 0;
    }

    // Grapple initiated
    if (!prev.isGrappling && curr.isGrappling) {
      audioManager.play('grapple');
    }

    // Player landed (from jump)
    if (prev.player.state === 'Jumping' && curr.player.state !== 'Jumping' && curr.player.y >= 0) {
      if (curr.player.state === 'Stunned' || prev.opponent.state === 'Stunned') {
        // Landed stomp was handled
      } else {
        audioManager.play('land');
      }
    }

    // Opponent landed
    if (prev.opponent.state === 'Jumping' && curr.opponent.state !== 'Jumping' && curr.opponent.y >= 0) {
      if (curr.opponent.state === 'Stunned' || prev.player.state === 'Stunned') {
        // Stomp
      } else {
        audioManager.play('land');
      }
    }

    // Stomp detected (someone got stunned by a landing)
    if (prev.player.state === 'Jumping' && curr.player.state === 'Idle' && 
        prev.opponent.state !== 'Stunned' && curr.opponent.state === 'Stunned') {
      audioManager.play('stomp');
      audioManager.play('crowd_cheer'); // Crowd reacts to stomp
    }
    if (prev.opponent.state === 'Jumping' && curr.opponent.state === 'Idle' && 
        prev.player.state !== 'Stunned' && curr.player.state === 'Stunned') {
      audioManager.play('stomp');
      audioManager.play('crowd_gasp'); // Player got stomped - crowd gasps
    }

    // Callout appeared (move executed)
    if (curr.currentCallout && (!prev.currentCallout || prev.currentCallout.id !== curr.currentCallout.id)) {
      const text = curr.currentCallout.text.toUpperCase();
      if (text.includes('PANCAKE')) {
        audioManager.play('pancake');
        audioManager.play('crowd_cheer');
      } else if (text.includes('SCISSORS')) {
        audioManager.play('scissors');
        audioManager.play('crowd_ooh');
      } else if (text.includes('GUILLOTINE')) {
        audioManager.play('guillotine');
        audioManager.play('crowd_cheer');
      } else if (text.includes('STOMP')) {
        audioManager.play('stomp');
      } else if (text.includes('JUMP')) {
        audioManager.play('score');
      }
    }

    // Pin started - crowd gets tense
    if (prev.pinningFighter === null && curr.pinningFighter !== null) {
      audioManager.play('pin_start');
      audioManager.play('crowd_ooh');
      lastPinProgressRef.current = 0;
    }

    // Pin progress tick (every ~0.5 seconds)
    if (curr.pinningFighter !== null && curr.pinProgress > 0) {
      const prevTick = Math.floor(prev.pinProgress * 6);
      const currTick = Math.floor(curr.pinProgress * 6);
      if (currTick > prevTick) {
        audioManager.play('pin_tick');
      }
    }

    // Fighter fell - crowd gasps
    if (prev.player.state !== 'Falling' && curr.player.state === 'Falling') {
      audioManager.play('fall');
      audioManager.play('crowd_gasp');
    }
    if (prev.opponent.state !== 'Falling' && curr.opponent.state === 'Falling') {
      audioManager.play('fall');
      audioManager.play('crowd_cheer'); // Opponent fell - crowd cheers
    }

    // Game over - big crowd reaction
    if (prev.scene !== 'GameOver' && curr.scene === 'GameOver' && curr.result) {
      if (curr.result.winner === 'player') {
        audioManager.play('victory');
        audioManager.play('crowd_cheer');
        setTimeout(() => audioManager.play('crowd_cheer'), 300);
      } else if (curr.result.winner === 'opponent') {
        audioManager.play('defeat');
        audioManager.play('crowd_ooh');
      } else {
        // Draw - play a neutral sound
        audioManager.play('countdown');
      }
    }
  }, [state]);

  // Start/stop input based on scene
  useEffect(() => {
    const inputManager = inputManagerRef.current;
    if (!inputManager) return;

    if (state.scene === 'Playing' || state.scene === 'Countdown') {
      inputManager.start();
    } else {
      inputManager.stop();
    }
  }, [state.scene]);

  // Start/stop game loop based on scene
  useEffect(() => {
    const gameLoop = gameLoopRef.current;
    if (!gameLoop) return;

    if (state.scene === 'Playing' || state.scene === 'Countdown') {
      gameLoop.start();
    } else {
      gameLoop.stop();
    }
  }, [state.scene]);

  // Reset AI when starting new game
  useEffect(() => {
    if (state.scene === 'Countdown') {
      aiControllerRef.current?.reset();
    }
  }, [state.scene]);

  // Action dispatchers
  const startGame = useCallback(() => {
    // Initialize audio on first user interaction
    audioManager.init();
    audioManager.resume();
    dispatch({ type: 'START_GAME' });
  }, []);

  const showHowToPlay = useCallback(() => {
    dispatch({ type: 'SHOW_HOW_TO_PLAY' });
  }, []);

  const hideHowToPlay = useCallback(() => {
    dispatch({ type: 'HIDE_HOW_TO_PLAY' });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME' });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const goToMainMenu = useCallback(() => {
    gameLoopRef.current?.stop();
    inputManagerRef.current?.stop();
    // Reset to initial state
    dispatch({ type: 'RESTART' });
    // Manually set scene to Title
    setTimeout(() => {
      // This is a hack - ideally we'd have a dedicated action
      window.location.reload();
    }, 100);
  }, []);

  const toggleAudio = useCallback(() => {
    audioManager.init();
    return audioManager.toggle();
  }, []);

  const isAudioEnabled = useCallback(() => {
    return audioManager.isEnabled();
  }, []);

  return {
    state,
    startGame,
    showHowToPlay,
    hideHowToPlay,
    pause,
    resume,
    restart,
    goToMainMenu,
    toggleAudio,
    isAudioEnabled,
  };
}
