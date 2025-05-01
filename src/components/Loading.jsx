import React from 'react';
import './Loading.css';

export const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner-border" role="status" style={{ 
        width: '3rem', 
        height: '3rem',
        color: 'var(--tg-theme-button-color, #4CAF50)',
        borderWidth: '0.25em'
      }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text"></div>
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 3 }) => {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-list-item">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-text-container">
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const LoadingOverlay = ({ isLoading, children }) => {
  if (!isLoading) return children;
  
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <LoadingSpinner />
        <div className="loading-text">Загрузка...</div>
      </div>
      {children}
    </div>
  );
}; 