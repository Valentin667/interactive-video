import { useContext, useEffect, useRef, useState } from 'react';
import { VideoContext } from '../../context/VideoContext';
import styles from './Indications.module.scss';

const Indications = () => {
    const { currentTime } = useContext(VideoContext);

    return (
        <div className={styles.videoContainer}>
            <div className={styles.indications}>
                <p>Clique pour choisir un jeu</p>
            </div>
        </div>
    );
};

export default Indications;