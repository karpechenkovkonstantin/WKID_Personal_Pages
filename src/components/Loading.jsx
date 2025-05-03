import React from 'react';
import styles from './css/Loading.module.css';

export const LoadingSpinner = () => {
  return (
    <div className={styles["loading-spinner-container"]}>
      <div className={styles["spinner-border"]} role="status" style={{ 
        width: '3rem', 
        height: '3rem',
        color: 'var(--tg-theme-button-color, #4CAF50)',
        borderWidth: '0.25em'
      }}>
        <span className={styles["visually-hidden"]}>Loading...</span>
      </div>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className={styles["skeleton-card"]}>
      <div className={styles["skeleton-image"]}></div>
      <div className={styles["skeleton-content"]}>
        <div className={styles["skeleton-title"]}></div>
        <div className={styles["skeleton-text"]}></div>
        <div className={styles["skeleton-text"]}></div>
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 3 }) => {
  return (
    <div className={styles["skeleton-list"]}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles["skeleton-list-item"]}>
          <div className={styles["skeleton-avatar"]}></div>
          <div className={styles["skeleton-text-container"]}>
            <div className={styles["skeleton-text"]}></div>
            <div className={styles["skeleton-text"]}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const LoadingOverlay = ({ isLoading, children }) => {
  if (!isLoading) return children;
  
  return (
    <div className={styles["loading-overlay"]}>
      <div className={styles["loading-content"]}>
        <LoadingSpinner />
        <div className={styles["loading-text"]}>Загрузка...</div>
      </div>
      {children}
    </div>
  );
}; 