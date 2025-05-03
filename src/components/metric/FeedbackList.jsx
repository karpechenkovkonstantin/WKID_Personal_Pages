import React, { useEffect, useState, useRef, forwardRef } from 'react';
import styles from './css/FeedbackList.module.css';

const FeedbackList = forwardRef(({ feedback, selectedDate, isMobile }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dateEntries, setDateEntries] = useState([]);
  
  useEffect(() => {
    document.body.classList.add('telegram-theme');
  }, []);

  useEffect(() => {
    if (feedback && feedback.grades && Object.keys(feedback.grades).length > 0) {
      const entries = Object.entries(feedback.grades).sort(([dateA], [dateB]) => 
        new Date(dateA) - new Date(dateB)
      );
      setDateEntries(entries);
      
      if (selectedDate) {
        const selectedIndex = entries.findIndex(([date]) => date === selectedDate);
        if (selectedIndex !== -1) {
          setCurrentIndex(selectedIndex);
        }
      }
    }
  }, [feedback, selectedDate]);
  
  if (!feedback || !feedback.grades || Object.keys(feedback.grades).length === 0) {
    return <div className={styles["no-feedback"]}>Обратная связь отсутствует</div>;
  }

  const { dict } = feedback;
  const totalEntries = dateEntries.length;
  const [date, dateData] = dateEntries[currentIndex] || [];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalEntries - 1 ? prev + 1 : prev));
  };

  return (
    <div className={styles["feedback-container"]} ref={ref} id="feedback-list">
      <div className={styles["feedback-navigation"]}>
        <button 
          onClick={handlePrevious} 
          disabled={currentIndex === 0}
          className={styles["nav-button"]}
        >
          {isMobile ? '<' : '< Предыдущий'}
        </button>
        <span className={styles["feedback-counter"]}>{currentIndex + 1} из {totalEntries}</span>
        <button 
          onClick={handleNext} 
          disabled={currentIndex === totalEntries - 1}
          className={styles["nav-button"]}
        >
          {isMobile ? '>' : 'Следующий >'}
        </button>
      </div>
      
      {date && dateData && (
        <div className={styles["feedback-date-block"]}>
          <h3 className={styles["feedback-date"]}>
            {dateData.dates}
            {dateData.files && (
              <div className={styles["feedback-links"]}>
                <a 
                  href={dateData.files} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles["feedback-file"]}
                >
                  Файл
                </a>
                {dateData.records && (
                  <a 
                    href={dateData.records} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles["feedback-record"]}
                  >
                    Запись
                  </a>
                )}
              </div>
            )}
          </h3>
          <ul className={styles["feedback-items"]}>
            {dateData.reaction.map((item, index) => (
              <li key={index} className={styles["feedback-item"]}>
                <div className={styles["feedback-value"]}>
                  {dict && dict[item.dictIndex] && <><span className={styles["feedback-description"]}>({dict[item.dictIndex]})</span><br/></>}
                  {item.value}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default FeedbackList; 