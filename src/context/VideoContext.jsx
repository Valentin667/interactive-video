// VideoContext.js
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const VideoContext = createContext();

const VideoProvider = ({ children }) => {
    const videoRef = useRef(document.createElement("video"));
    videoRef.current.src = '/videos/video-intro.mp4';
    videoRef.current.crossOrigin = 'anonymous';
    videoRef.current.loop = true;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(null);

    useEffect(() => {
        console.log("video", currentTime);
    },[currentTime])

    const togglePlayPause = () => {
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <VideoContext.Provider value={{ videoRef, isPlaying, togglePlayPause, currentTime, setCurrentTime }}>
            {children}
        </VideoContext.Provider>
    );
};

export { VideoProvider, VideoContext }
