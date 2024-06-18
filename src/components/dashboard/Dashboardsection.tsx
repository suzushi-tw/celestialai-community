"use client"
import React from 'react'
import { Card, CardContent, CardTitle, CardHeader, CardDescription, CardFooter } from '../ui/card'
import { trpc } from '@/app/_trpc/client';
import { Skeleton } from '../ui/skeleton';
import { BarList } from './Barlist';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import Createchat from '../Createchat';
import { cn } from '@/lib/utils';
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";
import { Dock, DockIcon } from "@/components/magicui/dock";
import Link from 'next/link';
import { Dropboxsvg, Notionsvg } from '@/lib/icon';
import { useEffect } from 'react';
import { Chatbottable } from './chatbottable';
import UploadAudio from '../Uploadaudio';
import axios from 'axios';
import toast from 'react-hot-toast';

declare global {
    interface Window { Dropbox: any; }
}

interface DropboxFile {
    id: string;
    name: string;
    link: string;
    bytes: number;
    icon: string;
    thumbnailLink?: string;
    isDir: boolean;
}



function Dashboardsection() {


    const { data, error, isLoading } = trpc.filescount.useQuery();
    const formattedData = data
        ?.map(item => ({ name: item.type, value: item.count }))
        || [];

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
        script.id = 'dropboxjs';
        script.dataset.appKey = `${process.env.NEXT_PUBLIC_DROPBOX_KEY}`;
        document.body.appendChild(script);
    }, []);

    const { data: account } = trpc.getAccountdetail.useQuery();


    return (
        <>
            <ScrollArea className='h-[calc(100vh-3.5rem-6rem)]'>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                            <Card
                                className="sm:col-span-2" x-chunk="dashboard-05-chunk-0"
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle>Create new Chatbot</CardTitle>
                                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                                        Create your own Chatbot with desired data source like PDF, DOCX, PPTX
                                        and enjoy the Insightful analysis from AI
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    {/* <Button>Create New Chatbot</Button> */}
                                    <Createchat />
                                </CardFooter>
                            </Card>
                            <Card
                                className="sm:col-span-2" x-chunk="dashboard-05-chunk-0"
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle>Usage</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <>
                                            <Skeleton className="w-full h-10 " />
                                            <Skeleton className="w-full h-10 " />
                                        </>
                                    ) : (
                                        <BarList
                                            data={formattedData}

                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <Tabs defaultValue="chatbot">
                            <div className="flex items-center">
                                <TabsList>
                                    <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
                                </TabsList>

                            </div>
                            <TabsContent value="chatbot">
                                <Card x-chunk="dashboard-05-chunk-3">
                                    <CardHeader className="px-7">
                                        <CardTitle>Chatbot</CardTitle>
                                        <CardDescription>
                                            Created Chatbot ...
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Chatbottable />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <div>
                        <Card
                            className="overflow-hidden" x-chunk="dashboard-05-chunk-4"
                        >
                            <CardHeader className="flex flex-row items-start bg-muted/50">
                                <div className="grid gap-0.5">
                                    <div className="relative flex h-full w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg border bg-background p-20 md:shadow-xl">
                                        <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white">
                                            Integrations
                                        </p>
                                        <AnimatedGridPattern
                                            numSquares={30}
                                            maxOpacity={0.5}
                                            duration={3}
                                            repeatDelay={1}
                                            className={cn(
                                                "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
                                                "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
                                            )}
                                        />

                                    </div>
                                    <Dock>
                                        <DockIcon>
                                            <Link
                                                href={`${process.env.NEXT_PUBLIC_NOTIONURL}`}>
                                                <Notionsvg />
                                            </Link>
                                        </DockIcon>
                                        <DockIcon>
                                            <Button
                                                className='hover:bg-transparent bg-transparent'
                                                onClick={() => {
                                                    if (window.Dropbox) {
                                                        window.Dropbox.choose({
                                                            success: async function (files: DropboxFile[]) {
                                                                toast.success("Processing files ...")
                                                                const file_name = files[0].name;
                                                                const file_url = files[0].link
                                                                const file_key = files[0].id
                                                                let url = "/api/upload";
                                                                if (file_name.endsWith(".docx") || file_name.endsWith(".doc")) {
                                                                    url = "/api/uploaddocx"
                                                                } else if (file_name.endsWith(".csv") || file_name.endsWith(".xlsx")) {
                                                                    url = "/api/uploadcsv"
                                                                }
                                                                else if (file_name.endsWith(".pptx")) {
                                                                    url = "/api/uploadpptx"
                                                                }
                                                                const response = await axios.post(url, {
                                                                    file_key,
                                                                    file_name,
                                                                    file_url,
                                                                    type: "dropbox"
                                                                });
                                                                console.log(files)
                                                            },
                                                            cancel: function () {
                                                                toast.error("Canceled ...")
                                                            },
                                                            linkType: "direct", // or "direct"
                                                            multiselect: false, // or true
                                                            extensions: ['.pdf', '.doc', '.docx', 'pptx', 'csv', 'xlsx'],
                                                            folderselect: false, // or true
                                                        });
                                                    }
                                                }}>
                                                <Dropboxsvg />
                                            </Button>
                                        </DockIcon>
                                        <DockIcon>
                                            <UploadAudio />
                                        </DockIcon>
                                    </Dock>
                                </div>

                            </CardHeader>
                            <CardContent className="p-6 text-sm">
                                <div className="grid gap-3">
                                    <div className="font-semibold">Account Details</div>
                                    <ul className="grid gap-3">
                                        <li className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Chatbots
                                            </span>
                                            <span>

                                                {account?.Chatbot}

                                            </span>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Data
                                            </span>
                                            <span>
                                                {account?.Filenum}

                                            </span>
                                        </li>
                                    </ul>
                                </div>
                                <Separator className="my-4" />

                            </CardContent>

                        </Card>
                    </div>
                </main>
            </ScrollArea>
        </>
    )
}

export default Dashboardsection
