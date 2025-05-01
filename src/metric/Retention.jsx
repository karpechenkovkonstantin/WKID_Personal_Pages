import { ResponsiveRadar } from '@nivo/radar'
import { useState, useEffect } from 'react'
import { LoadingOverlay, SkeletonCard } from '../components/Loading'

const Retention = ({data}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [visualData, setVisualData] = useState([])

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
                        margin={{ top: 70, right: 80, bottom: 70, left: 80 }}
                        curve="linearClosed"
                        borderColor={{ from: 'color', modifiers: [] }}
                        gridShape="linear"
                        gridLabelOffset={36}
                        dotSize={10}
                        dotColor={{ theme: 'background' }}
                        dotBorderWidth={2}
                        dotBorderColor={{ from: 'color', modifiers: [] }}
                        enableDotLabel={true}
                        colors={{ scheme: 'nivo' }}
                        blendMode="multiply"
                        motionConfig="wobbly"
                        isInteractive={false}
                        theme={{
                            text: {
                                fill: textColor,
                                fontSize: 12,
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