/**
 * Beam Brawlers - Game Over Screen
 */

import React from 'react';
import type { GameResult } from '../../game/types';
import { Button } from './Button';
import styles from './GameOver.module.css';

interface GameOverProps {
  result: GameResult;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  playerName: string;
  opponentName: string;
}

export const GameOver: React.FC<GameOverProps> = ({ 
  result, 
  onPlayAgain, 
  onMainMenu,
  playerName,
  opponentName,
}) => {
  const isPlayerWin = result.winner === 'player';
  const isDraw = result.winner === 'draw';

  const getTitle = () => {
    if (isDraw) return 'DRAW!';
    return isPlayerWin ? `${playerName} WINS!` : `${opponentName} WINS!`;
  };

  const getSubtitle = () => {
    switch (result.reason) {
      case 'pin':
        return isPlayerWin ? `${playerName} pinned ${opponentName}!` : `${opponentName} pinned ${playerName}!`;
      case 'timeout':
        if (isDraw) return 'Time ran out - tied score!';
        return 'Time ran out!';
      case 'surrender':
        return `${opponentName} surrendered!`;
      default:
        return '';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${isPlayerWin ? styles.win : isDraw ? styles.draw : styles.lose}`}>
        <h1 className={styles.title}>{getTitle()}</h1>
        <p className={styles.subtitle}>{getSubtitle()}</p>

        <div className={styles.scores}>
          <div className={styles.scoreBox}>
            <span className={styles.label}>{playerName}</span>
            <span className={styles.score}>{result.playerScore}</span>
          </div>
          <div className={styles.vs}>VS</div>
          <div className={styles.scoreBox}>
            <span className={styles.label}>{opponentName}</span>
            <span className={styles.score}>{result.opponentScore}</span>
          </div>
        </div>

        <p className={styles.duration}>
          Match Duration: {formatDuration(result.matchDuration)}
        </p>

        <div className={styles.buttons}>
          <Button variant="primary" size="large" onClick={onPlayAgain}>
            Play Again
          </Button>
          <Button variant="secondary" onClick={onMainMenu}>
            Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
