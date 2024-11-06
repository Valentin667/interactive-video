import React from 'react';
import styles from "./Loader.module.scss";

const Loader = () => {
    return (
        <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <h2>Loading...</h2>
        </div>
    );
};

export default Loader;
