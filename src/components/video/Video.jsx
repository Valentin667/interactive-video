import { useContext, useEffect, useRef, useState } from 'react';
import { VideoContext } from '../../context/VideoContext';
import styles from './Video.module.scss';

const Video = ({ experienceStarted }) => {
    const { setCurrentTime } = useContext(VideoContext);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1); // État pour gérer le volume
    const [currentTime, setCurrentTimeState] = useState(0); // État pour le temps écoulé
    const [duration, setDuration] = useState(0); // Durée totale de la vidéo
    const [showIndication, setShowIndication] = useState(false); 
    const [hasIndicationBeenShown, setHasIndicationBeenShown] = useState(false);
    
    const videoRef = useRef();
    const audioRef = useRef();

    const resetIndication = () => {
        setShowIndication(false);
    };

    const togglePlayPause = () => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (isPlaying) {
            video.pause();
            audio.pause();
        } else {
            video.play();
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const forward = () => {
        const video = videoRef.current;
        video.currentTime += 10;
    };

    const rewind = () => {
        const video = videoRef.current;
        video.currentTime -= 10;
    };

    const handleVolumeChange = (event) => {
        const video = videoRef.current;
        const newVolume = event.target.value;
        video.volume = newVolume;
        audioRef.current.volume = newVolume;
        setVolume(newVolume);
    };

    const handleProgressChange = (event) => {
        const video = videoRef.current;
        video.currentTime = event.target.value;
        setCurrentTimeState(video.currentTime);
    };

    useEffect(( experienceStarted ) => {
        const video = videoRef.current;
        const audio = audioRef.current;

        const newTime = video.currentTime;
            setCurrentTimeState(newTime);
            setCurrentTime(newTime);

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        const updateCurrentTime = () => {
            setCurrentTimeState(video.currentTime);
            setCurrentTime(video.currentTime);

            if (video.currentTime >= 26 && video.currentTime < 27 && !hasIndicationBeenShown) {
                // Afficher l'indication
                setShowIndication(true);
                setHasIndicationBeenShown(true); // Assurez-vous que l'indication ne s'affiche qu'une seule fois

                setTimeout(() => {
                    setShowIndication(false);
                }, 5000);
            }
        };

        const interval = setInterval(updateCurrentTime, 16);

        const handleKeyPress = (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                togglePlayPause();
            }
        };
        
        window.addEventListener('keydown', handleKeyPress);

        return () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleKeyPress);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [isPlaying, hasIndicationBeenShown]);

    useEffect(() => {
        if (experienceStarted) {
            const video = videoRef.current;
            const audio = audioRef.current;
            video.volume = 1;
            video.play();
            audio.play();
            setIsPlaying(true);
        }
    }, [experienceStarted]);

    return (
        <>
            {/* Indication */}
                <div className={styles.indications}>
                    {showIndication && (
                        <p className={styles.text}>Clique pour choisir un jeu</p>
                    )}
                </div>
            <div className={styles.videoContainer}>
            <video ref={videoRef} style={{ display: 'none' }} id="video" src="/videos/video-intro.mp4"></video>

            {/* Audio */}
            <audio ref={audioRef} src="/audio/audio.mp3" preload="auto" />

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
            </div>
        </div>
        </>
    );
};

export default Video;
