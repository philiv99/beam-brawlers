/**
 * Beam Brawlers - Title Screen Component
 */

import React from 'react';
import { GAME_NAME } from '../../game/constants';
import { Button } from './Button';
import styles from './TitleScreen.module.css';

interface TitleScreenProps {
  onStart: () => void;
  onHowToPlay: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onHowToPlay }) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Logo/Title */}
        <h1 className={styles.title}>{GAME_NAME}</h1>
        <p className={styles.subtitle}>Gymnastics meets Grappling!</p>
        
        {/* Decorative beam preview */}
        <div className={styles.beamPreview}>
          <div className={styles.beam}>
            <span className={styles.fighter} style={{ left: '30%' }}>🤼</span>
            <span className={styles.fighter} style={{ left: '60%' }}>🤼</span>
          </div>
        </div>

        {/* Menu buttons */}
        <div className={styles.menu}>
          <Button variant="primary" size="large" onClick={onStart}>
            Start Match
          </Button>
          <Button variant="secondary" size="medium" onClick={onHowToPlay}>
            How to Play
          </Button>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>A LinkittyDo Game</p>
        </footer>
      </div>
    </div>
  );
};

export default TitleScreen;
