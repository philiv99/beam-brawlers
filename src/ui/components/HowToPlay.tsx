/**
 * Beam Brawlers - How to Play Overlay
 */

import React from 'react';
import { Button } from './Button';
import styles from './HowToPlay.module.css';

interface HowToPlayProps {
  onClose: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>How to Play</h2>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <h3>🎯 Objective</h3>
            <p>Pin your opponent on the balance beam for <strong>3 seconds</strong> to win!</p>
            <p>Score points with wrestling moves. If time runs out, highest score wins.</p>
          </section>

          <section className={styles.section}>
            <h3>🎮 Controls</h3>
            <div className={styles.controls}>
              <div className={styles.controlGroup}>
                <span className={styles.key}>A / D</span>
                <span>Move Left / Right</span>
              </div>
              <div className={styles.controlGroup}>
                <span className={styles.key}>W</span>
                <span>Jump!</span>
              </div>
              <div className={styles.controlGroup}>
                <span className={styles.key}>SPACE</span>
                <span>Grapple (when close)</span>
              </div>
              <div className={styles.controlGroup}>
                <span className={styles.key}>SHIFT</span>
                <span>Defend / Brace</span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>🦘 Jump Moves</h3>
            <div className={styles.moves}>
              <div className={styles.move}>
                <span className={styles.key}>W</span>
                <div>
                  <strong>Jump</strong> (-15 stamina)
                  <p>Press W to jump! Move A/D in air.</p>
                </div>
              </div>
              <div className={styles.move}>
                <span className={styles.key}>⬇️</span>
                <div>
                  <strong>Stomp</strong> (+175)
                  <p>Land on opponent to stun them!</p>
                </div>
              </div>
              <div className={styles.move}>
                <span className={styles.key}>↔️</span>
                <div>
                  <strong>Jump Over</strong> (+50)
                  <p>Jump over opponent for bonus points!</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>💥 Grapple Moves</h3>
            <div className={styles.moves}>
              <div className={styles.move}>
                <span className={styles.key}>J</span>
                <div>
                  <strong>Pancake</strong> (+200)
                  <p>Slam opponent prone. Sets up pin!</p>
                </div>
              </div>
              <div className={styles.move}>
                <span className={styles.key}>K</span>
                <div>
                  <strong>Scissors</strong> (+150)
                  <p>Drains opponent balance. Can cause fall!</p>
                </div>
              </div>
              <div className={styles.move}>
                <span className={styles.key}>L</span>
                <div>
                  <strong>Guillotine</strong> (+250)
                  <p>High risk, high reward! Longer stun.</p>
                </div>
              </div>
              <div className={styles.move}>
                <span className={styles.key}>P</span>
                <div>
                  <strong>Pin Attempt</strong>
                  <p>When opponent is stunned. Hold 3 seconds!</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>⚡ Tips</h3>
            <ul className={styles.tips}>
              <li>Watch your <strong>balance</strong> near beam edges!</li>
              <li>Use <strong>SHIFT</strong> to counter opponent moves</li>
              <li>Chain different moves for <strong>combo bonuses</strong></li>
              <li>High balance when attacking = <strong>+20% points</strong></li>
            </ul>
          </section>
        </div>

        <Button variant="primary" onClick={onClose}>
          Got It!
        </Button>
      </div>
    </div>
  );
};

export default HowToPlay;
