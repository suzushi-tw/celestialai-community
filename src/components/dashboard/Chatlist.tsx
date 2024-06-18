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
import { Deletesvg } from '@/lib/icon';


const notifydelete = () => toast.success("Deleting chat ...")

interface Chatlistprop {
    id?: string
}

function Chatlist({ id }: Chatlistprop) {

    const { data: chats, isLoading } = trpc.getChatlist.useQuery();

    const handledeletechat = (id: string) => {
        notifydelete();
        deletechat(id)
    }

    return (
        <div >
            <ScrollArea className="h-[calc(100vh-3.5rem-30rem)]  w-full">

                {chats && chats.length > 0 ? (
                    chats.map((chat, index) => (
                        chat && (

                            <>
                                <div className="flex justify-between items-center w-full">
                                    <Link
                                        href={`/c/${chat.id}`}
                                        key={index}
                                        className={`ml-3 max-w-[180px] w-full truncate flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${id === chat.id ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
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
                    <div className="flex flex-col space-y-3 w-full mx-2 gap-1">
                        <Skeleton className="h-32 w-5/6 rounded-xl bg-gray-300" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-5/6 bg-gray-300" />
                            <Skeleton className="h-4 w-2/3 bg-gray-300" />
                        </div>
                    </div>
                ) :
                    (
                        <div className="items-center justify-center flex flex-col">
                            <Image src={"/sidenav.png"} alt="Call to action" height={200} width={200} />
                            <h1>Get answer instantly</h1>
                        </div>
                    )}
            </ScrollArea>
        </div>
    )
}

export default Chatlist
