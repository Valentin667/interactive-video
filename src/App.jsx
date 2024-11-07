// App.js
import './App.css';
import { useState, useEffect } from 'react';
import { VideoProvider } from './context/VideoContext';
import Video from './components/video/Video';
import Cursor from './components/curseur/Cursor';
import Scene from './webgl/Scene.jsx';
import Menu from './components/menu/Menu.jsx';
import Loader from './components/loader/Loader';
import Indications from './components/indications/Indications';

function App() {
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const startExperience = () => {
    setExperienceStarted(true);
  };

  // useEffect(() => {
  //   // Afficher le loader pendant 2 secondes après le lancement de l'application
  //   const timeout = setTimeout(() => {
  //     setIsLoading(false); // Masquer le loader après 2 secondes
  //   }, 2000);

  //   // Nettoyage du timeout si nécessaire
  //   return () => clearTimeout(timeout);
  // }, []);

  return (
    <div className="App">
      <Cursor />
      <VideoProvider>
      {!experienceStarted && <Menu startExperience={startExperience} />} {/* Afficher Menu si l'expérience n'a pas démarré */}
      {experienceStarted && (
          <>
            {/* Afficher le loader pendant 2 secondes */}
            {/* {isLoading && <Loader />} */}
            <div className="layout">
              <Indications />
              <Scene />
              <Video experienceStarted={experienceStarted} />
            </div>
          </>
        )}
      </VideoProvider>
    </div>
  );
}

export default App;
