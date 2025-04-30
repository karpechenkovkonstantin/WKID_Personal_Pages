import { ResponsiveRadar } from '@nivo/radar'
import { useState, useEffect } from 'react'
import { LoadingOverlay, SkeletonCard } from '../components/Loading'

const Retention = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState([])

    useEffect(() => {
        // Simulate data fetching
        const fetchData = async () => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            const mockData = [
                {
                    module: "Модуль 2",
                    продление: 79.78
                },
                {
                    module: "Модуль 3",
                    продление: 91.67
                },
                {
                    module: "Модуль 4",
                    продление: 90.57
                },
                {
                    module: "Модуль 5",
                    продление: 84
                },
                {
                    module: "Модуль 6",
                    продление: 93.94
                },
                {
                    module: "Модуль 7",
                    продление: 94.44
                }
            ]
            
            setData(mockData)
            setIsLoading(false)
        }

        fetchData()
    }, [])

    // Get the current text color from CSS variables
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();

    return (
        <div className='metric-container fade-in' style={{ height: '50vmax', marginTop: '20px', marginBottom: '20px' }}>
            <LoadingOverlay isLoading={isLoading}>
                {data.length > 0 && !isLoading ? (
                    <ResponsiveRadar
                        data={data}
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