

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Bar } from '@ant-design/plots';
import { Button } from '../ui/button';
import { Line } from '@ant-design/plots';
import { Pie } from '@ant-design/plots';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "../ui/dialog"


interface chartsection {
    data: string
    isReady: boolean
}

const Chartsection = ({ data, isReady }: chartsection) => {

    console.log(isReady)

    const ref = useRef<any>(); // 导出图片


    const downloadImage = () => {
        ref.current?.downloadImage();
    }; 
    
    if (isReady) {
        console.log(data)
        const parsedData = JSON.parse(data)

        if ("piechart" in parsedData) {
            const piechartData = parsedData.piechart;
            console.log(piechartData)
         
            const config = {
                appendPadding: 10,
                data: piechartData,
                angleField: 'value',
                colorField: 'type',
                radius: 0.8,
                label: {
                    type: 'outer',
                },
                interactions: [
                    {
                        type: 'element-active',
                    },
                ],
            };


            return (

                // <DemoPie data={piechartData}/>

                <Dialog>
                    <DialogTrigger >
                        <div>
                            <Pie {...config} />
                        </div>
                    </DialogTrigger>
                    <DialogContent className='w-full max-w-5xl'>
                        <DialogHeader>
                            <DialogTitle>Pie Chart</DialogTitle>

                        </DialogHeader>
                        <div className="grid gap-4 py-4 w-full max-w-5xl">
                            <Pie {...config} chartRef={ref} />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Close
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                onClick={downloadImage}
                                className='ml-6 bg-black mb-1'
                            >
                                Export Image
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            );
        }

        if ("linechart" in parsedData) {

            const linechartData = parsedData.linechart


            const config = {
                title: {
                    visible: true,
                    text: '配置折线数据点样式',
                },

                forceFit: true,
                data: linechartData,
                xField: 'date',
                yField: 'value',
                point: {
                    visible: true,
                    size: 4,
                    shape: 'diamond',
                    style: {
                        fill: 'white',
                        stroke: '#2593fc',
                        lineWidth: 2,
                    },
                },
            };


            return (
                <Dialog>
                    <DialogTrigger >
                        <div>
                            <Line {...config} />
                        </div>
                    </DialogTrigger>
                    <DialogContent className='w-full max-w-5xl'>
                        <DialogHeader>
                            <DialogTitle>Line Chart</DialogTitle>

                        </DialogHeader>
                        <div className="grid gap-4 py-4 w-full max-w-5xl">
                            <Line {...config} chartRef={ref} />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Close
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                onClick={downloadImage}
                                className='ml-6 bg-black mb-1'
                            >
                                Export Image
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )
        }
    }
};

export default Chartsection
