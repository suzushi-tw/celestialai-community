"use client"
import React, { use } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@radix-ui/react-dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectTrigger, SelectItem, SelectLabel, SelectGroup, SelectValue, SelectContent } from '@/components/ui/select'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Send } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast';
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useRef, useEffect } from 'react';
import CopyToClipboard from '../copy-to-clipboard'
import { Markdown } from '@lobehub/ui';
import { Input } from '@/components/ui/input'
import { Cleansvg } from '@/lib/icon'
import Chartsection from '../tools_section/Chartsection'
import { Skeleton } from '../ui/skeleton'
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Textarea } from "@/components/ui/textarea"
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { DynamicTextarea } from '../ui/Dynamictextarea'
import { useChat } from '@ai-sdk/react'
// import { useRouter } from 'next/router'
import { Avatar } from '@lobehub/ui';
import { assistantsvg, avatar, useravatar, usersvg } from './Data'
import dynamic from "next/dynamic";
import { Message } from 'ai'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

interface ChatId {
    id?: string;
}

interface ToolCall {
    type: string;
    function: {
        name: string;
    };
}

function Chatbot({ id }: ChatId) {

    console.log(id)

    const { data } = useQuery({
        queryKey: ["chat", id],
        queryFn: async () => {
            const response = await axios.post<Message[]>("/api/get-messages", {
                chatId,
            });
            return response.data;
        },

    });

    const router = useRouter()
    const { isAuthenticated } = useKindeBrowserClient();
    const [chatId, setChatId] = useState<string | undefined>(id);
    const [isMessageComplete, setIsMessageComplete] = useState(false);

    const [previousmessage, setpreviosmessage] = useState('');
    const [model, setModel] = useState('claude-3-haiku-20240307');

    const [isReady, setIsReady] = useState(false);

    const { messages, input, handleSubmit, isLoading, error, setMessages, append, setInput } =
        useChat({
            api: "/api/chatbot",
            body: {
                previousmessage: JSON.stringify(previousmessage),
                aimodel: model,
                id: chatId
            },
            // initialMessages: data || [],
            onResponse: response => {
                setIsMessageComplete(false);
                setIsReady(false)
                if (!response.ok) {
                    toast.error(error?.message || 'Something went wrong!')
                }

            },
            onFinish: (message) => {

            }
        })

    useEffect(() => {
        if (isMessageComplete && messages.length > 0) {

            const lastMessage = messages[messages.length - 1];


            if (lastMessage.content.includes('tool_calls')) {
                const data = JSON.parse(lastMessage.content);

                const argumentsJsonStr = data.tool_calls[0].function.arguments;
                console.log(argumentsJsonStr);

                lastMessage.content = argumentsJsonStr;

                lastMessage.role = "function"
                setIsReady(true);
            }
        }
    }, [messages, isMessageComplete]);

    const clearchat = () => {
        setMessages([])
    }


    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {

        if (messages.length > 0 && messages[0].role === 'user') {
            // Scroll to the top of the chat container
            chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {

            chatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages]);

    const handleValueChange = async (selectedValue: string) => {
        toast.success("AI model Updated !")
        setModel(selectedValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { // Adjusted to HTMLTextAreaElement
        if (e.key === 'Enter') {
            setInput('');
            e.preventDefault(); // Prevents the default form submission
            // Prepare your message
            const message = {
                content: input, // Use the current input value as the message content
                role: 'user' as const, // Explicitly type 'user' as one of the allowed string literals
            };
            // Append the message to the chat
            append(message).then((response) => {
                console.log('AI response:', response);
                // Optionally clear the input field after sending the message
            }).catch((error) => {
                console.error('Failed to send message:', error);
            });
        }
    };

    return (
        <div className='w-full h-full mx-auto gap-2 max-w-sm sm:max-w-5xl'>
            <Toaster />
            <Card className='w-full h-full flex flex-col justify-end' >
                <CardContent >
                    <ScrollArea className=' w-full max-h-[calc(100vh-3.5rem-13.5rem)] min-h-full border-zinc-200  gap-4 p-3 overflow-y-auto focus-visible:ring-transparent scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>

                        {messages.length === 0 || (messages.length === 1 && messages[0].role === 'system') ? (
                            <div className='my-12 text-5xl font-medium p-5'>
                                <p>
                                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                        Hello,
                                    </span>
                                </p>
                                <p>How can I help you today?</p>
                            </div>
                        ) : (
                            messages.map((m, index) => {
                                const isLastMessage = index === messages.length - 1;


                                return (
                                    <div key={m.id} className='mr-6 whitespace-pre-wrap md:mr-12' >
                                        {m.role === 'user' && (
                                            <div className='mb-6 flex gap-3'>
                                                {/* <Avatar>
                                                    <AvatarImage src='' />
                                                    <AvatarFallback className='text-sm'>U</AvatarFallback>
                                                </Avatar> */}

                                                <Avatar avatar={usersvg} background='#83C5BE' />

                                                <div className='mt-2 w-full'>
                                                    <div className='flex '>
                                                        <p className='font-semibold'>You</p>
                                                    </div>
                                                    <div className='mt-3 text-black'>

                                                        <Markdown className='my-3' lineHeight={1.0} variant="chat" fontSize={16} marginMultiple={1.0}>
                                                            {m.content}
                                                        </Markdown>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {m.role === 'assistant' && !m.content.startsWith('{') && (
                                            <div className='mb-6 flex gap-3'>
                                                <Avatar avatar={assistantsvg} background='#87CEEB' />
                                                <div className='mt-1.5 w-full'>
                                                    <div className='w-full flex justify-between'>
                                                        <p className='font-semibold'>Bot</p>
                                                        <CopyToClipboard message={m} className='-mt-1 ml-2' />
                                                    </div>
                                                    <div className='mt-2 text-black'>

                                                        <Markdown className='my-3' lineHeight={1.0} variant="chat" fontSize={16} marginMultiple={1.0}>
                                                            {m.content}
                                                        </Markdown>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {m.role === 'function' && !isLastMessage && (
                                            <div className='mb-6 flex gap-3'>
                                                <Avatar avatar={assistantsvg} background='#87CEEB' />
                                                <div className='mt-1.5 w-full'>
                                                    <div className='flex '>
                                                        <p className='font-semibold'>Bot</p>
                                                    </div>
                                                    <div className='mt-2 text-black'>
                                                        {/* <DemoBar data={chartData} /> */}
                                                        <Chartsection data={m.content} isReady={true} />

                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {m.role === 'function' && isReady && isLastMessage && (
                                            <div className='mb-6 flex gap-3'>
                                                <Avatar avatar={assistantsvg} background='#87CEEB' />
                                                <div className='mt-1.5 w-full'>
                                                    <div className='flex '>
                                                        <p className='font-semibold'>Bot</p>
                                                    </div>
                                                    <div className='mt-2 text-black'>
                                                        {/* <DemoBar data={chartData} /> */}
                                                        <Chartsection data={m.content} isReady={isReady} />

                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })


                        )}

                        {isLoading && (
                            <div className=" flex items-center space-x-4">
                                <Skeleton className="h-10 w-10 rounded-full bg-gray-600" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        )}
                        <div ref={chatContainerRef}></div>

                    </ScrollArea>

                </CardContent>
                <CardFooter className='w-full flex flex-col'>
                    <form className='w-full' onSubmit={handleSubmit} onReset={clearchat} >
                        <div className="relative pb-20">
                            <DynamicTextarea
                                className="absolute p-4 h-15 max-h-60 bottom-0" // Apply absolute positioning
                                placeholder={`Ask any question`}
                                value={input} // Use `input` from `useChat`
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <div className='flex flex-row justify-between w-full mt-2'>
                            <div className="flex items-center gap-1.5 ">
                                <Button type="reset">
                                    <Cleansvg />
                                </Button>

                                <div className="max-sm:hidden">
                                    <Select onValueChange={handleValueChange}>
                                        <SelectTrigger className="w-[180px] focus-visible:ring-transparent">
                                            <SelectValue placeholder="Claude haiku" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Models</SelectLabel>
                                                <SelectItem value="gpt-3.5-turbo">GPT 3.5</SelectItem>
                                                <SelectItem value="claude-3-haiku-20240307">Claude Haiku</SelectItem>
                                                <SelectItem value="gpt-4o-2024-05-13" >GPT 4 O ⚡️</SelectItem>
                                                <SelectItem value="claude-3-sonnet-20240229" disabled>Claude Sonnet ⚡️</SelectItem>
                                                <SelectItem value="gpt-4-1106-preview" disabled >GPT 4 Turbo ⚡️</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>


                            </div>
                            <Button
                                className='ml-2 bg-black '
                                aria-label='send message'
                                type='submit'
                            >
                                <Send className='h-4 w-4' />
                            </Button>
                        </div>
                    </form>

                </CardFooter>
            </Card>
        </div >
    )
}

export default Chatbot
