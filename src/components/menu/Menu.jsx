// Menu.jsx
import React from 'react';
import styles from './Menu.module.scss';

const Menu = ({ startExperience }) => {
  return (
    <div className={styles.menuContainer}>
      <h1 className={styles.title}>Une expérience vidéo interactive</h1>
      <div 
        onClick={startExperience} 
        className={styles.startText}
      >
        Démarrer l'expérience
      </div>
    </div>
  );
};

export default Menu;
