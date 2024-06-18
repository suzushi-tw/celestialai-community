"use client"
import React from 'react'
import { trpc } from '@/app/_trpc/client';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardDescription, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Skeleton } from "@/components/ui/skeleton"
import { deletechat } from '@/serveractions/action';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import { Chatsvg, Deletesvg } from '@/lib/icon';
import { string } from 'zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Chatbotlist {
    id: string
    name: string
    chatbotid: string
}


const notifydelete = () => toast.success("Deleting chat ...")

function Chatbotlist({ id, name, chatbotid }: Chatbotlist) {

    const router = useRouter()

    const { data: chats, isLoading } = trpc.getChatbotlist.useQuery({ id: chatbotid }, {
        onError: (err) => {
            console.log(err);
            toast.error("Error loading previous chat...")
        },
        refetchInterval: 5000,
    }
    );

    const handledeletechat = (id: string) => {
        notifydelete();
        deletechat(id)
    }
    const [loading, setIsLoading] = useState(false)

    const { mutate: startPolling } = trpc.getchatbot.useMutation(
        {
            onSuccess: (chatbot) => {
                router.push(`/dashboard/${chatbot.id}`)
            },
            retry: true,
            retryDelay: 500,
        }
    )

    const newchat = () => {
        setIsLoading(true)
        toast.success("Creating ...")
        axios.post('/api/createnewchat', { id, name })
            .then(response => {

                console.log(response.data);
                const chatbotId = response.data.chat_id;
                startPolling({ key: chatbotId });

            })
            .catch(error => {
                console.error('Error:', error);
                toast.error("An error occured ...")
            });
    }

    return (
        <div >
            <ScrollArea className="h-[calc(100vh-3.5rem-29rem)]  w-full">

                <div className="flex justify-between items-center w-full mb-1">
                    <Button
                        onClick={newchat}
                        className='w-full flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary hover:bg-slate-200'>
                        <Chatsvg />
                        {name}
                        {loading ? (
                            <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center'>
                                <Loader2 className='h-3 w-3 animate-spin' />
                            </div>
                        ) : null}
                    </Button>
                </div>

                {chats && chats.length > 0 ? (
                    chats.map((chat, index) => (
                        chat && (

                            <>
                                <div className="flex justify-between items-center w-full">
                                    <Link
                                        href={`/dashboard/${chat.id}`}
                                        key={index}
                                        className="ml-1 max-w-[180px] w-full truncate flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                    >
                                        {chat.name}
                                    </Link>
                                    <button onClick={() => handledeletechat(chat.id)} >
                                        <Deletesvg />
                                    </button>
                                </div>

                            </>
                        )
                    ))
                ) : isLoading ? (
                    <div className="flex flex-col space-y-3 w-5/6 mx-2 gap-1">
                        <Skeleton className="h-32 w-full rounded-xl bg-gray-300" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full bg-gray-300" />
                            <Skeleton className="h-4 w-2/3 bg-gray-300" />
                        </div>
                    </div>
                ) :
                    (
                        <div className="items-center justify-center flex flex-col">
                            <Image src={"https://assets.celestialpdf.com/cta.png"} alt="Call to action" height={200} width={200} unoptimized/>
                            <h1>Get answer instantly</h1>
                        </div>
                    )}
            </ScrollArea>
        </div>
    )
}

export default Chatbotlist