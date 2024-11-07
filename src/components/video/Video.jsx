import { useContext, useEffect, useRef, useState } from 'react';
import { VideoContext } from '../../context/VideoContext';
import styles from './Video.module.scss';

const Video = () => {
    const { setCurrentTime } = useContext(VideoContext);
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(1); // État pour gérer le volume
    const [currentTime, setCurrentTimeState] = useState(0); // État pour le temps écoulé
    const [duration, setDuration] = useState(0); // Durée totale de la vidéo
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

    // Fonction pour avancer de 10 secondes
    const forward = () => {
        const video = videoRef.current;
        video.currentTime += 10;
    };

    // Fonction pour revenir en arrière de 10 secondes
    const rewind = () => {
        const video = videoRef.current;
        video.currentTime -= 10;
    };

    const handleVolumeChange = (event) => {
        const video = videoRef.current;
        const newVolume = event.target.value;
        video.volume = newVolume;
        setVolume(newVolume);
    };

    // Fonction pour gérer la barre de progression
    const handleProgressChange = (event) => {
        const video = videoRef.current;
        video.currentTime = event.target.value;
        setCurrentTimeState(video.currentTime);
    };

    useEffect(() => {
        const video = videoRef.current;

        // Récupérer la durée totale de la vidéo
        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        // Fonction pour mettre à jour le temps écoulé en continu
        const updateCurrentTime = () => {
            setCurrentTimeState(video.currentTime);
        };

        // Met à jour la barre de progression toutes les 16ms (approximativement 60FPS)
        const interval = setInterval(updateCurrentTime, 16);

        // Fonction pour gérer l'événement "keydown"
        const handleKeyPress = (event) => {
            if (event.code === 'Space') {
                // Si la touche Espace est pressée, on toggle play/pause
                event.preventDefault();
                togglePlayPause();
            }
        };
        
        window.addEventListener('keydown', handleKeyPress);

        // Nettoyage de l'événement et des listeners
        return () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleKeyPress);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [isPlaying]);

    return (
        <div className={styles.videoContainer}>
            <video ref={videoRef} style={{ display: 'none' }} id="video">
                <source src="/videos/video-intro.mp4" />
            </video>
            <video ref={videoRef} style={{ display: 'none' }} id="video-screen">
                <source src="/videos/video-screen.mp4" />
            </video>
            <div className={styles.playerControls}>
                {/* Image à gauche */}
                <div className={styles.logo}>
                    <img src="/images/cover.jpg" alt="Logo" draggable="false" />
                </div>
                <div className={styles.buttons}>
                    {/* Rewind Button */}
                    <button className={styles.rewindButton} onClick={rewind}>
                        <img src="/images/back.png" alt="Rewind" />
                    </button>

                    {/* Play/Pause Button */}
                    <button className={styles.playPauseButton} onClick={togglePlayPause}>
                        <img
                            src={isPlaying ? "/images/pause.png" : "/images/play.png"}
                            alt={isPlaying ? "Pause" : "Play"}
                        />
                    </button>

                    {/* Forward Button */}
                    <button className={styles.forwardButton} onClick={forward}>
                        <img src="/images/forward.png" alt="Forward" />
                    </button>
                </div>

                {/* Video Progress Bar */}
                <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleProgressChange}
                    className={styles.progressBar}
                />

                {/* Video Time */}
                <div className={styles.time}>
                    {Math.floor(currentTime)} / {Math.floor(duration)}
                </div>

                {/* Volume Control */}
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className={styles.volumeControl}
                />
            </div>
        </div>
    );
};

export default Video;
