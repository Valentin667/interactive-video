import React, { useEffect } from 'react';
import styles from './Menu.module.scss';

const Menu = ({ startExperience }) => {
    // const { togglePlayPause, isPlaying, videoRef } = useVideo();

    // const handleStartClick = () => {
    //     if (!isPlaying) {
    //         // Démarre la vidéo seulement si elle n'est pas déjà en train de jouer
    //         videoRef.current.play().catch((error) => {
    //             console.error("Erreur lors du démarrage de la vidéo:", error);
    //         });
    //     }
    //     startExperience();  // Démarre l'expérience (affichage de la scène 3D)
    // };

    return (
        <div className={styles.menuContainer}>
            <button className={styles.startButton}>
                {/* {isPlaying ? 'Pause' : 'Start Experience'} */}
            </button>
        </div>
    );
};

export default Menu;
