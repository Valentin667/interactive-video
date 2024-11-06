// Video.jsx
import { useContext, useEffect, useRef, useState } from 'react';
import { useVideo } from '../../context/VideoContext';
import { VideoContext } from '../../context/VideoContext';
import { gsap } from 'gsap';
import styles from './Video.module.scss';

const Video = () => {
    // const { videoRef, isPlaying, togglePlayPause, currentTime } = useVideo();
    const { setCurrentTime } = useContext(VideoContext);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef();
    console.log("qsd");
    

    useEffect(() => {
        const video = videoRef.current;
        setCurrentTime(video);
        console.log("vqsdqsd");
    }, []);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    // const handleTimeUpdate = () => {
    //     setCurrentTime(videoRef.current.currentTime);

    //     // Affichage/Masquage du texte avec GSAP
    //     // if (videoRef.current.currentTime >= 15 && videoRef.current.currentTime < 17) {
    //     //     gsap.fromTo(".animatedText", { opacity: 0 }, { opacity: 1, duration: 1 });
    //     // } else if (videoRef.current.currentTime >= 17) {
    //     //     gsap.to(".animatedText", { opacity: 0, duration: 1 });
    //     // }
    // };

    // useEffect(() => {
    //     videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
    //     return () => videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
    // }, []);

    return (
        <div className={styles.videoContainer}>
            <video ref={videoRef} style={{display: "none"}} id='video'>
                <source src='/videos/video-intro.mp4' />
            </video>
            <div className={styles.playerControls}>
                <button 
                    className={styles.playPauseButton} 
                    onClick={togglePlayPause}
                >
                    {isPlaying ? "Pause" : "Play"}
                </button>
            </div>
        </div>
    );
};

export default Video;
