import React from 'react';
import styles from '../css/.module/loader.module.css';

export function Loader() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loader}></div>
    </div>
  );
}