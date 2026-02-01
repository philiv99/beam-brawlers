/**
 * Beam Brawlers - Main Game Hook
 * Custom hook that manages game state and loop
 */

import { useReducer, useEffect, useRef, useCallback } from 'react';
import { gameReducer, getInitialState } from '../game/gameReducer';
import { GameLoop } from '../engine/gameLoop';
import { InputManager } from '../engine/input';
import { CanvasRenderer } from '../engine/renderer';
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

  // Keep stateRef current
  useEffect(() => {
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

  return {
    state,
    startGame,
    showHowToPlay,
    hideHowToPlay,
    pause,
    resume,
    restart,
    goToMainMenu,
  };
}
