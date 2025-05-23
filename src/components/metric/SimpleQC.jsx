import { ResponsiveTimeRange } from '@nivo/calendar'
import { useState, useEffect, useRef } from 'react'
import { LoadingOverlay } from '../Loading'
import { useTheme } from '../../context/ThemeContext'
import styles from './css/SimpleQC.module.css'

const SimpleQC = ({data, onDateSelect, isMobile}) => {
    const { isDarkTheme, themeColors } = useTheme()
    const [isLoading, setIsLoading] = useState(true)
    const [visualData, setVisualData] = useState([])
    const [selectedDay, setSelectedDay] = useState(null)
    const [periodStart, setPeriodStart] = useState(null)
    const [periodEnd, setPeriodEnd] = useState(null)
    const containerRef = useRef(null)

    useEffect(() => {
        if (!data || data.length === 0) {
            setIsLoading(true)
            return
        }
        
        setVisualData(data)
        setPeriodStart(data.period?.start ? new Date(new Date(data.period.start).setDate(new Date(data.period.start).getDate() - 1)).toLocaleDateString('en-CA') : "2024-01-01")
        setPeriodEnd(data.period?.end ? new Date(new Date(data.period.end).setDate(new Date(data.period.end).getDate() + 1)).toLocaleDateString('en-CA') : "2025-12-31")
        setIsLoading(false)
    }, [data])

    const handleDayClick = (day) => {
        if (day.value > 0 && onDateSelect) {
            setSelectedDay(day.day);
            onDateSelect(day.day);
        }
    }

    if ((!visualData || !visualData.quality || Object.keys(visualData.quality).length === 0) && !isLoading) {
        return <></>;
      }
    
    return (
        <div className={styles["qc-container"] + " " + styles["fade-in"]} ref={containerRef}>
            <h3 className={styles["qc-title"]}>Качество преподавания</h3>
            <LoadingOverlay isLoading={isLoading}>
                {visualData?.quality?.length > 0 && !isLoading && (
                    <div className={styles["calendar-container"]} style={{ width: '100%', height: isMobile ? "200px" : "350px"}}>
                        <ResponsiveTimeRange
                            onClick={handleDayClick}
                            monthLegend={(year, month, date) => {
                                const months = ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
                                return months[date.getMonth()];
                            }}
                            monthLegendOffset={isMobile ? 5 : 10}
                            weekdays={isMobile ? ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'] : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']}
                            direction="horizontal"
                            data={visualData?.quality || []}
                            from={periodStart}
                            to={periodEnd}
                            emptyColor={themeColors.emptyColor}
                            colors={themeColors.chartColors}
                            minValue={1}
                            maxValue={4}
                            margin={isMobile 
                                ? { top: 20, right: 10, bottom: 20, left: 10 } 
                                : { top: 40, right: 40, bottom: 100, left: 40 }}
                            weekdayLegendOffset={isMobile ? 15 : 68}
                            dayRadius={isMobile ? 3 : 8}
                            daySpacing={isMobile ? 2 : 3}
                            dayBorderWidth={1}
                            dayBorderColor={themeColors.dayBorderColor}
                            legends={[]}
                            theme={{
                                labels: {
                                    text: {
                                        fill: themeColors.textColor
                                    }
                                },
                                tooltip: {
                                    container: {
                                        background: isDarkTheme ? '#333' : '#fff',
                                        color: themeColors.textColor
                                    }
                                }
                            }}
                            tooltip={({ day, value, color }) => (
                                !isMobile ? (
                                    <div className={styles["calendar-tooltip"]}>
                                        <span className={styles["tooltip-date"]}>{day}</span>
                                        <span className={styles["tooltip-value"]} style={{ color }}>
                                            Оценка: {value > 0 ? value : 'Н/Д'}
                                        </span>
                                        {value > 0 && <div className={styles["tooltip-hint"]}>Нажмите, чтобы увидеть отзыв</div>}
                                    </div>
                                ) : null
                            )}
                        />
                    </div>
                )}
            </LoadingOverlay>
        </div>
    )
}

export default SimpleQC