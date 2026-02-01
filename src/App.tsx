/**
 * Beam Brawlers - Main App Component
 */

import { useRef } from 'react';
import { useGame } from './hooks/useGame';
import { TitleScreen, HowToPlay, GameOver } from './ui/components';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './game/constants';
import './theme/global.css';
import styles from './App.module.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    state,
    startGame,
    showHowToPlay,
    hideHowToPlay,
    restart,
    goToMainMenu,
  } = useGame(canvasRef);

  return (
    <div className={styles.app}>
      {/* Canvas (always mounted for renderer initialization) */}
      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${
          state.scene === 'Playing' || state.scene === 'Countdown' || state.scene === 'Paused'
            ? styles.visible
            : styles.hidden
        }`}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />

      {/* Title Screen */}
      {state.scene === 'Title' && (
        <TitleScreen onStart={startGame} onHowToPlay={showHowToPlay} />
      )}

      {/* How to Play Overlay */}
      {state.scene === 'HowToPlay' && <HowToPlay onClose={hideHowToPlay} />}

      {/* Game Over Screen */}
      {state.scene === 'GameOver' && state.result && (
        <GameOver
          result={state.result}
          onPlayAgain={restart}
          onMainMenu={goToMainMenu}
        />
      )}

      {/* Pause indicator (could be expanded to full pause menu) */}
      {state.scene === 'Paused' && (
        <div className={styles.pauseOverlay}>
          <div className={styles.pauseText}>PAUSED</div>
          <p>Press ESC to resume</p>
        </div>
      )}
    </div>
  );
}

export default App;
