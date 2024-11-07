import { useContext, useEffect, useRef, useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import { VideoContext } from '../../context/VideoContext';
import styles from './Video.module.scss';

const Video = () => {
    const { setCurrentTime } = useContext(VideoContext);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef();

    // Fonction pour mettre en pause ou démarrer la vidéo
    const togglePlayPause = () => {
        const video = videoRef.current;
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        // Quand le composant est monté, on initialise la vidéo
        const video = videoRef.current;
        setCurrentTime(video);

        // Fonction pour gérer l'événement "keydown"
        const handleKeyPress = (event) => {
            if (event.code === 'Space') {
                // Si la touche Espace est pressée, on toggle play/pause
                event.preventDefault(); // Empêche la page de défiler lorsque la barre d'espace est pressée
                togglePlayPause();
            }
        };

        // Ajout de l'événement keydown
        window.addEventListener('keydown', handleKeyPress);

        // Nettoyage de l'événement à la destruction du composant
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [isPlaying, setCurrentTime]);

    return (
        <div className={styles.videoContainer}>
            <video ref={videoRef} style={{ display: 'none' }} id="video">
                <source src="/videos/video-intro.mp4" />
            </video>
            <div className={styles.playerControls}>
                <button
                    className={styles.playPauseButton}
                    onClick={togglePlayPause}
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
            </div>
        </div>
    );
};

export default Video;
