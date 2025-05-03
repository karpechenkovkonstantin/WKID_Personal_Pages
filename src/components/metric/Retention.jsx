import { ResponsiveRadar } from '@nivo/radar'
import { useState, useEffect } from 'react'
import { LoadingOverlay } from '../Loading'
import { useAuth } from '../../context/AuthContext'

const Retention = ({data, isMobile}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [visualData, setVisualData] = useState([])
    const { tg } = useAuth()
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
    const isDarkTheme = tg?.themeParams?.text_color && 
                       tg.themeParams.text_color.toLowerCase() !== '#000000' && 
                       tg.themeParams.text_color.toLowerCase() !== 'rgb(0, 0, 0)'

    return (
        <div className='metric-container fade-in' style={{ height: '50vmax', marginTop: '20px', marginBottom: '20px' }}>
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
                        colors={{scheme:  isDarkTheme ?  'blues' : 'tableau10'}}
                        fillOpacity={0.3}
                        blendMode={isDarkTheme ?  "screen" : "multiply"}
                        motionConfig="wobbly"
                        isInteractive={false}
                        theme={{
                            text: {
                                fill: textColor,
                                fontSize: isMobile ? 10 : 12,
                            },
                            grid: {
                                line: {
                                    stroke: textColor,
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