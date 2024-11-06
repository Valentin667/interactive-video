import React, { useEffect } from 'react';
import gsap from 'gsap';
import styles from './Cursor.module.scss';

const Cursor = () => {
    useEffect(() => {
        // Initialisation du centrage du cercle
        gsap.set(".ball", { xPercent: -50, yPercent: -50 });

        // Création des animations de suivi du curseur
        const xTo = gsap.quickTo(".ball", "x", { duration: 0.6, ease: "power3" });
        const yTo = gsap.quickTo(".ball", "y", { duration: 0.6, ease: "power3" });

        // Gestion du mouvement de la souris pour contrôler la position du cercle
        const handleMouseMove = (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);

        // Nettoyage de l'écouteur d'événement lors de la destruction du composant
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return <div className={`${styles.ball} ball`}></div>;
};

export default Cursor;
