// Scene.js
import { useContext, useEffect, useRef } from 'react';
import GLView from './GLView';
import Loader from '../components/loader/Loader';
import { VideoContext } from '../context/VideoContext';

const Scene = () => {
  const mountRef = useRef(null);
  // const { videoRef } = useVideo();
  const glViewRef = useRef(null);
  
  useEffect(() => {
    if (!glViewRef.current) {
      glViewRef.current = new GLView(mountRef);
    }
    
    glViewRef.current.start();

    return () => {
      glViewRef.current.stop();
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%' }}>
      {/* {isLoading && <Loader />} */}
    </div>
  );
};

export default Scene;