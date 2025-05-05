import { ResponsiveRadar } from '@nivo/radar'
import { useState, useEffect } from 'react'
import { LoadingOverlay } from '../Loading'
import { useTheme } from '../../context/ThemeContext'
import styles from './css/Retention.module.css'
const Retention = ({data, isMobile}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [visualData, setVisualData] = useState([])
    const { isDarkTheme, themeColors } = useTheme()
    
    useEffect(() => {
        if (data.length === 0) {
            setIsLoading(true)
            return
        }
        let tempData = []
        data.forEach((item, index) => {
            tempData.push({
                module: 'Модуль ' + (index + 2),
                продление: item*100
            })
        })
        setVisualData(tempData)
        setIsLoading(false)
    }, [data])

    // Get the current text color from CSS variables
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();

    if ((!data || data.length === 0) && !isLoading) {
        return (
            <>
                <h3 style={{marginTop: '15px', marginBottom: '15px', fontSize: 'calc(1.325rem + .9vw)', color: textColor}}> Продления по модулям</h3>
                <div className={styles["no-retention"]}>Данные для выбранного пользователя отсутствуют</div>
            </>
        )
      }

    return (
        <div className='metric-container fade-in' style={{ height: '50vmax', marginTop: '20px', marginBottom: '20px' }}>
            <h3 style={{textAlign: 'center', marginTop: '0', marginBottom: '15px', fontSize: '16px', color: textColor}}> Продления по модулям</h3>
            <LoadingOverlay isLoading={isLoading}>
                {data.length > 0 && !isLoading ? (
                    <ResponsiveRadar
                        data={visualData}
                        keys={[ 'продление' ]}
                        indexBy="module"
                        maxValue={100}
                        valueFormat=">-.2f"
                        margin={isMobile 
                            ? { top: 20, right: 20, bottom: 20, left: 20 } 
                            : { top: 40, right: 40, bottom: 40, left: 40 }}
                        curve="linearClosed"
                        borderColor={{ from: 'color', modifiers: [] }}
                        gridShape="linear"
                        gridLabelOffset={isMobile ? 12 : 24}
                        dotSize={isMobile ? 8 : 10}
                        dotColor={{ theme: 'background' }}
                        dotBorderWidth={2}
                        dotBorderColor={{ from: 'color', modifiers: [] }}
                        dotLabelYOffset={isMobile ? -10 : -12}
                        enableDotLabel={true}
                        colors={{scheme: themeColors.colorScheme}}
                        fillOpacity={0.3}
                        blendMode={themeColors.blendMode}
                        motionConfig="wobbly"
                        isInteractive={false}
                        theme={{
                            text: {
                                fill: themeColors.textColor,
                                fontSize: isMobile ? 10 : 12,
                            },
                            grid: {
                                line: {
                                    stroke: themeColors.textColor,
                                    strokeWidth: 1,
                                    strokeOpacity: 0.2,
                                }
                            }
                        }}
                    />
                ) : (
                   <></>
                )}
            </LoadingOverlay>
        </div>
    )
}

export default Retention;