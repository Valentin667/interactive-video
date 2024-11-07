import React from 'react';
import styles from './Menu.module.scss';

const Menu = ({ startExperience }) => {
  return (
    <div className={styles.menuContainer}>
      {/* Texte en haut de la page */}
      <div className={styles.topText}>2024 - Appuie pour naître</div>

      {/* GIF centré au milieu */}
      <div className={styles.gifContainer}>
        <img src="/images/loader.gif" alt="Lancer l'expérience" onClick={startExperience}/>
      </div>
    </div>
  );
};

export default Menu;
